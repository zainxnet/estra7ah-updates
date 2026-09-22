(function(){'use strict';
 if(window.parent===window||window.__zainDesktopBridgeVersion>=403)return;window.__zainDesktopBridgeVersion=403;
 var ready=false,pending={},helloTimer=null,helloAttempts=0;
 window.addEventListener('message',function(event){
  if(event.source!==window.parent||!event.data)return;
  var data=event.data;
  if(data.type==='zain-desktop-ready'){ready=true;clearInterval(helloTimer);}
  if(!ready)return;
  if(data.type==='zain-desktop-folder-result'&&pending[data.requestId]){var entry=pending[data.requestId];delete pending[data.requestId];clearTimeout(entry.timer);if(data.error)entry.reject(Error(data.error));else entry.resolve(data.result)}
  if(data.type==='zain-desktop-navigation'){if(data.action==='back')history.back();else if(data.action==='forward')history.forward();else if(data.action==='reload')location.reload()}
 });
 window.zainDesktopOpen=function(path){if(!ready){if(!window.__zainClientInjected)return null;return new Promise(function(resolve,reject){var attempts=0,wait=setInterval(function(){if(ready){clearInterval(wait);window.zainDesktopOpen(path).then(resolve,reject)}else if(++attempts>=50){clearInterval(wait);reject(Error('تعذر الاتصال بخدمة المجلد في العميل. أغلق العميل وافتح النسخة المحدثة ثم أعد المحاولة.'))}},100)})}return new Promise(function(resolve,reject){var id=Date.now()+'-'+Math.random().toString(36).slice(2);pending[id]={resolve:resolve,reject:reject,timer:setTimeout(function(){delete pending[id];reject(Error('انتهت مهلة فتح المجلد'))},40000)};window.parent.postMessage({type:'zain-desktop-open-folder',requestId:id,path:path},'*')})};
 function hello(){if(ready||helloAttempts++>=10){clearInterval(helloTimer);return;}window.parent.postMessage({type:'zain-desktop-hello'},'*');}
 helloTimer=setInterval(hello,500);hello();
 window.addEventListener('unload',function(){clearInterval(helloTimer)});
})();
