'use strict';
const crypto=require('node:crypto');
const {DatabaseSync}=require('node:sqlite');

// A bounded change journal: one entry per scanner record, maintained in the
// same SQLite transaction as that record. File dates and WAL checkpoints do
// not indicate a logical catalog change.
function initialize(db){
 db.exec(`CREATE TABLE IF NOT EXISTS zain_catalog_revision (singleton INTEGER PRIMARY KEY CHECK(singleton=1), identity TEXT NOT NULL, revision INTEGER NOT NULL);
 CREATE TABLE IF NOT EXISTS zain_catalog_changes (id TEXT PRIMARY KEY, revision INTEGER NOT NULL, deleted INTEGER NOT NULL, deleted_revision INTEGER NOT NULL);
 CREATE INDEX IF NOT EXISTS zain_catalog_changes_revision ON zain_catalog_changes(revision);`);
 db.prepare('INSERT OR IGNORE INTO zain_catalog_revision VALUES (1,?,0)').run(crypto.randomUUID());
 for(const [event,reference,deleted,condition] of [['INSERT','NEW',0,''],['UPDATE','NEW',0,'WHEN OLD.payload<>NEW.payload OR OLD.id<>NEW.id'],['DELETE','OLD',1,'']]){
  db.exec(`CREATE TRIGGER IF NOT EXISTS zain_catalog_${event.toLowerCase()} AFTER ${event} ON records ${condition} BEGIN
   UPDATE zain_catalog_revision SET revision=revision+1 WHERE singleton=1;
   INSERT INTO zain_catalog_changes VALUES (${reference}.id,(SELECT revision FROM zain_catalog_revision WHERE singleton=1),${deleted},${deleted?'(SELECT revision FROM zain_catalog_revision WHERE singleton=1)':'0'})
   ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,deleted=excluded.deleted,deleted_revision=MAX(zain_catalog_changes.deleted_revision,excluded.deleted_revision);
   ${event==='UPDATE'?`INSERT INTO zain_catalog_changes SELECT OLD.id,revision,1,revision FROM zain_catalog_revision WHERE singleton=1 AND OLD.id<>NEW.id
   ON CONFLICT(id) DO UPDATE SET revision=excluded.revision,deleted=1,deleted_revision=excluded.deleted_revision;`:''}
  END;`);
 }
}
function cursor(db){return db.prepare('SELECT identity,revision FROM zain_catalog_revision WHERE singleton=1').get()||null;}
function snapshot(file){let db;try{db=new DatabaseSync(file,{readOnly:true});return cursor(db);}catch{return null;}finally{db?.close();}}
function changes(file,previous,limit=10000){let db;try{
 if(!previous)return null;
 db=new DatabaseSync(file,{readOnly:true});db.exec('BEGIN');
 const current=cursor(db);
 if(!current||current.identity!==previous.identity||current.revision<previous.revision)return null;
 const changed=db.prepare('SELECT id,deleted,deleted_revision FROM zain_catalog_changes WHERE revision>? ORDER BY revision LIMIT ?').all(previous.revision,limit+1);
 if(changed.length>limit||changed.some(row=>row.deleted||row.deleted_revision>previous.revision))return null;
 const records=db.prepare('SELECT r.id,r.payload FROM zain_catalog_changes c JOIN records r ON r.id=c.id WHERE c.revision>? ORDER BY r.rowid').all(previous.revision),hydrate=require('./shared-scan-store.cjs').reader(db),rows=records.map(row=>hydrate(row.payload));
 if(rows.some((row,i)=>row.id!==records[i].id))return null;
 if(rows.length!==changed.length)return null;
 return {cursor:current,rows};
 }catch{return null;}finally{db?.close();}}
module.exports={initialize,snapshot,changes};
