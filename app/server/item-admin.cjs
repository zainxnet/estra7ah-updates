'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function({dir,items,sharedCatalog,topRows,safeItem,updateItems,removeItem,resolveId=id=>id,prepareExclusive=async()=>({imageKind:'poster'}),catalogStore,onCatalogChange=()=>{}}){
 const scanReconcileVersion=1;let batching=false,batchDirty=false;
 const file=path.join(dir,'item-edits.json'),legacy=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{edits:{},deleted:[],pinned:[]};let state=catalogStore?.readState('item-edits')||legacy;if(catalogStore&&!catalogStore.readState('item-edits'))catalogStore.writeState('item-edits',state);
 if(!state.edits||!Array.isArray(state.deleted)||!Array.isArray(state.pinned))throw Error('Invalid item edits store');

 const pinsFile=path.join(dir,'item-pins.json');
 const savedPins=catalogStore?.readState('item-pins')||(fs.existsSync(pinsFile)?JSON.parse(fs.readFileSync(pinsFile,'utf8')):null);
 if(savedPins&&Array.isArray(savedPins.pinned))state.pinned=savedPins.pinned;
 function savePins(pinned){const value={pinned};if(catalogStore)catalogStore.writeState('item-pins',value);else{fs.writeFileSync(pinsFile+'.tmp',JSON.stringify(value));fs.renameSync(pinsFile+'.tmp',pinsFile);}state={...state,pinned};}
 let appliedEdits,appliedShared,manualSource,scanSource,manualDeleted=new Set(),scanDeleted=new Set();
 function apply(ids){
  if(manualSource!==state.deleted){manualSource=state.deleted;manualDeleted=new Set(state.deleted);}
  if(scanSource!==state.scanDeleted){scanSource=state.scanDeleted;scanDeleted=new Set(state.scanDeleted||[]);}
  const scoped=ids===undefined?null:new Set(ids);
  const editIds=scoped||Object.keys(state.edits),scanIds=scoped||Object.keys(state.scanFiles||{});
  for(const id of editIds){const edit=state.edits[id];if(!edit)continue;const item=items.get(id);if(item)updateItems([{...item,...edit}]);}
  for(const id of scanIds){const selection=state.scanFiles?.[id];if(!selection)continue;const item=items.get(id);if(!item)continue;const allowed=new Set(selection.ids),files=(item.files||[]).filter(file=>allowed.has(file.id));if(files.length!==(item.files||[]).length||item.pathSize!==selection.pathSize)updateItems([{...item,files,pathSize:selection.pathSize}]);}
  // Scanner aliases can change even when the manual deletion list does not.
  for(const id of manualDeleted){const alias=resolveId(id);if(!scoped||scoped.has(id)||scoped.has(alias)){removeItem(id);if(alias!==id)removeItem(alias);}}
  for(const id of scoped||scanDeleted)if(scanDeleted.has(id))removeItem(id);
  if(appliedEdits!==state.edits||appliedShared!==state.sharedContent){sharedCatalog?.load(state.sharedContent||{},state.edits);appliedEdits=state.edits;appliedShared=state.sharedContent;}
 }
 function observe(ids){const present=new Set(ids),deleted=state.scanDeleted||[];if(!deleted.some(id=>present.has(id)))return;const scanFiles=batching?state.scanFiles:{...state.scanFiles};for(const id of deleted)if(present.has(id))delete scanFiles[id];save({...state,scanDeleted:deleted.filter(id=>!present.has(id)),scanFiles},{ids});}
 function reconcileScan(scope,removed,active){const gone=new Set(state.scanDeleted||[]),scanFiles=batching?state.scanFiles:{...state.scanFiles};for(const id of removed){gone.add(id);delete scanFiles[id];}for(const row of active){gone.delete(row.id);scanFiles[row.id]={ids:row.files.map(file=>file.id),pathSize:row.pathSize};}const key=require('./movie-scan-state.cjs').key(scope);save({...state,scanDeleted:[...gone],scanFiles,scanApplied:{...state.scanApplied,[key]:scope.stamp},scanAppliedVersion:{...state.scanAppliedVersion,[key]:scanReconcileVersion}},{ids:[...removed,...active.map(row=>row.id)]});}
 let lastMetadataBackup=0;
 function save(next,{metadataId,ids}={}){if(batching){state=next;batchDirty=true;apply(ids);return;}const metadataSave=metadataId!==undefined,now=Date.now(),keepHistory=!lastMetadataBackup||now-lastMetadataBackup>=60000;if(catalogStore)catalogStore.writeState('item-edits',next,keepHistory);else{if(fs.existsSync(file)&&keepHistory){const folder=path.join(dir,'backups');fs.mkdirSync(folder,{recursive:true});fs.copyFileSync(file,path.join(folder,'item-edits-'+now+'-'+crypto.randomUUID()+'.json'));}const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(next));fs.renameSync(temporary,file);}if(keepHistory)lastMetadataBackup=now;state=next;if(metadataSave){if(sharedCatalog)sharedCatalog.set(metadataId,state.sharedContent[sharedCatalog.key(metadataId)]);else{const item=items.get(metadataId);if(item)updateItems([{...item,...state.edits[metadataId]}]);}}else apply(ids);onCatalogChange();}
 // Startup reconciliation may cover many roots; persist one backed-up change.

 function batchChanges(callback){
  if(batching)throw Error('Nested catalog reconciliation');
  const previous=state;batching=true;batchDirty=false;
  // Copy the large scan selection map once, not for every root.
  state={...state,scanFiles:{...state.scanFiles}};
  const fail=error=>{state=previous;batching=false;batchDirty=false;throw error;};
  const finish=()=>{batching=false;if(batchDirty){const next=state;state=previous;batchDirty=false;save(next,{ids:[]});}else state=previous;};
  let result;try{result=callback();}catch(error){return fail(error);}
  if(result&&typeof result.then==='function')return Promise.resolve(result).then(finish,fail);
  return finish();
 }

 apply();
 state.exclusive=state.exclusive||[];
 const adminReads=new Set(['getItems','getPinedItems','getExclusiveItems','getItemSyncState']);const adminActions=new Set(['pinItem','delPinedItem','removeAllPinned','deleteItem','updateContent','addExclusiveItem','removeExclusiveItem','updateExclusiveItem']);
 function exclusiveItems(){return state.exclusive.map(id=>{const item=items.get(id);if(!item)return null;const edit=state.exclusiveEdits?.[id]||{};let content={};try{content=JSON.parse(item.content?.contentJSON||'{}')}catch{}return {...safeItem(item),...(edit.name?{name:edit.name}:{}),content:{...item.content,contentJSON:JSON.stringify({...content,...edit.content})},...(edit.image?{exclusiveImage:'/zain/exclusive-custom-image?id='+encodeURIComponent(id)+'&v='+edit.version}:{})};}).filter(Boolean);}
 return {exclusiveItems,exclusiveFile:id=>{const name=state.exclusiveEdits?.[id]?.image;return state.exclusive.includes(id)&&items.has(id)&&/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(name||'')?path.join(dir,'promotional-media',name):null;},readBody:(req,action)=>action==='updateExclusiveItem'?require('./multipart.cjs')(req,{limit:9*1024*1024}):require('./text-body.cjs')(req),saveContent:(id,content)=>{if(!items.has(id))return;const next=sharedCatalog?{...state,sharedContent:{...state.sharedContent,[sharedCatalog.key(id)]:content}}:{...state,edits:{...state.edits,[id]:{...state.edits[id],content}}};save(next,{metadataId:id});},pinnedItems:()=>{const rows=[...state.pinned].reverse().map(id=>items.get(id)).filter(Boolean);return (sharedCatalog?sharedCatalog.unique(rows):rows).map(safeItem)},adminReads,adminActions,async admin(action,args,body,method){
  const result=(body,status=200)=>({body,status}),error=(message,status=400)=>result({msg:'error',error:message},status);
  if(adminReads.has(action)&&method!=='GET')return error('طريقة الطلب غير صالحة',405);
  if(action==='getExclusiveItems')return result({items:exclusiveItems()});
  if(action==='getPinedItems')return result({res:[...new Set(state.pinned.flatMap(id=>sharedCatalog?.related(id)||[id]))].filter(id=>items.has(id)).map(itemId=>({itemId}))});
  if(action==='getItemSyncState'){
   const ids=[...new Set(String(args[0]||'').split(',').filter(Boolean))];if(ids.length>200||ids.some(id=>id.length>200))return error('عدد العناصر المطلوب كبير');
   return result({items:ids.map(id=>items.get(id)).filter(Boolean).map(item=>sharedCatalog?.view(item)||item).map(item=>({id:item.id,hasContent:require('./metadata.cjs').hasContent(item),...(args[1]==='content'?{content:item.content}: {})}))});
  }
  if(action==='getItems'){
   const [section,filter,type,offset,...queryParts]=args,q=queryParts.join('/').toLowerCase();
   if(items.queryTop&&!sharedCatalog&&filter!=='pined'&&filter!=='no-content'){const normalized=q.replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ؤئ]/g,'ء').replace(/ى/g,'ي'),filters={section:section&&section!=='all'?section:undefined,types:type&&type!=='all'?[type]:undefined,keys:q&&!['null','undefined'].includes(q)?[normalized]:undefined,missing:filter==='no-content'};return result({total:[{count:items.countTop(filters)}],items:items.queryTop({...filters,offset:Math.max(0,parseInt(offset)||0),limit:100,newest:true}).map(safeItem)});}
   let rows=filter==='pined'
    ? [...new Set(state.pinned.flatMap(id=>sharedCatalog?.related(id)||[id]))].map(id=>items.get(id)).filter(item=>item&&(!item.inItem||item.inItem==='null')&&require('./catalog-items.cjs').visible(item))
    : (topRows?topRows():[...items.values()].filter(item=>(!item.inItem||item.inItem==='null')&&require('./catalog-items.cjs').visible(item)));
   if(section&&section!=='all')rows=rows.filter(item=>item.sectionId===section);
   if(type&&type!=='all')rows=rows.filter(item=>item.type===type);
   if(filter==='pined')rows=rows.filter(item=>(sharedCatalog?.related(item.id)||[item.id]).some(id=>state.pinned.includes(id)));
   if(filter==='no-content')rows=require('./metadata.cjs').newestFirst(rows.filter(item=>require('./metadata.cjs').supportsMetadata(item)&&!(sharedCatalog?sharedCatalog.hasContent(item):require('./metadata.cjs').hasContent(item))));
   if(q&&!['null','undefined'].includes(q))rows=rows.filter(item=>String(item.name).toLowerCase().includes(q));
   if(filter!=='no-content')rows=require('./metadata.cjs').newestFirst(rows);if(sharedCatalog)rows=sharedCatalog.unique(rows);const at=Math.max(0,parseInt(offset)||0);return result({total:[{count:rows.length}],items:rows.slice(at,at+100).map(safeItem)});
  }
  if(action==='removeAllPinned'){if(method!=='POST')return error('طريقة الطلب غير صالحة',405);savePins([]);return result({msg:'ok'});}
  if(!adminActions.has(action))return null;const id=args[0],item=items.get(id);if(!item)return error('العنصر غير موجود',404);
  if(action==='updateExclusiveItem'){
   if(method!=='POST')return error('طريقة الطلب غير صالحة',405);
   if(!state.exclusive.includes(id))return error('العنصر غير مثبت في الحصريات',404);
   const fields=body.fields||{},files=body.files||{};
   if(!fields.name?.trim()||fields.name.length>300||String(fields.descArabic||'').length>20000)return error('اسم الحصرية أو الوصف غير صالح');
   if(!Number.isFinite(Number(fields.imdbRating||0))||Number(fields.imdbRating)<0||Number(fields.imdbRating)>10)return error('التقييم بين 0 و10');
   if(Object.keys(files).some(k=>k!=='image'))return error('ملف غير متوقع');
   const edit={...(state.exclusiveEdits?.[id]||{}),name:fields.name.trim(),content:{descArabic:fields.descArabic||'',imdbRating:fields.imdbRating||'',ReleaseDate:fields.ReleaseDate||'',tagsArabic:String(fields.tagsArabic||'').split(',').map(x=>x.trim()).filter(Boolean)},version:Date.now()};
   if(fields.resetImage==='yes')delete edit.image;
   const upload=files.image;if(upload){const b=upload.bytes;if(b.length>8*1024*1024)return error('حجم الصورة الأقصى 8 ميغابايت');let ext;
    if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')ext='webp';else if(/^GIF8[79]a/.test(b.toString('ascii',0,6)))ext='gif';if(!ext)return error('اختر صورة PNG أو JPG أو WebP أو GIF');
    const media=path.join(dir,'promotional-media');fs.mkdirSync(media,{recursive:true});edit.image=crypto.randomUUID()+'.'+ext;fs.writeFileSync(path.join(media,edit.image),b,{flag:'wx'});
   }
   const next=structuredClone(state);next.exclusiveEdits={...next.exclusiveEdits,[id]:edit};save(next);return result({msg:'ok'});
  }
  let exclusiveResult;
  if(action==='addExclusiveItem'){
   if(!['movie','film','series'].includes(item.type))return error('اختر فيلماً أو مسلسلاً');
   exclusiveResult=await prepareExclusive(item);
   if(!items.has(id))return error('العنصر لم يعد موجوداً',404);
  }
  if(action==='pinItem'||action==='delPinedItem'){
   const related=new Set(sharedCatalog?.related(id)||[id]);let pinned=state.pinned;
   if(action==='pinItem'){if(!pinned.some(value=>related.has(value)))pinned=[...pinned,id];}
   else pinned=pinned.filter(value=>!related.has(value));
   if(pinned!==state.pinned)savePins(pinned);
   return result({msg:'ok'});
  }
  const next=structuredClone(state);
  if(action==='addExclusiveItem'){if(!['movie','film','series'].includes(item.type))return error('اختر فيلماً أو مسلسلاً');if(!next.exclusive.includes(id))next.exclusive.push(id);}
  if(action==='removeExclusiveItem')next.exclusive=next.exclusive.filter(x=>x!==id);
  if(action==='pinItem'){const related=sharedCatalog?.related(id)||[id];if(!related.some(value=>next.pinned.includes(value)))next.pinned.push(id);}
  if(action==='delPinedItem'){const related=new Set(sharedCatalog?.related(id)||[id]);next.pinned=next.pinned.filter(value=>!related.has(value));}
  if(action==='deleteItem'){
   const ids=new Set(sharedCatalog?.related(id)||[id]);let changed=true;while(changed){changed=false;for(const row of items.values())if(ids.has(row.inItem)&&!ids.has(row.id)){ids.add(row.id);changed=true;}}
   next.deleted=[...new Set([...next.deleted,...ids])];next.pinned=next.pinned.filter(value=>!ids.has(value));
  }
  if(action==='updateContent'){
   if(method!=='POST')return error('طريقة الطلب غير صالحة',405);
   const editing=sharedCatalog?.view(item)||item;let data={};try{data=JSON.parse(editing.content?.contentJSON||'{}')}catch{}
   if(!data||typeof data!=='object'||Array.isArray(data))data={};
   const allowed=new Set(['name','Runtime','content_id','ReleaseDate','castEnglish','descArabic','descEnglish','directedByEnglish','imdbRating','imdbVotes','tagsArabic']);
   for(const [key,raw]of Object.entries(body)){let value=raw;if(Array.isArray(value)&&['castEnglish','directedByEnglish','tagsArabic'].includes(key))value=value.join(',');if(typeof value==='number')value=String(value);if(value===null)value='';if(!allowed.has(key)||typeof value!=='string'||value.length>20000)return error('حقل بيانات غير صالح');if(key==='name'){if(!value.trim()||value.length>300)return error('اسم العنصر مطلوب');continue;}data[key]=['castEnglish','directedByEnglish','tagsArabic'].includes(key)?(value.trim().startsWith('[')?(()=>{try{const a=JSON.parse(value);return Array.isArray(a)?a.map(String):[value]}catch{return value.split(',')}})():value.split(',')).map(s=>s.trim()).filter(Boolean):value;}
   if(body.imdbRating!==undefined&&(!Number.isFinite(Number(body.imdbRating))||Number(body.imdbRating)<0||Number(body.imdbRating)>10))return error('التقييم يجب أن يكون بين 0 و10');
   const content={...editing.content,contentJSON:JSON.stringify(data)};if(body.imdbRating!==undefined)content.imdb_ratings=Number(body.imdbRating);if(body.ReleaseDate!==undefined)content.year=parseInt(body.ReleaseDate)||0;
   next.edits[id]={...next.edits[id],...(body.name?{name:body.name.trim()}:{}),...(!sharedCatalog?{content}:{})};if(sharedCatalog){delete next.edits[id].content;next.sharedContent={...next.sharedContent,[sharedCatalog.key(id)]:content};}
  }
  save(next);return result({msg:'ok',...exclusiveResult});
 },apply,observe,reconcileScan,batchChanges,scanApplied:scope=>{const key=require('./movie-scan-state.cjs').key(scope);return state.scanApplied?.[key]===scope.stamp&&state.scanAppliedVersion?.[key]===scanReconcileVersion;}};
};
