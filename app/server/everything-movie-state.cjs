'use strict';
const path=require('node:path'),catalog=require('./catalog-items.cjs');
module.exports=function({items,byMediaPath,scannedAliases,isDeleted=()=>false}){
 return function(root,relative){
  const name=require('./episode-path.cjs').relative(relative).split('/')[0];
  const folder=path.join(root.path,name),normal=path.normalize(folder).toLowerCase().replace(/[\\/]+$/,'');
  let known=false;
  for(const sectionId of root.sectionIds){
   for(const type of ['movie','film']){
    const id=byMediaPath.get(String(sectionId)+'|'+type+'|'+normal),row=id&&items.get(id);
    if(row&&catalog.visible(row))return row.deleted||row.scanDeleted?'blocked':'present';
   }
   const id=catalog.folderId(sectionId,folder),alias=scannedAliases.get(id);
   if(isDeleted(sectionId,folder,id)||alias&&isDeleted(sectionId,folder,alias))return 'blocked';
   if(items.has(alias||id))return 'present';
   // Previously catalogued but hidden movies are not missing new titles.
   if(alias)known=true;
  }
  return known?'blocked':'missing';
 };
};
