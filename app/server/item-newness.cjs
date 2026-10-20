'use strict';
// Keep library dates intact. A later real addition supersedes a manual decision.
const nativeTime=row=>Math.max(Number(row?.createdAt)||0,Number(row?.latestEpisodeAt)||0);
const active=row=>row?.newControl&&nativeTime(row)<=row.newControl.through?row.newControl:null;
function time(row){
 const control=active(row);
 if(control?.mode==='promote')return Math.max(nativeTime(row),control.at);
 if(control?.mode==='dismiss')return control.orderAt;
 return nativeTime(row);
}
function isNew(row,now=Date.now()/1000){
 const control=active(row);
 if(control?.mode==='dismiss')return false;
 if(control?.mode==='promote')return control.at+259200>now;
 // Retain the existing three-day badge / two-day new-episode window.
 return Math.max(Number(row?.createdAt)||0,(Number(row?.latestEpisodeAt)||0)-86400)+259200>now;
}
function promote(row,now=Date.now()/1000){
 const control=active(row);
 return {mode:'promote',at:now,through:nativeTime(row),previousOrder:control?.mode==='promote'?control.previousOrder:time(row)};
}
function dismiss(row){
 const control=active(row);
 const orderAt=control?.mode==='promote'?control.previousOrder:control?.mode==='dismiss'?control.orderAt:Number(row?.previousActivityAt)||Number(row?.createdAt)||0;
 return {mode:'dismiss',through:nativeTime(row),orderAt};
}
module.exports={nativeTime,time,isNew,promote,dismiss};
