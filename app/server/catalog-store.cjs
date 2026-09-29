'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function(base){
 const file=path.join(base,'data/catalog.sqlite'),compact=require('./compact-catalog-store.cjs'),migration=require('./compact-migration.cjs');let backend;const dirty=new Set();
 function ensure(){if(!backend){migration.recover(base);if(fs.existsSync(file)&&migration.cafe(base)&&!compact.present(file)&&migration.hasSnapshot(file))migration.convert(base);backend=fs.existsSync(file)&&compact.present(file)?compact.open(file):require('./legacy-catalog-store.cjs')(base);}return backend;}
 return {file,markDirty:id=>dirty.add(id),get compact(){return fs.existsSync(file)&&compact.present(file)},
  read:()=>ensure().read(),
  write:value=>{const current=ensure();if(migration.cafe(base)&&!compact.present(file)){current.close?.();migration.convert(base,value);backend=compact.open(file);backend.read();return true;}const result=current.write(value,dirty);dirty.clear();return result;},
  importLegacy:onProgress=>ensure().importLegacy?.(onProgress)||false,
  readState:key=>ensure().readState(key),writeState:(...args)=>ensure().writeState(...args),
  close:()=>{backend?.close?.();backend=undefined;}
 };
};