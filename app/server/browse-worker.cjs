'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');

function send(value) { if (process.connected) process.send(value); }
process.on('disconnect', () => process.exit(0));
process.once('message', async message => {
  try {
    if (message.operation === 'drives') {
      const roots = process.platform === 'win32' ?
        Array.from({ length: 26 }, (_, index) => String.fromCharCode(65 + index) + ':') : ['/'];
      const found = await Promise.all(roots.map(async root => {
        try {
          const stat = await fs.statfs(process.platform === 'win32' ? root + '\\' : root);
          const drive = { lable: root, path: root, freeSize: Number(stat.bavail) * Number(stat.bsize) };
          send({ type: 'drive', drive });
          return drive;
        } catch { return null; }
      }));
      send({ type: 'result', result: found.filter(Boolean) });
    } else if (message.operation === 'check') {
      const stat=await fs.stat(message.path);if(!stat.isDirectory())throw Error('المسار ليس مجلداً');send({type:'result',result:{ok:true}});
    } else if (message.operation === 'browse') {
      let source = String(message.path || '');
      if (process.platform === 'win32' && /^[a-z]:$/i.test(source)) source += '\\';
      const handle = await fs.opendir(path.resolve(source));
      const folders = [];
      for await (const entry of handle) {
        // Reparse points are not followed by scanning; the typed path may still name a share.
        if (entry.isDirectory() && !entry.isSymbolicLink()) folders.push(entry.name);
        if (folders.length > 50000) throw Object.assign(new Error('عدد المجلدات كبير جدًا؛ اختر مسارًا أكثر تحديدًا'), { code: 'TOO_MANY_ENTRIES' });
      }
      folders.sort((a, b) => a.localeCompare(b, 'ar', { numeric: true }));
      send({ type: 'result', result: { data: folders } });
    } else throw new Error('Unknown reader operation');
  } catch (error) {
    send({ type: 'error', message: error.message, code: error.code || 'READ_FAILED' });
  }
});
