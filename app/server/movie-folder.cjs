'use strict';
const path=require('node:path');
const clean=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/\.[a-z0-9]{2,4}$/i,'').replace(/\b(?:19\d{2}|20\d{2})\b/g,'').replace(/\b(?:480p|720p|1080p|2160p|4k|webrip|web[ ._-]?dl|bluray|brrip|dvdrip|x264|x265|hevc)\b.*$/i,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
module.exports=function movieFolder(item,section){
 if(!item||!['movie','film'].includes(item.type)||!item.path||!path.isAbsolute(item.path))return item;
 const original=path.normalize(item.path),fold=s=>s.toLowerCase().replace(/[\\/]+$/,'');
 const roots=(Array.isArray(section?.main_path)?section.main_path:String(section?.main_path||'').split(',')).filter(x=>x&&path.isAbsolute(x)).map(x=>path.normalize(x)).filter(x=>fold(original).startsWith(fold(x)+path.sep)).sort((a,b)=>b.length-a.length);
 if(!roots.length)return item;
 const root=roots[0],names=new Set([clean(item.name)]);names.delete('');
 let directory=(item.files||[]).some(f=>fold(f.path||'')===fold(original))?path.dirname(original):original;
 let selected=original;
 while(fold(directory)!==fold(root)&&directory!==path.dirname(directory)){
  if(names.has(clean(path.basename(directory))))selected=directory;
  directory=path.dirname(directory);
 }
 return selected===original?item:{...item,path:selected};
};
