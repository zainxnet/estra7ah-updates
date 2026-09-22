'use strict';
const {fork,spawn}=require('node:child_process');
const path=require('node:path');
module.exports=async function openFolder(req,item,mode){
  const fail=(status,message)=>{throw Object.assign(new Error(message),{status});};
  if(req.method!=='POST')fail(405,'طريقة الطلب غير مسموحة');
  if(!require('./folder-target.cjs')(req,item,mode).local)fail(403,'فتح المجلد في ويندوز متاح من جهاز الخادم نفسه. جهاز العميل يحتاج مشغلًا محليًا لفتح مجلداته.');
  if(!require('./same-origin.cjs')(req))fail(403,'طلب فتح المجلد يجب أن يصدر من صفحة الاستراحة');
  if(mode!=='caffe')fail(403,'فتح المجلد متاح في وضع المقهى');
  if(!item)fail(404,'العنصر غير موجود');
  const target=item.path;
  if(typeof target!=='string'||!(/^[A-Za-z]:[\\/]/.test(target)||/^\\\\[^\\?.][^\\]*\\[^\\]+/.test(target))||/[\x00-\x1f]/.test(target))fail(400,'لا يوجد مسار مجلد صالح لهذا العنصر');
  const folder=await new Promise((resolve,reject)=>{
    const child=fork(path.join(__dirname,'open-folder-worker.cjs'),[],{stdio:['ignore','ignore','ignore','ipc'],windowsHide:true});
    const timer=setTimeout(()=>finish(Object.assign(new Error('تعذر الوصول إلى المجلد. تأكد من اتصال القرص أو مشاركة الشبكة.'),{status:409})),5000);
    let done=false;
    function finish(error,value){if(done)return;done=true;clearTimeout(timer);child.kill();error?reject(error):resolve(value);}
    child.on('error',()=>finish(Object.assign(new Error('تعذر التحقق من المجلد'),{status:500})));
    child.on('exit',()=>finish(Object.assign(new Error('تعذر الوصول إلى المجلد'),{status:409})));
    child.on('message',message=>message.folder?finish(null,message.folder):finish(Object.assign(new Error('المجلد غير متاح على هذا الجهاز. تأكد من المسار ومشاركة الشبكة.'),{status:409})));
    child.send({target});
  });
  const presentation=await new Promise(resolve=>{
    const helper=spawn(path.join(process.env.SystemRoot||'C:\\Windows','System32','WindowsPowerShell','v1.0','powershell.exe'),['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'focus-folder.ps1'),'-Folder',folder,'-Open'],{windowsHide:true,stdio:['ignore','pipe','ignore'],shell:false});
    let output='';const failed={openedInFront:false,focused:false,reason:'presentation-helper-failed'};
    helper.stdout.on('data',chunk=>{if(output.length<4096)output+=chunk.toString()});
    const timeout=setTimeout(()=>{helper.kill();resolve({...failed,reason:'presentation-timeout'})},18000);
    helper.once('error',()=>{clearTimeout(timeout);resolve(failed)});
    helper.once('close',()=>{clearTimeout(timeout);try{const result=JSON.parse(output.trim());resolve({openedInFront:result.openedInFront===true,focused:result.focused===true,reason:result.reason||null,sessionId:result.sessionId})}catch{resolve(failed)}});
  });
  return {ok:true,...presentation};
};
