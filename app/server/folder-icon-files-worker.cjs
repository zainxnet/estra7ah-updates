'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),{execFile}=require('node:child_process');
const MAX_ENTRIES=10000,MAX_INI=65536,MAX_ICO=8*1024*1024;
process.on('disconnect',()=>process.exit(0));
function fail(code){const error=new Error(code);error.code=code;throw error;}
function absolute(value){
 if(typeof value!=='string'||!path.isAbsolute(value)||/[\x00-\x1f]/.test(value)||/^\\\\[?.]\\/.test(value))fail('INVALID_PATH');
 const resolved=path.resolve(value);
 if(resolved===path.parse(resolved).root)fail('ROOT_NOT_ALLOWED');
 return resolved;
}
async function directory(target){
 const resolved=absolute(target),stat=await fs.lstat(resolved);
 if(stat.isSymbolicLink()||!stat.isDirectory())fail('INVALID_DIRECTORY');
 return resolved;
}
function iniCodec(buffer){
 let offset=0,encoding='latin1',swap=false;
 if(buffer[0]===0xff&&buffer[1]===0xfe){offset=2;encoding='utf16le';}
 else if(buffer[0]===0xfe&&buffer[1]===0xff){offset=2;encoding='utf16le';swap=true;}
 else if(buffer[0]===0xef&&buffer[1]===0xbb&&buffer[2]===0xbf){offset=3;encoding='utf8';}
 else if(buffer.length>3&&buffer[1]===0&&buffer[3]===0)encoding='utf16le';
 const body=Buffer.from(buffer.subarray(offset));
 if(swap){if(body.length%2)fail('INVALID_INI');body.swap16();}
 return {text:body.toString(encoding),encode(text){const bytes=Buffer.from(text,encoding);if(swap)bytes.swap16();return Buffer.concat([buffer.subarray(0,offset),bytes]);}};
}
function customIcon(text){
 let inShell=false;
 for(const line of text.split(/\r\n|\n|\r/)){
  const section=line.match(/^\s*\[([^\]]+)\]/);
  if(section){inShell=section[1].trim().toLowerCase()==='.shellclassinfo';continue;}
  if(inShell&&/^\s*(?:IconResource|IconFile)\s*=\s*\S/i.test(line))return true;
 }
 return false;
}
async function readIni(filename){
 let stat;
 try{stat=await fs.lstat(filename);}catch(error){if(error.code==='ENOENT')return null;throw error;}
 if(stat.isSymbolicLink()||!stat.isFile())fail('UNSAFE_INI');
 if(stat.size>MAX_INI)fail('INI_TOO_LARGE');
 const buffer=await fs.readFile(filename);
 if(buffer.length>MAX_INI)fail('INI_TOO_LARGE');
 return {buffer,...iniCodec(buffer)};
}
async function entries(target){
 const found=[],handle=await fs.opendir(target);
 for await(const entry of handle){if(found.length>=MAX_ENTRIES)fail('TOO_MANY_ENTRIES');found.push(entry);}
 return found;
}
async function inspect(target,includePoster=false){
 const names=await entries(target);
 const icons=names.filter(entry=>entry.name.toLowerCase()==='folder.ico').sort((a,b)=>a.name.localeCompare(b.name));
 let existing;
 for(const entry of icons){
  const filename=path.join(target,entry.name),stat=await fs.lstat(filename);
  // Never replace a user icon, including an invalid one or a symbolic link.
  if(stat.isFile()&&!stat.isSymbolicLink())existing={status:'existing',iconPath:filename};
  else if(stat.isSymbolicLink())existing={status:'existing',code:'EXISTING_ICON_LINK'};
  if(existing){if(!includePoster)return existing;break;}
 }
 if(!existing){
  const iniEntry=names.find(entry=>entry.name.toLowerCase()==='desktop.ini');
  const iniPath=path.join(target,iniEntry?iniEntry.name:'desktop.ini'),ini=await readIni(iniPath);
  // desktop.ini alone is not an icon; a missing ICO must be generated.
 }
 const result=existing||{status:'ready'};
 const images=names.filter(entry=>/\.(png|jpe?g|bmp)$/i.test(entry.name));
 const priority=name=>{const base=path.parse(name).name.toLowerCase();return base==='poster'?0:base==='folder'?1:base==='cover'?2:3;};
 images.sort((a,b)=>priority(a.name)-priority(b.name)||a.name.localeCompare(b.name));
 for(const image of images){
  const filename=path.join(target,image.name),stat=await fs.lstat(filename);
  if(stat.isFile()&&!stat.isSymbolicLink()&&stat.size>0&&stat.size<=50*1024*1024)return {...result,posterPath:filename};
 }
 return result;
}
async function readIco(source){
 source=absolute(source);
 const stat=await fs.lstat(source);
 if(stat.isSymbolicLink()||!stat.isFile()||stat.size<22||stat.size>MAX_ICO)fail('INVALID_ICO');
 const bytes=await fs.readFile(source);
 if(bytes.length<22||bytes.length>MAX_ICO||bytes.readUInt16LE(0)!==0||bytes.readUInt16LE(2)!==1)fail('INVALID_ICO');
 const count=bytes.readUInt16LE(4);
 if(!count||count>256||bytes.length<6+16*count)fail('INVALID_ICO');
 for(let i=0;i<count;i++){
  const position=6+16*i,size=bytes.readUInt32LE(position+8),offset=bytes.readUInt32LE(position+12);
  if(!size||offset<6+16*count||offset+size>bytes.length)fail('INVALID_ICO');
 }
 return bytes;
}
function withIcon(text){
 let shell=false;
 text=text.split(/(\r\n|\n|\r)/).filter(line=>{const section=line.match(/^\s*\[([^\]]+)\]/);if(section)shell=section[1].trim().toLowerCase()==='.shellclassinfo';return !(shell&&/^\s*(?:IconResource|IconFile|IconIndex)\s*=/i.test(line));}).join('');
 const newline=text.includes('\r\n')?'\r\n':text.includes('\n')?'\n':'\r\n';
 const header=/^\s*\[\.ShellClassInfo\][^\r\n]*(?:\r\n|\n|\r|$)/im;
 if(header.test(text))return text.replace(header,match=>match.replace(/[\r\n]+$/,'')+newline+'IconResource=folder.ico,0'+newline);
 return text+(text&&!/[\r\n]$/.test(text)?newline:'')+'[.ShellClassInfo]'+newline+'IconResource=folder.ico,0'+newline;
}
async function configureIni(target){
 const names=await entries(target),entry=names.find(entry=>entry.name.toLowerCase()==='desktop.ini'),filename=path.join(target,entry?entry.name:'desktop.ini');
 const current=await readIni(filename);
 
 const buffer=current?current.encode(withIcon(current.text)):Buffer.from('[.ShellClassInfo]\r\nIconResource=folder.ico,0\r\n','utf8');
 if(!current){await fs.writeFile(filename,buffer,{flag:'wx'});return filename;}
 // Only insert the icon directive; preserve unrelated sections and text encoding.
 const handle=await fs.open(filename,'r+');
 try{
  const latest=await handle.readFile();
  if(!latest.equals(current.buffer))fail('INI_CHANGED');
  await handle.write(buffer,0,buffer.length,0);await handle.truncate(buffer.length);
 }finally{await handle.close();}
 return filename;
}
function attrib(args){
 return new Promise((resolve,reject)=>execFile(path.join(process.env.SystemRoot||'C:\\Windows','System32','attrib.exe'),args,{windowsHide:true,timeout:2500},error=>error?reject(error):resolve()));
}
async function install(target,source){
 const before=await inspect(target);
 if(before.status!=='ready')return before;
 const bytes=await readIco(source),iconPath=path.join(target,'folder.ico');
 try{await fs.writeFile(iconPath,bytes,{flag:'wx'});}catch(error){if(error.code==='EEXIST')return {status:'existing'};throw error;}
 let iniPath;
 try{iniPath=await configureIni(target);}catch(error){return {status:'created',iconPath,explorerReady:false,code:error.code||'INI_FAILED'};}
 if(process.platform!=='win32')return {status:'created',iconPath,explorerReady:false,code:'EXPLORER_REQUIRES_WINDOWS'};
 try{await attrib(['+h','+s',iniPath]);await Promise.all([attrib(['+r',target]),attrib(['+h',iconPath]),...(before.posterPath?[attrib(['+h',before.posterPath])]:[])]);}
 catch{return {status:'created',iconPath,explorerReady:false,code:'EXPLORER_ATTRIBUTES_FAILED'};}
 // Preserve access times; only these three modification dates follow the local poster creation date.
 if(before.posterPath){
  try{
   const posterStat=await fs.lstat(before.posterPath);
   if(posterStat.isSymbolicLink()||!posterStat.isFile()||!Number.isFinite(posterStat.birthtimeMs)||posterStat.birthtimeMs<=0)fail('INVALID_POSTER_DATE');
   const date=posterStat.birthtime;
   for(const filename of [before.posterPath,iconPath,target]){const stat=await fs.lstat(filename);if(stat.isSymbolicLink())fail('UNSAFE_DATE_TARGET');await fs.utimes(filename,stat.atime,date);}
  }catch{return {status:'created',iconPath,explorerReady:true,datesReady:false,code:'ICON_DATES_FAILED'};}
 }
 return {status:'created',iconPath,explorerReady:true,datesReady:true};
}
process.once('message',async message=>{
 let result;
 try{
  const target=await directory(message.target);
  if(message.action==='inspect')result=await inspect(target,message.includePoster===true);
  else if(message.action==='install')result=await install(target,message.source);
  else fail('INVALID_ACTION');
 }catch(error){result={status:'failed',code:error.code||'ICON_FILES_FAILED'};}
 if(process.connected)process.send(result,()=>process.disconnect());
});
