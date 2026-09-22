(()=>{'use strict';
 const states=new WeakMap(),tracked=new Set(),MAX_TRIES=6;let active=0,scheduled=false;
 const missing='data:image/svg+xml;charset=utf-8,'+encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#202638"/><path d="M105 190h90v70h-90z M105 247l26-26 20 18 16-14 28 29" fill="none" stroke="#737b99" stroke-width="4"/><circle cx="171" cy="207" r="7" fill="#737b99"/></svg>');
 const connected=img=>document.documentElement.contains(img);
 function source(raw){try{const u=new URL(raw,location.href);if(u.origin!==location.origin||!/^\/(?:api\/+)?itemimage\/[\w.-]+\/?$/i.test(u.pathname))return null;u.search=u.search.slice(1).split('&').filter(part=>part&&!/^zainRetry=/i.test(part)).join('&');return u.href;}catch{return null;}}
 function release(img,s){if(s?.controller)s.controller.abort();tracked.delete(img);states.delete(img);}
 function state(img){
  if(!img||img.tagName!=='IMG')return null;
  const raw=img.getAttribute('src')||'';let s=states.get(img);
  if(s&&raw===s.rendered)return s;
  let url=source(raw);
  // Some legacy cards insert their temporary image before the actual poster URL.
  if(!url&&(!raw||/^data:image\//i.test(raw))){const a=img.closest('a[href*="/itemView/"]'),m=a?.getAttribute('href')?.match(/\/itemView\/[^/]+\/([\w.-]+)/);if(m)url=new URL('/ItemImage/'+m[1],location.href).href;}
  if(s)release(img,s);
  if(!url)return null;
  s={url,rendered:raw,next:0,tries:0,ready:false,busy:false,verified:false,nativeStarted:Date.now(),awaitingNative:false};states.set(img,s);tracked.add(img);
  if(!source(raw)){s.rendered=url;img.src=url;}
  return s;
 }
 function visible(img){const r=img.getBoundingClientRect();return r.bottom>=-100&&r.top<=innerHeight+200&&r.right>=-100&&r.left<=innerWidth+200;}
 function ready(img,s){s.ready=true;s.awaitingNative=false;img.setAttribute('data-zain-artwork','ready');}
 function fail(img,s){
  s.verified=false;s.awaitingNative=false;
  if(s.tries>=MAX_TRIES){s.ready=false;s.rendered=missing;img.src=missing;img.setAttribute('data-zain-artwork','unavailable');return;}
  s.next=Date.now()+Math.min(15000,750*Math.pow(2,s.tries-1));img.setAttribute('data-zain-artwork','loading');
 }
 async function recover(img,s){
  active++;s.busy=true;s.tries++;s.controller=new AbortController();const controller=s.controller;let timer;
  img.setAttribute('data-zain-artwork','loading');
  try{
   // Keep one stable URL: successful posters use the browser's ordinary HTTP cache.
   const r=await Promise.race([fetch(s.url,{signal:controller.signal,cache:'default',credentials:'same-origin'}),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},15000);})]);
   if(!r.ok||r.headers.get('X-Zain-Placeholder')||!/^(image\/)/i.test(r.headers.get('Content-Type')||'')||/svg/i.test(r.headers.get('Content-Type')||''))throw Error('pending');
   const b=await r.blob();if(!b.size||b.size>8*1024*1024)throw Error('invalid');
   if(!connected(img)||states.get(img)!==s)return;
   s.verified=true;s.awaitingNative=true;s.nativeStarted=Date.now();s.next=Date.now()+15000;s.rendered=s.url;
   // Reassign only after the cached response is complete, replacing the temporary SVG.
   img.removeAttribute('src');img.src=s.url;
  }catch{if(connected(img)&&states.get(img)===s)fail(img,s);}
  finally{clearTimeout(timer);s.controller=null;s.busy=false;active--;schedule();}
 }
 function refresh(){
  scheduled=false;
  for(const img of tracked){const s=states.get(img);if(!connected(img)){release(img,s);continue;}if(!s||s.ready||s.busy||s.tries>=MAX_TRIES||document.hidden)continue;
   const pending=Date.now()-s.nativeStarted<15000;
   if(s.awaitingNative&&pending)continue;
   if(img.complete&&img.naturalWidth>0){
    // This dimension is the server's temporary SVG. Verify its response header;
    // a genuine poster of the same size is accepted normally after that check.
    if(s.verified||img.naturalWidth!==300||img.naturalHeight!==450){ready(img,s);continue;}
   }else if(!img.complete&&pending)continue;
   if(Date.now()<s.next||!visible(img))continue;
   if(active<4)recover(img,s);
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
 function discover(node){if(node.nodeType!==1)return;if(node.tagName==='IMG')state(node);for(const img of node.querySelectorAll('img'))state(img);}
 document.addEventListener('load',e=>{const img=e.target,s=state(img);if(!s||s.rendered===missing)return;if(img.naturalWidth>0&&(s.verified||img.naturalWidth!==300||img.naturalHeight!==450))ready(img,s);schedule();},true);
 document.addEventListener('error',e=>{const img=e.target,s=state(img);if(!s||s.rendered===missing)return;s.ready=false;if(s.awaitingNative){fail(img,s);}else{s.verified=false;s.next=Date.now();}schedule();},true);
 new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')state(record.target);else for(const node of record.addedNodes)discover(node);}schedule();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src']});
 for(const img of document.images)state(img);
 setInterval(schedule,1500);schedule();window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 window.addEventListener('online',()=>{for(const img of tracked){const s=states.get(img);if(!s.ready&&!s.busy){s.tries=0;s.next=0;if(s.rendered===missing){s.rendered=s.url;img.src=s.url;}}}schedule();});
 document.addEventListener('visibilitychange',schedule);
})();

