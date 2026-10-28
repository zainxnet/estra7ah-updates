'use strict';
const allowed=new Set(['api.github.com','github.com','release-assets.githubusercontent.com','objects.githubusercontent.com']);
module.exports=async function remote(url,limit,{fetcher=fetch,idleMs=90000,totalMs=1200000,attempts=3,onProgress=()=>{},sleep=ms=>new Promise(r=>setTimeout(r,ms))}={}){
 const deadline=Date.now()+totalMs;
 const permanent=message=>Object.assign(Error(message),{permanent:true});
 for(let attempt=1;attempt<=attempts;attempt++){
  const controller=new AbortController();let timer,totalTimer;
  const touch=()=>{clearTimeout(timer);timer=setTimeout(()=>controller.abort(),idleMs);};
  try{
   if(Date.now()>=deadline)throw Error('TIMEOUT');
   totalTimer=setTimeout(()=>controller.abort(),Math.max(1,deadline-Date.now()));touch();
   let current=new URL(url);
   for(let redirect=0;redirect<5;redirect++){
    if(current.protocol!=='https:'||current.username||current.password||!allowed.has(current.hostname))throw permanent('رفض مصدر غير رسمي لتحديث الأداة');
    const response=await fetcher(current,{headers:{'User-Agent':'Estra7ah-Zain-ToolUpdater',Accept:'application/vnd.github+json'},redirect:'manual',signal:controller.signal});touch();
    if([301,302,303,307,308].includes(response.status)){await response.body?.cancel();current=new URL(response.headers.get('location'),current);continue;}
    if(!response.ok){await response.body?.cancel();const error=Error('تعذر جلب تحديث الأداة من GitHub (رمز '+response.status+')');if(response.status!==429&&response.status<500)error.permanent=true;throw error;}
    // Fetch decodes compressed bodies; Content-Length describes compressed bytes only.
    const encoding=response.headers.get('content-encoding');
    const total=encoding&&encoding!=='identity'?0:Number(response.headers.get('content-length'))||0;
    if(total>limit){await response.body?.cancel();throw permanent('حجم تحديث الأداة يتجاوز الحد المسموح');}
    let size=0;const chunks=[];
    for await(const part of response.body){touch();size+=part.length;if(size>limit){controller.abort();throw permanent('حجم تحديث الأداة يتجاوز الحد المسموح');}chunks.push(part);onProgress({attempt,size,total});}
    if(total&&size!==total)throw Error('INCOMPLETE');
    return Buffer.concat(chunks);
   }
   throw permanent('تعذر الوصول إلى تنزيل الأداة الرسمي');
  }catch(error){
   if(error.permanent)throw error;
   if(attempt===attempts||Date.now()>=deadline)throw Error('تعذر اكتمال تنزيل أداة الإعلانات بسبب بطء أو انقطاع الاتصال بعد إعادة المحاولة؛ لم تُستبدل الأداة الحالية. أعد المحاولة عند تحسن الاتصال.');
   onProgress({retry:true,attempt:attempt+1});
  }finally{clearTimeout(timer);clearTimeout(totalTimer);controller.abort();}
  await sleep(2000*attempt);
 }
};
