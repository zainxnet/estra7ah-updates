'use strict';
const fs=require('node:fs'),fsp=fs.promises,path=require('node:path'),crypto=require('node:crypto'),http=require('node:http'),{spawn,execFileSync}=require('node:child_process');
const REPO='zainxnet/estra7ah-updates',PRODUCT='Estra7ah Zain Server',MAX_FILE=30*1024*1024,MAX_TOTAL=160*1024*1024;
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const delay=ms=>new Promise(r=>setTimeout(r,ms));
const error=message=>Error(message);
function allowed(name){
 if(typeof name!=='string'||name.length>240||name.includes('\\')||/[%:\x00-\x1f<>?"|*]/.test(name)||name.startsWith('/'))return false;
 const parts=name.split('/');if(parts.some(p=>!p||p==='.'||p==='..'||/[. ]$/.test(p)||/^(con|prn|aux|nul|com[1-9]|lpt[1-9])(?:\.|$)/i.test(p)))return false;
 if(parts.some(p=>/^(data|logs?|backups?|local-backups|runtime|mubasher_db|mubasher_assets|node_modules|\.git|\.github)$/i.test(p))||/\.(?:db|sqlite(?:3)?|mdb|accdb|bak|log|pfx|key|env)$/i.test(name))return false;
 return /^server\/[\w.-]+\.(?:cjs|js|json|ps1)$/.test(name)||name==='server/update-public-key.pem'||/^interface\/(?:[\w .\u0600-\u06ff/-]+)\.(?:html|js|css|json|svg|ico|png|jpe?g|gif|webp|woff2?|ttf|eot|txt)$/.test(name)||['Zain-Launcher-x64.exe','estra7ah-server.ico'].includes(name);
}
function target(root,name){if(!allowed(name))throw error('ملف محمي أو مسار غير مسموح: '+name);const full=path.resolve(root,...name.split('/')),relative=path.relative(root,full);if(relative.startsWith('..')||path.isAbsolute(relative))throw error('المسار خارج الاستراحة');let at=root;for(const segment of name.split('/')){at=path.join(at,segment);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw error('لا يدعم التحديث روابط المجلدات: '+name);}return full;}
function atomic(file,bytes){fs.mkdirSync(path.dirname(file),{recursive:true});const temp=file+'.update-'+crypto.randomUUID();fs.writeFileSync(temp,bytes,{flag:'wx'});try{fs.renameSync(temp,file)}catch(e){fs.rmSync(temp,{force:true});throw e;}}
function compareVersion(a,b){const aa=a.split('.').map(Number),bb=b.split('.').map(Number);for(let i=0;i<3;i++)if(aa[i]!==bb[i])return aa[i]-bb[i];return 0;}
function verifyEnvelope(envelope,publicKey){
 if(!envelope||envelope.algorithm!=='Ed25519'||typeof envelope.payload!=='string'||typeof envelope.signature!=='string'||envelope.payload.length>6*1024*1024)throw error('بيان التحديث غير صالح');
 const bytes=Buffer.from(envelope.payload,'base64');if(!crypto.verify(null,bytes,publicKey,Buffer.from(envelope.signature,'base64')))throw error('توقيع التحديث غير صحيح؛ لم يتم استبدال أي ملف');
 const m=JSON.parse(bytes.toString('utf8'));if(m.schema!==1||m.product!==PRODUCT||m.repository!==REPO||m.dataSchema!==1||!/^\d+\.\d+\.\d+$/.test(m.version)||!/[a-f0-9]{40}/.test(m.commit)||m.commit.length!==40||!Array.isArray(m.files)||m.files.length<1||m.files.length>4000)throw error('إصدار أو بنية بيان غير مدعومة');
 let total=0;const seen=new Set();for(const f of m.files){if(!allowed(f.path)||seen.has(f.path.toLowerCase())||!Number.isSafeInteger(f.size)||f.size<0||f.size>MAX_FILE||!/^[a-f0-9]{64}$/.test(f.sha256))throw error('ملف مرفوض في بيان التحديث');seen.add(f.path.toLowerCase());total+=f.size;}if(total>MAX_TOTAL)throw error('حجم التحديث يتجاوز الحد المسموح');
 for(const required of ['server/server.cjs','server/release.json','server/program-updater.cjs','server/update-public-key.pem','interface/index.html'])if(!seen.has(required))throw error('بيان التحديث غير مكتمل');
 const key=m.files.find(f=>f.path==='server/update-public-key.pem');if(key.sha256!==hash(Buffer.from(publicKey)))throw error('تغيير مفتاح توقيع التحديث يتطلب تحديثًا يدويًا موثوقًا');return m;
}
function plan(root,m){const current=JSON.parse(fs.readFileSync(path.join(root,'server/release.json'),'utf8'));if(compareVersion(m.version,current.version)<0)throw error('رفض الرجوع لإصدار أقدم عبر الشبكة');const changed=m.files.filter(f=>{const file=target(root,f.path);return !fs.existsSync(file)||hash(fs.readFileSync(file))!==f.sha256});return {version:m.version,current:current.version,files:changed,bytes:changed.reduce((n,f)=>n+f.size,0),total:m.files.length};}
function protectToken(text,decrypt=false){
 if(process.platform!=='win32')throw error('حفظ بيانات الدخول مدعوم على ويندوز فقط');
 const command="Add-Type -AssemblyName System.Security; $v=[Console]::In.ReadToEnd(); "+(decrypt?"[Text.Encoding]::UTF8.GetString([Security.Cryptography.ProtectedData]::Unprotect([Convert]::FromBase64String($v),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))":"[Convert]::ToBase64String([Security.Cryptography.ProtectedData]::Protect([Text.Encoding]::UTF8.GetBytes($v),$null,[Security.Cryptography.DataProtectionScope]::CurrentUser))");
 return execFileSync('powershell.exe',['-NoProfile','-NonInteractive','-Command',command],{input:text,encoding:'utf8',windowsHide:true,stdio:['pipe','pipe','pipe'],timeout:15000}).trim();
}
function storedToken(root){const file=path.join(root,'data/update-settings.json');if(!fs.existsSync(file))return '';const value=JSON.parse(fs.readFileSync(file));return value.tokenProtected?protectToken(value.tokenProtected,true):'';}
function gitToken(){try{const text=execFileSync('git',['-c','credential.interactive=never','credential','fill'],{input:'protocol=https\nhost=github.com\npath='+REPO+'.git\n\n',env:{...process.env,GIT_TERMINAL_PROMPT:'0',GCM_INTERACTIVE:'never'},encoding:'utf8',stdio:['pipe','pipe','pipe'],windowsHide:true,timeout:15000});return /^password=(.+)$/m.exec(text)?.[1]||'';}catch{return '';}}
async function remote(url,token,{limit=MAX_FILE,accept='application/vnd.github+json'}={}){
 let u=new URL(url);for(let redirects=0;redirects<4;redirects++){
  if(u.protocol!=='https:'||!['api.github.com','release-assets.githubusercontent.com','objects.githubusercontent.com','raw.githubusercontent.com'].includes(u.hostname))throw error('عنوان تنزيل غير مسموح');
  const r=await fetch(u,{headers:{'User-Agent':'Estra7ah-Updater','Accept':accept,...(token&&u.hostname==='api.github.com'?{Authorization:'Bearer '+token}:{})},redirect:'manual',signal:AbortSignal.timeout(60000)});
  if([301,302,303,307,308].includes(r.status)){u=new URL(r.headers.get('location'),u);await r.body?.cancel();continue}
  if(!r.ok){await r.body?.cancel();throw error(r.status===404?'لم يوجد إصدار منشور أو لا توجد صلاحية قراءة المستودع الخاص.':r.status===401||r.status===403?'تعذر الوصول إلى GitHub؛ تحقق من صلاحية القراءة وحد الطلبات.':'تعذر تنزيل التحديث من GitHub ('+r.status+')');}
  const chunks=[];let size=0;for await(const chunk of r.body){size+=chunk.length;if(size>limit)throw error('ملف التنزيل أكبر من الحجم المسموح');chunks.push(chunk)}return Buffer.concat(chunks);
 }throw error('تعذر الوصول إلى ملف الإصدار');
}
async function latest(token,publicKey){const r=JSON.parse((await remote('https://api.github.com/repos/'+REPO+'/releases/latest',token,{limit:2*1024*1024})).toString());const asset=r.assets?.find(a=>a.name==='update-manifest.json');if(!asset||!Number.isSafeInteger(asset.id))throw error('الإصدار المنشور لا يحتوي بيان تحديث');const envelope=JSON.parse((await remote('https://api.github.com/repos/'+REPO+'/releases/assets/'+asset.id,token,{limit:6*1024*1024,accept:'application/octet-stream'})).toString());const m=verifyEnvelope(envelope,publicKey);if(r.tag_name!=='v'+m.version)throw error('بيان التحديث لا يطابق الإصدار');return m;}
async function downloadFile(m,f,token){if(!token)return remote('https://raw.githubusercontent.com/'+REPO+'/'+m.commit+'/app/'+f.path.split('/').map(encodeURIComponent).join('/'),'',{limit:f.size,accept:'application/octet-stream'});return remote('https://api.github.com/repos/'+REPO+'/contents/app/'+f.path.split('/').map(encodeURIComponent).join('/')+'?ref='+m.commit,token,{limit:f.size,accept:'application/vnd.github.raw+json'});}
function workspace(root){const name='data/program-updates',folder=path.join(root,name);let at=root;for(const part of name.split('/')){at=path.join(at,part);if(fs.existsSync(at)&&fs.lstatSync(at).isSymbolicLink())throw error('مجلد التحديث رابط غير مسموح')}fs.mkdirSync(folder,{recursive:true});return folder;}
async function stage(root,m,getFile,report=()=>{}){
 const p=plan(root,m),folder=path.join(workspace(root),crypto.randomUUID());fs.mkdirSync(folder);
 const entries=[];for(let i=0;i<p.files.length;i++){const f=p.files[i];report('تنزيل الملفات '+(i+1)+' / '+p.files.length);const bytes=await getFile(f);if(bytes.length!==f.size||hash(bytes)!==f.sha256)throw error('فشل التحقق من الملف: '+f.path);const file=path.join(folder,'new',f.path);fs.mkdirSync(path.dirname(file),{recursive:true});fs.writeFileSync(file,bytes);if(f.path==='server/release.json'&&JSON.parse(bytes.toString()).version!==m.version)throw error('رقم إصدار الملف لا يطابق البيان');entries.push(f);}
 return {folder,manifest:m,plan:p,entries};
}
function journalWrite(job,value){atomic(path.join(job.folder,'journal.json'),JSON.stringify(value,null,2));}
function restore(root,folder,journal){
 for(const entry of journal.entries){const dest=target(root,entry.path);if(entry.existed){const backup=path.join(folder,'old',entry.path),bytes=fs.readFileSync(backup);if(hash(bytes)!==entry.oldHash)throw error('نسخة الرجوع غير صالحة: '+entry.path);atomic(dest,bytes);}else if(fs.existsSync(dest)){if(hash(fs.readFileSync(dest))!==entry.sha256)throw error('تغير ملف جديد خارج التحديث: '+entry.path);fs.unlinkSync(dest);}}
 journal.phase='rolledBack';atomic(path.join(folder,'journal.json'),JSON.stringify(journal,null,2));
}
function recoverPending(root){const dir=workspace(root);for(const entry of fs.readdirSync(dir,{withFileTypes:true})){if(!entry.isDirectory()||!/^[\w-]+$/.test(entry.name))continue;const folder=path.join(dir,entry.name),file=path.join(folder,'journal.json');if(fs.existsSync(file)){const j=JSON.parse(fs.readFileSync(file));if(['applying','validating'].includes(j.phase)){restore(root,folder,j);}}}}
async function apply(root,job,{stop,start,healthy,stopNew,commit=async()=>{},report=()=>{}}){
 if(!job.entries.length)return {updated:false};
 const journal={phase:'prepared',version:job.manifest.version,entries:[]};
 // Capture all originals before any replacement.
 for(const entry of job.entries){const dest=target(root,entry.path),record={...entry,existed:fs.existsSync(dest)};if(record.existed){const bytes=fs.readFileSync(dest);record.oldHash=hash(bytes);const backup=path.join(job.folder,'old',entry.path);fs.mkdirSync(path.dirname(backup),{recursive:true});fs.writeFileSync(backup,bytes);}const incoming=fs.readFileSync(path.join(job.folder,'new',entry.path));if(incoming.length!==entry.size||hash(incoming)!==entry.sha256)throw error('تغير ملف التجهيز');journal.entries.push(record);}
 journalWrite(job,journal);await stop();let began=false;
 try{for(const entry of journal.entries){const dest=target(root,entry.path);if(fs.existsSync(dest)!==entry.existed||entry.existed&&hash(fs.readFileSync(dest))!==entry.oldHash)throw error('تغير ملف محلي أثناء تجهيز التحديث؛ أعد الفحص');}journal.phase='applying';journalWrite(job,journal);began=true;report('تثبيت ملفات البرنامج…');for(const entry of journal.entries)atomic(target(root,entry.path),fs.readFileSync(path.join(job.folder,'new',entry.path)));journal.phase='validating';journalWrite(job,journal);await start();if(!await healthy(job.manifest.version))throw error('لم يجتز الإصدار الجديد فحص التشغيل');await commit();journal.phase='complete';journalWrite(job,journal);return {updated:true,version:job.manifest.version,files:job.entries.length,bytes:job.plan.bytes};
 }catch(e){if(began){await stopNew();restore(root,job.folder,journal);await start();const old=JSON.parse(fs.readFileSync(path.join(root,'server/release.json'),'utf8')).version;if(!await healthy(old))throw error('أعيدت الملفات القديمة؛ يحتاج السيرفر مراجعة التشغيل.');throw error('لم ينجح التحديث؛ أعيد إصدار البرنامج السابق تلقائيًا.')}await start();throw e;}
}
async function local(root,route,body){const config=JSON.parse(fs.readFileSync(path.join(root,'data/server-config.json'))),control=JSON.parse(fs.readFileSync(path.join(root,'data/launcher-control.json')));if(control.port!==config.port||typeof control.token!=='string')throw error('بيانات التحكم المحلي غير متوافقة');const r=await fetch('http://127.0.0.1:'+config.port+route,{method:'POST',headers:{Connection:'close','x-zain-control':control.token,'Content-Type':'application/json'},body:JSON.stringify(body||{}),signal:AbortSignal.timeout(7000)});const value=await r.json();if(!r.ok)throw error(value.error||'رفض السيرفر التحديث');return value;}
function lifecycle(root){
 const config=JSON.parse(fs.readFileSync(path.join(root,'data/server-config.json')));let launched;
 async function health(){try{const r=await fetch('http://127.0.0.1:'+config.port+'/zain/health',{headers:{Connection:'close'},signal:AbortSignal.timeout(2000)});const data=await r.json();if(data.service!=='zain')throw error('المنفذ مستخدم من برنامج آخر');return data;}catch(e){if(e.cause?.code==='ECONNREFUSED')return null;throw e;}}
 return {async stopRecovery(){if(await health()){await local(root,'/zain/control/stop');for(let i=0;i<30;i++){if(!await health())return;await delay(300)}throw error('تعذر إيقاف السيرفر للاستعادة')}},async stop(){const h=await health();if(h){if(!h.ready)throw error('الاستراحة لم تكمل التشغيل بعد');await local(root,'/zain/control/update-stop');for(let i=0;i<25;i++){if(!await health())return;await delay(300)}throw error('لم تتوقف الخدمة؛ لم تُستبدل الملفات');}},
 async start(){if(await health())throw error('ظهر برنامج على المنفذ أثناء التحديث');launched=spawn(path.join(root,'runtime/node.exe'),[path.join(root,'server/server.cjs')],{cwd:root,windowsHide:true,detached:true,stdio:'ignore'});launched.unref();await delay(300);},
 async healthy(version){for(let i=0;i<180;i++){try{const h=await health();if(h?.ready)return h.version===version;if(h?.message?.startsWith('تعذر'))return false;}catch{}await delay(500)}return false;},
 async stopNew(){if(launched){try{await local(root,'/zain/control/stop')}catch{}for(let i=0;i<20;i++){if(!await health())return;await delay(250)}if(launched.exitCode===null)launched.kill();await delay(500);}}
 };
}
function lock(root){const file=path.join(workspace(root),'lock.json');if(fs.existsSync(file)){const previous=JSON.parse(fs.readFileSync(file));if(!Number.isSafeInteger(previous.pid)||previous.pid<=0)throw error('بيانات قفل التحديث غير صالحة؛ راجع نافذة التحديث');try{process.kill(previous.pid,0);throw error('توجد نافذة تحديث أخرى تعمل');}catch(e){if(e.code!=='ESRCH')throw e;}fs.unlinkSync(file);}fs.writeFileSync(file,JSON.stringify({pid:process.pid,at:new Date().toISOString()}),{flag:'wx'});return ()=>{if(fs.existsSync(file)){const v=JSON.parse(fs.readFileSync(file));if(v.pid===process.pid)fs.unlinkSync(file)}};}
module.exports={allowed,target,verifyEnvelope,plan,stage,apply,recoverPending,hash,compareVersion,remote,latest,downloadFile,gitToken,protectToken,REPO,PRODUCT};


function pending(root){const dir=workspace(root);return fs.readdirSync(dir,{withFileTypes:true}).some(e=>{if(!e.isDirectory()||!/^[\w-]+$/.test(e.name))return false;const file=path.join(dir,e.name,'journal.json');return fs.existsSync(file)&&['applying','validating'].includes(JSON.parse(fs.readFileSync(file)).phase);});}
function releaseStaleLock(root){root=fs.realpathSync(root);if(pending(root))throw error('توجد عملية تحديث غير مكتملة؛ استخدم استعادة الإصدار السابق في نافذة التحديث');const release=lock(root);try{if(pending(root))throw error('توجد عملية تحديث غير مكتملة؛ استخدم نافذة التحديث');return {ready:true};}finally{release();}}
function browserOpen(url){spawn('powershell.exe',['-NoProfile','-NonInteractive','-Command',"Start-Process -FilePath '"+url.replace(/'/g,"''")+"'"],{windowsHide:true,stdio:'ignore'}).unref();}
function page(nonce){
return String.raw`<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>تحديث الاستراحة</title>
<style>body{background:#101725;color:#edf2fa;font:17px "Segoe UI",sans-serif;max-width:880px;margin:5vh auto;padding:24px;line-height:1.8}h1{font-size:30px;margin-bottom:6px}.panel{background:#1e293f;border:1px solid #33415b;border-radius:16px;padding:24px;margin:20px 0}.muted{color:#b8c7df}button,input{font:inherit;border-radius:9px;padding:10px 17px}button{background:#675cf1;color:white;border:0;cursor:pointer;margin:8px 0 8px 10px;min-height:44px}button.secondary{background:#34465f}button:disabled{opacity:.45;cursor:default}input{display:block;box-sizing:border-box;width:100%;background:#0e1728;border:1px solid #617493;color:white;direction:ltr;text-align:left;margin-top:8px}#message{white-space:pre-wrap}#message[data-error=true]{color:#ffb3ad}.tag{background:#26354c;border-radius:6px;padding:5px 12px}a{color:#b6cfff}.row{display:flex;gap:14px;flex-wrap:wrap}.row div{flex:1;min-width:180px}</style>
<h1>تحديث الاستراحة</h1><div class="muted">تحديث ملفات البرنامج مع الاحتفاظ ببيانات جهازك.</div>
<div class="panel"><div class="row"><div>الإصدار الحالي<br><b id="current">…</b></div><div>المصدر<br><span dir="ltr">zainxnet/estra7ah-updates</span></div></div>
<p id="message" role="status" aria-live="polite">جاهز للفحص.</p><div id="summary"></div>
<button id="check">فحص التحديثات</button><button id="apply" disabled>تنزيل وتثبيت التحديث</button><button id="recover" hidden>استعادة إصدار البرنامج السابق</button></div>
<div class="panel"><details><summary>الوصول إلى المستودع الخاص</summary><p class="muted">إن كان تسجيل الدخول إلى GitHub متاحًا لهذا الجهاز فسيُستخدم تلقائيًا. على السيرفر البعيد يمكنك إدخال رمز خاص بهذا المستودع بصلاحية Contents: Read-only. يُحفظ مشفرًا لحساب ويندوز الحالي عند الضغط على حفظ.</p>
<label for="token">رمز الوصول إلى GitHub</label><input id="token" type="password" autocomplete="off" spellcheck="false" placeholder="لا ترسل الرمز في المحادثة">
<button id="save" class="secondary">حفظ الوصول على هذا الجهاز</button><span id="credential" class="muted"></span></details></div>
<p class="muted">يُنزّل المحدث الملفات المتغيّرة فقط، ويتحقق من توقيعها ثم يفحص تشغيل الإصدار. تظل قاعدة البيانات والصور والإعدادات والنسخ الاحتياطية على السيرفر كما هي. تثبيت التحديث يعيد تشغيل الخدمة؛ انتظر انتهاء المزامنة والنسخ الاحتياطي أولًا.</p>
<button id="site" class="secondary">فتح الاستراحة</button><button id="launcher" class="secondary">العودة إلى المشغل</button>
<script nonce="__NONCE__">
(function(){'use strict';var key=location.hash.slice(1);history.replaceState(null,'',location.pathname);var state={},running=false;
function el(id){return document.getElementById(id);}
function render(s){state=s;el('current').textContent=s.current;el('message').textContent=s.message;el('message').dataset.error=String(!!s.error);el('check').disabled=s.busy||s.pending;el('apply').disabled=s.busy||s.pending||!s.changes;el('save').disabled=s.busy;el('recover').hidden=!s.pending;el('recover').disabled=s.busy;el('launcher').disabled=s.busy;el('site').disabled=s.busy;el('credential').textContent=s.credential?'توجد بيانات وصول محفوظة.':'لم تُحفظ بيانات وصول بعد.';el('summary').textContent=s.version?'الإصدار المتاح '+s.version+' — '+s.changes+' ملف متغيّر — '+(s.bytes/1048576).toFixed(2)+' ميجابايت':'';}
function request(action,body){return fetch('/api/'+action,{method:'POST',headers:{'Content-Type':'application/json','X-Update-Session':key},body:JSON.stringify(body||{})}).then(function(r){return r.json().then(function(j){if(!r.ok)throw Error(j.error||'تعذر تنفيذ العملية');return j;});});}
function poll(){if(running)return;running=true;request('state').then(render).catch(function(e){el('message').textContent=e.message;}).then(function(){running=false;});}
['check','apply','recover','save','site','launcher'].forEach(function(action){el(action).onclick=function(){this.disabled=true;request(action,{token:el('token').value}).then(function(s){el('token').value='';render(s);if(action==='launcher')el('message').textContent='تم فتح المشغل. يمكنك إغلاق هذه الصفحة.';}).catch(function(e){el('message').textContent=e.message;el('message').dataset.error='true';poll();});};});poll();setInterval(poll,1000);
})();</script></html>`.replace('__NONCE__',nonce);
}
async function ui(root,{open=true}={}){
 root=fs.realpathSync(root);const releaseLock=lock(root),key=crypto.randomBytes(32).toString('hex'),nonce=crypto.randomBytes(18).toString('base64'),publicKey=fs.readFileSync(path.join(root,'server/update-public-key.pem'),'utf8');
 const state={current:JSON.parse(fs.readFileSync(path.join(root,'server/release.json'))).version,message:'جاهز لفحص تحديثات البرنامج.',busy:false,error:false,changes:0,bytes:0,pending:pending(root),credential:fs.existsSync(path.join(root,'data/update-settings.json'))};
 if(state.pending)state.message='توجد عملية تحديث لم تكتمل. استعد الإصدار السابق قبل المتابعة.';
 let manifest,token='',origin,lastRequest=Date.now(),closing=false;try{token=storedToken(root)||gitToken()}catch{state.message='بيانات الوصول المحفوظة تخص حساب ويندوز آخر؛ أعد إدخالها.'}
 function respond(res,value,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(value));}
 function report(message){state.message=message;}
 function task(work){if(state.busy)throw error('توجد عملية تحديث قيد التنفيذ');state.busy=true;state.error=false;Promise.resolve().then(work).catch(e=>{state.error=true;state.message=e.message;}).finally(()=>{state.busy=false;state.pending=pending(root);});}
 const server=http.createServer(async(req,res)=>{
  try{
   if(req.headers.host!==new URL(origin).host)return respond(res,{error:'طلب غير صالح'},403);
   res.setHeader('Content-Security-Policy',"default-src 'none'; script-src 'nonce-"+nonce+"'; style-src 'unsafe-inline'; connect-src 'self'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'");
   res.setHeader('X-Content-Type-Options','nosniff');res.setHeader('Referrer-Policy','no-referrer');
   if(req.method==='GET'&&req.url==='/'){res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(page(nonce));return;}
   if(req.method!=='POST'||req.headers['x-update-session']!==key||req.headers.origin&&req.headers.origin!==origin)return respond(res,{error:'طلب غير مصرح'},403);
   lastRequest=Date.now();let bytes='';for await(const chunk of req){bytes+=chunk;if(bytes.length>4096)return respond(res,{error:'طلب كبير'},413);}
   const body=JSON.parse(bytes||'{}'),action=req.url.slice(5);
   if(action==='state')return respond(res,state);
   if(closing)return respond(res,{error:'جارٍ إغلاق نافذة التحديث'},409);
   if(state.busy)return respond(res,{error:'انتظر انتهاء عملية التحديث'},409);
   if(action==='stop'){
    if(state.pending||pending(root))return respond(res,{error:'توجد عملية تحديث غير مكتملة؛ استعد الإصدار السابق أولًا'},409);
    closing=true;respond(res,{stopped:true});clearInterval(idle);server.close(releaseLock);server.closeIdleConnections?.();return;
   }
   if(typeof body.token==='string'&&body.token.trim()){if(!/^[A-Za-z0-9_]{20,300}$/.test(body.token.trim()))throw error('تنسيق رمز الوصول غير صالح');token=body.token.trim();}
   if(action==='save'){if(!token)throw error('أدخل رمز الوصول أولًا');atomic(path.join(root,'data/update-settings.json'),JSON.stringify({repository:REPO,tokenProtected:protectToken(token)}));state.credential=true;state.message='حُفظ الوصول مشفرًا لحساب ويندوز الحالي.';}
   else if(action==='check'){
    if(state.pending)throw error('استعد الإصدار السابق أولًا');
    task(async()=>{state.changes=0;manifest=null;report('جارٍ فحص الإصدار المنشور في GitHub…');manifest=await latest(token,publicKey);const p=plan(root,manifest);Object.assign(state,{version:p.version,changes:p.files.length,bytes:p.bytes,message:p.files.length?'التحديث جاهز للتنزيل والتثبيت.':'ملفات البرنامج مطابقة لأحدث إصدار.'});});
   }else if(action==='apply'){
    if(state.pending||!manifest)throw error('افحص التحديثات أولًا');
    task(async()=>{const job=await stage(root,manifest,f=>downloadFile(manifest,f,token),report),life=lifecycle(root);const result=await apply(root,job,{...life,report});state.current=JSON.parse(fs.readFileSync(path.join(root,'server/release.json'))).version;state.changes=0;state.bytes=0;report(result.updated?'تم تثبيت الإصدار '+result.version+' والتحقق من تشغيله بنجاح.':'ملفات البرنامج محدثة بالفعل.');});
   }else if(action==='recover'){
    task(async()=>{report('جارٍ استعادة ملفات البرنامج السابقة…');const life=lifecycle(root);await life.stopRecovery();recoverPending(root);await life.start();state.current=JSON.parse(fs.readFileSync(path.join(root,'server/release.json'))).version;if(!await life.healthy(state.current))throw error('أعيدت الملفات السابقة؛ راجع تشغيل السيرفر.');state.pending=false;report('اكتملت الاستعادة وتشغيل الإصدار السابق.');});
   }else if(action==='site'){const c=JSON.parse(fs.readFileSync(path.join(root,'data/server-config.json')));browserOpen('http://127.0.0.1:'+Number(c.port)+'/');}
   else if(action==='launcher'){if(state.pending)throw error('استعد الإصدار السابق أولًا');respond(res,state);releaseLock();server.close();spawn(path.join(root,'Zain-Launcher-x64.exe'),[],{cwd:root,detached:true,stdio:'ignore'}).unref();setTimeout(()=>process.exit(0),800);return;}
   else return respond(res,{error:'خيار غير موجود'},404);
   return respond(res,state);
  }catch(e){state.error=true;state.message=e.message;respond(res,{error:e.message},400);}
 });
 await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve);});origin='http://127.0.0.1:'+server.address().port;
 const lockFile=path.join(workspace(root),'lock.json'),lockValue=JSON.parse(fs.readFileSync(lockFile));if(lockValue.pid!==process.pid)throw error('تغير قفل التحديث أثناء التشغيل');atomic(lockFile,JSON.stringify({...lockValue,port:server.address().port,session:key}));
 process.once('exit',releaseLock);const idle=setInterval(()=>{if(!state.busy&&Date.now()-lastRequest>30*60*1000){releaseLock();server.close();clearInterval(idle);}},60000);idle.unref();
 const url=origin+'/#'+key;if(open)browserOpen(url);return {url,server,state,close(){clearInterval(idle);server.close();releaseLock();}};
}
module.exports.ui=ui;module.exports.pending=pending;module.exports.releaseStaleLock=releaseStaleLock;
if(require.main===module&&process.argv[2]==='ui')ui(process.argv[3]||path.resolve(__dirname,'..')).catch(e=>{console.error(e.message);process.exitCode=1;});
if(require.main===module&&process.argv[2]==='release-stale-lock'){try{console.log(JSON.stringify(releaseStaleLock(process.argv[3]||path.resolve(__dirname,'..'))));}catch(e){console.error(e.message);process.exitCode=1;}}

module.exports.lifecycle=lifecycle;
