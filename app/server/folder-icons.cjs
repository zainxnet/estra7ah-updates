'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const pathKey=v=>path.normalize(v||'').replace(/[\\/]+$/,'').toLowerCase(),hash=v=>crypto.createHash('sha256').update(pathKey(v)).digest('hex');
const supported=x=>{const type=require('./public-catalog.cjs').publicType(x?.type);return !!x&&!!x.path&&path.isAbsolute(x.path)&&x.recordKind!=='file'&&(['movie','series','season'].includes(type)||/^series\./.test(type||''))&&!/\.(?:mkv|mp4|avi|mp3|wav|ogg|m4a)$/i.test(x.path);};
module.exports=function({dir,getItem,getKey,getPoster=()=>null,getLookupName,onEvent=()=>{},onCreated=()=>{},onInspected=()=>{},files,source,render,delayMs=250,maxQueue=2048}){
 const io=files||require('./folder-icon-files.cjs'),resolver=source||require('./folder-icon-source.cjs')({dir,getKey,getLookupName}),folder=path.join(dir,'folder-icons');fs.mkdirSync(folder,{recursive:true});
 const queue=[],deferred=new Map(),occupied=new Set(),checked=new Map();let running=false,closed=false,activeChild=null,timer=null;
 const stats={status:'idle',total:0,processed:0,created:0,skipped:0,failed:0,currentItem:''};
 const event=(m,k='success')=>{try{onEvent(m,k);}catch{}};
 function runRender(a){return new Promise((resolve,reject)=>{
  const argv=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'folder-icon-render.ps1'),'-Poster',a.poster,'-Output',a.output,'-Title',a.title,'-Preview',a.preview];if(a.season)argv.push('-Season',a.season);if(a.logo)argv.push('-Logo',a.logo);
  const child=spawn('powershell.exe',argv,{windowsHide:true,stdio:['ignore','ignore','pipe']});activeChild=child;let done=false;
  const timeout=setTimeout(()=>{child.kill();finish(Error('RENDER_TIMEOUT'));},45000);
  function finish(error){if(done)return;done=true;clearTimeout(timeout);if(activeChild===child)activeChild=null;error?reject(error):resolve();}
  child.stderr.on('data',()=>{});child.once('error',()=>finish(Error('RENDER_START_FAILED')));child.once('exit',code=>finish(code===0?null:Error('RENDER_FAILED')));
 });}
 const renderer=render||runRender;
 async function prepare(id){
  const item=getItem(id);if(!supported(item)){stats.skipped++;return;}
  const result=await io.inspect(item.path);if(closed)return;onInspected(item);if(result.status==='existing'){stats.skipped++;return;}if(result.status!=='ready')throw Error(result.code||'FOLDER_UNAVAILABLE');
  const parent=item.type==='season'?getItem(item.inItem):null;if(parent&&pathKey(parent.path)===pathKey(item.path)){stats.skipped++;return;}
  let poster=result.posterPath||getPoster(item.id),remote={};
  if(!poster&&parent){const parentArt=await io.inspect(parent.path,{includePoster:true});poster=parentArt.posterPath||getPoster(parent.id);}
  if(!poster)try{remote=await resolver.resolve(item,{parent,posterNeeded:true,logoNeeded:false});}catch{throw Error('POSTER_UNAVAILABLE');}
  poster=poster||remote.posterPath;if(closed)return;if(!poster)throw Error('NO_CONFIRMED_POSTER');
  const tmp=path.join(folder,hash(item.path)+'-'+crypto.randomUUID()),output=tmp+'.ico',preview=tmp+'.png';
  try{
   const title=parent?(getLookupName?.(parent)||parent.name):(getLookupName?.(item)||item.name);
   await renderer({poster,output,preview,title,season:parent?path.basename(item.path):''});if(closed)return;
   const installed=await io.install(item.path,output);if(installed.status==='existing'){stats.skipped++;return;}if(installed.status!=='created')throw Error(installed.code||'WRITE_FAILED');
   stats.created++;await onCreated(item);event('تم إنشاء أيقونة المجلد: '+item.name+(parent?' — '+path.basename(item.path):''));
   if(installed.explorerReady===false)event('حُفظت الأيقونة؛ تعذر تفعيل عرضها في ويندوز: '+item.name,'warning');
  }finally{for(const f of [output,preview])try{fs.unlinkSync(f);}catch{}}
 }
 async function pump(){if(running||closed)return;running=true;stats.status='running';
  try{while((queue.length||deferred.size)&&!closed){while(queue.length<maxQueue&&deferred.size){const entry=deferred.entries().next().value;deferred.delete(entry[0]);queue.push(entry[1]);}const job=queue.shift(),item=getItem(job.id);stats.currentItem=item?.name||job.id;
   try{await prepare(job.id);checked.set(job.key,Date.now()+30*60000);}catch(e){stats.failed++;checked.set(job.key,Date.now()+5*60000);const reasons={NO_CONFIRMED_POSTER:'لا توجد صورة محلية أو مطابقة مؤكدة في TMDB',POSTER_UNAVAILABLE:'تعذر جلب البوستر',FOLDER_UNAVAILABLE:'تعذر الوصول إلى المجلد',EACCES:'لا توجد صلاحية كتابة',EPERM:'لا توجد صلاحية كتابة',TIMEOUT:'انتهت مهلة المسار الشبكي'};event('تعذر إنشاء أيقونة '+stats.currentItem+': '+(reasons[e.message]||'تعذر تجهيز الصورة أو حفظ الأيقونة ('+e.message+')'),'warning');}
   finally{occupied.delete(job.key);stats.processed++;}if(delayMs&&!closed)await new Promise(r=>setTimeout(r,delayMs));
  }}finally{running=false;stats.currentItem='';stats.status=closed?'stopped':stats.failed?'partial':'completed';if(!closed)event('انتهى تجهيز الأيقونات: '+stats.created+' جديدة، '+stats.skipped+' موجودة أو مستبعدة، '+stats.failed+' تعذر',stats.failed?'warning':'success');}
 }
 function enqueue(ids,{retry=false}={}){
  if(closed)return;let added=0;for(const id of ids){const item=getItem(id);if(!supported(item))continue;const key=pathKey(item.path);if(occupied.has(key)||(!retry&&Date.now()<(checked.get(key)||0)))continue;
   if(!running&&!queue.length){Object.assign(stats,{status:'queued',total:0,processed:0,created:0,skipped:0,failed:0});}
   if(queue.length<maxQueue)queue.push({id,key});else deferred.set(key,{id,key});occupied.add(key);stats.total++;added++;
  }
  if(checked.size>20000){const now=Date.now();for(const [key,until]of checked)if(until<now)checked.delete(key);}
  if(added&&!running&&!timer){event('جارٍ تجهيز أيقونات المجلدات في الخلفية');timer=setTimeout(()=>{timer=null;pump();},delayMs);}
 }
 return {enqueue,status:()=>({...stats,queued:queue.length+deferred.size,running}),idle:async()=>{while(running||timer||queue.length||deferred.size)await new Promise(r=>setTimeout(r,20));},async close(){closed=true;queue.length=0;deferred.clear();occupied.clear();clearTimeout(timer);timer=null;activeChild?.kill();resolver.close?.();while(running)await new Promise(r=>setTimeout(r,20));}};
};
module.exports.supported=supported;
