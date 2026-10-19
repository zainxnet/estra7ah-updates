'use strict';
module.exports=function(db){
 db.exec('CREATE TABLE IF NOT EXISTS path_checks(root TEXT PRIMARY KEY,payload TEXT NOT NULL)');
 const values=new Map(db.prepare('SELECT root,payload FROM path_checks').all().map(row=>[row.root,JSON.parse(row.payload)]));
 const put=db.prepare('INSERT INTO path_checks(root,payload) VALUES(?,?) ON CONFLICT(root) DO UPDATE SET payload=excluded.payload');
 return {
  get:id=>values.get(id),
  set(id,value){put.run(id,JSON.stringify(value));values.set(id,value);},
  clear(){db.exec('DELETE FROM path_checks');values.clear();}
 };
};
