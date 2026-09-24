'use strict';

const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const { fork } = require('node:child_process');
const { DatabaseSync } = require('node:sqlite');

function failure(message, code = 'INVALID_REQUEST') {
  const error = new Error(message);
  error.code = code;
  return error;
}

function checkedPath(value) {
  if (typeof value !== 'string' || !value.trim() || value.length > 32767 || value.includes('\0')) {
    throw failure('المسار غير صالح');
  }
  return value.trim().replace(/\|/g, path.sep);
}

function sectionPaths(section) {
  const source = Array.isArray(section.main_path) ? section.main_path :
    typeof section.main_path === 'string' ? section.main_path.split(',') : [];
  const seen = new Set();
  return source.filter(value => typeof value === 'string' && value.trim())
    .map(checkedPath).filter(value => {
      const key = process.platform === 'win32' ? value.toLowerCase().replace(/\\/g, '/') : value;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
}

module.exports = function createServices(options) {
  const { dir, sections, onItems = () => {}, onMovieScan = () => {} } = options;
  if (!Array.isArray(sections)) throw new TypeError('sections must be an array');
  const idleTimeoutMs = options.idleTimeoutMs ?? 20000;
  const maxPathMs = options.maxPathMs ?? 30 * 60 * 1000;
  const browseTimeoutMs = options.browseTimeoutMs ?? 20000;
  const concurrency = Math.max(1, Math.min(2, options.concurrency ?? 1));
  const storePath = path.join(dir, 'sync-items.sqlite');
  fs.mkdirSync(dir, { recursive: true });
  const initialStore = new DatabaseSync(storePath);
  initialStore.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000; CREATE TABLE IF NOT EXISTS records (id TEXT PRIMARY KEY, payload TEXT NOT NULL, updated_at INTEGER NOT NULL)');
  require('./catalog-revision.cjs').initialize(initialStore);
  initialStore.close();

  let closed = false;
  const jobs = [];
  const queue = [];
  const active = new Map();
  const readers = new Set();

  function ensureOpen() {
    if (closed) throw failure('خدمات المسارات متوقفة', 'CLOSED');
  }

  function publicJob(job) {
    return structuredClone(job);
  }

  function updateJob(job) {
    job.files = job.paths.reduce((n, part) => n + part.files, 0);
    job.discoveredBytes = job.paths.reduce((n, part) => n + part.discoveredBytes, 0);
    job.indexedItems = job.paths.reduce((n, part) => n + part.indexedItems, 0);
    job.scannedDirectories = job.paths.reduce((n, part) => n + part.scannedDirectories, 0);
    job.warnings = job.paths.reduce((n, part) => n + part.warnings, 0);
    job.updatedAt = new Date().toISOString();
    if (job.paths.some(part => part.status === 'running')) job.status = 'running';
    else if (job.paths.some(part => part.status === 'queued')) job.status = 'queued';
    else {
      const statuses = job.paths.map(part => part.status);
      if (job.cancelRequested) job.status = 'cancelled';
      else if (statuses.every(status => status === 'completed')) job.status = 'completed';
      else if (statuses.every(status => status === 'failed')) job.status = 'failed';
      else job.status = 'partial';
      job.finishedAt = new Date().toISOString();
    }
  }

  function updateProgress(job, part, progress) {
    for (const key of ['files', 'discoveredBytes', 'indexedItems', 'scannedDirectories', 'warnings']) {
      if (Number.isFinite(progress?.[key]) && progress[key] >= 0) part[key] = progress[key];
    }
    if (progress?.currentPath) part.currentPath = String(progress.currentPath);
    updateJob(job);
  }

  function forkWorker(filename) {
    return fork(path.join(__dirname, filename), [], {
      execPath: process.execPath,
      execArgv: [],
      windowsHide: true,
      stdio: ['ignore', 'ignore', 'pipe', 'ipc']
    });
  }

  function runReader(operation, value) {
    ensureOpen();
    if (readers.size >= 4) return Promise.reject(failure('طلبات تصفح كثيرة؛ حاول بعد لحظة', 'BUSY'));
    return new Promise((resolve, reject) => {
      const child = forkWorker('browse-worker.cjs');
      let settled = false;
      const partialDrives = [];
      const entry = { child, abort: () => finish(failure('أوقفت خدمات المسارات', 'CANCELLED')) };
      readers.add(entry);
      const timer = setTimeout(() => {
        // A disconnected drive cannot hold up all available local drives indefinitely.
        if (operation === 'drives' && partialDrives.length) finish(null, partialDrives);
        else finish(failure('انتهت مهلة قراءة المسار؛ قد يكون غير متصل', 'TIMEOUT'));
      }, browseTimeoutMs);
      function finish(error, value) {
        if (settled) return;
        settled = true;
        clearTimeout(timer);
        readers.delete(entry);
        if (child.connected) child.disconnect();
        child.kill();
        error ? reject(error) : resolve(value);
      }
      child.on('message', message => {
        if (message?.type === 'drive') partialDrives.push(message.drive);
        else if (message?.type === 'result') finish(null, message.result);
        else if (message?.type === 'error') finish(failure(message.message, message.code));
      });
      child.on('error', error => finish(error));
      child.on('exit', () => { if (!settled) finish(failure('توقف عامل قراءة المسار', 'WORKER_EXIT')); });
      child.stderr.on('data', () => {});
      child.send({ operation, path: value });
    });
  }

  function pump() {
    if (closed) return;
    while (active.size < concurrency && queue.length) {
      const task = queue.shift();
      if (task.part.status !== 'queued' || task.job.cancelRequested) continue;
      runScan(task);
    }
  }

  function runScan({ job, part, section }) {
    const child = forkWorker('scan-worker.cjs');
    const entry = { child, job, part, stop: null };
    active.set(child.pid ?? part.id, entry);
    const activeKey = child.pid ?? part.id;
    part.status = 'running';
    part.startedAt = new Date().toISOString();
    job.startedAt ||= part.startedAt;
    updateJob(job);
    let lastActivity = Date.now();
    const started = lastActivity;
    let finished = false;
    let published = Promise.resolve();
    let stderr = '';
    const timer = setInterval(() => {
      if (Date.now() - lastActivity >= idleTimeoutMs) {
        finish('failed', 'لم يستجب المسار خلال المهلة؛ لم تُحذف البيانات السابقة', 'TIMEOUT');
      } else if (Date.now() - started >= maxPathMs) {
        finish('partial', 'بلغ المسح حد الوقت؛ النتائج المكتشفة محفوظة ويمكن إعادة المزامنة', 'MAX_DURATION');
      }
    }, Math.max(25, Math.min(1000, idleTimeoutMs / 4)));

    function finish(status, error, errorCode) {
      if (finished) return;
      finished = true;
      clearInterval(timer);
      part.status = status;
      part.finishedAt = new Date().toISOString();
      if (error) { part.error = error; part.errorCode = errorCode; }
      updateJob(job);
      if (child.connected) child.disconnect();
      child.kill();
      // Wait for actual process exit before starting another scanner.
    }
    entry.stop = () => finish('cancelled', 'ألغيت المزامنة؛ النتائج المحفوظة باقية', 'CANCELLED');

    child.on('message', message => {
      if (finished) return;
      lastActivity = Date.now();
      if (message?.progress) updateProgress(job, part, message.progress);
      if (message?.type === 'batch') {
        published = published.then(async () => {
          if (finished) return;
          if (!Array.isArray(message.records) || message.records.length > 50) throw failure('دفعة مزامنة غير صالحة', 'BAD_BATCH');
          await onItems(message.records);
          if (!finished && child.connected) {
            lastActivity = Date.now();
            child.send({ type: 'ack', sequence: message.sequence });
          }
        }).catch(error => finish('failed', `تعذر تحديث الفهرس: ${error.message}`, 'PUBLISH_FAILED'));
      } else if (message?.type === 'done') {
        published.then(async () => {
          if(finished)return;
          if(message.status==='completed'&&message.scope&&(section.type==='movies'||section.type.startsWith('serieses'))){
            if(message.scope.sectionId!==String(section.id)||path.resolve(message.scope.root)!==path.resolve(part.path))throw failure('نطاق مزامنة غير صالح','BAD_SCOPE');
            await onMovieScan(message.scope);
          }
          finish(message.status || 'completed', message.error, message.errorCode);
        }).catch(error=>finish('failed','تعذر تطبيق نتيجة المزامنة: '+error.message,'RECONCILE_FAILED'));
      }
    });
    child.stderr.on('data', buffer => { stderr = (stderr + buffer.toString()).slice(-2000); });
    child.on('error', error => finish('failed', error.message, error.code || 'WORKER_ERROR'));
    child.on('exit', code => {
      if (!finished) finish('failed', `توقف عامل المزامنة (${code ?? 'signal'})`, 'WORKER_EXIT');
      active.delete(activeKey);
      setImmediate(pump);
    });
    child.send({ source: part.path, section: { id: String(section.id), name: String(section.name || ''), type: String(section.type || '') }, storePath });
  }

  function selectedSections(sectionId) {
    if(sectionId===null||sectionId===undefined||sectionId==='')return sections;
    const byId=new Map(sections.map(s=>[String(s.id),s]));if(!byId.has(String(sectionId)))throw failure('القسم غير موجود','NOT_FOUND');
    const ids=new Set(),queue=[String(sectionId)];while(queue.length){const id=queue.shift();if(ids.has(id))continue;const current=byId.get(id);if(!current)continue;ids.add(id);if(current.type==='linked'&&current.linkedId!=null)queue.push(String(current.linkedId));for(const child of sections)if(child.in_section!=null&&String(child.in_section)===id)queue.push(String(child.id));}
    return sections.filter(s=>ids.has(String(s.id)));
  }

  function startSync(sectionId = null) {
    ensureOpen();
    const sources = selectedSections(sectionId)
      .filter(section => !['linked','main'].includes(section.type))
      .flatMap(section => sectionPaths(section).map(source => ({ section, source })));
    if (!sources.length) throw failure('لا توجد مسارات محفوظة لهذا القسم', 'NO_PATHS');
    if (jobs.filter(job => ['queued', 'running'].includes(job.status)).length >= 10) throw failure('توجد مهام مزامنة كثيرة قيد الانتظار', 'BUSY');
    const jobId = crypto.randomUUID();
    const now = new Date().toISOString();
    const job = {
      id: jobId, jobId, sectionId, status: 'queued', createdAt: now, updatedAt: now,
      startedAt: null, finishedAt: null, totalPaths: sources.length,
      files: 0, discoveredBytes: 0, indexedItems: 0, scannedDirectories: 0, warnings: 0,
      paths: sources.map(({ section, source }) => ({
        id: crypto.randomUUID(), sectionId: String(section.id), path: source, status: 'queued',
        files: 0, discoveredBytes: 0, indexedItems: 0, scannedDirectories: 0, warnings: 0
      }))
    };
    jobs.push(job);
    while (jobs.length > 100 && !['queued', 'running'].includes(jobs[0].status)) jobs.shift();
    sources.forEach(({ section }, index) => queue.push({ job, part: job.paths[index], section }));
    setImmediate(pump);
    return { msg: 'ok', jobId };
  }

  function cancelSync(jobId) {
    const job = jobs.find(job => job.id === jobId);
    if (!job) throw failure('مهمة المزامنة غير موجودة', 'NOT_FOUND');
    if (!['queued', 'running'].includes(job.status)) return { msg: 'ok', jobId, status: job.status };
    job.cancelRequested = true;
    for (const part of job.paths) if (part.status === 'queued') part.status = 'cancelled';
    for (const entry of active.values()) if (entry.job === job) entry.stop();
    updateJob(job);
    return { msg: 'ok', jobId, status: job.status };
  }

  function getStoredItems() {
    const db = new DatabaseSync(storePath, { readOnly: true });
    try { return db.prepare('SELECT payload FROM records ORDER BY rowid').all().map(row => JSON.parse(row.payload)); }
    finally { db.close(); }
  }

  async function close() {
    if (closed) return;
    closed = true;
    for (const job of jobs) if (['queued', 'running'].includes(job.status)) cancelSync(job.id);
    for (const entry of [...readers]) entry.abort();
    const exits = [...active.values()].map(({ child }) => new Promise(resolve => {
      if (child.exitCode !== null || child.signalCode !== null) return resolve();
      const timer = setTimeout(resolve, 3000);
      child.once('exit', () => { clearTimeout(timer); resolve(); });
    }));
    await Promise.all(exits);
  }

  return {
    checkPath: value => runReader('check', checkedPath(value)),
    drives: () => runReader('drives'),
    browse: value => runReader('browse', checkedPath(value)),
    startSync,
    syncJobs: () => jobs.map(publicJob),
    cancelSync,
    getStoredItems,
    movieScans: () => {const db=new DatabaseSync(storePath,{readOnly:true});try{return require('./movie-scan-state.cjs').pending(db);}finally{db.close();}},
    movieScanRecords: scope => {const db=new DatabaseSync(storePath,{readOnly:true});try{return require('./movie-scan-state.cjs').records(db,scope);}finally{db.close();}},
    close
  };
};
