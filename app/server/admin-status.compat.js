function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(typeof e + " is not iterable"); }
function ownKeys(e, r) { var t = Object.keys(e); if (Object.getOwnPropertySymbols) { var o = Object.getOwnPropertySymbols(e); r && (o = o.filter(function (r) { return Object.getOwnPropertyDescriptor(e, r).enumerable; })), t.push.apply(t, o); } return t; }
function _objectSpread(e) { for (var r = 1; r < arguments.length; r++) { var t = null != arguments[r] ? arguments[r] : {}; r % 2 ? ownKeys(Object(t), !0).forEach(function (r) { _defineProperty(e, r, t[r]); }) : Object.getOwnPropertyDescriptors ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(t)) : ownKeys(Object(t)).forEach(function (r) { Object.defineProperty(e, r, Object.getOwnPropertyDescriptor(t, r)); }); } return e; }
function _defineProperty(e, r, t) { return (r = _toPropertyKey(r)) in e ? Object.defineProperty(e, r, { value: t, enumerable: !0, configurable: !0, writable: !0 }) : e[r] = t, e; }
function _toPropertyKey(t) { var i = _toPrimitive(t, "string"); return "symbol" == typeof i ? i : i + ""; }
function _toPrimitive(t, r) { if ("object" != typeof t || !t) return t; var e = t[Symbol.toPrimitive]; if (void 0 !== e) { var i = e.call(t, r || "default"); if ("object" != typeof i) return i; throw new TypeError("@@toPrimitive must return a primitive value."); } return ("string" === r ? String : Number)(t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
(function () {
  'use strict';

  var creating = false,
    box;
  var sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function status(message) {
    if (!box || !document.documentElement.contains(box)) {
      box = document.createElement('div');
      box.id = 'zain-backup-download';
      box.dir = 'rtl';
      box.setAttribute('role', 'status');
      box.style.cssText = 'position:relative;margin:10px 0;padding:12px 16px;background:#202a40;border:1px solid #536581;border-radius:8px;color:white;font:14px Arial;line-height:1.8';
      var page = document.querySelector('.backups-cont'),
        top = document.querySelector('.topbar-cont');
      if (page) page.prepend(box);else if (top) top.parentNode.insertBefore(box, top.nextSibling);else document.body.append(box);
    }
    box.textContent = message;
    return box;
  }
  function api(_x) {
    return _api.apply(this, arguments);
  }
  function _api() {
    _api = _asyncToGenerator(_regenerator().m(function _callee(action, method = 'GET') {
      var control, timer, response, data;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            control = new AbortController(), timer = setTimeout(() => control.abort(), 12000);
            _context.p = 1;
            _context.n = 2;
            return fetch('/admin/api/' + action, {
              method,
              credentials: 'same-origin',
              cache: 'no-store',
              signal: control.signal
            });
          case 2:
            response = _context.v;
            _context.n = 3;
            return response.json();
          case 3:
            data = _context.v;
            if (!(!response.ok || data.msg === 'error' || data.msg === 'login')) {
              _context.n = 4;
              break;
            }
            throw Error(data.error || (response.status === 401 ? 'سجّل الدخول إلى لوحة التحكم ثم حاول مجددًا' : 'تعذر إنشاء النسخة الاحتياطية'));
          case 4:
            return _context.a(2, data);
          case 5:
            _context.p = 5;
            clearTimeout(timer);
            return _context.f(5);
          case 6:
            return _context.a(2);
        }
      }, _callee, null, [[1,, 5, 6]]);
    }));
    return _api.apply(this, arguments);
  }
  function createBackup(_x2) {
    return _createBackup.apply(this, arguments);
  }
  function _createBackup() {
    _createBackup = _asyncToGenerator(_regenerator().m(function _callee2(button) {
      var disabled, started, expires, result, job, panel, link, _t;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!creating) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            creating = true;
            disabled = button.disabled;
            button.disabled = true;
            button.setAttribute('aria-busy', 'true');
            status('جارٍ تجهيز نسخة مضغوطة كاملة لقاعدة البيانات… سيبدأ تنزيلها تلقائيًا عند الانتهاء.');
            _context2.p = 2;
            _context2.n = 3;
            return api('saveDatabase?background=1', 'POST');
          case 3:
            started = _context2.v;
            expires = Date.now() + 16 * 60 * 1000;
          case 4:
            if (!(Date.now() < expires)) {
              _context2.n = 10;
              break;
            }
            _context2.n = 5;
            return sleep(700);
          case 5:
            _context2.n = 6;
            return api('backupStatus?jobId=' + encodeURIComponent(started.jobId));
          case 6:
            result = _context2.v;
            job = result.job;
            if (job) {
              _context2.n = 7;
              break;
            }
            throw Error('تعذر متابعة النسخة؛ راجع قائمة النسخ المحلية أو أعد المحاولة.');
          case 7:
            if (!(job.status === 'failed')) {
              _context2.n = 8;
              break;
            }
            throw Error(job.error || 'تعذر تجهيز النسخة الاحتياطية');
          case 8:
            if (!(job.status !== 'completed')) {
              _context2.n = 9;
              break;
            }
            return _context2.a(3, 4);
          case 9:
            panel = status('اكتملت النسخة المضغوطة (' + (Number(job.size) / 1024 / 1024).toLocaleString('ar', {
              maximumFractionDigits: 2
            }) + ' ميجابايت، ' + job.fileCount + ' ملفًا). تم طلب تنزيلها؛ إذا لم يبدأ استخدم الرابط التالي. '), link = document.createElement('a');
            link.href = '/admin/api/download/' + encodeURIComponent(job.name);
            link.download = job.name;
            link.textContent = 'تنزيل النسخة مرة أخرى';
            link.style.cssText = 'color:#b7ddff;text-decoration:underline';
            panel.appendChild(link);
            link.click();
            window.dispatchEvent(new CustomEvent('zain-backup-created', {
              detail: {
                name: job.name,
                size: job.size
              }
            }));
            return _context2.a(2);
          case 10:
            throw Error('تأخر تجهيز النسخة؛ راجع قائمة النسخ المحلية وحالة النسخ قبل إعادة المحاولة.');
          case 11:
            _context2.p = 11;
            _t = _context2.v;
            status(_t.name === 'AbortError' ? 'تأخر الرد من الخادم؛ راجع قائمة النسخ المحلية قبل إعادة المحاولة.' : _t.message);
          case 12:
            _context2.p = 12;
            creating = false;
            button.disabled = disabled;
            button.removeAttribute('aria-busy');
            return _context2.f(12);
          case 13:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 11, 12, 13]]);
    }));
    return _createBackup.apply(this, arguments);
  }
  document.addEventListener('click', event => {
    if (!/^\/admin(?:\/|$)/.test(location.pathname) || event.button !== 0) return;
    var anchor = event.target.closest && event.target.closest('a[href]'),
      button = event.target.closest && event.target.closest('button');
    var control;
    if (anchor) {
      try {
        var url = new URL(anchor.href, location.href);
        if (url.origin === location.origin && url.pathname === '/admin/api/backupNow') control = anchor.querySelector('button') || anchor;
      } catch (_unused) {}
    }
    if (!control && button && button.closest('.topbar-cont') && button.textContent.trim() === 'حفظ قاعدة البيانات') control = button;
    if (!control) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    createBackup(control);
  }, true);
})();
(function () {
  'use strict';

  if (document.getElementById('zain-sync-status')) return;
  var statusNames = {
    queued: 'في الانتظار',
    running: 'جارية',
    completed: 'اكتملت',
    failed: 'تعذرت',
    partial: 'اكتملت جزئياً',
    cancelled: 'أُوقفت'
  };
  var activeStatuses = new Set(['queued', 'running']);
  var sectionNames = new Map();
  var cards = new Map();
  var lastStates = new Map();
  var firstStatusLoad = true;
  function syncToast(message, good = true) {
    var n = document.getElementById('zain-sync-toast');
    if (!n) {
      n = document.createElement('div');
      n.id = 'zain-sync-toast';
      n.setAttribute('role', 'status');
      n.style.cssText = 'position:fixed;top:24px;left:24px;z-index:2147483647;color:white;padding:14px 22px;border-radius:10px;max-width:430px;font:16px sans-serif;direction:rtl;box-shadow:0 5px 20px #0005';
      document.body.append(n);
    }
    n.style.background = good ? '#318c48' : '#a54936';
    n.textContent = message;
    n.hidden = false;
    clearTimeout(n.hideTimer);
    n.hideTimer = setTimeout(() => n.hidden = true, 7000);
  }
  var cancelling = new Set();
  var number = new Intl.NumberFormat('ar');
  var knownJobs = [];
  var stoppingAll = false;
  var timer;
  var busy = false;
  var disposed = false;
  var expanded = false;
  var namesLoadedAt = 0;
  var lastAnnouncement = '';
  function element(tag, className, text) {
    var node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  }
  function count(value) {
    return number.format(Number.isFinite(Number(value)) ? Math.max(0, Number(value)) : 0);
  }
  function bytes(value) {
    var size = Math.max(0, Number(value) || 0);
    var units = ['بايت', 'ك.ب', 'م.ب', 'ج.ب', 'ت.ب'];
    var unit = 0;
    while (size >= 1024 && unit < units.length - 1) {
      size /= 1024;
      unit++;
    }
    return new Intl.NumberFormat('ar', {
      maximumFractionDigits: unit ? 1 : 0
    }).format(size) + ' ' + units[unit];
  }
  function sectionName(id) {
    var _document$getElementB;
    return sectionNames.get(String(id)) || ((_document$getElementB = document.getElementById(String(id))) === null || _document$getElementB === void 0 || (_document$getElementB = _document$getElementB.querySelector('.title')) === null || _document$getElementB === void 0 || (_document$getElementB = _document$getElementB.textContent) === null || _document$getElementB === void 0 ? void 0 : _document$getElementB.trim()) || (id == null ? 'جميع الأقسام' : 'القسم المحدد');
  }
  var host = element('aside');
  host.id = 'zain-sync-status';
  host.dir = 'rtl';
  host.hidden = true;
  for (var _i = 0, _Object$entries = Object.entries({
      position: 'fixed',
      left: '12px',
      right: 'auto',
      bottom: '12px',
      top: 'auto',
      margin: '0',
      zIndex: '1000'
    }); _i < _Object$entries.length; _i++) {
    var _Object$entries$_i = _slicedToArray(_Object$entries[_i], 2),
      key = _Object$entries$_i[0],
      value = _Object$entries$_i[1];
    host.style.setProperty(key === 'zIndex' ? 'z-index' : key, value, 'important');
  }
  host.setAttribute('aria-label', 'متابعة مزامنة استراحة زين');
  var shadow = host.attachShadow({
    mode: 'open'
  });
  var style = element('style');
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
  var panel = element('div', 'panel');
  var toggle = element('button', 'toggle');
  toggle.type = 'button';
  toggle.setAttribute('aria-expanded', 'false');
  toggle.setAttribute('aria-controls', 'zain-sync-body');
  var title = element('span', 'title', 'المزامنة');
  var arrow = element('span', 'arrow', '▴');
  arrow.setAttribute('aria-hidden', 'true');
  toggle.append(title, arrow);
  var body = element('div', 'body');
  body.id = 'zain-sync-body';
  body.hidden = true;
  var note = element('p', 'note', 'الحجم المعروض لما اكتُشف أثناء المسح. تُحفظ النتائج تدريجياً.');
  var notice = element('div', 'notice');
  notice.hidden = true;
  notice.setAttribute('role', 'status');
  var list = element('div');
  var live = element('div', 'sr');
  live.setAttribute('role', 'status');
  live.setAttribute('aria-live', 'polite');
  body.append(note, notice, list);
  var stopAll = element('button', 'stop-all', 'إيقاف المزامنة');
  stopAll.type = 'button';
  stopAll.hidden = true;
  stopAll.style.cssText = 'margin:8px 12px;padding:9px 14px;background:#ad4249;color:white;font-weight:bold';
  stopAll.onclick = cancelAll;
  var inlineStop = element('button', 'admin-button red', 'إيقاف المزامنة');
  inlineStop.id = 'zain-stop-sync';
  inlineStop.type = 'button';
  inlineStop.title = 'إيقاف مهام مزامنة الأقسام الجارية والمنتظرة مع الاحتفاظ بالنتائج المحفوظة';
  inlineStop.style.cssText = 'display:inline-flex;align-items:center;justify-content:center;gap:8px;background:#ad4249;color:white;border:0;border-radius:20px;padding:10px 18px;margin:5px;font:15px Arial;min-height:38px;cursor:pointer';
  inlineStop.onclick = cancelAll;
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
  window.addEventListener('zain-sync-requested', event => {
    var _event$detail, _event$detail2;
    syncToast((_event$detail = event.detail) !== null && _event$detail !== void 0 && _event$detail.ok ? 'تم بدء طلب المزامنة؛ جار فحص المسارات' : 'تعذر بدء المزامنة', !!((_event$detail2 = event.detail) !== null && _event$detail2 !== void 0 && _event$detail2.ok));
    expanded = true;
    host.hidden = false;
    body.hidden = false;
    toggle.setAttribute('aria-expanded', 'true');
    title.textContent = 'جار فحص طلب المزامنة…';
    schedule(0);
  });
  function showNotice(message) {
    notice.textContent = message || '';
    notice.hidden = !message;
  }
  function request(_x3, _x4) {
    return _request.apply(this, arguments);
  }
  function _request() {
    _request = _asyncToGenerator(_regenerator().m(function _callee3(url, options) {
      var controller, timeout, response, error, data;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            controller = new AbortController();
            timeout = setTimeout(() => controller.abort(), 8000);
            _context3.p = 1;
            _context3.n = 2;
            return fetch(url, _objectSpread({
              credentials: 'same-origin',
              cache: 'no-store',
              signal: controller.signal,
              redirect: 'error'
            }, options));
          case 2:
            response = _context3.v;
            if (!(response.status === 401 || response.status === 403)) {
              _context3.n = 3;
              break;
            }
            error = new Error('سجّل الدخول لعرض المزامنة');
            error.auth = true;
            throw error;
          case 3:
            _context3.n = 4;
            return response.json();
          case 4:
            data = _context3.v;
            if (!(!response.ok || data.msg === 'error')) {
              _context3.n = 5;
              break;
            }
            throw new Error(data.error || 'تعذر الاتصال بخادم المزامنة');
          case 5:
            return _context3.a(2, data);
          case 6:
            _context3.p = 6;
            clearTimeout(timeout);
            return _context3.f(6);
          case 7:
            return _context3.a(2);
        }
      }, _callee3, null, [[1,, 6, 7]]);
    }));
    return _request.apply(this, arguments);
  }
  function updateStopControls(jobs) {
    var active = jobs.filter(j => activeStatuses.has(j.status)),
      pending = active.some(j => !j.cancelRequested);
    var label = stoppingAll || active.length && !pending ? 'جارٍ الإيقاف…' : 'إيقاف المزامنة';
    for (var _i2 = 0, _arr = [stopAll, inlineStop]; _i2 < _arr.length; _i2++) {
      var button = _arr[_i2];
      button.disabled = stoppingAll || !pending;
      button.textContent = label;
      button.style.opacity = button.disabled ? '.6' : '1';
    }
    stopAll.hidden = !active.length;
    if (location.pathname === '/admin/sections') {
      var cont = document.querySelector('.sections-cont');
      if (cont && !cont.contains(inlineStop)) {
        var anchor = Array.from(cont.querySelectorAll('button,.admin-button')).find(b => /مزامنة (?:الأ|الا)قسام/.test(b.textContent));
        if (anchor) anchor.parentNode.insertBefore(inlineStop, anchor.nextSibling);else cont.append(inlineStop);
      }
    } else inlineStop.remove();
  }
  function cancelAll() {
    return _cancelAll.apply(this, arguments);
  }
  function _cancelAll() {
    _cancelAll = _asyncToGenerator(_regenerator().m(function _callee4() {
      var failures, sent, data, pending, _iterator3, _step3, job, message, _t2, _t3, _t4;
      return _regenerator().w(function (_context4) {
        while (1) switch (_context4.p = _context4.n) {
          case 0:
            if (!stoppingAll) {
              _context4.n = 1;
              break;
            }
            return _context4.a(2);
          case 1:
            stoppingAll = true;
            updateStopControls(knownJobs);
            failures = 0, sent = 0;
            _context4.p = 2;
            _context4.n = 3;
            return request('/admin/api/syncStatus');
          case 3:
            data = _context4.v;
            knownJobs = data.jobs;
            pending = knownJobs.filter(j => activeStatuses.has(j.status) && !j.cancelRequested);
            _iterator3 = _createForOfIteratorHelper(pending);
            _context4.p = 4;
            _iterator3.s();
          case 5:
            if ((_step3 = _iterator3.n()).done) {
              _context4.n = 10;
              break;
            }
            job = _step3.value;
            _context4.p = 6;
            _context4.n = 7;
            return request('/admin/api/cancelSync/' + encodeURIComponent(job.id || job.jobId), {
              method: 'POST'
            });
          case 7:
            job.cancelRequested = true;
            sent++;
            _context4.n = 9;
            break;
          case 8:
            _context4.p = 8;
            _t2 = _context4.v;
            failures++;
          case 9:
            _context4.n = 5;
            break;
          case 10:
            _context4.n = 12;
            break;
          case 11:
            _context4.p = 11;
            _t3 = _context4.v;
            _iterator3.e(_t3);
          case 12:
            _context4.p = 12;
            _iterator3.f();
            return _context4.f(12);
          case 13:
            message = failures ? 'تعذر إيقاف بعض المهام؛ أعد المحاولة.' : sent ? 'أُرسل طلب إيقاف المزامنة. تبقى النتائج المحفوظة متاحة.' : 'لا توجد مزامنة جارية لإيقافها.';
            showNotice(message);
            syncToast(message, !failures);
            _context4.n = 15;
            break;
          case 14:
            _context4.p = 14;
            _t4 = _context4.v;
            showNotice(_t4.message);
            syncToast(_t4.message, false);
          case 15:
            _context4.p = 15;
            stoppingAll = false;
            render(knownJobs);
            if (!busy) schedule(100);
            return _context4.f(15);
          case 16:
            return _context4.a(2);
        }
      }, _callee4, null, [[6, 8], [4, 11, 12, 13], [2, 14, 15, 16]]);
    }));
    return _cancelAll.apply(this, arguments);
  }
  function cancel(_x5) {
    return _cancel.apply(this, arguments);
  }
  function _cancel() {
    _cancel = _asyncToGenerator(_regenerator().m(function _callee5(id) {
      var job, _t5;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            if (!cancelling.has(id)) {
              _context5.n = 1;
              break;
            }
            return _context5.a(2);
          case 1:
            cancelling.add(id);
            render(knownJobs);
            showNotice('');
            _context5.p = 2;
            _context5.n = 3;
            return request('/admin/api/cancelSync/' + encodeURIComponent(id), {
              method: 'POST'
            });
          case 3:
            job = knownJobs.find(value => String(value.id || value.jobId) === id);
            if (job) job.cancelRequested = true;
            showNotice('أُرسل طلب الإيقاف. تبقى النتائج التي حُفظت متاحة.');
            _context5.n = 5;
            break;
          case 4:
            _context5.p = 4;
            _t5 = _context5.v;
            showNotice(_t5.name === 'AbortError' ? 'لم يصل تأكيد الإيقاف؛ تُحدّث الحالة تلقائياً.' : _t5.message);
          case 5:
            _context5.p = 5;
            cancelling.delete(id);
            render(knownJobs);
            if (!busy) schedule(100);
            return _context5.f(5);
          case 6:
            return _context5.a(2);
        }
      }, _callee5, null, [[2, 4, 5, 6]]);
    }));
    return _cancel.apply(this, arguments);
  }
  function makeCard(id) {
    var root = element('article', 'job');
    var heading = element('div', 'heading');
    var name = element('h3', 'name');
    var status = element('span', 'status');
    heading.append(name, status);
    var stats = element('div', 'stats');
    var cancelButton = element('button', 'cancel', 'إيقاف المزامنة');
    cancelButton.type = 'button';
    cancelButton.addEventListener('click', () => cancel(id));
    var details = element('details');
    var summary = element('summary');
    var paths = element('div');
    details.append(summary, paths);
    root.append(heading, stats, cancelButton, details);
    return {
      root,
      name,
      status,
      stats,
      cancelButton,
      summary,
      paths,
      pathNodes: new Map()
    };
  }
  function render(jobs) {
    updateStopControls(jobs);
    host.hidden = !jobs.length || !/^\/admin(?:\/|$)/.test(location.pathname);
    if (host.hidden) return;
    var activeCount = jobs.filter(job => activeStatuses.has(job.status)).length;
    var activeKey = jobs.filter(j => activeStatuses.has(j.status)).map(j => j.id || j.jobId).join(',');
    if (activeKey && host.dataset.activeKey !== activeKey) {
      expanded = true;
      body.hidden = false;
      toggle.setAttribute('aria-expanded', 'true');
      arrow.textContent = '▾';
    }
    host.dataset.activeKey = activeKey;
    title.textContent = activeCount ? 'المزامنة · ' + count(activeCount) + ' جارية' : 'نتائج المزامنة · ' + count(jobs.length);
    var announcement = activeCount ? count(activeCount) + ' مهام مزامنة قيد التنفيذ' : 'انتهت مهام المزامنة؛ يمكنك مراجعة النتائج';
    if (announcement !== lastAnnouncement) {
      live.textContent = announcement;
      lastAnnouncement = announcement;
    }
    var present = new Set();
    var sorted = jobs.slice().sort((a, b) => {
      var activeDifference = Number(activeStatuses.has(b.status)) - Number(activeStatuses.has(a.status));
      return activeDifference || String(b.createdAt || '').localeCompare(String(a.createdAt || ''));
    });
    sorted.forEach((job, index) => {
      var id = String(job.id || job.jobId || index);
      present.add(id);
      var card = cards.get(id);
      if (!card) {
        card = makeCard(id);
        cards.set(id, card);
      }
      if (list.children[index] !== card.root) list.insertBefore(card.root, list.children[index] || null);
      card.name.textContent = job.sectionId == null ? 'مزامنة جميع الأقسام' : sectionName(job.sectionId);
      card.status.textContent = statusNames[job.status] || 'حالة غير معروفة';
      card.status.dataset.status = String(job.status || '');
      card.stats.textContent = 'الملفات: ' + count(job.files) + ' · العناصر المفهرسة: ' + count(job.indexedItems) + '\nالحجم المكتشف: ' + bytes(job.discoveredBytes);
      card.cancelButton.hidden = !activeStatuses.has(job.status);
      card.cancelButton.disabled = cancelling.has(id) || !!job.cancelRequested;
      card.cancelButton.textContent = card.cancelButton.disabled ? 'جارٍ الإيقاف…' : 'إيقاف المزامنة';
      var paths = Array.isArray(job.paths) ? job.paths : [];
      if (activeStatuses.has(job.status)) card.summary.parentElement.open = true;
      card.summary.textContent = 'المسارات (' + count(paths.length) + ')';
      var currentPaths = new Set();
      paths.forEach((part, pathIndex) => {
        var key = String(part.id || pathIndex);
        currentPaths.add(key);
        var pathNode = card.pathNodes.get(key);
        if (!pathNode) {
          var root = element('div', 'path');
          var name = element('div');
          var source = element('bdi', 'source');
          var stats = element('div');
          var current = element('bdi', 'current');
          var error = element('div', 'error');
          root.append(name, source, stats, current, error);
          pathNode = {
            root,
            name,
            source,
            stats,
            current,
            error
          };
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
      var _iterator = _createForOfIteratorHelper(card.pathNodes),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var _step$value = _slicedToArray(_step.value, 2),
            _key = _step$value[0],
            _value = _step$value[1];
          if (!currentPaths.has(_key)) {
            _value.root.remove();
            card.pathNodes.delete(_key);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    });
    var _iterator2 = _createForOfIteratorHelper(cards),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _step2$value = _slicedToArray(_step2.value, 2),
          id = _step2$value[0],
          card = _step2$value[1];
        if (!present.has(id)) {
          card.root.remove();
          cards.delete(id);
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }
  function schedule(delay) {
    clearTimeout(timer);
    if (!disposed) timer = setTimeout(poll, delay);
  }
  function poll() {
    return _poll.apply(this, arguments);
  }
  function _poll() {
    _poll = _asyncToGenerator(_regenerator().m(function _callee6() {
      var authenticationRequired, data, _iterator4, _step4, job, id, previous, sections, _t6, _t7;
      return _regenerator().w(function (_context6) {
        while (1) switch (_context6.p = _context6.n) {
          case 0:
            if (!(disposed || busy)) {
              _context6.n = 1;
              break;
            }
            return _context6.a(2);
          case 1:
            if (/^\/admin(?:\/|$)/.test(location.pathname)) {
              _context6.n = 2;
              break;
            }
            host.hidden = true;
            schedule(document.hidden ? 15000 : 2000);
            return _context6.a(2);
          case 2:
            busy = true;
            authenticationRequired = false;
            _context6.p = 3;
            _context6.n = 4;
            return request('/admin/api/syncStatus');
          case 4:
            data = _context6.v;
            if (Array.isArray(data.jobs)) {
              _context6.n = 5;
              break;
            }
            throw new Error('تعذر قراءة حالة المزامنة');
          case 5:
            _iterator4 = _createForOfIteratorHelper(data.jobs);
            try {
              for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
                job = _step4.value;
                id = String(job.id || job.jobId), previous = lastStates.get(id);
                if (previous && previous !== job.status && !activeStatuses.has(job.status)) syncToast('المزامنة ' + (statusNames[job.status] || job.status) + ' — ' + count(job.files) + ' ملفات، ' + count(job.indexedItems) + ' عناصر', job.status === 'completed');else if (!firstStatusLoad && !previous && activeStatuses.has(job.status)) syncToast('بدأت مزامنة ' + sectionName(job.sectionId));
                lastStates.set(id, job.status);
              }
            } catch (err) {
              _iterator4.e(err);
            } finally {
              _iterator4.f();
            }
            firstStatusLoad = false;
            knownJobs = data.jobs;
            if (!(knownJobs.length && Date.now() - namesLoadedAt > 60000)) {
              _context6.n = 9;
              break;
            }
            _context6.p = 6;
            _context6.n = 7;
            return request('/admin/api/getAllJustSections');
          case 7:
            sections = _context6.v;
            if (Array.isArray(sections)) {
              sectionNames.clear();
              sections.forEach(section => sectionNames.set(String(section.id), String(section.name || section.id)));
              namesLoadedAt = Date.now();
            }
            _context6.n = 9;
            break;
          case 8:
            _context6.p = 8;
            _t6 = _context6.v;
          case 9:
            showNotice('');
            render(knownJobs);
            _context6.n = 11;
            break;
          case 10:
            _context6.p = 10;
            _t7 = _context6.v;
            if (_t7.auth) {
              authenticationRequired = true;
              host.hidden = true;
              knownJobs = [];
              sectionNames.clear();
              namesLoadedAt = 0;
            } else if (knownJobs.length) {
              showNotice('تعذر تحديث الحالة الآن. آخر نتائج معروضة؛ سنحاول تلقائياً.');
            }
          case 11:
            _context6.p = 11;
            busy = false;
            schedule(document.hidden || authenticationRequired ? 15000 : 2000);
            return _context6.f(11);
          case 12:
            return _context6.a(2);
        }
      }, _callee6, null, [[6, 8], [3, 10, 11, 12]]);
    }));
    return _poll.apply(this, arguments);
  }
  document.addEventListener('visibilitychange', () => {
    if (!busy) schedule(document.hidden ? 15000 : 100);
  });
  window.addEventListener('pagehide', () => {
    disposed = true;
    clearTimeout(timer);
  });
  window.addEventListener('pageshow', () => {
    if (disposed) {
      disposed = false;
      schedule(100);
    }
  });
  schedule(100);
})();
(function () {
  'use strict';

  var panel,
    timer,
    closed = false;
  var labels = {
    queued: 'في الانتظار',
    running: 'جارية',
    completed: 'اكتملت',
    partial: 'اكتملت جزئياً',
    interrupted: 'توقفت بسبب خطأ',
    cancelled: 'أوقفت'
  };
  function poll() {
    return _poll2.apply(this, arguments);
  }
  function _poll2() {
    _poll2 = _asyncToGenerator(_regenerator().m(function _callee9() {
      var eventsList, response, data, summary, stop, _iterator5, _step5, _loop, _t9, _t0;
      return _regenerator().w(function (_context0) {
        while (1) switch (_context0.p = _context0.n) {
          case 0:
            _context0.p = 0;
            if (!(location.pathname !== '/admin/events')) {
              _context0.n = 1;
              break;
            }
            if (panel) panel.remove();
            panel = null;
            return _context0.a(2);
          case 1:
            eventsList = document.querySelector('.localevents-cont .cont-ev');
            if (eventsList) {
              _context0.n = 2;
              break;
            }
            return _context0.a(2);
          case 2:
            _context0.n = 3;
            return fetch('/admin/api/metadataStatus', {
              credentials: 'same-origin',
              cache: 'no-store'
            });
          case 3:
            response = _context0.v;
            if (response.ok) {
              _context0.n = 4;
              break;
            }
            return _context0.a(2);
          case 4:
            _context0.n = 5;
            return response.json();
          case 5:
            data = _context0.v;
            if (data.jobs.length) {
              _context0.n = 6;
              break;
            }
            return _context0.a(2);
          case 6:
            if (!panel) {
              panel = document.createElement('section');
              panel.id = 'zain-metadata-events';
              panel.dir = 'rtl';
              panel.style.cssText = 'position:static;background:transparent;color:inherit;padding:12px 0;margin:0 0 12px;border-bottom:1px solid #39445b;max-width:100%;overflow-wrap:anywhere';
              eventsList.prepend(panel);
            }
            if (!panel.isConnected) eventsList.prepend(panel);
            panel.replaceChildren();
            summary = document.createElement('h3');
            summary.textContent = 'مزامنة بيانات العناصر';
            panel.appendChild(summary);
            if (data.jobs.some(job => ['queued', 'running'].includes(job.status))) {
              stop = document.createElement('button');
              stop.textContent = 'إلغاء جميع مهام مزامنة البيانات';
              stop.style.cssText = 'background:#cf303d;color:white;border:0;border-radius:6px;padding:10px 18px;font-weight:bold;cursor:pointer';
              stop.onclick = _asyncToGenerator(_regenerator().m(function _callee7() {
                var result, _t8;
                return _regenerator().w(function (_context7) {
                  while (1) switch (_context7.p = _context7.n) {
                    case 0:
                      stop.disabled = true;
                      _context7.p = 1;
                      _context7.n = 2;
                      return fetch('/admin/api/cancelAllMetadata', {
                        method: 'POST',
                        credentials: 'same-origin'
                      });
                    case 2:
                      result = _context7.v;
                      if (result.ok) {
                        _context7.n = 3;
                        break;
                      }
                      throw Error('تعذر إلغاء المزامنة');
                    case 3:
                      poll();
                      _context7.n = 5;
                      break;
                    case 4:
                      _context7.p = 4;
                      _t8 = _context7.v;
                      stop.textContent = _t8.message;
                      stop.disabled = false;
                    case 5:
                      return _context7.a(2);
                  }
                }, _callee7, null, [[1, 4]]);
              }));
              panel.appendChild(stop);
            }
            _iterator5 = _createForOfIteratorHelper(data.jobs.slice(-5).reverse());
            _context0.p = 7;
            _loop = _regenerator().m(function _loop() {
              var job, row, cancel, _iterator6, _step6, error, line;
              return _regenerator().w(function (_context9) {
                while (1) switch (_context9.n) {
                  case 0:
                    job = _step5.value;
                    row = document.createElement('p');
                    row.textContent = (labels[job.status] || job.status) + ' — ' + job.completed + ' محفوظ، ' + job.failed + ' تعذر، من ' + job.total;
                    panel.appendChild(row);
                    if (['queued', 'running'].includes(job.status)) {
                      cancel = document.createElement('button');
                      cancel.textContent = 'إلغاء المزامنة';
                      cancel.style.cssText = 'background:#ad4c4c;color:white;border:0;border-radius:18px;padding:8px 18px;cursor:pointer';
                      cancel.onclick = _asyncToGenerator(_regenerator().m(function _callee8() {
                        return _regenerator().w(function (_context8) {
                          while (1) switch (_context8.n) {
                            case 0:
                              _context8.n = 1;
                              return fetch('/admin/api/cancelMetadata/' + encodeURIComponent(job.id), {
                                method: 'POST',
                                credentials: 'same-origin'
                              });
                            case 1:
                              poll();
                            case 2:
                              return _context8.a(2);
                          }
                        }, _callee8);
                      }));
                      panel.appendChild(cancel);
                    }
                    _iterator6 = _createForOfIteratorHelper(job.errors || []);
                    try {
                      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
                        error = _step6.value;
                        line = document.createElement('p');
                        line.textContent = (error.name || error.id) + ': ' + error.error;
                        panel.appendChild(line);
                      }
                    } catch (err) {
                      _iterator6.e(err);
                    } finally {
                      _iterator6.f();
                    }
                  case 1:
                    return _context9.a(2);
                }
              }, _loop);
            });
            _iterator5.s();
          case 8:
            if ((_step5 = _iterator5.n()).done) {
              _context0.n = 10;
              break;
            }
            return _context0.d(_regeneratorValues(_loop()), 9);
          case 9:
            _context0.n = 8;
            break;
          case 10:
            _context0.n = 12;
            break;
          case 11:
            _context0.p = 11;
            _t9 = _context0.v;
            _iterator5.e(_t9);
          case 12:
            _context0.p = 12;
            _iterator5.f();
            return _context0.f(12);
          case 13:
            _context0.n = 15;
            break;
          case 14:
            _context0.p = 14;
            _t0 = _context0.v;
          case 15:
            _context0.p = 15;
            if (!closed) timer = setTimeout(poll, 3000);
            return _context0.f(15);
          case 16:
            return _context0.a(2);
        }
      }, _callee9, null, [[7, 11, 12, 13], [0, 14, 15, 16]]);
    }));
    return _poll2.apply(this, arguments);
  }
  window.addEventListener('pagehide', () => {
    closed = true;
    clearTimeout(timer);
  });
  poll();
})();