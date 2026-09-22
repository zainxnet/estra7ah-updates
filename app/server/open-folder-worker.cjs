'use strict';
const fs=require('node:fs'),path=require('node:path');
process.once('message',async({target})=>{
  try{const stat=await fs.promises.stat(target);const folder=stat.isDirectory()?path.normalize(target):stat.isFile()?path.dirname(target):null;process.send({folder});}
  catch{process.send({error:true});}
});
