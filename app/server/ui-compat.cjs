'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const dashboard='/static/js/46.f5f683b6.chunk.js',events='/static/js/42.69b679d5.chunk.js';
const hashes={
 [dashboard]:'66ef1f7318c6e78acf65856babe16d4dd53f150c9ba1bc4123315270039d562d',
 [events]:'e47c190a957096b5993be25f237ed0e0b65b9924dc4722ba85a682cb73180373'
};
const oldEffect='return x.a.adminWs.addMessageListener("bandwidth-msg",(function(e){var s;"bandwidth"==e.type&&"bandwith_size"==e.msg&&(s=e.payload,L((function(e){return e.map((function(e){return e.data=s,e}))})),x.a.adminWs&&x.a.adminWs.sendQueue({msg:"getConnectedUsers"}))})),function(){x.a.adminWs.removeMessageListener("bandwidth-msg")}';
const newEffect='return window.zainDashboardBridge.subscribe(function(s){L(function(e){return e.map(function(e){return Object.assign({},e,{data:s})})})})';
module.exports=function createUiCompat({interfaceDir}){
 const transformed=new Map(),capabilities={dashboard:false,events:false,adminControlsNoTier:true};
 // Preserve legacy titles (spaces, slash, #, ?, %) as one URL component.
 for(const name of ['15.27ffe403.chunk.js','15.5c8c4b20.chunk.js']){
  const route='/static/js/'+name,file=path.join(interfaceDir,route.slice(1));if(!fs.existsSync(file))continue;
  const text=fs.readFileSync(file,'utf8'),old='"removeExt/"+n';
  if(text.split(old).length!==2)throw Error('تغير رابط حذف الحصرية ويحتاج مراجعة');
  transformed.set(route,Buffer.from(text.replace(old,'"removeExt/"+encodeURIComponent(n)')));
 }
 for(const [route,hash] of Object.entries(hashes)){
  const filename=path.join(interfaceDir,route.slice(1));if(!fs.existsSync(filename))continue;
  const source=fs.readFileSync(filename);if(crypto.createHash('sha256').update(source).digest('hex')!==hash)throw Error('تغير ملف الواجهة ويحتاج مراجعة توافق: '+route);
  let text=source.toString('utf8');
  if(route===dashboard){if(text.split(oldEffect).length!==2)throw Error('Dashboard adapter target changed');text=text.replace(oldEffect,newEffect);capabilities.dashboard=true;}
  else{if(text.split('l.a.isPro()').length!==3)throw Error('Events adapter target changed');text=text.replaceAll('l.a.isPro()','window.zainCapabilities.events');capabilities.events=true;}
  transformed.set(route,Buffer.from(text));
 }
 // Only administrative presentation guards are adapted. The original entitlement
 // function, public VIP checks, authentication and source files remain intact.
 for(const target of require('./admin-ui-targets.cjs')){
  const filename=path.join(interfaceDir,target.route.slice(1));if(!fs.existsSync(filename))continue;
  const source=fs.readFileSync(filename);
  if(crypto.createHash('sha256').update(source).digest('hex')!==target.sha256)throw Error('تغير ملف خيارات الإدارة ويحتاج مراجعة: '+target.route);
  const original=source.toString('utf8'),pattern=/[A-Za-z_$][\w$]*\.a\.isPro\(\)/g;
  if([...original.matchAll(pattern)].length!==target.calls)throw Error('تغير عدد خيارات الإدارة: '+target.route);
  let text=(transformed.get(target.route)||source).toString('utf8').replace(pattern,'window.zainCapabilities.adminControlsNoTier');
  if(target.route.includes('/main.')){
   const transport='t.headers["X-estra7ah-user-id"]=h.RMUID,fetch(e,t)';
   if(text.split(transport).length!==2)throw Error('Admin transport adapter target changed');
   text=text.replace(transport,'t.headers["X-estra7ah-user-id"]=h.RMUID,window.zainAdminFetch(e,t)');
   const oldPaths='v.a.fetch(v.a.admin+"scanSectionsPaths",{method:"GET"}).then((function(e){return e.json()})).then((function(e){d(e.sections)})).catch((function(){}))';
   if(text.split(oldPaths).length!==2)throw Error('Path check adapter changed');
   text=text.replace(oldPaths,'var active=true,timer;function poll(){v.a.fetch(v.a.admin+"scanSectionsPaths",{method:"GET"}).then(function(r){return r.json()}).then(function(r){if(active)d(r.sections||[])}).catch(function(){}).finally(function(){if(active)timer=setTimeout(poll,5000)})}poll();return function(){active=false;clearTimeout(timer)}');

  }
  transformed.set(target.route,Buffer.from(text));
 }
 // Reduce only the public search input debounce; preserve other controls.
 for(const name of ['12.41b0cf3e.chunk.js','12.fe8e7055.chunk.js']){const route='/static/js/'+name,file=path.join(interfaceDir,route.slice(1));if(!fs.existsSync(file))continue;let text=fs.readFileSync(file,'utf8');const old='C(),_(null);case 2:case"end":return e.stop()}}),e)}))),500))';if(text.includes(old))transformed.set(route,Buffer.from(text.replace(old,'C(),_(null);case 2:case"end":return e.stop()}}),e)}))),250))')));}
 // The backup form uses Axios, so its success/failure notifications must be
 // adapted here rather than only through the fetch transport below.
 for(const [name,hash] of [['31.a677ebb8.chunk.js','f51c1eae685b82f4661095a3d69892e8be14724b55e981d437f22504816f0af0'],['31.f851655d.chunk.js','007e38b450c404d297a1894b0252f9913789ca52642b095062b3ccdfdbb34150']]){
  const route='/static/js/'+name,file=path.join(interfaceDir,route.slice(1));if(!fs.existsSync(file))continue;
  const original=fs.readFileSync(file);if(crypto.createHash('sha256').update(original).digest('hex')!==hash)throw Error('تغيرت واجهة النسخ الاحتياطي: '+name);
  let text=(transformed.get(route)||original).toString('utf8');const start=text.indexOf('f.a.request({method:"post",url:h.a.admin+"restoreBackup"'),end=text.indexOf('}}),Object(i.jsx)(u.b',start);
  if(start<0||end<start)throw Error('Backup upload adapter target changed');
  const upload='f.a.request({method:"post",url:h.a.admin+"restoreBackup",data:n,withCredentials:!0}).then(function(response){var result=response.data;if(!result||result.msg!=="ok")throw new Error(result&&result.error||"تعذر التحقق من النسخة الاحتياطية");p.Store.addNotification({title:result.restartRequired?"النسخة جاهزة للاستعادة بعد إعادة التشغيل":"تمت الاستعادة",message:result.message||(result.restartRequired?"أوقف الخادم من المشغل ثم شغله لتطبيق النسخة المستوردة.":"تمت الاستعادة بنجاح"),type:"success",insert:"top",container:"bottom-left",animationIn:["animated","fadeIn"],animationOut:["animated","fadeOut"],dismiss:{duration:6e4},dismissable:{click:!0}})}).catch(function(error){var result=error.response&&error.response.data;p.Store.addNotification({title:"تعذرت استعادة النسخة الاحتياطية",message:result&&result.error||error.message||"تعذر الاتصال بالخادم",type:"danger",insert:"top",container:"bottom-left",animationIn:["animated","fadeIn"],animationOut:["animated","fadeOut"],dismiss:{duration:6e4},dismissable:{click:!0}})}).then(function(){if(t.current)t.current.value=""})';
  text=text.slice(0,start)+upload+text.slice(end);text=text.replace('type:"file",className:"inputfilebtn",ref:t','type:"file",accept:".zip,.gz",className:"inputfilebtn",ref:t');transformed.set(route,Buffer.from(text));
 }
 // Defer real poster URLs until the bounded nearby-row loader starts them.
 const jsDir=path.join(interfaceDir,'static/js');
 if(fs.existsSync(jsDir))for(const name of fs.readdirSync(jsDir).filter(n=>n.endsWith('.js'))){
  const route='/static/js/'+name,original=transformed.get(route)||fs.readFileSync(path.join(jsDir,name));
  let text=original.toString(),count=0;
  text=text.replace(/src:([A-Za-z_$][\w$]*\.src\+"\?eid="\+[A-Za-z_$][\w$]*\.a\.RMUID),alt:/g,(all,url)=>{count++;const test='/\\/itemimage\\//i.test('+url+')';return '"data-zain-src":'+test+'?'+url+':void 0,src:'+test+'?void 0:'+url+',alt:';});
  if(count)transformed.set(route,Buffer.from(text));
 }

 // Apply the same footer to every bundled public, admin and login page.
 for(const name of fs.readdirSync(jsDir).filter(n=>n.endsWith('.js'))){const route='/static/js/'+name,source=(transformed.get(route)||fs.readFileSync(path.join(jsDir,name))).toString();const text=require('./branding.cjs').javascript(source);if(text!==source)transformed.set(route,Buffer.from(text));}
 const bridgeScript=`(function(){'use strict';window.zainCapabilities=Object.freeze(${JSON.stringify(capabilities)});window.zainDashboardBridge={subscribe:function(callback){var stopped=false,timer,controller;async function poll(){if(stopped)return;controller=new AbortController();var timeout=setTimeout(function(){controller.abort()},5000);try{var response=await fetch('/admin/api/getBandwidth',{credentials:'same-origin',cache:'no-store',signal:controller.signal});if(response.ok){var result=await response.json();if(!stopped&&Array.isArray(result.samples))callback(result.samples)}}catch(error){}finally{clearTimeout(timeout);if(!stopped)timer=setTimeout(poll,document.hidden?10000:2000)}}poll();return function(){stopped=true;clearTimeout(timer);if(controller)controller.abort()}}}})();`;
 const folderTargets=[['18.a1e28c2f.chunk.js','66a764b8188d5d3f0540833f21913ed0600c702972f85f9acd6ef8a61e3ce231'],['20.56691b34.chunk.js','0e9216d8219d15011f910e0e0babaa5c7258da7af0b063639b56ef7a0e161f43'],['30.73cc7841.chunk.js','5552ead862e2e19bb380586c1ca131a285613e2a2a2345bc82c69f2a0f6d56c2']];
 for(const [name,hash]of folderTargets){const route='/static/js/'+name,file=path.join(interfaceDir,route.slice(1));if(!fs.existsSync(file))continue;const source=fs.readFileSync(file);if(crypto.createHash('sha256').update(source).digest('hex')!==hash)throw Error('Folder UI changed: '+name);transformed.set(route,Buffer.from(require('./branding.cjs').javascript(source.toString()).replace(/window\.nw&&window\.nw\.Shell\.openItem\(([A-Za-z])\)/g,'window.zainOpenFolder($1)')));}
 for(const name of ['18.a1e28c2f.chunk.js','30.73cc7841.chunk.js']){const route='/static/js/'+name,source=transformed.get(route);if(source)transformed.set(route,Buffer.from(require('./similar-ui.cjs')(source.toString())));}
 const seasonClickScript=";var zainCaffe=false;fetch('/api/getMainSettings',{credentials:'same-origin'}).then(function(r){return r.json()}).then(function(s){zainCaffe=s.estra7ah_type==='caffe'}).catch(function(){});document.addEventListener('click',function(event){if(!zainCaffe)return;if(event.button!==0||event.ctrlKey||event.metaKey||event.shiftKey||event.altKey)return;var link=event.target.closest&&event.target.closest('a[href]');if(!link)return;var url=new URL(link.href,location.href);if(url.origin!==location.origin)return;var match=/^\\/itemView\\/season\\/([^/]+)/.exec(url.pathname);if(!match)return;event.preventDefault();event.stopImmediatePropagation();window.zainOpenFolder('/zain/folder/'+match[1]);},true);";
 const folderStyle='<style id="zain-folder-button">.btn.add-btn{display:none!important}.explor-btn .btn.play-btn{display:inline-flex!important;align-items:center;gap:5px;background:red!important;color:white!important;box-shadow:0 0 40px 3px #e62e2d;border-radius:24px!important;font-family:Estra7ahBold;padding:5px 16px!important;cursor:pointer;line-height:1.5}.explor-btn{padding:8px 0}</style>';
 const adminTransport=`(function(){'use strict';window.zainOpenFolder=function(value){if(typeof value==='string'&&/^\\/zain\\/folder\\/[A-Za-z0-9_-]+$/.test(value)){nativeFetch(value.replace('/zain/folder/','/zain/open-folder/'),{method:'POST',credentials:'same-origin'}).then(async function(response){var result=await response.json();if(!response.ok)showError(result.error||'تعذر فتح المجلد');else if(result.openedInFront===false)showError('تم طلب فتح المجلد لكن تعذر إظهاره أمام المتصفح. تأكد من تشغيل مشغل الاستراحة في جلسة ويندوز نفسها. السبب: '+(result.reason||'غير معروف'))}).catch(function(){showError('تعذر الاتصال بخدمة فتح المجلد')})}};var nativeFetch=window.fetch.bind(window);var lastError='',lastAt=0;function showError(message){if(lastError===message&&Date.now()-lastAt<10000)return;lastError=message;lastAt=Date.now();var notice=document.getElementById('zain-service-error');if(!notice){notice=document.createElement('div');notice.id='zain-service-error';notice.dir='rtl';notice.setAttribute('role','alert');notice.style.cssText='position:fixed!important;bottom:auto!important;left:16px!important;right:auto!important;top:16px!important;z-index:2147483647!important;max-width:420px;padding:14px 18px;border:1px solid #d08c59;border-radius:8px;background:#392c2a;color:#fff;font:14px sans-serif;line-height:1.6;cursor:pointer';notice.onclick=function(){notice.hidden=true};document.body.appendChild(notice)}notice.textContent=message+' — اضغط لإخفاء الرسالة';notice.hidden=false}window.zainAdminFetch=async function(input,options){if(typeof input==='string'&&input==='http://premium.yetech.co:8098/getAll')return new Response('[]',{headers:{'Content-Type':'application/json'}});var response=await nativeFetch(input,options),url;try{url=new URL(typeof input==='string'?input:input.url,location.href)}catch(error){return response}if(url.origin===location.origin&&/^\\/admin\\/api\\/SyncSection/.test(url.pathname)){window.dispatchEvent(new CustomEvent('zain-sync-requested',{detail:{ok:response.ok}}));}if(response.ok&&url.origin===location.origin&&['/admin/api/editSection','/admin/api/updateSection','/admin/api/addSection'].includes(url.pathname)){setTimeout(function(){document.querySelectorAll('img').forEach(function(img){if(/sectionimage/i.test(img.src)){var u=new URL(img.src,location.href);u.searchParams.set('zainCover',Date.now());img.src=u.href}})},400);} if(url.origin===location.origin&&url.pathname.startsWith('/admin/api/')&&!url.pathname.includes('/checkAdmin')&&response.status!==401){var result;try{result=await response.clone().json()}catch(error){}if(!response.ok||result&&result.msg==='error'){var message=result&&result.error||'تعذر تنفيذ هذه الخدمة على الخادم المحلي';if(response.status===501){var service=url.pathname.slice('/admin/api/'.length).split('/')[0];message=service==='isApprove'?'طلب التحقق من إتاحة لوحة الإدارة (isApprove) غير مربوط بالخادم المحلي':'الخدمة غير المربوطة بالخادم المحلي: '+service;}showError(message);throw new Error(message)}}return response}})();`;
 return {capabilities,bridgeScript:bridgeScript+adminTransport+seasonClickScript+require('./branding.cjs').browserScript+";function zainFolderLabels(){document.querySelectorAll('.explor-btn .btn, .btn.play-btn').forEach(function(button){var label=button.textContent.trim();if(label==='تصفح'||label.indexOf('فتح المجلد')===0){Array.from(button.childNodes).forEach(function(node){if(node.nodeType===3&&node.textContent.trim()&&node.textContent!==' فتح المجلد وتصفحه')node.textContent=' فتح المجلد وتصفحه';});}});}zainFolderLabels();new MutationObserver(zainFolderLabels).observe(document.documentElement,{childList:true,subtree:true});"+';document.head.insertAdjacentHTML("beforeend",'+JSON.stringify(folderStyle+'<style>'+ ".image-loading>svg{display:block!important}.image-loading[data-zain-pending=\"no\"]{display:none!important}.zain-poster-slot{position:relative}.zain-poster-slot>.image-loading{position:absolute;top:0;left:0;width:100%;height:100%}.zain-poster-slot>.image-loading>svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}img[data-zain-artwork=\"unavailable\"]{visibility:visible!important}.image-loading[data-zain-pending=\"yes\"]{display:block!important}.zain-poster-slot{display:block;background:#202638;border-radius:8px;overflow:hidden}img[data-zain-artwork=\"queued\"],img[data-zain-artwork=\"loading\"]{width:100%!important;aspect-ratio:2/3;background:#202638!important;color:transparent!important;visibility:hidden!important}img[data-zain-artwork=\"ready\"]{visibility:visible!important}" +'</style>')+');',transform:route=>transformed.get(route)||null};
};
