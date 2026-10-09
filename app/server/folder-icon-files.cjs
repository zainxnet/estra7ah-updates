'use strict';
const {fork}=require('node:child_process'),path=require('node:path');
function run(action,target,source,{timeoutMs=8000,includePoster=false}={}){
 return new Promise(resolve=>{
  let child,timer,settled=false;
  function finish(result){
   if(settled)return;settled=true;clearTimeout(timer);
   if(child)child.kill();
   resolve(result&&typeof result.status==='string'?result:{status:'failed',code:'INVALID_WORKER_RESULT'});
  }
  try{
   child=fork(path.join(__dirname,'folder-icon-files-worker.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
   timer=setTimeout(()=>finish({status:'failed',code:'TIMEOUT'}),Math.max(100,Math.min(60000,Number(timeoutMs)||8000)));
   child.once('error',()=>finish({status:'failed',code:'WORKER_ERROR'}));
   child.once('exit',()=>finish({status:'failed',code:'WORKER_EXIT'}));
   child.once('message',finish);
   child.send({action,target,source,includePoster:includePoster===true},error=>{if(error)finish({status:'failed',code:'WORKER_SEND'});});
  }catch{finish({status:'failed',code:'WORKER_ERROR'});}
 });
}
module.exports={inspect:(target,options)=>run('inspect',target,null,options),install:(target,sourceIco,options)=>run('install',target,sourceIco,options)};
