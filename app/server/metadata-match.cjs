'use strict';
const normal=require('./metadata-titles.cjs').normalize;
const names=row=>[row.title,row.original_title,row.name,row.original_name].filter(Boolean);
const date=row=>String(row.release_date||row.first_air_date||'');
const exact=(row,query)=>names(row).some(name=>normal(name)===normal(query));
// A complete, distinctive subtitle can identify a special; arbitrary substrings cannot.
const segment=(row,query)=>normal(query).split(' ').length>=4&&names(row).some(name=>String(name).split(/[:：]|\s[-–—]\s/).some(part=>normal(part)===normal(query)));
const candidate=(row,kind)=>({id:row.id,kind,title:row.title||row.name||'',original:row.original_title||row.original_name||'',date:date(row),overview:String(row.overview||'').slice(0,650),poster:/^\/[a-zA-Z0-9_.-]+$/.test(row.poster_path||'')?row.poster_path:''});
const failure=(message,status)=>Object.assign(Error(message),{status});
module.exports=async function matchTitle({query,year,kind,api}){
 const choose=(rows,type)=>{const unique=[...new Map(rows.map(row=>[row.id,row])).values()];if(unique.length>1)throw Object.assign(failure('توجد عدة أعمال بهذا الاسم والسنة؛ اختر العمل الصحيح من نتائج المزامنة',409),{matches:unique.slice(0,20).map(row=>candidate(row,type))});return unique.length?{id:unique[0].id,kind:type}:null;};
 async function search(type){
  const params={query,language:'en-US',include_adult:'false'};if(year&&type==='movie')params.year=year;
  const found=await api('search/'+type,params),rows=new Map((found.results||[]).map(row=>[row.id,row]));
  const direct=[...rows.values()].filter(row=>exact(row,query)&&(!year||date(row).startsWith(year)));
  const immediate=choose(direct,type);if(immediate)return immediate;
  // Undated records cannot outrank a dated match or hide one in the other media type.
  return {pending:rows,undated:[...rows.values()].filter(row=>exact(row,query)&&!date(row))};
 }
 async function enrich(type,rows,params){
  if(year&&type==='movie'){const unfiltered={...params};delete unfiltered.year;const result=await api('search/'+type,unfiltered);for(const row of result.results||[])rows.set(row.id,row);}
  if(/\p{Script=Arabic}/u.test(query)){const result=await api('search/'+type,{...params,language:'ar-SA'});for(const row of result.results||[])rows.set(row.id,row);}
  const valid=[];
  // Search-ranked shortlist only; no catalogue-wide alternative-title requests.
  const shortlist=[...rows.values()].sort((a,b)=>Number(exact(b,query)||segment(b,query))-Number(exact(a,query)||segment(a,query))).slice(0,5);
  for(const row of shortlist){
   let titleOK=exact(row,query)||segment(row,query);
   if(!titleOK){const aliases=await api(type+'/'+row.id+'/alternative_titles',{});titleOK=(aliases.titles||aliases.results||[]).some(alias=>normal(alias.title)===normal(query));}
   if(!titleOK)continue;
   let yearOK=!year||date(row).startsWith(year);
   if(!yearOK&&type==='movie'&&date(row)&&Math.abs(Number(date(row).slice(0,4))-Number(year))<=1){const releases=await api('movie/'+row.id+'/release_dates',{});yearOK=(releases.results||[]).some(country=>(country.release_dates||[]).some(release=>String(release.release_date||'').startsWith(year)));}
   if(yearOK)valid.push(row);
  }
  return choose(valid,type);
 }
 const first=await search(kind);if(first?.id)return first;
 const other=kind==='movie'?'tv':'movie';let second;
 if(year){second=await search(other);if(second?.id)return second;}
 const params={query,language:'en-US',include_adult:'false',...(year&&kind==='movie'?{year}:{})};
 const enriched=await enrich(kind,first.pending,params);if(enriched)return enriched;
 if(second){const result=await enrich(other,second.pending,{query,language:'en-US',include_adult:'false',...(other==='movie'?{year}:{})});if(result)return result;}
 // Preserve support for provider records without a date only within the declared type.
 const undated=choose(first.undated,kind);if(undated)return undated;
 throw failure('لم توجد مطابقة مؤكدة للاسم والسنة حتى بعد فحص العناوين البديلة: '+query+(year?' ('+year+')':''),404);
};
