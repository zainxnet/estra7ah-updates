'use strict';
module.exports=function({db,roots,connected,hybrid,clock,message}){
 const ids=JSON.stringify(roots.map(r=>r.id)),stamp=value=>new Date(value).toLocaleString('ar',{hour:'2-digit',minute:'2-digit',second:'2-digit'});
 const retry=db.prepare(`SELECT root,relative,due,attempts FROM dirs WHERE attempts>0 AND root IN(SELECT value FROM json_each(?)) AND (?=0 OR root IN(SELECT id FROM roots WHERE ready=1)) UNION ALL SELECT root,relative,due,attempts FROM pending WHERE attempts>0 AND root IN(SELECT value FROM json_each(?)) ORDER BY due LIMIT 1`).get(ids,hybrid?1:0,ids);
 if(retry){const root=roots.find(r=>r.id===retry.root),error=db.prepare('SELECT error FROM roots WHERE id=?').get(retry.root)?.error;return message('retry','إعادة محاولة «'+root.name+' / '+retry.relative+'» — '+(error||'تعذر إكمال الإضافة')+' — المحاولة '+retry.attempts+' — الموعد '+stamp(retry.due));}
 if(hybrid){
  const initializing=db.prepare('SELECT h.* FROM hybrid_scan h JOIN roots r ON r.id=h.root WHERE r.ready=0 AND h.root IN(SELECT value FROM json_each(?)) ORDER BY h.due').all(ids);
  const running=initializing.find(h=>connected.has(h.root)&&h.total!==0);
  if(running){const root=roots.find(r=>r.id===running.root);return message('baseline','بانتظار دفعة المرجع من Everything — '+root.name+' — قُرئت '+running.offset+(running.total!=null?' من '+running.total:'')+' — الموعد '+stamp(Math.max(clock(),running.due)));}
  const empty=initializing.find(h=>connected.has(h.root)&&h.total===0);
  if(empty){const root=roots.find(r=>r.id===empty.root);return message('waiting','المراقبة تعمل؛ لا توجد فيديوهات مفهرسة للمسار «'+root.name+'» — إعادة التحقق '+stamp(empty.due)+'؛ لا توجد مزامنة جارية لهذا المسار');}
 }
 const offline=roots.filter(r=>!connected.has(r.id));
 if(offline.length)return message('retry','المراقبة تعمل لبقية المسارات؛ تعذر اتصال '+offline.length+' مسار — '+offline[0].name+' — ستعاد محاولة الاتصال تلقائيًا');
 if(db.prepare('SELECT 1 FROM files WHERE known=0 AND root IN(SELECT value FROM json_each(?)) LIMIT 1').get(ids))return message('waiting','بانتظار ثبات الملفات الجديدة قبل إضافتها؛ الملفات المعروفة لا يعاد فحصها');
 return message('waiting','المراقبة المباشرة تعمل؛ لا توجد إضافات مكتشفة بانتظار المزامنة');
};
