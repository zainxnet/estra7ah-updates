'use strict';
const crypto=require('node:crypto');
// Reuse only the unified recent-video response, never walk every movie root.
module.exports=function({db,movieState}){
 db.exec('CREATE TABLE IF NOT EXISTS movie_recovery(root TEXT,folder TEXT,relative TEXT,signature TEXT,seen REAL,status TEXT,PRIMARY KEY(root,folder))');
 const get=db.prepare('SELECT * FROM movie_recovery WHERE root=? AND folder=?');
 const put=db.prepare('INSERT OR REPLACE INTO movie_recovery VALUES(?,?,?,?,?,?)');
 function consider(root,file,relative,now){
  if(root.kind!=='movies'||!movieState)return;
  const folder=relative.split('/')[0].toLowerCase(),old=get.get(root.id,folder);
  if(old?.status==='done'||old?.status==='queued')return;
  if(movieState(root,relative)!=='missing'){
   if(old)db.prepare('DELETE FROM movie_recovery WHERE root=? AND folder=?').run(root.id,folder);
   return;
  }
  // One stable representative video per movie, including quality subfolders.
  if(old&&old.relative.toLowerCase()!==relative.toLowerCase())return;
  const signature=String(file.size)+':'+String(file.date_modified);
  if(!old||old.signature!==signature){put.run(root.id,folder,relative,signature,now,'candidate');return 'waiting';}
  if(now-old.seen<30000||!(Number(file.size)>0))return 'waiting';
  const id='movie-recovery-'+crypto.createHash('sha256').update(root.id+'\0'+folder).digest('hex');
  const event={id,relative,size:Number(file.size),detectedAt:Math.floor(now/1000),recovery:true};
  db.prepare('INSERT OR IGNORE INTO pending(id,root,relative,payload) VALUES(?,?,?,?)').run(id,root.id,relative,JSON.stringify(event));
  put.run(root.id,folder,relative,signature,old.seen,'queued');
  return 'queued';
 }
 function finish(root,events){for(const event of events)if(event.recovery)db.prepare('UPDATE movie_recovery SET status=? WHERE root=? AND folder=?').run('done',root.id,event.relative.split('/')[0].toLowerCase());}
 return {consider,finish};
};
