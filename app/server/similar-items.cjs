'use strict';
const normalize=value=>String(value||'').normalize('NFKC').toLowerCase().replace(/[\u064b-\u065f\u0670]/g,'').replace(/[^\p{L}\p{N}]+/gu,' ').trim();
function tags(value){
 if(typeof value==='string'){try{const parsed=JSON.parse(value);if(Array.isArray(parsed))value=parsed;}catch{}}
 return new Set((Array.isArray(value)?value:String(value||'').split(/[,،|]/)).map(x=>normalize(typeof x==='object'?x?.name:x)).filter(x=>x&&x!=='null'&&x!=='undefined'));
}
const family=type=>type==='movie'||type==='film'?'movie':type==='tv'||type==='series'||String(type).startsWith('series.')?'series':null;
module.exports=function({items,sections,genre,type,excludeId,limit=20}){
 const wanted=tags(genre),kind=family(type);if(!kind||!wanted.size)return [];
 const bySection=new Map(sections.map(s=>[s.id,s]));
 const visible=id=>{const seen=new Set();while(id&&id!=='null'){if(seen.has(id))return false;seen.add(id);const s=bySection.get(id);if(!s||s.is_hidden==='yes')return false;id=s.in_section;}return true;};
 return items.filter(item=>item.id!==excludeId&&(!item.inItem||item.inItem==='null')&&family(item.type)===kind&&visible(item.sectionId)).map(item=>{
  let data={};try{data=JSON.parse(item.content?.contentJSON||'{}')}catch{}
  const candidate=tags(data.tagsArabic||data.genres||[]),score=[...wanted].filter(tag=>candidate.has(tag)).length;
  return {item,score,rating:Number(item.content?.imdb_ratings||data.imdbRating)||0};
 }).filter(row=>row.score>0).sort((a,b)=>b.score-a.score||b.rating-a.rating||String(a.item.id).localeCompare(String(b.item.id))).slice(0,limit).map(row=>row.item);
};
