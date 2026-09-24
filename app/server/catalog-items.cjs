'use strict';
const path=require('node:path'),crypto=require('node:crypto');
const video=/\.(?:mp4|m4v|mkv|avi|mov|wmv|webm|flv|ts|mts|m2ts|mpg|mpeg|3gp)$/i;
const key=value=>typeof value==='string'?path.win32.normalize(value).replace(/[\\/]+$/,'').toLowerCase():'';
const root=item=>!item.inItem||item.inItem==='null';
const mediaContainer=item=>['movie','film','series','season','tv','anime','kids','deen','sports','learn','ramadan'].includes(item.type)||/^series\./.test(item.type||'');
function videoFile(item){return item.recordKind==='file'||['episod','episode'].includes(item.type)||video.test(item.path||'')&&(mediaContainer(item)||item.type==='main'||(item.files||[]).some(file=>key(file.path)===key(item.path)));}
function visible(item){return !!item&&!videoFile(item);}
function display(item){
 if(!item||!mediaContainer(item)||videoFile(item)||!item.path)return item;
 const directory=path.win32.basename(item.path.replace(/[\\/]+$/,''));
 if(!directory||item.name===directory)return item;
 const childName=(item.files||[]).some(file=>path.win32.parse(file.filename||file.path||'').name===item.name);
 return item.recordKind==='folder'||childName?{...item,name:directory}:item;
}
function folderId(sectionId,folder){const canonical=path.resolve(folder).replace(/\\/g,'/').replace(/\/+$/,'').toLowerCase();return 'sync-'+crypto.createHash('sha256').update(sectionId+'\0'+canonical+'\0movie-folder').digest('hex').slice(0,40);}
// Repair the derived view only: retain legacy file records and IDs as children,
// and expose one folder containing all playback files. Never alter media files.
function repairMovieFiles(items,updateItems){
 const folders=new Map(),leaves=[];
 for(const item of items.values())if(['movie','film'].includes(item.type)){if(videoFile(item)&&root(item))leaves.push(item);else if(!videoFile(item)&&item.path)folders.set(String(item.sectionId)+'|'+key(item.path),item);}
 let repaired=0;
 for(const item of leaves){
  const directory=path.dirname(item.path),group=String(item.sectionId)+'|'+key(directory);let parent=folders.get(group);
  if(!parent){parent={id:folderId(item.sectionId,directory),name:path.basename(directory),type:'movie',inItem:null,sectionId:item.sectionId,path:directory,pathSize:0,createdAt:item.createdAt,files:[],content:{},recordKind:'folder'};folders.set(group,parent);}
  const known=new Set((parent.files||[]).map(file=>key(file.path)));
  const added=(item.files||[]).filter(file=>!known.has(key(file.path))).map(file=>({...file,itemId:parent.id}));
  parent={...parent,files:[...(parent.files||[]),...added],pathSize:(Number(parent.pathSize)||0)+(added.length?Number(item.pathSize)||0:0)};folders.set(group,parent);
  updateItems([{...item,inItem:parent.id,recordKind:'file'},parent]);repaired++;
 }
 return repaired;
}
module.exports={visible,videoFile,mediaContainer,display,repairMovieFiles,folderId};
