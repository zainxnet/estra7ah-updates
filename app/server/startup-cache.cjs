'use strict';
const fs=require('node:fs'),path=require('node:path'),v8=require('node:v8'),crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');
const inputs=['assets/db/estra7ah.items.json','data/sync-items.sqlite','data/sync-items.sqlite-wal'];
const families=['items','children','sectionItems','files','byMediaPath','byFilePath','scannedAliases'];
const tick=()=>new Promise(resolve=>setImmediate(resolve));
// Immutable, disposable disk index with in-memory changes. Source databases
// remain authoritative; full films, episodes and files are loaded on demand.
class DiskMap extends Map {
 constructor(db,name,count){super();this.db=db;this.name=name;this.count=count;this.loaded=new Map();this.removed=new Set();this.select=db.prepare('SELECT value FROM '+name+' WHERE key=?');this.exists=db.prepare('SELECT 1 FROM '+name+' WHERE key=?');}
 get size(){return this.count;}
 has(key){return !this.removed.has(key)&&(super.has(key)||this.loaded.has(key)||typeof key==='string'&&!!this.exists.get(key));}
 get(key){if(this.removed.has(key))return undefined;if(super.has(key))return super.get(key);if(this.loaded.has(key))return this.loaded.get(key);if(typeof key!=='string')return undefined;const row=this.select.get(key);if(!row)return undefined;const value=v8.deserialize(row.value);this.loaded.set(key,value);return value;}
 set(key,value){if(!this.has(key))this.count++;this.removed.delete(key);this.loaded.delete(key);super.set(key,value);return this;}
 delete(key){if(!this.has(key))return false;this.count--;this.removed.add(key);this.loaded.delete(key);super.delete(key);return true;}
 *keys(){for(const {key}of this.db.prepare('SELECT key FROM '+this.name+' ORDER BY rowid').iterate())if(!this.removed.has(key))yield key;for(const key of super.keys())if(!this.exists.get(key))yield key;}
 *values(){for(const key of this.keys())yield this.get(key);}
 *entries(){for(const key of this.keys())yield [key,this.get(key)];}
 [Symbol.iterator](){return this.entries();}
 forEach(callback,thisArg){for(const [key,value]of this)callback.call(thisArg,value,key,this);}
 topFilter({keys,types,section,missing}={}){
  const normalize=value=>String(value||'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ؤئ]/g,'ء').replace(/ى/g,'ي').toLowerCase();
  const where=['visible=1'],args=[];if(keys){where.push(keys.length?'('+keys.map(()=> 'instr(name,?)>0').join(' OR ')+')':'0');args.push(...keys);}if(types){where.push(types.length?'type IN ('+types.map(()=>'?').join(',')+')':'0');args.push(...types);}if(section){where.push('section=?');args.push(section);}if(missing)where.push('has_content=0');
  const matches=row=>require('./catalog-items.cjs').visible(row)&&(!row.inItem||row.inItem==='null')&&(!keys||keys.some(key=>normalize(row.name).includes(key)))&&(!types||types.includes(row.type))&&(!section||row.sectionId===section)&&(!missing||!require('./metadata.cjs').hasContent(row));
  return {clause:where.length?' WHERE '+where.join(' AND '):'',args,matches};
 }
 countTop(filters={}){const {clause,args,matches}=this.topFilter(filters);let count=this.db.prepare('SELECT count(*) n FROM top_items'+clause).get(...args).n;const changed=new Set([...super.keys(),...this.removed]);for(const key of changed){if(this.db.prepare('SELECT 1 FROM top_items'+clause+(clause?' AND ':' WHERE ')+'key=?').get(...args,key))count--;const row=super.get(key);if(row&&matches(row))count++;}return count;}
 queryTop({limit=100,offset=0,newest=false,...filters}={}){
  const {clause,args,matches}=this.topFilter(filters),changed=new Set([...super.keys(),...this.removed]),rows=[];
  for(const {key,summary,ordinal}of this.db.prepare('SELECT key,summary,rowid AS ordinal FROM top_items'+clause+' ORDER BY '+(newest?'created DESC,rowid':'rowid')+' LIMIT ?').iterate(...args,offset+limit+changed.size)){
   if(changed.has(key))continue;const row=JSON.parse(summary);for(const field of ['content','files'])Object.defineProperty(row,field,{enumerable:true,get:()=>this.get(key)?.[field]});rows.push({row,ordinal});
  }
  for(const [key,row]of super.entries())if(matches(row))rows.push({row,ordinal:this.db.prepare('SELECT rowid ordinal FROM top_items WHERE key=?').get(key)?.ordinal||Number.MAX_SAFE_INTEGER});
  rows.sort((a,b)=>newest?(Number(b.row.createdAt)||0)-(Number(a.row.createdAt)||0)||a.ordinal-b.ordinal:a.ordinal-b.ordinal);return rows.slice(offset,offset+limit).map(x=>x.row);
 }
 topRows(){
  const rows=[],seen=new Set();
  for(const {key,summary}of this.db.prepare('SELECT key,summary FROM items WHERE summary IS NOT NULL ORDER BY rowid').iterate()){
   seen.add(key);if(this.removed.has(key))continue;if(super.has(key)){const current=super.get(key);if(!current.inItem||current.inItem==='null')rows.push(current);continue;}
   const item=JSON.parse(summary);for(const field of ['content','files'])Object.defineProperty(item,field,{enumerable:true,get:()=>this.get(key)?.[field]});rows.push(item);
  }
  for(const [key,item]of super.entries())if((!item.inItem||item.inItem==='null')&&!seen.has(key))rows.push(item);
  return rows.filter(require('./catalog-items.cjs').visible);
 }
}
module.exports=function(base){
 const directory=path.join(base,'data','startup-cache'),file=path.join(directory,'catalog.sqlite'),meta=path.join(directory,'catalog.json'),store=path.join(base,'data/sync-items.sqlite'),revision=require('./catalog-revision.cjs');let writing,reason='';
 function signature(){return JSON.stringify({format:6,node:process.versions.v8,files:inputs.map(name=>{try{const s=fs.statSync(path.join(base,name));return name.endsWith('-wal')&&s.size===0?[name,0]:[name,s.size,s.mtimeMs,s.ctimeMs]}catch(e){if(e.code==='ENOENT')return [name,name.endsWith('-wal')?0:null];throw e;}})});}
 function editShape(){const file=path.join(base,'data/item-edits.json');const state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{};return {edits:Object.fromEntries(Object.entries(state.edits||{}).map(([id,value])=>[id,Object.keys(value)])),deleted:[...(state.deleted||[]),...(state.scanDeleted||[])]};}
 function editsCompatible(previous){const current=editShape();return Object.entries(previous.edits).every(([id,keys])=>keys.every(key=>current.edits[id]?.includes(key)))&&previous.deleted.every(id=>current.deleted.includes(id));}
 async function read(){let db;try{
  reason='';const before=signature(),info=JSON.parse(await fs.promises.readFile(meta,'utf8'));let changed=[];
  if(fs.statSync(file).size!==info.bytes)throw Error('الفهرس المحلي غير مكتمل');
  if(info.signature!==before){
   const previous=JSON.parse(info.signature),current=JSON.parse(before);
   if(previous.format!==current.format||previous.node!==current.node)throw Error('تجهيز الفهرس بعد تحديث البرنامج');
   if(JSON.stringify(previous.files[0])!==JSON.stringify(current.files[0]))throw Error('تغيرت قاعدة المكتبة الأساسية أو استُعيدت نسخة احتياطية');
   const delta=revision.changes(store,info.sourceRevision);
   if(!delta)throw Error('تجهيز فهرس قاعدة المزامنة لأول مرة أو بعد تغيير كبير');
   changed=delta.rows;
  }
  db=new DatabaseSync(file,{readOnly:true});const stored=db.prepare('SELECT value FROM metadata WHERE key=?').get('signature');if(stored?.value!==info.signature)throw Error('الفهرس المحلي غير مكتمل');
  const shape=JSON.parse(db.prepare('SELECT value FROM metadata WHERE key=?').get('edits')?.value||'null');if(!shape||!editsCompatible(shape))throw Error('إعادة تجهيز الفهرس بعد استعادة تعديلات العناصر');
  const value={sourceChanges:changed};for(const name of families)value[name]=new DiskMap(db,name,info.counts[name]);if(signature()!==before)throw Error('تغيرت المكتبة أثناء تحميل الفهرس');return value;
 }catch(error){reason=error.code==='ENOENT'?'تجهيز الفهرس لأول تشغيل':error.message;try{db?.close()}catch{}return null;}}
 function write(value,expected){if(writing)return writing;writing=build(value,expected).finally(()=>{writing=null});return writing;}
 async function build(value,expected){let db;try{
  const sourceRevision=revision.snapshot(store);if(signature()!==expected)return false;fs.mkdirSync(directory,{recursive:true});
  const snapshot=Object.fromEntries(families.map(name=>[name,new Map([...value[name]].map(([key,row])=>[key,row instanceof Set?new Set(row):row]))]));
  const edits=editShape();const temp=file+'.building';if(fs.existsSync(temp))fs.unlinkSync(temp);db=new DatabaseSync(temp);db.exec('PRAGMA journal_mode=MEMORY; PRAGMA synchronous=OFF; CREATE TABLE metadata(key TEXT PRIMARY KEY,value TEXT)');const counts={};
  for(const name of families){db.exec('CREATE TABLE '+name+' (key TEXT PRIMARY KEY,value BLOB NOT NULL,summary TEXT)');const insert=db.prepare('INSERT INTO '+name+' VALUES(?,?,?)');counts[name]=snapshot[name].size;let batch=0;db.exec('BEGIN');
   for(const [key,row]of snapshot[name]){let summary=null;if(name==='items'&&(!row.inItem||row.inItem==='null')){const {content,files,...light}=row;summary=JSON.stringify({...light,__zainHasContent:require('./metadata.cjs').hasContent(row),__zainVisible:require('./catalog-items.cjs').visible(row)});}insert.run(String(key),v8.serialize(row),summary);if(++batch%2000===0){db.exec('COMMIT');await tick();if(signature()!==expected)throw Error('Changed catalog');db.exec('BEGIN');}}
   db.exec('COMMIT');snapshot[name].clear();await tick();
  }
  db.exec('CREATE TABLE top_items (key TEXT PRIMARY KEY,summary TEXT,name TEXT,type TEXT,created REAL,section TEXT,has_content INTEGER,visible INTEGER)');const list=db.prepare('INSERT INTO top_items VALUES(?,?,?,?,?,?,?,?)');let n=0;db.exec('BEGIN');for(const row of db.prepare('SELECT key,summary FROM items WHERE summary IS NOT NULL ORDER BY rowid').iterate()){const item=JSON.parse(row.summary),name=String(item.name||'').replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ؤئ]/g,'ء').replace(/ى/g,'ي').toLowerCase();list.run(row.key,row.summary,name,item.type||'',Number(item.createdAt)||0,item.sectionId||'',item.__zainHasContent?1:0,item.__zainVisible===false?0:1);if(++n%2000===0){db.exec('COMMIT');await tick();db.exec('BEGIN');}}db.exec('COMMIT; CREATE INDEX top_type_date ON top_items(type,created DESC); CREATE INDEX top_date ON top_items(created DESC); CREATE INDEX top_missing_date ON top_items(has_content,created DESC); CREATE INDEX top_section_date ON top_items(section,created DESC)');
  db.prepare('INSERT INTO metadata VALUES(?,?)').run('signature',expected);db.prepare('INSERT INTO metadata VALUES(?,?)').run('edits',JSON.stringify(edits));db.close();db=null;if(signature()!==expected)return false;
  await fs.promises.rename(temp,file);await fs.promises.writeFile(meta+'.tmp',JSON.stringify({signature:expected,bytes:fs.statSync(file).size,counts,sourceRevision}));await fs.promises.rename(meta+'.tmp',meta);return true;
 }catch(error){try{db?.close()}catch{}console.warn('Startup cache rebuild: '+error.message);return false;}}
 return {read,write,signature,get reason(){return reason;}};
};
