'use strict';
// Replace only the recommendation component, preserving the original card renderer.
module.exports=function(source){
 const start=source.search(/156:function\(e,t,[a-z]\)\{/),end=source.indexOf(',157:function',start);
 if(start<0||end<0||!source.slice(start,end).includes('getSimilerItems/'))throw Error('Similar items component changed');
 const replacement=`156:function(e,t,c){"use strict";var React=c(2),jsx=c(0),Cards=c(108).a;
 t.a=function(props){var pair=React.useState({loading:true,items:[]}),state=pair[0],set=pair[1];
 var current=location.pathname.split('/').filter(Boolean).pop()||'';
 React.useEffect(function(){var active=true,controller=new AbortController(),timeout=setTimeout(function(){controller.abort()},8000);set({loading:true,items:[]});
 var fields=[props.tags||'--',props.type,props.sec_id,current].map(function(x){return encodeURIComponent(x||'--')});
 fetch('/api/getSimilerItems/'+fields.join('/'),{signal:controller.signal}).then(function(r){if(!r.ok)throw Error('Unavailable');return r.json()}).then(function(rows){if(active)set({loading:false,items:Array.isArray(rows)?rows:[]})}).catch(function(){if(active)set({loading:false,items:[]})}).finally(function(){clearTimeout(timeout)});
 return function(){active=false;clearTimeout(timeout);controller.abort()};},[String(props.tags),props.type,props.sec_id,current]);
 if(state.loading)return jsx.jsx('div',{'role':'status',className:'zain-similar-loading',children:'جارٍ تحميل الأعمال المشابهة…'});
 if(!state.items.length)return null;
 return jsx.jsx('div',{className:'zain-similar-results',children:jsx.jsx(Cards,{items:state.items,data:{title:props.title},size:props.size,image:'/ItemImage/',type:props.type,centerIcon:props.centerIcon,onItemClick:function(item){if(props.onItemClick)props.onItemClick(item);window.scrollTo({top:0,behavior:'smooth'})}})});
 };}`;
 return source.slice(0,start)+replacement+source.slice(end);
};
