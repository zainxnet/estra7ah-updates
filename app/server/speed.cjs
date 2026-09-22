'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{Transform}=require('node:stream');
module.exports=function({dir}){
 const file=path.join(dir,'speed.json');let state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{IS_OPEN_STREAM:'yes',streamSpeed:1024,numOfConnectionPerIp:8,downloadActive:'yes',autoBlockIDM:'no',isAutoBackup:'no'};
 const clients=new Map();
 return {adminReads:new Set(['getSpeedData']),adminActions:new Set(['saveSpeedSettings']),
 async admin(action,args,body,method){
  if(action==='getSpeedData')return {body:structuredClone(state)};
  if(action!=='saveSpeedSettings')return null;if(method!=='POST')return {status:405,body:{msg:'error'}};
  const next={...state};
  for(const [key,value]of Object.entries(body)){
   if(['IS_OPEN_STREAM','downloadActive','autoBlockIDM','isAutoBackup'].includes(key)){if(!['yes','no'].includes(value))return {status:400,body:{msg:'error',error:'قيمة غير صالحة'}};next[key]=value;}
   else if(['streamSpeed','numOfConnectionPerIp'].includes(key)){const n=Number(value),max=key==='streamSpeed'?1000000:1000;if(!Number.isInteger(n)||n<1||n>max)return {status:400,body:{msg:'error',error:'أدخل رقماً صحيحاً ضمن الحد المسموح'}};next[key]=n;}
   else return {status:501,body:{msg:'error',error:'هذا الإعداد لم يكتمل ربطه بعد'}};
  }
  fs.mkdirSync(dir,{recursive:true});if(fs.existsSync(file)){fs.mkdirSync(path.join(dir,'backups'),{recursive:true});fs.copyFileSync(file,path.join(dir,'backups','speed-'+Date.now()+'-'+crypto.randomUUID()+'.json'));}
  fs.writeFileSync(file+'.tmp',JSON.stringify(next));fs.renameSync(file+'.tmp',file);state=next;return {body:{msg:'ok'}};
 },
 acquire(req,res,download){
  function denied(error,status=403){throw Object.assign(Error(error),{status});}
  if(download&&state.downloadActive==='no')denied('التنزيل متوقف من إعدادات الخادم');
  if(state.autoBlockIDM==='yes'&&/Internet Download Manager|\bIDM\b/i.test(req.headers['user-agent']||''))denied('برنامج التنزيل غير مسموح');
  if(req.method==='HEAD')return null;
  const key=req.socket.remoteAddress;let client=clients.get(key)||{active:0,next:0};
  if(client.active>=state.numOfConnectionPerIp)denied('وصلت إلى الحد الأقصى للاتصالات المتزامنة',429);
  client.active++;clients.set(key,client);let released=false,timer,pending;
  const release=()=>{if(released)return;released=true;client.active--;if(!client.active)clients.delete(key)};res.once('close',release);res.once('finish',release);
  const limiter=new Transform({transform(chunk,encoding,callback){
   if(state.IS_OPEN_STREAM==='yes'){callback(null,chunk);return;}
   const now=Date.now();client.next=Math.max(now,client.next)+chunk.length/(Number(state.streamSpeed)*1024)*1000;
   pending=callback;timer=setTimeout(()=>{pending=null;callback(null,chunk)},Math.max(0,client.next-now));
  },destroy(error,callback){clearTimeout(timer);if(pending){const done=pending;pending=null;done(error||Error('Transfer closed'));}release();callback(error);}});
  res.once('close',()=>limiter.destroy());return limiter;
 }};
};
