'use strict';
const fs=require('node:fs'),path=require('node:path'),v8=require('node:v8'),zlib=require('node:zlib'),crypto=require('node:crypto'),{DatabaseSync}=require('node:sqlite');
const compact=require('./compact-catalog-store.cjs'),classify=require('./catalog-items.cjs');
const schema=`CREATE TABLE payloads(hash BLOB PRIMARY KEY,value BLOB NOT NULL) WITHOUT ROWID;
CREATE TABLE folders(id TEXT PRIMARY KEY,section TEXT,parent TEXT,name TEXT,type TEXT,path TEXT,payload BLOB NOT NULL REFERENCES payloads(hash)) WITHOUT ROWID;
CREATE INDEX folder_section ON folders(section,parent);CREATE INDEX folder_parent ON folders(parent);CREATE INDEX folder_payload ON folders(payload);
CREATE TABLE aliases(id TEXT PRIMARY KEY,target TEXT NOT NULL) WITHOUT ROWID;
CREATE TABLE compact_state(key TEXT PRIMARY KEY,value BLOB NOT NULL) WITHOUT ROWID;
CREATE TABLE compact_history(key TEXT,at INTEGER,value BLOB NOT NULL,PRIMARY KEY(key,at)) WITHOUT ROWID;
CREATE TABLE compact_info(key TEXT PRIMARY KEY,value TEXT) WITHOUT ROWID;`;
const pack=x=>zlib.deflateRawSync(Buffer.from(JSON.stringify(x)));
function cafe(base){let settings;try{settings=JSON.parse(fs.readFileSync(path.join(base,'data/admin.json'),'utf8')).settings}catch{}if(!settings?.estra7ah_type)try{settings=JSON.parse(fs.readFileSync(path.join(base,'assets/db/estra7ah.json'),'utf8')).settings}catch{}return settings?.estra7ah_type==='caffe';}
function hasSnapshot(file){let db;try{db=new DatabaseSync(file,{readOnly:true});return !!db.prepare("SELECT 1 FROM catalog_meta WHERE key='snapshot'").get()}catch{return false}finally{db?.close()}}
function recover(base){const marker=path.join(base,'data/compact-migration.json');if(!fs.existsSync(marker))return;const plan=JSON.parse(fs.readFileSync(marker));const root=path.resolve(base,'data'),target=path.join(root,'catalog.sqlite');for(const p of [plan.temp,plan.saved])if(!path.resolve(p).startsWith(root+path.sep))throw Error('Invalid migration journal');if(!fs.existsSync(target)&&fs.existsSync(plan.saved))fs.renameSync(plan.saved,target);if(!fs.existsSync(target))throw Error('Catalogue migration needs recovery');fs.renameSync(marker,marker+'.recovered-'+Date.now());}
function convert(base,snapshot){
 const file=path.join(base,'data/catalog.sqlite');recover(base);if(fs.existsSync(file)&&compact.present(file))return;
 const temp=file+'.compact-'+crypto.randomUUID(),saved=path.join(base,'data/catalog-archive/catalog-before-'+Date.now()+'.sqlite');
 const source=fs.existsSync(file)?new DatabaseSync(file,{readOnly:true}):null,db=new DatabaseSync(temp);db.exec('PRAGMA foreign_keys=ON;'+schema);
 let count=0,excluded=0;const membership=new Map();
 const items=()=>snapshot?snapshot.items.values():(function*(){for(const row of source.prepare("SELECT value FROM catalog_maps NOT INDEXED WHERE name='items'").iterate())yield v8.deserialize(row.value);})();
 const aliases=()=>snapshot?snapshot.scannedAliases.entries():(function*(){for(const row of source.prepare("SELECT key,value FROM catalog_maps NOT INDEXED WHERE name='scannedAliases'").iterate())yield [row.key,v8.deserialize(row.value)];})();
 const payload=db.prepare('INSERT OR IGNORE INTO payloads VALUES (?,?)'),put=db.prepare('INSERT INTO folders VALUES (?,?,?,?,?,?,?)');
 try{
  source?.exec('BEGIN');db.exec('BEGIN');
  for(const original of items()){
   if(classify.videoFile(original)){excluded++;continue;}
   const row=compact.projection(original),{id,sectionId,inItem,name,type,path:folder,...rest}=row;
   const value=pack(rest),hash=crypto.createHash('sha256').update(value).digest();payload.run(hash,value);put.run(id,sectionId??null,inItem??null,name??null,type??null,folder??null,hash);membership.set(id,sectionId);count++;
  }
    const protectedIds=new Set();
  if(source?.prepare("SELECT 1 FROM sqlite_master WHERE name='catalog_meta'").get()){
   const saved=source.prepare("SELECT value FROM catalog_meta WHERE key='state:item-edits'").get();
   if(saved){const edits=JSON.parse(Buffer.from(saved.value).toString('utf8'));for(const id of [...(edits.deleted||[]),...(edits.scanDeleted||[]),...(edits.pinned||[]),...Object.keys(edits.edits||{})])protectedIds.add(id);}
  }
  const alias=db.prepare('INSERT INTO aliases VALUES (?,?)');for(const [id,target]of aliases())if(membership.has(target)||protectedIds.has(target)||protectedIds.has(id))alias.run(id,target);
  const state=db.prepare('INSERT OR REPLACE INTO compact_state VALUES (?,?)');
  if(source?.prepare("SELECT 1 FROM sqlite_master WHERE name='catalog_meta'").get())for(const row of source.prepare("SELECT key,value FROM catalog_meta WHERE key LIKE 'state:%'").iterate())state.run(row.key.slice(6),pack(JSON.parse(Buffer.from(row.value).toString('utf8'))));
  if(source?.prepare("SELECT 1 FROM sqlite_master WHERE name='catalog_state_history'").get()){
   const history=db.prepare('INSERT INTO compact_history VALUES (?,?,?)');for(const row of source.prepare('SELECT * FROM catalog_state_history').iterate())history.run(row.key,row.at,pack(JSON.parse(Buffer.from(row.value).toString('utf8'))));
  }
  const info=db.prepare('INSERT INTO compact_info VALUES (?,?)');info.run('schema','1');info.run('migration',JSON.stringify({at:new Date().toISOString(),folders:count,excludedVideoRecords:excluded,sourceArchive:saved}));db.exec('COMMIT');
  // Compare every retained folder field before replacing any live file.
  const get=db.prepare('SELECT f.*,p.value FROM folders f JOIN payloads p ON f.payload=p.hash WHERE f.id=?');
  for(const original of items()){
   if(classify.videoFile(original))continue;const clean=compact.projection(original),r=get.get(original.id);if(!r)throw Error('Missing folder during conversion');const restored={id:r.id,sectionId:r.section,inItem:r.parent,name:r.name,type:r.type,path:r.path,...JSON.parse(zlib.inflateRawSync(r.value))};
   for(const key of Object.keys(clean))if(JSON.stringify(clean[key])!==JSON.stringify(restored[key]))throw Error('Migration changed folder field '+key);
  }
  if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok'||db.prepare('PRAGMA foreign_key_check').all().length)throw Error('Compact database verification failed');
  source?.exec('ROLLBACK');source?.close();db.close();
 }catch(e){try{db.close()}catch{}try{source?.close()}catch{}throw e;}
 if(fs.existsSync(file)){const writable=new DatabaseSync(file);try{const result=writable.prepare('PRAGMA wal_checkpoint(TRUNCATE)').get();if(result.busy)throw Error('Catalogue busy during conversion');writable.exec('PRAGMA journal_mode=DELETE');}finally{writable.close();}}
 fs.mkdirSync(path.dirname(saved),{recursive:true});const marker=path.join(base,'data/compact-migration.json');fs.writeFileSync(marker,JSON.stringify({temp,saved}));
 try{if(fs.existsSync(file))fs.renameSync(file,saved);fs.renameSync(temp,file);}catch(e){if(!fs.existsSync(file)&&fs.existsSync(saved))fs.renameSync(saved,file);throw e;}
 fs.renameSync(marker,path.join(path.dirname(saved),'migration-'+Date.now()+'.json'));
 return {folders:count,excludedVideoRecords:excluded,bytes:fs.statSync(file).size,archive:saved};
}
module.exports={convert,cafe,hasSnapshot,recover};