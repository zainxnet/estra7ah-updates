'use strict';

const fs = require('node:fs/promises');
const path = require('node:path');
const crypto = require('node:crypto');
const { DatabaseSync } = require('node:sqlite');

const types = {
  mp4: 'video/mp4', m4v: 'video/mp4', mkv: 'video/x-matroska', avi: 'video/x-msvideo',
  mov: 'video/quicktime', wmv: 'video/x-ms-wmv', webm: 'video/webm', flv: 'video/x-flv',
  ts: 'video/mp2t', mts: 'video/mp2t', m2ts: 'video/mp2t', mpg: 'video/mpeg', mpeg: 'video/mpeg', '3gp': 'video/3gpp',
  mp3: 'audio/mpeg', m4a: 'audio/mp4', aac: 'audio/aac', wav: 'audio/wav', flac: 'audio/flac', ogg: 'audio/ogg', opus: 'audio/opus',
  jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', bmp: 'image/bmp',
  pdf: 'application/pdf', epub: 'application/epub+zip', mobi: 'application/x-mobipocket-ebook', djvu: 'image/vnd.djvu',
  exe: 'application/vnd.microsoft.portable-executable', msi: 'application/x-msi', apk: 'application/vnd.android.package-archive',
  zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed', iso: 'application/x-iso9660-image'
};
const seriesTypes = { kids: 'series.kids', sports: 'sports', tv: 'tv', anime: 'anime', deen: 'deen', learn: 'learn', ramadan: 'ramadan' };
const acknowledgments = new Map();
const identities = new Map();
process.on('disconnect', () => process.exit(0));
process.on('message', message => {
  if (message?.type === 'ack') {
    const resolve = acknowledgments.get(message.sequence);
    acknowledgments.delete(message.sequence);
    if (resolve) resolve();
  }
});

function canonical(value) {
  const normalized = path.resolve(value).replace(/\\/g, '/').replace(/\/+$/, '');
  return process.platform === 'win32' ? normalized.toLowerCase() : normalized;
}
function idFor(sectionId, source, kind, remember = true) {
  const id = 'sync-' + crypto.createHash('sha256').update(sectionId + '\0' + canonical(source) + '\0' + kind).digest('hex').slice(0, 40);
  if(remember)identities.set(id, { source, kind });
  return id;
}
function allowed(sectionType, mime, extension) {
  if (sectionType === 'movies' || sectionType.startsWith('serieses') || sectionType.startsWith('vids')) return mime.startsWith('video/');
  if (sectionType.startsWith('album') || sectionType.startsWith('audio')) return mime.startsWith('audio/');
  if (sectionType.startsWith('images')) return mime.startsWith('image/') && extension !== 'djvu';
  if (sectionType.startsWith('books')) return ['pdf', 'epub', 'mobi', 'djvu'].includes(extension);
  if (sectionType.startsWith('apps')) return ['exe', 'msi', 'apk', 'zip', 'rar', '7z', 'iso'].includes(extension);
  return mime.startsWith('video/') || mime.startsWith('audio/');
}
function send(message) {
  return new Promise((resolve, reject) => {
    if (!process.connected) return reject(new Error('Parent disconnected'));
    process.send(message, error => error ? reject(error) : resolve());
  });
}

process.once('message', async configuration => {
  if (!configuration?.source) return;
  let db;
  const progress = { files: 0, discoveredBytes: 0, indexedItems: 0, scannedDirectories: 0, warnings: 0, currentPath: configuration.source };
  try {
    const { section, storePath } = configuration;
    if(section.type==='main'||section.type==='linked')throw Error('هذا قسم تجميعي؛ تزامن أقسام المحتوى الفرعية فقط');
    const memberships=Array.isArray(configuration.sections)&&configuration.sections.length?configuration.sections:[section];
    if(memberships.some(row=>row.type!==section.type)||new Set(memberships.map(row=>String(row.id))).size!==memberships.length)throw Error('Invalid shared scan sections');
    const root = path.resolve(configuration.source);
    db = new DatabaseSync(storePath);
    db.exec('PRAGMA journal_mode=WAL; PRAGMA busy_timeout=5000');
    const upsert = db.prepare('INSERT INTO records (id,payload,updated_at) VALUES (?,?,?) ON CONFLICT(id) DO UPDATE SET payload=excluded.payload,updated_at=excluded.updated_at WHERE records.payload<>excluded.payload');
    const encode=require('./shared-scan-store.cjs').writer(db);
    let batch = [];
    let sequence = 0;
    let lastProgress = 0;
    const containers = new Map();
    const discoveredIds = new Map(memberships.map(row=>[String(row.id),new Set()]));
    const isSeries = section.type.startsWith('serieses');
    const seriesType = seriesTypes[section.type.split('.')[1]] || 'series';

    async function emitProgress(force = false) {
      if (force || Date.now() - lastProgress >= 250) {
        lastProgress = Date.now();
        await send({ type: 'progress', progress });
      }
    }
    async function flush() {
      if (!batch.length) return;
      const records = batch;
      batch = [];
      db.exec('BEGIN IMMEDIATE');
      try {
        const now = Date.now();
        for (const record of records) upsert.run(record.id, encode(record), now);
        db.exec('COMMIT');
      } catch (error) { db.exec('ROLLBACK'); throw error; }
      progress.indexedItems += records.length;
      const number = ++sequence;
      const acknowledgment = new Promise(resolve => acknowledgments.set(number, resolve));
      await send({ type: 'batch', sequence: number, records, progress });
      await acknowledgment;
      lastProgress = Date.now();
    }
    async function addRecord(record) {
      for(const membership of memberships){
        const sectionId=String(membership.id);
        const remap=id=>{if(id===null||id===undefined)return id;const identity=identities.get(id);if(!identity)throw Error('Missing scanner identity');return idFor(sectionId,identity.source,identity.kind,false);};
        const shared={...record,id:remap(record.id),sectionId,inItem:remap(record.inItem),
          files:record.files.map(file=>({...file,id:remap(file.id),itemId:remap(file.itemId)}))};
        discoveredIds.get(sectionId).add(shared.id);
        batch.push(shared);
        if (batch.length >= 50) await flush();
      }
    }
    function baseRecord(source, name, type, inItem, kind, createdAt) {
      return { id: idFor(section.id, source, kind), name, type, inItem, sectionId: section.id,
        path: source, pathSize: 0, createdAt, files: [], content: {}, recordKind:kind==='item'&&types[path.extname(source).slice(1).toLowerCase()]?.startsWith('video/')?'file':'folder' };
    }
    function seriesParent(filePath, createdAt, size) {
      const relative = path.relative(root, filePath).split(path.sep);
      const folders = relative.slice(0, -1);
      const seriesPath = folders.length ? path.join(root, folders[0]) : root;
      const seriesId = idFor(section.id, seriesPath, 'series');
      if (!containers.has(seriesId)) containers.set(seriesId, baseRecord(seriesPath, path.basename(seriesPath) || section.name, seriesType, null, 'series', createdAt));
      const series = containers.get(seriesId);
      series.pathSize += size;
      series.createdAt = Math.min(series.createdAt, createdAt);
      const seasonSegment = folders.length >= 2 ? folders[1] : null;
      const seasonPath = seasonSegment ? path.join(seriesPath, seasonSegment) : seriesPath;
      if(!seasonSegment)return seriesId;
      const seasonKind = 'season';
      const seasonId = idFor(section.id, seasonPath, seasonKind);
      if (!containers.has(seasonId)) containers.set(seasonId,
        baseRecord(seasonPath, seasonSegment, 'season', seriesId, seasonKind, createdAt));
      const season = containers.get(seasonId);
      season.pathSize += size;
      season.createdAt = Math.min(season.createdAt, createdAt);
      return seasonId;
    }
    async function addFolder(directory){
      const segments=path.relative(root,directory).split(path.sep);
      if(!(section.type==='movies'&&segments.length===1||isSeries&&segments.length<=2))return;
      let stat;try{stat=await fs.stat(directory);}catch{progress.warnings++;return;}
      const createdAt=Math.floor((stat.birthtimeMs>0?stat.birthtimeMs:stat.mtimeMs)/1000);
      if(section.type==='movies'){
        const id=idFor(section.id,directory,'movie-folder');
        if(!containers.has(id))containers.set(id,{...baseRecord(directory,path.basename(directory),'movie',null,'movie-folder',createdAt),scanRoot:root});
      }else{
        const parent=path.join(root,segments[0]),seriesId=idFor(section.id,parent,'series');
        if(!containers.has(seriesId))containers.set(seriesId,baseRecord(parent,segments[0],seriesType,null,'series',createdAt));
        if(segments.length===2){const id=idFor(section.id,directory,'season');if(!containers.has(id))containers.set(id,baseRecord(directory,segments[1],'season',seriesId,'season',createdAt));}
      }
    }

    const directories = [root];
    const seen = new Set();
    let successfulRoot = false;
    while (directories.length) {
      const directory = directories.pop();
      const key = canonical(directory);
      if (seen.has(key)) continue;
      seen.add(key);
      progress.currentPath = directory;
      await emitProgress(true);
      let handle;
      try { handle = await fs.opendir(directory); }
      catch (error) {
        if (directory === root) throw error;
        progress.warnings++;
        await emitProgress();
        continue;
      }
      successfulRoot = true;
      progress.scannedDirectories++;
      try {
        for await (const entry of handle) {
          const fullPath = path.join(directory, entry.name);
          if (entry.isSymbolicLink()) { progress.warnings++; continue; }
          if (entry.isDirectory()) { await addFolder(fullPath);directories.push(fullPath); await emitProgress(); continue; }
          if (!entry.isFile()) continue;
          const extension = path.extname(entry.name).slice(1).toLowerCase();
          const mime = types[extension];
          if (!mime || !allowed(section.type, mime, extension)) { await emitProgress(); continue; }
          if((section.type==='movies'||isSeries)&&directory===root)continue;
          progress.currentPath = fullPath;
          let stat;
          try { stat = await fs.stat(fullPath); }
          catch { progress.warnings++; await emitProgress(); continue; }
          if (!stat.isFile()) continue;
          progress.files++;
          progress.discoveredBytes += stat.size;
          const createdAt = Math.floor((stat.birthtimeMs > 0 ? stat.birthtimeMs : stat.mtimeMs) / 1000);
          const parentId = isSeries ? seriesParent(fullPath, createdAt, stat.size) : null;
          const type = isSeries ? 'episod' : section.type === 'movies' ? 'movie' : section.type || 'file';
          const record = baseRecord(fullPath, path.basename(entry.name, path.extname(entry.name)), type, parentId, 'item', createdAt);
          record.pathSize = stat.size;
          record.files.push({ id: idFor(section.id, fullPath, 'file'), filename: entry.name, path: fullPath,
            itemId: record.id, type: { name: extension, mime_type: mime } });
          if(section.type==='movies'){
            const relative=path.relative(root,directory);
            const movieDirectory=relative?path.join(root,relative.split(path.sep)[0]):root;
            const movieId=idFor(section.id,movieDirectory,'movie-folder');
            if(!containers.has(movieId))containers.set(movieId,baseRecord(movieDirectory,path.basename(movieDirectory),'movie',null,'movie-folder',createdAt));
            const movie=containers.get(movieId);movie.scanRoot=root;movie.createdAt=Math.max(movie.createdAt,createdAt);movie.pathSize+=stat.size;movie.files.push(...record.files.map(f=>({...f,itemId:movieId})));
          }else await addRecord(record);
          await emitProgress();
        }
      } catch (error) {
        // Publishing/database failures must stop; unreadable directory entries only mark partial.
        if (!['EACCES', 'EPERM', 'ENOENT', 'ENOTDIR', 'EIO', 'ENETUNREACH', 'ETIMEDOUT'].includes(error.code)) throw error;
        progress.warnings++;
      }
    }
    for (const record of containers.values()) await addRecord(record);
    await flush();
    await emitProgress(true);
    const scopes=[];
    if((section.type==='movies'||isSeries)&&successfulRoot&&!progress.warnings){
      // Recheck accessibility before reconciling; interrupted/partial scans never prune.
      const handle=await fs.opendir(root);await handle.close();
      for(const membership of memberships){
        const sectionId=String(membership.id);
        scopes.push(require('./movie-scan-state.cjs').complete(db,sectionId,root,[...discoveredIds.get(sectionId)]));
      }
    }
    db.close(); db = null;
    await send({ type: 'done', status: successfulRoot && !progress.warnings ? 'completed' : 'partial', progress,scope:scopes[0],scopes });
  } catch (error) {
    if (db) { try { db.close(); } catch {} }
    await send({ type: 'done', status: 'failed', error: error.message, errorCode: error.code || 'SCAN_FAILED', progress }).catch(() => {});
  }
});
