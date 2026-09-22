(()=>{'use strict';
 const state=new WeakMap();let busy=false;
 async function refresh(){
  if(busy||document.hidden)return;
  const groups=new Map();
  for(const img of document.images){
   const raw=img.getAttribute('src');if(!raw)continue;
   let url;try{url=new URL(raw,location.href)}catch{continue;}
   if(url.origin!==location.origin)continue;
   const match=/\/(?:api\/+)?itemimage\/([\w.-]+)/i.exec(url.pathname);if(!match)continue;
   const rect=img.getBoundingClientRect();if(rect.bottom< -200||rect.top>innerHeight+300)continue;
   if(!groups.has(match[1]))groups.set(match[1],[]);groups.get(match[1]).push({img,url});
   if(groups.size>=60)break;
  }
  if(!groups.size)return;busy=true;
  try{
   const r=await fetch('/zain/artwork-status?ids='+encodeURIComponent([...groups.keys()].join(',')),{signal:AbortSignal.timeout(2500),cache:'no-store'});
   if(!r.ok)return;
   for(const result of (await r.json()).items||[])for(const {img,url}of groups.get(result.id)||[]){
    if(!result.version||state.get(img)===result.id+':'+result.version)continue;
    state.set(img,result.id+':'+result.version);url.searchParams.set('zainArtwork',result.version);url.searchParams.set('v',Date.now());img.src=url.pathname+url.search;
   }
  }catch{}finally{busy=false;}
 }
 setInterval(refresh,2500);setTimeout(refresh,500);
})();
