'use strict';
const path = require('node:path');
const { fork } = require('node:child_process');
const imageExt = /\.(?:jpe?g|png|webp|gif|bmp|ico)$/i;
const preferred = ['folder.ico','icon.ico','f_poster.ico','f_poster.jpg','f_poster.png','poster.jpg','poster.png','cover.jpg','cover.png','folder.jpg','folder.png'];
function candidatesFor(item, getItem) {
  const output = [], seen = new Set(), visited = new Set();
  const add = value => { if (typeof value !== 'string' || !path.isAbsolute(value) || !imageExt.test(value) || /[\x00-\x1f]/.test(value) || value.length > 32767 || /^\\\\[?.]\\/.test(value)) return; const key = value.toLowerCase(); if (!seen.has(key)) { seen.add(key); output.push(value); } };
  for (let depth = 0; item && depth < 8 && !visited.has(item.id); depth++) {
    visited.add(item.id);
    const files = (item.files || []).filter(file => imageExt.test(file.path || '')).slice().sort((a,b) => {
      const rank = file => { const name = path.basename(file.path).toLowerCase(), at = preferred.indexOf(name); return at >= 0 ? at : name.endsWith('.ico') ? -1 : 50; };
      return rank(a) - rank(b);
    });
    for (const file of files) if (/\.ico$/i.test(file.path)) add(file.path);
    if (item.path && path.isAbsolute(item.path)) {
      const directory = (item.files || []).some(file => file.path?.toLowerCase() === item.path.toLowerCase()) ? path.dirname(item.path) : item.path;
      for (const name of preferred) add(path.join(directory, name));
    }
    for (const file of files) add(file.path);
    item = item.inItem && typeof getItem === 'function' ? getItem(item.inItem) : null;
  }
  return output.slice(0, 96);
}
module.exports = function createArtwork({ getItem, timeoutMs = 5000, concurrency = 8, idleTimeoutMs = 15000, maxCacheBytes = 32 * 1024 * 1024, workerPath = path.join(__dirname, 'artwork-worker.cjs') } = {}) {
  const cache = new Map(), pending = new Map(), queue = [], workers = new Set();
  let cacheBytes = 0, closed = false;
  function remove(key) { const entry = cache.get(key); if (entry) { cacheBytes -= entry.value?.bytes.length || 0; cache.delete(key); } }
  function remember(key, value) {
    remove(key);
    cache.set(key, { value, until: Date.now() + (value ? 300000 : 10000) }); cacheBytes += value?.bytes.length || 0;
    while (cacheBytes > maxCacheBytes || cache.size > 1000) remove(cache.keys().next().value);
  }
  function removeWorker(worker) {
    if (!workers.delete(worker)) return;
    clearTimeout(worker.timer); clearTimeout(worker.idleTimer); worker.removed = true;
    worker.child.kill();
  }
  function finish(worker, value, discard = false) {
    if (worker.removed || !worker.job) return;
    const job = worker.job; worker.job = null; clearTimeout(worker.timer);
    if (discard) removeWorker(worker);
    else {
      // Keep the bounded pool warm between poster requests without keeping the
      // parent alive when it has no other work. Idle processes expire shortly.
      worker.child.unref(); worker.child.channel?.unref();
      worker.idleTimer = setTimeout(() => removeWorker(worker), idleTimeoutMs); worker.idleTimer.unref();
    }
    pending.delete(job.key); if (!closed) remember(job.key, value);
    job.resolve(value); pump();
  }
  function failed(worker) {
    if (worker.removed) return;
    if (worker.job) finish(worker, null, true);
    else { removeWorker(worker); pump(); }
  }
  function createWorker() {
    const child = fork(workerPath, [], { execArgv: [], windowsHide: true, stdio: ['ignore','ignore','ignore','ipc'], serialization: 'advanced' });
    const worker = { child, job: null, timer: null, idleTimer: null, removed: false }; workers.add(worker);
    child.on('message', result => finish(worker, result && Buffer.isBuffer(result.bytes) ? result : null));
    child.once('error', () => failed(worker)); child.once('exit', () => failed(worker));
    return worker;
  }
  function pump() {
    while (!closed && queue.length) {
      let worker = [...workers].find(entry => !entry.job);
      if (!worker && workers.size >= concurrency) return;
      if (!worker) {
        try { worker = createWorker(); }
        catch { const job = queue.shift(); pending.delete(job.key); remember(job.key, null); job.resolve(null); continue; }
      }
      const job = queue.shift(); worker.job = job; clearTimeout(worker.idleTimer);
      worker.child.ref(); worker.child.channel?.ref();
      worker.timer = setTimeout(() => failed(worker), timeoutMs);
      try { worker.child.send({ candidates: job.candidates }, error => { if (error) failed(worker); }); }
      catch { failed(worker); }
    }
  }
  return {
    peek(item) {
      if (!item) return null;
      const entry = cache.get(JSON.stringify(candidatesFor(item,getItem)));
      return entry && entry.until > Date.now() ? entry.value : null;
    },
    status(item) {
      if (!item) return 'missing';
      const key=JSON.stringify(candidatesFor(item,getItem)),entry=cache.get(key);
      if(entry&&entry.until>Date.now())return entry.value?'ready':'missing';
      return pending.has(key)?'pending':'unknown';
    },
    invalidate(item) { if(item)remove(JSON.stringify(candidatesFor(item,getItem))); },
    read(item) {
      if (closed || !item) return Promise.resolve(null);
      const candidates = candidatesFor(item, getItem), key = JSON.stringify(candidates);
      if (!candidates.length) return Promise.resolve(null);
      const entry = cache.get(key);
      if (entry && entry.until > Date.now()) { cache.delete(key); cache.set(key, entry); return Promise.resolve(entry.value); }
      if (entry) remove(key);
      if (pending.has(key)) return pending.get(key);
      if (queue.length >= 100) return Promise.resolve(null);
      const result = new Promise(resolve => queue.push({ key, candidates, resolve }));
      pending.set(key, result); pump(); return result;
    },
    close() { closed = true; for (const worker of [...workers]) { if(worker.job)finish(worker,null,true);else removeWorker(worker); } for (const job of queue.splice(0)) job.resolve(null); pending.clear(); cache.clear(); cacheBytes = 0; }
  };
};
module.exports.candidatesFor = candidatesFor;
