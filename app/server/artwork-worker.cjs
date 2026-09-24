'use strict';
const fs = require('node:fs/promises');
const path = require('node:path');
const types = { '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.webp': 'image/webp', '.gif': 'image/gif', '.ico': 'image/x-icon', '.bmp': 'image/bmp' };
const valid = (b, ext) => {
  if (b.length < 8) return false;
  if (ext === '.jpg' || ext === '.jpeg') return b[0] === 255 && b[1] === 216 && b[2] === 255;
  if (ext === '.png') return b.subarray(0, 8).equals(Buffer.from([137,80,78,71,13,10,26,10]));
  if (ext === '.webp') return b.toString('ascii',0,4) === 'RIFF' && b.toString('ascii',8,12) === 'WEBP';
  if (ext === '.gif') return /^GIF8[79]a/.test(b.toString('ascii',0,6));
  if (ext === '.bmp') return b.toString('ascii',0,2) === 'BM';
  return ext === '.ico' && b[0] === 0 && b[1] === 0 && b[2] === 1 && b[3] === 0;
};
process.on('disconnect', () => process.exit(0));
process.on('message', async ({ candidates }) => {
  const directories=new Map(),attempted=new Set();
  for(const filename of candidates||[]){const dir=path.dirname(filename);if(!directories.has(dir))directories.set(dir,[]);directories.get(dir).push(filename);}
  const iconsFirst=files=>[...new Set(files)].sort((a,b)=>Number(!/\.ico$/i.test(a))-Number(!/\.ico$/i.test(b)));
  async function read(filename) {
    if(attempted.has(filename))return null;attempted.add(filename);
    let handle;
    try {
      const ext = path.extname(filename).toLowerCase();
      if (!types[ext]) return null;
      handle = await fs.open(filename, 'r');
      const stat = await handle.stat();
      if (!stat.isFile() || stat.size < 8 || stat.size > 8 * 1024 * 1024) return null;
      // Read at most the inspected length even if the underlying file grows.
      const bytes = Buffer.alloc(stat.size); let offset = 0;
      while (offset < bytes.length) { const read = await handle.read(bytes, offset, bytes.length - offset, offset); if (!read.bytesRead) break; offset += read.bytesRead; }
      if (offset === bytes.length && valid(bytes, ext)) return { bytes, type: types[ext] };
    } catch { /* A missing cover can fall back to another recorded image. */ }
    finally { if (handle) await handle.close().catch(() => {}); }
    return null;
  }
  let discoveredDirectories=0;
  for(const [dir,files] of directories){
    // The item's known cover must not wait for directory listings or an unavailable
    // ancestor. Keep icon priority within each folder, then discover unlisted art.
    for(const filename of iconsFirst(files)){const result=await read(filename);if(result){process.send(result);return;}}
    if(discoveredDirectories++>=8)continue;
    try{
      const entries=await fs.readdir(dir,{withFileTypes:true});
      const discovered=entries.filter(entry=>entry.isFile()&&types[path.extname(entry.name).toLowerCase()]).map(entry=>path.join(dir,entry.name));
      for(const filename of iconsFirst(discovered)){const result=await read(filename);if(result){process.send(result);return;}}
    }catch{}
  }
  process.send(null);
});
