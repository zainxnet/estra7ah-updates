'use strict';
// Arm the fallback before awaiting cleanup: a stuck service must not trap Stop.
module.exports=function createShutdown({cleanup,close,forceClose,exit,report=()=>{},timeoutMs=15000}){
 let running;
 return function shutdown(){
  if(running)return running;
  let finished=false;
  const finish=code=>{if(finished)return;finished=true;clearTimeout(timer);exit(code);};
  const timer=setTimeout(()=>{report('انتهت مهلة الإغلاق؛ تُغلق عملية الخادم الحالية');try{forceClose();}finally{finish(1)}},timeoutMs);
  timer.unref?.();
  running=(async()=>{
   const results=await Promise.allSettled(cleanup.map(step=>Promise.resolve().then(step)));
   for(const result of results)if(result.status==='rejected')report('تعذر إغلاق إحدى الخدمات: '+String(result.reason?.message||result.reason));
   if(finished)return;
   try{await close();finish(results.some(x=>x.status==='rejected')?1:0);}
   catch(e){report('تعذر إغلاق مستمع الخادم: '+e.message);forceClose();finish(1);}
  })();
  return running;
 };
};
