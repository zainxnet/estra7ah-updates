(function(){'use strict';
 if(window.__zainFolderClientVersion>=405)return;window.__zainFolderClientVersion=405;
 var busy=false;
 function trace(stage){if(window.__zainClientInjected)window.parent.postMessage({type:'zain-folder-trace',stage:stage},'*')}
 function request(url,options){return new Promise(function(resolve,reject){
  var done=false,controller=typeof AbortController==='function'?new AbortController():null;
  var timer=setTimeout(function(){if(done)return;done=true;if(controller)controller.abort();reject(Error('لم يرد السيرفر على طلب فتح المجلد خلال 15 ثانية. تحقق من الاتصال ثم أعد المحاولة.'))},15000);
  function finish(error,value){if(done)return;done=true;clearTimeout(timer);if(error)reject(error);else resolve(value)}
  if(controller)options.signal=controller.signal;
  Promise.resolve().then(function(){return fetch(url,options)}).then(function(r){return r.text().then(function(text){var v;try{v=JSON.parse(text)}catch(e){var error=Error('أعاد السيرفر صفحة ويب بدل بيانات المجلد');error.legacyEndpoint=(r.status!==401&&r.status!==403)&&(/^\s*</.test(text)||r.status===404||r.status===405);throw error;}if(!r.ok){var error=Error(v.error||'تعذر الوصول إلى المجلد');error.legacyEndpoint=r.status===404||r.status===405;throw error;}return v;})}).then(function(v){finish(null,v)},function(e){finish(e)});
 })}

 function notice(text){if(/^(?:جارٍ|تم فتح المجلد|تم طلب فتح المجلد)/.test(text)){var previous=document.getElementById("zain-folder-notice");if(previous)previous.remove();return;}var box=document.getElementById('zain-folder-notice');if(!box){box=document.createElement('div');box.id='zain-folder-notice';box.dir='rtl';box.style.cssText='position:fixed;bottom:18px;left:18px;z-index:2147483647;max-width:440px;padding:16px;background:#392c2a;color:#fff;border:1px solid #d08c59;border-radius:8px;font:16px Arial;line-height:1.7';box.onclick=function(){box.remove()};document.body.appendChild(box)}box.textContent=text;clearTimeout(box.zainDismiss);box.zainDismiss=setTimeout(function(){box.remove()},8000);}
 window.zainOpenFolder=function(value){
  if(busy)return;
  if(typeof value==='string'&&/^\\\\[^\\?.][^\\]*\\[^\\]+/.test(value)&&window.__zainClientInjected&&window.zainDesktopOpen){
   busy=true;trace('direct-UNC-request');notice('جارٍ فتح المجلد…');
   Promise.resolve().then(function(){return window.zainDesktopOpen(value)}).then(function(result){if(!result)throw Error('خدمة فتح المجلد غير جاهزة');notice(result.openedInFront?'تم فتح المجلد':'تم طلب فتح المجلد؛ تعذر تأكيد ظهوره أمام النافذة.')}).catch(function(e){trace('request-error '+e.message);notice(e.message)}).then(function(){busy=false});return;
  }
  if(typeof value==='string'&&/^https?:/.test(value)){try{var url=new URL(value,location.href);if(url.origin===location.origin)value=url.pathname;}catch(e){}}
  if(typeof value!=='string'||!/^\/zain\/folder\/[A-Za-z0-9_-]+$/.test(value)){trace('invalid-folder-target');notice('تعذر تحديد رابط المجلد من الصفحة. أغلق العميل وافتح الإصدار المحدث ثم أعد المحاولة.');return;}
  busy=true;trace('target-request');notice('جارٍ طلب فتح المجلد…');
  request(value.replace('/zain/folder/','/zain/folder-target/'),{method:'POST',credentials:'same-origin'}).catch(function(error){
   if(!error.legacyEndpoint||!window.__zainClientInjected)throw error;
   trace('legacy-server-fallback');
   var id=value.slice('/zain/folder/'.length),base=location.origin;
   // Reuse the API origin actually loaded by this page, including its port.
   if(typeof performance!=='undefined'&&performance.getEntriesByType){var entries=performance.getEntriesByType('resource');for(var i=entries.length-1;i>=0;i--){try{var u=new URL(entries[i].name);if(u.hostname===location.hostname&&/^\/api\/getItemData\//.test(u.pathname)){base=u.origin;break;}}catch(e){}}}
   return request(base+'/api/getItemData/'+encodeURIComponent(id),{method:'GET',credentials:'include'}).then(function(item){
    var data=item&&item.data&&typeof item.data==='object'?item.data:item&&item.item||item;
    var folder=data&&data.path;
    if(typeof folder==='string')folder=folder.replace(/\//g,'\\');
    if(typeof folder!=='string'||!/^\\\\[^\\?.][^\\]*\\[^\\]+/.test(folder))throw Error('لم يرجع السيرفر القديم مسار مشاركة صالحًا. يلزم تحديث خدمة المجلد في السيرفر.');
    return {local:false,nativePath:folder};
   });
  }).then(function(v){
   trace(v.nativePath?'target-received':'target-no-native-path');
   if(v.nativePath&&window.zainDesktopOpen){var desktop=window.zainDesktopOpen(v.nativePath);if(desktop)return desktop.then(function(result){if(result&&result.openedInFront===false)notice('تم طلب فتح المجلد؛ تعذر تأكيد ظهوره أمام النافذة.');else notice('تم فتح المجلد')});}
   // NW opens on the client computer, including UNC paths hosted on another PC.
   if(window.nw&&window.nw.Shell&&typeof window.nw.Shell.openItem==='function'&&v.nativePath){window.nw.Shell.openItem(v.nativePath);notice('تم طلب فتح المجلد');return;}
   if(!v.local){window.location.assign(v.browseUrl);return;}
   return request(value.replace('/zain/folder/','/zain/open-folder/'),{method:'POST',credentials:'same-origin'}).then(function(result){if(result.openedInFront===false)notice('تم طلب فتح المجلد. تعذر إظهاره أمام المتصفح؛ تأكد من تشغيل مشغل الاستراحة في جلسة ويندوز نفسها.');else notice('تم فتح المجلد')});
  }).catch(function(e){trace('request-error '+e.message);notice(e.message||'تعذر الاتصال بخدمة المجلد')}).then(function(){busy=false});
 };
})();
