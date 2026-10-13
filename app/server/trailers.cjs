'use strict';
const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
const MAX=200*1024*1024,active=j=>['queued','running'].includes(j.status);
const fail=(message,status=400)=>Object.assign(Error(message),{status});
function execute(exe,args,{signal,onLine=()=>{},cwd}={}){
 return new Promise((resolve,reject)=>{
  const child=spawn(exe,args,{cwd,windowsHide:true,shell:false,stdio:['ignore','pipe','pipe']});
  let output='',tail='',stopping=false,timer;
  const stop=()=>{if(stopping)return;stopping=true;if(process.platform==='win32'&&child.pid){const killer=spawn(path.join(process.env.SystemRoot||'C:\\Windows','System32','taskkill.exe'),['/PID',String(child.pid),'/T','/F'],{windowsHide:true,stdio:'ignore'});killer.on('error',()=>child.kill());}else child.kill('SIGKILL');};
  signal?.addEventListener('abort',stop,{once:true});if(signal?.aborted)stop();
  timer=setTimeout(stop,300000);
  child.stdout.on('data',chunk=>{output+=chunk;if(output.length>4*1024*1024)stop();tail+=chunk;const rows=tail.split(/\r?\n/);tail=rows.pop();for(const row of rows)onLine(row);});
  let stderr='';child.stderr.on('data',b=>{stderr=(stderr+b).slice(-8000);});
  child.once('error',()=>{clearTimeout(timer);signal?.removeEventListener('abort',stop);reject(fail('تعذر تشغيل أداة تنزيل الإعلان',503));});
  child.once('close',code=>{clearTimeout(timer);signal?.removeEventListener('abort',stop);if(signal?.aborted)return reject(fail('أُوقف تنزيل الإعلان'));if(stopping)return reject(fail('انتهت مهلة تنزيل الإعلان؛ أعد المحاولة لاحقًا'));if(code!==0){const reason=/sign in|bot|login|cookies/i.test(stderr)?'طلب YouTube التحقق من الوصول؛ لم يتم تنزيل الإعلان':/unavailable|private|removed|not available/i.test(stderr)?'الإعلان غير متاح على YouTube':/403|429|timed out|network|connection/i.test(stderr)?'تعذر الاتصال بمصدر الإعلان أو رفض المصدر الطلب':'فشلت أداة تنزيل الإعلان (رمز '+code+')';return reject(fail(reason));}resolve(output);});
 });
}
function resolveTools(base,{toolsDir='C:/Tools',isFile=file=>{try{return fs.statSync(file).isFile();}catch{return false;}}}={}){
 const choose=(...files)=>files.find(isFile)||'';
 return {exe:choose(path.join(base,'runtime','yt-dlp','yt-dlp.exe'),path.join(toolsDir,'yt-dlp.exe')),ffmpeg:choose(path.join(base,'runtime','ffmpeg','ffmpeg.exe'),path.join(toolsDir,'ffmpeg.exe')),node:choose(path.join(base,'runtime','node.exe'))};
}
module.exports=function({base,getItem,getKey,onEvent=()=>{},request,runTool=execute}){
 const jobs=[],queue=[],controllers=new Map(),root=path.resolve(base,'data','trailer-staging');
 let running=false,closed=false;
 const ready=()=>Object.values(resolveTools(base)).every(Boolean);
 const publicJobs=()=>jobs.map(({folder,...j})=>({...j}));
 function check(job){if(closed||job.cancelled||controllers.get(job.id)?.signal.aborted)throw fail('أُوقف تنزيل الإعلان');}
 async function api(route,language,job,params={}){
  check(job);const signal=controllers.get(job.id).signal;
  if(request)return request(route,{language,...params},{signal});
  const u=new URL('https://api.themoviedb.org/3/'+route);u.searchParams.set('api_key',getKey());u.searchParams.set('language',language);for(const [k,v]of Object.entries(params))u.searchParams.set(k,v);
  try{const response=await fetch(u,{signal:AbortSignal.any([signal,AbortSignal.timeout(20000)])});if(!response.ok)throw fail('تعذر جلب الإعلان من TMDB (رمز '+response.status+')');return await response.json();}catch(e){if(e.status)throw e;throw fail('تعذر الاتصال بخدمة بيانات الإعلان');}
 }
 async function videoFor(item,job){
  let kind=/^series/.test(require('./public-catalog.cjs').publicType(item.type))?'tv':'movie';
  let content={};try{content=JSON.parse(item.content?.contentJSON||'{}');}catch{}
  let id=['movie','tv'].includes(content.tmdbType)&&/^\d+$/.test(String(content.content_id))?Number(content.content_id):0;if(id)kind=content.tmdbType;
  if(!id){const title=require('./metadata.cjs').cleanTitle(item.name),normal=require('./metadata-titles.cjs').normalize,year=/\b(19\d{2}|20\d{2})\b/.exec(item.name)?.[0];const result=await api('search/'+kind,'en-US',job,{query:title,include_adult:'false'});let matches=(result.results||[]).filter(r=>[r.title,r.name,r.original_title,r.original_name].some(n=>n&&normal(n)===normal(title))&&(!year||String(r.release_date||r.first_air_date||'').startsWith(year)));if(!matches.length&&year){const other=kind==='movie'?'tv':'movie';const fallback=await api('search/'+other,'en-US',job,{query:title,include_adult:'false'});const alternate=(fallback.results||[]).filter(r=>[r.title,r.name,r.original_title,r.original_name].some(n=>n&&normal(n)===normal(title))&&String(r.release_date||r.first_air_date||'').startsWith(year));if(alternate.length===1){matches=alternate;kind=other;}}if(matches.length!==1)throw fail('لم يُحدد العمل بدقة؛ زامن بيانات العنصر أولًا ثم أعد تحميل الإعلان');id=matches[0].id;}
  const videos=[];for(const language of ['ar-SA','en-US']){const result=await api(kind+'/'+id+'/videos',language,job);for(const row of result.results||[])if(row.site==='YouTube'&&row.type==='Trailer'&&/^[\w-]{11}$/.test(row.key))videos.push({...row,arabic:language==='ar-SA'});}
  const selected=videos.sort((a,b)=>Number(!!b.official)-Number(!!a.official)||Number(b.arabic)-Number(a.arabic))[0];
  if(!selected)throw fail('لا يوجد إعلان متاح لهذا العمل في TMDB');
  return selected.key;
 }
 const existing=async folder=>(await fsp.readdir(folder,{withFileTypes:true})).some(e=>e.isFile()&&/\.(mp4|mkv|webm|mov|avi)$/i.test(e.name)&&/(?:trailer|preview|إعلان|اعلان)/i.test(e.name));
 async function run(job){
  job.status='running';controllers.set(job.id,new AbortController());const signal=controllers.get(job.id).signal;
  const stage=path.join(root,job.id);let temporary,folderStat;
  onEvent('بدء تحميل إعلان: '+job.name,'success');
  try{
   const item=getItem(job.itemId);if(!item)throw fail('العنصر لم يعد موجودًا',404);
   const folder=await fsp.realpath(item.path);if(!(await fsp.stat(folder)).isDirectory())throw fail('تعذر تحديد مجلد الفيلم أو المسلسل');
   if(await existing(folder)){job.status='completed';job.message='الإعلان موجود مسبقًا؛ لم يُستبدل';return;}
   folderStat=await fsp.stat(folder);job.folder=folder;
   const key=await videoFor(item,job);check(job);
   const {exe,ffmpeg,node}=resolveTools(base);if(!exe||!ffmpeg||!node)throw fail('لم تُوجد أدوات الإعلان في runtime أو C:\\Tools',503);
   const common=['--ignore-config','--no-plugin-dirs','--no-cache-dir','--no-remote-components','--no-js-runtimes','--js-runtimes','node:'+node,'--no-playlist','--no-colors','--socket-timeout','20','--retries','2','--ffmpeg-location',path.dirname(ffmpeg)];
   const url='https://www.youtube.com/watch?v='+key;
   job.message='جارٍ فحص الإعلان';
   const info=JSON.parse(await runTool(exe,[...common,'--skip-download','--dump-single-json',url],{signal}));
   check(job);if(info.id!==key||info.is_live||info.live_status==='is_live'||!Number.isFinite(info.duration)||info.duration<=0||info.duration>300)throw fail('لم يُنزّل الإعلان: يجب أن يكون مقطعًا حتى خمس دقائق');
   await fsp.mkdir(stage,{recursive:true});job.message='جارٍ تنزيل الإعلان';job.percent=0;
   await runTool(exe,[...common,'--no-overwrites','--no-mtime','--newline','--progress','--progress-template','download:ZAIN:%(progress._percent_str)s','--max-filesize','200M','--match-filter','duration <= 300 & !is_live','-f','bv*[height<=1080][ext=mp4]+ba[ext=m4a]/b[height<=1080][ext=mp4]','--merge-output-format','mp4','-o',path.join(stage,'trailer.%(ext)s'),url],{signal,cwd:stage,onLine:line=>{const m=/ZAIN:\s*(\d+(?:\.\d+)?)%/.exec(line);if(m)job.percent=Math.max(job.percent,Math.min(99,Math.floor(Number(m[1]))));}});
   check(job);const downloaded=path.join(stage,'trailer.mp4'),stat=await fsp.stat(downloaded);if(!stat.isFile()||stat.size<12||stat.size>MAX)throw fail('حجم الإعلان غير صالح أو يتجاوز 200 ميجابايت');
   const handle=await fsp.open(downloaded,'r');const header=Buffer.alloc(12);try{await handle.read(header,0,12,0);}finally{await handle.close();}if(header.toString('ascii',4,8)!=='ftyp')throw fail('ملف الإعلان الناتج ليس MP4 صالحًا');
   if(await existing(folder)){job.status='completed';job.message='حُفظ إعلان آخر أثناء التنزيل؛ لم يُستبدل';return;}
   const title=require('./metadata.cjs').cleanTitle(item.name).replace(/[<>:"/\\|?*\x00-\x1f]/g,' ').replace(/[ .]+$/,'').slice(0,100)||'المحتوى';
   const destination=path.join(folder,'إعلان - '+title+'.mp4');
   temporary=path.join(folder,'.zain-trailer-'+job.id+'.tmp');
   job.message='جارٍ حفظ الإعلان داخل المجلد';
   await fsp.copyFile(downloaded,temporary,fs.constants.COPYFILE_EXCL);check(job);
   // Publish exclusively: an existing trailer is never overwritten.
   try{await fsp.link(temporary,destination);}catch(e){if(e.code==='EEXIST')throw fail('يوجد إعلان بهذا الاسم؛ لم يُستبدل');if(!['EPERM','ENOTSUP','EOPNOTSUPP','EXDEV'].includes(e.code))throw e;await fsp.copyFile(temporary,destination,fs.constants.COPYFILE_EXCL);}
   job.status='completed';job.percent=100;job.message='اكتمل حفظ الإعلان داخل مجلد المحتوى';job.fileName=path.basename(destination);job.bytes=stat.size;
  }catch(e){job.status=job.cancelled||closed?'cancelled':'failed';job.message=e.status?e.message:({ENOENT:'مجلد المحتوى أو ملف الإعلان غير متاح',EACCES:'لا توجد صلاحية لحفظ الإعلان في المجلد',EPERM:'تعذر الكتابة داخل مجلد المحتوى',ENOSPC:'المساحة غير كافية لحفظ الإعلان'}[e.code]||'تعذر تجهيز الإعلان؛ لم يُستبدل المحتوى الموجود');}
  finally{
   if(temporary)await fsp.unlink(temporary).catch(()=>{});
   // Only this job's UUID directory may be removed.
   if(path.dirname(path.resolve(stage))===root&&path.basename(stage)===job.id)await fsp.rm(stage,{recursive:true,force:true}).catch(()=>{});
   if(folderStat&&job.folder)await fsp.utimes(job.folder,folderStat.atime,folderStat.mtime).catch(()=>{});
   controllers.delete(job.id);job.finishedAt=new Date().toISOString();onEvent(job.name+': '+job.message,job.status==='completed'?'success':'warning');
  }
 }
 async function pump(){if(running)return;running=true;try{while(queue.length&&!closed){const job=queue.shift();if(!job.cancelled)await run(job);}}finally{running=false;}}
 function cancel(j){if(j&&active(j)){j.cancelled=true;controllers.get(j.id)?.abort();if(j.status==='queued'){j.status='cancelled';j.message='أُوقف تنزيل الإعلان';}}}
 return {adminReads:new Set(['trailerStatus']),adminActions:new Set(['downloadTrailer','cancelTrailer']),
  async admin(action,args,body,method){
   if(action==='trailerStatus')return {body:{jobs:publicJobs(),available:ready()}};
   if(method!=='POST')throw fail('طريقة الطلب غير صالحة',405);
   if(action==='cancelTrailer'){cancel(jobs.find(j=>j.id===body.id));return {body:{msg:'ok'}};}
   if(action!=='downloadTrailer')return;
   if(closed)throw fail('خدمة الإعلان متوقفة',503);if(!ready())throw fail('لم تُوجد أداة yt-dlp أو FFmpeg في runtime أو C:\\Tools',503);if(!getKey())throw fail('أدخل مفتاح TMDB لجلب إعلان العمل',422);
   const item=getItem(String(body.id||''));if(!require('./metadata.cjs').supportsMetadata(item))throw fail('اختر فيلمًا أو مسلسلًا',400);
   const pending=jobs.find(j=>active(j)&&(j.itemId===item.id||j.folder===path.resolve(item.path)));if(pending)return {body:{msg:'ok',jobId:pending.id}};
   if(jobs.filter(active).length>=20)throw fail('انتظر اكتمال بعض مهام تحميل الإعلانات',409);
   const job={id:crypto.randomUUID(),itemId:item.id,name:item.name,folder:path.resolve(item.path),status:'queued',message:'الإعلان في انتظار التنزيل',percent:0};jobs.push(job);while(jobs.length>50&&!active(jobs[0]))jobs.shift();queue.push(job);onEvent('أضيف إعلان إلى قائمة التنزيل: '+item.name,'success');setImmediate(pump);return {body:{msg:'ok',jobId:job.id}};
  },
  isBusy:()=>jobs.some(active),jobs:publicJobs,
  idle:async()=>{while(running||queue.length)await new Promise(r=>setTimeout(r,20));},
  close:async()=>{closed=true;jobs.forEach(cancel);queue.length=0;while(running)await new Promise(r=>setTimeout(r,20));}
 };
};
module.exports.execute=execute;


module.exports.resolveTools=resolveTools;
