'use strict';
// Compact catalogue adapter. Activation is explicit until end-to-end migration passes.
const {DatabaseSync}=require('node:sqlite'),zlib=require('node:zlib'),crypto=require('node:crypto'),path=require('node:path');
const unpack=b=>JSON.parse(zlib.inflateRawSync(b));
const pack=o=>zlib.deflateRawSync(Buffer.from(JSON.stringify(o)));
const families=['items','children','sectionItems','files','byMediaPath','byFilePath','scannedAliases'];
const mediaKey=x=>x.path?String(x.sectionId)+'|'+String(x.type)+'|'+path.normalize(x.path).toLowerCase().replace(/[\\/]+$/,''):'';
const projection=row=>{const {files,pathSize,...rest}=row;return {...rest,files:(files||[]).filter(f=>!/^video\//i.test(f.type||'')&&!/\.(mp4|m4v|mkv|avi|mov|wmv|webm|flv|ts|mts|m2ts|mpg|mpeg|3gp)$/i.test(f.path||f.filename||''))};};
function present(file){let db;try{db=new DatabaseSync(file,{readOnly:true});return !!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='folders'").get();}finally{db?.close();}}
function open(file){
 const db=new DatabaseSync(file);db.exec('PRAGMA foreign_keys=ON; PRAGMA busy_timeout=5000');
 db.exec('CREATE INDEX IF NOT EXISTS folder_payload ON folders(payload)');
 db.exec('CREATE TABLE IF NOT EXISTS compact_state(key TEXT PRIMARY KEY,value BLOB NOT NULL) WITHOUT ROWID');
  const v8=require('node:v8');
 if(db.prepare("SELECT 1 FROM sqlite_master WHERE name='retained_state'").get()&&!db.prepare("SELECT 1 FROM compact_state WHERE key='__imported'").get()){
  db.exec('BEGIN IMMEDIATE');try{
   const putState=db.prepare('INSERT OR IGNORE INTO compact_state VALUES (?,?)');
   for(const stored of db.prepare("SELECT value FROM retained_state WHERE name='catalog_meta'").iterate()){
    const old=v8.deserialize(zlib.inflateRawSync(stored.value));
    if(typeof old.key==='string'&&old.key.startsWith('state:'))putState.run(old.key.slice(6),pack(JSON.parse(Buffer.from(old.value).toString('utf8'))));
   }
   putState.run('__imported',pack(true));db.exec('COMMIT');
  }catch(e){db.exec('ROLLBACK');throw e;}
 }
 const select='SELECT f.*,p.value FROM folders f JOIN payloads p ON p.hash=f.payload';
 const rows=db.prepare(select),get=db.prepare(select+' WHERE f.id=?');
 const hydrate=r=>({id:r.id,sectionId:r.section,inItem:r.parent,name:r.name,type:r.type,path:r.path,...unpack(r.value)});
 const fingerprints=new Map();
 const encoded=row=>{const clean=projection(row),{id,sectionId,inItem,name,type,path:folder,...shared}=clean;const value=pack(shared),hash=crypto.createHash('sha256').update(value).digest();const fields=[id,sectionId??null,inItem??null,name??null,type??null,folder??null,hash];return {value,hash,fields,signature:JSON.stringify(fields.slice(0,6))+hash.toString('hex')};};
 function read(){
  const state=Object.fromEntries(families.map(n=>[n,new Map()]));fingerprints.clear();
  for(const raw of rows.iterate()){
   const x=hydrate(raw);state.items.set(x.id,x);fingerprints.set(x.id,JSON.stringify([raw.id,raw.section,raw.parent,raw.name,raw.type,raw.path])+Buffer.from(raw.payload).toString('hex'));
   const parent=x.inItem&&x.inItem!=='null'?x.inItem:null,map=parent?state.children:state.sectionItems,key=parent||x.sectionId;
   if(!map.has(key))map.set(key,new Set());map.get(key).add(x.id);
   if(mediaKey(x))state.byMediaPath.set(mediaKey(x),x.id);
   for(const f of x.files||[])if(f.id&&f.path){state.files.set(f.id,f);state.byFilePath.set(String(x.sectionId)+'|'+path.normalize(f.path).toLowerCase(),x.id);}
  }
  for(const row of db.prepare('SELECT id,target FROM aliases').iterate())state.scannedAliases.set(row.id,row.target);
  return state;
 }
 function write(state,dirty){
  const seen=dirty?new Set(state.items.keys()):new Set(),next=new Map(fingerprints);let changed=0,removed=0;
  const payload=db.prepare('INSERT OR IGNORE INTO payloads VALUES (?,?)');
  const put=db.prepare('INSERT INTO folders VALUES (?,?,?,?,?,?,?) ON CONFLICT(id) DO UPDATE SET section=excluded.section,parent=excluded.parent,name=excluded.name,type=excluded.type,path=excluded.path,payload=excluded.payload');
  db.exec('BEGIN IMMEDIATE');try{
   for(const row of dirty?[...dirty].map(id=>state.items.get(id)).filter(Boolean):state.items.values()){
    if(require('./catalog-items.cjs').videoFile(row))continue;
    const e=encoded(row);seen.add(row.id);if(fingerprints.get(row.id)===e.signature)continue;
    payload.run(e.hash,e.value);put.run(...e.fields);next.set(row.id,e.signature);changed++;
   }
   const remove=db.prepare('DELETE FROM folders WHERE id=?');for(const id of fingerprints.keys())if(!seen.has(id)){remove.run(id);next.delete(id);removed++;}
   const alias=db.prepare('INSERT INTO aliases VALUES (?,?) ON CONFLICT(id) DO UPDATE SET target=excluded.target WHERE target<>excluded.target');
   for(const [id,target]of state.scannedAliases)if(seen.has(target))alias.run(id,target);
   // Retain aliases for manually hidden/deleted IDs so a later scan cannot resurrect them.
   db.exec('DELETE FROM payloads WHERE NOT EXISTS(SELECT 1 FROM folders WHERE folders.payload=payloads.hash)');
   db.exec('COMMIT');fingerprints.clear();for(const [id,value]of next)fingerprints.set(id,value);return {changed,removed};
  }catch(e){db.exec('ROLLBACK');throw e;}
 }
 function readState(key){const row=db.prepare('SELECT value FROM compact_state WHERE key=?').get(key);return row?unpack(row.value):undefined;}
 function writeState(key,value,history=false){const data=pack(value);db.exec('CREATE TABLE IF NOT EXISTS compact_history(key TEXT,at INTEGER,value BLOB NOT NULL,PRIMARY KEY(key,at)) WITHOUT ROWID');db.exec('BEGIN IMMEDIATE');try{if(history)db.prepare('INSERT OR REPLACE INTO compact_history VALUES (?,?,?)').run(key,Date.now(),data);db.prepare('INSERT INTO compact_state VALUES (?,?) ON CONFLICT(key) DO UPDATE SET value=excluded.value').run(key,data);db.exec('COMMIT');}catch(e){db.exec('ROLLBACK');throw e;}}
 return {read,write,readState,writeState,get:id=>{const r=get.get(id);return r?hydrate(r):undefined;},close:()=>db.close()};
}
module.exports={present,open,projection};