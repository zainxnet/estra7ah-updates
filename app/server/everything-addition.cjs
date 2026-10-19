'use strict';
const path=require('node:path'),{fork}=require('node:child_process'),safe=require('./episode-path.cjs');

// Called only for stable files discovered by the automatic Everything monitor.
module.exports=async function({root,events,services,items,byMediaPath,updateItems,commit,stopping=()=>false,onEvent=()=>{}}){
 const relative=path.posix.dirname(safe.relative(events[0].relative));if(relative==='.')return;
 const probe=await new Promise((resolve,reject)=>{
  const child=fork(path.join(__dirname,'episode-probe.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
  let finished=false;
  const done=(error,value)=>{if(finished)return;finished=true;clearTimeout(timer);child.kill();error?reject(error):resolve(value);};
  const timer=setTimeout(()=>done(Error('انتهت مهلة فحص مجلد المحتوى')),8000);
  child.on('error',done);child.on('exit',()=>done(Error('توقف فحص مجلد المحتوى')));
  child.on('message',m=>m.error?done(Error('المسار غير متاح')):done(null,m.entries));child.send({root:root.path,relative});
 });
 if(events.some(e=>{
  if(path.posix.dirname(safe.relative(e.relative))!==relative)return true;
  const f=probe.find(f=>f.name===path.posix.basename(e.relative));
  return !f||f.size!==e.size||Date.now()-f.mtime<30000;
 }))throw Error('الملف غير جاهز');
 // Probe the actual file directory; update the containing movie, even for a quality subfolder.
 const scanRelative=root.kind==='movies'?events[0].relative.split('/')[0]:relative;
 const job=services.startSync(root.sectionIds[0],'quick',{root:root.path,relative:scanRelative});
 for(;;){
  if(stopping())throw Error('الخادم يتوقف');
  const state=services.syncJobs().find(j=>j.id===job.jobId);
  if(state&&!['queued','running'].includes(state.status)){if(state.status!=='completed'||state.warnings)throw Error('تعذر فحص مجلد المحتوى');break;}
  await new Promise(r=>setTimeout(r,250));
 }
 require('./episode-activity.cjs').apply({root,events,items,byMediaPath,updateItems});await commit();
 onEvent('مراقبة Everything: '+(root.kind==='movies'?'اكتُشفت '+events.length+' ملفات فيديو جديدة في '+scanRelative+'؛ زُومن الفيلم وحُدّث ترتيبه':'اكتُشفت '+events.length+' حلقة جديدة في '+relative+'؛ حُدّث ترتيب المسلسل'));
};
