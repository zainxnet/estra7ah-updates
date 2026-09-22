'use strict';
const crypto=require('node:crypto');
module.exports=function({maxBytes=16*1024*1024,maxEntries=160,ttl=30000}={}){
 const entries=new Map();let size=0;
 function remove(key){const e=entries.get(key);if(e){size-=e.bytes.length;entries.delete(key)}}
 return {clear(){entries.clear();size=0},get(key,revision){const e=entries.get(key);if(!e)return null;if(e.revision!==revision||e.until<Date.now()){remove(key);return null}entries.delete(key);entries.set(key,e);return e},put(key,revision,value){const bytes=Buffer.from(JSON.stringify(value)),entry={bytes,revision,until:Date.now()+ttl,etag:'"'+crypto.createHash('sha256').update(bytes).digest('hex')+'"'};if(bytes.length<=maxBytes){remove(key);entries.set(key,entry);size+=bytes.length;while(entries.size>maxEntries||size>maxBytes)remove(entries.keys().next().value)}return entry},send(req,res,entry){res.setHeader('Content-Type','application/json; charset=utf-8');res.setHeader('Cache-Control','private, no-cache');res.setHeader('ETag',entry.etag);if(String(req.headers['if-none-match']||'').split(',').map(x=>x.trim()).includes(entry.etag)){res.writeHead(304).end();return}res.setHeader('Content-Length',entry.bytes.length);res.writeHead(200).end(req.method==='HEAD'?undefined:entry.bytes)}};
};

