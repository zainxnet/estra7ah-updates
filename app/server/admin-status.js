(function () {
  'use strict';
  let creating=false,box;
  const sleep=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  function status(message){
    if(!box||!document.documentElement.contains(box)){
      box=document.createElement('div');box.id='zain-backup-download';box.dir='rtl';box.setAttribute('role','status');
      box.style.cssText='position:relative;margin:10px 0;padding:12px 16px;background:#202a40;border:1px solid #536581;border-radius:8px;color:white;font:14px Arial;line-height:1.8';
      const page=document.querySelector('.backups-cont'),top=document.querySelector('.topbar-cont');
      if(page)page.prepend(box);else if(top)top.parentNode.insertBefore(box,top.nextSibling);else document.body.append(box);
    }
    box.textContent=message;return box;
  }
  async function api(action,method='GET'){
    const control=new AbortController(),timer=setTimeout(()=>control.abort(),12000);
    try{const response=await fetch('/admin/api/'+action,{method,credentials:'same-origin',cache:'no-store',signal:control.signal}),data=await response.json();
      if(!response.ok||data.msg==='error'||data.msg==='login')throw Error(data.error||(response.status===401?'سجّل الدخول إلى لوحة التحكم ثم حاول مجددًا':'تعذر إنشاء النسخة الاحتياطية'));return data;
    }finally{clearTimeout(timer)}
  }
  async function createBackup(button){
    if(creating)return;creating=true;const disabled=button.disabled;button.disabled=true;button.setAttribute('aria-busy','true');
    status('جارٍ تجهيز نسخة مضغوطة كاملة لقاعدة البيانات… سيبدأ تنزيلها تلقائيًا عند الانتهاء.');
    try{
      const started=await api('saveDatabase?background=1','POST');const expires=Date.now()+16*60*1000;
      while(Date.now()<expires){
        await sleep(700);const result=await api('backupStatus?jobId='+encodeURIComponent(started.jobId)),job=result.job;
        if(!job)throw Error('تعذر متابعة النسخة؛ راجع قائمة النسخ المحلية أو أعد المحاولة.');
        if(job.status==='failed')throw Error(job.error||'تعذر تجهيز النسخة الاحتياطية');
        if(job.status!=='completed')continue;
        const panel=status('اكتملت النسخة المضغوطة ('+(Number(job.size)/1024/1024).toLocaleString('ar',{maximumFractionDigits:2})+' ميجابايت، '+job.fileCount+' ملفًا). تم طلب تنزيلها؛ إذا لم يبدأ استخدم الرابط التالي. '),link=document.createElement('a');
        link.href='/admin/api/download/'+encodeURIComponent(job.name);link.download=job.name;link.textContent='تنزيل النسخة مرة أخرى';
        link.style.cssText='color:#b7ddff;text-decoration:underline';panel.appendChild(link);link.click();
        window.dispatchEvent(new CustomEvent('zain-backup-created',{detail:{name:job.name,size:job.size}}));return;
      }
      throw Error('تأخر تجهيز النسخة؛ راجع قائمة النسخ المحلية وحالة النسخ قبل إعادة المحاولة.');
    }catch(error){status(error.name==='AbortError'?'تأخر الرد من الخادم؛ راجع قائمة النسخ المحلية قبل إعادة المحاولة.':error.message)}
    finally{creating=false;button.disabled=disabled;button.removeAttribute('aria-busy')}
  }
  // Both legacy controls previously either opened an empty tab or only saved on
  // the server. Capture the action before React's handler navigates away.
  document.addEventListener('click',event=>{
    if(!/^\/admin(?:\/|$)/.test(location.pathname)||event.button!==0)return;
    const anchor=event.target.closest&&event.target.closest('a[href]'),button=event.target.closest&&event.target.closest('button');let control;
    if(anchor){try{const url=new URL(anchor.href,location.href);if(url.origin===location.origin&&url.pathname==='/admin/api/backupNow')control=anchor.querySelector('button')||anchor}catch{}}
    if(!control&&button&&button.closest('.topbar-cont')&&button.textContent.trim()==='حفظ قاعدة البيانات')control=button;
    if(!control)return;event.preventDefault();event.stopImmediatePropagation();createBackup(control);
  },true);
})();

(function () {
  'use strict';

  if (document.getElementById('zain-sync-status')) return;

  const statusNames = {
    queued: 'في الانتظار', running: 'جارية', completed: 'اكتملت',
    failed: 'تعذرت', partial: 'اكتملت جزئياً', cancelled: 'أُوقفت'
  };
  const activeStatuses = new Set(['queued', 'running']);
  const sectionNames = new Map();
  const cards = new Map();
  const lastStates=new Map();let firstStatusLoad=true;
  function syncToast(message,good=true){let n=document.getElementById('zain-sync-toast');if(!n){n=document.createElement('div');n.id='zain-sync-toast';n.setAttribute('role','status');n.style.cssText='position:fixed;top:24px;left:24px;z-index:2147483647;color:white;padding:14px 22px;border-radius:10px;max-width:430px;font:16px sans-serif;direction:rtl;box-shadow:0 5px 20px #0005';document.body.append(n);}n.style.background=good?'#318c48':'#a54936';n.textContent=message;n.hidden=false;clearTimeout(n.hideTimer);n.hideTimer=setTimeout(()=>n.hidden=true,7000);}

  const cancelling = new Set();
  const number = new Intl.NumberFormat('ar');
  let knownJobs = [];
  let stoppingAll = false;
  let timer;
  let busy = false;
  let disposed = false;
  let expanded = false;
  let namesLoadedAt = 0;
  let lastAnnouncement = '';

  function element(tag, className, text) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }

  function count(value) {
    return number.format(Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0);
  }

  function bytes(value) {
    let size = Math.max(0, Number(value) || 0);
    const units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'];
    let unit = 0;
    while (size >= 1024 && unit < units.length - 1) { size /= 1024; unit++; }
    return new Intl.NumberFormat('ar', { maximumFractionDigits: unit ? 1 : 0 }).format(size) + ' ' + units[unit];
  }

  function sectionName(id) {
    return sectionNames.get(String(id)) || document.getElementById(String(id))?.querySelector('.title')?.textContent?.trim() || (id==null?'جميع الأقسام':'القسم المحدد');
  }

  const host = element('aside');
  host.id = 'zain-sync-status';
  host.dir = 'rtl';
  host.hidden = true;
  // The original stylesheet positions every element relatively; isolate this overlay.
  for (const [key, value] of Object.entries({position:'fixed',left:'12px',right:'auto',bottom:'12px',top:'auto',margin:'0',zIndex:'1000'})) {
    host.style.setProperty(key === 'zIndex' ? 'z-index' : key, value, 'important');
  }
  host.setAttribute('aria-label', 'متابعة مزامنة استراحة زين');
  const shadow = host.attachShadow({ mode: 'open' });
  const style = element('style');
  style.textContent = `
    :host{position:fixed;left:12px;bottom:12px;z-index:1000;display:block;width:310px;max-width:calc(100vw - 24px);color:#eef0f8;font:16px Arial,sans-serif;direction:rtl;text-align:right;color-scheme:dark}
    :host([hidden]),[hidden]{display:none!important}
    :host([data-expanded]){width:540px}
    *{box-sizing:border-box}
    .panel{background:#182236;border:1px solid #61749b;border-radius:10px;box-shadow:0 5px 20px #0005;overflow:hidden;font-family:Arial,sans-serif;font-size:16px;line-height:1.85}
    button{font:inherit;cursor:pointer;border:1px solid transparent;border-radius:6px;color:inherit;background:#293552}
    button:hover{background:#36446a}
    button:focus-visible,summary:focus-visible{outline:3px solid #a49eff;outline-offset:-3px}
    button:disabled{cursor:wait;opacity:.6}
    .toggle{display:flex;justify-content:space-between;align-items:center;gap:8px;width:100%;padding:9px 12px;border-radius:0;background:#222e48;text-align:right}
    .title{font-weight:700}.arrow{font-size:17px}
    .body{max-height:min(65vh,650px);overflow:auto;overscroll-behavior:contain;padding:14px}
    .note{color:#d8e2f5;font-size:15px;margin:0 0 12px}
    .notice{color:#ffdda3;background:#443929;border-radius:5px;padding:7px;margin-bottom:8px;overflow-wrap:anywhere}
    .job{border:1px solid #39455f;border-radius:7px;margin-bottom:9px;padding:9px;background:#151e31}
    .job:last-child{margin-bottom:0}
    .heading{display:flex;gap:7px;justify-content:space-between;align-items:flex-start}
    .name{margin:0;font-size:18px;overflow-wrap:anywhere;font-weight:700}
    .status{white-space:nowrap;font-size:15px;color:#d2cbff}
    .status[data-status="failed"],.error{color:#ffb0af}
    .status[data-status="completed"]{color:#9de2b3}
    .status[data-status="partial"]{color:#ffdda3}
    .stats{color:#eef2fc;font-size:16px;margin:10px 0;white-space:pre-line}
    .cancel{padding:3px 10px;margin:3px 0 6px;background:#513b46}
    summary{cursor:pointer;color:#c5befa;border-radius:4px;padding:3px 0}
    .path{border-top:1px solid #53627f;padding:10px 0;font-size:15px;overflow-wrap:anywhere}
    .path:first-child{margin-top:5px}
    .source,.current{display:block;direction:ltr;text-align:left;color:#b9c7df;unicode-bidi:plaintext;overflow-wrap:anywhere}
    .current{font-size:15px;color:#d5e2ff;background:#10192a;padding:8px;border-radius:5px}
    .error{margin-top:4px;white-space:pre-wrap;overflow-wrap:anywhere}
    .sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap}
    @media(max-width:480px){:host{bottom:8px;left:8px;max-width:calc(100vw - 16px)}.body{max-height:42vh}}
  `;
  const panel = element('div', 'panel');
  const toggle = element('button', 'toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'zain-sync-body');
  const title = element('span', 'title', 'المزامنة');
  const arrow = element('span', 'arrow', '▴');
  arrow.setAttribute('aria-hidden', 'true');
  toggle.append(title, arrow);
  const body = element('div', 'body');
  body.id = 'zain-sync-body';
  body.hidden = true;
  const note = element('p', 'note', 'الحجم المعروض لما اكتُشف أثناء المسح. تُحفظ النتائج تدريجياً.');
  const notice = element('div', 'notice');
  notice.hidden = true;
  notice.setAttribute('role', 'status');
  const list = element('div');
  const live = element('div', 'sr');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  body.append(note, notice, list);
  const stopAll = element('button', 'stop-all', 'إيقاف المزامنة');stopAll.type='button';stopAll.hidden=true;stopAll.style.cssText='margin:8px 12px;padding:9px 14px;background:#ad4249;color:white;font-weight:bold';stopAll.onclick=cancelAll;
  const inlineStop=element('button','admin-button red','إيقاف المزامنة');inlineStop.id='zain-stop-sync';inlineStop.type='button';inlineStop.title='إيقاف مهام مزامنة الأقسام الجارية والمنتظرة مع الاحتفاظ بالنتائج المحفوظة';inlineStop.style.cssText='display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#ad4249;color:white;border:0;border-radius:20px;padding:10px 18px;margin:5px;font:15px Arial;min-height:38px;cursor:pointer';inlineStop.onclick=cancelAll;
  panel.append(toggle, stopAll, body, live);
  shadow.append(style, panel);
  (document.body || document.documentElement).append(host);

  toggle.addEventListener('click', function () {
    expanded = !expanded;
    host.toggleAttribute('data-expanded', expanded);
    body.hidden = !expanded;
    toggle.setAttribute('aria-expanded', String(expanded));
    arrow.textContent = expanded ? '▾' : '▴';
  });

  window.addEventListener('zain-sync-requested',event=>{syncToast(event.detail?.ok?'تم بدء طلب المزامنة؛ جار فحص المسارات':'تعذر بدء المزامنة',!!event.detail?.ok);expanded=true;host.hidden=false;body.hidden=false;toggle.setAttribute('aria-expanded','true');title.textContent='جار فحص طلب المزامنة…';schedule(0);});
  function showNotice(message) {
    notice.textContent = message || '';
    notice.hidden = !message;
  }

  async function request(url, options) {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000);
    try {
      const response = await fetch(url, {
        credentials: 'same-origin', cache: 'no-store', signal: controller.signal,
        redirect: 'error', ...options
      });
      if (response.status === 401 || response.status === 403) {
        const error = new Error('سجّل الدخول لعرض المزامنة');
        error.auth = true;
        throw error;
      }
      const data = await response.json();
      if (!response.ok || data.msg === 'error') throw new Error(data.error || 'تعذر الاتصال بخادم المزامنة');
      return data;
    } finally { clearTimeout(timeout); }
  }

  function updateStopControls(jobs){
    const active=jobs.filter(j=>activeStatuses.has(j.status)),pending=active.some(j=>!j.cancelRequested);const label=stoppingAll||active.length&&!pending?'جارٍ الإيقاف…':'إيقاف المزامنة';for(const button of [stopAll,inlineStop]){button.disabled=stoppingAll||!pending;button.textContent=label;button.style.opacity=button.disabled?'.6':'1'}stopAll.hidden=!active.length;
    if(location.pathname==='/admin/sections'){const cont=document.querySelector('.sections-cont');if(cont&&!cont.contains(inlineStop)){const anchor=Array.from(cont.querySelectorAll('button,.admin-button')).find(b=>/مزامنة (?:الأ|الا)قسام/.test(b.textContent));if(anchor)anchor.parentNode.insertBefore(inlineStop,anchor.nextSibling);else cont.append(inlineStop)}}else inlineStop.remove();
  }
  async function cancelAll(){
    if(stoppingAll)return;stoppingAll=true;updateStopControls(knownJobs);let failures=0,sent=0;try{const data=await request('/admin/api/syncStatus');knownJobs=data.jobs;const pending=knownJobs.filter(j=>activeStatuses.has(j.status)&&!j.cancelRequested);for(const job of pending){try{await request('/admin/api/cancelSync/'+encodeURIComponent(job.id||job.jobId),{method:'POST'});job.cancelRequested=true;sent++}catch{failures++}}const message=failures?'تعذر إيقاف بعض المهام؛ أعد المحاولة.':sent?'أُرسل طلب إيقاف المزامنة. تبقى النتائج المحفوظة متاحة.':'لا توجد مزامنة جارية لإيقافها.';showNotice(message);syncToast(message,!failures);}catch(error){showNotice(error.message);syncToast(error.message,false)}finally{stoppingAll=false;render(knownJobs);if(!busy)schedule(100)}
  }
  async function cancel(id) {
    if (cancelling.has(id)) return;
    cancelling.add(id);
    render(knownJobs);
    showNotice('');
    try {
      await request('/admin/api/cancelSync/' + encodeURIComponent(id), { method: 'POST' });
      const job = knownJobs.find(value => String(value.id || value.jobId) === id);
      if (job) job.cancelRequested = true;
      showNotice('أُرسل طلب الإيقاف. تبقى النتائج التي حُفظت متاحة.');
    } catch (error) {
      showNotice(error.name === 'AbortError' ? 'لم يصل تأكيد الإيقاف؛ تُحدّث الحالة تلقائياً.' : error.message);
    } finally {
      cancelling.delete(id);
      render(knownJobs);
      if (!busy) schedule(100);
    }
  }

  function makeCard(id) {
    const root = element('article', 'job');
    const heading = element('div', 'heading');
    const name = element('h3', 'name');
    const status = element('span', 'status');
    heading.append(name, status);
    const stats = element('div', 'stats');
    const cancelButton = element('button', 'cancel', 'إيقاف المزامنة');
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => cancel(id));
    const details = element('details');
    const summary = element('summary');
    const paths = element('div');
    details.append(summary, paths);
    root.append(heading, stats, cancelButton, details);
    return { root, name, status, stats, cancelButton, summary, paths, pathNodes: new Map() };
  }

  function render(jobs) {
    updateStopControls(jobs);
    host.hidden = !jobs.length || !/^\/admin(?:\/|$)/.test(location.pathname);
    if (host.hidden) return;
    const activeCount = jobs.filter(job => activeStatuses.has(job.status)).length;
    const activeKey=jobs.filter(j=>activeStatuses.has(j.status)).map(j=>j.id||j.jobId).join(',');if(activeKey&&host.dataset.activeKey!==activeKey){expanded=true;body.hidden=false;toggle.setAttribute('aria-expanded','true');arrow.textContent='▾';}host.dataset.activeKey=activeKey;
    title.textContent = activeCount ? 'المزامنة · ' + count(activeCount) + ' جارية' : 'نتائج المزامنة · ' + count(jobs.length);
    const announcement = activeCount ? count(activeCount) + ' مهام مزامنة قيد التنفيذ' : 'انتهت مهام المزامنة؛ يمكنك مراجعة النتائج';
    if (announcement !== lastAnnouncement) {
      live.textContent = announcement;
      lastAnnouncement = announcement;
    }
    const present = new Set();
    const sorted = jobs.slice().sort((a, b) => {
      const activeDifference = Number(activeStatuses.has(b.status)) - Number(activeStatuses.has(a.status));
      return activeDifference || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    sorted.forEach((job, index) => {
      const id = String(job.id || job.jobId || index);
      present.add(id);
      let card = cards.get(id);
      if (!card) { card = makeCard(id); cards.set(id, card); }
      if (list.children[index] !== card.root) list.insertBefore(card.root, list.children[index] || null);
      card.name.textContent = job.sectionId == null ? 'مزامنة جميع الأقسام' : sectionName(job.sectionId);
      card.status.textContent = statusNames[job.status] || 'حالة غير معروفة';
      card.status.dataset.status = String(job.status || '');
      card.stats.textContent = 'الملفات: ' + count(job.files) + ' · العناصر المفهرسة: ' + count(job.indexedItems) + '\nالحجم المكتشف: ' + bytes(job.discoveredBytes);
      card.cancelButton.hidden = !activeStatuses.has(job.status);
      card.cancelButton.disabled = cancelling.has(id) || !!job.cancelRequested;
      card.cancelButton.textContent = card.cancelButton.disabled ? 'جارٍ الإيقاف…' : 'إيقاف المزامنة';
      const paths = Array.isArray(job.paths) ? job.paths : [];
      if(activeStatuses.has(job.status))card.summary.parentElement.open=true;
      card.summary.textContent = 'المسارات (' + count(paths.length) + ')';
      const currentPaths = new Set();
      paths.forEach((part, pathIndex) => {
        const key = String(part.id || pathIndex);
        currentPaths.add(key);
        let pathNode = card.pathNodes.get(key);
        if (!pathNode) {
          const root = element('div', 'path');
          const name = element('div');
          const source = element('bdi', 'source');
          const stats = element('div');
          const current = element('bdi', 'current');
          const error = element('div', 'error');
          root.append(name, source, stats, current, error);
          pathNode = { root, name, source, stats, current, error };
          card.pathNodes.set(key, pathNode);
          card.paths.append(root);
        }
        pathNode.name.textContent = sectionName(part.sectionId) + ' · ' + (statusNames[part.status] || 'حالة غير معروفة');
        pathNode.source.textContent = String(part.path || '');
        pathNode.stats.textContent = count(part.files) + ' ملفات · ' + bytes(part.discoveredBytes) + ' · ' + count(part.indexedItems) + ' عناصر';
        pathNode.current.textContent = part.currentPath ? String(part.currentPath) : '';
        pathNode.current.hidden = !pathNode.current.textContent;
        pathNode.error.textContent = String(part.error || '');
        pathNode.error.hidden = !part.error;
      });
      for (const [key, value] of card.pathNodes) {
        if (!currentPaths.has(key)) { value.root.remove(); card.pathNodes.delete(key); }
      }
    });
    for (const [id, card] of cards) {
      if (!present.has(id)) { card.root.remove(); cards.delete(id); }
    }
  }

  function schedule(delay) {
    clearTimeout(timer);
    if (!disposed) timer = setTimeout(poll, delay);
  }

  async function poll() {
    if (disposed || busy) return;
    if (!/^\/admin(?:\/|$)/.test(location.pathname)) {
      host.hidden = true;
      schedule(document.hidden ? 15000 : 2000);
      return;
    }
    busy = true;
    let authenticationRequired = false;
    try {
      const data = await request('/admin/api/syncStatus');
      if (!Array.isArray(data.jobs)) throw new Error('تعذر قراءة حالة المزامنة');
      for(const job of data.jobs){const id=String(job.id||job.jobId),previous=lastStates.get(id);if(previous&&previous!==job.status&&!activeStatuses.has(job.status))syncToast('المزامنة '+(statusNames[job.status]||job.status)+' — '+count(job.files)+' ملفات، '+count(job.indexedItems)+' عناصر',job.status==='completed');else if(!firstStatusLoad&&!previous&&activeStatuses.has(job.status))syncToast('بدأت مزامنة '+sectionName(job.sectionId));lastStates.set(id,job.status);}firstStatusLoad=false;
      knownJobs = data.jobs;
      if (knownJobs.length && Date.now() - namesLoadedAt > 60000) {
        try {
          const sections = await request('/admin/api/getAllJustSections');
          if (Array.isArray(sections)) {
            sectionNames.clear();
            sections.forEach(section => sectionNames.set(String(section.id), String(section.name || section.id)));
            namesLoadedAt = Date.now();
          }
        } catch (_) { /* Counters stay available even if section names cannot be refreshed. */ }
      }
      showNotice('');
      render(knownJobs);
    } catch (error) {
      if (error.auth) {
        authenticationRequired = true;
        host.hidden = true;
        knownJobs = [];
        sectionNames.clear();
        namesLoadedAt = 0;
      } else if (knownJobs.length) {
        showNotice('تعذر تحديث الحالة الآن. آخر نتائج معروضة؛ سنحاول تلقائياً.');
      }
    } finally {
      busy = false;
      schedule(document.hidden || authenticationRequired ? 15000 : 2000);
    }
  }

  document.addEventListener('visibilitychange', () => {
    if (!busy) schedule(document.hidden ? 15000 : 100);
  });
  window.addEventListener('pagehide', () => { disposed = true; clearTimeout(timer); });
  window.addEventListener('pageshow', () => {
    if (disposed) { disposed = false; schedule(100); }
  });
  schedule(100);
})();

(function(){'use strict';let panel,timer,closed=false;const labels={queued:'في الانتظار',running:'جارية',completed:'اكتملت',partial:'اكتملت جزئياً',interrupted:'توقفت بسبب خطأ',cancelled:'أوقفت'};async function poll(){try{if(location.pathname!=='/admin/events'){if(panel)panel.remove();panel=null;return;}const eventsList=document.querySelector('.localevents-cont .cont-ev');if(!eventsList)return;const response=await fetch('/admin/api/metadataStatus',{credentials:'same-origin',cache:'no-store'});if(!response.ok)return;const data=await response.json();if(!data.jobs.length)return;if(!panel){panel=document.createElement('section');panel.id='zain-metadata-events';panel.dir='rtl';panel.style.cssText='position:static;background:transparent;color:inherit;padding:12px 0;margin:0 0 12px;border-bottom:1px solid #39445b;max-width:100%;overflow-wrap:anywhere';eventsList.prepend(panel);}if(!panel.isConnected)eventsList.prepend(panel);panel.replaceChildren();const summary=document.createElement('h3');summary.textContent='مزامنة بيانات العناصر';panel.appendChild(summary);for(const job of data.jobs.slice(-5).reverse()){const row=document.createElement('p');row.textContent=(labels[job.status]||job.status)+' — '+job.completed+' محفوظ، '+job.failed+' تعذر، من '+job.total;panel.appendChild(row);if(['queued','running'].includes(job.status)){const cancel=document.createElement('button');cancel.textContent='إلغاء المزامنة';cancel.style.cssText='background:#ad4c4c;color:white;border:0;border-radius:18px;padding:8px 18px;cursor:pointer';cancel.onclick=async()=>{await fetch('/admin/api/cancelMetadata/'+encodeURIComponent(job.id),{method:'POST',credentials:'same-origin'});poll();};panel.appendChild(cancel);}for(const error of job.errors||[]){const line=document.createElement('p');line.textContent=(error.name||error.id)+': '+error.error;panel.appendChild(line);}}}catch{}finally{if(!closed)timer=setTimeout(poll,3000);}}window.addEventListener('pagehide',()=>{closed=true;clearTimeout(timer)});poll();})();
