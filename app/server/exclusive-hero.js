(()=>{'use strict';
const el=(tag,text)=>{const e=document.createElement(tag);if(text)e.textContent=text;return e;};
window.zainRenderExclusive=function(host,data){
 const entries=[...(data.exts||[]).map(x=>({title:x.title,url:x.url||'',src:x.imageName?'/ExtImage/'+encodeURIComponent(x.imageName):'/api/ExtVideo/'+encodeURIComponent(x.videoName),video:!x.imageName&&!!x.videoName,description:x.description||x.desc||''})),...(data.items||[]).map(x=>{
  let c={};try{c=JSON.parse(x.content?.contentJSON||'{}')}catch{}
  const list=v=>Array.isArray(v)?v.filter(s=>typeof s==='string'):typeof v==='string'?v.split(',').filter(Boolean):[];
  const rating=Number(c.imdbRating||x.content?.imdb_ratings),series=x.type==='series'||x.type==='tv'||String(x.type).startsWith('series.');
  return {title:x.name,logo:x.exclusiveLogo||null,url:'/itemView/'+x.type+'/'+encodeURIComponent(x.id),src:x.exclusiveImage||'/ItemImage/'+encodeURIComponent(x.id),poster:'/ItemImage/'+encodeURIComponent(x.id),wide:!!x.exclusiveImage?.includes('exclusive-image'),description:c.descArabic||c.descEnglish||'',rating:Number.isFinite(rating)&&rating>0?rating.toFixed(1):'',year:parseInt(c.ReleaseDate)||Number(x.content?.year)||'',runtime:parseInt(c.Runtime)||0,genres:list(c.tagsArabic),cast:list(c.castEnglish).slice(0,4),kind:series?'مسلسل':'فيلم'};
 })].reverse();
 if(!entries.length)return ()=>{};
 const css=el('style');css.id='zain-hide-old-exclusive';css.textContent=`
 .interface .excs,.interface .excs-mobile{display:none!important}
 #zain-exclusive{width:100%;margin:calc(var(--zain-header-height,72px) + 6px) auto 12px;direction:rtl;position:relative;color:#fff;font-family:Arial,sans-serif}
 #zain-exclusive .hero-details *,#zain-exclusive .hero-choice{font-family:Estra7ahBold,Arial,sans-serif!important}
 #zain-exclusive .hero-content{position:static!important;height:100%;box-sizing:border-box;display:flex;align-items:center;padding-bottom:104px}
 #zain-exclusive .hero-logo{display:block;width:auto!important;max-width:100%;height:120px!important;object-fit:contain;object-position:right center;margin-bottom:14px;filter:drop-shadow(0 2px 4px #0008)}
 #zain-exclusive .hero-choice img{display:block;width:100%!important;height:56px!important;object-fit:contain;filter:drop-shadow(0 2px 3px #000);margin:auto}
 #zain-exclusive .hero-meta span{font-size:16px!important}
 #zain-exclusive>h2{font-size:22px;margin:16px 24px}
 #zain-exclusive .hero{position:relative;height:560px;height:clamp(480px,44vw,670px);z-index:0;isolation:isolate;overflow:hidden;background:#11121b;border-radius:14px;margin:0 24px}
 #zain-exclusive .hero-media{position:absolute;top:0;right:0;bottom:0;left:0;inset:0;width:100%;height:100%;object-fit:cover;z-index:-3}
 #zain-exclusive .hero-media.portrait{width:43%;right:auto;left:0;inset:0 auto 0 0;object-fit:contain;background:#11121b}
 #zain-exclusive .hero-shade{position:absolute;top:0;right:0;bottom:0;left:0;inset:0;background:linear-gradient(270deg,rgba(12,12,25,.94),rgba(12,12,25,.69) 35%,rgba(12,12,25,.06) 80%),linear-gradient(0deg,rgba(12,12,25,.98),transparent 50%);z-index:-1}
 #zain-exclusive .hero-details{position:relative;width:52%;max-width:680px;padding:24px 5% 24px 20px;box-sizing:border-box;text-align:right}
 #zain-exclusive .hero-title{font-size:40px;font-size:clamp(28px,3.2vw,48px);font-weight:800;line-height:1.25;margin:0 0 18px;color:#fff;overflow-wrap:anywhere;display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
 #zain-exclusive .hero-meta{display:flex;flex-wrap:wrap;align-items:center;gap:10px;font-size:15px;line-height:1.6;color:#e1e1e7;margin-bottom:16px}
 #zain-exclusive .hero-rating{background:#f8c52b;color:#161616;padding:3px 8px;border-radius:5px;font-weight:bold;white-space:nowrap;direction:ltr;unicode-bidi:isolate}
 #zain-exclusive .hero-story{font-size:19px!important;line-height:1.85;margin:12px 0;color:#f0f0f4;display:-webkit-box;-webkit-line-clamp:3;-webkit-box-orient:vertical;overflow:hidden}
 #zain-exclusive .hero-cast{font-size:16px!important;line-height:1.8;margin:14px 0;color:#ddd}
 #zain-exclusive .hero-open{display:inline-flex;align-items:center;gap:12px;background:#ff3c39;color:#fff;padding:12px 25px;border-radius:28px;font-size:18px!important;font-weight:bold;text-decoration:none;margin-top:8px}
 #zain-exclusive .hero-nav{position:absolute;bottom:12px;left:52px;right:52px;display:flex;gap:10px;overflow-x:hidden;align-items:stretch;margin:0;padding:8px 0;scrollbar-width:none;text-align:center}
 #zain-exclusive .hero-nav::-webkit-scrollbar{display:none;width:0;height:0}
 #zain-exclusive .hero-choice{flex:0 0 145px;min-height:62px;max-width:180px;border:0;border-bottom:3px solid transparent;border-radius:0;background:transparent;color:#bbb;font-size:17px;font-weight:bold;line-height:1.5;padding:10px 8px;margin:0;cursor:pointer;white-space:normal}
 #zain-exclusive .hero-choice[aria-pressed=true]{color:#fff;border-bottom-color:#ff3c39;background:#ffffff0b}
 #zain-exclusive .hero-choice:focus-visible,#zain-exclusive .hero-open:focus-visible{outline:2px solid #fff;outline-offset:-2px}
 #zain-exclusive .hero-arrow{position:absolute;bottom:30px;border:0;background:#ffffff19;color:#fff;border-radius:50%;width:34px;height:34px;font-size:24px;padding:0;margin:0;cursor:pointer}
 #zain-exclusive .hero-arrow.previous{right:10px}#zain-exclusive .hero-arrow.next{left:10px}
 @media(max-width:650px){#zain-exclusive .hero-content{align-items:flex-start;padding-bottom:100px}#zain-exclusive .hero-logo{height:85px!important}#zain-exclusive .hero-story{font-size:16px!important}#zain-exclusive .hero-cast{font-size:13px!important}#zain-exclusive .hero-meta span{font-size:14px!important}#zain-exclusive .hero-open{font-size:16px!important}#zain-exclusive .hero{height:620px;margin:0 10px}#zain-exclusive .hero-details{width:100%;padding:155px 22px 20px}#zain-exclusive .hero-media{height:310px;object-position:center top}#zain-exclusive .hero-media.portrait{width:100%;height:290px}#zain-exclusive .hero-shade{background:linear-gradient(0deg,#0c0c19 15%,rgba(12,12,25,.85) 60%,rgba(12,12,25,.08))}#zain-exclusive .hero-title{font-size:29px;margin-bottom:12px}#zain-exclusive .hero-story{font-size:15px;-webkit-line-clamp:2}#zain-exclusive .hero-meta{font-size:13px;gap:7px;margin-bottom:8px}#zain-exclusive .hero-cast{font-size:12px;margin:8px 0}#zain-exclusive .hero-choice{font-size:15px;flex-basis:125px}#zain-exclusive .hero-open{font-size:14px;padding:10px 20px}}
 `;document.head.append(css);
 const box=el('section');box.id='zain-exclusive';box.setAttribute('aria-label','الحصريات');
 const hero=el('div');hero.className='hero';const content=el('div'),nav=el('nav');content.className='hero-content';nav.className='hero-nav';nav.setAttribute('aria-label','اختيار الفيلم أو المسلسل');hero.append(content,nav);box.append(hero);
 host.prepend(box);const placement=new MutationObserver(()=>{if(!stopped&&box.parentNode===host&&host.firstElementChild!==box)host.prepend(box)});placement.observe(host,{childList:true});
 let at=0,timer,stopped=false;
 function resetTimer(){clearInterval(timer);if(entries.length<2)return;timer=setInterval(()=>{if(document.hidden||hero.matches(':hover'))return;const rect=hero.getBoundingClientRect();if(rect.bottom<=0||rect.top>=innerHeight||rect.right<=0||rect.left>=innerWidth)return;select((at+1)%entries.length,false)},3000);}
 const buttons=entries.map((item,i)=>{const label=item.title&&item.title!=='لايوجد عنوان'?item.title:'حصرية '+(i+1),b=el('button',label);b.type='button';b.className='hero-choice';b.setAttribute('aria-label',label);b.title=label;if(item.logo){const logo=el('img');logo.alt=label;logo.src=item.logo;logo.onerror=()=>b.replaceChildren(document.createTextNode(label));b.replaceChildren(logo);}b.onclick=()=>select(i,true);nav.append(b);return b;});
 for(const [cls,label,delta,symbol]of [['previous','الحصرية السابقة',-1,'‹'],['next','الحصرية التالية',1,'›']]){const b=el('button',symbol);b.type='button';b.className='hero-arrow '+cls;b.setAttribute('aria-label',label);b.onclick=()=>select((at+delta+entries.length)%entries.length,true);hero.append(b);}
 function select(index,manual){if(stopped)return;at=index;const item=entries[at];content.replaceChildren();
  const media=el(item.video?'video':'img');media.className='hero-media';media.src=item.src;
  if(item.video){media.autoplay=true;media.muted=true;media.loop=true;media.playsInline=true;}
  else{media.alt=item.title||'';if(item.poster&&!item.wide)media.classList.add('portrait');media.onload=()=>{media.classList.toggle('portrait',media.naturalWidth/media.naturalHeight<1.5)};media.onerror=()=>{if(item.poster&&media.getAttribute('src')!==item.poster){media.src=item.poster;media.classList.add('portrait')}};}
  const shade=el('div');shade.className='hero-shade';const details=el('div');details.className='hero-details';const title=el('h3',item.title&&item.title!=='لايوجد عنوان'?item.title:'حصريًا على استراحة زين');title.className='hero-title';details.append(title);
  if(item.logo){const logo=el('img');logo.className='hero-logo';logo.alt=item.title;logo.src=item.logo;logo.onload=()=>{title.hidden=true;title.style.display='none';};logo.onerror=()=>{logo.remove();title.hidden=false;title.style.removeProperty('display')};details.prepend(logo);}
  const meta=el('div');meta.className='hero-meta';for(const text of [item.kind,item.year,...(item.genres||[]).slice(0,3),item.runtime?item.runtime+' دقيقة':''])if(text)meta.append(el('span',String(text)));if(item.rating){const rating=el('span','★ '+item.rating+' / 10');rating.className='hero-rating';meta.append(rating)}details.append(meta);
  const story=el('p',item.description||'لم تُضف قصة هذا العمل بعد.');story.className='hero-story';details.append(story);
  if(item.cast?.length){const cast=el('p',item.cast.join(' • '));cast.className='hero-cast';details.append(cast)}
  if(item.url){const link=el('a','▷ مشاهدة التفاصيل');link.className='hero-open';link.href=item.url;details.append(link)}content.append(media,shade,details);
  buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===at)));const selected=buttons[at].getBoundingClientRect(),bounds=nav.getBoundingClientRect();if(selected.left<bounds.left||selected.right>bounds.right)nav.scrollBy({left:selected.left+selected.width/2-bounds.left-bounds.width/2,behavior:'smooth'});if(manual)resetTimer();
 }
 select(0,false);resetTimer();return ()=>{stopped=true;placement.disconnect();clearInterval(timer);box.remove();css.remove();};
};
})();
