'use strict';
const fs = require('fs'), path = require('path'), http = require('http'), crypto = require('crypto'), os = require('os');
const release=require('./release.json');
const base = path.resolve(__dirname, '..'), web = path.join(base, 'interface'), data = path.join(base, 'data');
for (const name of ['data', 'logs']) fs.mkdirSync(path.join(base, name), { recursive: true });
require('./backups.cjs').applyPending(base);
const configFile = path.join(data, 'server-config.json');
const config = fs.existsSync(configFile) ? JSON.parse(fs.readFileSync(configFile, 'utf8')) : { port: 80, bind: '0.0.0.0' };
const port = config.port;
let gemini;
let ready = false, startupError = '', sections = [], settings = {}, admin, services, content, operations, artwork, scanArtwork, uiCompat, speed, itemAdmin, backups, broadcast, metadata, posters, actorImages, exclusiveArtwork;
const responseCache=require('./browse-cache.cjs')();let catalogRevision=0,topCacheRevision=-1,topCache=[];const normalizedNames=new WeakMap();
const items = new Map(), children = new Map(), sectionItems = new Map(), files = new Map();
const byMediaPath = new Map(), scannedAliases = new Map();
const byFilePath = new Map();
const mediaKey = x => x.path ? String(x.sectionId) + '|' + String(x.type) + '|' + path.normalize(x.path).toLowerCase().replace(/[\\/]+$/, '') : '';
const controlToken = crypto.randomBytes(32).toString('hex');
const log = fs.createWriteStream(path.join(base, 'logs/requests.log'), { flags: 'a' });
const types = { ".webp": "image/webp", '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.png': 'image/png', '.gif': 'image/gif', '.ico': 'image/x-icon', '.woff2': 'font/woff2', '.woff': 'font/woff', '.ttf': 'font/ttf', '.json': 'application/json', '.mp4': 'video/mp4', '.m4v': 'video/mp4', '.webm': 'video/webm', '.mkv': 'video/x-matroska', '.mp3': 'audio/mpeg', '.m4a': 'audio/mp4', '.ogg': 'audio/ogg', '.vtt': 'text/vtt; charset=utf-8', '.pdf': 'application/pdf' };
const pick = (o, keys) => Object.fromEntries(keys.filter(k => o[k] !== undefined).map(k => [k, o[k]]));
const safeFile = f => pick(f, ['id', 'filename', 'itemId', 'type']);
const safeItem = x => x ? { ...pick(x, ['id', 'name', 'type', 'inItem', 'views', 'downloads', 'sectionId', 'createdAt', 'content', 'pathSize']), files: (x.files || []).map(safeFile) } : null;
const detailItem = x => x ? {...safeItem(x), ...(settings.estra7ah_type === 'caffe' ? {path:'/zain/folder/'+encodeURIComponent(x.id)} : {})} : null;
const safeSection = x => x ? pick(x, ['id', 'name', 'views', 'in_section', 'type', 'downloadActive', 'order', 'linkedId', 'is_hidden', 'NumOfEps', 'createdAt', 'updatedAt', 'isVIP', 'star']) : null;
function respond(res, body, status = 200) { if (!res.destroyed) res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' }).end(JSON.stringify(body)); }
function normalize(value) { return String(value || '').replace(/[أإآ]/g, 'ا').replace(/ة/g, 'ه').replace(/[ؤئ]/g, 'ء').replace(/ى/g, 'ي').toLowerCase(); }
function list(rows, start, count) { const at = Math.max(0, Number(start) || 0); return rows.slice(at, at + Math.min(200, Math.max(1, Number(count) || 100))); }
function updateItems(rows) {
  catalogRevision++;
  for (const x of rows) {
    if (!x.id) continue;
    const old = items.get(x.id);
    if (old) { if (old.inItem) children.get(old.inItem)?.delete(old.id); else sectionItems.get(old.sectionId)?.delete(old.id); for (const f of old.files || []) files.delete(f.id); }
    items.set(x.id, x);
    if (mediaKey(x)) byMediaPath.set(mediaKey(x), x.id);
    const map = x.inItem ? children : sectionItems, key = x.inItem || x.sectionId;
    if (!map.has(key)) map.set(key, new Set()); map.get(key).add(x.id);
    for (const f of x.files || []) if (f.id && f.path) { files.set(f.id, f); byFilePath.set(String(x.sectionId) + '|' + path.normalize(f.path).toLowerCase(), x.id); }
  }
}
function removeCatalogItem(id) {
 catalogRevision++;
 const item=items.get(id);if(!item)return;
 if(item.inItem)children.get(item.inItem)?.delete(id);else sectionItems.get(item.sectionId)?.delete(id);
 for(const file of item.files||[])files.delete(file.id);
 items.delete(id);children.delete(id);
}
function mergeScanned(rows) {
  for (const record of rows) {
    const fileOwner = (record.files || []).map(f => byFilePath.get(String(record.sectionId) + '|' + path.normalize(f.path || '').toLowerCase())).find(Boolean);
    // Stable scanner IDs take precedence: virtual seasons can share one folder.
    let old = items.get(scannedAliases.get(record.id) || record.id);
    if (!old) {
      const candidate = items.get(fileOwner || byMediaPath.get(mediaKey(record)));
      if (candidate && !(record.type === 'season' && candidate.id.startsWith('sync-') && candidate.id !== record.id)) old = candidate;
    }
    if(record.type==='movie'){
      let parent=path.dirname(record.path||'');
      while(parent&&parent!==path.dirname(parent)){
        const owner=items.get(byMediaPath.get(String(record.sectionId)+'|movie|'+path.normalize(parent).toLowerCase().replace(/[\\/]+$/, '')));
        if(owner&&owner.id!==record.id){old=owner;break;}parent=path.dirname(parent);
      }
    }
    const id = old?.id || record.id;
    scannedAliases.set(record.id, id);
    const x = { ...old, ...record, ...(old&&record.type==='movie'?{path:old.path}:{}), id, inItem: scannedAliases.get(record.inItem) || record.inItem };
    if (old) { x.name = old.name || record.name; x.content = old.content || record.content; x.views = old.views; x.downloads = old.downloads; x.createdAt = old.createdAt; }
    const additions = (record.files || []).map(f => ({ ...f, id: old?.files?.find(v => v.path?.toLowerCase() === f.path?.toLowerCase())?.id || f.id, itemId: id }));
    x.files = [...(old?.files || []).filter(f => !additions.some(v => v.id === f.id)), ...additions];
    if (old?.inItem) { x.inItem = old.inItem; if (record.inItem) scannedAliases.set(record.inItem, old.inItem); }
    if(record.type==='movie'&&record.id!==id&&record.id.startsWith('sync-')&&items.has(record.id))removeCatalogItem(record.id);
    updateItems([x]);
    if (id !== record.id && children.has(record.id)) {
      for (const childId of [...children.get(record.id)]) { const child = items.get(childId); updateItems([{ ...child, inItem: id }]); }
      children.delete(record.id);
    }
  }
  itemAdmin?.apply();
  // The scanner publishes immediately; metadata and cover downloads use their own queue.
  metadata?.enqueueMissing(rows.map(x=>scannedAliases.get(x.id)||x.id));
}
const childRows = id => [...(children.get(id) || [])].map(k => items.get(k));
const sectionRow = id => sections.find(s => s.id === id);
const artworkItem=id=>{const item=items.get(id);return require('./movie-folder.cjs')(item,sectionRow(item?.sectionId));};
const topRows = () => {if(topCacheRevision!==catalogRevision){topCache=[...sectionItems.values()].flatMap(ids=>[...ids].map(id=>items.get(id))).filter(Boolean);topCacheRevision=catalogRevision;}return topCache.slice();};
function normalizedName(item){let cached=normalizedNames.get(item);if(!cached||cached.name!==item.name){cached={name:item.name,value:normalize(item.name)};normalizedNames.set(item,cached)}return cached.value;}
function searchRows(query,start,count){const key=normalize(query),at=Math.max(0,Number(start)||0),limit=Math.min(200,Math.max(1,Number(count)||100)),found=[];let skipped=0;for(const item of topRows()){if(!normalizedName(item).includes(key))continue;if(skipped++<at)continue;found.push(item);if(found.length>=limit)break}return found;}
function newest(count) {
  const result = { movies: [], series: [], pindItemsNew: [], singers: [] };
  for (const t of ['deen', 'sports', 'tv', 'learn', 'ramadan', 'kids', 'anime']) result['series.' + t] = [];
  for (const x of topRows().sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))) { const key = x.type === 'movie' ? 'movies' : x.type; if (result[key] && result[key].length < count) result[key].push(safeItem(x)); }
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
    const poster=posters?.file(id);if(poster)return stream(req,res,poster);
    const item=artworkItem(id);
    // Release the HTTP connection immediately; a disconnected share must never queue
    // navigation/API requests behind a screen full of image downloads.
    const result = artwork.peek(item);
    if(!result) artwork.read(item).catch(()=>{});
    if (result && !res.destroyed) {
      res.writeHead(200, { 'Content-Type': result.type, 'Content-Length': result.bytes.length, 'Cache-Control': 'private, max-age=300', 'X-Zain-Artwork': 'catalog-media-path' });
      res.end(req.method === 'HEAD' ? undefined : result.bytes); return;
    }
  }
  if(/^itemimage$/i.test(action)){const poster=posters?.file(id);if(poster)return stream(req,res,poster);}
  if (res.destroyed) return;
  const svg = '<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450"><rect width="300" height="450" fill="#202638"/><g transform="translate(75 200)">'+require('./legacy-artwork.cjs').loading+'</g></svg>';
  res.writeHead(200, { 'Content-Type': 'image/svg+xml', 'Cache-Control':'no-store', 'X-Zain-Placeholder': 'missing-artwork' }).end(req.method === 'HEAD' ? '' : svg);
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
    case 'starSections': return reply(sections.filter(s => s.star && s.is_hidden !== 'yes').map(safeSection));
    case 'getAllVIPSections': return reply(sections.filter(s => s.isVIP === 'yes' && s.is_hidden !== 'yes').map(safeSection));
    case 'getAllAds': return respond(res, { ads: [] });
    case 'getAllExts': return respond(res, { exts: [] });
    case 'getNumbers': { const rows = topRows(); return reply({ sections: [{ count: sections.length }], movies: [{ count: rows.filter(x => x.type === 'movie').length }], serieses: [{ count: rows.filter(x => x.type === 'series' || x.type.startsWith('series.')).length }], songs: [{ count: 0 }], books: [{ count: rows.filter(x => x.type === 'booksSameFolder').length }], apps: [{ count: 0 }] }); }
    case 'getSecType': return reply(safeSection(sectionRow(a[0])) || {});
    case 'getItems': case 'getItemsFiltered': {
      let rows = [...(sectionItems.get(a[2]) || [])].map(id => items.get(id));
      const query = normalize(a.slice(6).join('/')); if (query && !['undefined', 'null'].includes(query)) rows = rows.filter(x => normalizedName(x).includes(query));
      if (a[4] && !['all', 'undefined'].includes(a[4])) rows = rows.filter(x => String(x.content?.year) === a[4]);
      if (a[3] && !['all', 'undefined'].includes(a[3])) rows = rows.filter(x => require('./genre-filter.cjs').matches(x,a[3]));
      const order = a[5] || 'createdAt'; rows.sort((x, y) => order.includes('name') || order === 'alpha' ? x.name.localeCompare(y.name, 'ar') : order.includes('year') ? (+y.content?.year || 0) - (+x.content?.year || 0) : order.includes('rating') ? (+y.content?.imdb_ratings || 0) - (+x.content?.imdb_ratings || 0) : (+y.createdAt || 0) - (+x.createdAt || 0));
      return reply(list(rows, a[0], a[1]).map(safeItem));
    }
    case 'getItemsSearch': return reply(list(searchRows(a.slice(2).join('/'),a[0],a[1]), 0, a[1]).map(x => ({ ...safeItem(x), section: safeSection(sectionRow(x.sectionId)) || { name: 'قسم غير موجود' } })));
    case 'getLast20Items': return reply(topRows().sort((a, b) => (+b.createdAt || 0) - (+a.createdAt || 0)).slice(0, 20).map(safeItem));
    case 'getItemData': { const item = items.get(a[0]); return respond(res, item ? { ...detailItem(item), data: detailItem(item), item: detailItem(item), section: safeSection(sectionRow(item.sectionId)) } : {}, item ? 200 : 404); }
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
    if (route === '/zain/health') return respond(res, { service: 'zain', instanceId:crypto.createHash('sha256').update(controlToken).digest('hex'), version:release.version, ready, message: startupError || (ready ? 'الخادم يعمل' : 'جار تحميل قاعدة الاستراحة'), records: items.size, sections: sections.length, broadcast:broadcast?.status() });
    if (route === '/zain/control/stop') {
      if (req.method !== 'POST' || !['127.0.0.1', '::1', '::ffff:127.0.0.1'].includes(req.socket.remoteAddress) || req.headers['x-zain-control'] !== controlToken) return respond(res, {}, 403);
      respond(res, { ok: true }); setTimeout(shutdown, 100); return;
    }
    if (route === '/zain/control/update-stop') {
      if(req.method!=='POST'||!['127.0.0.1','::1','::ffff:127.0.0.1'].includes(req.socket.remoteAddress)||req.headers['x-zain-control']!==controlToken)return respond(res,{},403);
      if(updateClosing)return respond(res,{error:'التحديث قيد التنفيذ'},409);
      updateClosing=true;
      const reason=require('./update-gate.cjs')({ready,syncJobs:services?.syncJobs()||[],metadataJobs:metadata?.jobs()||[],isBusy:backups?.isBusy()||activeUpdateRequests>0,pendingRestore:fs.existsSync(path.join(data,'pending-restore.json'))});
      if(reason){updateClosing=false;return respond(res,{error:reason},409);}
      respond(res,{ok:true});setTimeout(shutdown,100);return;
    }
    if(updateClosing)return respond(res,{error:'جارٍ تحديث البرنامج؛ أعد المحاولة بعد قليل'},503);
    if(route.startsWith('/admin/api/')||route.startsWith('/api/')){
      activeUpdateRequests++;let counted=true;const done=()=>{if(counted){counted=false;activeUpdateRequests--;}};
      res.once('finish',done);res.once('close',done);
    }
    if (!ready) return respond(res, { error: startupError || 'جار تحميل القاعدة' }, 503);
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
    if (/^\/(sectionImage|SectionImage|ItemImage|itemImage|ExtImage|A-dImage)\//.test(route)) { const [, action, id] = route.split('/'); return image(req, res, action, id); }
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
async function shutdown() { if (stopping) return; stopping = true; admin?.recordEvent('إيقاف خادم الاستراحة','warning'); backups?.close(); metadata?.close(); await broadcast?.close(); artwork?.close(); scanArtwork?.close(); await services?.close(); await operations?.close(); server.close(() => process.exit(0)); setTimeout(() => { server.closeAllConnections(); process.exit(0); }, 4000).unref(); }
server.listen(port, config.bind, async () => {
  fs.writeFileSync(path.join(data, 'launcher-control.json'), JSON.stringify({ token: controlToken, port, pid: process.pid }));
  try {
    const source = JSON.parse(await fs.promises.readFile(path.join(base, 'assets/db/estra7ah.json'), 'utf8'));
    sections = source.sectionsData;
    settings = { ...pick(source.settings || {}, ['isApprove', 'main_name', 'main_desc', 'main_phone', 'main_facebook', 'mubasher_port', 'is_stop_constraction', 'is_only_app', 'estra7ah_type', 'show_movies', 'show_series', 'show_tvs', 'show_s_r', 'show_anime', 'show_kids', 'show_m_d', 'show_sports', 'show_learn']), main_name: 'استراحة زين' };
    updateItems(JSON.parse(await fs.promises.readFile(path.join(base, 'assets/db/estra7ah.items.json'), 'utf8')).itemsData);
    services = require('./services.cjs')({ dir: data, sections, onItems: mergeScanned });
    mergeScanned(await services.getStoredItems());
    content = require('./content-services.cjs')({ dir: data, source: { ...source, getItem: id => { const item = items.get(id); return item ? { ...safeItem(item), section: safeSection(sectionRow(item.sectionId)) } : null; } } });
    itemAdmin = require('./item-admin.cjs')({dir:data,items,safeItem,updateItems,removeItem:removeCatalogItem,prepareExclusive:item=>exclusiveArtwork.prepare(item)});
    speed=require('./speed.cjs')({dir:data});
    backups=require('./backups.cjs')({base,isSyncing:()=>services.syncJobs().some(j=>['running','queued'].includes(j.status)),onEvent:(...args)=>admin?.recordEvent(...args)});
    gemini=require('./gemini-search.cjs')({dir:data});
    const extensions = [content,itemAdmin,speed,gemini,require('./path-checks.cjs')({sections,services})];
    admin = require('./admin.cjs')({ dir: data, sections, settings, port, services, extensions, backups });
    posters=require('./poster-cache.cjs')({dir:data});
    exclusiveArtwork=require('./exclusive-artwork.cjs')({dir:data,getKey:()=>admin.getMetadataKey()||source.settings?.api_key||'',onEvent:admin.recordEvent,getLookupName:item=>{const own=artworkItem(item.id);return path.basename((own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path||'')||item.name;}});
    actorImages=require('./actor-images.cjs')({dir:data,cache:posters});
    artwork = require('./artwork.cjs')({ getItem: id => items.get(id) });
    scanArtwork=require('./artwork.cjs')({concurrency:1});
    const hasLocalArtwork=async item=>{const own={...artworkItem(item.id),inItem:null};const dir=(own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path;own.files=(own.files||[]).filter(f=>f.path&&dir&&path.relative(dir,f.path)&&!path.relative(dir,f.path).startsWith('..')&&!path.isAbsolute(path.relative(dir,f.path)));scanArtwork.invalidate(own);return Boolean(await scanArtwork.read(own));};
    metadata=require('./metadata.cjs')({items,translateDescription:gemini.translateDescription,canTranslateDescription:gemini.canTranslateDescription,getKey:()=>admin.getMetadataKey()||source.settings?.api_key||'',saveContent:itemAdmin.saveContent,onEvent:admin.recordEvent,hasArtwork:hasLocalArtwork,getLookupName:item=>{const own=artworkItem(item.id);return path.basename((own.files||[]).some(f=>f.path===own.path)?path.dirname(own.path):own.path||'')||item.name;},savePoster:async(id,poster)=>{
      if(!posters.file(id))await posters.save(id,poster);
      const original=items.get(id);const result=await require('./poster-folder.cjs')(require('./movie-folder.cjs')(original,sectionRow(original?.sectionId)),posters.file(id));
      if(result.status==='saved')artwork.invalidate(artworkItem(id));
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
    indexImages(); for(const row of topRows())normalizedName(row); ready = true; admin.recordEvent('تم تشغيل الاستراحة على المنفذ '+port+' والبث على '+settings.mubasher_port,'success'); console.log('Zain ready: http://127.0.0.1:' + port + '/; ' + items.size + ' records');
  } catch (e) { startupError = 'تعذر تحميل ملفات الخادم: ' + e.message; console.error(startupError); }
});
server.on('error', error => { console.error(error.message); process.exit(1); });
process.on('SIGTERM', shutdown); process.on('SIGINT', shutdown);
