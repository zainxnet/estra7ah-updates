'use strict';
const path=require('node:path');
const video=/\.(mp4|m4v|mkv|avi|mov|wmv|webm|flv|ts|mts|m2ts|mpg|mpeg|3gp)$/i;
function relative(value){if(typeof value!=='string'||value.length>4096||/[\x00-\x1f:]/.test(value)||value.startsWith('/')||value.startsWith('\\'))throw Error('INVALID_RELATIVE_PATH');const parts=value.replace(/\\/g,'/').split('/');if(parts.some(p=>p==='.'||p==='..'))throw Error('INVALID_RELATIVE_PATH');return parts.filter(Boolean).join('/');}
function target(root,rel){const safe=relative(rel),result=path.resolve(root,...safe.split('/'));const part=path.relative(path.resolve(root),result);if(part.startsWith('..')||path.isAbsolute(part))throw Error('OUTSIDE_ROOT');return result;}
function eligible(name){return video.test(name)&&!/^إعلان\s*-|\b(?:trailer|sample)\b/i.test(name);}
module.exports={relative,target,eligible};
