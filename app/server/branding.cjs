'use strict';
const pride='صنع بفخر في اليمن Proudly made in Yemen 🇾🇪';
const rights='جميع الحقوق محفوظة شركه',contact='ZAIN.NET - 771015253';
const link='<a target="_blank" href="http://yetech.co/"> '+contact+'</a>';
// Reuse the original public footer's typography and spacing for pages without one.
const lineStyle='font-family:Estra7ahLight;font-size:13px;margin-top:3px';
const lines='<div style="'+lineStyle+'">'+pride+'</div><div style="'+lineStyle+'">'+rights+' <span>'+link+'</span></div>';
const footer='<div class="footer-rights zain-footer-original" style="text-align:center;padding-bottom:30px;color:hsla(0,0%,100%,.4392156862745098)">'+lines+'</div>';
function html(page){
 // Preserve the broadcast footer's original containers, styles and version label.
 const old=/(<div\b[^>]*style="[^"\n]*color:\s*#aaa[^"\n]*"[^>]*>)([^]*?)(<\/div>)/g;
 let found=false;
 page=page.replace(old,(whole,open,body,close)=>{
  if(!/yetech\.co/i.test(body))return whole;
  found=true;
  body=body.replace(/<a\b[^>]*href=["']http:[^"']*yetech\.co\/?["'][^>]*>\s*YeTech\s*<\/a>/i,link);
  body=body.replace(/[^]*?جميع الحقوق محفوظة\s*/,pride+'<br>'+rights+' ');
  return open+body+close;
 });
 if(found||page.includes('zain-footer-original'))return page;
 if(/<\/body>/i.test(page))return page.replace(/<\/body>/i,footer+'</body>');
 if(/<\/html>/i.test(page))return page.replace(/<\/html>/i,footer+'</html>');
 return page+footer;
}
function javascript(source){
 // Change only the original footer link text; keep its JSX, text, styles and behavior.
 return source.replace(/(target:"_blank",href:")http:\/\/yetech\.co\/?("\s*,children:\[" ",")(?:YeTech(?: - 736828627 - 770162085)?)("\])/g,
  '$1http://yetech.co/$2'+contact+'$3');
}
const browserScript="(function(){'use strict';var pending=false,fallback;function update(){pending=false;var root=document.getElementById('root');if(!root||!document.body)return;if(!fallback){var holder=document.createElement('div');holder.innerHTML="+JSON.stringify(footer)+";fallback=holder.firstElementChild;fallback.id='zain-fallback-footer';root.parentNode.insertBefore(fallback,root.nextSibling);}var links=root.querySelectorAll('a[href=\"http://yetech.co/\"]'),hidden=false;for(var i=0;i<links.length;i++){if(links[i].textContent.indexOf('ZAIN.NET')!==-1){hidden=true;break;}}if(fallback.hidden!==hidden)fallback.hidden=hidden;}function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}function start(){update();var root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});window.addEventListener('popstate',schedule);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();})();";
module.exports={pride,rights,contact,footer,html,javascript,browserScript};
