'use strict';
const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto'),{execFile}=require('node:child_process');
const resolveTools=require('./trailers.cjs').resolveTools,lock=require('./trailer-tool-lock.cjs');
const MAX=64*1024*1024;
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const versionOK=v=>/^\d{4}\.\d{2}\.\d{2}(?:\.\d+)?$/.test(v);
function compare(a,b){const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<Math.max(aa.length,bb.length);i++)if((aa[i]||0)!==(bb[i]||0))return (aa[i]||0)-(bb[i]||0);return 0;}
function version(file){return new Promise((resolve,reject)=>execFile(file,['--ignore-config','--no-plugin-dirs','--no-remote-components','--version'],{windowsHide:true,timeout:15000,maxBuffer:65536,encoding:'utf8'},(error,stdout)=>{const v=String(stdout||'').trim();if(error||!versionOK(v))return reject(Error('تعذر قراءة إصدار أداة الإعلان الحالية'));resolve(v);}));}
let lastProgress=0;
const remote=(url,limit=MAX)=>require('./trailer-tool-download.cjs')(url,limit,{totalMs:limit<=2*1024*1024?120000:1200000,onProgress:value=>{
 if(require.main!==module)return;
 if(value.retry){process.stderr.write('إعادة محاولة تنزيل أداة الإعلان ('+value.attempt+'/3)؛ النسخة الحالية محفوظة\n');return;}
 if(limit<=2*1024*1024||Date.now()-lastProgress<5000)return;lastProgress=Date.now();
 process.stderr.write('تنزيل أداة الإعلان: '+(value.size/1024/1024).toFixed(1)+' ميجابايت'+(value.total?' من '+(value.total/1024/1024).toFixed(1)+' ('+Math.floor(value.size/value.total*100)+'%)':'')+'\n');
}});
function validateRelease(release){
 const v=release?.tag_name,asset=release?.assets?.find(a=>a.name==='yt-dlp.exe');
 if(!versionOK(v)||release.draft||release.prerelease||!asset||!Number.isInteger(asset.size)||asset.size<1024||asset.size>MAX||!/^sha256:[a-f0-9]{64}$/.test(asset.digest||''))throw Error('بيانات تحديث الأداة الرسمية غير مكتملة أو غير صالحة');
 const expected='https://github.com/yt-dlp/yt-dlp/releases/download/'+v+'/yt-dlp.exe';
 if(asset.browser_download_url!==expected)throw Error('رابط أداة الإعلان ليس الإصدار الرسمي المتوقع');
 return {latest:v,size:asset.size,sha256:asset.digest.slice(7),url:expected};
}
function safeTarget(base,target){const allowed=[path.resolve(base,'runtime/yt-dlp/yt-dlp.exe'),path.resolve('C:/Tools/yt-dlp.exe')];target=path.resolve(target);if(!allowed.includes(target))throw Error('مسار أداة الإعلان غير معتمد');let at=path.parse(target).root;for(const part of target.slice(at.length).split(path.sep)){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw Error('رفض تحديث الأداة عبر رابط ملفات');}return target;}
module.exports=function({base,readVersion=version,download=remote,resolve=resolveTools}){
 async function check(){const found=resolve(base),exe=found.exe,current=exe?await readVersion(exe):null;const release=validateRelease(JSON.parse((await download('https://api.github.com/repos/yt-dlp/yt-dlp/releases/latest',2*1024*1024)).toString()));return {...release,current,available:!current||compare(release.latest,current)>0,location:exe&&path.dirname(exe)};}
 async function install(expectedVersion){
  if(!versionOK(expectedVersion))throw Error('اختر الإصدار بعد فحص التحديث أولًا');
  const info=await check();if(info.latest!==expectedVersion)throw Error('تغير الإصدار المتاح؛ افحص التحديث مرة أخرى');if(!info.available)return {...info,updated:false,message:'أداة الإعلانات محدثة بالفعل'};
  const target=safeTarget(base,resolve(base).exe||path.join(base,'runtime/yt-dlp/yt-dlp.exe'));
  await fsp.mkdir(path.dirname(target),{recursive:true});const releaseLock=lock(target),stage=target+'.download-'+crypto.randomUUID()+'.exe';let backup;
  try{
   const original=fs.existsSync(target)?hash(await fsp.readFile(target)):null;
   const bytes=await download(info.url,MAX);if(bytes.length!==info.size||hash(bytes)!==info.sha256)throw Error('فشل التحقق من بصمة التنزيل؛ لم تُستبدل الأداة الحالية');
   await fsp.writeFile(stage,bytes,{flag:'wx'});if(await readVersion(stage)!==info.latest)throw Error('إصدار الملف المنزّل لا يطابق الإصدار الرسمي');
   if(original&&hash(await fsp.readFile(target))!==original)throw Error('تغيرت الأداة أثناء التنزيل؛ لم تُستبدل');
   if(original){backup=target+'.previous-'+Date.now();await fsp.rename(target,backup);}
   try{await fsp.rename(stage,target);}catch(error){if(backup&&!fs.existsSync(target))await fsp.rename(backup,target);throw error;}
   return {current:info.latest,previous:info.current,updated:true,message:'اكتمل تحديث أداة الإعلانات إلى '+info.latest,location:path.dirname(target)};
  }catch(e){if(['EACCES','EPERM','EBUSY'].includes(e.code))throw Error('تعذر استبدال الأداة؛ انتظر انتهاء التنزيل، وتحقق من صلاحية الكتابة إلى مجلدها');throw e;}
  finally{await fsp.unlink(stage).catch(()=>{});releaseLock();}
 }
 return {check,install};
};
module.exports.validateRelease=validateRelease;
module.exports.compare=compare;
if(require.main===module)(async()=>{const [action,base,v]=process.argv.slice(2);if(!path.isAbsolute(base||''))throw Error('مجلد البرنامج غير صالح');const updater=module.exports({base});const result=action==='check'?await updater.check():action==='install'?await updater.install(v):null;if(!result)throw Error('طلب تحديث الأداة غير صالح');process.stdout.write(JSON.stringify({ok:true,...result}));})().catch(e=>{process.stdout.write(JSON.stringify({ok:false,error:e.message}));process.exitCode=1;});

