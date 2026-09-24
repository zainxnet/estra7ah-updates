(()=>{'use strict';
 const posterStyle=document.createElement('style');posterStyle.textContent=".image-loading>svg{display:block!important}.image-loading[data-zain-pending=\"no\"]{display:none!important}.zain-poster-slot{position:relative}.zain-poster-slot>.image-loading{position:absolute;top:0;left:0;width:100%;height:100%}.zain-poster-slot>.image-loading>svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}img[data-zain-artwork=\"unavailable\"]{visibility:visible!important}.image-loading[data-zain-pending=\"yes\"]{display:block!important}.zain-poster-slot{display:block;background:#202638;border-radius:8px;overflow:hidden}img[data-zain-artwork=\"queued\"],img[data-zain-artwork=\"loading\"]{width:100%!important;aspect-ratio:2/3;background:#202638!important;color:transparent!important;visibility:hidden!important}img[data-zain-artwork=\"ready\"]{visibility:visible!important}";document.head.appendChild(posterStyle);
 const states=new WeakMap(),tracked=new Set(),MAX_TRIES=6;let active=0,backgroundActive=0,scheduled=false,retryTimer=0,retryAt=0;
 // Keep room for newly visible cards while the remaining home posters warm up.
 const MAX_VISIBLE_REQUESTS=12,MAX_BACKGROUND_REQUESTS=6,MAX_PENDING_MS=60000;
 const missing='/assets/imgs/no-img.png';
 const connected=img=>document.documentElement.contains(img);
 function source(raw){try{const u=new URL(raw,location.href);if(u.origin!==location.origin||!/^\/(?:api\/+)?itemimage\/[\w.-]+\/?$/i.test(u.pathname))return null;u.search=u.search.slice(1).split('&').filter(part=>part&&!/^zainRetry=/i.test(part)).join('&');return u.href;}catch{return null;}}
 function mark(img,status){img.setAttribute('data-zain-artwork',status);if(status==='queued'||status==='loading'){const width=img.parentElement?.clientWidth||img.getBoundingClientRect().width||100;img.style.minHeight=Math.round(width*1.5)+'px';}else img.style.minHeight='';const p=img.parentElement;if(p)for(const child of p.children)if(child.classList.contains('image-loading'))child.setAttribute('data-zain-pending',status==='queued'||status==='loading'?'yes':'no');}
 function freeSlot(s){if(s&&s.slot){s.slot=false;active--;}}
 function release(img,s){freeSlot(s);if(s?.controller)s.controller.abort();if(s?.objectUrl)URL.revokeObjectURL(s.objectUrl);tracked.delete(img);states.delete(img);}
 function state(img){
  if(!img||img.tagName!=='IMG')return null;
  const raw=img.getAttribute('src')||'',desired=source(img.getAttribute('data-zain-src')||'');let s=states.get(img);
  // Home section covers use native loading; wake even the covers below the fold.
  if(/^\/(?:index\.html)?$/i.test(location.pathname)&&raw){try{const cover=new URL(raw,location.href);if(cover.origin===location.origin&&/^\/(?:api\/+)?sectionimage\/[\w.-]+\/?$/i.test(cover.pathname)){img.loading='eager';img.decoding='async';}}catch{}}
  if(s&&raw===s.rendered&&(!desired||desired===s.url))return s;
  let url=desired||source(raw);
  // Some legacy cards insert their temporary image before the actual poster URL.
  if(!url&&(!raw||/^data:image\//i.test(raw))){const a=img.closest('a[href*="/itemView/"]'),m=a?.getAttribute('href')?.match(/\/itemView\/[^/]+\/([\w.-]+)/);if(m)url=new URL('/ItemImage/'+m[1],location.href).href;}
  if(s)release(img,s);
  if(!url)return null;
  s={url,rendered:raw,next:0,tries:0,ready:false,busy:false,verified:false,nativeStarted:Date.now(),awaitingNative:false,queued:!!desired||!source(raw),slot:false,pendingStarted:0};states.set(img,s);tracked.add(img);
  mark(img,s.queued?'queued':'loading');
  return s;
 }
 function position(img,home){const r=img.getBoundingClientRect(),shown=r.width>0&&r.height>0,horizontal=r.right>=0&&r.left<=innerWidth,visible=shown&&horizontal&&r.bottom>=0&&r.top<=innerHeight,preloadBelow=Math.max(2400,Math.min(6000,innerHeight*5));return {img,visible,eligible:shown&&(home||(horizontal&&r.bottom>=-300&&r.top<=innerHeight+preloadBelow)),distance:(r.top>innerHeight?r.top-innerHeight:r.bottom<0?-r.bottom:0)+(horizontal?0:innerHeight+Math.min(Math.abs(r.left),Math.abs(r.right-innerWidth)))};}
 function begin(img,s,background){s.queued=false;img.loading='eager';img.decoding='async';recover(img,s,background);}
 function retrySoon(at){if(retryTimer&&retryAt<=at)return;clearTimeout(retryTimer);retryAt=at;retryTimer=setTimeout(()=>{retryTimer=0;retryAt=0;schedule();},Math.max(0,at-Date.now()));}
 function ready(img,s){freeSlot(s);s.ready=true;s.awaitingNative=false;mark(img,'ready');}
 function fail(img,s){freeSlot(s);
  s.verified=false;s.awaitingNative=false;
  if(s.tries>=MAX_TRIES){s.ready=false;s.rendered=missing;img.src=missing;mark(img,'unavailable');return;}
  s.next=Date.now()+Math.min(15000,750*Math.pow(2,s.tries-1));mark(img,'loading');retrySoon(s.next);
 }
 async function recover(img,s,background){
  active++;if(background)backgroundActive++;s.busy=true;s.tries++;s.controller=new AbortController();const controller=s.controller;let timer;
  mark(img,'loading');
  try{
   // Keep one stable URL: successful posters use the browser's ordinary HTTP cache.
   const r=await Promise.race([fetch(s.url,{signal:controller.signal,cache:'default',credentials:'same-origin'}),new Promise((_,reject)=>{timer=setTimeout(()=>{controller.abort();reject(Error('timeout'));},15000);})]);
   const placeholder=r.headers.get('X-Zain-Placeholder');
   if(placeholder==='pending-artwork'||r.headers.get('X-Zain-Artwork-State')==='pending'){
    await r.arrayBuffer();
    if(!s.pendingStarted)s.pendingStarted=Date.now();
    if(Date.now()-s.pendingStarted>=MAX_PENDING_MS){s.tries=MAX_TRIES;throw Error('pending-timeout');}
    // A worker is still finding this poster. Do not spend the missing-image retries.
    s.tries--;const retrySeconds=Number(r.headers.get('Retry-After'));s.next=Date.now()+Math.max(300,Math.min(3000,Number.isFinite(retrySeconds)&&retrySeconds>0?retrySeconds*1000:500));s.awaitingNative=false;retrySoon(s.next);return;
   }
   if(!r.ok||placeholder||!/^(image\/)/i.test(r.headers.get('Content-Type')||'')||/svg/i.test(r.headers.get('Content-Type')||''))throw Error('pending');
   const b=await r.blob();if(!b.size||b.size>8*1024*1024)throw Error('invalid');
   if(!connected(img)||states.get(img)!==s)return;
   s.verified=true;s.awaitingNative=true;s.nativeStarted=Date.now();s.next=Date.now()+15000;
   // Fetch holds one cancellable queue slot. The blob decodes without another network request.
   if(s.objectUrl)URL.revokeObjectURL(s.objectUrl);s.objectUrl=URL.createObjectURL(b);s.rendered=s.objectUrl;
   img.src=s.objectUrl;
  }catch{if(connected(img)&&states.get(img)===s)fail(img,s);}
  finally{clearTimeout(timer);s.controller=null;s.busy=false;active--;if(background)backgroundActive--;schedule();}
 }
 function refresh(){
  scheduled=false;
  const home=/^\/(?:index\.html)?$/i.test(location.pathname),candidates=[];
  for(const img of tracked){const s=states.get(img);if(!connected(img)){release(img,s);continue;}if(s&&!s.ready&&!s.busy&&s.tries<MAX_TRIES)candidates.push(position(img,home));}
  candidates.sort((a,b)=>Number(b.visible)-Number(a.visible)||a.distance-b.distance);
  for(const candidate of candidates){const {img,visible,eligible}=candidate,s=states.get(img);if(document.hidden)break;
   const available=active<MAX_VISIBLE_REQUESTS&&(visible||backgroundActive<MAX_BACKGROUND_REQUESTS);
   if(s.queued){if(eligible&&available)begin(img,s,!visible);continue;}
   const pending=Date.now()-s.nativeStarted<15000;
   if(s.slot&&img.complete)freeSlot(s);
   if(s.awaitingNative&&pending)continue;
   if(img.complete&&img.naturalWidth>0){
    // This dimension is the server's temporary SVG. Verify its response header;
    // a genuine poster of the same size is accepted normally after that check.
    if(s.verified||img.naturalWidth!==300||img.naturalHeight!==450){ready(img,s);continue;}
   }else if(!img.complete&&pending)continue;
   if(Date.now()<s.next||!eligible)continue;
   if(available)recover(img,s,!visible);
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(refresh);}}
 function discover(node){if(node.nodeType!==1)return;if(node.tagName==='IMG')state(node);for(const img of node.querySelectorAll('img'))state(img);}
 document.addEventListener('load',e=>{const img=e.target,s=state(img);if(!s||s.rendered===missing)return;if(img.naturalWidth>0&&(s.verified||img.naturalWidth!==300||img.naturalHeight!==450))ready(img,s);schedule();},true);
 document.addEventListener('error',e=>{const img=e.target,s=state(img);if(!s||s.rendered===missing)return;freeSlot(s);s.ready=false;if(s.awaitingNative){fail(img,s);}else{s.verified=false;s.next=Date.now();}schedule();},true);
 new MutationObserver(records=>{for(const record of records){if(record.type==='attributes')state(record.target);else for(const node of record.addedNodes)discover(node);}schedule();}).observe(document.documentElement,{childList:true,subtree:true,attributes:true,attributeFilter:['src','data-zain-src']});
 for(const img of document.images)state(img);
 setInterval(schedule,1500);schedule();window.addEventListener('scroll',schedule,true);window.addEventListener('resize',schedule);
 window.addEventListener('online',()=>{for(const img of tracked){const s=states.get(img);if(!s.ready&&!s.busy){s.tries=0;s.next=0;if(s.rendered===missing){s.queued=true;s.rendered='';img.removeAttribute('src');}}}schedule();});
 document.addEventListener('visibilitychange',schedule);
})();

