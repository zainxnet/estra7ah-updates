'use strict';
const crypto=require('node:crypto');
function hasContent(item){try{const c=JSON.parse(item.content?.contentJSON||'{}');return Boolean(c.descArabic||c.descEnglish||c.content_id||c.Runtime||c.ReleaseDate);}catch{return false;}}
module.exports=function({items,getKey,saveContent,savePoster,saveActors,hasArtwork,getLookupName,request,translateDescription,canTranslateDescription,onEvent=()=>{}}){
 const jobs=[],queue=[];let running=false,closed=false;
 const supported=i=>['movie','series','tv','film'].includes(i.type)&&(!i.inItem||i.inItem==='null');
 const fail=(message,status=400)=>Object.assign(Error(message),{status});
 const normal=s=>String(s||'').normalize('NFKC').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
 async function api(route,params={}){if(request)return request(route,params);const key=getKey();if(!key)throw fail('أدخل مفتاح TMDB في التحكم بالعناصر',422);const url=new URL('https://api.themoviedb.org/3/'+route);url.searchParams.set('api_key',key);for(const [k,v]of Object.entries(params))url.searchParams.set(k,v);let r;try{r=await fetch(url,{signal:AbortSignal.timeout(15000)});}catch{throw fail('تعذر الاتصال بخدمة بيانات المحتوى',503);}if(!r.ok)throw fail(r.status===401?'مفتاح بيانات المحتوى غير صالح':r.status===429?'بلغت خدمة البيانات حد الطلبات؛ أعد المحاولة لاحقاً':'تعذر جلب بيانات المحتوى',r.status);return r.json();}
 const isArabic=value=>{if(typeof value!=='string')return false;const letters=value.match(/\p{L}/gu)||[];return letters.length>0&&letters.filter(c=>/\p{Script=Arabic}/u.test(c)).length/letters.length>=.3;};
 async function fillDescription(data,existing,arabicOverview,item,job){
  if(isArabic(existing.descArabic)){
   data.descArabic=existing.descArabic;
   if(existing.descriptionTranslation)data.descriptionTranslation=existing.descriptionTranslation;else delete data.descriptionTranslation;
   return false;
  }
  delete data.descriptionTranslation;
  data.descArabic=isArabic(arabicOverview)?arabicOverview:'';
  const source=typeof data.descEnglish==='string'?data.descEnglish.trim():'';
  if(data.descArabic||!source||typeof translateDescription!=='function')return false;
  try{
   if(typeof canTranslateDescription==='function'&&!canTranslateDescription())return false;
   const result=await translateDescription({text:source,title:item.name});
   if(!isArabic(result?.text))throw Error('Invalid Arabic translation');
   data.descArabic=result.text.trim();
   data.descriptionTranslation={provider:typeof result.provider==='string'&&result.provider?result.provider:'Gemini',sourceHash:crypto.createHash('sha256').update(source).digest('hex')};
   onEvent('تمت ترجمة وصف المحتوى إلى العربية: '+item.name,'success');
   return true;
  }catch{
   job.warnings++;
   onEvent('تعذرت ترجمة الوصف إلى العربية: '+item.name+'؛ احتُفظ بالوصف الإنجليزي وبقية البيانات، ويمكن إعادة المزامنة لاحقًا','warning');
   return false;
  }
 }
 async function sync(item,job){
  let existing={};try{existing=JSON.parse(item.content?.contentJSON||'{}')||{}}catch{}
  const local=hasArtwork?await hasArtwork(item):false;
  if(job.onlyMissing&&(job.automatic||hasContent(item))&&local){
   const translated={...existing};
   if(await fillDescription(translated,existing,'',item,job)){
    saveContent(item.id,{...item.content,contentJSON:JSON.stringify(translated)});
    return;
   }
   job.skipped++;onEvent('تجاوز المجلد لوجود صورة أو أيقونة: '+item.name,'success');return;
  }
  const lookupName=getLookupName?getLookupName(item):item.name;
  const kind=['series','tv'].includes(item.type)||/^(?:series\.)/.test(item.type)||/\bS\d{1,3}(?:E\d{1,3})?\b/i.test(lookupName)?'tv':'movie',year=/\b(19\d{2}|20\d{2})\b/.exec(lookupName)?.[0],query=cleanTitle(lookupName);
  const params={query,language:'en-US',include_adult:'false'};if(year&&kind==='movie')params.year=year;
  const known=!getLookupName&&existing.tmdbType===kind&&/^\d+$/.test(String(existing.content_id));
  const found=known?{results:[{id:Number(existing.content_id),title:query}]}:await api('search/'+kind,params);
  const exact=[...new Map((found.results||[]).filter(r=>[r.title,r.original_title,r.name,r.original_name].some(n=>normal(n)===normal(query))&&(known||kind!=='movie'||!year||!r.release_date||r.release_date.startsWith(year))).map(r=>[r.id,r])).values()];
  if(!exact.length)throw fail('لم توجد نتيجة مطابقة لاسم المجلد: '+lookupName,404);
  if(exact.length>1)onEvent('مطابقة تلقائية باسم المجلد '+lookupName+': اختيرت أول نتيجة مطابقة في TMDB (رقم '+exact[0].id+') من '+exact.length+' نتائج','warning');
  const id=exact[0].id;
  const en=await api(kind+'/'+id,{language:'en-US',append_to_response:'credits'}),ar=await api(kind+'/'+id,{language:'ar-SA'});
  const data={descArabic:'',descEnglish:en.overview||existing.descEnglish||'',content_id:String(id),Runtime:String(en.runtime||en.episode_run_time?.[0]||''),ReleaseDate:en.release_date||en.first_air_date||'',castEnglish:(en.credits?.cast||[]).slice(0,20).map(x=>x.name),directedByEnglish:(en.credits?.crew||[]).filter(x=>x.job==='Director').map(x=>x.name),tagsArabic:(ar.genres||[]).map(x=>x.name),imdbRating:String(en.vote_average||0),imdbVotes:String(en.vote_count||0),tmdbType:kind};
  const contentData=job.onlyMissing&&hasContent(item)?{...existing,tmdbType:kind,content_id:String(id),poster_path:en.poster_path||existing.poster_path,descEnglish:existing.descEnglish||data.descEnglish}:data;
  await fillDescription(contentData,existing,ar.overview,item,job);
  if(savePoster&&!local){
   if(!en.poster_path){job.warnings++;onEvent('لا توجد صورة متاحة في TMDB: '+item.name,'warning');}
   else{try{const result=await savePoster(item.id,en.poster_path);job.posters++;if(result?.status==='failed'){job.warnings++;onEvent('الصورة محفوظة مؤقتاً؛ تعذر الحفظ داخل مجلد '+item.name,'warning');}else onEvent('تم حفظ صورة داخل مجلد: '+item.name,'success');}catch{job.warnings++;onEvent('تعذر حفظ صورة '+item.name+'؛ ستبقى بيانات المحتوى محفوظة','warning');}}
  }
  if(saveActors){try{const result=await saveActors((en.credits?.cast||[]).slice(0,20));onEvent('صور الممثلين: '+result.saved+' جديدة، '+result.reused+' محفوظة سابقاً، '+result.failed+' تعذر',result.failed?'warning':'success');}catch{onEvent('تعذر مزامنة صور الممثلين','warning');}}
  saveContent(item.id,{...item.content,contentJSON:JSON.stringify(contentData),imdb_ratings:en.vote_average||0,year:parseInt(data.ReleaseDate)||0});
 }

 async function pump(){if(running)return;running=true;try{while(queue.length&&!closed){const job=queue.shift();job.status='running';onEvent('بدء مزامنة بيانات '+job.total+' عنصر','success');for(const id of job.ids){if(closed||job.cancelled)break;const item=items.get(id);try{if(!item)throw fail('العنصر حذف');job.currentItem=item.name;onEvent('فحص الصورة داخل مجلد: '+item.name,'success');const before=job.skipped;await sync(item,job);if(before===job.skipped)job.completed++;if(before===job.skipped)onEvent('تم حفظ بيانات: '+item.name,'success');}catch(e){job.failed++;onEvent('تعذر جلب بيانات '+(item?.name||id)+': '+e.message,'warning');job.errors.push({id,name:item?.name,error:e.message,...(e.matches?.length?{matches:e.matches}:{})});if(job.errors.length>100)job.errors.shift();if([401,429,503].includes(e.status)){job.status='interrupted';job.message=e.message;break;}}job.processed++;await new Promise(r=>setTimeout(r,250));}if(job.status==='running')job.status=job.cancelled||closed?'cancelled':job.failed||job.warnings?'partial':'completed';job.finishedAt=new Date().toISOString();onEvent('انتهاء مزامنة البيانات: '+job.completed+' محفوظ، '+job.skipped+' لديه صورة، '+job.failed+' تعذر، من '+job.total+' — '+job.status,job.failed||job.warnings?'warning':'success');}}finally{running=false;}}
 function enqueue(ids,{onlyMissing=false,automatic=false}={}){if(automatic&&(closed||!getKey()))return;if(closed)throw fail('الخدمة متوقفة',503);if(!getKey())throw fail('أدخل مفتاح TMDB في صفحة التحكم بالعناصر',422);if(!automatic&&(queue.length||jobs.some(j=>j.status==='running')))throw fail('انتظر اكتمال عملية جلب البيانات الحالية',409);const occupied=new Set(jobs.filter(j=>['running','queued'].includes(j.status)).flatMap(j=>j.ids));const unique=[...new Set(ids)].filter(id=>supported(items.get(id)||{})&&!occupied.has(id));if(!unique.length&&automatic)return;const waiting=automatic&&queue.find(j=>j.automatic);if(waiting){waiting.ids.push(...unique);waiting.total=waiting.ids.length;return;}if(!unique.length)throw fail('لا توجد عناصر أفلام أو مسلسلات مطابقة',404);const job={id:crypto.randomUUID(),ids:unique,total:unique.length,processed:0,completed:0,failed:0,skipped:0,posters:0,warnings:0,onlyMissing,automatic,errors:[],status:'queued',createdAt:new Date().toISOString()};jobs.push(job);if(jobs.length>20&&!['running','queued'].includes(jobs[0].status))jobs.shift();queue.push(job);onEvent('أضيفت مهمة مزامنة بيانات '+job.total+' عنصر إلى الخلفية','success');setImmediate(pump);return {body:{msg:'ok',jobId:job.id,total:job.total}};}
 const publicJobs=()=>jobs.map(({ids,...j})=>structuredClone(j));
 return {jobs:publicJobs,hasContent,enqueueMissing:ids=>enqueue(ids,{onlyMissing:true,automatic:true}),adminReads:new Set(['metadataStatus']),adminActions:new Set(['getContentAndSaveIt','getContentAndSaveItAll','startDownloadItemsData','cancelMetadata']),async admin(action,args,b,method){if(action==='metadataStatus')return {body:{jobs:publicJobs()}};if(action==='cancelMetadata'){const j=jobs.find(j=>j.id===args[0]);if(j)j.cancelled=true;return {body:{msg:'ok'}};}if(action==='getContentAndSaveIt')return enqueue([args.at(-2)]);if(action==='getContentAndSaveItAll'){if(method!=='POST')throw fail('طريقة الطلب غير صالحة',405);return enqueue(String(b.ids||'').split(','));}if(action==='startDownloadItemsData')return enqueue([...items.values()].filter(i=>supported(i)&&(hasArtwork||!hasContent(i))).map(i=>i.id),{onlyMissing:true});},idle:async()=>{while(queue.length||running)await new Promise(r=>setTimeout(r,20));},close:()=>{closed=true;}};
};
module.exports.hasContent=hasContent;

function cleanTitle(name){return String(name||'').replace(/\b(?:19\d{2}|20\d{2})\b/g,'').replace(/\bS\d{1,2}(?:E\d{1,3})?\b/gi,'').replace(/\b(?:480p|720p|1080p|2160p|4k|webrip|web[ ._-]?dl|bluray|brrip|dvdrip|x264|x265|hevc)\b.*$/i,'').replace(/[()._\[\]]/g,' ').replace(/\s+/g,' ').replace(/^[\s-]+|[\s-]+$/g,'');}
module.exports.cleanTitle=cleanTitle;
