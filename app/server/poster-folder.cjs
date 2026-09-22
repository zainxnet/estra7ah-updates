'use strict';
const {fork}=require('node:child_process'),path=require('node:path');
module.exports=function copyPoster(item,source,{timeoutMs=5000}={}){
 return new Promise(resolve=>{
  const child=fork(path.join(__dirname,'poster-folder-worker.cjs'),[],{windowsHide:true,stdio:['ignore','ignore','ignore','ipc']});
  let settled=false;
  function finish(result){if(settled)return;settled=true;clearTimeout(timer);child.kill();resolve(result);}
  const timer=setTimeout(()=>finish({status:'failed',code:'TIMEOUT'}),timeoutMs);
  child.once('error',()=>finish({status:'failed',code:'WORKER_ERROR'}));
  child.once('exit',()=>finish({status:'failed',code:'WORKER_EXIT'}));
  child.once('message',finish);child.send({target:item.path,source});
 });
};
