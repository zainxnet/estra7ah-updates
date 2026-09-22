'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),zlib=require('node:zlib');
const stored=fs.existsSync(path.join(__dirname,'browser-compiled.cjs'))?require('./browser-compiled.cjs'):{};
const cache=new Map();
module.exports=code=>{const key=crypto.createHash('sha256').update(code).digest('hex');if(!cache.has(key))cache.set(key,stored[key]?zlib.gunzipSync(Buffer.from(stored[key],'base64')):code);return cache.get(key)};
