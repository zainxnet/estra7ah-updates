'use strict';
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');

module.exports = function createOperations({ dir, items, sections, services = {}, readEvents, clearEvents, metadata, recordEvent=()=>{} }) {
  if (!(items instanceof Map) && !Array.isArray(items)) throw new TypeError('items must be a Map or array');
  if (!Array.isArray(sections)) throw new TypeError('sections must be an array');
  fs.mkdirSync(dir, { recursive: true });
  const stateFile = path.join(dir, 'operations-stats.json');
  const numeric = value => Number.isFinite(Number(value)) && Number(value) >= 0 ? Number(value) : 0;
  const raw = fs.existsSync(stateFile) ? JSON.parse(fs.readFileSync(stateFile, 'utf8')) : {};
  const increments = name => new Map(Object.entries(raw[name] || {}).map(([id, value]) => [id, numeric(value)]));
  const itemViews = increments('itemViews'), sectionViews = increments('sectionViews');
  let bands = numeric(raw.bands), closed = false, dirty = false, storageError = null;
  const startedAt = new Date().toISOString();
  const visitors = new Map();
  const samples = [];
  let pendingBytes = 0, lastSample = Date.now(), cached = null, cacheAt = 0, cachedCount = -1;
  const rows = () => items.values();
  const getItem = id => items instanceof Map ? items.get(id) : items.find(item => String(item.id) === id);
  const count = () => items instanceof Map ? items.size : items.length;
  const adminReads = new Set(['getViews', 'getBands', 'getUsersDevs', 'getTheFor', 'getOnlineUsers', 'getBandwidth', 'getAllEvents', 'proccess']);
  const adminActions = new Set(['removeAllEvents', 'runProccess']);

  function pruneVisitors(now) {
    for (const [address, visitor] of visitors) if (now - visitor.lastSeen >= 300000) visitors.delete(address);
  }
  function sample() {
    const now = Date.now();
    if (now <= lastSample) return;
    samples.push({ x: now, y: pendingBytes * 8 / ((now - lastSample) / 1000) / 1000000 });
    pendingBytes = 0; lastSample = now;
    while (samples.length && (samples.length > 120 || now - samples[0].x > 120000)) samples.shift();
    pruneVisitors(now);
  }
  function flush() {
    if (!dirty) return;
    const temporary = stateFile + '.' + crypto.randomUUID() + '.tmp';
    fs.writeFileSync(temporary, JSON.stringify({ version: 1, bands, itemViews: Object.fromEntries(itemViews), sectionViews: Object.fromEntries(sectionViews), updatedAt: new Date().toISOString() }));
    fs.renameSync(temporary, stateFile);
    dirty = false; storageError = null;
  }
  const timer = setInterval(sample, 1000);
  const saveTimer = setInterval(() => { try { flush(); } catch (error) { storageError = error.message; } }, 10000);
  timer.unref(); saveTimer.unref();

  function device(userAgent) {
    const ua = String(userAgent || '').slice(0, 1000);
    if (/Kodi/i.test(ua)) return 'kodi';
    if (/iPhone/i.test(ua)) return 'iPhone';
    if (/iPad/i.test(ua)) return 'iPad';
    if (/iPod/i.test(ua)) return 'iPod';
    if (/Windows Phone/i.test(ua)) return 'Windows_Phone';
    if (/BlackBerry|BB10/i.test(ua)) return 'BlackBerry';
    if (/webOS|Web0S/i.test(ua)) return 'webOS';
    if (/Android/i.test(ua)) {
      if (/Smart.?TV|Android TV|BRAVIA|AFT[\w]*|TV;/i.test(ua)) return 'smart-tv-android';
      if (/HUAWEI|HONOR/i.test(ua)) return 'huawei-android';
      if (/Samsung|SM-[A-Z0-9]/i.test(ua)) return 'samsung';
      return 'android';
    }
    if (/Windows/i.test(ua)) return 'win';
    return 'unknown';
  }
  function trackRequest(req) {
    if (closed || req.method !== 'GET') return;
    let pathname;
    try { pathname = decodeURIComponent(new URL(req.url, 'http://localhost').pathname); } catch { return; }
    if (pathname.startsWith('/admin') || pathname.startsWith('/zain/') || pathname.startsWith('/__') || pathname.startsWith('/static/') || path.extname(pathname)) return;
    let address = req.socket?.remoteAddress;
    if (!address) return;
    address = address.replace(/^::ffff:/i, '');
    const now = Date.now();
    pruneVisitors(now);
    let visitor = visitors.get(address);
    if (!visitor) {
      if (visitors.size >= 10000) visitors.delete(visitors.keys().next().value);
      visitor = { lastSeen: now, device: device(req.headers?.['user-agent']), lastViews: new Map() };
      visitors.set(address, visitor);
    }
    visitor.lastSeen = now;
    const match = /^\/api\/(getItemData|getSecType)\/([^/]+)\/?$/.exec(pathname);
    if (!match) return;
    const isItem = match[1] === 'getItemData', id = match[2];
    if (isItem ? !getItem(id) : !sections.some(section => String(section.id) === id)) return;
    const key = match[1] + '/' + id;
    const previous = visitor.lastViews.get(key);
    if (previous !== undefined && now - previous < 30000) return;
    for (const [name, at] of visitor.lastViews) if (now - at >= 30000) visitor.lastViews.delete(name);
    if (visitor.lastViews.size >= 1000) visitor.lastViews.delete(visitor.lastViews.keys().next().value);
    visitor.lastViews.set(key, now);
    const target = isItem ? itemViews : sectionViews;
    target.set(id, numeric(target.get(id)) + 1);
    recordEvent((isItem?'تصفح العنصر: ':'دخول القسم: ')+(isItem?getItem(id).name:sections.find(s=>String(s.id)===id).name),'success','users');
    dirty = true; cached = null;
  }
  function trackTransfer(bytes) {
    if (closed || !Number.isSafeInteger(bytes) || bytes <= 0) return;
    bands = Math.min(Number.MAX_SAFE_INTEGER, bands + bytes);
    pendingBytes += bytes;
    dirty = true;
  }
  function ranking() {
    const now = Date.now();
    if (cached && now - cacheAt < 5000 && count() === cachedCount) return cached;
    const result = { views: 0, sections_less: [], sections_more: [], items_less: [], items_more: [] };
    const insert = (array, value, compare) => {
      if (array.length >= 5 && compare(value, array[array.length - 1]) >= 0) return;
      array.push(value); array.sort(compare); if (array.length > 5) array.pop();
    };
    const least = (a, b) => a.views - b.views || String(a.id).localeCompare(String(b.id));
    const most = (a, b) => b.views - a.views || String(a.id).localeCompare(String(b.id));
    const oldest = (a, b) => a.createdAt - b.createdAt || String(a.id).localeCompare(String(b.id));
    for (const item of rows()) {
      const views = numeric(item.views) + numeric(itemViews.get(String(item.id)));
      result.views += views;
      if (item.inItem && item.inItem !== 'null') continue;
      const row = { id: item.id, name: item.name || '', views, createdAt: numeric(item.createdAt) };
      if (views === 0) insert(result.items_less, row, oldest);
      if (views > 0) insert(result.items_more, row, most);
    }
    for (const section of sections) {
      const row = { id: section.id, name: section.name || '', views: numeric(section.views) + numeric(sectionViews.get(String(section.id))) };
      insert(result.sections_less, row, least); insert(result.sections_more, row, most);
    }
    cached = result; cacheAt = now; cachedCount = count();
    return result;
  }
  async function admin(action, args = [], body = {}, method = 'GET') {
    if (!adminReads.has(action) && !adminActions.has(action)) return null;
    if (adminReads.has(action) && method !== 'GET') return { status: 405, body: { msg: 'error', error: 'هذه الخدمة للقراءة' } };
    if (adminActions.has(action) && !['GET', 'POST'].includes(method)) return { status: 405, body: { msg: 'error' } };
    if (action === 'getViews') return { body: { views: ranking().views } };
    if (action === 'getBands') return { body: { bands, source: 'local-media-transfer', startedAt, storageError } };
    if (action === 'getBandwidth') return { body: { samples: structuredClone(samples), bands, unit: 'Mbps', source: 'local-media-transfer', startedAt } };
    if (action === 'getTheFor') { const { views, ...rank } = ranking(); return { body: structuredClone(rank) }; }
    if (action === 'getOnlineUsers' || action === 'getUsersDevs') {
      pruneVisitors(Date.now());
      if (action === 'getOnlineUsers') return { body: { users: visitors.size, windowSeconds: 300, source: 'recent-client-addresses' } };
      const counts = Object.fromEntries(['huawei-android', 'smart-tv-android', 'kodi', 'samsung', 'android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows_Phone', 'win', 'unknown'].map(key => [key, 0]));
      for (const visitor of visitors.values()) counts[visitor.device]++;
      return { body: counts };
    }
    if (action === 'getAllEvents') {
      if (typeof readEvents !== 'function') return { status: 501, body: { msg: 'error', error: 'خدمة الأحداث غير متصلة' } };
      return { body: structuredClone(await readEvents()).sort((a, b) => numeric(b.createdAt) - numeric(a.createdAt)) };
    }
    if (action === 'removeAllEvents') {
      if (typeof clearEvents !== 'function' || typeof readEvents !== 'function') return { status: 501, body: { msg: 'error', error: 'حذف الأحداث غير متصل' } };
      await clearEvents();
      if ((await readEvents()).length !== 0) return { status: 500, body: { msg: 'error', error: 'لم تُمسح قائمة الأحداث بالكامل' } };
      return { body: { msg: 'ok' } };
    }
    if (action === 'proccess') {
      const jobs = typeof services.syncJobs === 'function' ? await services.syncJobs() : [];
      const metadataJobs=metadata?.jobs()||[], activeMetadata=metadataJobs.filter(j=>['queued','running'].includes(j.status));
      return { body: { images: 0, items: activeMetadata.reduce((n,j)=>n+j.total-j.processed,0), stopedImages: true, stopedItems: !activeMetadata.length, jobs, metadataJobs,
        runningJobs: jobs.filter(job => job.status === 'running').length,
        queuedJobs: jobs.filter(job => job.status === 'queued').length,
        workersUnavailable: ['images'], source: 'local-sync',
        note: 'مهام فهرسة الملفات وجلب بيانات المحتوى. استخراج الصور لم يكتمل ربطه بعد.' } };
    }
    return { status: 501, body: { msg: 'error', error: 'عامل الصور أو بيانات الإنترنت غير متصل؛ لم يتم تشغيل أي عملية' } };
  }
  async function close() {
    if (closed) return;
    closed = true;
    clearInterval(timer); clearInterval(saveTimer);
    sample(); flush(); visitors.clear();
  }
  return { adminReads, adminActions, admin, trackRequest, trackTransfer, close };
};
