(()=>{'use strict';
const style=document.createElement('style');style.textContent=`#zain-exclusive{width:95%;margin:30px auto;direction:rtl}#zain-exclusive .page{display:flex;gap:12px;justify-content:center;height:340px}#zain-exclusive .page>a,#zain-exclusive .page>div{display:block;height:100%;flex:none;overflow:hidden;border-radius:12px;position:relative}#zain-exclusive img,#zain-exclusive video{width:100%;height:100%;object-fit:contain}#zain-exclusive .caption{position:absolute;bottom:0;right:0;left:0;background:#000b;padding:10px;color:white;text-align:center}#zain-exclusive nav{text-align:center;margin:10px}#zain-exclusive button{border:0;border-radius:20px;margin:4px;padding:6px 14px;cursor:pointer}#zain-exclusive-manager{background:#202a40;padding:20px;margin:20px 0;border-radius:12px}#zain-exclusive-manager button{margin:5px;padding:7px 14px;cursor:pointer}#zain-exclusive-manager input{padding:10px;min-width:220px}@media(max-width:600px){#zain-exclusive .page{height:220px}}`;document.head.appendChild(style);
const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e};
async function api(action,method='GET'){const r=await fetch('/admin/api/'+action,{method,credentials:'same-origin'}),v=await r.json();if(!r.ok||v.msg==='error')throw Error(v.error||'تعذر الحفظ');return v;}
let current='',cleanup=()=>{};
async function setup(){if(location.pathname===current)return;current=location.pathname;cleanup();cleanup=()=>{};if(current==='/admin/exces'){const host=document.querySelector('.excs-cont');if(!host){current='';return;}const box=el('section');box.id='zain-exclusive-manager';box.append(el('h3','تثبيت فيلم أو مسلسل في الحصريات'));const input=el('input');input.placeholder='ابحث باسم الفيلم أو المسلسل';const search=el('button','بحث'),results=el('div'),saved=el('div'),notice=el('p');box.append(input,search,notice,results,saved);host.prepend(box);cleanup=()=>box.remove();async function pinned(){if(!window.zainExclusiveCards)throw Error('تعذر تحميل محرر الحصريات');await window.zainExclusiveCards(saved,notice)}search.onclick=async()=>{try{const q=input.value.trim();if(!q)return;const data=await api('getItems/all/all/all/0/'+encodeURIComponent(q));results.replaceChildren();for(const item of data.items.filter(x=>['movie','film','series'].includes(x.type))){const row=el('div',item.name),b=el('button','تثبيت في الحصريات');b.onclick=async()=>{try{await api('addExclusiveItem/'+encodeURIComponent(item.id),'POST');notice.textContent='تم التثبيت في الحصريات';await pinned();}catch(e){notice.textContent=e.message}};row.append(b);results.append(row)}if(!results.children.length)results.textContent='لا توجد نتائج';}catch(e){notice.textContent=e.message}};input.onkeydown=e=>{if(e.key==='Enter')search.click()};let retryTimer,attempts=0;async function loadPinned(){try{await pinned();notice.textContent=''}catch(e){notice.textContent=e.message;if(++attempts<4)retryTimer=setTimeout(loadPinned,attempts*1500);else{const retry=el('button','إعادة تحميل الحصريات');retry.onclick=()=>{attempts=0;loadPinned()};notice.append(retry)}}}loadPinned();cleanup=()=>{clearTimeout(retryTimer);box.remove()};return;}
if(current!=='/')return;let stopped=false,dispose=()=>{};cleanup=()=>{stopped=true;dispose();};const response=await fetch('/zain/exclusives',{signal:AbortSignal.timeout(8000)});if(!response.ok){current='';return;}const data=await response.json();if(stopped)return;const host=document.querySelector('.interface');if(!host||!window.zainRenderExclusive){current='';return;}dispose=window.zainRenderExclusive(host,data);
}
new MutationObserver(()=>{setup().catch(()=>{current='';});}).observe(document.body,{childList:true,subtree:true});setup().catch(()=>{current='';});setInterval(()=>setup().catch(()=>{current='';}),5000);
})();

// The original content cards are rendered by React; attach an independent action.
(()=>{'use strict';
 const css=document.createElement('style');css.textContent=`.zain-exclusive-add{position:absolute!important;left:5px!important;right:5px!important;bottom:25px!important;z-index:3;border:1px solid #c39843!important;border-radius:7px!important;background:#46320eed!important;color:#fff!important;font:12px Arial!important;line-height:1.5!important;padding:4px!important;cursor:pointer;width:calc(100% - 10px)!important}.zain-exclusive-add:disabled{background:#284b35ed!important;cursor:default}#zain-exclusive-notice{position:fixed;top:18px;left:18px;max-width:min(440px,90vw);z-index:2147483646;direction:rtl;background:#243e31;color:#fff;border:1px solid #60b978;border-radius:10px;padding:14px;font:16px Arial;box-shadow:0 4px 16px #0008}`;document.head.append(css);
 const pinned=new Set(),busy=new Set();let loaded=false,pendingLoad=false,scheduled=false,noticeTimer;
 async function api(action,method='GET'){const r=await fetch('/admin/api/'+action,{method,credentials:'same-origin'});const v=await r.json();if(!r.ok||v.msg==='error')throw Error(v.error||'تعذرت الإضافة إلى الحصريات');return v;}
 function notice(text){let box=document.getElementById('zain-exclusive-notice');if(!box){box=document.createElement('div');box.id='zain-exclusive-notice';box.setAttribute('role','status');document.body.append(box)}box.textContent=text;clearTimeout(noticeTimer);noticeTimer=setTimeout(()=>box.remove(),9000);}
 function paint(b,id){const text=busy.has(id)?'جارٍ البحث عن صورة…':pinned.has(id)?'− إلغاء الحصرية':'＋ إضافة إلى الحصريات';if(b.textContent!==text)b.textContent=text;b.disabled=busy.has(id);b.title=text;b.setAttribute('aria-label',text);}
 function scan(){scheduled=false;if(location.pathname!=='/admin/items'){loaded=false;return;}
  if(!loaded&&!pendingLoad){pendingLoad=true;api('getExclusiveItems').then(v=>{pinned.clear();for(const x of v.items||[])pinned.add(x.id);loaded=true;}).catch(()=>{loaded=true;}).finally(()=>{pendingLoad=false;schedule();});}
  for(const card of document.querySelectorAll('.items .item')){
   const img=card.querySelector('img'),match=img?.getAttribute('src')?.match(/ItemImage\/([^/?#]+)/i),type=img?.getAttribute('type');
   if(!match||type&&!['movie','film','series'].includes(type))continue;
   const id=decodeURIComponent(match[1]);let b=card.querySelector('.zain-exclusive-add');
   if(b&&b.dataset.itemId!==id){b.remove();b=null;}
   if(!b){b=document.createElement('button');b.type='button';b.className='zain-exclusive-add';b.dataset.itemId=id;
    if(getComputedStyle(card).position==='static')card.style.position='relative';
    b.onclick=async e=>{e.preventDefault();e.stopPropagation();if(busy.has(id))return;busy.add(id);paint(b,id);notice('جارٍ البحث عن صورة عريضة وإضافة العنصر إلى الحصريات…');
     try{if(pinned.has(id)){await api('removeExclusiveItem/'+encodeURIComponent(id),'POST');pinned.delete(id);notice('تم إلغاء الحصرية');return;}const result=await api('addExclusiveItem/'+encodeURIComponent(id),'POST');pinned.add(id);notice(result.imageKind==='backdrop'?'تمت الإضافة إلى الحصريات بصورة عريضة':'تمت الإضافة إلى الحصريات بصورة العنصر الحالية');}
     catch(error){notice(error.message);}finally{busy.delete(id);paint(b,id);schedule();}};
    card.append(b);
   }paint(b,id);
  }
 }
 function schedule(){if(!scheduled){scheduled=true;requestAnimationFrame(scan);}}
 new MutationObserver(schedule).observe(document.body,{childList:true,subtree:true});addEventListener('popstate',schedule);schedule();
})();
