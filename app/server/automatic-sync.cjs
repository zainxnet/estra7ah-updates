'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function(options){
 const file=path.join(options.dir,'automatic-sync-mode.json');let mode='everything';if(fs.existsSync(file)){const saved=JSON.parse(fs.readFileSync(file,'utf8'));if(saved.mode==='filesystem')mode=saved.mode;}
 const everything=require('./everything-sync.cjs')({...options,autoStart:false}),watcher=require('./filesystem-sync.cjs')(options);
 let timer,closed=false,running=false,changing=false;
 const base=async()=>(await everything.admin('everythingStatus')).body;
 async function configure(){const data=await base();await watcher.configure(data.available.filter(root=>data.roots.includes(root.id)),mode==='filesystem'&&data.enabled);}
 const initialized=configure();
 async function tick(){await initialized;if(closed||running||changing)return;running=true;try{if(mode==='filesystem')await watcher.tick();else await everything.tick();}finally{running=false;}}
 async function loop(){try{await tick();}catch(error){options.onEvent?.('المزامنة التلقائية: '+String(error.message).slice(0,300),'warning');}finally{if(!closed){const state=await base();timer=setTimeout(loop,mode==='everything'&&state.status.error?60000:1000);}}}
 if(options.autoStart!==false)timer=setTimeout(loop,10000);
 return {tick,isBusy:()=>running||changing||everything.isBusy()||watcher.isBusy(),adminReads:everything.adminReads,adminActions:everything.adminActions,
 async admin(action,args=[],body={},method='GET'){
  await initialized;
  if(action==='everythingStatus'){const data=await base();data.mode=mode;data.events=(options.readEvents?.()||[]).filter(event=>/^مراقبة (Everything|FileSystemWatcher):/.test(event.msg)).slice(-100).reverse();return {body:mode==='filesystem'?watcher.view(data):data};}
  if(method!=='POST')throw Error('طريقة الطلب غير صالحة');
  const requested=body.mode||mode;if(!['everything','filesystem'].includes(requested))throw Error('اختر طريقة مزامنة صحيحة');
  if(action==='clearEverythingEvents'){watcher.clear();return everything.admin(action,args,body,method);}
  if(action==='testEverything'&&requested==='filesystem'){
   const data=await base(),selected=data.available.filter(root=>body.roots?.includes(root.id));if(!selected.length)throw Error('اختر مسارًا للاختبار');
   await require('./filesystem-sync.cjs').probe(selected[0].path,'');return {body:{msg:'نجحت قراءة أول مسار محدد؛ بعد الحفظ ستظهر حالة اتصال المراقب لكل مسار'}};
  }
  if(action!=='saveEverything')return everything.admin(action,args,body,method);
  if(running||changing||watcher.isBusy()||everything.isBusy())throw Error('انتظر انتهاء دفعة المزامنة الحالية ثم احفظ');changing=true;
  try{
   const data=await base();const payload=requested==='filesystem'?{...body,address:data.address,username:data.username,password:''}:body;
   const result=await everything.admin(action,args,payload,method);
   // Stop the previous listener before allowing a tick in the new mode.
   await watcher.configure([],false);
   fs.writeFileSync(file+'.tmp',JSON.stringify({mode:requested}));fs.renameSync(file+'.tmp',file);mode=requested;
   await configure();result.body.msg='حُفظت الإعدادات؛ الطريقة المختارة: '+(mode==='filesystem'?'FileSystemWatcher':'Everything');return result;
  }finally{changing=false;}
 },async close(){closed=true;clearTimeout(timer);await initialized;while(running||changing)await new Promise(r=>setTimeout(r,50));await watcher.close();await everything.close();}};
};
