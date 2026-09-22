'use strict';
const os=require('node:os'),path=require('node:path');
module.exports=function(req,item,mode){
 const fail=(status,message)=>{throw Object.assign(Error(message),{status});};
 if(req.method!=='POST')fail(405,'طريقة الطلب غير مسموحة');
 if(!require('./same-origin.cjs')(req))fail(403,'طلب فتح المجلد يجب أن يصدر من صفحة الاستراحة');
 if(mode!=='caffe')fail(403,'فتح المجلد متاح في وضع المقهى');
 if(!item)fail(404,'العنصر غير موجود');
 const target=item.path;
 if(typeof target!=='string'||!(/^[A-Za-z]:[\\/]/.test(target)||/^\\\\[^\\?.][^\\]*\\[^\\]+/.test(target))||/[\x00-\x1f]/.test(target))fail(400,'لا يوجد مسار مجلد صالح لهذا العنصر');
 const address=String(req.socket.remoteAddress||'').replace(/^::ffff:/,'');
 const local=address==='127.0.0.1'||address==='::1'||Object.values(os.networkInterfaces()).flat().some(x=>x?.address===address);
 const folder=(item.files||[]).some(f=>f.path&&path.normalize(f.path).toLowerCase()===path.normalize(target).toLowerCase())?path.dirname(target):target;
 return {local,nativePath:local||folder.startsWith('\\\\')?folder:null,browseUrl:'/zain/folder/'+encodeURIComponent(item.id)};
};
