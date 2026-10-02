'use strict';
const fs=require('node:fs'),path=require('node:path');
const automatic=/^zain-auto-quick-\d{4}-\d{2}-\d{2}T[\d-]+Z\.zip$/;
function prune(root){root=fs.realpathSync(root);const rows=fs.readdirSync(root).filter(n=>automatic.test(n)).map(name=>({name,stat:fs.lstatSync(path.join(root,name))})).filter(r=>r.stat.isFile()&&!r.stat.isSymbolicLink()).sort((a,b)=>b.name.localeCompare(a.name));for(const row of rows.slice(10)){const file=path.resolve(root,row.name);if(path.dirname(file)!==root)throw Error('Unsafe backup path');fs.unlinkSync(file);}return rows.slice(10).length;}
module.exports={automatic,prune};
