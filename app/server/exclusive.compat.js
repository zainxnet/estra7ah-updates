function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(typeof e + " is not iterable"); }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
(() => {
  'use strict';

  var style = document.createElement('style');
  style.textContent = `#zain-exclusive{width:95%;margin:30px auto;direction:rtl}#zain-exclusive .page{display:flex;gap:12px;justify-content:center;height:340px}#zain-exclusive .page>a,#zain-exclusive .page>div{display:block;height:100%;flex:none;overflow:hidden;border-radius:12px;position:relative}#zain-exclusive img,#zain-exclusive video{width:100%;height:100%;object-fit:contain}#zain-exclusive .caption{position:absolute;bottom:0;right:0;left:0;background:#000b;padding:10px;color:white;text-align:center}#zain-exclusive nav{text-align:center;margin:10px}#zain-exclusive button{border:0;border-radius:20px;margin:4px;padding:6px 14px;cursor:pointer}#zain-exclusive-manager{background:#202a40;padding:20px;margin:20px 0;border-radius:12px}#zain-exclusive-manager button{margin:5px;padding:7px 14px;cursor:pointer}#zain-exclusive-manager input{padding:10px;min-width:220px}@media(max-width:600px){#zain-exclusive .page{height:220px}}`;
  document.head.appendChild(style);
  var el = (tag, text) => {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
  function api(_x) {
    return _api.apply(this, arguments);
  }
  function _api() {
    _api = _asyncToGenerator(_regenerator().m(function _callee(action, method = 'GET') {
      var r, v;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return fetch('/admin/api/' + action, {
              method,
              credentials: 'same-origin'
            });
          case 1:
            r = _context.v;
            _context.n = 2;
            return r.json();
          case 2:
            v = _context.v;
            if (!(!r.ok || v.msg === 'error')) {
              _context.n = 3;
              break;
            }
            throw Error(v.error || 'تعذر الحفظ');
          case 3:
            return _context.a(2, v);
        }
      }, _callee);
    }));
    return _api.apply(this, arguments);
  }
  var current = '',
    cleanup = () => {};
  function setup() {
    return _setup.apply(this, arguments);
  }
  function _setup() {
    _setup = _asyncToGenerator(_regenerator().m(function _callee6() {
      var _host, box, input, search, results, saved, notice, pinned, _pinned, retryTimer, attempts, loadPinned, _loadPinned, stopped, dispose, response, data, host;
      return _regenerator().w(function (_context7) {
        while (1) switch (_context7.n) {
          case 0:
            if (!(location.pathname === current)) {
              _context7.n = 1;
              break;
            }
            return _context7.a(2);
          case 1:
            current = location.pathname;
            cleanup();
            cleanup = () => {};
            if (!(current === '/admin/exces')) {
              _context7.n = 3;
              break;
            }
            _loadPinned = function _loadPinned3() {
              _loadPinned = _asyncToGenerator(_regenerator().m(function _callee5() {
                var retry, _t4;
                return _regenerator().w(function (_context6) {
                  while (1) switch (_context6.p = _context6.n) {
                    case 0:
                      _context6.p = 0;
                      _context6.n = 1;
                      return pinned();
                    case 1:
                      notice.textContent = '';
                      _context6.n = 3;
                      break;
                    case 2:
                      _context6.p = 2;
                      _t4 = _context6.v;
                      notice.textContent = _t4.message;
                      if (++attempts < 4) retryTimer = setTimeout(loadPinned, attempts * 1500);else {
                        retry = el('button', 'إعادة تحميل الحصريات');
                        retry.onclick = () => {
                          attempts = 0;
                          loadPinned();
                        };
                        notice.append(retry);
                      }
                    case 3:
                      return _context6.a(2);
                  }
                }, _callee5, null, [[0, 2]]);
              }));
              return _loadPinned.apply(this, arguments);
            };
            loadPinned = function _loadPinned2() {
              return _loadPinned.apply(this, arguments);
            };
            _pinned = function _pinned3() {
              _pinned = _asyncToGenerator(_regenerator().m(function _callee4() {
                return _regenerator().w(function (_context5) {
                  while (1) switch (_context5.n) {
                    case 0:
                      if (window.zainExclusiveCards) {
                        _context5.n = 1;
                        break;
                      }
                      throw Error('تعذر تحميل محرر الحصريات');
                    case 1:
                      _context5.n = 2;
                      return window.zainExclusiveCards(saved, notice);
                    case 2:
                      return _context5.a(2);
                  }
                }, _callee4);
              }));
              return _pinned.apply(this, arguments);
            };
            pinned = function _pinned2() {
              return _pinned.apply(this, arguments);
            };
            _host = document.querySelector('.excs-cont');
            if (_host) {
              _context7.n = 2;
              break;
            }
            current = '';
            return _context7.a(2);
          case 2:
            box = el('section');
            box.id = 'zain-exclusive-manager';
            box.append(el('h3', 'تثبيت فيلم أو مسلسل في الحصريات'));
            input = el('input');
            input.placeholder = 'ابحث باسم الفيلم أو المسلسل';
            search = el('button', 'بحث'), results = el('div'), saved = el('div'), notice = el('p');
            box.append(input, search, notice, results, saved);
            _host.prepend(box);
            cleanup = () => box.remove();
            search.onclick = _asyncToGenerator(_regenerator().m(function _callee3() {
              var q, _data, _iterator, _step, _loop, _t2, _t3;
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.p = _context4.n) {
                  case 0:
                    _context4.p = 0;
                    q = input.value.trim();
                    if (q) {
                      _context4.n = 1;
                      break;
                    }
                    return _context4.a(2);
                  case 1:
                    _context4.n = 2;
                    return api('getItems/all/all/all/0/' + encodeURIComponent(q));
                  case 2:
                    _data = _context4.v;
                    results.replaceChildren();
                    _iterator = _createForOfIteratorHelper(_data.items.filter(x => ['movie', 'film', 'series'].includes(x.type)));
                    _context4.p = 3;
                    _loop = _regenerator().m(function _loop() {
                      var item, row, b;
                      return _regenerator().w(function (_context3) {
                        while (1) switch (_context3.n) {
                          case 0:
                            item = _step.value;
                            row = el('div', item.name), b = el('button', 'تثبيت في الحصريات');
                            b.onclick = _asyncToGenerator(_regenerator().m(function _callee2() {
                              var _t;
                              return _regenerator().w(function (_context2) {
                                while (1) switch (_context2.p = _context2.n) {
                                  case 0:
                                    _context2.p = 0;
                                    _context2.n = 1;
                                    return api('addExclusiveItem/' + encodeURIComponent(item.id), 'POST');
                                  case 1:
                                    notice.textContent = 'تم التثبيت في الحصريات';
                                    _context2.n = 2;
                                    return pinned();
                                  case 2:
                                    _context2.n = 4;
                                    break;
                                  case 3:
                                    _context2.p = 3;
                                    _t = _context2.v;
                                    notice.textContent = _t.message;
                                  case 4:
                                    return _context2.a(2);
                                }
                              }, _callee2, null, [[0, 3]]);
                            }));
                            row.append(b);
                            results.append(row);
                          case 1:
                            return _context3.a(2);
                        }
                      }, _loop);
                    });
                    _iterator.s();
                  case 4:
                    if ((_step = _iterator.n()).done) {
                      _context4.n = 6;
                      break;
                    }
                    return _context4.d(_regeneratorValues(_loop()), 5);
                  case 5:
                    _context4.n = 4;
                    break;
                  case 6:
                    _context4.n = 8;
                    break;
                  case 7:
                    _context4.p = 7;
                    _t2 = _context4.v;
                    _iterator.e(_t2);
                  case 8:
                    _context4.p = 8;
                    _iterator.f();
                    return _context4.f(8);
                  case 9:
                    if (!results.children.length) results.textContent = 'لا توجد نتائج';
                    _context4.n = 11;
                    break;
                  case 10:
                    _context4.p = 10;
                    _t3 = _context4.v;
                    notice.textContent = _t3.message;
                  case 11:
                    return _context4.a(2);
                }
              }, _callee3, null, [[3, 7, 8, 9], [0, 10]]);
            }));
            input.onkeydown = e => {
              if (e.key === 'Enter') search.click();
            };
            attempts = 0;
            loadPinned();
            cleanup = () => {
              clearTimeout(retryTimer);
              box.remove();
            };
            return _context7.a(2);
          case 3:
            if (!(current !== '/')) {
              _context7.n = 4;
              break;
            }
            return _context7.a(2);
          case 4:
            stopped = false, dispose = () => {};
            cleanup = () => {
              stopped = true;
              dispose();
            };
            _context7.n = 5;
            return fetch('/zain/exclusives', {
              signal: AbortSignal.timeout(8000)
            });
          case 5:
            response = _context7.v;
            if (response.ok) {
              _context7.n = 6;
              break;
            }
            current = '';
            return _context7.a(2);
          case 6:
            _context7.n = 7;
            return response.json();
          case 7:
            data = _context7.v;
            if (!stopped) {
              _context7.n = 8;
              break;
            }
            return _context7.a(2);
          case 8:
            host = document.querySelector('.interface');
            if (!(!host || !window.zainRenderExclusive)) {
              _context7.n = 9;
              break;
            }
            current = '';
            return _context7.a(2);
          case 9:
            dispose = window.zainRenderExclusive(host, data);
          case 10:
            return _context7.a(2);
        }
      }, _callee6);
    }));
    return _setup.apply(this, arguments);
  }
  new MutationObserver(() => {
    setup().catch(() => {
      current = '';
    });
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
  setup().catch(() => {
    current = '';
  });
  setInterval(() => setup().catch(() => {
    current = '';
  }), 5000);
})();
(() => {
  'use strict';

  var css = document.createElement('style');
  css.textContent = `.zain-exclusive-add{position:absolute!important;left:5px!important;right:5px!important;bottom:25px!important;z-index:3;border:1px solid #c39843!important;border-radius:7px!important;background:#46320eed!important;color:#fff!important;font:12px Arial!important;line-height:1.5!important;padding:4px!important;cursor:pointer;width:calc(100% - 10px)!important}.zain-exclusive-add:disabled{background:#284b35ed!important;cursor:default}#zain-exclusive-notice{position:fixed;top:18px;left:18px;max-width:min(440px,90vw);z-index:2147483646;direction:rtl;background:#243e31;color:#fff;border:1px solid #60b978;border-radius:10px;padding:14px;font:16px Arial;box-shadow:0 4px 16px #0008}`;
  document.head.append(css);
  var pinned = new Set(),
    busy = new Set();
  var loaded = false,
    pendingLoad = false,
    scheduled = false,
    noticeTimer;
  function api(_x2) {
    return _api2.apply(this, arguments);
  }
  function _api2() {
    _api2 = _asyncToGenerator(_regenerator().m(function _callee8(action, method = 'GET') {
      var r, v;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.n) {
          case 0:
            _context9.n = 1;
            return fetch('/admin/api/' + action, {
              method,
              credentials: 'same-origin'
            });
          case 1:
            r = _context9.v;
            _context9.n = 2;
            return r.json();
          case 2:
            v = _context9.v;
            if (!(!r.ok || v.msg === 'error')) {
              _context9.n = 3;
              break;
            }
            throw Error(v.error || 'تعذرت الإضافة إلى الحصريات');
          case 3:
            return _context9.a(2, v);
        }
      }, _callee8);
    }));
    return _api2.apply(this, arguments);
  }
  function notice(text) {
    var box = document.getElementById('zain-exclusive-notice');
    if (!box) {
      box = document.createElement('div');
      box.id = 'zain-exclusive-notice';
      box.setAttribute('role', 'status');
      document.body.append(box);
    }
    box.textContent = text;
    clearTimeout(noticeTimer);
    noticeTimer = setTimeout(() => box.remove(), 9000);
  }
  function paint(b, id) {
    var text = busy.has(id) ? 'جارٍ البحث عن صورة…' : pinned.has(id) ? '− إلغاء الحصرية' : '＋ إضافة إلى الحصريات';
    if (b.textContent !== text) b.textContent = text;
    b.disabled = busy.has(id);
    b.title = text;
    b.setAttribute('aria-label', text);
  }
  function scan() {
    scheduled = false;
    if (location.pathname !== '/admin/items') {
      loaded = false;
      return;
    }
    if (!loaded && !pendingLoad) {
      pendingLoad = true;
      api('getExclusiveItems').then(v => {
        pinned.clear();
        var _iterator2 = _createForOfIteratorHelper(v.items || []),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var x = _step2.value;
            pinned.add(x.id);
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
        loaded = true;
      }).catch(() => {
        loaded = true;
      }).finally(() => {
        pendingLoad = false;
        schedule();
      });
    }
    var _iterator3 = _createForOfIteratorHelper(document.querySelectorAll('.items .item')),
      _step3;
    try {
      var _loop2 = function _loop2() {
        var _img$getAttribute;
        var card = _step3.value;
        var img = card.querySelector('img'),
          match = img === null || img === void 0 || (_img$getAttribute = img.getAttribute('src')) === null || _img$getAttribute === void 0 ? void 0 : _img$getAttribute.match(/ItemImage\/([^/?#]+)/i),
          type = img === null || img === void 0 ? void 0 : img.getAttribute('type');
        if (!match || type && !['movie', 'film', 'series'].includes(type)) return 1;
        var id = decodeURIComponent(match[1]);
        var b = card.querySelector('.zain-exclusive-add');
        if (b && b.dataset.itemId !== id) {
          b.remove();
          b = null;
        }
        if (!b) {
          b = document.createElement('button');
          b.type = 'button';
          b.className = 'zain-exclusive-add';
          b.dataset.itemId = id;
          if (getComputedStyle(card).position === 'static') card.style.position = 'relative';
          b.onclick = function () {
            var _ref3 = _asyncToGenerator(_regenerator().m(function _callee7(e) {
              var result, _t5;
              return _regenerator().w(function (_context8) {
                while (1) switch (_context8.p = _context8.n) {
                  case 0:
                    e.preventDefault();
                    e.stopPropagation();
                    if (!busy.has(id)) {
                      _context8.n = 1;
                      break;
                    }
                    return _context8.a(2);
                  case 1:
                    busy.add(id);
                    paint(b, id);
                    notice('جارٍ البحث عن صورة عريضة وإضافة العنصر إلى الحصريات…');
                    _context8.p = 2;
                    if (!pinned.has(id)) {
                      _context8.n = 4;
                      break;
                    }
                    _context8.n = 3;
                    return api('removeExclusiveItem/' + encodeURIComponent(id), 'POST');
                  case 3:
                    pinned.delete(id);
                    notice('تم إلغاء الحصرية');
                    return _context8.a(2);
                  case 4:
                    _context8.n = 5;
                    return api('addExclusiveItem/' + encodeURIComponent(id), 'POST');
                  case 5:
                    result = _context8.v;
                    pinned.add(id);
                    notice(result.imageKind === 'backdrop' ? 'تمت الإضافة إلى الحصريات بصورة عريضة' : 'تمت الإضافة إلى الحصريات بصورة العنصر الحالية');
                    _context8.n = 7;
                    break;
                  case 6:
                    _context8.p = 6;
                    _t5 = _context8.v;
                    notice(_t5.message);
                  case 7:
                    _context8.p = 7;
                    busy.delete(id);
                    paint(b, id);
                    schedule();
                    return _context8.f(7);
                  case 8:
                    return _context8.a(2);
                }
              }, _callee7, null, [[2, 6, 7, 8]]);
            }));
            return function (_x3) {
              return _ref3.apply(this, arguments);
            };
          }();
          card.append(b);
        }
        paint(b, id);
      };
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        if (_loop2()) continue;
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(scan);
    }
  }
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });
  addEventListener('popstate', schedule);
  schedule();
})();