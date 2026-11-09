'use strict';
const path=require('node:path'),crypto=require('node:crypto'),safe=require('./episode-path.cjs');
module.exports=function({db,clock,request,queue,message}){
 db.exec(`CREATE TABLE IF NOT EXISTS hybrid_scan(root TEXT PRIMARY KEY,offset INTEGER DEFAULT 0,total INTEGER,due REAL DEFAULT 0,previous TEXT DEFAULT '',generation INTEGER DEFAULT 0);
 CREATE TABLE IF NOT EXISTS hybrid_names(root TEXT,name TEXT,relative TEXT,PRIMARY KEY(root,name));
 CREATE TABLE IF NOT EXISTS hybrid_events(root TEXT,name TEXT,relative TEXT,created INTEGER,PRIMARY KEY(root,name));`);
 let config=null,nextRequest=0;
 function configure(value){config=value;nextRequest=0;}
 function reconnect(root){const added=db.prepare('INSERT OR IGNORE INTO hybrid_scan(root) VALUES(?)').run(root.id).changes;if(added&&db.prepare('SELECT ready FROM roots WHERE id=?').get(root.id)?.ready)db.prepare('DELETE FROM dirs WHERE root=? AND deep=1').run(root.id);db.prepare('UPDATE hybrid_scan SET due=MIN(due,?) WHERE root=?').run(clock()+30000,root.id);}
 function change(root,relative,action){if(db.prepare('SELECT ready FROM roots WHERE id=?').get(root.id)?.ready)return;db.prepare('INSERT INTO hybrid_events VALUES(?,?,?,?) ON CONFLICT(root,name) DO UPDATE SET created=MAX(created,excluded.created)').run(root.id,relative.toLowerCase(),relative,action==='Created'||action==='Renamed'?1:0);}
 function reset(root){db.prepare('DELETE FROM hybrid_names WHERE root=?').run(root.id);db.prepare("UPDATE hybrid_scan SET offset=0,total=NULL,previous='',generation=generation+1,due=? WHERE root=?").run(clock()+30000,root.id);}
 function disconnected(root){reset(root);}
 async function step(roots,connected){
  if(!config||clock()<nextRequest)return false;
  const ids=JSON.stringify(roots.filter(r=>connected.has(r.id)).map(r=>r.id));
  const state=db.prepare('SELECT h.*,r.ready FROM hybrid_scan h JOIN roots r ON r.id=h.root WHERE h.root IN (SELECT value FROM json_each(?)) AND h.due<=? ORDER BY r.ready,h.due,h.rowid LIMIT 1').get(ids,clock());if(!state)return false;
  const root=roots.find(r=>r.id===state.root);nextRequest=clock()+(state.ready?5000:1000);
  message(state.ready?'checking':'baseline',(state.ready?'مراجعة احتياطية محدودة لفهرس Everything':'أخذ المرجع الأول من Everything')+' — '+root.name+' — قُرئت '+state.offset+' نتيجة');
  try{
   const search='file: "'+root.path.replace(/[\\/]+$/,'')+'\\" ext:mp4;m4v;mkv;avi;mov;wmv;webm;flv;ts;mts;m2ts;mpg;mpeg;3gp';
   const data=await request(config,{search,offset:state.offset,count:500});
   if(!connected.has(root.id)||db.prepare('SELECT generation FROM hybrid_scan WHERE root=?').get(root.id).generation!==state.generation)return true;
   const total=Number(data.totalResults);if(!Number.isSafeInteger(total)||total<0||!Array.isArray(data.results)||data.results.length>500)throw Error('استجابة فهرس غير صالحة');
   if(!total){db.prepare('UPDATE hybrid_scan SET total=0,offset=0,due=? WHERE root=?').run(clock()+300000,root.id);message('waiting','لا توجد نتائج فيديو في Everything لهذا المسار؛ ينتظر ظهوره ولا يعتبر أول نتيجة لاحقة محتوى جديدًا — '+root.name);return true;}
   if((state.offset>0&&state.total!==total)||(!data.results.length&&state.offset<total)){reset(root);message('retry','تغيّر فهرس Everything أثناء القراءة؛ ستعاد مطابقة المرجع — '+root.name);return true;}
   db.exec('BEGIN');try{
    for(const file of data.results){if(file.type!=='file'||!safe.eligible(file.name)||path.win32.basename(file.name)!==file.name)continue;
     const relative=path.win32.relative(root.path,path.win32.join(file.path,file.name)).replace(/\\/g,'/');if(!relative||relative.startsWith('../')||path.win32.isAbsolute(relative))continue;safe.relative(relative);
     db.prepare('INSERT OR IGNORE INTO hybrid_names VALUES(?,?,?)').run(root.id,relative.toLowerCase(),relative);
    }
    const offset=state.offset+data.results.length;db.prepare('UPDATE hybrid_scan SET offset=?,total=? WHERE root=?').run(offset,total,root.id);
    if(offset>=total){
     const hash=crypto.createHash('sha256');for(const row of db.prepare('SELECT name FROM hybrid_names WHERE root=? ORDER BY name').iterate(root.id))hash.update(row.name+'\0');const digest=hash.digest('hex');
     // A second identical pass catches shifted pages, including equal-count renames.
     if(!state.ready&&digest!==state.previous){db.prepare('DELETE FROM hybrid_names WHERE root=?').run(root.id);db.prepare('UPDATE hybrid_scan SET offset=0,total=NULL,previous=?,due=? WHERE root=?').run(digest,clock(),root.id);}
     else {
      const events=db.prepare('SELECT * FROM hybrid_events WHERE root=?').all(root.id),newEvents=new Set(events.filter(e=>e.created).map(e=>e.name));
      if(!state.ready)db.prepare('DELETE FROM dirs WHERE root=? AND deep=1').run(root.id);
      for(const file of db.prepare('SELECT * FROM hybrid_names WHERE root=?').iterate(root.id)){
       if(db.prepare('SELECT 1 FROM files WHERE root=? AND name=?').get(root.id,file.name))continue;
       let ancestor=file.name,arrived=newEvents.has(ancestor);while(!arrived&&ancestor.includes('/')){ancestor=path.posix.dirname(ancestor);arrived=newEvents.has(ancestor);}
       if(!state.ready&&!arrived)db.prepare('INSERT INTO files VALUES(?,?,?,?,?,?,1)').run(root.id,file.name,file.relative,0,0,clock());
       else {const parent=path.posix.dirname(file.relative);queue(root.id,parent==='.'?'':parent,false);}
      }
      if(!state.ready){
       // Replace unfinished broad traversal with durable event work, keeping file reference/pending intact.
       db.prepare('UPDATE roots SET ready=1 WHERE id=?').run(root.id);
      }
      for(const event of events){const parent=path.posix.dirname(event.relative);queue(root.id,parent==='.'?'':parent,false);}
      db.prepare('DELETE FROM hybrid_events WHERE root=?').run(root.id);db.prepare('DELETE FROM hybrid_names WHERE root=?').run(root.id);
      db.prepare("UPDATE hybrid_scan SET offset=0,total=NULL,previous='',due=? WHERE root=?").run(clock()+86400000,root.id);
      message('waiting',(state.ready?'اكتملت مراجعة الفهرس؛ ستُفحص المجلدات التي تحتوي أسماء غير معروفة فقط':'اكتمل المرجع من Everything؛ جارٍ مراجعة التغييرات المحفوظة أثناء التهيئة')+' — '+root.name);
     }
    }
    db.prepare('UPDATE roots SET last_success=?,error=? WHERE id=?').run(clock(),'',root.id);db.exec('COMMIT');
   }catch(e){db.exec('ROLLBACK');throw e;}
  }catch(e){db.prepare('UPDATE hybrid_scan SET due=? WHERE root=?').run(clock()+60000,root.id);db.prepare('UPDATE roots SET error=? WHERE id=?').run(String(e.message),root.id);message('retry','تعذر فهرس Everything؛ تستمر مراقبة المسارات المهيأة — '+e.message);}
  return true;
 }
 return {configure,reconnect,change,disconnected,step,active:()=>!!config};
};
