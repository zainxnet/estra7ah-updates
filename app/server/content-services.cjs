'use strict';
const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto');

// Transport, administrator authentication, same-origin checks and request rate limits
// belong to the caller. args contains decoded path segments after the action name.
module.exports = function createContent({ dir, source = {} }) {
  fs.mkdirSync(dir, { recursive: true });
  const stateFile = path.join(dir, 'content.json'), backups = path.join(dir, 'backups');
  const adminReads = new Set(['getAllExtsAndNews', 'getAllReqs', 'getAllReports', 'getAllAds']);
  const adminActions = new Set([...adminReads, 'saveNewNews', 'updateNews', 'removeNews', 'removeAllReqs', 'removeAllReports', 'saveNewAd', 'saveNewExt', 'removeAd', 'removeExt']);
  const publicActions = new Set(['getAllNews', 'sendReq', 'sendReport', 'getAllAds', 'getAllExts']);
  const clone = value => structuredClone(value);
  const now = () => Math.floor(Date.now() / 1000);
  const result = (body, status = 200) => ({ body: clone(body), status });
  const fail = (error, status = 400) => result({ msg: 'error', error }, status);
  const ok = () => result({ msg: 'ok' });
  const sourceRows = value => Array.isArray(value) ? value : [];
  const pick = (row, fields) => Object.fromEntries(fields.filter(key => row[key] !== undefined).map(key => [key, clone(row[key])]));
  const importRows = (rows, fields) => sourceRows(rows).filter(row => row && typeof row.msg === 'string').map(row => pick(row, fields));
  const items = new Map(sourceRows(source.itemsData).map(item => [item.id, item]));
  const sections = new Map(sourceRows(source.sectionsData).map(section => [section.id, section]));
  function itemFor(id) {
    const item = typeof source.getItem === 'function' ? source.getItem(id) : items.get(id);
    if (!item) return null;
    const section = item.section || sections.get(item.sectionId);
    // The original report page reads both names without guarding item.section.
    return {
      id: String(item.id || id), name: String(item.name || ''),
      section: { ...(section?.id ? { id: String(section.id) } : {}), name: String(section?.name || 'قسم غير موجود') }
    };
  }
  function write(next, preservePrevious) {
    const serialized = JSON.stringify(next), temporary = stateFile + '.' + crypto.randomUUID() + '.tmp';
    if (preservePrevious) {
      fs.mkdirSync(backups, { recursive: true });
      fs.copyFileSync(stateFile, path.join(backups, 'content-' + Date.now() + '-' + crypto.randomUUID() + '.json'), fs.constants.COPYFILE_EXCL);
    }
    const fd = fs.openSync(temporary, 'wx');
    try { fs.writeFileSync(fd, serialized, 'utf8'); fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
    // Publish only the complete JSON; state changes after the atomic replacement.
    fs.renameSync(temporary, stateFile);
    state = next;
  }
  let state;
  if (fs.existsSync(stateFile)) {
    state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
    if (!state || !Array.isArray(state.news) || !Array.isArray(state.exts) || !Array.isArray(state.requests) || !Array.isArray(state.reports)) {
      throw Error('ملف خدمات المحتوى غير صالح؛ تم الاحتفاظ به دون تغيير');
    }
  } else {
    write({
      version: 1,
      ads: clone(sourceRows(source.ads || source.adsData || source.settings?.ads)),
      news: clone(sourceRows(source.news || source.newsData || source.settings?.news)),
      exts: clone(sourceRows(source.exts || source.extsData || source.settings?.exts)),
      requests: importRows(source.reqsData, ['msg', 'userId', 'time']),
      reports: importRows(source.reportsData, ['msg', 'itemId', 'time'])
    }, false);
  }
  if(!Array.isArray(state.ads))state.ads=[];
  const mediaDir=path.join(dir,'promotional-media');fs.mkdirSync(mediaDir,{recursive:true});
  function commit(change) {
    const next = clone(state);
    change(next);
    write(next, true);
    return ok();
  }
  function validText(value) {
    return typeof value === 'string' && value.trim().length > 0 && value.length <= 1000 && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(value);
  }
  function readReports() {
    return state.reports.map(row => {
      const safe = pick(row, ['msg', 'itemId', 'time']);
      // Keep orphaned historical reports readable: the legacy no-item branch
      // shows only the item ID and otherwise hides the report text and time.
      safe.item = itemFor(row.itemId) || {
        id: String(row.itemId || ''), name: 'عنصر غير متوفر', section: { name: 'قسم غير موجود' }
      };
      return safe;
    });
  }
  return {
    adminReads, adminActions,
    readBody:async(req,action)=>['saveNewAd','saveNewExt'].includes(action)?require('./multipart.cjs')(req):require('./text-body.cjs')(req),
    media(name){if(typeof name!=='string'||!/^[a-f0-9-]+\.(png|jpg|webp|gif|mp4|webm)$/.test(name))return null;const used=[...state.ads,...state.exts].some(row=>row.imageName===name||row.videoName===name);return used?path.join(mediaDir,name):null;},
    async admin(action, args = [], body = {}, method = 'GET') {
      if (!adminActions.has(action)) return null;
      const expected = ['saveNewNews','updateNews','saveNewAd','saveNewExt'].includes(action) ? 'POST' : 'GET';
      if (method !== expected) return fail('طريقة الطلب غير مدعومة', 405);
      try {
        if(action==='getAllAds')return result({ads:state.ads});
        if(action==='removeAd'||action==='removeExt'){
          const key=action==='removeAd'?'ads':'exts',title=args.join('/');
          const exact=state[key].filter(row=>row.title===title);
          const matches=exact.length?exact:state[key].filter(row=>typeof row.title==='string'&&row.title.trim()===title.trim());
          if(!matches.length)return fail('العنصر غير موجود',404);
          if(matches.length!==1)return fail('يوجد أكثر من عنصر بالعنوان نفسه؛ تعذر تحديد العنصر المطلوب حذفه',409);
          const at=state[key].indexOf(matches[0]);return commit(next=>{next[key].splice(at,1)});
        }
        if(action==='saveNewAd'||action==='saveNewExt'){
          const key=action==='saveNewAd'?'ads':'exts',prefix=key==='ads'?'ad':'ext',fields=body.fields||{},uploads=body.files||{};
          if(!validText(fields.title)||fields.title.length>200)return fail('عنوان العنصر مطلوب وبحد أقصى 200 حرف');
          if(fields.url){let link;try{link=new URL(fields.url)}catch{return fail('رابط غير صالح')}if(!['http:','https:'].includes(link.protocol)||link.username||link.password)return fail('رابط غير صالح');}
          for(const name of Object.keys(uploads))if(![prefix+'-image',prefix+'-video'].includes(name))return fail('ملف غير متوقع');
          const previous=state[key].find(row=>row.title===fields.title.trim()),row={...previous,title:fields.title.trim(),url:fields.url||'',clicks:previous?.clicks||0,views:previous?.views||0};
          if(key==='exts'){if(String(fields.desc||'').length>20000)return fail('وصف طويل');row.desc=fields.desc||'';row.tags=String(fields.tags||'').split(',').map(x=>x.trim()).filter(Boolean);row.rate=fields.rate||'';}
          const pending=[];
          for(const kind of ['image','video']){const upload=uploads[prefix+'-'+kind];if(!upload)continue;const b=upload.bytes;let ext;
            if(kind==='image'){if(b.length>8*1024*1024)return fail('الصورة تتجاوز 8 ميغابايت');if(b.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))ext='png';else if(b[0]===255&&b[1]===216&&b[2]===255)ext='jpg';else if(b.toString('ascii',0,4)==='RIFF'&&b.toString('ascii',8,12)==='WEBP')ext='webp';else if(/^GIF8[79]a/.test(b.toString('ascii',0,6)))ext='gif';}
            else{if(b.toString('ascii',4,8)==='ftyp')ext='mp4';else if(b.subarray(0,4).equals(Buffer.from([26,69,223,163])))ext='webm';}
            if(!ext)return fail('نوع ملف الصورة أو الفيديو غير مدعوم');const name=crypto.randomUUID()+'.'+ext;pending.push({name,bytes:b});row[kind==='image'?'imageName':'videoName']=name;
          }
          if(!row.imageName&&!row.videoName)return fail('أرفق صورة أو فيديو');
          for(const upload of pending)await fs.promises.writeFile(path.join(mediaDir,upload.name),upload.bytes,{flag:'wx'});
          return commit(next=>{const at=next[key].findIndex(x=>x.title===row.title);if(at>=0)next[key][at]=row;else next[key].push(row)});
        }
        if (action === 'getAllExtsAndNews') return result({ news: state.news, exts: state.exts });
        if (action === 'getAllReqs') return result(state.requests);
        if (action === 'getAllReports') return result(readReports());
        if(action==='updateNews'){
          const index=Number(body.index);if(!Number.isInteger(index)||!state.news[index]||state.news[index].text!==body.original)return fail('تغير الإعلان؛ حدّث الصفحة ثم حاول',409);
          if(!validText(body.text)||!/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(body.color||''))return fail('نص الإعلان أو لونه غير صالح');
          return commit(next=>{next.news[index]={...next.news[index],text:body.text.trim(),color:body.color}});
        }
        if (action === 'saveNewNews') {
          if (!validText(body?.text)) return fail('اكتب خبراً من 1 إلى 1000 حرف');
          if (typeof body.color !== 'string' || !/^#(?:[0-9a-f]{3}|[0-9a-f]{6})$/i.test(body.color)) return fail('لون الخبر غير صالح');
          // React renders original news/messages as text children, never as HTML.
          return commit(next => next.news.push({ text: body.text.trim(), color: body.color }));
        }
        if (action === 'removeNews') {
          const key = args.join('/');
          if (!validText(key)) return fail('نص الخبر المطلوب حذفه غير صالح');
          const matches = state.news.filter(row => typeof row.text === 'string' && row.text.replace(/\//g, '|') === key);
          if (!matches.length) return fail('الخبر غير موجود', 404);
          // Legacy URL encoding maps slash and literal pipe to the same key.
          // Refuse ambiguity instead of deleting a different announcement.
          if (new Set(matches.map(row => row.text)).size > 1) return fail('تعذر تحديد الخبر بسبب تشابه رابط الحذف', 409);
          return commit(next => { next.news = next.news.filter(row => row.text !== matches[0].text); });
        }
        if (action === 'removeAllReqs') return commit(next => { next.requests = []; });
        if (action === 'removeAllReports') return commit(next => { next.reports = []; });
      } catch (error) {
        return fail('تعذر حفظ أو قراءة بيانات المحتوى محلياً', 500);
      }
      return null;
    },
    async public(action, args = [], body = {}, method = 'GET', clientInfo = {}) {
      if (!publicActions.has(action)) return null;
      if (method !== (['getAllNews','getAllAds','getAllExts'].includes(action) ? 'GET' : 'POST')) return fail('طريقة الطلب غير مدعومة', 405);
      try {
        if(action==='getAllAds')return result({ads:state.ads});
        if(action==='getAllExts')return result({exts:state.exts});
        if (action === 'getAllNews') return result({ news: state.news });
        if (!validText(body?.msg)) return fail('اكتب رسالة من 1 إلى 1000 حرف');
        if (action === 'sendReq') {
          const row = { msg: body.msg.trim(), time: now() };
          // Ignore any identity in the submitted form; do not manufacture users.
          if (typeof clientInfo?.id === 'string' && clientInfo.id && clientInfo.id.length <= 200 && !/[\x00-\x1f]/.test(clientInfo.id)) row.userId = clientInfo.id;
          return commit(next => next.requests.push(row));
        }
        if (typeof body.itemId !== 'string' || !body.itemId || body.itemId.length > 200 || /[\x00-\x1f]/.test(body.itemId)) return fail('معرف العنصر غير صالح');
        if (!itemFor(body.itemId)) return fail('العنصر غير موجود', 404);
        return commit(next => next.reports.push({ msg: body.msg.trim(), itemId: body.itemId, time: now() }));
      } catch (error) {
        return fail('تعذر حفظ أو قراءة بيانات المحتوى محلياً', 500);
      }
    }
  };
};
