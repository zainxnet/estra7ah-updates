'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function({dir}){
 const root=path.join(dir,'exclusive-logos');fs.mkdirSync(root,{recursive:true});const dest=id=>path.join(root,crypto.createHash('sha256').update(String(id)).digest('hex')+'.png');
 return {file(id){return fs.existsSync(dest(id))?dest(id):null},async save(id,source){
  if(!/^\/[\w-]+\.png$/.test(source))throw Error('Invalid logo');
  const response=await fetch('https://image.tmdb.org/t/p/w500'+source,{signal:AbortSignal.timeout(12000),redirect:'error'});if(!response.ok)throw Error('Logo unavailable');
  const chunks=[];let size=0;for await(const chunk of response.body){size+=chunk.length;if(size>5*1024*1024)throw Error('Logo too large');chunks.push(chunk)}const bytes=Buffer.concat(chunks);if(bytes.subarray(0,8).toString('hex')!=='89504e470d0a1a0a')throw Error('Invalid PNG');
  const file=dest(id),temp=file+'.'+crypto.randomUUID()+'.tmp';await fs.promises.writeFile(temp,bytes);await fs.promises.rename(temp,file);
 }};
};
