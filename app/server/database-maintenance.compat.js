function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
(() => {
  'use strict';

  var labels = {
    'assets/db/estra7ah.json': 'الأقسام والإعدادات الأصلية',
    'assets/db/estra7ah.items.json': 'فهرس الأفلام والمسلسلات',
    'data/admin.json': 'إعدادات لوحة التحكم',
    'data/content.json': 'الحصريات والإعلانات والطلبات',
    'data/item-edits.json': 'تعديلات المحتوى',
    'data/sync-items.sqlite': 'فهرس المزامنة'
  };
  var phases = {
    idle: 'ابدأ بالفحص لمعرفة حالة القاعدة وحجمها.',
    scan: 'جارٍ فحص سلامة ملفات القاعدة وحساب المساحة…',
    backup: 'جارٍ حفظ نسخة احتياطية قبل التحسين…',
    optimize: 'جارٍ تحسين القاعدة مع الحفاظ على سجلاتها…',
    failed: 'لم تكتمل العملية.',
    done: 'اكتملت العملية.'
  };
  var el = (tag, text) => {
    var e = document.createElement(tag);
    if (text !== undefined) e.textContent = text;
    return e;
  };
  function size(n) {
    if (!Number.isFinite(n)) return '—';
    if (n < 1024) return n + ' بايت';
    if (n < 1024 * 1024) return (n / 1024).toFixed(1) + ' كيلوبايت';
    return (n / 1024 / 1024).toFixed(2) + ' ميغابايت';
  }
  var box,
    scan,
    optimize,
    message,
    report,
    pollBusy = false,
    requestBusy = false,
    last = '',
    next = 0;
  function api(_x) {
    return _api.apply(this, arguments);
  }
  function _api() {
    _api = _asyncToGenerator(_regenerator().m(function _callee(action, method = 'GET') {
      var c, t, r, v;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            c = new AbortController(), t = setTimeout(() => c.abort(), 12000);
            _context.p = 1;
            _context.n = 2;
            return fetch('/admin/api/' + action, {
              method,
              credentials: 'same-origin',
              cache: 'no-store',
              signal: c.signal
            });
          case 2:
            r = _context.v;
            _context.n = 3;
            return r.json();
          case 3:
            v = _context.v;
            if (!(!r.ok || v.msg === 'error')) {
              _context.n = 4;
              break;
            }
            throw Error(v.error || 'تعذر تنفيذ العملية');
          case 4:
            return _context.a(2, v);
          case 5:
            _context.p = 5;
            clearTimeout(t);
            return _context.f(5);
          case 6:
            return _context.a(2);
        }
      }, _callee, null, [[1,, 5, 6]]);
    }));
    return _api.apply(this, arguments);
  }
  function mount() {
    if (location.pathname.replace(/\/$/, '') !== '/admin/backups') {
      if (box) box.remove();
      box = null;
      return false;
    }
    if (box && document.documentElement.contains(box)) return true;
    var host = document.querySelector('.backups-cont');
    if (!host) return false;
    box = el('section');
    box.id = 'zain-database-maintenance';
    box.dir = 'rtl';
    box.style.cssText = 'background:#202a40;color:white;border-radius:12px;padding:24px;margin:22px 0;font:15px Arial;line-height:1.8';
    box.append(el('h3', 'فحص قاعدة البيانات وتحسينها'), el('p', 'يفحص سلامة الملفات ويحسب المساحة القابلة للتقليل. التحسين يحفظ نسخة احتياطية أولًا، ثم يزيل الفراغات غير اللازمة ويضغط فهرس المزامنة دون حذف محتوى أو صور.'));
    var actions = el('div');
    scan = el('button', 'فحص قاعدة البيانات');
    optimize = el('button', 'تحسين آمن مع نسخة احتياطية');
    for (var _i = 0, _arr = [scan, optimize]; _i < _arr.length; _i++) {
      var b = _arr[_i];
      b.type = 'button';
      b.style.cssText = 'background:#665dff;color:white;border:0;border-radius:9px;padding:12px 18px;margin:6px;cursor:pointer;font:15px Arial';
      actions.append(b);
    }
    optimize.style.background = '#348858';
    scan.onclick = () => start('scanDatabase');
    optimize.onclick = () => start('optimizeDatabase');
    message = el('p', phases.idle);
    message.setAttribute('role', 'status');
    report = el('div');
    report.style.overflowX = 'auto';
    box.append(actions, message, report, el('p', 'الضغط لا يضمن زيادة السرعة أو تقليل الحجم إذا كانت القاعدة مضغوطة أصلًا. النسخة السابقة للتحسين تستهلك مساحة إضافية وتبقى محفوظة ضمن النسخ الاحتياطية.'));
    host.prepend(box);
    last = '';
    next = 0;
    return true;
  }
  function paint(state) {
    scan.disabled = optimize.disabled = state.running || requestBusy;
    var key = JSON.stringify(state);
    if (key === last) return;
    last = key;
    message.textContent = state.error || phases[state.phase] || phases.idle;
    report.replaceChildren();
    var data = state.report;
    if (!data) return;
    if (!state.running && !state.error) {
      message.textContent = data.ok ? state.action === 'optimize' && state.backup ? 'اكتمل التحسين وحُفظت النسخة السابقة.' : data.reclaimable === 0 ? 'الفحص سليم؛ لا توجد حاليًا مساحة يمكن تقليلها بهذا التحسين.' : 'الفحص سليم؛ يمكنك تنفيذ التحسين الآمن.' : 'بعض الملفات لم تجتز الفحص؛ لم يبدأ التحسين.';
    }
    var saved = Math.max(0, data.before - data.after);
    report.append(el('p', 'حجم ملفات القاعدة: ' + size(data.before) + (state.action === 'optimize' && state.backup ? ' — بعد التحسين: ' + size(data.after) + ' — المساحة المستعادة: ' + size(saved) : ' — المساحة القابلة للاستعادة: ' + size(data.reclaimable))));
    var table = el('table');
    table.style.cssText = 'width:100%;border-collapse:collapse;text-align:right';
    var head = el('tr');
    for (var _i2 = 0, _arr2 = ['الملف', 'الحالة', 'الحجم', 'قابل للتقليل']; _i2 < _arr2.length; _i2++) {
      var text = _arr2[_i2];
      head.append(el('th', text));
    }
    table.append(head);
    var _iterator = _createForOfIteratorHelper(data.rows),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var row = _step.value;
        var tr = el('tr');
        for (var _i3 = 0, _arr3 = [labels[row.name] || row.name, row.ok ? 'سليم' : row.error, size((_row$after = row.after) !== null && _row$after !== void 0 ? _row$after : row.before), size(row.reclaimable)]; _i3 < _arr3.length; _i3++) {
          var _row$after;
          var _text = _arr3[_i3];
          var cell = el('td', _text);
          cell.style.cssText = 'border-bottom:1px solid #45516a;padding:10px';
          tr.append(cell);
        }
        table.append(tr);
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
    report.append(table);
    if (state.backup) {
      var link = el('a', 'تنزيل النسخة المحفوظة قبل التحسين');
      link.href = '/admin/api/download/' + encodeURIComponent(state.backup);
      link.style.color = '#b7ddff';
      report.append(link);
    }
    if (data.at) report.append(el('small', 'وقت الفحص: ' + new Date(data.at).toLocaleString('ar')));
  }
  function start(_x2) {
    return _start.apply(this, arguments);
  }
  function _start() {
    _start = _asyncToGenerator(_regenerator().m(function _callee2(action) {
      var _t;
      return _regenerator().w(function (_context2) {
        while (1) switch (_context2.p = _context2.n) {
          case 0:
            if (!requestBusy) {
              _context2.n = 1;
              break;
            }
            return _context2.a(2);
          case 1:
            requestBusy = true;
            scan.disabled = optimize.disabled = true;
            message.textContent = 'جارٍ بدء العملية…';
            _context2.p = 2;
            _context2.n = 3;
            return api(action, 'POST');
          case 3:
            last = '';
            next = 0;
            _context2.n = 5;
            break;
          case 4:
            _context2.p = 4;
            _t = _context2.v;
            message.textContent = _t.name === 'AbortError' ? 'تأخر الرد؛ جارٍ التحقق من حالة العملية.' : _t.message;
            next = Date.now() + 4000;
          case 5:
            _context2.p = 5;
            requestBusy = false;
            scan.disabled = optimize.disabled = false;
            return _context2.f(5);
          case 6:
            _context2.n = 7;
            return poll();
          case 7:
            return _context2.a(2);
        }
      }, _callee2, null, [[2, 4, 5, 6]]);
    }));
    return _start.apply(this, arguments);
  }
  function poll() {
    return _poll.apply(this, arguments);
  }
  function _poll() {
    _poll = _asyncToGenerator(_regenerator().m(function _callee3() {
      var current, state, _t2;
      return _regenerator().w(function (_context3) {
        while (1) switch (_context3.p = _context3.n) {
          case 0:
            if (!(!mount() || pollBusy || Date.now() < next)) {
              _context3.n = 1;
              break;
            }
            return _context3.a(2);
          case 1:
            pollBusy = true;
            current = box;
            _context3.p = 2;
            _context3.n = 3;
            return api('databaseMaintenanceStatus');
          case 3:
            state = _context3.v;
            if (current === box && document.documentElement.contains(box)) paint(state);
            next = Date.now() + (state.running ? 1500 : 5000);
            _context3.n = 5;
            break;
          case 4:
            _context3.p = 4;
            _t2 = _context3.v;
            if (current === box) message.textContent = 'تعذر قراءة حالة الصيانة؛ ستتم إعادة المحاولة.';
            next = Date.now() + 5000;
          case 5:
            _context3.p = 5;
            pollBusy = false;
            return _context3.f(5);
          case 6:
            return _context3.a(2);
        }
      }, _callee3, null, [[2, 4, 5, 6]]);
    }));
    return _poll.apply(this, arguments);
  }
  setInterval(() => poll(), 1500);
  poll();
})();