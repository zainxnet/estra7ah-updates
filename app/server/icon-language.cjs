'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{execFile}=require('node:child_process');
const digest=b=>crypto.createHash('sha256').update(b).digest('hex');
function remember(file,bytes,arabic){const temp=file+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,JSON.stringify({sha256:digest(bytes),arabic}));fs.renameSync(temp,file);}
async function inspect(icon,record){try{const stat=await fs.promises.lstat(icon);if(!stat.isFile()||stat.isSymbolicLink()||stat.size>8*1024*1024)return null;const bytes=await fs.promises.readFile(icon);let saved;try{saved=JSON.parse(await fs.promises.readFile(record,'utf8'));}catch{}if(saved?.sha256===digest(bytes)&&typeof saved.arabic==='boolean')return saved.arabic;
const value=await new Promise(resolve=>execFile('powershell.exe',['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'icon-language.ps1'),'-IconPath',icon],{windowsHide:true,timeout:20000,maxBuffer:4096},(error,stdout)=>resolve(error?null:stdout.trim()==='arabic'?true:stdout.trim()==='latin'?false:null)));if(value!==null)remember(record,bytes,value);return value;}catch{return null;}}
module.exports={inspect,remember};
