'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto'), os = require('os');
const release=require('./release.json');
const base = path.resolve(__dirname, '..'), web = path.join(base, 'interface'), data = path.join(base, 'data');
for (const name of ['data', 'logs']) fs.mkdirSync(path.join(base, name), { recursive: true });
const startupStatusFile=path.join(data,'startup-status.json');let lastStartupStatusAt=0;
function reportStartup(status,force=false){const now=Date.now();if(!force&&now-lastStartupStatusAt<1000)return;lastStartupStatusAt=now;try{const temp=startupStatusFile+'.tmp';fs.writeFileSync(temp,JSON.stringify({...status,updatedAt:new Date().toISOString()}));fs.renameSync(temp,startupStatusFile);}catch{}}
function reportFatal(error){const message=String(error&&error.message||error);reportStartup({state:'failed',phase:'failed',message:'تعذر تشغيل الخادم: '+message,error:message},true);try{const log=path.join(base,'logs','startup-errors.log');if(fs.existsSync(log)&&fs.statSync(log).size>1024*1024)fs.renameSync(log,log+'.previous');fs.appendFileSync(log,new Date().toISOString()+' '+String(error&&error.stack||error)+'\n');}catch{}}
process.on('uncaughtExceptionMonitor',reportFatal);
reportStartup({state:'starting',phase:'restore',message:'جار تطبيق النسخة الاحتياطية إن وجدت'},true);
const catalogStore=require('./catalog-store.cjs')(base);
require('./backups.cjs').applyPending(base,progress=>reportStartup({state:'running',...progress},true));
reportStartup({state:'starting',phase:'catalog-open',message:'جار فتح قاعدة الاستراحة'},true);
const configFile = path.join(data, 'server-config.json');
const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : { port: 80, bind: '0.0.0.0' };
const port = config.port;
let gemini;
let ready = false, startupError = '', startupMessage='جار فتح قاعدة الاستراحة',startupInfo={}, sections = [], settings = {}, admin, services, content, operations, artwork, scanArtwork, uiCompat, speed, itemAdmin, backups, broadcast, metadata, folderIcons, posters, actorImages, exclusiveArtwork;
const responseCache=require('./browse-cache.cjs')();let catalogRevision=0,topCacheRevision=-1,topCache=[],monitorCache=null,monitorCacheAt=0;const normalizedNames=new WeakMap();
let items = new Map(), children = new Map(), sectionItems = new Map(), files = new Map();
let byMediaPath = new Map(), scannedAliases = new Map();
let byFilePath = new Map(), sharedCatalog;
const mediaKey = x => x.path ? String(x.sectionId) + '|' + String(x.type) + '|' + path.normalize(x.path).toLowerCase().replace(/[\\/]+$/, '') : '';
const catalogSnapshot=()=>({items,children,sectionItems,files,byMediaPath,byFilePath,scannedAliases});
const controlToken = crypto.randomBytes(32).toString('hex');
const log = fs.createWriteStream(path.join(base, 'logs/requests.log'), { flags: 'a' });
const types = { ".webp": "image/webp", '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.vtt': 'text/vtt; charset=utf-8', '.pdf': 'application/pdf' };
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const safeFile = f => pick(f, ['id', 'filename', 'itemId', 'type']);
const publicCatalog=require('./public-catalog.cjs'),catalogItems=require('./catalog-items.cjs');
const safeItem = item => {const x=sharedCatalog?.view(item)||item;return x ? { ...pick(x, ['id', 'name', 'type', 'inItem', 'views', 'downloads', 'sectionId', 'createdAt', 'content', 'pathSize']),type:publicCatalog.publicType(x.type), files: (x.files || []).map(safeFile) } : null;};
const detailItem = x => x ? {...safeItem(x),content:publicCatalog.detailContent((sharedCatalog?.view(x)||x).content), ...(settings.estra7ah_type === 'caffe' ? {path:'/zain/folder/'+encodeURIComponent(x.id)} : {})} : null;
const safeSection = x => x ? pick(x, ['id', 'name', 'views', 'in_section', 'type', 'downloadActive', 'order', 'linkedId', 'is_hidden', 'NumOfEps', 'createdAt', 'updatedAt', 'isVIP', 'star']) : null;
function monitorSnapshot() {
  const now=Date.now();if(monitorCache&&now-monitorCacheAt<3000)return monitorCache;
  const jobs=services?.syncJobs?.()||[],active=jobs.find(job=>job.status==='running')||jobs.find(job=>job.status==='queued'),metadataJobs=metadata?.jobs?.()||[],activeMetadata=metadataJobs.find(job=>job.status==='running')||metadataJobs.find(job=>job.status==='queued');
  let disk=null;try{const stat=fs.statfsSync(data),free=Number(stat.bavail)*Number(stat.bsize),total=Number(stat.blocks)*Number(stat.bsize);disk={freeBytes:free,totalBytes:total,freePercent:total?Math.floor(free*100/total):null,warning:free<5*1024**3||(total&&free/total<0.1)};}catch{}
  const sync=active?{running:jobs.filter(job=>job.status==='running').length,queued:jobs.filter(job=>job.status==='queued').length,section:(sections.find(section=>String(section.id)===String(active.sectionId))||{}).name||'',status:active.status,files:Number(active.files)||0,directories:Number(active.scannedDirectories)||0,warnings:Number(active.warnings)||0}: {running:0,queued:jobs.filter(job=>job.status==='queued').length};
  monitorCache={sync,icons:folderIcons?.status()||null,metadata:activeMetadata?{running:metadataJobs.filter(job=>job.status==='running').length,queued:metadataJobs.filter(job=>job.status==='queued').length,processed:Number(activeMetadata.processed)||0,total:Number(activeMetadata.total)||0,status:activeMetadata.status}: {running:0,queued:metadataJobs.filter(job=>job.status==='queued').length},backup:backups?.monitor?.()||null,network:{...(operations?.monitor?.()||{}),...(speed?.monitor?.()||{})},disk,warnings:admin?.monitor?.()||[],sampledAt:now};monitorCacheAt=now;return monitorCache;
}function respond(res, body, status = 200) { if (!res.destroyed) res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify(body)); }
function normalize(value) { return String(value || '').trim().replace(/\s+/g, ' ').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ؤئ]/g, 'ء').replace(/ى/g, 'ي').toLowerCase(); }
function list(rows, start, count) { const at = Math.max(0, Number(start) || 0); return rows.slice(at, at + Math.min(200, Math.max(1, Number(count) || 100))); }
function updateItems(rows) {
  catalogRevision++;
  for (const input of rows) {
    const x=catalogItems.display(sharedCatalog?.project(input)||input);
    if (!x.id) continue;
    const old = items.get(x.id);
    if (old) { if (old.inItem) children.get(old.inItem)?.delete(old.id); else sectionItems.get(old.sectionId)?.delete(old.id); for (const f of old.files || []) if(files.get(f.id)?.itemId===old.id)files.delete(f.id); }
    items.set(x.id, x);catalogStore.markDirty?.(x.id);
    sharedCatalog?.add(x);
    if (mediaKey(x)) byMediaPath.set(mediaKey(x), x.id);
    const map = x.inItem ? children : sectionItems, key = x.inItem || x.sectionId;
    if (!map.has(key)) map.set(key, new Set()); map.get(key).add(x.id);
    for (const f of x.files || []) if (f.id && f.path) { files.set(f.id, f); byFilePath.set(String(x.sectionId) + '|' + path.normalize(f.path).toLowerCase(), x.id); }
  }
}
function removeCatalogItem(id) {
 catalogRevision++;
 const item=items.get(id);if(!item)return;
 if(byMediaPath.get(mediaKey(item))===id)byMediaPath.delete(mediaKey(item));
 if(item.inItem)children.get(item.inItem)?.delete(id);else sectionItems.get(item.sectionId)?.delete(id);
 for(const file of item.files||[]){if(files.get(file.id)?.itemId===id)files.delete(file.id);const key=String(item.sectionId)+'|'+path.normalize(file.path||'').toLowerCase();if(byFilePath.get(key)===id)byFilePath.delete(key);}
 items.delete(id);catalogStore.markDirty?.(id);children.delete(id);sharedCatalog?.remove(id);
}
function linkScanParents(rows) {
  // A stored series can be absent while its legacy seasons still name it.
  // Infer the parent alias before processing rows, independent of scan row order.
  const parents=new Map(rows.filter(row=>row.recordKind==='folder'&&!row.inItem).map(row=>[row.id,row])),parentAliases=new Map();
  for(const record of rows){
    if(record.type!=='season'||!parents.has(record.inItem))continue;
    const old=items.get(scannedAliases.get(record.id)||record.id)||items.get(byMediaPath.get(mediaKey(record)));
    if(!old?.inItem||mediaKey(old)!==mediaKey(record))continue;
    const parent=parents.get(record.inItem),previous=items.get(old.inItem);
    if(previous&&mediaKey(previous)!==mediaKey(parent))continue;
    if(!parentAliases.has(parent.id))parentAliases.set(parent.id,new Set());
    parentAliases.get(parent.id).add(old.inItem);
  }
  for(const [parent,aliases]of parentAliases)if(aliases.size===1){
    const alias=[...aliases][0],current=scannedAliases.get(parent);
    if(!current||current===parent||current===alias)scannedAliases.set(parent,alias);
  }
}
function mergeScanned(rows, automatic=true) {
  const observed=[];linkScanParents(rows);
  for (const record of rows) {
    const fileOwner = (record.files || []).map(f => byFilePath.get(String(record.sectionId) + '|' + path.normalize(f.path || '').toLowerCase())).find(Boolean);
    // Stable scanner IDs take precedence: virtual seasons can share one folder.
    let old = items.get(scannedAliases.get(record.id) || record.id);
    if(record.scanRoot&&old&&mediaKey(old)!==mediaKey(record)){old=null;scannedAliases.delete(record.id);}
    if(record.recordKind==='folder'&&old&&catalogItems.videoFile(old))old=null;
    if (!old) {
      const candidate = items.get(record.scanRoot?byMediaPath.get(mediaKey(record)):(fileOwner || byMediaPath.get(mediaKey(record))));
      if (candidate && (!record.scanRoot||mediaKey(candidate)===mediaKey(record)) && !(record.recordKind==='folder'&&catalogItems.videoFile(candidate)) && !(record.type === 'season' && candidate.id.startsWith('sync-') && candidate.id !== record.id)) old = candidate;
    }
    if(record.type==='movie'&&!record.scanRoot){
      let parent=path.dirname(record.path||'');
      while(parent&&parent!==path.dirname(parent)){
        const owner=items.get(byMediaPath.get(String(record.sectionId)+'|movie|'+path.normalize(parent).toLowerCase().replace(/[\\/]+$/, '')));
        if(owner&&owner.id!==record.id){old=owner;break;}parent=path.dirname(parent);
      }
    }
    const savedAlias=scannedAliases.get(record.id);
    const id = record.recordKind==='folder'&&savedAlias&&!items.has(savedAlias)
      ? savedAlias : old?.id || (record.scanRoot?savedAlias:null) || record.id;
    observed.push(record.id,id);
    scannedAliases.set(record.id, id);
    const x = { ...old, ...record, ...(old&&record.type==='movie'?{path:old.path}:{}), id, inItem: scannedAliases.get(record.inItem) || record.inItem };
    if (old) { x.name = old.name || record.name; x.content = old.content || record.content; x.views = old.views; x.downloads = old.downloads; x.createdAt = old.createdAt; }
    const additions = (record.files || []).map(f => ({ ...f, id: old?.files?.find(v => v.path?.toLowerCase() === f.path?.toLowerCase())?.id || f.id, itemId: id }));
    x.files = [...(old?.files || []).filter(f => !additions.some(v => v.id === f.id)), ...additions];
    if (old?.inItem) { x.inItem = old.inItem; if (record.inItem) scannedAliases.set(record.inItem, old.inItem); }
    updateItems([x]);
    if (id !== record.id && children.has(record.id)) {
      for (const childId of [...children.get(record.id)]) { const child = items.get(childId); updateItems([{ ...child, inItem: id }]); }
      children.delete(record.id);
    }
    // Reparent children before dropping a temporary scanner container.
    if((record.recordKind==='folder'||record.type==='movie')&&record.id!==id&&record.id.startsWith('sync-')&&items.has(record.id))removeCatalogItem(record.id);
  }
  if(automatic)itemAdmin?.observe(observed);
  itemAdmin?.apply(observed);
  // The scanner publishes immediately; metadata and cover downloads use their own queue.
  if(automatic){const ids=rows.map(x=>scannedAliases.get(x.id)||x.id);metadata?.enqueueMissing(ids);folderIcons?.enqueue(ids);}
}
const startupTick=()=>new Promise(resolve=>setImmediate(resolve));
async function mergeScannedBatches(rows,range=null){
 linkScanParents(rows);
 for(let at=0;at<rows.length;at+=500){
  if(stopping)throw Error('توقف تجهيز الفهرس');
  mergeScanned(rows.slice(at,at+500),false);
  startupInfo.progress=(startupInfo.progress||0)+Math.min(500,rows.length-at);
  const fraction=Math.min(rows.length,at+500)/rows.length;startupInfo.percent=range?Math.floor(range.start+range.span*fraction):Math.floor(100*fraction);
  reportStartup({state:'running',phase:startupInfo.phase||'catalog-merge',message:startupMessage,current:startupInfo.progress,total:startupInfo.total||rows.length,percent:startupInfo.percent},false);
  await startupTick();
 }
}
async function reconcileMovieScan(scope,cooperative=false){
 if(itemAdmin.scanApplied(scope)){
  if(!cooperative){const ids=[],seen=new Set(),pending=[...(sectionItems.get(scope.sectionId)||[])];while(pending.length){const id=pending.pop();if(seen.has(id))continue;seen.add(id);pending.push(...(children.get(id)||[]));const item=items.get(id);if(item&&item.path&&require('./movie-scan-state.cjs').contains(scope.root,item.path))ids.push(id);}folderIcons?.enqueue(ids,{retry:true});}
  return;
 }
 const records=services.movieScanRecords(scope),active=[],wanted=new Set(),all=new Set(),queue=[...(sectionItems.get(scope.sectionId)||[])];
 // Correct records might have been hidden by an older successful scan.
 if(cooperative)await mergeScannedBatches(records,{start:100*(startupInfo.scope-1)/startupInfo.totalScopes,span:45/startupInfo.totalScopes});else mergeScanned(records,false);
 itemAdmin.observe(records.flatMap(row=>[row.id,scannedAliases.get(row.id)||row.id]));
 if(cooperative)await mergeScannedBatches(records,{start:(100*(startupInfo.scope-1)+45)/startupInfo.totalScopes,span:45/startupInfo.totalScopes});else mergeScanned(records,false);
 for(const record of records){const id=scannedAliases.get(record.id)||record.id,item=items.get(id);if(!item)continue;wanted.add(id);const paths=new Set(record.files.map(file=>path.normalize(file.path).toLowerCase()));active.push({id,files:settings.estra7ah_type==='caffe'?require('./compact-catalog-store.cjs').projection(item).files:(item.files||[]).filter(file=>paths.has(path.normalize(file.path).toLowerCase())),pathSize:settings.estra7ah_type==='caffe'?0:record.pathSize});}
 while(queue.length){const id=queue.pop();if(all.has(id))continue;all.add(id);queue.push(...(children.get(id)||[]));}
 const removed=[...all].filter(id=>{const item=items.get(id);return item&&item.path&&item.sectionId===scope.sectionId&&require('./movie-scan-state.cjs').contains(scope.root,item.path)&&!wanted.has(id);});
 itemAdmin.reconcileScan(scope,removed,active);
 if(!cooperative)folderIcons?.enqueue(active.map(row=>row.id),{retry:true});
 admin?.recordEvent('اكتملت مطابقة مجلدات القسم؛ أزيل '+removed.length+' عنصر قديم أو غير موجود من الفهرس','success');
}
const childRows = id => [...(children.get(id) || [])].map(k => items.get(k));
const sectionRow = id => sections.find(s => s.id === id);
const artworkItem=id=>{const item=items.get(id);return require('./movie-folder.cjs')(item,sectionRow(item?.sectionId));};
const topRows = () => {if(topCacheRevision!==catalogRevision){topCache=items.topRows?items.topRows():[...sectionItems.values()].flatMap(ids=>[...ids].map(id=>items.get(id))).filter(Boolean);topCache=topCache.filter(catalogItems.visible);topCacheRevision=catalogRevision;}return topCache.slice();};
function normalizedName(item){let cached=normalizedNames.get(item);if(!cached||cached.name!==item.name){cached={name:item.name,value:normalize(item.name)};normalizedNames.set(item,cached)}return cached.value;}
function searchKeys(query){
  const text=String(query||'');
  // Only the explicit spaced separator opts in to searching alternative names.
  if(!text.includes(' | '))return [normalize(query)];
  return [...new Set(text.slice(0,1200).split(' | ',6).map(value=>normalize(value.trim().slice(0,200))).filter(Boolean))];
}
let searchRevision=-1,searchCatalog=[];
function searchRows(query,start,count){
 if(searchRevision!==catalogRevision){
  const roots=topRows(),rows=roots.slice(),seen=new Set(roots.map(x=>x.id)),pending=roots.filter(x=>/^series(?:\.|$)/.test(publicCatalog.publicType(x.type)||'' )||publicCatalog.publicType(x.type)==='tv').map(x=>x.id);
  while(pending.length){const parent=pending.pop();for(const id of children.get(parent)||[]){if(seen.has(id))continue;seen.add(id);const item=items.get(id);if(!item||item.scanDeleted||item.deleted)continue;const type=publicCatalog.publicType(item.type);if(type==='season'||/^series(?:\.|$)/.test(type||'')){rows.push(item);pending.push(id);}}}
  searchCatalog=publicCatalog.uniqueSearch(rows,id=>!!sectionRow(id),id=>children.get(id)?.size||0);searchRevision=catalogRevision;
 }
 const keys=searchKeys(query),at=Math.max(0,Number(start)||0),limit=Math.min(200,Math.max(1,Number(count)||100)),found=[];let skipped=0;
 for(const item of searchCatalog){if(!keys.some(key=>normalizedName(item).includes(key)))continue;if(skipped++<at)continue;found.push(item);if(found.length>=limit)break;}return found;
}
function uniqueNewest(types,count){
 if(!items.queryTop)return (sharedCatalog?sharedCatalog.unique(topRows().filter(x=>!types||types.includes(x.type)).sort((a,b)=>(+b.createdAt||0)-(+a.createdAt||0))):topRows()).slice(0,count);
 let offset=0,rows=[];for(;;){const batch=items.queryTop({types,newest:true,limit:Math.max(100,count),offset});rows.push(...batch);const unique=sharedCatalog?sharedCatalog.unique(rows):rows;if(unique.length>=count||batch.length<Math.max(100,count))return unique.slice(0,count);offset+=batch.length;}
}
function newest(count) {
  const result = { movies: [], series: [], pindItemsNew: [], singers: [] };
  for (const t of ['deen', 'sports', 'tv', 'learn', 'ramadan', 'kids', 'anime']) result['series.' + t] = [];
  const newestRows=items.queryTop?['movie','film','series','series.tv','tv','series.anime','anime','series.kids','kids','series.deen','deen','series.sports','sports','series.learn','learn','series.ramadan','ramadan','singers'].flatMap(type=>uniqueNewest([type],count)):topRows();
  for (const x of (sharedCatalog?sharedCatalog.unique(newestRows.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0))):newestRows.sort((a,b)=>(b.createdAt||0)-(a.createdAt||0)))) { const type=publicCatalog.publicType(x.type),key = type === 'movie' ? 'movies' : type; if (result[key] && result[key].length < count) result[key].push(safeItem(x)); }
  result.pindItemsNew = itemAdmin?.pinnedItems() || [];
  return result;
}
async function stream(req, res, filename, download = false, media = false) {
  let handle;
  try {
    handle = await fs.promises.open(filename, 'r'); const stat = await handle.stat();
    if (!stat.isFile()) { await handle.close(); return respond(res, { error: 'الملف غير متاح' }, 404); }
    let start = 0, end = stat.size - 1, status = 200;
    if (req.headers.range) {
      const match = /^bytes=(\d*)-(\d*)$/.exec(req.headers.range);
      if (!match || (!match[1] && !match[2])) { await handle.close(); res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size }).end(); return; }
      if (!match[1]) start = Math.max(0, stat.size - Number(match[2])); else { start = Number(match[1]); if (match[2]) end = Math.min(end, Number(match[2])); }
      if (start >= stat.size || start > end || !Number.isSafeInteger(start) || !Number.isSafeInteger(end)) { await handle.close(); res.writeHead(416, { 'Content-Range': 'bytes */' + stat.size }).end(); return; } status = 206;
    }
    const cacheable=!media&&!download&&/\.(?:jpe?g|png|webp|gif|ico|bmp|svg|woff2?|ttf|css|js)$/i.test(filename),etag='W/"'+stat.size.toString(16)+'-'+Math.trunc(stat.mtimeMs).toString(16)+'"';
    if(cacheable){res.setHeader('ETag',etag);res.setHeader('Last-Modified',stat.mtime.toUTCString());res.setHeader('Cache-Control',/\.(?:jpe?g|png|webp|gif|ico|bmp|svg)$/i.test(filename)?'private, max-age=300':/\.[a-f0-9]{8}\.(?:chunk\.)?(?:js|css)$/i.test(filename)?'public, max-age=31536000, immutable':'private, no-cache');if(!req.headers.range&&String(req.headers['if-none-match']||'').split(',').map(x=>x.trim()).includes(etag)){await handle.close();res.writeHead(304).end();return}}
    const headers = { 'Content-Type': types[path.extname(filename).toLowerCase()] || 'application/octet-stream', 'Content-Length': Math.max(0, end - start + 1), 'Accept-Ranges': 'bytes', 'Cache-Control': cacheable?res.getHeader('Cache-Control'):'no-store' };
    if (status === 206) headers['Content-Range'] = 'bytes ' + start + '-' + end + '/' + stat.size;
    if (download) headers['Content-Disposition'] = "attachment; filename*=UTF-8''" + encodeURIComponent(path.basename(filename));
    const limiter = media ? speed.acquire(req,res,download) : null;
    res.writeHead(status, headers);
    if (req.method === 'HEAD' || stat.size === 0) { await handle.close(); res.end(); return; }
    const output = handle.createReadStream({ start, end, autoClose: true });
    if (media) output.on('data', chunk => operations?.trackTransfer(chunk.length));
    output.on('error', () => res.destroy()); res.on('close', () => output.destroy()); if(limiter){limiter.on('error',()=>res.destroy());output.pipe(limiter).pipe(res);}else output.pipe(res);
  } catch (error) { if (handle) await handle.close().catch(() => {}); if (!res.headersSent) respond(res, { error: error.status ? error.message : 'مسار الوسائط غير متصل أو الملف غير متاح' }, error.status || 404); else res.destroy(); }
}
const images = new Map();
function indexImages() {
  for (const folder of ['SecsImage', 'ExtsImage', 'AdImage', 'backend-statics/imgs']) {
    const full = path.join(base, 'assets', folder); if (!fs.existsSync(full)) continue;
    for (const entry of fs.readdirSync(full, { withFileTypes: true })) if (entry.isFile()) images.set(folder + '/' + path.parse(entry.name).name, path.join(full, entry.name));
  }
}
async function image(req, res, action, id) {
  // Legacy media filenames may contain Arabic and spaces. Look up only a single
  // filename in the prebuilt image index; never accept directory/device paths.
  const validId = /^itemimage$/i.test(action) ? /^[\w.-]+$/.test(id || '') :
    typeof id === 'string' && id.length > 0 && id.length <= 255 && id !== '.' && id !== '..' && !/[\/\\:\x00-\x1f<>"|?*]/.test(id);
  if (!validId) return respond(res, {}, 400);
  const folder = /sectionimage/i.test(action) ? 'SecsImage' : action === 'ExtImage' ? 'ExtsImage' : action === 'A-dImage' ? 'AdImage' : 'backend-statics/imgs';
  const uploaded = ['ExtImage','A-dImage'].includes(action)?content.media(id):null;
  if(uploaded)return stream(req,res,uploaded);
  const sectionCover=/sectionimage/i.test(action)&&sectionRow(id)?.localImage;if(sectionCover&&/^[a-f0-9-]+\.(png|jpg|webp|gif|ico)$/.test(sectionCover))return stream(req,res,path.join(data,'section-images',sectionCover));
  const file = images.get(folder + '/' + id) || images.get(folder + '/' + path.parse(id).name);
  if (file) return stream(req, res, file);
  if (/^itemimage$/i.test(action)) {
    const poster=posters?.file(id);
    const item=artworkItem(id);
    // Release the HTTP connection immediately; a disconnected share must never queue
    // navigation/API requests behind a screen full of image downloads.
    let result = artwork.peek(item);
    if(!result){
      // Give a fast local read a short chance to finish; unavailable shares release
      // the HTTP connection after this bounded window while their worker continues.
      let timer;try{result=await Promise.race([artwork.read(item),new Promise(resolve=>{timer=setTimeout(()=>resolve(null),250);})]);}finally{clearTimeout(timer);}
    }
    if(poster&&result?.type!=='image/x-icon')return stream(req,res,poster);
    if (result && !res.destroyed) {
      res.writeHead(200, { 'Content-Type': result.type, 'Content-Length': result.bytes.length, 'Cache-Control': 'private, max-age=300', 'X-Zain-Artwork': 'catalog-media-path' });
      res.end(req.method === 'HEAD' ? undefined : result.bytes); return;
    }
  }
  if(/^itemimage$/i.test(action)){const poster=posters?.file(id);if(poster)return stream(req,res,poster);}
  if (res.destroyed) return;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#202638"/><g transform="translate(75 200)">'+require('./legacy-artwork.cjs').loading+'</g></svg>';
  const artworkState=/^itemimage$/i.test(action)&&artwork?.status(artworkItem(id))==='pending'?'pending':'missing';
  res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control':'no-store', 'X-Zain-Placeholder': 'missing-artwork', 'X-Zain-Artwork-State':artworkState, ...(artworkState==='pending'?{'Retry-After':'1'}:{}) }).end(req.method === 'HEAD' ? '' : svg);
}
function allowedHost(host, selectedPort=port) { const hosts = new Set(['127.0.0.1', 'localhost', ...Object.values(os.networkInterfaces()).flat().filter(Boolean).map(x => x.address)]); return [...hosts].some(address => host === (address.includes(':') ? '[' + address + ']' : address) + (selectedPort===80?'':':'+selectedPort) || host === (address.includes(':') ? '[' + address + ']' : address) + ':' + selectedPort); }
const publicAttempts = new Map();
async function publicBody(req) {
  if (!require('./same-origin.cjs')(req)) { const error = Error('Cross-origin change rejected'); error.status = 403; throw error; }
  const now = Date.now();
  for (const [key, entry] of publicAttempts) if (entry.until <= now) publicAttempts.delete(key);
  const key = req.socket.remoteAddress, entry = publicAttempts.get(key) || { count: 0, until: now + 60000 };
  if (entry.count >= 10 || (!publicAttempts.has(key) && publicAttempts.size >= 10000)) { const error = Error('انتظر دقيقة قبل إرسال رسائل أخرى'); error.status = 429; throw error; }
  entry.count++; publicAttempts.set(key, entry);
  let size = 0; const chunks = [];
  for await (const chunk of req) { size += chunk.length; if (size > 65536) { const error = Error('الطلب أكبر من الحد المسموح'); error.status = 413; throw error; } chunks.push(chunk); }
  const text = Buffer.concat(chunks).toString('utf8'), type = req.headers['content-type'] || '';
  if (type.includes('application/json')) { try { return JSON.parse(text || '{}'); } catch { const error = Error('بيانات الطلب غير صالحة'); error.status = 400; throw error; } }
  if (type.includes('application/x-www-form-urlencoded')) return Object.fromEntries(new URLSearchParams(text));
  const boundary = /boundary=(?:"([^"]+)"|([^;]+))/.exec(type);
  if (type.includes('multipart/form-data') && boundary) {
    const result = Object.create(null);
    for (const part of text.split('--' + (boundary[1] || boundary[2]))) {
      const split = part.indexOf('\r\n\r\n'); if (split < 0) continue;
      const header = part.slice(0, split), name = /name="([^"]+)"/.exec(header);
      if (/filename=/i.test(header)) { const error = Error('هذا النموذج يقبل النص فقط'); error.status = 400; throw error; }
      if (name) result[name[1]] = part.slice(split + 4).replace(/\r\n$/, '');
    }
    return result;
  }
  const error = Error('صيغة الطلب غير مدعومة'); error.status = 415; throw error;
}
async function api(req, res, parts) {
  const [action, ...a] = parts.filter(Boolean);
  if (['getAllNews', 'getAllAds', 'getAllExts', 'sendReq', 'sendReport'].includes(action)) {
    const result = await content.public(action, a, req.method === 'POST' ? await publicBody(req) : {}, req.method);
    return respond(res, result.body, result.status || 200);
  }
  if (!['GET', 'HEAD'].includes(req.method)) return respond(res, {}, 405);
  const cachedActions=new Set(['getNewest','sections','starSections','getAllVIPSections','getNumbers','getSecType','getItems','getItemsFiltered','getItemsSearch','getLast20Items','getItemData','getSeries','getEpisods','getNumSeasonsAndEps']);
  const revision=String(catalogRevision)+'|'+JSON.stringify(sections.map(safeSection)),cacheKey=req.url;
  const reply=value=>{if(!cachedActions.has(action))return respond(res,value);return responseCache.send(req,res,responseCache.put(cacheKey,revision,value));};
  if(cachedActions.has(action)){const cached=responseCache.get(cacheKey,revision);if(cached)return responseCache.send(req,res,cached);}
  switch (action) {
    case 'getMubasherPort': return respond(res,{mubasher_port:settings.mubasher_port||'3333'});
    case 'getMainSettings': case 'getMainShows': return respond(res, settings);
    case 'getNewest': return reply(newest(Math.min(100, +a[0] || 30)));
    case 'sections': {
      if (a.length === 1 && a[0]) return reply(safeSection(sectionRow(a[0])));
      return reply(list(sections.filter(s => s.is_hidden !== 'yes' && String(s.in_section || 'null') === String(a[2] || 'null')).sort((x, y) => (+x.order || 0) - (+y.order || 0)), a[0], a[1]).map(safeSection));
    }
    case 'starSections': return reply(sections.filter(s => s.star && s.is_hidden !== 'yes').sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(safeSection));
    case 'getAllVIPSections': return reply(sections.filter(s => s.isVIP === 'yes' && s.is_hidden !== 'yes').sort((a,b)=>(Number(a.order)||0)-(Number(b.order)||0)).map(safeSection));
    case 'getAllAds': return respond(res, { ads: [] });
    case 'getAllExts': return respond(res, { exts: [] });
    case 'getNumbers': { const rows=sharedCatalog?sharedCatalog.unique(topRows()):topRows(); return reply({sections:[{count:sections.length}],movies:[{count:rows.filter(x=>publicCatalog.publicType(x.type)==='movie').length}],serieses:[{count:rows.filter(x=>/^series(?:\.|$)/.test(publicCatalog.publicType(x.type))).length}],songs:[{count:0}],books:[{count:rows.filter(x=>x.type==='booksSameFolder').length}],apps:[{count:0}]}); }
    case 'getSecType': return reply(safeSection(sectionRow(a[0])) || {});
    case 'getItems': case 'getItemsFiltered': {
      let rows = [...(sectionItems.get(a[2]) || [])].map(id => items.get(id)).filter(catalogItems.visible);if(sharedCatalog)rows=sharedCatalog.unique(rows).map(row=>sharedCatalog.view(row));
      const query = normalize(a.slice(6).join('/')); if (query && !['undefined', 'null'].includes(query)) rows = rows.filter(x => normalizedName(x).includes(query));
      if (a[4] && !['all', 'undefined'].includes(a[4])) rows = rows.filter(x => String(x.content?.year) === a[4]);
      if (a[3] && !['all', 'undefined'].includes(a[3])) rows = rows.filter(x => require('./genre-filter.cjs').matches(x,a[3]));
      const order = a[5] || 'createdAt'; rows.sort((x, y) => order.includes('name') || order === 'alpha' ? x.name.localeCompare(y.name, 'ar') : order.includes('year') ? (+y.content?.year || 0) - (+x.content?.year || 0) : order.includes('rating') ? (+y.content?.imdb_ratings || 0) - (+x.content?.imdb_ratings || 0) : (+y.createdAt || 0) - (+x.createdAt || 0));
      return reply(list(rows, a[0], a[1]).map(safeItem));
    }
    case 'getItemsSearch': return reply(list(searchRows(a.slice(2).join('/'),a[0],a[1]), 0, a[1]).map(x => ({ ...safeItem(x), section: safeSection(sectionRow(x.sectionId)) || { name: 'قسم غير موجود' } })));
    case 'getLast20Items': return reply(uniqueNewest(undefined,20).map(safeItem));
    case 'getItemData': { const item = items.get(a[0]); return respond(res, item ? { ...detailItem(item), data: detailItem(item), item: detailItem(item), section: safeSection(sectionRow(item.sectionId)) || {id:item.sectionId,name:'قسم غير موجود',type:publicCatalog.publicType(item.type),downloadActive:'yes'} } : {}, item ? 200 : 404); }
    case 'getSeries': case 'getEpisods': return reply(childRows(a[0]).map(x => ({ ...safeItem(x), seriesName: items.get(a[0])?.name || '' })));
    case 'getSimilerItems': return respond(res, require('./similar-items.cjs')({items:topRows(),sections,genre:a[0],type:a[1],excludeId:a[3]}).map(safeItem));
    case 'getNumSeasonsAndEps': { const rows = childRows(a[0]), seasons = rows.filter(x => x.type === 'season'); return reply({ seasons: seasons.length, eps: rows.filter(x => x.type === 'episod').length + seasons.reduce((n, x) => n + childRows(x.id).filter(y => y.type === 'episod').length, 0) }); }
    case 'getPlayData': {
      const item = items.get(a[0]); if (!item) return respond(res, {}, 404);
      const sources = (item.files || []).filter(f => /^\.(mp4|m4v|mkv|avi|webm|mov|ts|mp3|m4a|ogg)$/i.test(path.extname(f.path || ''))).map(f => ({ src: f.id, type: types[path.extname(f.path).toLowerCase()] || f.type?.mime_type || 'video/mp4', label: f.filename, size: 0 }));
      return respond(res, { title: item.name, poster: '/api/ItemImage/' + item.id, sources, tracks: [], isVIP: false });
    }
    case 'stream': case 'download': {
      const f = files.get(a[0]); if (!f) return respond(res, {}, 404);
      const owner = items.get(f.itemId); if (action === 'download' && sectionRow(owner?.sectionId)?.downloadActive === 'no') return respond(res, { error: 'التنزيل غير متاح لهذا القسم' }, 403);
      return stream(req, res, f.path, action === 'download', true);
    }
    case 'downloadItem': { const item = items.get(a[0]), f = item?.files?.find(f => types[path.extname(f.path || '').toLowerCase()]?.startsWith('video/')); if (!f) return respond(res, { error: 'لا توجد وسائط متاحة' }, 404); if (sectionRow(item.sectionId)?.downloadActive === 'no') return respond(res, {}, 403); return stream(req, res, f.path, true, true); }
    case 'ItemImage': case 'itemImage': case 'sectionImage': case 'SectionImage': case 'ExtImage': case 'A-dImage': return image(req, res, action, a[0]);
    case 'ExtVideo': case 'A-dVideo': {const file=content.media(a[0]);if(!file)return respond(res,{},404);return stream(req,res,file);}
    case 'getCurrentVersion': return respond(res, { version: 'Zain local '+release.version, release:release.version, releasedAt:release.releasedAt });
    default: return respond(res, { error: 'هذه الخدمة لم تُربط بالخادم المستقل بعد', service: action }, 501);
  }
}
let updateClosing = false, activeUpdateRequests = 0;
const server = http.createServer(async (req, res) => {
  try {
    if (!allowedHost(req.headers.host)) return respond(res, { error: 'Invalid host' }, 403);
    const url = new URL(req.url, 'http://' + req.headers.host); let route;
    try { route = decodeURIComponent(url.pathname); } catch { return respond(res, {}, 400); }
    res.setHeader('Content-Security-Policy', "default-src 'self' data: blob:; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; connect-src 'self'; object-src 'none'; frame-src 'none'");
    res.setHeader('X-Content-Type-Options', 'nosniff');
    if (route === '/zain/health') return respond(res, { service: 'zain', instanceId:crypto.createHash('sha256').update(controlToken).digest('hex'), version:release.version, ready, message: startupError || (ready ? 'الخادم يعمل' : startupMessage), startup:startupInfo, records: items.size, sections: sections.length, broadcast:broadcast?.status(), monitor:ready?monitorSnapshot():null });
    if (route === '/zain/control/stop') {
      if (req.method !== 'POST' || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) || req.headers['x-zain-control'] !== controlToken) return respond(res, {}, 403);
      respond(res, { ok: true }); setTimeout(shutdown, 100); return;
    }
    if (route === '/zain/control/update-stop') {
      if(req.method!=='POST'||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)||req.headers['x-zain-control']!==controlToken)return respond(res,{},403);
      if(updateClosing)return respond(res,{error:'التحديث قيد التنفيذ'},409);
      updateClosing=true;
      const reason=require('./update-gate.cjs')({ready,syncJobs:services?.syncJobs()||[],metadataJobs:metadata?.jobs()||[],isBusy:backups?.isBusy()||!!folderIcons?.status().running||!!folderIcons?.status().queued||activeUpdateRequests>0,pendingRestore:fs.existsSync(path.join(data,'pending-restore.json'))});
      if(reason){updateClosing=false;return respond(res,{error:reason},409);}
      respond(res,{ok:true});setTimeout(shutdown,100);return;
    }
    if(updateClosing)return respond(res,{error:'جارٍ تحديث البرنامج؛ أعد المحاولة بعد قليل'},503);
    if(route.startsWith('/admin/api/')||route.startsWith('/api/')){
      activeUpdateRequests++;let counted=true;const done=()=>{if(counted){counted=false;activeUpdateRequests--;}};
      res.once('finish',done);res.once('close',done);
    }
    if (!ready) return respond(res, { error: startupError || 'جار تحميل القاعدة' }, 503);
    const detailRoute=/^\/itemView\/[^/]+\/([^/]+)\/?$/.exec(route);
    if(detailRoute){const item=items.get(detailRoute[1]);if(item&&!publicCatalog.hasDetail(item.type)){res.writeHead(302,{Location:'/zain/folder/'+encodeURIComponent(item.id),'Cache-Control':'no-store'}).end();return;}}
    log.write(req.method + ' ' + route + '\n');
    if (route.startsWith('/admin/api/')) return admin.handle(req, res, route);
    if(route.startsWith('/zain/folder-target/')){
      try{const original=items.get(route.slice('/zain/folder-target/'.length));return respond(res,require('./folder-target.cjs')(req,require('./movie-folder.cjs')(original,sectionRow(original?.sectionId)),settings.estra7ah_type));}
      catch(error){return respond(res,{error:error.message},error.status||500);}
    }
    if(route.startsWith('/zain/open-folder/')){
      try{return respond(res,await require('./open-folder.cjs')(req,(()=>{const item=items.get(route.slice('/zain/open-folder/'.length));return require('./movie-folder.cjs')(item,sectionRow(item?.sectionId));})(),settings.estra7ah_type));}
      catch(error){return respond(res,{error:error.message},error.status||500);}
    }
    if(route.startsWith('/zain/folder/')){
      if(!['GET','HEAD'].includes(req.method))return respond(res,{},405);
      if(settings.estra7ah_type!=='caffe')return respond(res,{error:'تصفح المجلد متاح في وضع المقهى'},403);
      const item=items.get(route.slice('/zain/folder/'.length));if(!item)return respond(res,{},404);
      const escape=value=>String(value||'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
      const rows=(item.files||[]).map(file=>'<li>'+escape(file.filename)+' '+(sectionRow(item.sectionId)?.downloadActive!=='no'?'<a href="/api/download/'+encodeURIComponent(file.id)+'">تنزيل الملف</a>':'')+'</li>').join('');
      const folders=childRows(item.id).map(child=>'<li><a href="/zain/folder/'+encodeURIComponent(child.id)+'">'+escape(child.name)+'</a></li>').join('');
      const html='<!doctype html><html lang="ar" dir="rtl"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>تصفح المجلد</title><style>body{background:#151b2b;color:#eee;font:18px sans-serif;max-width:900px;margin:40px auto;padding:20px}li{padding:16px;border-bottom:1px solid #39415a}a{color:#a6c8ff;margin:12px}p{line-height:1.8}</style><h1>'+escape(item.name)+'</h1><a href="javascript:history.back()">رجوع</a><p>الملفات المسجلة في فهرس هذا المجلد. تنزيلها يتطلب اتصال الخادم بمسار الوسائط.</p><ul>'+folders+rows+'</ul>'+(!rows&&!folders?'<p>لا توجد ملفات مسجلة لهذا العنصر.</p>':'')+'</html>';
      res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(req.method==='HEAD'?'':require('./branding.cjs').html(html));return;
    }

    if(!route.startsWith('/admin')&&!route.startsWith('/zain/')&&!route.startsWith('/static/')&&!admin.authorize(req)){
      if(settings.is_stop_constraction==='yes')return respond(res,{error:'الاستراحة متوقفة للصيانة مؤقتاً'},503);
      if(settings.is_only_app==='yes'&&!/Android|iPhone|iPad|Mobile/i.test(req.headers['user-agent']||''))return respond(res,{error:'الاستراحة متاحة للأجهزة المحمولة فقط'},403);
    }
    operations?.trackRequest(req);
    if (route.startsWith('/api/')) return await api(req, res, route.slice(5).split('/'));
    if(route==='/zain/advanced-search'){if(req.method!=='POST')return respond(res,{},405);try{return respond(res,await gemini.search(await publicBody(req),req.socket.remoteAddress))}catch(e){return respond(res,{error:e.message},e.status||500)}}
    if (!['GET', 'HEAD'].includes(req.method)) return respond(res, {}, 405);
    if (route === '/zain/browser-polyfills.js') return stream(req,res,path.join(__dirname,'browser-polyfills.js'));
    if (route === '/zain/folder-client.js') return stream(req,res,path.join(__dirname,'folder-client.js'));
    if (route === '/zain/desktop-bridge.js') return stream(req,res,path.join(__dirname,'desktop-bridge.js'));
    if (route === '/zain/exclusive-hero.js') return stream(req,res,path.join(__dirname,'exclusive-hero.compat.js'));
    if (route === '/zain/exclusive.js') return stream(req,res,path.join(__dirname,'exclusive.compat.js'));
    if (route === '/zain/exclusives') {const ext=await content.public('getAllExts',[],{},'GET');exclusiveArtwork.hydrate(itemAdmin.exclusiveItems());return respond(res,{exts:ext.body.exts,items:itemAdmin.exclusiveItems().map(item=>({...item,exclusiveLogo:exclusiveArtwork.logoFile(item.id)?'/zain/exclusive-logo?id='+encodeURIComponent(item.id):null,exclusiveImage:item.exclusiveImage||(exclusiveArtwork.file(item.id)?'/zain/exclusive-image?id='+encodeURIComponent(item.id):'/ItemImage/'+encodeURIComponent(item.id))}))});}
    if(route==='/zain/exclusive-custom-image'){const file=itemAdmin.exclusiveFile(url.searchParams.get('id'));if(!file)return respond(res,{},404);return stream(req,res,file);}
    if(route==='/zain/section-genres'){const id=url.searchParams.get('id'),rows=[...(sectionItems.get(id)||[])].map(id=>items.get(id)).filter(Boolean),genres=[...new Set(rows.flatMap(item=>require('./genre-filter.cjs').genres(item)))].sort((a,b)=>a.localeCompare(b,'ar'));return respond(res,{genres});}
    if(route==='/zain/navigation')return respond(res,require('./navigation.cjs')(sections,settings.home_sections));
    if(route==='/zain/database-maintenance.js')return stream(req,res,path.join(__dirname,'database-maintenance.compat.js'));
    if(route==='/zain/admin-enhancements.js')return stream(req,res,path.join(__dirname,'admin-enhancements.compat.js'));
    if (route === '/zain/exclusive-logo') {const id=url.searchParams.get('id'),file=items.has(id)&&exclusiveArtwork.logoFile(id);if(!file)return respond(res,{},404);return stream(req,res,file);}
    if (route === '/zain/exclusive-image') {const id=url.searchParams.get('id'),file=items.has(id)&&exclusiveArtwork.file(id);if(!file)return respond(res,{},404);return stream(req,res,file);}
    if (route === '/zain/public-details.js') return stream(req,res,path.join(__dirname,'public-details.compat.js'));
    if (route === '/zain/artwork-refresh.js') return stream(req,res,path.join(__dirname,'image-retry.compat.js'));
    if (route === '/zain/artwork-status') {
      const ids=[...new Set((url.searchParams.get('ids')||'').split(','))].filter(x=>/^[\w.-]+$/.test(x)).slice(0,60);
      return respond(res,{items:ids.map(id=>{const item=artworkItem(id),local=artwork.peek(item),poster=posters.file(id);if(artwork.status(item)==='unknown')artwork.read(item).catch(()=>{});return {id,version:images.has('backend-statics/imgs/'+id)?'asset':local?'local':poster?'poster':null};})});
    }
    if (route === '/zain/actor-image') {const name=new URL(req.url,'http://localhost').searchParams.get('name')||'',file=actorImages.file(name);if(!file)return respond(res,{},404);return stream(req,res,file);}
    if (route === '/zain/actor') {const name=new URL(req.url,'http://localhost').searchParams.get('name')||'';res.writeHead(200,{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}).end(require('./branding.cjs').html(require('./actor-page.cjs')(topRows(),name.slice(0,200),new URL(req.url,'http://localhost').searchParams.get('type'))));return;}
    if (route === '/zain/admin-status.js') return stream(req, res, path.join(__dirname, 'admin-status.compat.js'));
    if (route === '/zain/capabilities.json') return respond(res, uiCompat.capabilities);
    if (route === '/zain/dashboard-bridge.js') { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(req.method === 'HEAD' ? '' : require('./browser-code.cjs')(uiCompat.bridgeScript)); return; }
    const adapted = uiCompat.transform(route);
    if (adapted) { res.writeHead(200, { 'Content-Type': 'text/javascript; charset=utf-8', 'Cache-Control': 'no-store' }).end(req.method === 'HEAD' ? undefined : require('./browser-code.cjs')(adapted)); return; }
    const imageRoute=route.replace(/^\/api\//i,'/');
    if (/^\/(sectionImage|SectionImage|ItemImage|itemImage|ExtImage|A-dImage)\//.test(imageRoute)) { const [, action, id] = imageRoute.split('/'); return image(req, res, action, id); }
    if (route === '/' || !path.extname(route)) {
      let html = await fs.promises.readFile(path.join(web, 'index.html'), 'utf8');
      html = html.replace('</head>','<meta name="estra7ah-version" content="'+release.version+'"></head>');
      html = html.replace('<title>Estra7ah Manager</title>', '<title>استراحة زين</title>').replace('<head>', '<head><script>window.estra7ahserver=location.hostname;window.estra7ahport=location.port||80;</script><script src="/zain/browser-polyfills.js"></script><script src="/zain/dashboard-bridge.js"></script>');
      html=html.replace('</body>','<link rel="prefetch" href="/static/js/12.41b0cf3e.chunk.js" as="script"><link rel="prefetch" href="/static/css/12.24adbb42.chunk.css" as="style"><script defer src="/zain/desktop-bridge.js"></script><script defer src="/zain/folder-client.js"></script><script defer src="/zain/public-details.js?v=4"></script><script defer src="/zain/artwork-refresh.js"></script><script defer src="/zain/exclusive-hero.js?v=2"></script><script defer src="/zain/admin-enhancements.js"></script><script defer src="/zain/exclusive.js?v=3"></script></body>');
      if (route === '/admin' || route.startsWith('/admin/')) html = html.replace('</body>', '<script defer src="/zain/admin-status.js"></script><script defer src="/zain/database-maintenance.js"></script></body>');
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8', 'Cache-Control': 'no-store' }).end(req.method === 'HEAD' ? '' : html); return;
    }
    const full = path.resolve(web, '.' + route);
    if (!full.startsWith(web + path.sep) || route.includes('.transfer-part')) return respond(res, {}, 403);
    return stream(req, res, full);
  } catch (e) { console.error(e.message); if (!res.headersSent) respond(res, { msg: 'error', error: e.status ? e.message : 'تعذر إكمال الطلب' }, e.status || 500); else res.destroy(); }
});
let stopping = false;
const closeServer=require('./shutdown.cjs')({
 cleanup:[()=>admin?.recordEvent('إيقاف خادم الاستراحة','warning'),()=>backups?.close(),()=>metadata?.close(),()=>folderIcons?.close(),()=>broadcast?.close(),()=>artwork?.close(),()=>scanArtwork?.close(),()=>services?.close(),()=>operations?.close(),()=>catalogStore.close?.()],
 close:()=>new Promise(resolve=>{server.close(resolve);server.closeIdleConnections?.();}),
 forceClose:()=>server.closeAllConnections(),exit:code=>process.exit(code),report:message=>console.error(message)
});
function shutdown(){stopping=true;return closeServer();}
server.listen(port, config.bind, async () => {
  fs.writeFileSync(path.join(data, 'launcher-control.json'), JSON.stringify({ token: controlToken, port, pid: process.pid }));
  try {
    const source = JSON.parse(await fs.promises.readFile(path.join(base, 'assets/db/estra7ah.json'), 'utf8'));
    sections = source.sectionsData;
    settings = { ...pick(source.settings || {}, ['isApprove', 'main_name', 'main_desc', 'main_phone', 'main_facebook', 'mubasher_port', 'is_stop_constraction', 'is_only_app', 'estra7ah_type', 'show_movies', 'show_series', 'show_tvs', 'show_s_r', 'show_anime', 'show_kids', 'show_m_d', 'show_sports', 'show_learn']), main_name: 'استراحة زين' };
    const bootStarted=Date.now();let cachedCatalog=catalogStore.read();
    if(!cachedCatalog){startupMessage='جار استيراد سجل المزامنة السابق';startupInfo={mode:'migration',phase:'legacy-import',percent:0,current:0,total:0};reportStartup({state:'running',phase:startupInfo.phase,message:startupMessage,percent:0,current:0,total:0},true);catalogStore.importLegacy(progress=>{startupInfo={...startupInfo,...progress};startupMessage=progress.message||startupMessage;reportStartup({state:'running',phase:startupInfo.phase,message:startupMessage,current:startupInfo.current,total:startupInfo.total,percent:startupInfo.percent},false);});}
    services = require('./services.cjs')({ dir: data, sections, catalogPath:catalogStore.file, folderOnly:settings.estra7ah_type==='caffe', onItems: mergeScanned,onMovieScan:reconcileMovieScan,onCatalogCommit:async()=>catalogStore.write(catalogSnapshot()) });
    if(cachedCatalog){({items,children,sectionItems,files,byMediaPath,byFilePath,scannedAliases}=cachedCatalog);catalogRevision++;startupInfo={mode:'catalog',changedRecords:0};startupMessage='جار فتح كتالوج الاستراحة';}
    else{startupMessage='جار ترحيل الفهرس السابق إلى قاعدة الكتالوج';startupInfo={mode:'migration',phase:'legacy-items',percent:0};reportStartup({state:'running',phase:startupInfo.phase,message:startupMessage,percent:0},true);const legacyItems=JSON.parse(await fs.promises.readFile(path.join(base,'assets/db/estra7ah.items.json'),'utf8')).itemsData;updateItems(legacyItems);startupMessage='جار دمج نتائج المزامنة السابقة';const storedItems=await services.getStoredItems();startupInfo={...startupInfo,phase:'catalog-merge',progress:0,total:storedItems.length,percent:0};reportStartup({state:'running',phase:startupInfo.phase,message:startupMessage,current:0,total:storedItems.length,percent:0},true);await mergeScannedBatches(storedItems);catalogItems.repairMovieFiles(items,updateItems);}
    content = require('./content-services.cjs')({ dir: data, source: { ...source, getItem: id => { const item = items.get(id); return item ? { ...safeItem(item), section: safeSection(sectionRow(item.sectionId)) } : null; } } });
    sharedCatalog=require('./shared-catalog.cjs')({items,rows:topRows(),updateItems});
    itemAdmin = require('./item-admin.cjs')({dir:data,items,sharedCatalog,topRows,safeItem,updateItems,removeItem:removeCatalogItem,resolveId:id=>scannedAliases.get(id)||id,prepareExclusive:item=>exclusiveArtwork.prepare(item),catalogStore,onCatalogChange:()=>catalogStore.write(catalogSnapshot())});
    const repairScopes=services.movieScans().filter(scope=>!itemAdmin.scanApplied(scope));
    await itemAdmin.batchChanges(async()=>{
      for(let index=0;index<repairScopes.length;index++){
        startupMessage='جار إصلاح فهرس المكتبة — المسار '+(index+1)+' من '+repairScopes.length;
        startupInfo.phase='reconcile';startupInfo.scope=index+1;startupInfo.totalScopes=repairScopes.length;startupInfo.progressLabel='معالجة المسارات';startupInfo.percent=Math.floor(index*100/repairScopes.length);
        await startupTick();if(stopping)throw Error('توقف تجهيز الفهرس');
        await reconcileMovieScan(repairScopes[index],true);startupInfo.percent=Math.floor((index+1)*100/repairScopes.length);
      }
    });
    startupMessage='جار إكمال تشغيل الخدمات';startupInfo.phase='services';startupInfo.percent=null;reportStartup({state:'running',phase:'services',message:startupMessage},true);await startupTick();if(stopping)throw Error('توقف تجهيز الفهرس');
    speed=require('./speed.cjs')({dir:data});
    backups=require('./backups.cjs')({base,isSyncing:()=>[...services.syncJobs(),...(metadata?.jobs()||[])].some(j=>['running','queued'].includes(j.status)),onEvent:(...args)=>admin?.recordEvent(...args)});
    gemini=require('./gemini-search.cjs')({dir:data});
    const extensions = [content,itemAdmin,speed,gemini,require('./path-checks.cjs')({sections,services})];
    admin = require('./admin.cjs')({ dir: data, sections, settings, port, services, extensions, backups });
    posters=require('./poster-cache.cjs')({dir:data,getCacheKey:id=>items.has(id)?sharedCatalog.key(id):id,getRelatedIds:sharedCatalog.related});
    exclusiveArtwork=require('./exclusive-artwork.cjs')({dir:data,getKey:()=>admin.getMetadataKey()||source.settings?.api_key||'',onEvent:admin.recordEvent,getLookupName:item=>{const own=artworkItem(item.id);return path.basename((own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path||'')||item.name;}});
    actorImages=require('./actor-images.cjs')({dir:data,cache:posters});
    artwork = require('./artwork.cjs')({ getItem: id => items.get(id) });
    scanArtwork=require('./artwork.cjs')({concurrency:1});
    const hasLocalArtwork=async item=>{const own={...artworkItem(item.id),inItem:null};const dir=(own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path;own.files=(own.files||[]).filter(f=>f.path&&dir&&path.relative(dir,f.path)&&!path.relative(dir,f.path).startsWith('..')&&!path.isAbsolute(path.relative(dir,f.path)));scanArtwork.invalidate(own);return Boolean(await scanArtwork.read(own));};
    folderIcons=require('./folder-icons.cjs')({dir:data,getItem:id=>{const item=items.get(id);return item?require('./movie-folder.cjs')(sharedCatalog.view(item),sectionRow(item.sectionId)):null;},getKey:()=>admin.getMetadataKey()||source.settings?.api_key||'',getPoster:id=>posters.file(id),getLookupName:item=>path.basename(item.path||'')||item.name,onEvent:admin.recordEvent,onCreated:async item=>{artwork.invalidate(artworkItem(item.id));scanArtwork.invalidate(item);await artwork.read(artworkItem(item.id));},onInspected:item=>artwork.invalidate(artworkItem(item.id))});
    metadata=require('./metadata.cjs')({settingsDir:data,items,getCanonicalId:sharedCatalog.canonical,getRelatedIds:sharedCatalog.related,getCandidateIds:()=>sharedCatalog.unique(topRows().filter(row=>!sharedCatalog.hasContent(row))).map(row=>row.id),translateDescription:gemini.translateDescription,canTranslateDescription:gemini.canTranslateDescription,getKey:()=>admin.getMetadataKey()||source.settings?.api_key||'',saveContent:itemAdmin.saveContent,onEvent:admin.recordEvent,hasArtwork:hasLocalArtwork,getLookupName:item=>{const own=artworkItem(item.id);return path.basename((own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path||'')||item.name;},savePoster:async(id,poster)=>{
      if(!posters.file(id))await posters.save(id,poster);
      const original=items.get(id);const result=await require('./poster-folder.cjs')(require('./movie-folder.cjs')(original,sectionRow(original?.sectionId)),posters.file(id));
      if(result.status==='saved')artwork.invalidate(artworkItem(id));
      folderIcons?.enqueue([id,...childRows(id).filter(x=>x.type==='season').map(x=>x.id)],{retry:true});
      if(result.status==='failed')admin.recordEvent('حُفظت الصورة في الخادم؛ تعذر حفظها داخل مجلد '+items.get(id)?.name+' ('+result.code+')','warning');
      return result;
    },saveActors:actorImages.save});
    extensions.push(metadata);
    operations = require('./operations.cjs')({ dir: data, items, sections, services, readEvents: admin.readEvents, clearEvents: admin.clearEvents, metadata,recordEvent:admin.recordEvent });
    extensions.push(operations);
    uiCompat = require('./ui-compat.cjs')({ interfaceDir: web });
    settings.mubasher_port=String(config.broadcastPort||Number(settings.mubasher_port)||3333);
    if(Number(settings.mubasher_port)===port)throw Error('منفذ البث يجب أن يختلف عن منفذ الاستراحة');
    broadcast=require('./broadcast.cjs')({base,port:Number(settings.mubasher_port),mainPort:port,authorize:req=>admin.authorize(req),allowedHost,onEvent:admin.recordEvent});
    indexImages();
    startupInfo.sharedCatalog=sharedCatalog.stats();startupInfo.durationMs=Date.now()-bootStarted;
    console.log('Startup catalog: '+startupInfo.mode+'; '+startupInfo.durationMs+'ms; '+(startupInfo.changedRecords||0)+' changed records');
    if(!cachedCatalog){startupInfo.phase='catalog-save';startupInfo.percent=null;reportStartup({state:'running',phase:'catalog-save',message:'جار حفظ قاعدة المكتبة'},true);catalogStore.write(catalogSnapshot());admin.recordEvent('اكتمل ترحيل الكتالوج إلى قاعدة SQLite الموحدة','success');}
 ready=true;reportStartup({state:'completed',phase:'completed',message:'اكتمل تجهيز المكتبة',percent:100,records:items.size,sections:sections.length},true);
 admin.recordEvent('تم تشغيل الاستراحة على المنفذ '+port+' والبث على '+settings.mubasher_port,'success'); console.log('Zain ready: http://127.0.0.1:' + port + '/; ' + items.size + ' records');
  } catch (e) { startupError = 'تعذر تحميل ملفات الخادم: ' + e.message;reportStartup({state:'failed',phase:'failed',message:startupError,error:String(e.message||e),percent:null},true);console.error(startupError); }
});
server.on('error', error => { reportFatal(error); console.error(error.message); process.exit(1); });
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
