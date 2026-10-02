'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function(base,onProgress=()=>{}){
 const {allowed,fixed,mediaDirs}=require('./backup-worker.cjs'),dir=path.join(base,'data'),pending=path.join(dir,'pending-restore.json');if(!fs.existsSync(pending))return;
 const job=JSON.parse(fs.readFileSync(pending,'utf8')),root=path.resolve(dir,'local-backups');
 const progress=(phase,current,total,message,file='')=>{try{onProgress({phase,current,total,percent:total?Math.floor(current*100/total):100,message,file})}catch{}};
 const contained=(root,value)=>{const rel=path.relative(path.resolve(root),path.resolve(value));if(!rel||rel==='..'||rel.startsWith('..'+path.sep)||path.isAbsolute(rel))throw Error('مسار استعادة غير صالح');return path.resolve(value)};
 const stage=contained(root,job.stage);if(!Array.isArray(job.files)||job.files.some(n=>!allowed(n))||new Set(job.files).size!==job.files.length)throw Error('ملفات استعادة غير صالحة');
 const managed=[...fixed,...(job.mode==='quick'?[]:mediaDirs),'data/sync-items.sqlite-wal','data/sync-items.sqlite-shm','data/catalog.sqlite-wal','data/catalog.sqlite-shm'];
 const exists=p=>fs.existsSync(p);
 function move(from,to){contained(base,from);contained(base,to);fs.mkdirSync(path.dirname(to),{recursive:true});fs.renameSync(from,to)}
 function rollback(tx){const failed=contained(root,tx.rollback+'-failed');for(const n of managed){const dest=contained(base,path.join(base,n)),old=contained(tx.rollback,path.join(tx.rollback,n));if(exists(old)){if(exists(dest))move(dest,path.join(failed,n));move(old,dest)}else if(!tx.present.includes(n)&&exists(dest))move(dest,path.join(failed,n));}}
 // Recover a previous interrupted application before beginning another one.
 if(job.transaction){contained(root,job.transaction.rollback);rollback(job.transaction);delete job.transaction;fs.writeFileSync(pending,JSON.stringify(job))}
 for(const n of job.files){const src=contained(stage,path.join(stage,n));if(!fs.lstatSync(src).isFile())throw Error('ملف استعادة مفقود أو غير صالح');}
 const transaction={rollback:contained(root,path.join(root,'before-apply-'+crypto.randomUUID())),present:managed.filter(n=>exists(path.join(base,n)))};
 job.transaction=transaction;fs.writeFileSync(pending,JSON.stringify(job));fs.mkdirSync(transaction.rollback,{recursive:true});
 try{
  const total=job.files.reduce((sum,n)=>sum+fs.statSync(path.join(stage,n)).size,0);let current=0;progress('restore-apply',current,total,'جار حفظ الحالة الحالية قبل تطبيق النسخة');
  // Move old managed state aside, including files absent from the imported backup.
  for(const n of transaction.present)move(path.join(base,n),path.join(transaction.rollback,n));
  const buffer=Buffer.allocUnsafe(8*1024*1024);
  for(const n of job.files){const src=path.join(stage,n),dest=contained(base,path.join(base,n));fs.mkdirSync(path.dirname(dest),{recursive:true});let input,output;try{input=fs.openSync(src,'r');output=fs.openSync(dest,'w');for(;;){const size=fs.readSync(input,buffer,0,buffer.length,null);if(!size)break;fs.writeSync(output,buffer,0,size);current+=size;progress('restore-apply',current,total,'جار تطبيق ملفات النسخة الاحتياطية',n)}}finally{if(input!==undefined)fs.closeSync(input);if(output!==undefined)fs.closeSync(output)}}
  move(pending,path.join(transaction.rollback,'applied.json'));
  progress('restore-applied',total,total,'اكتمل تطبيق ملفات النسخة الاحتياطية');
 }catch(e){rollback(transaction);delete job.transaction;fs.writeFileSync(pending,JSON.stringify(job));throw e}
};
