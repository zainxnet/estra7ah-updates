'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib'),{once}=require('node:events'),readline=require('node:readline');
const fixed=['assets/db/estra7ah.json','assets/db/estra7ah.items.json','data/admin.json','data/content.json','data/item-edits.json','data/speed.json','data/operations-stats.json','data/sync-items.sqlite','data/broadcast.json','data/broadcast-stats.json','data/sync-events.json','data/actor-images.json'];
const mediaDirs=['data/exclusive-logos','data/section-images','data/promotional-media','data/poster-cache','data/backdrop-cache','assets/ExtsImage','assets/SecsImage','assets/AdImage','assets/ExtsVideo'];
const allowed=n=>typeof n==='string'&&(fixed.includes(n)||/^data\/exclusive-logos\/[a-f0-9]{64}\.png$/.test(n)||/^data\/section-images\/[a-f0-9-]+\.(png|jpg|webp|gif|ico)$/.test(n)||/^data\/(?:poster-cache|backdrop-cache)\/[a-f0-9]{64}\.jpg$/.test(n)||/^data\/promotional-media\/[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(n)||/^assets\/(?:ExtsImage|SecsImage|AdImage|ExtsVideo)\/[^/\\:\x00-\x1f]{1,240}\.(?:jpg|jpeg|png|webp|gif|ico|bmp|mp4|webm)$/.test(n));
module.exports={allowed,fixed,mediaDirs,run};
async function run({base,action,file,stage}){
 fs.mkdirSync(stage,{recursive:true});
 if(action==='create'){
  for(const n of ['assets/db/estra7ah.json','assets/db/estra7ah.items.json','data/admin.json'])if(!fs.existsSync(path.join(base,n)))throw Error('تعذر إنشاء نسخة كاملة؛ ملف قاعدة البيانات مفقود: '+n);
  const names=fixed.filter(n=>fs.existsSync(path.join(base,n)));
  const logos=path.join(base,'data/exclusive-logos');if(fs.existsSync(logos))for(const n of fs.readdirSync(logos))if(allowed('data/exclusive-logos/'+n))names.push('data/exclusive-logos/'+n);
  const sectionImages=path.join(base,'data/section-images');if(fs.existsSync(sectionImages))for(const n of fs.readdirSync(sectionImages))if(allowed('data/section-images/'+n))names.push('data/section-images/'+n);
  const media=path.join(base,'data/promotional-media');if(fs.existsSync(media))for(const n of fs.readdirSync(media))if(allowed('data/promotional-media/'+n))names.push('data/promotional-media/'+n);
  const posters=path.join(base,'data/poster-cache');if(fs.existsSync(posters))for(const n of fs.readdirSync(posters))if(allowed('data/poster-cache/'+n))names.push('data/poster-cache/'+n);
  const backdrops=path.join(base,'data/backdrop-cache');if(fs.existsSync(backdrops))for(const n of fs.readdirSync(backdrops))if(allowed('data/backdrop-cache/'+n))names.push('data/backdrop-cache/'+n);
  for(const folder of mediaDirs.filter(n=>n.startsWith('assets/'))){const full=path.join(base,folder);if(fs.existsSync(full))for(const n of fs.readdirSync(full))if(allowed(folder+'/'+n))names.push(folder+'/'+n);}
  for(const n of names){const dst=path.join(stage,n);fs.mkdirSync(path.dirname(dst),{recursive:true});if(n.endsWith('.sqlite')){const {DatabaseSync,backup}=require('node:sqlite'),db=new DatabaseSync(path.join(base,n),{readOnly:true});try{await backup(db,dst);}finally{db.close();}}else await fs.promises.copyFile(path.join(base,n),dst);}
  const gzip=zlib.createGzip({level:6}),out=fs.createWriteStream(file,{flags:'wx'});gzip.pipe(out);let failure;out.on('error',e=>{failure=e;gzip.destroy(e)});gzip.on('error',e=>{failure=e;});
  const write=async value=>{if(failure)throw failure;if(!gzip.write(JSON.stringify(value)+'\n'))await once(gzip,'drain');};
  await write({format:'zain-backup',version:1,createdAt:new Date().toISOString()});
  for(const n of names){const hash=crypto.createHash('sha256');let size=0;await write({file:n});for await(const chunk of fs.createReadStream(path.join(stage,n),{highWaterMark:65536})){hash.update(chunk);size+=chunk.length;await write({data:chunk.toString('base64')});}await write({end:n,size,sha256:hash.digest('hex')});}
  await write({complete:true,files:names.length});gzip.end();await once(out,'finish');return {files:names};
 }
 const header=Buffer.alloc(4),handle=fs.openSync(file,'r');try{fs.readSync(handle,header,0,4,0)}finally{fs.closeSync(handle)}
 if(header.readUInt32LE(0)===0x04034b50)return require('./legacy-backup.cjs')({base,file,stage});
 const input=fs.createReadStream(file),gunzip=zlib.createGunzip();input.on('error',e=>gunzip.destroy(e));input.pipe(gunzip);
 const lines=readline.createInterface({input:gunzip,crlfDelay:Infinity});let first=true,current=null,fd,hash,size=0,total=0,complete=false;const names=[];
 try{for await(const line of lines){if(line.length>100000)throw Error('سطر نسخة غير صالح');const row=JSON.parse(line);
  if(first){first=false;if(row.format!=='zain-backup'||row.version!==1)throw Error('هذه ليست نسخة احتياطية من خادم زين');continue;}
  if(complete)throw Error('بيانات إضافية غير صالحة');
  if(row.file){if(current||!allowed(row.file)||names.includes(row.file))throw Error('مسار نسخة غير صالح');current=row.file;names.push(current);if(names.length>20000)throw Error('عدد ملفات كبير');const dst=path.join(stage,current);fs.mkdirSync(path.dirname(dst),{recursive:true});fd=fs.openSync(dst,'wx');hash=crypto.createHash('sha256');size=0;}
  else if(row.data!==undefined){if(!current||typeof row.data!=='string'||!/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(row.data))throw Error('محتوى نسخة غير صالح');const bytes=Buffer.from(row.data,'base64');size+=bytes.length;total+=bytes.length;if(total>2*1024**3)throw Error('حجم النسخة غير مسموح');hash.update(bytes);fs.writeSync(fd,bytes);}
  else if(row.end){if(row.end!==current||row.size!==size||row.sha256!==hash.digest('hex'))throw Error('فشل التحقق من سلامة النسخة');fs.closeSync(fd);fd=null;current=null;}
  else if(row.complete){if(current||row.files!==names.length)throw Error('نسخة غير مكتملة');complete=true;}
  else throw Error('صيغة نسخة غير صالحة');
 }if(!complete||!names.includes('assets/db/estra7ah.json')||!names.includes('data/admin.json')||!names.includes('assets/db/estra7ah.items.json'))throw Error('النسخة ناقصة');
 for(const n of names.filter(n=>n.endsWith('.json'))){const obj=JSON.parse(fs.readFileSync(path.join(stage,n),'utf8'));if(!obj||typeof obj!=='object')throw Error('قاعدة غير صالحة');if(n==='data/admin.json'&&(!Array.isArray(obj.sections)||!Array.isArray(obj.users)||!obj.users.some(u=>u.level==='admin'&&u.active&&/^[a-f0-9]{128}$/.test(u.hash))))throw Error('بيانات المدير غير صالحة');if(n.endsWith('estra7ah.items.json')&&!Array.isArray(obj.itemsData))throw Error('فهرس غير صالح');}
 if(names.includes('data/sync-items.sqlite')){const {DatabaseSync}=require('node:sqlite'),db=new DatabaseSync(path.join(stage,'data/sync-items.sqlite'),{readOnly:true});try{if(db.prepare('PRAGMA integrity_check').get().integrity_check!=='ok')throw Error('قاعدة المزامنة تالفة');}finally{db.close();}}
 return {files:names};
 }finally{if(fd!==undefined&&fd!==null)fs.closeSync(fd);lines.close();input.destroy();gunzip.destroy();}
}
if(require.main===module)process.once('message',async args=>{try{process.send({ok:true,...await run(args)});}catch(e){process.send({error:e.message});}finally{process.disconnect();}});
