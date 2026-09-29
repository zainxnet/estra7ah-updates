'use strict';
// Text-only agreement adapter; preserves the original consent handler and layout.
const heading='اقر واتعهد بالالتزام بشروط استراحه زين التالية :';
const extra='التزم بعدم فك اكواد الاستراحة او تحليلها او تعديلها او نسخ بياناتها باي وكيل ذكاء اصطناعي ويعتبر هذا التحليل او الفك او التعديل عمل غير شرعي تتحمل مسئوليته المستخدم وشركة الذكاء الاصطناعي بشكل واضح وصريح';
module.exports=function(source){
 let found=0,last;
 let text=source.replace(/(?<=children:)"(?:\\.|[^"\\])*"/g,raw=>{let s;try{s=JSON.parse(raw)}catch{return raw}
 if(s==='اقر واتعهد بالالتزام بشروط استراحه بروفاشنال التالية :'){found++;return JSON.stringify(heading)}
 if(s.startsWith('التزم واتعهد واحلف بالله'))s=s.replace('باسم شبكتي','باسم محلي او شبكتي');
 if(s.startsWith('التزم واتعهد بعدم نشر'))s=s.replace('شركة يايتك او نظام استراحه بروفاشنال','استراحة زين ');
 if(s.startsWith('اقر بان شركه يايتك استراحه بروفاشنال'))s=s.replace('شركه يايتك استراحه بروفاشنال','استراحة زين  ');
 if(s.startsWith('التزم بعدم بث استراحتي'))last=JSON.stringify(s);
 return s===JSON.parse(raw)?raw:JSON.stringify(s);
 });
 if(!found)return source;
 // Locate only the last agreement bullet, regardless of escaped Arabic encoding.
 const pattern=/Object\(([\w$]+)\.jsx\)\("li",\{style:\{marginBottom:20\},children:("(?:\\.|[^"\\])*")\}\)/g;
 let added=0;
 text=text.replace(pattern,(all,alias,raw)=>{if(JSON.stringify(JSON.parse(raw))!==last)return all;added++;return all+',Object('+alias+'.jsx)("li",{style:{marginBottom:20},children:'+JSON.stringify(extra)+'})'});
 if(added<found)throw Error('Agreement final bullet changed');
 return text;
};
