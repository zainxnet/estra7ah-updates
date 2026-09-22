'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
process.on('disconnect',()=>process.exit(0));
process.once('message',async({target,source})=>{
 let temp;
 try{
  if(typeof target!=='string'||!path.isAbsolute(target)||/[\x00-\x1f]/.test(target)||/^\\\\[?.]\\/.test(target))throw Error('INVALID_PATH');
  const stat=await fs.stat(target),directory=stat.isDirectory()?target:stat.isFile()?path.dirname(target):null;
  if(!directory)throw Error('INVALID_PATH');
  const dest=path.join(directory,'poster.jpg');
  // Never replace an existing user cover, including an invalid cover requiring review.
  try{await fs.lstat(dest);process.send({status:'exists'});return;}catch(e){if(e.code!=='ENOENT')throw e;}
  temp=path.join(directory,'.zain-poster-'+crypto.randomUUID()+'.tmp');
  await fs.copyFile(source,temp,1);
  // An exclusive copy also protects a poster created since the existence check.
  await fs.copyFile(temp,dest,1);
  await fs.unlink(temp);temp=null;
  process.send({status:'saved'});
 }catch(e){process.send({status:e.code==='EEXIST'?'exists':'failed',code:e.code||e.message});}
 finally{if(temp)await fs.unlink(temp).catch(()=>{});}
});
