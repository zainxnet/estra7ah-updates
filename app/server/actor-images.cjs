'use strict';
const fs=require('node:fs'),path=require('node:path');
const normalize=s=>String(s||'').normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
module.exports=function({dir,cache}){
 const file=path.join(dir,'actor-images.json');let index={};try{index=JSON.parse(fs.readFileSync(file,'utf8'))}catch{}
 function persist(){const tmp=file+'.tmp';fs.writeFileSync(tmp,JSON.stringify(index));fs.renameSync(tmp,file);}
 return {file(name){const id=index[normalize(name)];return id?cache.file('actor-'+id):null;},async save(cast){let saved=0,reused=0,failed=0;for(const actor of cast){if(!actor.id||!actor.name||!actor.profile_path)continue;const id=String(actor.id);try{if(cache.file('actor-'+id))reused++;else{await cache.save('actor-'+id,actor.profile_path);saved++;}index[normalize(actor.name)]=id;}catch{failed++;}}persist();return {saved,reused,failed};}};
};
