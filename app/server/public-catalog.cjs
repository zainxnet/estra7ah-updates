'use strict';
const path=require('node:path');
const aliases={film:'movie',tv:'series.tv',anime:'series.anime',kids:'series.kids',deen:'series.deen',sports:'series.sports',learn:'series.learn',ramadan:'series.ramadan'};
const publicType=type=>aliases[type]||type;
const hasDetail=type=>['movie','season','singer'].includes(publicType(type))||/^series(?:\.|$)/.test(publicType(type)||'');
function detailContent(content){
 let parsed={};try{parsed=JSON.parse(content?.contentJSON||'{}')}catch{}
 if(!parsed||typeof parsed!=='object'||Array.isArray(parsed))parsed={};
 const normalized={...parsed};
 for(const key of ['Runtime','ReleaseDate','descArabic','descEnglish','imdbRating','imdbVotes','MPAA'])normalized[key]=typeof parsed[key]==='string'||typeof parsed[key]==='number'?String(parsed[key]):'';
 for(const key of ['castEnglish','castArabic','tagsArabic','tagsEnglish','directedByEnglish','directedByArabic'])normalized[key]=(Array.isArray(parsed[key])?parsed[key]:typeof parsed[key]==='string'?parsed[key].split(','):[]).filter(v=>typeof v==='string'&&v.trim());
 return {...content,contentJSON:JSON.stringify(normalized)};
}
function pathKey(item){return typeof item.path==='string'&&item.path.trim()?path.win32.normalize(item.path.trim()).toLowerCase().replace(/[\\/]+$/,''):'';}
function uniqueSearch(rows,sectionExists,childrenCount){
 const winners=new Map(),order=[];
 const score=item=>(hasDetail(item.type)?100:0)+(sectionExists(item.sectionId)?20:0)+Math.min(10,(item.files||[]).length)+(childrenCount(item.id)?10:0)+(item.content?.contentJSON?1:0);
 for(const item of rows){const key=pathKey(item)||'id:'+item.id,previous=winners.get(key);if(!previous){order.push(key);winners.set(key,item)}else if(score(item)>score(previous))winners.set(key,item);}
 return order.map(key=>winners.get(key));
}
module.exports={publicType,hasDetail,detailContent,uniqueSearch};
