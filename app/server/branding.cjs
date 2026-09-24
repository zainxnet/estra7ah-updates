'use strict';
const rights='جميع الحقوق محفوظة لإنترنت زين',contact='المهندس محمد القيري — 771015253';
const footer='<footer class="zain-brand-footer" dir="rtl" style="text-align:center;padding:16px 12px;margin-top:20px;color:#aeb6c9;font:13px Arial;line-height:1.9"><div>'+rights+'</div><div>المهندس محمد القيري — <a href="tel:771015253" dir="ltr" style="color:inherit;text-decoration:none">771015253</a></div></footer>';
function html(page){
 if(page.includes('class="zain-brand-footer"'))return page;
 const old=/<div style="color: #aaa;text-align: center;margin: 5px;">[^]*?<\/div>/;
 if(old.test(page))return page.replace(old,footer);
 if(/<\/body>/i.test(page))return page.replace(/<\/body>/i,footer+'</body>');
 if(/<\/html>/i.test(page))return page.replace(/<\/html>/i,footer+'</html>');
 return page+footer;
}
function javascript(source){
 // Replace display text and its footer contact link only; keep bundled sources intact.
 if(!source.includes('Proudly made in Yemen'))return source;
 source=source.replace(/"(?:\\.|[^"\\])*"/g,token=>{
  let value;try{value=JSON.parse(token)}catch{return token}
  if(value.includes('Proudly made in Yemen'))return JSON.stringify(rights);
  if(value==='جميع الحقوق محفوظة شركه'||value==='جميع الحقوق محفوظة شركة')return '""';
  return token;
 });
 return source.replace(/target:"_blank",href:"http:\/\/yetech\.co",children:\[" ","YeTech(?: - 736828627 - 770162085)?"\]/g,'href:"tel:771015253",dir:"rtl",children:['+JSON.stringify(contact)+']');
}
const browserScript="(function(){'use strict';var pending=false,fallback;function update(){pending=false;var root=document.getElementById('root');if(!root||!document.body)return;if(!fallback){var holder=document.createElement('div');holder.innerHTML=\"<footer class=\\\"zain-brand-footer\\\" dir=\\\"rtl\\\" style=\\\"text-align:center;padding:16px 12px;margin-top:20px;color:#aeb6c9;font:13px Arial;line-height:1.9\\\"><div>جميع الحقوق محفوظة لإنترنت زين</div><div>المهندس محمد القيري — <a href=\\\"tel:771015253\\\" dir=\\\"ltr\\\" style=\\\"color:inherit;text-decoration:none\\\">771015253</a></div></footer>\";fallback=holder.firstElementChild;fallback.id='zain-fallback-footer';root.parentNode.insertBefore(fallback,root.nextSibling);}var hidden=!!root.querySelector('a[href=\"tel:771015253\"]');if(fallback.hidden!==hidden)fallback.hidden=hidden;}function schedule(){if(!pending){pending=true;requestAnimationFrame(update);}}function start(){update();var root=document.getElementById('root');if(root)new MutationObserver(schedule).observe(root,{childList:true,subtree:true});window.addEventListener('popstate',schedule);}if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start);else start();})();";
module.exports={rights,contact,footer,html,javascript,browserScript};
