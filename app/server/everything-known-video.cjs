'use strict';
const path=require('node:path'),safe=require('./episode-path.cjs');
const normal=value=>path.normalize(value).replace(/[\\/]+$/,'').toLowerCase();
const containers=['series','tv','anime','kids','deen','sports','learn','ramadan','series.tv','series.anime','series.kids','series.deen','series.sports','series.learn','series.ramadan','season'];

// Everything can discover an already catalogued episode after an incomplete
// index/reindex. Check existing identities before the quick scan inserts files.
// All lookups are scoped to the event and its parent folders, never the library.
module.exports=function({root,event,items,byMediaPath,byFilePath}){
 const relative=safe.relative(event.relative),full=normal(path.join(root.path,...relative.split('/')));
 for(const sectionId of root.sectionIds){
  const prefix=String(sectionId)+'|';
  if(byFilePath?.has(prefix+full))return true;
  for(const type of ['episod','episode']){const id=byMediaPath.get(prefix+type+'|'+full);if(id&&items.has(id))return true;}
  const parts=relative.split('/');
  for(let depth=1;depth<=Math.min(2,parts.length-1);depth++){
   const folder=normal(path.join(root.path,...parts.slice(0,depth)));
   for(const type of containers){
    const id=byMediaPath.get(prefix+type+'|'+folder),row=id&&items.get(id);
    if(row?.files?.some(file=>file.path&&normal(file.path)===full))return true;
   }
  }
 }
 return false;
};

module.exports.hasContainer=function({root,event,items,byMediaPath}){
 const folder=normal(path.join(root.path,safe.relative(event.relative).split('/')[0]));
 return root.sectionIds.some(sectionId=>containers.some(type=>{
  const id=byMediaPath.get(String(sectionId)+'|'+type+'|'+folder);
  return id&&items.has(id);
 }));
};
