'use strict';
const path=require('node:path'),{fork}=require('node:child_process'),safe=require('./episode-path.cjs');

// Called only for stable files discovered by the automatic Everything monitor.
module.exports=async function({root,events,services,items,byMediaPath,byFilePath,folderOnly=false,updateItems,commit,movieState,stopping=()=>false,onEvent=()=>{},onProgress=()=>{}}){
 onProgress('checking','جارٍ مقارنة الملفات المرشحة بالمكتبة في القسم «'+root.name+'»');
 const discardKnownEpisodes=()=>{
  if(root.kind==='movies')return;
  const known=events.filter(event=>require('./everything-known-video.cjs')({root,event,items,byMediaPath,byFilePath})),skip=new Set(known);
  events=events.filter(event=>!skip.has(event));
  if(known.length)onEvent('مراقبة Everything: تجاهل '+known.length+' ملف فيديو مسجل مسبقًا في المكتبة: '+root.path+' / '+known.slice(0,5).map(event=>event.relative).join('، ')+'؛ لم يتغير ترتيب البرنامج أو المسلسل');
 };
 const eligible=()=>events.filter(event=>!event.recovery||movieState?.(root,event.relative)==='missing');
 events=eligible();if(!events.length)return {added:0};
 discardKnownEpisodes();if(!events.length)return {added:0};
 const relative=path.posix.dirname(safe.relative(events[0].relative));if(relative==='.')return;
 onProgress('probe','جارٍ التحقق من اكتمال نسخ الملفات في «'+relative+'» — القسم «'+root.name+'»');
 const probe=await new Promise((resolve,reject)=>{
  const child=fork(path.join(__dirname,'episode-probe.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
  let finished=false;
  const done=(error,value)=>{if(finished)return;finished=true;clearTimeout(timer);child.kill();error?reject(error):resolve(value);};
  const timer=setTimeout(()=>done(Error('انتهت مهلة فحص مجلد المحتوى')),8000);
  child.on('error',done);child.on('exit',()=>done(Error('توقف فحص مجلد المحتوى')));
  child.on('message',m=>m.error?done(Error('تعذر الوصول إلى المجلد: '+m.error)):done(null,m.entries));child.send({root:root.path,relative});
 });
 if(events.some(e=>{
  if(path.posix.dirname(safe.relative(e.relative))!==relative)return true;
  const f=probe.find(f=>f.name.toLowerCase()===path.posix.basename(e.relative).toLowerCase());
  // An index can retain a pre-copy size forever. Verify the actual file on each retry.
  if(f&&f.size>0&&Date.now()-f.mtime>=30000){e.size=f.size;return false;}
  return true;
 }))throw Error('الملف غير جاهز');
 // Compact catalogues intentionally omit video records. For an existing show,
 // reject a delayed index entry when both on-disk dates predate monitoring.
 // Birth time still admits newly copied episodes with an old modification date.
 // Allow five minutes for host clock skew; never apply this rule to movies.
 if(folderOnly&&root.kind!=='movies'&&root.referenceStartedAt>0){
  const cutoff=root.referenceStartedAt-5*60000,old=[];
  events=events.filter(event=>{
   const file=probe.find(file=>file.name===path.posix.basename(event.relative));
   const stale=file.birth>0&&file.mtime>0&&Math.max(file.birth,file.mtime)<cutoff&&require('./everything-known-video.cjs').hasContainer({root,event,items,byMediaPath});
   if(stale)old.push(event);return !stale;
  });
  if(old.length)onEvent('مراقبة Everything: ظهر '+old.length+' ملف فيديو قديم قبل بدء المتابعة داخل برنامج موجود: '+root.path+' / '+old.slice(0,5).map(event=>event.relative).join('، ')+'؛ لم يتغير ترتيب البرنامج أو المسلسل');
  if(!events.length)return {added:0};
 }
 // A manual sync may have filled the catalogue while the probe was running.
 events=eligible();if(!events.length)return {added:0};
 discardKnownEpisodes();if(!events.length)return {added:0};
 const previousMovie=root.kind==='movies'?(movieState||require('./everything-movie-state.cjs')({items,byMediaPath,scannedAliases:new Map()}))(root,events[0].relative):null;
 if(previousMovie==='blocked')return {added:0};
 // Probe the actual file directory; update the containing movie, even for a quality subfolder.
 const scanRelative=root.kind==='movies'?events[0].relative.split('/')[0]:relative;
 const job=services.startSync(root.sectionIds[0],'quick',{root:root.path,relative:scanRelative});
 onProgress('sync','جارٍ المزامنة السريعة للقسم «'+root.name+'» لوجود ملفات جديدة في «'+scanRelative+'»'+(previousMovie==='present'?'؛ تحديث ملفات الفيلم مع الحفاظ على ترتيبه':''));
 const deadline=Date.now()+5*60000;
 for(;;){
  if(Date.now()>deadline){services.cancelSync?.(job.jobId);throw Error('انتهت مهلة المزامنة المحددة للمجلد؛ ستعاد المحاولة');}
  if(stopping())throw Error('الخادم يتوقف');
  const state=services.syncJobs().find(j=>j.id===job.jobId);
  if(state&&!['queued','running'].includes(state.status)){if(state.status!=='completed'||state.warnings)throw Error('تعذر فحص مجلد المحتوى');break;}
  await new Promise(r=>setTimeout(r,250));
 }
 // A new format/quality file refreshes playback files, not the age of a movie
 // that was already in the catalogue. Series still advance on new episodes.
 onProgress('saving','اكتمل فحص مجلد المحتوى؛ جارٍ حفظ نتيجة المزامنة للقسم «'+root.name+'»');
 const changed=previousMovie==='present'?0:require('./episode-activity.cjs').apply({root,events,items,byMediaPath,updateItems});await commit();
 if(previousMovie==='present'){
  onEvent('مراقبة Everything: حُدّثت ملفات الفيلم الموجود: '+scanRelative+'؛ دون تغيير ترتيبه أو اعتباره فيلمًا جديدًا');
  return {added:0,updated:events.length};
 }
 if(!changed)return {added:0};
 onEvent('مراقبة Everything: '+(events.every(event=>event.recovery)?'استُدرك الفيلم الحديث الناقص من المكتبة: '+scanRelative+'؛ أُضيف وحُدّث ترتيبه':root.kind==='movies'?'اكتُشفت '+events.length+' ملفات فيديو جديدة في '+scanRelative+'؛ زُومن الفيلم وحُدّث ترتيبه':'اكتُشفت '+events.length+' حلقة جديدة في '+relative+'؛ حُدّث ترتيب البرنامج أو المسلسل؛ الملفات: '+events.slice(0,5).map(event=>path.posix.basename(event.relative)).join('، ')));
 return {added:events.length};
};
