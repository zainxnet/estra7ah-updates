'use strict';
// Restores a verified Zain backup into a fresh installation before first run.
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
async function restoreFresh(base,backup){
 base=fs.realpathSync(base);const input=path.resolve(backup);
 if(!fs.existsSync(input))throw Error('لم يوجد ملف النسخة الاحتياطية المحدد');
 if(path.extname(input).toLowerCase()!=='.gz'||!input.toLowerCase().endsWith('.zain.gz'))throw Error('اختر ملف نسخة استراحة بصيغة .zain.gz');
 const root=path.join(base,'data','local-backups'),stage=path.join(root,'restore-'+crypto.randomUUID());fs.mkdirSync(root,{recursive:true});
 const checked=await require('./backup-worker.cjs').run({base,action:'restore',file:input,stage});
 fs.writeFileSync(path.join(base,'data','pending-restore.json'),JSON.stringify({stage,files:checked.files,before:null,source:path.basename(input),fresh:true}));
 require('./restore-state.cjs')(base);
 return {files:checked.files.length,catalog:fs.existsSync(path.join(base,'data','catalog.sqlite')),migratesLegacy:!fs.existsSync(path.join(base,'data','catalog.sqlite'))};
}
module.exports={restoreFresh};
if(require.main===module)restoreFresh(process.argv[2]||path.resolve(__dirname,'..'),process.argv[3]).then(value=>console.log(JSON.stringify(value))).catch(error=>{console.error(error.message);process.exitCode=1});
