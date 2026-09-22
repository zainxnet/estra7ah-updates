'use strict';
// These legacy built-in sections carry their titles in cover artwork, not in name.
const legacyNames={'ID-8812641051662403900':'أفلام','ID-2439320021662468968':'مسلسلات','ID-7898200331662469079':'تلفزيون'};
const typeNames={movies:'أفلام',serieses:'مسلسلات','serieses.tv':'برامج تلفزيونية','serieses.sports':'رياضة','serieses.learn':'تعليم','serieses.deen':'إسلاميات'};
module.exports=function navigation(sections,selected){
 const byId=new Map(sections.map(s=>[String(s.id),s]));
 function target(s){const seen=new Set();while(s&&s.type==='linked'){if(seen.has(String(s.id)))return null;seen.add(String(s.id));if(s.is_hidden==='yes')return null;s=byId.get(String(s.linkedId))}return s&&s.is_hidden!=='yes'?s:null}
 function row(s){if(!s||s.is_hidden==='yes')return null;const to=target(s);if(!to)return null;return {id:String(s.id),name:String(s.name||'').trim()||legacyNames[s.id]||String(to.name||'').trim()||legacyNames[to.id]||typeNames[to.type]||'قسم بدون اسم',type:to.type,href:(to.type==='main'?'/sections/':'/items/')+encodeURIComponent(to.id)}}
 const output=[],seen=new Set();for(const id of Array.isArray(selected)?selected:[]){if(seen.has(String(id)))continue;seen.add(String(id));const section=byId.get(String(id)),item=row(section);if(!item)continue;const parent=target(section);item.children=sections.filter(s=>String(s.in_section)===String(parent.id)).sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(row).filter(Boolean);output.push(item)}return {sections:output};
};
