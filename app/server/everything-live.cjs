'use strict';
// Small session-only activity journal; no network or persistent log writes.
module.exports=function(clock){
 const entries=[],pages=new Map();let sequence=0;
 function record(stage,message,details={}){
  const previous=entries[0];
  if(previous?.stage===stage&&previous.message===message)return;
  entries.unshift({id:++sequence,at:clock(),stage,message,...details});
  entries.length=Math.min(entries.length,24);
 }
 function begin(scope,{offset=0,total=null,label='',baseline=false}={}){
  if(!offset||!pages.has(scope))pages.set(scope,{received:0,matched:0,known:0,waiting:0,queued:0});
  record(baseline?'baseline':'search',baseline?'بدأ تسجيل المرجع الأول للقسم «'+label+'»؛ الموجود حاليًا لن يُعتبر جديدًا':scope==='recent'?'بدأ البحث عن الفيديوهات الحديثة في Everything لجميع المسارات الجاهزة':'بدأت المراجعة اليومية لفهرس القسم «'+label+'»', {scope,label,offset,total});
 }
 function matching(scope,count,total,label){record('matching','وصلت '+count+' نتيجة من Everything؛ جارٍ مطابقتها بالمسارات والملفات السابقة'+(label?' في «'+label+'»':''),{scope,total});}
 function finish(scope,counts,{done,total,offset,label='',baseline=false}={}){
  const sum=pages.get(scope)||{received:0,matched:0,known:0,waiting:0,queued:0};
  for(const key of Object.keys(sum))sum[key]+=counts[key]||0;
  pages.set(scope,sum);
  const progress='قُرئت '+offset+' من '+total+' نتيجة';
  const outcome=baseline?'سُجّلت الملفات مرجعًا دون إضافتها إلى الجديد':sum.queued?'وُضع '+sum.queued+' ملفًا في انتظار التحقق ومزامنة القسم':sum.waiting?'يوجد '+sum.waiting+' ملفًا مرشحًا؛ بانتظار ثباته في الفحص التالي':'لم نجد محتوى جديدًا يحتاج المزامنة في هذه النتائج';
  record(done?'result':'page',(done?'اكتملت ':'تستمر ')+(scope==='recent'?'مطابقة الفيديوهات الحديثة':'مراجعة «'+label+'»')+' — '+progress+'؛ مطابقة للمسارات: '+sum.matched+'؛ معروفة سابقًا: '+sum.known+'؛ '+outcome,{scope,label,counts:{...sum},total,offset,done});
  if(done)pages.delete(scope);
 }
 function snapshot(extra={}){return {...extra,current:entries[0]?{...entries[0]}:null,entries:entries.map(row=>({...row}))};}
 function clear(){entries.length=0;}
 return {record,begin,matching,finish,snapshot,clear};
};
