'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=base=>{
 const file=path.join(base,'data/restore-progress.json');let last=0;
 const read=()=>{try{return JSON.parse(fs.readFileSync(file,'utf8'))}catch{return null}};
 function set(value,force=true){if(!force&&Date.now()-last<1000)return;last=Date.now();const previous=read();const state={...value,startedAt:value.startedAt||previous?.startedAt||new Date().toISOString(),updatedAt:new Date().toISOString()};fs.writeFileSync(file+'.tmp',JSON.stringify(state));fs.renameSync(file+'.tmp',file);return state;}
 function current(){const r=read();if(!r)return null;if(r.state==='waiting-restart'){try{const s=JSON.parse(fs.readFileSync(path.join(base,'data/startup-status.json'),'utf8'));if(Date.parse(s.updatedAt)>Date.parse(r.updatedAt))return {...s,unit:s.phase?.startsWith('restore')?'bytes':'records'};}catch{}}return r;}
 return {set,read:current};
};