'use strict';
const path=require('node:path'),crypto=require('node:crypto');
const key=value=>path.resolve(value).toLowerCase().replace(/[\\/]+$/,'');
const contains=(root,file)=>{const r=key(root),f=key(file);return f===r||f.startsWith(r+path.sep);};
function complete(db,sectionId,root,ids){
 const wanted=new Set(ids),obsolete=[];
 for(const row of db.prepare("SELECT id,json_extract(payload,'$.path') path FROM records WHERE json_extract(payload,'$.sectionId')=?").iterate(sectionId))if(row.path&&contains(root,row.path)&&!wanted.has(row.id))obsolete.push(row.id);
 db.exec('CREATE TABLE IF NOT EXISTS movie_scans(section_id TEXT,root TEXT,stamp TEXT,ids TEXT,PRIMARY KEY(section_id,root))');
 const scope={sectionId,root:path.resolve(root),stamp:crypto.randomUUID()};
 db.exec('BEGIN IMMEDIATE');try{
  const remove=db.prepare('DELETE FROM records WHERE id=?');for(const id of obsolete)remove.run(id);
  db.prepare('INSERT INTO movie_scans VALUES(?,?,?,?) ON CONFLICT(section_id,root) DO UPDATE SET stamp=excluded.stamp,ids=excluded.ids').run(sectionId,scope.root,scope.stamp,JSON.stringify(ids));
  db.exec('COMMIT');return scope;
 }catch(error){db.exec('ROLLBACK');throw error;}
}
function pending(db){
 if(!db.prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='movie_scans'").get())return [];
 return db.prepare('SELECT section_id sectionId,root,stamp FROM movie_scans').all();
}
function records(db,scope){const saved=db.prepare('SELECT ids,stamp FROM movie_scans WHERE section_id=? AND root=?').get(scope.sectionId,scope.root);if(!saved||saved.stamp!==scope.stamp)throw Error('تغيرت نتيجة المزامنة');const hydrate=require('./shared-scan-store.cjs').reader(db);return db.prepare('SELECT r.payload FROM json_each(?) ids JOIN records r ON r.id=ids.value ORDER BY r.rowid').all(saved.ids).map(row=>hydrate(row.payload));}
module.exports={contains,complete,pending,records,key:scope=>String(scope.sectionId)+'|'+key(scope.root)};
