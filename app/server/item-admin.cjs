'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
module.exports=function({dir,items,safeItem,updateItems,removeItem,prepareExclusive=async()=>({imageKind:'poster'})}){
 const file=path.join(dir,'item-edits.json');let state=fs.existsSync(file)?JSON.parse(fs.readFileSync(file,'utf8')):{edits:{},deleted:[],pinned:[]};
 if(!state.edits||!Array.isArray(state.deleted)||!Array.isArray(state.pinned))throw Error('Invalid item edits store');
 function apply(){for(const [id,edit]of Object.entries(state.edits)){const item=items.get(id);if(item)updateItems([{...item,...edit}]);}for(const id of state.deleted)removeItem(id);}
 let lastMetadataBackup=0;
 function save(next,{metadataId}={}){const metadataSave=metadataId!==undefined,now=Date.now();if(fs.existsSync(file)&&(!metadataSave||!lastMetadataBackup||now-lastMetadataBackup>=60000)){const folder=path.join(dir,'backups');fs.mkdirSync(folder,{recursive:true});fs.copyFileSync(file,path.join(folder,'item-edits-'+now+'-'+crypto.randomUUID()+'.json'));if(metadataSave)lastMetadataBackup=now;}const temporary=file+'.tmp';fs.writeFileSync(temporary,JSON.stringify(next));fs.renameSync(temporary,file);state=next;if(metadataSave){const item=items.get(metadataId);if(item)updateItems([{...item,...state.edits[metadataId]}]);}else apply();}
 apply();
 state.exclusive=state.exclusive||[];
 const adminReads=new Set(['getItems','getPinedItems','getExclusiveItems','getItemSyncState']);const adminActions=new Set(['pinItem','delPinedItem','deleteItem','updateContent','addExclusiveItem','removeExclusiveItem','updateExclusiveItem']);
 function exclusiveItems(){return state.exclusive.map(id=>{const item=items.get(id);if(!item)return null;const edit=state.exclusiveEdits?.[id]||{};let content={};try{content=JSON.parse(item.content?.contentJSON||'{}')}catch{}return {...safeItem(item),...(edit.name?{name:edit.name}:{}),content:{...item.content,contentJSON:JSON.stringify({...content,...edit.content})},...(edit.image?{exclusiveImage:'/zain/exclusive-custom-image?id='+encodeURIComponent(id)+'&v='+edit.version}:{})};}).filter(Boolean);}
 return {exclusiveItems,exclusiveFile:id=>{const name=state.exclusiveEdits?.[id]?.image;return state.exclusive.includes(id)&&items.has(id)&&/^[a-f0-9-]+\.(png|jpg|webp|gif)$/.test(name||'')?path.join(dir,'promotional-media',name):null;},readBody:(req,action)=>action==='updateExclusiveItem'?require('./multipart.cjs')(req,{limit:9*1024*1024}):require('./text-body.cjs')(req),saveContent:(id,content)=>{if(!items.has(id))return;const next={...state,edits:{...state.edits,[id]:{...state.edits[id],content}}};save(next,{metadataId:id});},pinnedItems:()=>state.pinned.map(id=>items.get(id)).filter(Boolean).map(safeItem),adminReads,adminActions,async admin(action,args,body,method){
  const result=(body,status=200)=>({body,status}),error=(message,status=400)=>result({msg:'error',error:message},status);
  if(adminReads.has(action)&&method!=='GET')return error('طريقة الطلب غير صالحة',405);
  if(action==='getExclusiveItems')return result({items:exclusiveItems()});
  if(action==='getPinedItems')return result({res:state.pinned.filter(id=>items.has(id)).map(itemId=>({itemId}))});
  if(action==='getItemSyncState'){
   const ids=[...new Set(String(args[0]||'').split(',').filter(Boolean))];if(ids.length>200||ids.some(id=>id.length>200))return error('عدد العناصر المطلوب كبير');
   return result({items:ids.map(id=>items.get(id)).filter(Boolean).map(item=>({id:item.id,hasContent:require('./metadata.cjs').hasContent(item),...(args[1]==='content'?{content:item.content}: {})}))});
  }
  if(action==='getItems'){
   const [section,filter,type,offset,...queryParts]=args,q=queryParts.join('/').toLowerCase();
   if(items.queryTop&&filter!=='pined'){const normalized=q.replace(/[أإآ]/g,'ا').replace(/ة/g,'ه').replace(/[ؤئ]/g,'ء').replace(/ى/g,'ي'),filters={section:section&&section!=='all'?section:undefined,types:type&&type!=='all'?[type]:undefined,keys:q&&!['null','undefined'].includes(q)?[normalized]:undefined,missing:filter==='no-content'};return result({total:[{count:items.countTop(filters)}],items:items.queryTop({...filters,offset:Math.max(0,parseInt(offset)||0),limit:100,newest:filter==='no-content'}).map(safeItem)});}
   let rows=[...items.values()].filter(item=>(!item.inItem||item.inItem==='null')&&require('./catalog-items.cjs').visible(item));
   if(section&&section!=='all')rows=rows.filter(item=>item.sectionId===section);
   if(type&&type!=='all')rows=rows.filter(item=>item.type===type);
   if(filter==='pined')rows=rows.filter(item=>state.pinned.includes(item.id));
   if(filter==='no-content')rows=require('./metadata.cjs').newestFirst(rows.filter(item=>!require('./metadata.cjs').hasContent(item)));
   if(q&&!['null','undefined'].includes(q))rows=rows.filter(item=>String(item.name).toLowerCase().includes(q));
   const at=Math.max(0,parseInt(offset)||0);return result({total:[{count:rows.length}],items:rows.slice(at,at+100).map(safeItem)});
  }
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
  const next=structuredClone(state);
  if(action==='addExclusiveItem'){if(!['movie','film','series'].includes(item.type))return error('اختر فيلماً أو مسلسلاً');if(!next.exclusive.includes(id))next.exclusive.push(id);}
  if(action==='removeExclusiveItem')next.exclusive=next.exclusive.filter(x=>x!==id);
  if(action==='pinItem'){if(!next.pinned.includes(id))next.pinned.push(id);}
  if(action==='delPinedItem')next.pinned=next.pinned.filter(value=>value!==id);
  if(action==='deleteItem'){
   const ids=new Set([id]);let changed=true;while(changed){changed=false;for(const row of items.values())if(ids.has(row.inItem)&&!ids.has(row.id)){ids.add(row.id);changed=true;}}
   next.deleted=[...new Set([...next.deleted,...ids])];next.pinned=next.pinned.filter(value=>!ids.has(value));
  }
  if(action==='updateContent'){
   if(method!=='POST')return error('طريقة الطلب غير صالحة',405);
   let data={};try{data=JSON.parse(item.content?.contentJSON||'{}')}catch{}
   if(!data||typeof data!=='object'||Array.isArray(data))data={};
   const allowed=new Set(['name','Runtime','content_id','ReleaseDate','castEnglish','descArabic','descEnglish','directedByEnglish','imdbRating','imdbVotes','tagsArabic']);
   for(const [key,raw]of Object.entries(body)){let value=raw;if(Array.isArray(value)&&['castEnglish','directedByEnglish','tagsArabic'].includes(key))value=value.join(',');if(typeof value==='number')value=String(value);if(value===null)value='';if(!allowed.has(key)||typeof value!=='string'||value.length>20000)return error('حقل بيانات غير صالح');if(key==='name'){if(!value.trim()||value.length>300)return error('اسم العنصر مطلوب');continue;}data[key]=['castEnglish','directedByEnglish','tagsArabic'].includes(key)?(value.trim().startsWith('[')?(()=>{try{const a=JSON.parse(value);return Array.isArray(a)?a.map(String):[value]}catch{return value.split(',')}})():value.split(',')).map(s=>s.trim()).filter(Boolean):value;}
   if(body.imdbRating!==undefined&&(!Number.isFinite(Number(body.imdbRating))||Number(body.imdbRating)<0||Number(body.imdbRating)>10))return error('التقييم يجب أن يكون بين 0 و10');
   const content={...item.content,contentJSON:JSON.stringify(data)};if(body.imdbRating!==undefined)content.imdb_ratings=Number(body.imdbRating);if(body.ReleaseDate!==undefined)content.year=parseInt(body.ReleaseDate)||0;
   next.edits[id]={...next.edits[id],...(body.name?{name:body.name.trim()}:{}),content};
  }
  save(next);return result({msg:'ok',...exclusiveResult});
 },apply};
};
