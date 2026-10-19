'use strict';
// Keep the original reference time across polls/restarts. A moving "last check"
// time would incorrectly reject genuine copies seen late by Everything.
module.exports=function(db){
 db.exec('CREATE TABLE IF NOT EXISTS content_reference(root TEXT PRIMARY KEY,started REAL NOT NULL)');
 const put=db.prepare('INSERT OR IGNORE INTO content_reference(root,started) VALUES(?,?)');
 // Existing installations already store when each baseline file was observed.
 // Backfill once from SQLite, without another Everything or media-directory scan.
 for(const row of db.prepare('SELECT id FROM roots WHERE NOT EXISTS(SELECT 1 FROM content_reference c WHERE c.root=roots.id)').all()){
  const first=db.prepare('SELECT min(seen) started FROM files WHERE root=? AND known=1').get(row.id)?.started;
  if(first>0)put.run(row.id,first);
 }
 return {start:(id,now)=>put.run(id,now),get:id=>db.prepare('SELECT started FROM content_reference WHERE root=?').get(id)?.started||0};
};
