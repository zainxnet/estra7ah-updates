'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),{spawn}=require('node:child_process');
module.exports=async function({base,file,stage}){
 const names=await new Promise((resolve,reject)=>{
  const ps=path.join(process.env.SystemRoot||'C:\\Windows','System32/WindowsPowerShell/v1.0/powershell.exe');
  const child=spawn(ps,['-NoProfile','-NonInteractive','-ExecutionPolicy','Bypass','-File',path.join(__dirname,'legacy-zip.ps1'),'-File',file,'-Stage',stage],{windowsHide:true,stdio:['ignore','pipe','pipe']});
  child.stdout.setEncoding('utf8');child.stderr.setEncoding('utf8');
  let output='',error='';child.stdout.on('data',b=>{output+=b;if(output.length>8e6)child.kill()});child.stderr.on('data',b=>{if(error.length<1000)error+=b});child.on('error',reject);child.on('close',code=>{if(code)return reject(Error('تعذر قراءة النسخة القديمة أو أن ملفاتها غير مكتملة'));try{resolve(JSON.parse(output))}catch{reject(Error('تعذر التحقق من قائمة ملفات النسخة'))}});
 });
 const {allowed}=require('./backup-worker.cjs');
 if(!Array.isArray(names)||names.some(n=>!allowed(n)||!fs.existsSync(path.join(stage,n))||!fs.statSync(path.join(stage,n)).isFile()))throw Error('تعذر التحقق من أسماء ملفات النسخة القديمة بعد استخراجها');
 const source=JSON.parse(fs.readFileSync(path.join(stage,'assets/db/estra7ah.json'),'utf8'));
 if(!Array.isArray(source.sectionsData)||!source.settings||typeof source.settings!=='object')throw Error('أقسام النسخة القديمة غير صالحة');
 const catalog=JSON.parse(fs.readFileSync(path.join(stage,'assets/db/estra7ah.items.json'),'utf8'));
 if(!Array.isArray(catalog.itemsData))throw Error('فهرس الأفلام والمسلسلات غير صالح');
 const ids=new Set(catalog.itemsData.map(x=>x.id));
 const write=(n,v)=>{fs.mkdirSync(path.dirname(path.join(stage,n)),{recursive:true});fs.writeFileSync(path.join(stage,n),JSON.stringify(v));names.push(n)};
 // Keep the local administrator's login usable; the complete legacy users and
 // other original records remain in the imported source database.
 let users;try{users=JSON.parse(fs.readFileSync(path.join(base,'data/admin.json'),'utf8')).users.filter(u=>u.active&&u.level==='admin')}catch{}
 if(!users?.length){const salt=crypto.randomBytes(16).toString('hex');users=[{id:crypto.randomUUID(),username:'root',name:'المدير المحلي',level:'admin',active:true,allowed:'all',salt,hash:crypto.scryptSync('200200',salt,64).toString('hex')}]}
 write('data/admin.json',{users,sections:source.sectionsData,settings:source.settings,events:[]});
 const rows=x=>Array.isArray(x)?x:[];
 write('data/content.json',{version:1,news:rows(source.settings.news||source.newsData),exts:rows(source.settings.exts||source.extsData),ads:rows(source.settings.ads||source.adsData),requests:rows(source.reqsData),reports:rows(source.reportsData)});
 const edits={};for(const c of rows(source.contentsData))if(ids.has(c.itemId))edits[c.itemId]={content:c};
 write('data/item-edits.json',{edits,deleted:[],pinned:rows(source.pinedItems).map(x=>x.itemId||x.id).filter(id=>typeof id==='string'),exclusive:[]});
 const settings=source.settings,speed={IS_OPEN_STREAM:'yes',streamSpeed:1024,numOfConnectionPerIp:8,downloadActive:'yes',autoBlockIDM:'no',isAutoBackup:'no'};
 for(const k of Object.keys(speed))if(settings[k]!==undefined)speed[k]=settings[k];write('data/speed.json',speed);
 return {files:names,legacy:true,sections:source.sectionsData.length,items:catalog.itemsData.length};
};
