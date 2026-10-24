'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function({dir,getItem,trailers,canRun=()=>true,onEvent=()=>{},autoStart=true}){
 const file=path.join(dir,'automatic-trailers.json');
 const pending=new Set(fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):[]);
 let timer,busy=false,closed=false;
 function save(){fs.writeFileSync(file+'.tmp',JSON.stringify([...pending]));fs.renameSync(file+'.tmp',file);}
 function enqueue(ids){let changed=false;for(const id of ids){let item=getItem(id);const seen=new Set();while(item?.inItem&&!seen.has(item.id)){seen.add(item.id);item=getItem(item.inItem);}if(item&&require('./metadata.cjs').supportsMetadata(item)&&!pending.has(item.id)){pending.add(item.id);changed=true;}}if(changed)save();}
 async function tick(){if(closed||busy||!pending.size||!canRun()||trailers.isBusy())return;busy=true;try{const id=pending.values().next().value,item=getItem(id);if(item){try{await trailers.admin('downloadTrailer',[],{id},'POST');await trailers.idle();}catch(error){if(error.status===409)return;onEvent('تعذر تجهيز الإعلان التلقائي لـ '+item.name+': '+error.message,'warning');}}pending.delete(id);save();}finally{busy=false;}}
 async function loop(){try{await tick();}catch{onEvent('تعذر حفظ قائمة الإعلانات التلقائية؛ ستعاد المحاولة','warning');}finally{if(!closed)timer=setTimeout(loop,2000);}}
 if(autoStart)timer=setTimeout(loop,2000);
 return {enqueue,tick,pending:()=>[...pending],close(){closed=true;clearTimeout(timer);}};
};
