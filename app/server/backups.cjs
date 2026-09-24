'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{fork}=require('node:child_process');
module.exports=function({base,onEvent=()=>{},isSyncing=()=>false}){
 const dir=path.join(base,'data'),root=path.join(dir,'local-backups');fs.mkdirSync(root,{recursive:true});let busy=false,lastError='',lastAutomatic=0;
 const backupJobs=[];

 const maintenance={running:false,action:null,phase:'idle',error:'',report:null,backup:null};
 function maintenanceWorker(optimize){return new Promise((resolve,reject)=>{const child=fork(path.join(__dirname,'database-maintenance-worker.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});let done=false;const timer=setTimeout(()=>finish(Error('انتهت مهلة فحص القاعدة')),15*60*1000);function finish(error,result){if(done)return;done=true;clearTimeout(timer);child.kill();error?reject(error):resolve(result)}child.on('error',finish);child.on('exit',()=>finish(Error('توقفت عملية فحص القاعدة؛ لم تكتمل الصيانة')));child.on('message',r=>finish(r.ok?null:Error(r.error),r.result));child.send({base,optimize});})}
 function startMaintenance(optimize){if(busy||maintenance.running)throw Object.assign(Error('انتظر انتهاء العملية الحالية'),{status:409});if(fs.existsSync(path.join(dir,'pending-restore.json')))throw Object.assign(Error('توجد استعادة معلقة؛ أعد تشغيل الخادم أولًا'),{status:409});if(optimize&&isSyncing())throw Object.assign(Error('انتظر انتهاء المزامنة قبل تحسين القاعدة'),{status:409});maintenance.running=true;maintenance.action=optimize?'optimize':'scan';maintenance.phase='scan';maintenance.error='';maintenance.backup=null;maintenance.report=null;
 (async()=>{try{const scan=await maintenanceWorker(false);maintenance.report=scan;if(!scan.ok)throw Error('لم يجتز الفحص جميع الملفات؛ لم يبدأ التحسين');if(optimize&&scan.reclaimable>0){maintenance.phase='backup';maintenance.backup=await create(true);maintenance.phase='optimize';maintenance.report=await maintenanceWorker(true)}maintenance.phase='done';onEvent(optimize&&maintenance.backup?'اكتمل التحسين الآمن للقاعدة':'اكتمل فحص قاعدة البيانات','success')}catch(e){maintenance.error=e.message;maintenance.phase='failed';onEvent('تعذرت صيانة القاعدة: '+e.message,'warning')}finally{maintenance.running=false}})();return {msg:'ok'};}
 async function worker(action,file){const stage=path.join(root,'work-'+crypto.randomUUID());return new Promise((resolve,reject)=>{const c=fork(path.join(__dirname,'backup-worker.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});let done=false;const timer=setTimeout(()=>finish(Error('انتهت مهلة النسخ الاحتياطي')),15*60*1000);function finish(e,r){if(done)return;done=true;clearTimeout(timer);c.kill();e?reject(e):resolve({...r,stage});}c.on('error',finish);c.on('exit',()=>finish(Error('توقفت عملية النسخ الاحتياطي')));c.on('message',r=>finish(r.ok?null:Error(r.error),r));c.send({base,action,file,stage});});}
 const existingBackups=fs.readdirSync(root).filter(n=>/^zain-[\w-]+\.zain\.gz$/.test(n));for(const name of existingBackups)lastAutomatic=Math.max(lastAutomatic,fs.statSync(path.join(root,name)).mtimeMs);
 async function create(internal=false){if(busy||maintenance.running&&!internal)throw Object.assign(Error('توجد عملية نسخ احتياطي قيد التنفيذ'),{status:409});busy=true;lastError='';const job={id:crypto.randomUUID(),status:'running',name:'',size:0,error:''};backupJobs.push(job);if(backupJobs.length>8)backupJobs.shift();onEvent('بدأ إنشاء نسخة احتياطية','success');try{const name='zain-'+new Date().toISOString().replace(/[:.]/g,'-')+'.zain.gz',tmp=path.join(root,name+'.partial');const archive=await worker('create',tmp);fs.renameSync(tmp,path.join(root,name));lastAutomatic=Date.now();Object.assign(job,{status:'completed',name,fileCount:archive.files.length,size:fs.statSync(path.join(root,name)).size});onEvent('تم حفظ النسخة الاحتياطية: '+name,'success');return name;}catch(e){lastError=e.message;Object.assign(job,{status:'failed',error:e.message});onEvent('تعذر النسخ الاحتياطي: '+e.message,'warning');throw e;}finally{busy=false;}}
 async function handle(req,res,action,args){const json=(v,s=200)=>res.writeHead(s,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(v));
 try{
  if(action==='databaseMaintenanceStatus'){if(req.method!=='GET')return json({msg:'error'},405);return json(maintenance);}
  if(action==='scanDatabase'||action==='optimizeDatabase'){if(req.method!=='POST')return json({msg:'error'},405);return json(startMaintenance(action==='optimizeDatabase'));}
  if(maintenance.running&&['restoreBackup','saveDatabase','backupNow'].includes(action))return json({msg:'error',error:'انتظر انتهاء فحص أو تحسين القاعدة'},409);
  if(action==='remoteBackups')return json([]);
  if(action==='localBackups'){const rows=fs.readdirSync(root).filter(n=>/^zain-[\w-]+\.zain\.gz$/.test(n)).map(name=>{const s=fs.statSync(path.join(root,name));return {name,size:s.size,modifiedTime:s.mtime.toISOString()};});return json(rows.sort((a,b)=>b.modifiedTime.localeCompare(a.modifiedTime)));}
  if(action==='backupStatus'){const id=new URL(req.url||'/','http://localhost').searchParams.get('jobId'),job=id?backupJobs.find(j=>j.id===id):backupJobs.at(-1);return json({busy,lastError,job:job||null,pendingRestart:fs.existsSync(path.join(dir,'pending-restore.json'))});}
  if(action==='saveDatabase'){
   if(req.method==='POST'&&new URL(req.url||'/','http://localhost').searchParams.get('background')==='1'){
    if(busy||maintenance.running)return json({msg:'error',error:'توجد عملية نسخ أو صيانة قيد التنفيذ؛ انتظر انتهاءها'},409);
    // Return immediately so large catalogs do not leave a navigation or request hanging.
    create().catch(()=>{});return json({msg:'ok',jobId:backupJobs.at(-1).id},202);
   }
   const name=await create();return json({msg:'ok',name});
  }
  if(action==='backupNow'){const name=await create();return download(name,res);}
  if(action==='download')return download(args[0],res);
  if(action==='restoreBackup'){
   if(req.method!=='POST')return json({msg:'error'},405);if(busy)return json({msg:'error',error:'انتظر انتهاء النسخ الحالي'},409);
   const {files}=await require('./multipart.cjs')(req,{limit:256*1024*1024});const upload=files.backupFile;if(!upload)throw Error('اختر ملف النسخة الاحتياطية');
   if(busy||maintenance.running)return json({msg:'error',error:'انتظر انتهاء العملية الحالية'},409);
   const file=path.join(root,'upload-'+crypto.randomUUID()+'.zain.gz');fs.writeFileSync(file,upload.bytes,{flag:'wx'});
   busy=true;let checked;try{checked=await worker('restore',file);}finally{busy=false;}
   const before=await create();fs.writeFileSync(path.join(dir,'pending-restore.json'),JSON.stringify({stage:checked.stage,files:checked.files,before}));
   return json({msg:'ok',restartRequired:true,message:'تم التحقق وحفظ نسخة قبل الاستعادة. أوقف الخادم وشغله لتطبيق النسخة.'});
  }
 }catch(e){return json({msg:'error',error:e.message},e.status||400);}
 }
 function download(name,res){if(!/^zain-[\w-]+\.zain\.gz$/.test(name||''))throw Error('اسم نسخة غير صالح');const file=path.join(root,name),s=fs.statSync(file);res.writeHead(200,{'Content-Type':'application/gzip','Content-Length':s.size,'Content-Disposition':'attachment; filename="'+name+'"','Cache-Control':'no-store'});const input=fs.createReadStream(file);input.on('error',()=>res.destroy());res.on('close',()=>input.destroy());input.pipe(res);}
 const timer=setInterval(()=>{try{const s=JSON.parse(fs.readFileSync(path.join(dir,'speed.json'),'utf8'));if(s.isAutoBackup==='yes'&&!busy&&!maintenance.running&&Date.now()-lastAutomatic>=24*3600000){lastAutomatic=Date.now();create().catch(e=>{lastError=e.message});}}catch{}},60000);timer.unref();
 return {handle,create,isBusy:()=>busy||maintenance.running,isMaintaining:()=>maintenance.running,close:()=>clearInterval(timer),rawActions:new Set(['remoteBackups','localBackups','saveDatabase','backupNow','download','restoreBackup','backupStatus','scanDatabase','optimizeDatabase','databaseMaintenanceStatus'])};
};
module.exports.applyPending=require('./restore-state.cjs');
