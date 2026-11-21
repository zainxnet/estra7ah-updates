'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function({dir,getItem,trailers,canRun=()=>true,onEvent=()=>{},autoStart=true,clock=Date.now}){
 const file=path.join(dir,'automatic-trailers.json'),retryFile=path.join(dir,'automatic-trailer-retries.json');
 const pending=new Set(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]);
 const retries=fs.existsSync(retryFile)?JSON.parse(fs.readFileSync(retryFile,'utf8')):{};
 let timer,busy=false,closed=false;
 function save(){
  fs.writeFileSync(retryFile+'.tmp',JSON.stringify(retries));fs.renameSync(retryFile+'.tmp',retryFile);
  fs.writeFileSync(file+'.tmp',JSON.stringify([...pending]));fs.renameSync(file+'.tmp',file);
 }
 function enqueue(ids){
  let changed=false;
  for(const id of ids){let item=getItem(id);const seen=new Set();while(item?.inItem&&!seen.has(item.id)){seen.add(item.id);item=getItem(item.inItem);}if(item&&require('./metadata.cjs').supportsMetadata(item)&&!pending.has(item.id)){pending.add(item.id);changed=true;}}
  if(changed)save();
 }
 async function tick(){
  if(closed||busy||!pending.size||!canRun()||trailers.isBusy())return;
  const id=[...pending].find(id=>!retries[id]||retries[id].due<=clock());if(id===undefined)return;
  busy=true;
  try{
   const item=getItem(id);
   if(item){
    try{
     const result=await trailers.admin('downloadTrailer',[],{id},'POST');await trailers.idle();
     if(closed)return; // Shutdown cancellation is resumed on the next launch.
     if(result?.body?.jobId&&trailers.jobs){
      const job=trailers.jobs().find(j=>j.id===result.body.jobId);
      // An explicit user cancellation is respected; failures are retried.
      if(!job||!['completed','cancelled'].includes(job.status))throw Error(job?.message||'لم يكتمل تنزيل الإعلان');
     }
    }catch(error){
     if(closed)return;
     const attempts=(retries[id]?.attempts||0)+1,due=clock()+Math.min(86400000,60000*Math.pow(2,Math.min(attempts-1,11)));
     retries[id]={attempts,due};save();
     onEvent('تأجل إعلان '+item.name+': '+error.message+'؛ ستعاد المحاولة '+new Date(due).toLocaleString('ar'),'warning');return;
    }
   }
   pending.delete(id);delete retries[id];save();
  }finally{busy=false;}
 }
 async function loop(){try{await tick();}catch{onEvent('تعذر حفظ قائمة الإعلانات التلقائية؛ ستعاد المحاولة','warning');}finally{if(!closed)timer=setTimeout(loop,2000);}}
 if(autoStart)timer=setTimeout(loop,2000);
 return {enqueue,tick,pending:()=>[...pending],close(){closed=true;clearTimeout(timer);}};
};
