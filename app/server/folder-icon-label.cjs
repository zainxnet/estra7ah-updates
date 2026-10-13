'use strict';
const {seasonNumber}=require('./folder-icon-source.cjs');
const arabic=value=>typeof value==='string'&&/\p{Script=Arabic}/u.test(value);
const tidy=value=>String(value||'').replace(/[\p{Cf}\x00-\x1f\x7f]/gu,'').trim();
function folderTitle(value){
 let text=tidy(value);const year='(?:18|19|20)\\d{2}',dated='[\\(\\[]\\s*'+year+'(?:\\s*[-–—]\\s*(?:'+year+')?)?\\s*[\\)\\]]';
 text=text.replace(new RegExp('^(?:\\s*'+dated+'\\s*)+'),'');
 const match=new RegExp('\\s*'+dated+'|\\s+'+year+'\\b').exec(text);
 if(match&&match.index>0)text=text.slice(0,match.index);
 return text.replace(/\s+[-–—]\s*\d{1,3}\s*$/,'').trim()||tidy(value);
}
function stored(item){try{const data=JSON.parse(item?.content?.contentJSON||'{}');return data.content_id&&['tv','movie'].includes(data.tmdbType)&&arabic(data.titleArabic)?tidy(data.titleArabic):'';}catch{return '';}}
function season(value){const number=seasonNumber(value),names=['الأول','الثاني','الثالث','الرابع','الخامس','السادس','السابع','الثامن','التاسع','العاشر','الحادي عشر','الثاني عشر'];return number===null?folderTitle(value):number===0?'حلقات خاصة':'الموسم '+(names[number-1]||number);}
module.exports={arabic,stored,folderTitle,season};
