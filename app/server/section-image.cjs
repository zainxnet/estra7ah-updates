'use strict';
const fs=require('node:fs/promises'),path=require('node:path'),crypto=require('node:crypto');
module.exports=async function saveSectionImage(dir,upload){
 const b=upload.bytes;let ext;
 if(!Buffer.isBuffer(b)||b.length<8||b.length>8*1024*1024)throw Error('اختر صورة لا تتجاوز 8 ميغابايت');
 if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';
 else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';
 else if(b.length>=12&&b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')ext='webp';
 else if(/^GIF8[79]a/.test(b.toString('ascii',0,6)))ext='gif';
 else if(b[0]===0&&b[1]===0&&b[2]===1&&b[3]===0)ext='ico';
 if(!ext)throw Error('نوع الصورة غير مدعوم؛ اختر JPG أو PNG أو WEBP أو GIF أو ICO');
 const name=crypto.randomUUID()+'.'+ext,root=path.join(dir,'section-images');await fs.mkdir(root,{recursive:true});await fs.writeFile(path.join(root,name),b,{flag:'wx'});return name;
};
