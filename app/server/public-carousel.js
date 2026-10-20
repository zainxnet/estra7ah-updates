// Move the original React cards; no duplicate links, posters or click handlers.
(()=>{'use strict';
 const rows=new Map(),speed=24,reduced=matchMedia('(prefers-reduced-motion: reduce)');
 let raf=0,last=0,refreshTimer=0,wakeTimer=0;
 const css=document.createElement('style');
 css.textContent='.slider-kc.zain-carousel{position:relative;touch-action:pan-y}.slider-kc.zain-carousel>.items{left:0!important;width:max-content!important;overflow:visible!important;transition:none!important;flex-wrap:nowrap!important}.slider-kc.zain-carousel>.items>.movie-box{flex-shrink:0;transition:none!important}.slider-kc.zain-carousel>.arrows .right-arrow{display:block!important}.slider-kc.zain-carousel .zain-motion-toggle{position:absolute;bottom:0;left:12px;z-index:101;border:0;border-radius:5px;padding:3px 8px;background:#242332;color:#ddd;font:12px Arial;cursor:pointer}.slider-kc.zain-carousel .zain-motion-toggle:focus-visible{outline:2px solid white}';
 document.head.appendChild(css);
 const mod=(n,d)=>((n%d)+d)%d;
 function visible(s){const r=s.node.getBoundingClientRect();return r.width>0&&r.height>0&&r.bottom>40&&r.top<innerHeight-40&&r.right>0&&r.left<innerWidth;}
 function moving(s){return s.overflow&&s.visible&&!document.hidden&&!reduced.matches&&!s.paused&&!s.hover&&!s.focus&&!s.drag&&performance.now()>=s.hold;}
 function paint(s){
  if(!s.overflow)return;
  const right=s.right,period=s.period;
  for(const card of s.cards){const x=card.left+s.phase,wrapped=mod(x-(right-period),period)+right-period;card.node.style.transform='translate3d('+(wrapped-card.left).toFixed(3)+'px,0,0)';}
 }
 function measure(s){
  const children=Array.from(s.track.children);
  s.cards=children.filter(card=>card.classList.contains('movie-box')).map(node=>({node}));
  s.cards.forEach(card=>card.node.style.transform='');
  const box=s.node.getBoundingClientRect(),track=s.track.getBoundingClientRect();
  s.period=track.width;s.right=box.width-parseFloat(getComputedStyle(s.node).paddingRight||0);
  s.overflow=s.cards.length===children.length&&s.cards.length>1&&track.width>box.width+2;
  s.cards.forEach(card=>card.left=card.node.getBoundingClientRect().left-box.left);
  s.toggle.hidden=!s.overflow;
  s.node.dataset.zainMotion=s.overflow?'paused':'static';
  s.visible=visible(s);if(s.overflow){s.phase=mod(s.phase,s.period);paint(s);}
 }
 function frame(now){
  raf=0;const delta=last?Math.min(50,now-last):0;last=now;let running=false;
  for(const s of rows.values()){
   const run=moving(s);s.node.dataset.zainMotion=run?'running':s.overflow?'paused':'static';
   if(run){running=true;s.phase=mod(s.phase+speed*delta/1000,s.period);paint(s);}
  }
  if(running)raf=requestAnimationFrame(frame);else last=0;
 }
 function wake(){
  clearTimeout(wakeTimer);let next=Infinity;
  for(const s of rows.values())if(s.hold>performance.now())next=Math.min(next,s.hold-performance.now());
  if(Number.isFinite(next))wakeTimer=setTimeout(wake,next+20);
  if(!raf)raf=requestAnimationFrame(frame);
 }
 const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{
  for(const entry of entries){const s=rows.get(entry.target);if(s)s.visible=entry.isIntersecting&&visible(s);}wake();
 },{threshold:[0,.1,.5,1]}):null;
 const resize=typeof ResizeObserver==='function'?new ResizeObserver(entries=>{for(const entry of entries){const s=rows.get(entry.target);if(s)measure(s);}wake();}):null;
 function attach(node,track){
  const toggle=document.createElement('button');toggle.type='button';toggle.className='zain-motion-toggle';toggle.textContent='إيقاف الحركة';toggle.setAttribute('aria-label','إيقاف حركة هذا الصف');toggle.setAttribute('aria-pressed','false');
  const s={node,track,toggle,cards:[],phase:0,hold:0,visible:false,hover:false,focus:false,paused:false,drag:null,suppressClick:0};
  rows.set(node,s);node.classList.add('zain-carousel');node.appendChild(toggle);
  toggle.addEventListener('click',event=>{s.paused=!s.paused;toggle.textContent=s.paused?'تشغيل الحركة':'إيقاف الحركة';toggle.setAttribute('aria-label',s.paused?'تشغيل حركة هذا الصف':'إيقاف حركة هذا الصف');toggle.setAttribute('aria-pressed',String(s.paused));if(event.detail>0)toggle.blur();wake();});
  if(window.PointerEvent){node.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse'){s.hover=true;wake();}});node.addEventListener('pointerleave',event=>{if(event.pointerType==='mouse'){s.hover=false;wake();}});}
  else{node.addEventListener('mouseenter',()=>{s.hover=true;wake();});node.addEventListener('mouseleave',()=>{s.hover=false;wake();});}
  node.addEventListener('focusin',()=>{s.focus=true;wake();});node.addEventListener('focusout',()=>{setTimeout(()=>{s.focus=node.contains(document.activeElement);wake();},0);});
  node.addEventListener('click',event=>{
   if(performance.now()<s.suppressClick){event.preventDefault();event.stopImmediatePropagation();return;}
   const arrow=event.target.closest?.('.left-arrow,.right-arrow');if(!arrow||!s.overflow)return;
   event.preventDefault();event.stopImmediatePropagation();
   s.phase=mod(s.phase+(arrow.classList.contains('left-arrow')?400:-400),s.period);s.hold=performance.now()+4000;paint(s);wake();
  },true);
  if(window.PointerEvent){
   node.addEventListener('pointerdown',event=>{if(event.pointerType==='mouse'||event.target.closest('button,.arrows'))return;s.drag={id:event.pointerId,x:event.clientX,y:event.clientY,start:s.phase,moved:false};wake();});
   node.addEventListener('pointermove',event=>{
    const drag=s.drag;if(!drag||drag.id!==event.pointerId||!s.overflow)return;const dx=event.clientX-drag.x,dy=event.clientY-drag.y;
    if(!drag.moved&&Math.abs(dy)>Math.abs(dx)&&Math.abs(dy)>8){s.drag=null;wake();return;}
    if(!drag.moved&&Math.abs(dx)<8)return;drag.moved=true;node.setPointerCapture(event.pointerId);s.phase=mod(drag.start+dx,s.period);paint(s);
   });
   const end=()=>{if(s.drag?.moved){s.suppressClick=performance.now()+400;s.hold=performance.now()+4000;}s.drag=null;wake();};
   node.addEventListener('pointerup',end);node.addEventListener('pointercancel',end);
  }
  measure(s);observer?.observe(node);resize?.observe(node);
 }
 function refresh(){
  refreshTimer=0;
  for(const [node,s]of rows)if(!node.isConnected||!node.closest('.interface')){observer?.unobserve(node);resize?.unobserve(node);rows.delete(node);}
  if(!location.pathname.startsWith('/admin'))for(const node of document.querySelectorAll('.interface section.items .slider-kc')){
   const track=Array.from(node.children).find(child=>child.classList.contains('items'));
   if(!track||!track.children.length||!Array.from(track.children).every(child=>child.classList.contains('movie-box')))continue;
   if(!window.PointerEvent&&innerWidth<500)continue;
   if(!rows.has(node))attach(node,track);
   else{const s=rows.get(node);if(s.track!==track){s.cards.forEach(card=>card.node.style.transform='');s.track=track;}measure(s);}
  }
  wake();
 }
 function schedule(){if(!refreshTimer)refreshTimer=setTimeout(refresh,80);}
 new MutationObserver(records=>{if(records.some(record=>record.type==='childList'&&!record.target.closest?.('.zain-motion-toggle')))schedule();}).observe(document.body,{childList:true,subtree:true});
 addEventListener('resize',schedule);
 addEventListener('scroll',()=>{for(const s of rows.values())s.visible=visible(s);wake();},{passive:true});
 document.addEventListener('visibilitychange',()=>{last=0;wake();});
 if(reduced.addEventListener)reduced.addEventListener('change',wake);else reduced.addListener(wake);
 refresh();
})();
