'use strict';
const fs=require('node:fs'),path=require('node:path');
const normalize=s=>String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
module.exports=function({dir,cache,concurrency=3}){
 const file=path.join(dir,'actor-images.json');let index={};try{index=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}
 function persist(){const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(index));fs.renameSync(tmp,file);}
 const pending=new Map(),queue=[];let running=0;
 const limit=Math.max(1,Math.min(3,Number(concurrency)||3));
 function pump(){while(running<limit&&queue.length){const entry=queue.shift();if(entry.signal?.aborted){pending.delete(entry.id);entry.reject(Object.assign(Error('Cancelled'),{code:'CANCELLED'}));continue;}running++;Promise.resolve().then(()=>cache.save('actor-'+entry.id,entry.path)).then(entry.resolve,entry.reject).finally(()=>{pending.delete(entry.id);running--;pump();});}}
 function download(id,profile,signal){if(pending.has(id))return {reused:true,promise:pending.get(id)};let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});pending.set(id,promise);queue.push({id,path:profile,signal,resolve,reject});pump();return {reused:false,promise};}
 return {file(name){const id=index[normalize(name)];return id?cache.file('actor-'+id):null;},async save(cast,{signal}={}){
  let saved=0,reused=0,failed=0,changed=false;
  await Promise.all(cast.map(async actor=>{if(signal?.aborted||!actor.id||!actor.name||!actor.profile_path)return;const id=String(actor.id);
   try{if(cache.file('actor-'+id))reused++;else{const entry=download(id,actor.profile_path,signal);await entry.promise;if(entry.reused)reused++;else saved++;}const name=normalize(actor.name);if(index[name]!==id){index[name]=id;changed=true;}}
   catch(error){if(error.code!=='CANCELLED')failed++;}
  }));if(changed)persist();return {saved,reused,failed};
 }};
};
