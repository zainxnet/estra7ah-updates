'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function({dir,folder='poster-cache',size='w500',getCacheKey=id=>id,getRelatedIds=id=>[id]}){
 if(!['poster-cache','backdrop-cache'].includes(folder)||!['w500','w1280'].includes(size))throw Error('Invalid image cache');
 const root=path.join(dir,folder);fs.mkdirSync(root,{recursive:true});
 const filename=id=>path.join(root,crypto.createHash('sha256').update(String(id)).digest('hex')+'.jpg');
 const cacheKey=id=>getCacheKey(id)??id,inflight=new Map();
 function file(id){for(const key of new Set([cacheKey(id),id,...(getRelatedIds(id)||[])])){const candidate=filename(key);if(fs.existsSync(candidate))return candidate;}return null;}
 async function download(key,poster){
  if(typeof poster!=='string'||!/^\/[a-zA-Z0-9_-]+\.jpg$/.test(poster))throw Error('Invalid poster path');
  let bytes;const backdrop=folder==='backdrop-cache';
  for(let attempt=0;attempt<(backdrop?2:1);attempt++)try{
   const downloadSize=backdrop&&attempt===1?'w780':size;
   const response=await fetch('https://image.tmdb.org/t/p/'+downloadSize+poster,{signal:AbortSignal.timeout(backdrop?45000:15000),redirect:'error'});if(!response.ok)throw Object.assign(Error('Poster unavailable'),{retryable:[408,429].includes(response.status)||response.status>=500});
   const chunks=[];let byteCount=0;for await(const chunk of response.body){byteCount+=chunk.length;if(byteCount>5*1024*1024)throw Object.assign(Error('Poster too large'),{retryable:false});chunks.push(chunk);}bytes=Buffer.concat(chunks);if(bytes[0]!==255||bytes[1]!==216||bytes[2]!==255)throw Object.assign(Error('Invalid JPEG'),{retryable:false});break;
  }catch(error){if(!backdrop||attempt===1||error.retryable===false)throw error;}
  const dest=filename(key),temp=dest+'.'+crypto.randomUUID()+'.tmp';try{await fs.promises.writeFile(temp,bytes);await fs.promises.rename(temp,dest);}finally{await fs.promises.unlink(temp).catch(()=>{});}
 }
 return {file,save(id,poster){
  if(typeof poster!=='string'||!/^\/[a-zA-Z0-9_-]+\.jpg$/.test(poster))return Promise.reject(Error('Invalid poster path'));
  const key=String(cacheKey(id));if(inflight.has(key))return inflight.get(key);
  const pending=download(key,poster).finally(()=>{if(inflight.get(key)===pending)inflight.delete(key);});inflight.set(key,pending);return pending;
 }};
};
