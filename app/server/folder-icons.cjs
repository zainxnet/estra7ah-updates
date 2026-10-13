'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const label=require('./folder-icon-label.cjs');
const pathKey=v=>path.normalize(v||'').replace(/[\\/]+$/,'').toLowerCase(),hash=v=>crypto.createHash('sha256').update(pathKey(v)).digest('hex');
const supported=x=>{const type=require('./public-catalog.cjs').publicType(x?.type);return !!x&&!!x.path&&path.isAbsolute(x.path)&&x.recordKind!=='file'&&(['movie','series','season'].includes(type)||/^series\./.test(type||''))&&!/\.(?:mkv|mp4|avi|mp3|wav|ogg|m4a)$/i.test(x.path);};
module.exports=function({dir,getItem,getKey,getPoster=()=>null,getLookupName,translateTitle,onEvent=()=>{},readEvents=()=>[],onCreated=()=>{},onInspected=()=>{},savePoster=require('./poster-folder.cjs'),files,source,render,delayMs=250,maxQueue=2048}){
 const io=files||require('./folder-icon-files.cjs'),resolver=source||require('./folder-icon-source.cjs')({dir,getKey,getLookupName}),folder=path.join(dir,'folder-icons');fs.mkdirSync(folder,{recursive:true});
 const replacements=new Set();
 const queue=[],deferred=new Map(),occupied=new Set(),checked=new Map();let running=false,closed=false,activeChild=null,timer=null;
 const stats={status:'idle',runId:null,total:0,processed:0,created:0,updatedIds:[],postersSaved:0,skipped:0,failed:0,currentItem:'',phase:''};
 const event=(m,k='success')=>{try{onEvent(m,k);}catch{}};
 function runRender(a){return new Promise((resolve,reject)=>{
  const argv=['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'folder-icon-render.ps1'),'-Poster',a.poster,'-Output',a.output,'-Title',a.title,'-Preview',a.preview];if(a.preferArabic)argv.push('-PreferArabic');if(a.season)argv.push('-Season',a.season);if(a.logo)argv.push('-Logo',a.logo);
  const child=spawn('powershell.exe',argv,{windowsHide:true,stdio:['ignore','ignore','pipe']});activeChild=child;let done=false;
  const timeout=setTimeout(()=>{child.kill();finish(Error('RENDER_TIMEOUT'));},45000);
  function finish(error){if(done)return;done=true;clearTimeout(timeout);if(activeChild===child)activeChild=null;error?reject(error):resolve();}
  child.stderr.on('data',()=>{});child.once('error',()=>finish(Error('RENDER_START_FAILED')));child.once('exit',code=>finish(code===0?null:Error('RENDER_FAILED')));
 });}
 const renderer=render||runRender;
 async function prepare(id,replace=false){
  const item=getItem(id);if(!supported(item)){stats.skipped++;return;}
  stats.phase='فحص الصورة والأيقونة';
  const result=await io.inspect(item.path,{includePoster:replace});if(closed)return;onInspected(item);if(result.status==='existing'&&!replace){stats.skipped++;return;}if(result.status!=='ready'&&!(replace&&result.status==='existing'&&result.iconPath))throw Error(result.code||'FOLDER_UNAVAILABLE');
  const parent=item.type==='season'?getItem(item.inItem):null;if(parent&&pathKey(parent.path)===pathKey(item.path)){stats.skipped++;return;}
  const identity=parent||item,lookup=getLookupName?.(identity)||identity.name;
  let arabicTitle=label.stored(identity);
  let poster=result.posterPath||getPoster(item.id),remote={};
  if(!poster&&parent){const parentArt=await io.inspect(parent.path,{includePoster:true});poster=parentArt.posterPath||getPoster(parent.id);}
  if(!poster)try{stats.phase='البحث عن بوستر مطابق وتنزيله';remote=await resolver.resolve(item,{parent,posterNeeded:true,logoNeeded:false,titleNeeded:!arabicTitle});}catch{throw Error('POSTER_UNAVAILABLE');}
  poster=poster||remote.posterPath;if(closed)return;if(!poster)throw Error('NO_CONFIRMED_POSTER');
  if(!result.posterPath){
   // Keep a real cover beside the new icon even when automatic metadata is off.
   // Exclusive copying preserves a cover another job/user may have just created.
   stats.phase='حفظ صورة البوستر';const saved=await savePoster(item,poster);if(closed)return;
   if(saved.status==='saved'){stats.postersSaved++;poster=path.join(item.path,'poster.jpg');event('تم حفظ صورة داخل مجلد: '+item.name);}
   else if(saved.status==='failed')event('الصورة متاحة لتجهيز الأيقونة؛ تعذر حفظها داخل مجلد '+item.name+' ('+saved.code+')','warning');
  }
  const tmp=path.join(folder,hash(item.path)+'-'+crypto.randomUUID()),output=tmp+'.ico',preview=tmp+'.png';
  try{
   if(!arabicTitle&&label.arabic(remote.titleArabic))arabicTitle=remote.titleArabic;
   if(!arabicTitle&&label.arabic(lookup))arabicTitle=label.folderTitle(lookup);
   if(!arabicTitle&&remote.titleArabic===undefined)try{stats.phase='البحث عن الاسم العربي الموثوق';const named=await resolver.resolve(item,{parent,posterNeeded:false,logoNeeded:false,titleNeeded:true});if(label.arabic(named.titleArabic))arabicTitle=named.titleArabic;}catch{}
   if(closed)return;
   if(!arabicTitle&&translateTitle){stats.phase='ترجمة معنى الاسم إلى العربية';try{const translated=await translateTitle({title:label.folderTitle(lookup),kind:parent?'series':item.type});if(!label.arabic(translated?.text))throw Error('لم تصل ترجمة عربية صالحة');arabicTitle=translated.text;event('تُرجم اسم الأيقونة: '+label.folderTitle(lookup)+' ← '+arabicTitle);}catch(error){throw Error('تعذرت ترجمة اسم الأيقونة؛ أُجّل إنشاؤها: '+error.message);}}
   if(closed)return;
   const title=arabicTitle||lookup;
   stats.phase='تصميم الأيقونة وكتابة العنوان';await renderer({poster,output,preview,title,preferArabic:!!arabicTitle,season:parent?label.season(path.basename(item.path)):''});if(closed)return;
   stats.phase='حفظ الأيقونة وإعداد عرض المجلد';const backupDir=path.join(dir,'folder-icon-originals');if(replace)fs.mkdirSync(backupDir,{recursive:true});const installed=await io.install(item.path,output,{replace,backupDir});if(installed.status==='existing'){stats.skipped++;return;}if(installed.status!=='created')throw Error(installed.code||'WRITE_FAILED');
   stats.created++;stats.updatedIds=[...new Set([...stats.updatedIds,item.id])].slice(-200);await onCreated(item);event((replace?'أعيد تجهيز أيقونة المجلد بالعربية: ':'تم إنشاء أيقونة المجلد: ')+item.name+(parent?' — '+path.basename(item.path):''));
   if(installed.datesReady===false)event('حُفظت الأيقونة؛ تعذر ضبط تاريخ تعديل المجلد والصور: '+item.name,'warning');
   if(installed.explorerReady===false)event('حُفظت الأيقونة؛ تعذر تفعيل عرضها في ويندوز: '+item.name,'warning');
  }finally{for(const f of [output,preview])try{fs.unlinkSync(f);}catch{}}
 }
 async function pump(){if(running||closed)return;running=true;stats.status='running';
  try{while((queue.length||deferred.size)&&!closed){while(queue.length<maxQueue&&deferred.size){const entry=deferred.entries().next().value;deferred.delete(entry[0]);queue.push(entry[1]);}const job=queue.shift(),item=getItem(job.id);stats.currentItem=item?.name||job.id;
   try{const replace=replacements.delete(job.key);await prepare(job.id,replace);checked.set(job.key,Date.now()+30*60000);}catch(e){stats.failed++;checked.set(job.key,Date.now()+5*60000);const reasons={NO_CONFIRMED_POSTER:'لا توجد صورة محلية أو مطابقة مؤكدة في TMDB',POSTER_UNAVAILABLE:'تعذر جلب البوستر',FOLDER_UNAVAILABLE:'تعذر الوصول إلى المجلد',EACCES:'لا توجد صلاحية كتابة',EPERM:'لا توجد صلاحية كتابة',TIMEOUT:'انتهت مهلة المسار الشبكي'};event('تعذر إنشاء أيقونة '+stats.currentItem+': '+(reasons[e.message]||(e.message.startsWith('تعذرت ترجمة اسم الأيقونة')?e.message:'تعذر تجهيز الصورة أو حفظ الأيقونة ('+e.message+')')),'warning');}
   finally{occupied.delete(job.key);stats.processed++;if(replacements.has(job.key)&&!closed){queue.push(job);occupied.add(job.key);stats.total++;}}if(delayMs&&!closed)await new Promise(r=>setTimeout(r,delayMs));
  }}finally{running=false;stats.currentItem='';stats.phase='';stats.status=closed?'stopped':stats.failed?'partial':'completed';if(!closed)event('انتهى تجهيز الأيقونات: '+stats.created+' جديدة، '+stats.skipped+' موجودة أو مستبعدة، '+stats.failed+' تعذر',stats.failed?'warning':'success');}
 }
 function enqueue(ids,{retry=false,replace=false}={}){
  if(closed)return;let added=0;for(const id of ids){const item=getItem(id);if(!supported(item))continue;const key=pathKey(item.path);if(replace)replacements.add(key);if(occupied.has(key)||(!retry&&!replace&&Date.now()<(checked.get(key)||0)))continue;
   if(!running&&!queue.length){Object.assign(stats,{status:'queued',runId:crypto.randomUUID(),total:0,processed:0,created:0,updatedIds:[],postersSaved:0,skipped:0,failed:0,phase:''});}
   if(queue.length<maxQueue)queue.push({id,key});else deferred.set(key,{id,key});occupied.add(key);stats.total++;added++;
  }
  if(checked.size>20000){const now=Date.now();for(const [key,until]of checked)if(until<now)checked.delete(key);}
  if(added&&!running&&!timer){event('بدأ تجهيز الصور والأيقونات؛ يظهر التقدم في هذا السجل');timer=setTimeout(()=>{timer=null;pump();},delayMs);}
 }
 const status=()=>({...stats,queued:queue.length+deferred.size,running});
 return {enqueue,status,adminReads:new Set(['folderIconStatus']),admin(action){if(action==='folderIconStatus')return {body:{msg:'ok',stats:status(),events:readEvents().filter(e=>e.utype==='artwork').slice(-100)}};},idle:async()=>{while(running||timer||queue.length||deferred.size)await new Promise(r=>setTimeout(r,20));},async close(){closed=true;queue.length=0;deferred.clear();occupied.clear();replacements.clear();clearTimeout(timer);timer=null;activeChild?.kill();resolver.close?.();while(running)await new Promise(r=>setTimeout(r,20));}};
};
module.exports.supported=supported;
