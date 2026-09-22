'use strict';
module.exports=async function readMultipart(req,{limit=32*1024*1024}={}){
 const fail=(message,status=400)=>Object.assign(Error(message),{status});
 const match=/^multipart\/form-data\s*;.*boundary=(?:"([^"\r\n]+)"|([^;\s]+))/i.exec(req.headers['content-type']||'');
 if(!match)throw fail('صيغة رفع الملفات غير صالحة');const boundary=match[1]||match[2];if(boundary.length>70)throw fail('فاصل النموذج غير صالح');
 if(Number(req.headers['content-length'])>limit)throw fail('حجم الرفع يتجاوز 32 ميغابايت',413);
 const chunks=[];let total=0;for await(const chunk of req){total+=chunk.length;if(total>limit)throw fail('حجم الرفع يتجاوز 32 ميغابايت',413);chunks.push(chunk)}
 const buffer=Buffer.concat(chunks),delimiter=Buffer.from('--'+boundary),separator=Buffer.from('\r\n--'+boundary),fields=Object.create(null),files=Object.create(null);let at=0,count=0;
 if(!buffer.subarray(0,delimiter.length).equals(delimiter))throw fail('نموذج غير مكتمل');at=delimiter.length;
 while(at<buffer.length){
  if(buffer.subarray(at,at+2).toString()==='--')return {fields,files};
  if(buffer.subarray(at,at+2).toString()!=='\r\n')throw fail('فاصل غير صالح');at+=2;
  const end=buffer.indexOf('\r\n\r\n',at);if(end<0||end-at>8192||++count>40)throw fail('رأس نموذج غير صالح');
  const header=buffer.subarray(at,end).toString('utf8'),name=/\bname="([^"\r\n]+)"/.exec(header),filename=/\bfilename="([^"\r\n]*)"/.exec(header);
  if(!name||fields[name[1]]!==undefined||files[name[1]]!==undefined)throw fail('اسم حقل غير صالح أو مكرر');
  const next=buffer.indexOf(separator,end+4);if(next<0)throw fail('رفع غير مكتمل');const bytes=buffer.subarray(end+4,next);
  if(filename){if(filename[1]&&bytes.length)files[name[1]]={name:filename[1],bytes};}
  else{if(bytes.length>24000)throw fail('حقل نصي كبير');fields[name[1]]=bytes.toString('utf8');}
  at=next+2+delimiter.length;
 }
 throw fail('نموذج غير مكتمل');
};
