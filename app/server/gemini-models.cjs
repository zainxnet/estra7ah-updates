'use strict';
module.exports=async function({key,request=fetch,upstreamError}){
 const models=new Map(),seen=new Set();let page='';
 const signal=AbortSignal.timeout(30000);
 try{
  for(let n=0;n<20;n++){
   const url=new URL('https://generativelanguage.googleapis.com/v1beta/models');url.searchParams.set('pageSize','1000');if(page)url.searchParams.set('pageToken',page);
   const response=await request(url.toString(),{method:'GET',headers:{'x-goog-api-key':key},signal,redirect:'error'});const data=await response.json();
   if(!response.ok)throw upstreamError(response.status,data);
   if(!Array.isArray(data.models))throw Error('invalid response');
   for(const row of data.models){const id=String(row.name||'').replace(/^models\//,'');if(/^gemini-[a-z0-9.-]{1,70}$/.test(id)&&row.supportedGenerationMethods?.includes('generateContent')&&!/image|tts|audio|robotics/i.test(id))models.set(id,{id,displayName:String(row.displayName||id).slice(0,160)});}
   page=data.nextPageToken;if(!page){if(!models.size)throw Object.assign(Error('لم تُرجع Google نماذج Gemini نصية متاحة؛ تحقق من صلاحية المفتاح'),{status:502});return [...models.values()].sort((a,b)=>a.id.localeCompare(b.id));}
   if(typeof page!=='string'||seen.has(page))throw Error('invalid pagination');seen.add(page);
  }
  throw Error('pagination limit');
 }catch(error){if(error.status)throw error;throw Object.assign(Error('تعذر جلب نماذج Gemini؛ تحقق من اتصال السيرفر ثم أعد المحاولة'),{status:502});}
};
