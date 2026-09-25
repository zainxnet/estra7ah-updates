'use strict';
// Section IDs remain membership IDs: existing URLs, per-section access and edits
// survive. Shared identity is physical folder + structural media type, never title.
const path=require('node:path'),crypto=require('node:crypto');
const catalog=require('./catalog-items.cjs');
function shareable(row){const type=require('./public-catalog.cjs').publicType(row?.type);return !!row&&(!row.inItem||row.inItem==='null')&&catalog.visible(row)&&(type==='movie'||/^series(?:\.|$)/.test(type||''));}
function key(row){
 if(!row||!row.path||!shareable(row))return 'id:'+(row?.id||'');
 const type=require('./public-catalog.cjs').publicType(row.type);
 const kind=type==='movie'?'movie':type==='season'?'season':type==='series'||/^series\./.test(type)?'series':type;
 const source=path.win32.normalize(row.path.trim()).toLowerCase().replace(/[\\/]+$/,'');
 return 'media:'+crypto.createHash('sha256').update(kind+'\0'+source).digest('hex');
}
function hasContent(row){
 const descriptor=Object.getOwnPropertyDescriptor(row||{},'content');
 return descriptor?.get?row.__zainHasContent===true:require('./metadata.cjs').hasContent(row);
}
module.exports=function({items,rows,updateItems}){
 const groups=new Map(),members=new Map();let overrides={},preferred=new Map();
 function add(row){
  if(!shareable(row)){remove(row.id);return;}
  const identity=key(row),previous=members.get(row.id);
  if(previous&&previous!==identity)remove(row.id);
  if(!groups.has(identity))groups.set(identity,new Map());
  groups.get(identity).set(row.id,{id:row.id,hasContent:hasContent(row)});members.set(row.id,identity);
 }
 function remove(id){const identity=members.get(id);if(!identity)return;const group=groups.get(identity);group?.delete(id);if(!group?.size)groups.delete(identity);members.delete(id);}
 for(const row of rows)add(row);
 function identity(id){return members.get(id)||key(items.get(id)||{id});}
 function related(id){const group=groups.get(identity(id));return group?[...group.keys()]:[id];}
 function canonical(id){const group=groups.get(identity(id));if(!group)return id;let selected,score=-1;for(const row of group.values()){const next=(preferred.get(row.id)||0)*2+Number(row.hasContent);if(!selected||next>score||next===score&&row.id<selected.id){selected=row;score=next;}}return selected?.id||id;}
 function content(row){const identityKey=identity(row.id);if(Object.hasOwn(overrides,identityKey))return overrides[identityKey];return items.get(canonical(row.id))?.content||row.content;}
 function view(row){if(!row)return row;const shared=content(row);return shared===row.content?row:{...row,content:shared};}
 function unique(rows){const seen=new Set();return rows.filter(row=>{const k=members.get(row.id)||key(row);if(seen.has(k))return false;seen.add(k);return true;});}
 function publish(identityKey,value){const group=groups.get(identityKey);if(!group)return;updateItems([...group.keys()].map(id=>items.get(id)).filter(Boolean).map(row=>({...row,content:value})));}
 return {
  key:identity,canonical,related,view,unique,add,remove,
  project:row=>Object.hasOwn(overrides,key(row))?{...row,content:overrides[key(row)]}:row,
  load(values,edits){overrides=values||{};preferred=new Map();let order=0;for(const [id,edit]of Object.entries(edits||{}))if(Object.hasOwn(edit,'content'))preferred.set(id,++order);for(const [k,value]of Object.entries(overrides))publish(k,value);},
  set(id,value){const k=identity(id);overrides={...overrides,[k]:value};publish(k,value);},
  hasContent:row=>{const k=members.get(row.id)||key(row);return Object.hasOwn(overrides,k)?require('./metadata.cjs').hasContent({content:overrides[k]}):groups.get(k)?.get(canonical(row.id))?.hasContent||hasContent(row);},
  stats(){return {members:members.size,sharedItems:groups.size,duplicateMemberships:members.size-groups.size};}
 };
};
module.exports.key=key;
