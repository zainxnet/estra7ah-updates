'use strict';
module.exports=({ready,syncJobs,metadataJobs,isBusy,pendingRestore})=>{
 if(!ready)return 'انتظر اكتمال تشغيل الاستراحة';
 if(pendingRestore)return 'توجد استعادة قاعدة بيانات معلقة؛ أكملها قبل تحديث البرنامج';
 if(isBusy)return 'انتظر انتهاء النسخ الاحتياطي أو صيانة القاعدة';
 if([...syncJobs,...metadataJobs].some(j=>['queued','running'].includes(j.status)))return 'انتظر انتهاء المزامنة أو أوقفها من لوحة التحكم قبل التحديث';
 return '';
};
