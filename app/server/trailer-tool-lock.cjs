'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function toolLock(exe){
 const file=exe+'.zain-lock',token=crypto.randomUUID();
 for(let attempt=0;attempt<2;attempt++){
  try{const fd=fs.openSync(file,'wx');try{fs.writeFileSync(fd,JSON.stringify({pid:process.pid,token,createdAt:new Date().toISOString()}));}finally{fs.closeSync(fd);}return ()=>{try{const row=JSON.parse(fs.readFileSync(file));if(row.token===token&&row.pid===process.pid)fs.unlinkSync(file);}catch{}};}
  catch(e){if(e.code!=='EEXIST')throw Error('تعذر قفل أداة الإعلان؛ تحقق من صلاحية الكتابة إلى '+path.dirname(exe));
   let stale=false;try{const row=JSON.parse(fs.readFileSync(file));if(Number.isInteger(row.pid)&&row.pid>0&&typeof row.token==='string'){try{process.kill(row.pid,0);}catch(err){stale=err.code==='ESRCH';}}}catch{}
   if(stale&&attempt===0){try{fs.unlinkSync(file);continue;}catch{}}
   throw Error('أداة الإعلان قيد الاستخدام أو التحديث؛ انتظر انتهاء العملية ثم أعد المحاولة');
  }
 }
};

