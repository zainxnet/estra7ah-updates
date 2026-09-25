'use strict';
const crypto=require('node:crypto');
function hasContent(item){try{const c=JSON.parse(item.content?.contentJSON||'{}');return Boolean(c.descArabic||c.descEnglish||c.content_id||c.Runtime||c.ReleaseDate);}catch{return false;}}
function addedAt(item){for(const value of [item.addedAt,item.createdAt]){if(value===undefined||value===null||value==='')continue;const number=Number(value);if(Number.isFinite(number)&&number>0)return number<1e12?number*1000:number;const date=Date.parse(value);if(Number.isFinite(date))return date;}return 0;}
function newestFirst(rows){return rows.map((item,index)=>({item,index})).sort((a,b)=>addedAt(b.item)-addedAt(a.item)||b.index-a.index).map(entry=>entry.item);}
module.exports=function({settingsDir,items,getKey,saveContent,savePoster,saveActors,hasArtwork,getLookupName,getCanonicalId=id=>id,getRelatedIds=id=>[id],getCandidateIds=()=>items.keys(),request,translateDescription,canTranslateDescription,onEvent=()=>{},concurrency=3,requestIntervalMs=100,retryDelayMs=1000}){
 const fs=require('node:fs'),path=require('node:path'),settingsFile=settingsDir&&path.join(settingsDir,'metadata-settings.json');
 let automaticEnabled=true;
 if(settingsFile&&fs.existsSync(settingsFile))automaticEnabled=JSON.parse(fs.readFileSync(settingsFile,'utf8')).automaticEnabled!==false;
 function setAutomatic(enabled){if(typeof enabled!=='boolean')throw fail('قيمة الخيار غير صالحة');if(settingsFile){fs.mkdirSync(settingsDir,{recursive:true});fs.writeFileSync(settingsFile+'.tmp',JSON.stringify({automaticEnabled:enabled}));fs.renameSync(settingsFile+'.tmp',settingsFile);}automaticEnabled=enabled;if(!enabled)jobs.filter(j=>j.automatic).forEach(cancel);return {body:{msg:'ok',automaticEnabled}};}
 const jobs=[],queue=[],controllers=new Map();const workers=Math.max(1,Math.min(3,Number(concurrency)||3));
 let running=false,closed=false,nextRequestAt=0,cooldownUntil=0,requestGate=Promise.resolve();
 const mediaType=type=>require('./public-catalog.cjs').publicType(type);
 const supported=item=>require('./catalog-items.cjs').visible(item)&&(['movie','series'].includes(mediaType(item.type))||/^series\./.test(mediaType(item.type)))&&(!item.inItem||item.inItem==='null');
 const canonicalId=id=>getCanonicalId(id)??id;
 const relatedIds=id=>[...new Set([id,...(getRelatedIds(id)||[])])];
 const alreadySynced=item=>hasContent(item)||relatedIds(item.id).some(id=>{const related=items.get(id);return related&&hasContent(related);});
 function newestSharedFirst(rows){return rows.map((item,index)=>({item,index,added:relatedIds(item.id).reduce((latest,id)=>{const related=id===item.id?item:items.get(id);return related?Math.max(latest,addedAt(related)):latest;},addedAt(item))})).sort((a,b)=>b.added-a.added||b.index-a.index).map(entry=>entry.item);}
 const fail=(message,status=400)=>Object.assign(Error(message),{status});
 const normal=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 const isArabic=value=>{if(typeof value!=='string')return false;const letters=value.match(/\p{L}/gu)||[];return letters.length>0&&letters.filter(c=>/\p{Script=Arabic}/u.test(c)).length/letters.length>=.3;};
 const cancelled=()=>Object.assign(Error('أوقفت مزامنة البيانات'),{code:'CANCELLED'});
 function check(job){if(closed||job.cancelled||job.status==='interrupted'||controllers.get(job.id)?.signal.aborted)throw cancelled();}
 function pause(ms,signal){if(signal?.aborted)return Promise.reject(cancelled());return new Promise((resolve,reject)=>{const finish=error=>{clearTimeout(timer);signal?.removeEventListener('abort',abort);error?reject(error):resolve();};const abort=()=>finish(cancelled());const timer=setTimeout(()=>finish(),Math.max(0,ms));signal?.addEventListener('abort',abort,{once:true});});}
 async function admit(job){const gate=requestGate.then(async()=>{check(job);while(Math.max(nextRequestAt,cooldownUntil)>Date.now())await pause(Math.max(nextRequestAt,cooldownUntil)-Date.now(),controllers.get(job.id)?.signal);check(job);nextRequestAt=Date.now()+Math.max(0,requestIntervalMs);});requestGate=gate.catch(()=>{});return gate;}
 async function api(route,params,job){
  for(let attempt=0;;attempt++){
   await admit(job);
   try{
    let result;
    if(request)result=await request(route,params,{signal:controllers.get(job.id)?.signal});
    else{
     const key=getKey();if(!key)throw fail('أدخل مفتاح TMDB في التحكم بالعناصر',422);
     const url=new URL('https://api.themoviedb.org/3/'+route);url.searchParams.set('api_key',key);for(const [key,value]of Object.entries(params||{}))url.searchParams.set(key,value);
     let response;try{response=await fetch(url,{signal:AbortSignal.any([controllers.get(job.id).signal,AbortSignal.timeout(15000)])});}catch{check(job);throw fail('تعذر الاتصال بخدمة بيانات المحتوى',503);}
     if(!response.ok){const error=fail(response.status===401?'مفتاح بيانات المحتوى غير صالح':response.status===429?'بلغت خدمة البيانات حد الطلبات؛ ستُستأنف المحاولة تلقائياً':'تعذر جلب بيانات المحتوى',response.status);const retry=response.headers.get('retry-after');if(retry)error.retryAfterMs=/^\d+(?:\.\d+)?$/.test(retry)?Number(retry)*1000:Math.max(0,Date.parse(retry)-Date.now());throw error;}
     result=await response.json();
    }
    check(job);return result;
   }catch(error){check(job);if(attempt>=2||![429,500,502,503,504].includes(error.status))throw error;const delay=Math.max(retryDelayMs*2**attempt,Number(error.retryAfterMs)||0);cooldownUntil=Math.max(cooldownUntil,Date.now()+delay);job.retryAt=new Date(cooldownUntil).toISOString();onEvent((error.status===429?'طلب مزود البيانات تقليل السرعة':'تعذر الاتصال مؤقتاً بمزود البيانات')+'؛ إعادة المحاولة بعد '+Math.ceil(delay/1000)+' ثانية','warning');}
  }
 }
 async function fillDescription(data,existing,arabicOverview,item,job){
  if(isArabic(existing.descArabic)){data.descArabic=existing.descArabic;if(existing.descriptionTranslation)data.descriptionTranslation=existing.descriptionTranslation;else delete data.descriptionTranslation;return;}
  delete data.descriptionTranslation;data.descArabic=isArabic(arabicOverview)?arabicOverview:'';
  const source=typeof data.descEnglish==='string'?data.descEnglish.trim():'';if(data.descArabic||!source||typeof translateDescription!=='function')return;
  try{if(typeof canTranslateDescription==='function'&&!canTranslateDescription())return;check(job);const result=await translateDescription({text:source,title:item.name});check(job);if(!isArabic(result?.text))throw Error('Invalid Arabic translation');data.descArabic=result.text.trim();data.descriptionTranslation={provider:typeof result.provider==='string'&&result.provider?result.provider:'Gemini',sourceHash:crypto.createHash('sha256').update(source).digest('hex')};onEvent('تمت ترجمة وصف المحتوى إلى العربية: '+item.name,'success');}
  catch(error){if(error.code==='CANCELLED')throw error;job.warnings++;onEvent('تعذرت ترجمة الوصف إلى العربية: '+item.name+'؛ احتُفظ بالوصف الإنجليزي وبقية البيانات، ويمكن إعادة المزامنة لاحقًا','warning');}
 }
 function notifyRelated(job,key,item){job[key]=[...new Set([...job[key],...relatedIds(item.id)])].slice(-200);}
 function posterReady(job,item){notifyRelated(job,'posterReadyIds',item);}
 function saved(job,item){job.completed++;notifyRelated(job,'completedIds',item);onEvent('تم حفظ بيانات: '+item.name,'success');}
 async function sync(item,job){
  check(job);
  // A local poster is not evidence that the film or series metadata was synchronized.
  if(job.onlyMissing&&alreadySynced(item)){job.skipped++;return;}
  let existing={};try{existing=JSON.parse(item.content?.contentJSON||'{}')||{};}catch{}
  const lookupName=getLookupName?getLookupName(item):item.name;
  const kind=mediaType(item.type)==='series'||/^series\./.test(mediaType(item.type))||/\bS\d{1,3}(?:E\d{1,3})?\b/i.test(lookupName)?'tv':'movie';
  const year=/\b(19\d{2}|20\d{2})\b/.exec(lookupName)?.[0],query=cleanTitle(lookupName),params={query,language:'en-US',include_adult:'false'};if(year&&kind==='movie')params.year=year;
  const known=!getLookupName&&existing.tmdbType===kind&&/^\d+$/.test(String(existing.content_id));
  const found=known?{results:[{id:Number(existing.content_id),title:query}]}:await api('search/'+kind,params,job);
  const exact=[...new Map((found.results||[]).filter(row=>[row.title,row.original_title,row.name,row.original_name].some(name=>normal(name)===normal(query))&&(known||kind!=='movie'||!year||!row.release_date||row.release_date.startsWith(year))).map(row=>[row.id,row])).values()];
  if(!exact.length)throw fail('لم توجد نتيجة مطابقة لاسم المجلد: '+lookupName,404);
  if(exact.length>1)onEvent('مطابقة تلقائية باسم المجلد '+lookupName+': اختيرت أول نتيجة مطابقة في TMDB (رقم '+exact[0].id+') من '+exact.length+' نتائج','warning');
  const id=exact[0].id;
  const [en,ar]=await Promise.all([api(kind+'/'+id,{language:'en-US',append_to_response:'credits'},job),api(kind+'/'+id,{language:'ar-SA'},job)]);
  const data={...existing,descArabic:'',descEnglish:en.overview||existing.descEnglish||'',content_id:String(id),Runtime:String(en.runtime||en.episode_run_time?.[0]||''),ReleaseDate:en.release_date||en.first_air_date||'',castEnglish:(en.credits?.cast||[]).slice(0,20).map(actor=>actor.name),directedByEnglish:(en.credits?.crew||[]).filter(actor=>actor.job==='Director').map(actor=>actor.name),tagsArabic:(ar.genres||[]).map(genre=>genre.name),imdbRating:String(en.vote_average||0),imdbVotes:String(en.vote_count||0),tmdbType:kind};
  if(en.poster_path)data.poster_path=en.poster_path;
  await fillDescription(data,existing,ar.overview,item,job);check(job);
  await saveContent(item.id,{...item.content,contentJSON:JSON.stringify(data),imdb_ratings:en.vote_average||0,year:parseInt(data.ReleaseDate)||0});saved(job,item);
  // Publish metadata first: slow/offline shares and cast pictures cannot delay its visibility.
  await Promise.all([
   (async()=>{if(!savePoster)return;try{check(job);const local=hasArtwork?await hasArtwork(item):false;check(job);if(local){posterReady(job,item);return;}if(!en.poster_path){job.warnings++;onEvent('لا توجد صورة متاحة في TMDB: '+item.name,'warning');return;}const result=await savePoster(item.id,en.poster_path);check(job);posterReady(job,item);job.posters++;if(result?.status==='failed'){job.warnings++;onEvent('الصورة محفوظة مؤقتاً؛ تعذر الحفظ داخل مجلد '+item.name,'warning');}else onEvent('تم حفظ صورة داخل مجلد: '+item.name,'success');}catch(error){if(error.code!=='CANCELLED'){job.warnings++;onEvent('تعذر حفظ صورة '+item.name+'؛ بقيت بيانات المحتوى محفوظة','warning');}}})(),
   (async()=>{if(!saveActors)return;try{check(job);const result=await saveActors((en.credits?.cast||[]).slice(0,20),{signal:controllers.get(job.id)?.signal});check(job);onEvent('صور الممثلين في '+item.name+': '+result.saved+' جديدة، '+result.reused+' محفوظة سابقاً، '+result.failed+' تعذر',result.failed?'warning':'success');}catch(error){if(error.code!=='CANCELLED'){job.warnings++;onEvent('تعذر مزامنة صور الممثلين: '+item.name,'warning');}}})()
  ]);
 }
 async function run(job){
  job.status='running';job.startedAt=new Date().toISOString();controllers.set(job.id,new AbortController());onEvent('بدء مزامنة بيانات '+job.total+' عنصر، الأحدث أولاً، حتى '+workers+' عناصر بالتوازي','success');let cursor=0;
  async function worker(){while(cursor<job.ids.length&&!closed&&!job.cancelled&&job.status==='running'){
   const id=canonicalId(job.ids[cursor++]),item=items.get(id);job.activeItems.push({id,name:item?.name||id});job.currentItem=item?.name||id;onEvent('جارٍ جلب بيانات: '+(item?.name||id),'success');
   try{if(!item)throw fail('العنصر حذف',404);await sync(item,job);}
   catch(error){if(error.code!=='CANCELLED'){job.failed++;job.errors.push({id,name:item?.name,error:error.message,...(error.matches?.length?{matches:error.matches}:{})});if(job.errors.length>100)job.errors.shift();onEvent('تعذر جلب بيانات '+(item?.name||id)+': '+error.message,'warning');if([401,403,429,503].includes(error.status)){job.status='interrupted';job.message=error.message;controllers.get(job.id)?.abort();}}}
   finally{job.processed++;job.activeItems=job.activeItems.filter(entry=>entry.id!==id);}
  }}
  await Promise.all(Array.from({length:Math.min(workers,job.total)},worker));controllers.delete(job.id);delete job.retryAt;
  if(job.status==='running')job.status=job.cancelled||closed?'cancelled':job.failed||job.warnings?'partial':'completed';job.finishedAt=new Date().toISOString();job.currentItem='';
  onEvent('انتهاء مزامنة البيانات: '+job.completed+' محفوظ، '+job.skipped+' مزامن سابقاً، '+job.failed+' تعذر، من '+job.total+' — '+job.status,job.failed||job.warnings?'warning':'success');
 }
 async function pump(){if(running)return;running=true;try{while(queue.length&&!closed){const job=queue.shift();if(job.cancelled)continue;await run(job);}}finally{running=false;}}
 function enqueue(ids,{onlyMissing=false,automatic=false}={}){
  if(automatic&&(!automaticEnabled||closed||!getKey()))return;if(closed)throw fail('الخدمة متوقفة',503);if(!getKey())throw fail('أدخل مفتاح TMDB في صفحة التحكم بالعناصر',422);
  if(!automatic&&(queue.length||jobs.some(job=>job.status==='running')))throw fail('انتظر اكتمال عملية جلب البيانات الحالية',409);
  const occupied=new Set(jobs.filter(job=>['running','queued'].includes(job.status)).flatMap(job=>job.ids).map(canonicalId));
  const unique=newestSharedFirst([...new Set(ids.map(canonicalId))].map(id=>items.get(id)).filter(item=>item&&supported(item)&&!occupied.has(canonicalId(item.id))&&(!onlyMissing||!alreadySynced(item)))).map(item=>item.id);
  if(!unique.length&&automatic)return;
  const waiting=automatic&&queue.find(job=>job.automatic&&!job.cancelled);if(waiting){waiting.ids=newestSharedFirst([...new Set([...waiting.ids,...unique].map(canonicalId))].map(id=>items.get(id)).filter(Boolean)).map(item=>item.id);waiting.total=waiting.ids.length;return;}
  if(!unique.length)throw fail(onlyMissing?'لا توجد عناصر غير مزامنة':'لا توجد عناصر أفلام أو مسلسلات مطابقة',404);
  const job={id:crypto.randomUUID(),ids:unique,total:unique.length,processed:0,completed:0,failed:0,skipped:0,posters:0,warnings:0,completedIds:[],posterReadyIds:[],activeItems:[],concurrency:workers,onlyMissing,automatic,errors:[],status:'queued',createdAt:new Date().toISOString()};jobs.push(job);while(jobs.length>20&&!['running','queued'].includes(jobs[0].status))jobs.shift();queue.push(job);onEvent('أضيفت مهمة مزامنة بيانات '+job.total+' عنصر إلى الخلفية','success');setImmediate(pump);return {body:{msg:'ok',jobId:job.id,total:job.total}};
 }
 function cancel(job){if(!job||!['queued','running'].includes(job.status))return;job.cancelled=true;controllers.get(job.id)?.abort();if(job.status==='queued'){job.status='cancelled';job.finishedAt=new Date().toISOString();}}
 const publicJobs=()=>jobs.map(({ids,...job})=>structuredClone(job));
 return {jobs:publicJobs,hasContent,enqueueMissing:ids=>enqueue(ids,{onlyMissing:true,automatic:true}),adminReads:new Set(['metadataStatus']),adminActions:new Set(['getContentAndSaveIt','getContentAndSaveItAll','startDownloadItemsData','cancelMetadata','setAutomaticMetadata','cancelAllMetadata']),async admin(action,args,body,method){if(action==='metadataStatus')return {body:{jobs:publicJobs(),automaticEnabled}};if(action==='setAutomaticMetadata'){if(method!=='POST')throw fail('طريقة الطلب غير صالحة',405);return setAutomatic(body.enabled);}if(action==='cancelAllMetadata'){if(method!=='POST')throw fail('طريقة الطلب غير صالحة',405);jobs.forEach(cancel);return {body:{msg:'ok'}};}if(action==='cancelMetadata'){cancel(jobs.find(job=>job.id===args[0]));return {body:{msg:'ok'}};}if(action==='getContentAndSaveIt')return enqueue([args.at(-2)]);if(action==='getContentAndSaveItAll'){if(method!=='POST')throw fail('طريقة الطلب غير صالحة',405);return enqueue(String(body.ids||'').split(','));}if(action==='startDownloadItemsData')return enqueue([...getCandidateIds()],{onlyMissing:true});},idle:async()=>{while(queue.length||running)await new Promise(resolve=>setTimeout(resolve,20));},close:()=>{closed=true;jobs.forEach(cancel);queue.length=0;}};
};
module.exports.hasContent=hasContent;module.exports.addedAt=addedAt;module.exports.newestFirst=newestFirst;
function cleanTitle(name){return String(name||'').replace(/\b(?:19\d{2}|20\d{2})\b/g,'').replace(/\bS\d{1,2}(?:E\d{1,3})?\b/gi,'').replace(/\b(?:480p|720p|1080p|2160p|4k|webrip|web[ ._-]?dl|bluray|brrip|dvdrip|x264|x265|hevc)\b.*$/i,'').replace(/[()._\[\]]/g,' ').replace(/\s+/g,' ').replace(/^[\s-]+|[\s-]+$/g,'');}
module.exports.cleanTitle=cleanTitle;
