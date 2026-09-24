'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),os=require('os');
module.exports=function createAdmin({dir,sections,settings,port,services={},extensions=[],backups}){
 fs.mkdirSync(dir,{recursive:true});const stateFile=path.join(dir,'admin.json'),sessions=new Map(),attempts=new Map();
 const safeUser=u=>({id:u.id,userId:u.id,name:u.name,username:u.username,level:u.level==='admin'?'0':'1',allowed:u.active?'1':'0',createdAt:u.createdAt||0,folderSize:0,size:0,pathSize:0,userSize:0,email:u.email||'',active:u.active});
 const hash=p=>{const salt=crypto.randomBytes(16).toString('hex');return {salt,hash:crypto.scryptSync(p,salt,64).toString('hex')}};
 let state;if(fs.existsSync(stateFile))state=JSON.parse(fs.readFileSync(stateFile,'utf8'));else{const password='200200';state={users:[{id:crypto.randomUUID(),username:'root',name:'المدير المحلي',level:'admin',allowed:'all',active:true,...hash(password)}],sections:structuredClone(sections),settings:structuredClone(settings),events:[]};fs.writeFileSync(stateFile,JSON.stringify(state),{flag:'wx'});fs.writeFileSync(path.join(dir,'first-login.txt'),'Username: root\r\nPassword: '+password+'\r\nLocal server only. Keep private.\r\n',{flag:'wx'});}
 function apply(){sections.splice(0,sections.length,...structuredClone(state.sections));Object.assign(settings,state.settings);delete settings.api_key}apply();
 const syncEventsFile=path.join(dir,'sync-events.json');let syncEvents=fs.existsSync(syncEventsFile)?JSON.parse(fs.readFileSync(syncEventsFile,'utf8')):[];
 function recordEvent(msg,type='success',utype='system'){syncEvents.push({msg:String(msg).slice(0,1500),type,utype,createdAt:Math.floor(Date.now()/1000)});syncEvents=syncEvents.slice(-1000);fs.writeFileSync(syncEventsFile+'.tmp',JSON.stringify(syncEvents));fs.renameSync(syncEventsFile+'.tmp',syncEventsFile);}
 function commit(next,msg){if(msg)next.events.push({msg,utype:'system',type:'success',createdAt:Math.floor(Date.now()/1000)});next.events=next.events.slice(-1000);const backups=path.join(dir,'backups');fs.mkdirSync(backups,{recursive:true});fs.copyFileSync(stateFile,path.join(backups,Date.now()+'-'+crypto.randomUUID()+'.json'));const temp=stateFile+'.'+crypto.randomUUID()+'.tmp';fs.writeFileSync(temp,JSON.stringify(next));fs.renameSync(temp,stateFile);state=next;apply();}
 function reply(res,data,status=200){res.writeHead(status,{'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store'}).end(JSON.stringify(data))}
 async function body(req){let chunks=[],size=0;for await(const b of req){size+=b.length;if(size>1024*1024)throw Error('طلب أكبر من الحد المسموح');chunks.push(b)}const text=Buffer.concat(chunks).toString('utf8'),type=req.headers['content-type']||'';if(type.includes('application/json'))return JSON.parse(text||'{}');if(type.includes('application/x-www-form-urlencoded'))return Object.fromEntries(new URLSearchParams(text));const boundary=/boundary=(?:"([^"]+)"|([^;]+))/.exec(type);if(boundary){const out=Object.create(null);for(const part of text.split('--'+(boundary[1]||boundary[2]))){let split=part.indexOf('\r\n\r\n');if(split<0)continue;const header=part.slice(0,split),name=/name="([^"]+)"/.exec(header);if(!name)continue;if(/filename="[^"]+"/.test(header))throw Error('رفع الصور غير متاح في هذه المرحلة');out[name[1]]=part.slice(split+4).replace(/\r\n$/,'')}return out}return {}}
 function session(req){let token=(req.headers.cookie||'').split(';').map(s=>s.trim()).find(s=>s.startsWith('estraLocal='))?.slice(11);const entry=sessions.get(token);if(!entry||entry.expires<Date.now())return null;const user=state.users.find(u=>u.id===entry.id&&u.active);return user?{token,user}:null}
 // Accept only addresses actually assigned to this machine; arbitrary Host names are not trusted.
 function validHost(req){const hosts=new Set(['127.0.0.1:'+port,'localhost:'+port]);for(const entries of Object.values(os.networkInterfaces()))for(const entry of entries||[]){const host=entry.family==='IPv6'?'['+entry.address+']':entry.address;hosts.add(host+':'+port)}return hosts.has(req.headers.host)||port===80&&hosts.has(req.headers.host+':80')}
 const sameOrigin=require('./same-origin.cjs');
 function paths(value){
  if(value===null||value==='null'||value==='')return [];
  if(typeof value==='string')value=value.trim().startsWith('[')?JSON.parse(value):value.split(',');
  if(!Array.isArray(value)||value.length>64)throw Error('قائمة المسارات غير صالحة');
  const result=[];
  for(const raw of value){if(typeof raw!=='string')throw Error('المسار يجب أن يكون نصاً');const item=raw.trim();if(!item)continue;const absolute=/^[a-z]:[\\/]/i.test(item)||/^(?:\\\\|\/\/)[^\\/]+[\\/][^\\/]+/.test(item);if(item.length>4096||/[\x00-\x1f]/.test(item)||!absolute||/^\\\\[?.]\\/.test(item))throw Error('اكتب مساراً كاملاً على القرص أو مسار مشاركة شبكة');if(!result.includes(item))result.push(item)}
  return result;
 }
 function requireService(name){if(typeof services[name]!=='function'){const e=Error('هذه الخدمة لم تُربط بالخادم المحلي بعد');e.status=501;throw e}return services[name].bind(services)}
 function validateSections(rows){const ids=new Set(rows.map(s=>s.id));if(ids.size!==rows.length)throw Error('معرف قسم مكرر');for(const s of rows){if((!s.name?.trim()&&!state.sections.some(x=>x.id===s.id&&x.name===s.name))||s.name.length>200)throw Error('اسم القسم مطلوب');let visited=new Set([s.id]),parent=s.in_section;while(parent&&parent!=='null'){if(!ids.has(parent)||visited.has(parent))throw Error('تفرع الأقسام غير صالح');visited.add(parent);parent=rows.find(x=>x.id===parent).in_section}}}
 return {getMetadataKey:()=>state.settings.api_key||'',authorize:req=>session(req)?.user.level==='admin',stateFile,recordEvent,readEvents:()=>structuredClone([...state.events,...syncEvents].sort((a,b)=>a.createdAt-b.createdAt)),clearEvents:()=>{syncEvents=[];fs.writeFileSync(syncEventsFile,'[]');const next=structuredClone(state);next.events=[];commit(next)},handle:async(req,res,p)=>{try{
 if(!validHost(req))return reply(res,{msg:'error',error:'Invalid host'},403);
 p=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 const a=p.replace(/^\/admin\/api\//,'').split('/').filter(Boolean),action=a[0],sess=session(req);
 if(action==='checkAdmin'&&req.method==='GET')return reply(res,sess?{msg:'ok',payload:safeUser(sess.user)}:{msg:'login'});
 if(action==='checkAdmin'&&req.method==='POST'){
 if(!sameOrigin(req))return reply(res,{msg:'error'},403);const key=req.socket.remoteAddress,tries=attempts.get(key)||{n:0,until:Date.now()+60000};if(tries.until<Date.now()){tries.n=0;tries.until=Date.now()+60000}if(tries.n>=10)return reply(res,{msg:'error',error:'انتظر دقيقة ثم حاول مجدداً'},429);tries.n++;attempts.set(key,tries);const b=await body(req);const u=state.users.find(u=>u.username===b.username&&u.active&&u.level==='admin');const check=crypto.scryptSync(String(b.password||''),u?.salt||'invalid-local-user',64);if(!u||!crypto.timingSafeEqual(check,Buffer.from(u.hash,'hex')))return reply(res,{msg:'error'},401);attempts.delete(key);if(sess)sessions.delete(sess.token);const token=crypto.randomBytes(32).toString('hex');sessions.set(token,{id:u.id,expires:Date.now()+3600000});res.setHeader('Set-Cookie','estraLocal='+token+'; HttpOnly; SameSite=Strict; Path=/; Max-Age=3600');return reply(res,{msg:'ok',payload:safeUser(u)})}
 if(!sess)return reply(res,{msg:'login'},401);if(sess.user.level!=='admin')return reply(res,{msg:'error'},403);
 if(action==='toggleHomeSection'){
 if(req.method!=='POST'||!sameOrigin(req))return reply(res,{msg:'error'},403);if(!sections.some(s=>s.id===a[1]))return reply(res,{msg:'error',error:'القسم غير موجود'},404);
 const next=structuredClone(state),list=Array.isArray(next.settings.home_sections)?next.settings.home_sections:[];next.settings.home_sections=list.includes(a[1])?list.filter(id=>id!==a[1]):[...list,a[1]];commit(next,'تحديث روابط الأقسام في الرئيسية');return reply(res,{msg:'ok',ids:next.settings.home_sections});
 }
 if(action==='isApprove'){
  if(req.method!=='GET'&&req.method!=='POST')return reply(res,{msg:'error'},405);
  if(a[1]){
   if(a[1]!=='ok'||!sameOrigin(req))return reply(res,{msg:'error',error:'Cross-origin change rejected'},403);
   const next=structuredClone(state);next.settings.isApprove=true;commit(next,'حفظ موافقة المدير');
  }else if(req.method!=='GET')return reply(res,{msg:'error'},405);
  const value=state.settings.isApprove===undefined?settings.isApprove:state.settings.isApprove;
  return reply(res,{msg:'ok',payload:value===true||value==='true'||value==='yes'||value===1||value==='1'});
 }
 if(backups?.rawActions.has(action)){if(['backupNow','restoreBackup','saveDatabase','scanDatabase','optimizeDatabase'].includes(action)&&!sameOrigin(req))return reply(res,{msg:'error',error:'Cross-origin change rejected'},403);return backups.handle(req,res,action,a.slice(1));}
 const reads=new Set(['getAllSections','getAllJustSections','getMainData','getAllEvents','get_users','get_localusers','userData','getSpeedData','scanSectionsPaths','getNews','isRated','getAllReports','getAllReqs','getCurrentDiskes','path','syncStatus']);
 for(const extension of extensions)for(const action of extension.adminReads||[])reads.add(action);
 if(req.method!=='GET'&&req.method!=='POST')return reply(res,{msg:'error'},405);
 if(!reads.has(action)&&!sameOrigin(req))return reply(res,{msg:'error',error:'Cross-origin change rejected'},403);
 const extension=extensions.find(service=>service.adminActions?.has(action)||service.adminReads?.has(action));
 if(extension){const result=await extension.admin(action,a.slice(1),req.method==='POST'?(extension.readBody?await extension.readBody(req,action):await body(req)):{},req.method);if(result)return reply(res,result.body,result.status||200)}
 if(action==='logout'){sessions.delete(sess.token);res.setHeader('Set-Cookie','estraLocal=; HttpOnly; SameSite=Strict; Path=/; Max-Age=0');return reply(res,{msg:'ok'})}
 if(action==='getAllSections'||action==='getAllJustSections')return reply(res,sections.slice().sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)));
 if(action==='getCurrentDiskes'){if(req.method!=='GET')return reply(res,{msg:'error'},405);return reply(res,await requireService('drives')())}
 if(action==='path'){
  if(req.method!=='GET')return reply(res,{msg:'error'},405);
  // The original picker substitutes a vertical bar for each slash in its path URL.
  let selected=p.slice('/admin/api/path/'.length).replace(/\|/g,'\\');
  if(/^[a-z]:$/i.test(selected))selected+='\\';
  const selectedPaths=paths([selected]);if(selectedPaths.length!==1)throw Error('المسار مطلوب');
  return reply(res,await requireService('browse')(selectedPaths[0]));
 }
 if(action==='syncStatus'){if(req.method!=='GET')return reply(res,{msg:'error'},405);return reply(res,{msg:'ok',jobs:requireService('syncJobs')()})}
 if(action==='cancelSync'){const jobId=a[1];if(!jobId)throw Error('معرف المزامنة مطلوب');return reply(res,await requireService('cancelSync')(jobId))}
 if(action==='SyncSection'||action==='SyncSectionAll'){
  if(backups?.isMaintaining())return reply(res,{msg:'error',error:'انتظر انتهاء صيانة قاعدة البيانات'},409);
  const sectionId=action==='SyncSectionAll'?null:(a[1]||'');
  if(sectionId!==null&&!sections.some(s=>s.id===sectionId))return reply(res,{msg:'error',error:'القسم غير موجود'},404);
  // startSync only enqueues work and returns its job ID; scanning belongs to the background service.
  return reply(res,requireService('startSync')(sectionId));
 }
 if(action==='getMainData')return reply(res,{...settings,api_key:state.settings.api_key||''});
 if(action==='getAllEvents')return reply(res,state.events);
 if(action==='getNews'||action==='getAllReports'||action==='getAllReqs')return reply(res,[]);
 if(action==='isRated')return reply(res,{rated:true});
 if(action==='getSpeedData')return reply(res,{streamSpeed:0,downloadSpeed:0});
 if(action==='scanSectionsPaths'){
  if(req.method!=='GET')return reply(res,{msg:'error'},405);
  // The original UI treats sections as failed paths, so untested paths must never be placed there.
  const configuredSections=sections.map(section=>({section:{id:section.id,name:section.name},paths:Array.isArray(section.main_path)?structuredClone(section.main_path):String(section.main_path||'').split(',').map(value=>value.trim()).filter(Boolean)}));
  return reply(res,{msg:'error',service:action,error:'فحص اتصال المسارات لم يُنفذ؛ القائمة المرفقة تعرض المسارات المحفوظة فقط',checked:false,sections:[],configuredSections},501);
 }
 if(action==='get_users'||action==='get_localusers'){let rows=action==='get_users'?state.users.map(safeUser):[];let size=Math.min(100,Math.max(1,+a[3]||20)),page=Math.max(0,+a[4]||0),q=(a[5]||'').toLowerCase();if(q)rows=rows.filter(u=>(u.name+' '+u.username).toLowerCase().includes(q));return reply(res,{data:rows.slice(page*size,(page+1)*size),pages:Math.ceil(rows.length/size)})}
 if(action==='userData'){const u=state.users.find(u=>u.id===a[1]);return reply(res,u?{...safeUser(u),user:safeUser(u),userData:safeUser(u),data:safeUser(u),devices:[]}:{},u?200:404)}
 let upload=null;let b;if(req.method==='POST'&&['addSection','updateSection','editSection'].includes(action)&&/^multipart\/form-data/i.test(req.headers['content-type']||'')){const form=await require('./multipart.cjs')(req,{limit:9*1024*1024});if(Object.keys(form.files).some(x=>x!=='sec-image'))throw Error('ملف غير متوقع');b=form.fields;upload=form.files['sec-image'];}else b=req.method==='POST'?await body(req):{};const next=structuredClone(state);
 if(action==='deleteSection'){
  if(req.method!=='POST')return reply(res,{msg:'error'},405);
  const supplied=typeof b.ids==='string'?b.ids.split(','):b.ids;
  if(!Array.isArray(supplied)||!supplied.length||supplied.some(id=>typeof id!=='string'||!id.trim()))throw Error('حدد قسماً واحداً على الأقل للحذف');
  const removed=new Set(supplied.map(id=>id.trim()));
  if([...removed].some(id=>!next.sections.some(section=>section.id===id)))return reply(res,{msg:'error',error:'أحد الأقسام المحددة غير موجود'},404);
  // Delete metadata recursively; media files and the item catalog are owned by separate stores.
  let grew=true;while(grew){grew=false;for(const section of next.sections)if(removed.has(section.in_section)&&!removed.has(section.id)){removed.add(section.id);grew=true}}
  next.sections=next.sections.filter(section=>!removed.has(section.id));
  commit(next,'حذف بيانات '+removed.size+' قسم محلياً مع الاحتفاظ بملفاتها');
  return reply(res,{msg:'ok',deletedIds:[...removed]});
 }
 if(action==='enable_download_all'){
  if(req.method!=='POST')return reply(res,{msg:'error'},405);
  const value=b.enable_download_all;if(!['yes','no'].includes(value))throw Error('قيمة تفعيل التنزيلات يجب أن تكون yes أو no');
  next.settings.enable_download_all=value;
  for(const section of next.sections)section.downloadActive=value;
  commit(next,value==='yes'?'تفعيل التنزيلات لكل الأقسام':'إيقاف التنزيلات لكل الأقسام');
  return reply(res,{msg:'ok'});
 }
 if(['saveOrder','addSection','updateSection','editSection'].includes(action)){
 if(req.method!=='POST')return reply(res,{msg:'error'},405);
 let changedSection; if(action==='saveOrder'){const rows=JSON.parse(b.secs);if(!Array.isArray(rows))throw Error('قائمة أقسام غير صالحة');for(const r of rows){const item=next.sections.find(s=>s.id===r.id);if(!item)throw Error('قسم غير معروف');for(const k of ['order','in_section','name','is_hidden'])if(r[k]!==undefined)item[k]=r[k]}}
 else {const adding=action==='addSection';let item=adding?{id:'local-'+crypto.randomUUID(),in_section:b.inSection||b.in_section||b.id||null,order:0,is_hidden:'no',views:0,createdAt:Math.floor(Date.now()/1000)}:next.sections.find(s=>s.id===(b.sec_id||b.id));if(!item)throw Error('القسم غير موجود');for(const k of ['name','type','linkedId','downloadActive','is_hidden','isVIP','in_section'])if(b[k]!==undefined)item[k]=b[k]==='null'?null:b[k];if(item.in_section==='null'||item.in_section==='undefined')item.in_section=null;if(b.main_path!==undefined){item.main_path=paths(b.main_path);item.display_path=item.main_path.join(',')}if(b.display_path!==undefined)item.display_path=paths(b.display_path).join(',');if(adding){const siblings=next.sections.filter(s=>String(s.in_section||'null')===String(item.in_section||'null'));item.order=Math.max(0,...siblings.map(s=>Number(s.order)||0))+1;next.sections.push(item);}changedSection=item}validateSections(next.sections);if(upload&&changedSection)changedSection.localImage=await require('./section-image.cjs')(dir,upload);commit(next,'حفظ الأقسام محلياً');return reply(res,{msg:'ok'})}
 if(action==='saveSettings'){if(req.method!=='POST')return reply(res,{msg:'error'},405);const allowed=['api_key','main_name','main_desc','main_phone','main_facebook','mubasher_port','is_stop_constraction','is_only_app','estra7ah_type','show_movies','show_series','show_tvs','show_s_r','show_anime','show_kids','show_m_d','show_sports','show_learn'];for(const [k,v] of Object.entries(b)){if(!allowed.includes(k)){const error=Error('هذا الإعداد لم يُربط بالخادم المحلي بعد');error.status=501;throw error}if(typeof v!=='string'||v.length>2000)throw Error('قيمة الإعداد غير صالحة');if((k.startsWith('show_')||['is_stop_constraction','is_only_app'].includes(k))&&!['yes','no'].includes(v))throw Error('قيمة إعداد العرض غير صالحة');if(k==='mubasher_port'&&(!/^\d+$/.test(v)||Number(v)<1||Number(v)>65535||Number(v)===port))throw Error('منفذ البث غير صالح أو يطابق منفذ الاستراحة');if(k==='estra7ah_type'&&!['wireless','caffe'].includes(v))throw Error('اختر شبكة لاسلكية أو مقهى إنترنت');if(k==='main_facebook'&&v){let link;try{link=new URL(v)}catch{throw Error('اكتب رابطاً كاملاً يبدأ بـ http أو https')}if(!['http:','https:'].includes(link.protocol)||link.username||link.password)throw Error('رابط الصفحة غير صالح')}next.settings[k]=v}commit(next,'حفظ إعدادات العرض');if(b.mubasher_port!==undefined){const cfg=path.join(dir,'server-config.json'),value=fs.existsSync(cfg)?JSON.parse(fs.readFileSync(cfg,'utf8')):{port,bind:'0.0.0.0'};value.broadcastPort=Number(b.mubasher_port);fs.writeFileSync(cfg+'.tmp',JSON.stringify(value));fs.renameSync(cfg+'.tmp',cfg);}return reply(res,{msg:'ok'})}
 if(action==='setStar'){let s=next.sections.find(x=>x.id===a[1]);if(!s)throw Error('قسم غير معروف');s.star=!s.star;commit(next,'تغيير تمييز قسم');return reply(res,{msg:'ok'})}
 if(action==='updateUserData'){
 if(req.method!=='POST')return reply(res,{msg:'error'},405);let u=next.users.find(u=>u.id===b.userId);if(!u){if(b.userId&&b.userId!=='null'&&b.userId!=='userId'&&b.userId!=='undefined')throw Error('المستخدم غير موجود');u={id:crypto.randomUUID(),active:true,level:'user',allowed:'all'};next.users.push(u)}
 if(!String(b.username||u.username||'').trim())throw Error('اسم الدخول مطلوب');for(const k of ['name','username','email','allowed','about','phoneNumber','facebook','twitter','instagram'])if(b[k]!==undefined)u[k]=String(b[k]).trim().slice(0,200);if(b.level!==undefined){b.level=({'0':'admin','1':'user'})[b.level]||b.level;if(!['admin','user'].includes(b.level))throw Error('الصلاحية يجب أن تكون admin أو user');u.level=b.level}if(b.allowed!==undefined)u.active=b.allowed==='1';if(b.password){if(b.password.length<10)throw Error('كلمة المرور يجب ألا تقل عن 10 أحرف');Object.assign(u,hash(b.password))}if(!u.hash)throw Error('كلمة المرور مطلوبة');if(next.users.some(x=>x.id!==u.id&&x.username.toLowerCase()===u.username.toLowerCase()))throw Error('اسم الدخول مستخدم');if(!next.users.some(x=>x.active&&x.level==='admin'))throw Error('يجب الإبقاء على مدير فعال');commit(next,'حفظ مستخدم محلي');for(const [token,s] of sessions)if(s.id===u.id)sessions.delete(token);return reply(res,{msg:'ok',user:safeUser(u)})}
 if(action==='user'&&['block','unblock'].includes(a[1])){const u=next.users.find(u=>u.id===a[2]);if(!u)throw Error('المستخدم غير موجود');if(u.id===sess.user.id)throw Error('لا يمكن تعطيل حسابك الحالي');u.active=a[1]==='unblock';if(!next.users.some(x=>x.active&&x.level==='admin'))throw Error('يجب الإبقاء على مدير فعال');commit(next,'تغيير حالة المستخدم');for(const [token,s] of sessions)if(s.id===u.id)sessions.delete(token);return reply(res,{msg:'ok'})}
 if(action==='saveDatabase'){commit(next,'حفظ نسخة احتياطية يدوية');return reply(res,{msg:'ok'})}
 return reply(res,{msg:'error',error:'هذه الخدمة لم تُربط بالخادم المحلي بعد',service:action},501);
 }catch(e){return reply(res,{msg:'error',error:e.message},e.status||400)}}};
};


