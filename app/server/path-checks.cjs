'use strict';
module.exports=function({sections,services}){
 let working=false,last=0,results=new Map();
 function configured(){return sections.map(s=>({section:{id:s.id,name:s.name},paths:Array.isArray(s.main_path)?s.main_path:String(s.main_path||'').split(',').map(p=>p.trim()).filter(Boolean)}));}
 async function refresh(rows){working=true;const paths=[...new Set(rows.flatMap(s=>s.paths))];let index=0;try{await Promise.all([0,1].map(async()=>{while(index<paths.length){const p=paths[index++];try{await services.checkPath(p);results.set(p,{ok:true});}catch(e){results.set(p,{ok:false,message:e.message});}}}));last=Date.now();}finally{working=false;}}
 return {adminReads:new Set(['scanSectionsPaths']),adminActions:new Set(),async admin(){const rows=configured();if(!working&&Date.now()-last>60000)refresh(rows).catch(()=>{});return {body:{msg:'ok',checked:!working,pending:working,sections:rows.map(s=>({...s,paths:s.paths.filter(p=>results.get(p)?.ok===false)})).filter(s=>s.paths.length),configuredSections:rows}};}};
};
