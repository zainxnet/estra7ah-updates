'use strict';

// Keep each search attached to its browser history entry. Two searches must not
// overwrite each other, and saved results never replace the server's next reply.
function installSearchHistory(){
 'use strict';
 if(!window.history)return;
 var history=window.history;
 if(window.zainSearchHistory)return;
 var memory={},active=null,restoring=false,restoreTimer,saveTimer;
 var nativeReplace=history.replaceState.bind(history),nativePush=history.pushState.bind(history);
 var prefix='zain-search-v1:',indexKey=prefix+'entries';
 function isSearch(){return /^\/search\/?$/.test(location.pathname);}
 function query(){try{return new URL(location.href).searchParams.get('q')||'';}catch(e){return '';}}
 function state(){return history.state&&typeof history.state==='object'?history.state:{};}
 function write(record){
  memory[record.id]=record;
  try{
   var ids=JSON.parse(sessionStorage.getItem(indexKey)||'[]').filter(function(id){return id!==record.id;});
   ids.push(record.id);while(ids.length>8)sessionStorage.removeItem(prefix+ids.shift());
   sessionStorage.setItem(indexKey,JSON.stringify(ids));
   sessionStorage.setItem(prefix+record.id,JSON.stringify(record));
  }catch(e){/* Private mode or full storage: retain the in-memory snapshot. */}
 }
 function persist(record){
  if(!record)return;
  write(record);
  var current=state();
  if(isSearch()&&current.zainSearch&&current.zainSearch.id===record.id){
   nativeReplace(Object.assign({},current,{zainSearch:{id:record.id,query:record.query,y:record.y}}),'',location.href);
  }
 }
 function stopRestore(){clearTimeout(restoreTimer);restoring=false;}
 function saveActive(){if(active){if(!restoring)active.y=window.scrollY||0;persist(active);}}
 history.pushState=function(){saveActive();active=null;stopRestore();return nativePush.apply(null,arguments);};
 addEventListener('popstate',function(){clearTimeout(saveTimer);active=null;stopRestore();});
 addEventListener('pagehide',saveActive);
 addEventListener('scroll',function(){
  if(!active||restoring)return;
  active.y=window.scrollY||0;
  clearTimeout(saveTimer);saveTimer=setTimeout(function(){if(active)persist(active);},150);
 },{passive:true});
 // User scrolling takes priority over delayed restoration after a slow render.
 ['wheel','touchstart'].forEach(function(event){addEventListener(event,stopRestore,{passive:true});});
 window.zainSearchHistory={
  read:function(){
   var current=state(),saved=current.zainSearch,id=saved&&saved.id;
   if(!id)id=Date.now().toString(36)+'-'+Math.random().toString(36).slice(2);
   var record=memory[id];
   if(!record)try{record=JSON.parse(sessionStorage.getItem(prefix+id)||'null');}catch(e){}
   var text=query();
   if(!record||record.query!==text)record={id:id,query:text,groups:[],ready:false,y:saved&&saved.query===text?saved.y||0:0};
   if(!Array.isArray(record.groups))record.groups=[];
   memory[id]=record;
   nativeReplace(Object.assign({},current,{zainSearch:{id:id,query:text,y:record.y}}),'',location.href);
   return record;
  },
  activate:function(record){active=record;},
  deactivate:function(record){if(active===record){persist(record);active=null;stopRestore();}},
  change:function(record,text){
   record.query=text;record.groups=[];record.ready=false;record.y=0;stopRestore();
   var url=new URL(location.href);if(text)url.searchParams.set('q',text);else url.searchParams.delete('q');
   nativeReplace(Object.assign({},state(),{zainSearch:{id:record.id,query:text,y:0}}),'',url.pathname+url.search+url.hash);
   persist(record);
  },
  results:function(record,text,groups){if(record.query!==text)return;record.groups=groups;record.ready=true;persist(record);},
  restore:function(record){
   if(active!==record)return;
   clearTimeout(restoreTimer);restoring=true;var attempts=0,target=record.y||0;
   function move(){
    if(active!==record){stopRestore();return;}
    window.scrollTo(0,target);
    if(Math.abs((window.scrollY||0)-target)<2||++attempts>=30){restoring=false;return;}
    restoreTimer=setTimeout(move,60);
   }
   restoreTimer=setTimeout(move,0);
  }
 };
}

// This module replaces only the legacy public search component, retaining the
// original header, input, result cards and section rows from the installed UI.
const component=`451:function(e,t,n){"use strict";n.r(t);var jsx=n(0),React=n(2),Header=n(111),Grid=n(101),Input=n(164),api=n(1),Rows=n(108);
t.default=function(){
 var initial=React.useRef(null);if(!initial.current)initial.current=window.zainSearchHistory.read();
 var snapshot=initial.current,store=window.zainSearchHistory,input=React.useRef(null),generation=React.useRef(0),timer=React.useRef(null),mounted=React.useRef(false);
 var groupsState=React.useState(snapshot.groups),groups=groupsState[0],setGroups=groupsState[1];
 var busyState=React.useState(false),busy=busyState[0],setBusy=busyState[1];
 var errorState=React.useState(''),error=errorState[0],setError=errorState[1];
 function group(items){var map={},keys=[];items.forEach(function(item){var title=item.section&&item.section.name||'نتائج البحث';if(!map[title]){map[title]=[];keys.push(title);}map[title].push(item);});return keys.map(function(title){return {groupName:title,items:map[title]};});}
 function search(text){
  var request=++generation.current;
  if(!text.trim()){setBusy(false);setError('');setGroups([]);store.results(snapshot,text,[]);return;}
  setBusy(true);setError('');
  api.a.fetch(api.a.host+'getItemsSearch/0/100/'+encodeURIComponent(text),{method:'GET'}).then(function(response){if(!response.ok)throw Error('search');return response.json();}).then(function(items){
   if(!mounted.current||request!==generation.current)return;
   var found=group(Array.isArray(items)?items:[]);setGroups(found);setBusy(false);store.results(snapshot,text,found);store.restore(snapshot);
  }).catch(function(){if(mounted.current&&request===generation.current){setBusy(false);setError('تعذر إكمال البحث. حاول مرة أخرى.');}});
 }
 function change(){
  var text=input.current.value;clearTimeout(timer.current);generation.current++;store.change(snapshot,text);setGroups([]);setBusy(Boolean(text.trim()));setError('');
  timer.current=setTimeout(function(){search(text);},250);
 }
 React.useEffect(function(){
  mounted.current=true;store.activate(snapshot);if(input.current)input.current.value=snapshot.query;store.restore(snapshot);
  if(snapshot.query)search(snapshot.query);
  return function(){mounted.current=false;generation.current++;clearTimeout(timer.current);store.deactivate(snapshot);};
 },[]);
 return jsx.jsxs('div',{children:[jsx.jsx(Header.a,{}),jsx.jsxs('div',{className:'search-items-count ',children:[jsx.jsx('div',{className:'bg-all'}),jsx.jsx('div',{className:'search-bar',children:jsx.jsx(Grid.Grid,{fluid:true,children:jsx.jsx(Grid.Row,{children:jsx.jsx(Grid.Col,{xs:12,md:12,children:jsx.jsx(Input.a,{localref:input,defaultValue:snapshot.query,title:'ادخل كلمة للبحث',type:'text',required:false,icon:'search',name:'',onChange:change,style:{width:'90%'}})})})})}),busy&&groups.length===0&&jsx.jsx('div',{style:{padding:20},children:'يتم البحث ...'}),error&&jsx.jsx('div',{role:'alert',style:{padding:20},children:error}),groups.map(function(row){return jsx.jsx(Rows.a,{size:'small',data:{title:row.groupName,icon:'pin'},items:row.items,type:'movie',image:'ItemImage/',centerIcon:'play'},row.groupName);})]}),jsx.jsx('div',{style:{clear:'both'}})]});
}}`;

module.exports={
 browserScript:';('+installSearchHistory.toString()+')();',
 adapt:function(source){
  const start=source.indexOf('451:function(e,t,n){'),end=source.indexOf(',91:function(e,t,n){',start);
  if(start<0||end<0||!source.slice(start,end).includes('getItemsSearch/0/100/'))throw Error('Public search adapter target changed');
  return source.slice(0,start)+component+source.slice(end);
 }
};
