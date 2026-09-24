function _regeneratorValues(e) { if (null != e) { var t = e["function" == typeof Symbol && Symbol.iterator || "@@iterator"], r = 0; if (t) return t.call(e); if ("function" == typeof e.next) return e; if (!isNaN(e.length)) return { next: function next() { return e && r >= e.length && (e = void 0), { value: e && e[r++], done: !e }; } }; } throw new TypeError(typeof e + " is not iterable"); }
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
(() => {
  'use strict';

  var css = document.createElement('style');
  css.textContent = `.admin-cont .left-menu{padding-bottom:20px!important}.admin-cont .sections-cont{padding-bottom:20px!important}.admin-cont .front-cont,.admin-cont .excs-cont{padding-bottom:20px!important}.admin-cont .admin-modal,.admin-cont .admin-modalselect{padding-bottom:12px!important}.admin-cont .admin-box{margin-bottom:24px!important}.zain-exclusive-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(210px,1fr));gap:14px;margin-top:16px;direction:rtl}.zain-exclusive-card{background:#101523;border-radius:10px;overflow:hidden;position:relative}.zain-exclusive-card img{width:100%;height:150px;object-fit:cover}.zain-exclusive-card h4,.zain-exclusive-card p{padding:0 12px;margin:8px 0}.zain-exclusive-card p{max-height:55px;overflow:hidden}.zain-exclusive-actions{display:flex;gap:8px;padding:10px}.zain-exclusive-actions button{border:0;border-radius:18px;padding:7px 12px;color:#fff;background:#46a767;cursor:pointer}.zain-exclusive-actions button:last-child{background:#e35059}.zain-editor-overlay{position:fixed;inset:0;background:#000b;z-index:2147483000;display:flex;align-items:flex-start;justify-content:center;overflow:auto;padding:30px 12px;box-sizing:border-box}.zain-editor{width:550px;max-width:100%;background:#202a40;border-radius:12px;padding:24px;box-sizing:border-box;direction:rtl;color:white}.zain-editor label{display:block;margin:14px 0 5px}.zain-editor input,.zain-editor textarea{box-sizing:border-box;width:100%;padding:10px;color:white;background:#101523;border:1px solid #414d65;border-radius:7px}.zain-editor textarea{min-height:100px}.zain-editor img{width:100%;max-height:200px;object-fit:contain}.zain-editor button{padding:9px 22px;margin:14px 0 0 8px;cursor:pointer}.zain-text-ad{background:#202a40;padding:16px;border-radius:10px;margin:12px 0;direction:rtl}.zain-text-ad button{margin:8px;padding:8px 14px}`;
  document.head.append(css);
  var el = (tag, text) => {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
  var api = function () {
    var _ref = _asyncToGenerator(_regenerator().m(function _callee(action, body) {
      var r, v;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.n) {
          case 0:
            _context.n = 1;
            return fetch('/admin/api/' + action, {
              credentials: 'same-origin',
              method: body ? 'POST' : 'GET',
              body: body instanceof FormData ? body : body ? JSON.stringify(body) : undefined,
              headers: body && !(body instanceof FormData) ? {
                'Content-Type': 'application/json'
              } : undefined
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
    return function api(_x, _x2) {
      return _ref.apply(this, arguments);
    };
  }();
  function editor(item, onSaved) {
    var c = {};
    try {
      var _item$content;
      c = JSON.parse(((_item$content = item.content) === null || _item$content === void 0 ? void 0 : _item$content.contentJSON) || '{}');
    } catch (_unused) {}
    var overlay = el('div');
    overlay.className = 'zain-editor-overlay';
    var form = el('form');
    form.className = 'zain-editor';
    form.append(el('h3', 'تعديل الحصرية'));
    var fields = {};
    for (var _i = 0, _arr = [['name', 'الاسم', item.name], ['descArabic', 'القصة', c.descArabic], ['imdbRating', 'التقييم', c.imdbRating], ['ReleaseDate', 'سنة الإنتاج', c.ReleaseDate], ['tagsArabic', 'التصنيفات', Array.isArray(c.tagsArabic) ? c.tagsArabic.join(',') : c.tagsArabic]]; _i < _arr.length; _i++) {
      var _arr$_i = _slicedToArray(_arr[_i], 3),
        name = _arr$_i[0],
        label = _arr$_i[1],
        value = _arr$_i[2];
      var input = el(name === 'descArabic' ? 'textarea' : 'input');
      input.name = name;
      input.value = value || '';
      fields[name] = input;
      form.append(el('label', label), input);
    }
    var preview = el('img');
    preview.src = item.exclusiveImage || '/zain/exclusive-image?id=' + encodeURIComponent(item.id);
    preview.onerror = () => {
      preview.onerror = null;
      preview.src = '/ItemImage/' + encodeURIComponent(item.id);
    };
    var file = el('input');
    file.type = 'file';
    file.name = 'image';
    file.accept = 'image/png,image/jpeg,image/webp,image/gif';
    var blob;
    file.onchange = () => {
      if (blob) URL.revokeObjectURL(blob);
      if (file.files[0]) {
        blob = URL.createObjectURL(file.files[0]);
        preview.src = blob;
      }
    };
    var reset = el('input');
    reset.type = 'checkbox';
    reset.name = 'resetImage';
    reset.value = 'yes';
    reset.style.width = 'auto';
    var resetLabel = el('label', 'العودة إلى صورة العمل الأصلية ');
    resetLabel.prepend(reset);
    var save = el('button', 'حفظ'),
      cancel = el('button', 'إلغاء'),
      msg = el('p');
    cancel.type = 'button';
    var close = () => {
      if (blob) URL.revokeObjectURL(blob);
      overlay.remove();
    };
    cancel.onclick = close;
    form.append(el('label', 'صورة الحصرية'), preview, file, resetLabel, msg, save, cancel);
    overlay.append(form);
    document.body.append(overlay);
    fields.name.focus();
    form.onsubmit = function () {
      var _ref2 = _asyncToGenerator(_regenerator().m(function _callee2(e) {
        var _t;
        return _regenerator().w(function (_context2) {
          while (1) switch (_context2.p = _context2.n) {
            case 0:
              e.preventDefault();
              save.disabled = true;
              _context2.p = 1;
              _context2.n = 2;
              return api('updateExclusiveItem/' + encodeURIComponent(item.id), new FormData(form));
            case 2:
              close();
              _context2.n = 3;
              return onSaved();
            case 3:
              _context2.n = 5;
              break;
            case 4:
              _context2.p = 4;
              _t = _context2.v;
              msg.textContent = _t.message;
              save.disabled = false;
            case 5:
              return _context2.a(2);
          }
        }, _callee2, null, [[1, 4]]);
      }));
      return function (_x3) {
        return _ref2.apply(this, arguments);
      };
    }();
  }
  window.zainExclusiveCards = function () {
    var _ref3 = _asyncToGenerator(_regenerator().m(function _callee4(saved, notice) {
      var data, grid, _iterator, _step, _loop, _t3;
      return _regenerator().w(function (_context5) {
        while (1) switch (_context5.p = _context5.n) {
          case 0:
            _context5.n = 1;
            return api('getExclusiveItems');
          case 1:
            data = _context5.v;
            saved.replaceChildren(el('h4', 'الأعمال المثبتة في الحصريات'));
            grid = el('div');
            grid.className = 'zain-exclusive-grid';
            saved.append(grid);
            _iterator = _createForOfIteratorHelper(data.items.slice().reverse());
            _context5.p = 2;
            _loop = _regenerator().m(function _loop() {
              var item, card, img, c, _item$content2, actions, edit, remove;
              return _regenerator().w(function (_context4) {
                while (1) switch (_context4.n) {
                  case 0:
                    item = _step.value;
                    card = el('article');
                    card.className = 'zain-exclusive-card';
                    img = el('img');
                    img.src = item.exclusiveImage || '/zain/exclusive-image?id=' + encodeURIComponent(item.id);
                    img.onerror = () => {
                      img.onerror = null;
                      img.src = '/ItemImage/' + encodeURIComponent(item.id);
                    };
                    c = {};
                    try {
                      c = JSON.parse(((_item$content2 = item.content) === null || _item$content2 === void 0 ? void 0 : _item$content2.contentJSON) || '{}');
                    } catch (_unused2) {}
                    actions = el('div');
                    actions.className = 'zain-exclusive-actions';
                    edit = el('button', 'تعديل'), remove = el('button', 'إلغاء الحصرية');
                    edit.onclick = () => editor(item, () => window.zainExclusiveCards(saved, notice));
                    remove.onclick = _asyncToGenerator(_regenerator().m(function _callee3() {
                      var _t2;
                      return _regenerator().w(function (_context3) {
                        while (1) switch (_context3.p = _context3.n) {
                          case 0:
                            remove.disabled = true;
                            _context3.p = 1;
                            _context3.n = 2;
                            return api('removeExclusiveItem/' + encodeURIComponent(item.id), {});
                          case 2:
                            _context3.n = 3;
                            return window.zainExclusiveCards(saved, notice);
                          case 3:
                            notice.textContent = 'تم إلغاء الحصرية';
                            _context3.n = 5;
                            break;
                          case 4:
                            _context3.p = 4;
                            _t2 = _context3.v;
                            notice.textContent = _t2.message;
                            remove.disabled = false;
                          case 5:
                            return _context3.a(2);
                        }
                      }, _callee3, null, [[1, 4]]);
                    }));
                    actions.append(edit, remove);
                    card.append(img, el('h4', item.name), el('p', c.descArabic || ''), actions);
                    grid.append(card);
                  case 1:
                    return _context4.a(2);
                }
              }, _loop);
            });
            _iterator.s();
          case 3:
            if ((_step = _iterator.n()).done) {
              _context5.n = 5;
              break;
            }
            return _context5.d(_regeneratorValues(_loop()), 4);
          case 4:
            _context5.n = 3;
            break;
          case 5:
            _context5.n = 7;
            break;
          case 6:
            _context5.p = 6;
            _t3 = _context5.v;
            _iterator.e(_t3);
          case 7:
            _context5.p = 7;
            _iterator.f();
            return _context5.f(7);
          case 8:
            return _context5.a(2);
        }
      }, _callee4, null, [[2, 6, 7, 8]]);
    }));
    return function (_x4, _x5) {
      return _ref3.apply(this, arguments);
    };
  }();
  var last = '',
    loading = false;
  function textAds() {
    return _textAds.apply(this, arguments);
  }
  function _textAds() {
    _textAds = _asyncToGenerator(_regenerator().m(function _callee7() {
      var _document$getElementB, host, data, box;
      return _regenerator().w(function (_context8) {
        while (1) switch (_context8.p = _context8.n) {
          case 0:
            if (/^\/admin\/(?:ads|advertisements)$/.test(location.pathname)) {
              _context8.n = 1;
              break;
            }
            last = '';
            (_document$getElementB = document.getElementById('zain-text-ads')) === null || _document$getElementB === void 0 || _document$getElementB.remove();
            return _context8.a(2);
          case 1:
            if (!(last === location.pathname || loading)) {
              _context8.n = 2;
              break;
            }
            return _context8.a(2);
          case 2:
            host = document.querySelector('.ads-cont') || document.querySelector('.excs-cont') || document.querySelector('.front-cont');
            if (host) {
              _context8.n = 3;
              break;
            }
            return _context8.a(2);
          case 3:
            loading = true;
            _context8.p = 4;
            _context8.n = 5;
            return api('getAllExtsAndNews');
          case 5:
            data = _context8.v;
            box = el('section');
            box.id = 'zain-text-ads';
            box.append(el('h3', 'الإعلانات النصية في الصفحة الرئيسية'));
            data.news.forEach((n, index) => {
              var row = el('div');
              row.className = 'zain-text-ad';
              var text = el('textarea');
              text.value = n.text;
              text.style.cssText = 'width:100%;min-height:65px;box-sizing:border-box';
              var color = el('input');
              color.type = 'color';
              color.value = /^#[a-f\d]{6}$/i.test(n.color || '') ? n.color : '#607d8b';
              var save = el('button', 'حفظ'),
                del = el('button', 'حذف'),
                msg = el('span');
              save.onclick = _asyncToGenerator(_regenerator().m(function _callee5() {
                var _t4;
                return _regenerator().w(function (_context6) {
                  while (1) switch (_context6.p = _context6.n) {
                    case 0:
                      _context6.p = 0;
                      _context6.n = 1;
                      return api('updateNews', {
                        index,
                        original: n.text,
                        text: text.value,
                        color: color.value
                      });
                    case 1:
                      n.text = text.value;
                      msg.textContent = 'تم الحفظ';
                      _context6.n = 3;
                      break;
                    case 2:
                      _context6.p = 2;
                      _t4 = _context6.v;
                      msg.textContent = _t4.message;
                    case 3:
                      return _context6.a(2);
                  }
                }, _callee5, null, [[0, 2]]);
              }));
              del.onclick = _asyncToGenerator(_regenerator().m(function _callee6() {
                var _t5;
                return _regenerator().w(function (_context7) {
                  while (1) switch (_context7.p = _context7.n) {
                    case 0:
                      _context7.p = 0;
                      _context7.n = 1;
                      return api('removeNews/' + encodeURIComponent(n.text.replace(/\//g, '|')));
                    case 1:
                      box.remove();
                      last = '';
                      _context7.n = 2;
                      return textAds();
                    case 2:
                      _context7.n = 4;
                      break;
                    case 3:
                      _context7.p = 3;
                      _t5 = _context7.v;
                      msg.textContent = _t5.message;
                    case 4:
                      return _context7.a(2);
                  }
                }, _callee6, null, [[0, 3]]);
              }));
              row.append(text, color, save, del, msg);
              box.append(row);
            });
            host.prepend(box);
            last = location.pathname;
          case 6:
            _context8.p = 6;
            loading = false;
            return _context8.f(6);
          case 7:
            return _context8.a(2);
        }
      }, _callee7, null, [[4,, 6, 7]]);
    }));
    return _textAds.apply(this, arguments);
  }
  setInterval(() => textAds().catch(() => {}), 1500);
})();
(() => {
  'use strict';

  var element = (tag, text) => {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
  var searchPending = false,
    focusUntil = 0,
    path = '',
    loadedPath = '',
    nav = [],
    ids = new Set(),
    sections = [],
    busy = false,
    lastNavigationAt = 0;
  function focus() {
    if (!searchPending) return;
    var input = document.querySelector('.search-items-count .search-bar input');
    if (input && input.getBoundingClientRect().width) {
      input.focus();
      searchPending = false;
    } else if (Date.now() > focusUntil) searchPending = false;
  }
  document.addEventListener('click', e => {
    var link = e.target.closest && e.target.closest('header .search,header a[href*="search"]');
    if (link) {
      searchPending = true;
      focusUntil = Date.now() + 5000;
      setTimeout(focus, 0);
    }
  });
  var navStyle = element('style');
  navStyle.textContent = 'header .zain-home-entry{float:right;position:relative;display:flex;align-items:center;z-index:5}header .zain-home-entry:hover,header .zain-home-entry.zain-open{z-index:20}header .zain-home-entry>.zain-home-section{float:none;display:block;white-space:nowrap;margin-left:3px}header .zain-nav-expand{background:transparent;color:inherit;border:0;padding:8px 4px;cursor:pointer;font:14px Arial}header .zain-section-menu{display:none;position:absolute;right:0;top:100%;width:260px;max-width:85vw;max-height:60vh;overflow:auto;direction:rtl;text-align:right;background:#1b2233;border:1px solid #384258;border-radius:8px;padding:6px;box-shadow:0 8px 24px #0008;box-sizing:border-box;z-index:30}header .zain-home-entry.zain-open>.zain-section-menu{display:block}header .zain-section-menu>a{display:block;float:none;padding:10px 12px;color:white;line-height:1.6;text-decoration:none;white-space:normal}header .zain-section-menu>a:hover,header .zain-section-menu>a:focus{background:#384258;border-radius:5px}';
  document.head.append(navStyle);
  document.addEventListener('click', e => {
    document.querySelectorAll('header .zain-home-entry.zain-open').forEach(entry => {
      if (!entry.contains(e.target)) {
        entry.classList.remove('zain-open');
        var b = entry.querySelector('.zain-nav-expand');
        if (b) {
          b.setAttribute('aria-expanded', 'false');
          b.setAttribute('data-click-open', 'no');
        }
      }
    });
  });
  function paintNav() {
    var main = Array.from(document.querySelectorAll('header a')).find(a => /الأقسام الرئيسية|الاقسام الرئيسية/.test(a.textContent));
    if (!main) return;
    var key = JSON.stringify(nav);
    if (main.getAttribute('data-zain-nav') === key && document.querySelectorAll('header .zain-home-entry').length === nav.length) return;
    document.querySelectorAll('header .zain-home-entry,header .zain-home-section').forEach(e => e.remove());
    var previous = main;
    var _iterator2 = _createForOfIteratorHelper(nav),
      _step2;
    try {
      var _loop2 = function _loop2() {
        var s = _step2.value;
        var entry = element('div');
        entry.className = 'zain-home-entry';
        var a = element('a', s.name || 'قسم بدون اسم');
        a.className = 'item zain-home-section';
        a.title = s.name;
        a.href = s.href || (s.type === 'main' ? '/sections/' : '/items/') + encodeURIComponent(s.id);
        entry.append(a);
        if (s.children && s.children.length) {
          var toggle = element('button', '▾'),
            menu = element('div');
          toggle.type = 'button';
          toggle.className = 'zain-nav-expand';
          toggle.setAttribute('aria-label', 'الأقسام الفرعية: ' + s.name);
          toggle.setAttribute('aria-expanded', 'false');
          menu.className = 'zain-section-menu';
          menu.id = 'zain-children-' + s.id;
          toggle.setAttribute('aria-controls', menu.id);
          var close = () => {
            entry.classList.remove('zain-open');
            toggle.setAttribute('aria-expanded', 'false');
            toggle.setAttribute('data-click-open', 'no');
          };
          var open = () => {
            document.querySelectorAll('header .zain-home-entry.zain-open').forEach(e => {
              if (e !== entry) {
                e.classList.remove('zain-open');
                e.querySelector('button').setAttribute('aria-expanded', 'false');
              }
            });
            entry.classList.add('zain-open');
            toggle.setAttribute('aria-expanded', 'true');
          };
          entry.onmouseenter = open;
          entry.onmouseleave = () => {
            if (!entry.contains(document.activeElement)) close();
          };
          entry.onfocusin = open;
          entry.onfocusout = () => setTimeout(() => {
            if (!entry.contains(document.activeElement)) close();
          }, 0);
          toggle.onclick = e => {
            e.preventDefault();
            e.stopPropagation();
            entry.classList.contains('zain-open') && toggle.getAttribute('data-click-open') === 'yes' ? (close(), toggle.setAttribute('data-click-open', 'no')) : (open(), toggle.setAttribute('data-click-open', 'yes'));
          };
          entry.onkeydown = e => {
            if (e.key === 'Escape') {
              close();
              toggle.setAttribute('data-click-open', 'no');
              a.focus();
              close();
            }
          };
          var _iterator3 = _createForOfIteratorHelper(s.children),
            _step3;
          try {
            for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
              var child = _step3.value;
              var link = element('a', child.name);
              link.href = child.href;
              menu.append(link);
            }
          } catch (err) {
            _iterator3.e(err);
          } finally {
            _iterator3.f();
          }
          entry.append(toggle, menu);
        }
        previous.parentNode.insertBefore(entry, previous.nextSibling);
        previous = entry;
      };
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        _loop2();
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    main.classList.add('zain-main-link');
    main.setAttribute('data-zain-nav', key);
  }
  function refresh() {
    return _refresh.apply(this, arguments);
  }
  function _refresh() {
    _refresh = _asyncToGenerator(_regenerator().m(function _callee0() {
      var here, r, _r, _t8;
      return _regenerator().w(function (_context1) {
        while (1) switch (_context1.p = _context1.n) {
          case 0:
            if (!(busy || loadedPath === location.pathname && Date.now() - lastNavigationAt < 15000)) {
              _context1.n = 1;
              break;
            }
            return _context1.a(2);
          case 1:
            busy = true;
            here = location.pathname;
            _context1.p = 2;
            _context1.n = 3;
            return fetch('/zain/navigation', {
              cache: 'no-store'
            });
          case 3:
            r = _context1.v;
            if (r.ok) {
              _context1.n = 4;
              break;
            }
            throw Error('navigation');
          case 4:
            _context1.n = 5;
            return r.json();
          case 5:
            nav = _context1.v.sections;
            ids = new Set(nav.map(s => s.id));
            if (!(here === '/admin/sections')) {
              _context1.n = 9;
              break;
            }
            _context1.n = 6;
            return fetch('/admin/api/getAllSections', {
              credentials: 'same-origin'
            });
          case 6:
            _r = _context1.v;
            if (_r.ok) {
              _context1.n = 7;
              break;
            }
            throw Error('sections');
          case 7:
            _context1.n = 8;
            return _r.json();
          case 8:
            sections = _context1.v;
          case 9:
            loadedPath = here;
            lastNavigationAt = Date.now();
            paintNav();
            scan();
            _context1.n = 11;
            break;
          case 10:
            _context1.p = 10;
            _t8 = _context1.v;
          case 11:
            _context1.p = 11;
            busy = false;
            return _context1.f(11);
          case 12:
            return _context1.a(2);
        }
      }, _callee0, null, [[2, 10, 11, 12]]);
    }));
    return _refresh.apply(this, arguments);
  }
  function sectionIcon(kind) {
    var svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('width', '17');
    svg.setAttribute('height', '17');
    svg.setAttribute('fill', 'none');
    svg.setAttribute('stroke', 'currentColor');
    svg.setAttribute('stroke-width', '1.8');
    svg.setAttribute('stroke-linecap', 'round');
    svg.setAttribute('stroke-linejoin', 'round');
    svg.setAttribute('aria-hidden', 'true');
    var path = document.createElementNS(svg.namespaceURI, 'path');
    path.setAttribute('d', kind === 'sync' ? 'M20 7v5h-5 M4 17v-5h5 M6.1 7a7 7 0 0 1 11.5-1L20 9 M4 15l2.4 3a7 7 0 0 0 11.5-1' : 'M3 4h18v16H3z M3 9h18 M7 6.5h.1 M10 6.5h.1 M12 12v5 M9.5 14.5h5');
    svg.appendChild(path);
    return svg;
  }
  document.addEventListener('click', function () {
    var _ref7 = _asyncToGenerator(_regenerator().m(function _callee8(e) {
      var button, card, r, v, msg, _t6;
      return _regenerator().w(function (_context9) {
        while (1) switch (_context9.p = _context9.n) {
          case 0:
            button = e.target.closest && e.target.closest('.zain-section-sync');
            if (button) {
              _context9.n = 1;
              break;
            }
            return _context9.a(2);
          case 1:
            card = button.closest('.sec[id]');
            if (card) {
              _context9.n = 2;
              break;
            }
            return _context9.a(2);
          case 2:
            e.preventDefault();
            e.stopImmediatePropagation();
            if (!(button.disabled || button.dataset.busy === 'yes')) {
              _context9.n = 3;
              break;
            }
            return _context9.a(2);
          case 3:
            button.disabled = true;
            button.dataset.busy = 'yes';
            button.setAttribute('aria-busy', 'true');
            _context9.p = 4;
            _context9.n = 5;
            return fetch('/admin/api/SyncSection/' + encodeURIComponent(card.id), {
              method: 'POST',
              credentials: 'same-origin'
            });
          case 5:
            r = _context9.v;
            _context9.n = 6;
            return r.json();
          case 6:
            v = _context9.v;
            if (!(!r.ok || v.msg !== 'ok')) {
              _context9.n = 7;
              break;
            }
            throw Error(v.error || 'تعذر بدء المزامنة');
          case 7:
            window.dispatchEvent(new CustomEvent('zain-sync-requested', {
              detail: {
                ok: true
              }
            }));
            button.title = 'بدأت مزامنة القسم وجميع فروعه؛ التفاصيل في سجل المزامنة';
            _context9.n = 9;
            break;
          case 8:
            _context9.p = 8;
            _t6 = _context9.v;
            msg = document.getElementById('zain-section-message');
            if (!msg) {
              msg = element('div');
              msg.id = 'zain-section-message';
              msg.setAttribute('role', 'alert');
              document.querySelector('.sections-cont').prepend(msg);
            }
            msg.textContent = _t6.message;
          case 9:
            _context9.p = 9;
            button.disabled = false;
            button.dataset.busy = 'no';
            button.setAttribute('aria-busy', 'false');
            return _context9.f(9);
          case 10:
            return _context9.a(2);
        }
      }, _callee8, null, [[4, 8, 9, 10]]);
    }));
    return function (_x6) {
      return _ref7.apply(this, arguments);
    };
  }(), true);
  function scan() {
    if (location.pathname === '/admin/items') {
      var _iterator4 = _createForOfIteratorHelper(document.querySelectorAll('form')),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var f = _step4.value;
          if (f.querySelector('[name="content_id"]') && f.querySelector('[name="descArabic"]')) {
            var _iterator5 = _createForOfIteratorHelper(f.querySelectorAll('[required]')),
              _step5;
            try {
              for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
                var input = _step5.value;
                if (input.name !== 'name') input.required = false;
              }
            } catch (err) {
              _iterator5.e(err);
            } finally {
              _iterator5.f();
            }
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    }
    if (location.pathname !== '/admin/sections') return;
    var _iterator6 = _createForOfIteratorHelper(document.querySelectorAll('.sections-cont .sec[id]')),
      _step6;
    try {
      var _loop3 = function _loop3() {
        var _card$querySelector;
        var card = _step6.value;
        var id = card.id,
          section = sections.find(s => String(s.id) === id);
        if (!section) return 1;
        var buttons = card.querySelector('.btns') || card;
        var b = card.querySelector('.zain-home-toggle');
        if (!b) {
          b = element('button');
          b.append(sectionIcon('home'));
          b.type = 'button';
          b.className = 'admin-button-icon small zain-home-toggle';
          b.style.cssText = 'background:#405c94;color:white;border:0;margin-top:5px;cursor:pointer';
          b.onclick = function () {
            var _ref8 = _asyncToGenerator(_regenerator().m(function _callee9(e) {
              var r, v, _t7;
              return _regenerator().w(function (_context0) {
                while (1) switch (_context0.p = _context0.n) {
                  case 0:
                    e.preventDefault();
                    e.stopPropagation();
                    b.disabled = true;
                    _context0.p = 1;
                    _context0.n = 2;
                    return fetch('/admin/api/toggleHomeSection/' + encodeURIComponent(id), {
                      method: 'POST',
                      credentials: 'same-origin'
                    });
                  case 2:
                    r = _context0.v;
                    _context0.n = 3;
                    return r.json();
                  case 3:
                    v = _context0.v;
                    if (r.ok) {
                      _context0.n = 4;
                      break;
                    }
                    throw Error(v.error || 'تعذر الحفظ');
                  case 4:
                    ids = new Set(v.ids);
                    loadedPath = '';
                    _context0.n = 5;
                    return refresh();
                  case 5:
                    scan();
                    _context0.n = 7;
                    break;
                  case 6:
                    _context0.p = 6;
                    _t7 = _context0.v;
                    b.title = _t7.message;
                  case 7:
                    _context0.p = 7;
                    b.disabled = false;
                    return _context0.f(7);
                  case 8:
                    return _context0.a(2);
                }
              }, _callee9, null, [[1, 6, 7, 8]]);
            }));
            return function (_x7) {
              return _ref8.apply(this, arguments);
            };
          }();
          buttons.append(b);
        }
        b.title = ids.has(id) ? 'إزالة من الشريط الرئيسي' : 'إضافة إلى الشريط الرئيسي';
        b.setAttribute('aria-label', b.title);
        b.setAttribute('aria-pressed', String(ids.has(id)));
        b.style.background = ids.has(id) ? '#318c48' : '#405c94';
        var sync = card.querySelector('.zain-section-sync,.zain-sync-branch') || ((_card$querySelector = card.querySelector('.lni-reload')) === null || _card$querySelector === void 0 ? void 0 : _card$querySelector.closest('.admin-button-icon'));
        if (!sync) {
          sync = element('button');
          sync.type = 'button';
          sync.className = 'admin-button-icon blue small';
          buttons.append(sync);
        }
        if (!sync.classList.contains('zain-section-sync')) {
          sync.classList.add('zain-section-sync');
          sync.classList.remove('zain-sync-branch');
          sync.replaceChildren(sectionIcon('sync'));
          sync.title = 'مزامنة القسم وجميع فروعه';
          sync.setAttribute('aria-label', sync.title);
          sync.setAttribute('role', 'button');
          if (sync.tagName !== 'BUTTON') {
            sync.tabIndex = 0;
            sync.onkeydown = e => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                sync.click();
              }
            };
          }
        }
      };
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        if (_loop3()) continue;
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
  }
  var genrePath = '',
    genreBusy = false;
  function genres() {
    return _genres.apply(this, arguments);
  }
  function _genres() {
    _genres = _asyncToGenerator(_regenerator().m(function _callee1() {
      var select, here, r, data, selected, _i2, _arr2, name, option;
      return _regenerator().w(function (_context10) {
        while (1) switch (_context10.p = _context10.n) {
          case 0:
            if (/^\/items\/[^/]+\/?$/.test(location.pathname)) {
              _context10.n = 1;
              break;
            }
            genrePath = '';
            return _context10.a(2);
          case 1:
            select = Array.from(document.querySelectorAll('select')).find(s => /الفئة/.test(s.getAttribute('placeholder') || ''));
            if (!(!select || genreBusy || select.getAttribute('data-zain-genres') === location.pathname)) {
              _context10.n = 2;
              break;
            }
            return _context10.a(2);
          case 2:
            genreBusy = true;
            here = location.pathname;
            _context10.p = 3;
            _context10.n = 4;
            return fetch('/zain/section-genres?id=' + encodeURIComponent(decodeURIComponent(here.split('/')[2])));
          case 4:
            r = _context10.v;
            if (r.ok) {
              _context10.n = 5;
              break;
            }
            return _context10.a(2);
          case 5:
            _context10.n = 6;
            return r.json();
          case 6:
            data = _context10.v;
            if (!(here !== location.pathname || !select.isConnected)) {
              _context10.n = 7;
              break;
            }
            return _context10.a(2);
          case 7:
            selected = select.value;
            select.replaceChildren();
            for (_i2 = 0, _arr2 = ['الكل', ...data.genres]; _i2 < _arr2.length; _i2++) {
              name = _arr2[_i2];
              option = element('option', name);
              option.value = name === 'الكل' ? 'all' : name;
              select.append(option);
            }
            select.value = data.genres.includes(selected) ? selected : 'all';
            select.setAttribute('data-zain-genres', here);
          case 8:
            _context10.p = 8;
            genreBusy = false;
            return _context10.f(8);
          case 9:
            return _context10.a(2);
        }
      }, _callee1, null, [[3,, 8, 9]]);
    }));
    return _genres.apply(this, arguments);
  }
  window.addEventListener('focus', () => {
    loadedPath = '';
    refresh();
  });
  var scheduled = false;
  var update = () => {
    if (scheduled) return;
    scheduled = true;
    setTimeout(() => {
      scheduled = false;
      focus();
      scan();
      paintNav();
      genres().catch(() => {});
    }, 60);
  };
  new MutationObserver(update).observe(document.body, {
    childList: true,
    subtree: true
  });
  setInterval(() => {
    if (path !== location.pathname) {
      path = location.pathname;
      if (path === '/search') {
        searchPending = true;
        focusUntil = Date.now() + 5000;
      }
    }
    focus();
    refresh();
    scan();
    paintNav();
    genres().catch(() => {});
  }, 1500);
  refresh();
})();
(() => {
  'use strict';

  var old = '',
    timer;
  function update() {
    if (!/^\/admin\//.test(location.pathname)) return;
    var input = document.querySelector('[name="IS_OPEN_STREAM"]');
    if (!input) return;
    var host = input.closest('.excs-cont,.speed-cont') || input.closest('form') || input.parentElement.parentElement;
    var note = document.getElementById('zain-speed-note');
    if (!note) {
      note = document.createElement('p');
      note.id = 'zain-speed-note';
      note.style.cssText = 'padding:14px;color:#b9dafa;line-height:1.8;direction:rtl';
      host.append(note);
    }
    var open = input.value === 'yes',
      text = (open ? 'السرعة مفتوحة حاليًا؛ الحد المكتوب لا يطبّق حتى توقف «فتح السرعة كليًا».' : 'تقييد السرعة مفعّل على مجموع نقل الوسائط لكل عنوان IP.') + ' هذه الإعدادات تخص المشاهدة والتنزيل عبر الاستراحة، ولا تحدّ نسخ الملفات مباشرة من مجلدات مشاركة ويندوز.';
    if (note.textContent !== text) note.textContent = text;
  }
  setInterval(update, 1500);
})();
(() => {
  'use strict';

  var el = (tag, text) => {
    var e = document.createElement(tag);
    if (text) e.textContent = text;
    return e;
  };
  var generation = 0,
    debounce,
    box,
    controller,
    localController,
    selection = 0;
  function clear() {
    generation++;
    selection++;
    if (controller) controller.abort();
    if (localController) localController.abort();
    if (box) box.remove();
    box = null;
  }
  function choices(parent, label, values, choose) {
    parent.replaceChildren(el('p', label));
    var _iterator7 = _createForOfIteratorHelper(values),
      _step7;
    try {
      var _loop4 = function _loop4() {
        var value = _step7.value;
        var b = el('button', value);
        b.type = 'button';
        b.style.cssText = 'background:#444a80;color:white;border:1px solid #777fbb;border-radius:10px;padding:14px 24px;margin:7px;cursor:pointer;font:700 17px Arial;min-width:100px;min-height:48px';
        b.onclick = () => choose(value);
        parent.append(b);
      };
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        _loop4();
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
    }
  }
  function candidateNames(candidate) {
    return (candidate.zainAliases || [candidate.originalTitle, candidate.title, candidate.arabicTitle, candidate.searchQuery]).filter(name => typeof name === 'string' && name.trim() && name.trim().length <= 200).map(name => name.trim()).filter((name, index, names) => names.indexOf(name) === index).slice(0, 6);
  }
  function allNamesCandidate(candidate) {
    var names = candidateNames(candidate);
    return {
      searchQuery: names.join(' | '),
      allNames: names.length > 1
    };
  }
  function preferredName(candidate, category) {
    var names = candidateNames(candidate);
    return category === 'عربي' ? candidate.arabicTitle || candidate.title || names[0] : names.find(name => /[A-Za-z]/.test(name) && !/[\u0600-\u06ff\u0900-\u097f\u3040-\u30ff\u3400-\u9fff]/.test(name)) || candidate.title || names[0];
  }
  function currentInput(input, current) {
    return current === generation && input.isConnected && !!input.closest('.search-items-count');
  }
  function search(_x8) {
    return _search.apply(this, arguments);
  }
  function _search() {
    _search = _asyncToGenerator(_regenerator().m(function _callee10(input) {
      var q, current, r, results, stage, _t9;
      return _regenerator().w(function (_context11) {
        while (1) switch (_context11.p = _context11.n) {
          case 0:
            q = input.value.trim();
            clear();
            if (!(!q || q.length > 200)) {
              _context11.n = 1;
              break;
            }
            return _context11.a(2);
          case 1:
            current = generation;
            controller = new AbortController();
            _context11.p = 2;
            _context11.n = 3;
            return fetch('/api/getItemsSearch/0/100/' + encodeURIComponent(q), {
              signal: controller.signal
            });
          case 3:
            r = _context11.v;
            if (r.ok) {
              _context11.n = 4;
              break;
            }
            return _context11.a(2);
          case 4:
            _context11.n = 5;
            return r.json();
          case 5:
            results = _context11.v;
            if (!(!currentInput(input, current) || input.value.trim() !== q || !Array.isArray(results) || results.length)) {
              _context11.n = 6;
              break;
            }
            return _context11.a(2);
          case 6:
            box = el('section');
            box.id = 'zain-advanced-search';
            box.dir = 'rtl';
            box.style.cssText = 'margin:20px auto;padding:22px;background:#202638;color:white;border-radius:12px;max-width:900px';
            box.append(el('h3', 'لم نجد أي محتوى'));
            stage = el('div');
            box.append(stage);
            input.closest('.search-bar').after(box);
            choices(stage, 'هل تريد الانتقال إلى البحث المتقدم؟', ['نعم', 'لا'], answer => {
              if (answer === 'لا') {
                stage.replaceChildren();
                return;
              }
              choices(stage, 'هل تبحث عن فيلم أم مسلسل؟', ['فيلم', 'مسلسل'], kind => choices(stage, 'اختر نوع المحتوى', ['عربي', 'أجنبي', 'آسيوي', 'تركي', 'هندي', 'أنمي'], category => run(stage, input, q, kind, category, current)));
            });
            _context11.n = 8;
            break;
          case 7:
            _context11.p = 7;
            _t9 = _context11.v;
          case 8:
            return _context11.a(2);
        }
      }, _callee10, null, [[2, 7]]);
    }));
    return _search.apply(this, arguments);
  }
  function selectCandidate(_x9, _x0, _x1, _x10) {
    return _selectCandidate.apply(this, arguments);
  }
  function _selectCandidate() {
    _selectCandidate = _asyncToGenerator(_regenerator().m(function _callee11(input, candidate, status, current) {
      var name, selected, c, setter, event, heading, details, timeout, r, rows, _t0;
      return _regenerator().w(function (_context12) {
        while (1) switch (_context12.p = _context12.n) {
          case 0:
            if (currentInput(input, current)) {
              _context12.n = 1;
              break;
            }
            return _context12.a(2);
          case 1:
            name = String(candidate.searchQuery || candidate.title || candidate.originalTitle || candidate.arabicTitle || '').trim();
            if (!(!name || name.length > (candidate.allNames ? 1200 : 200))) {
              _context12.n = 2;
              break;
            }
            return _context12.a(2);
          case 2:
            clearTimeout(debounce);
            selected = ++selection;
            if (localController) localController.abort();
            c = new AbortController();
            localController = c;
            setter = Object.getOwnPropertyDescriptor(HTMLInputElement.prototype, 'value').set;
            setter.call(input, name);
            event = new Event('input', {
              bubbles: true
            });
            event.zainAdvancedSelection = true;
            input.dispatchEvent(event);
            input.focus();
            status.textContent = 'جارٍ البحث في الاستراحة…';
            if (box) {
              box.classList.add('zain-search-selected');
              heading = box.querySelector('h3');
              if (heading) heading.textContent = 'نتائج البحث المتقدم';
              details = box.querySelector('.zain-gemini-details');
              if (details) details.open = true;
            }
            timeout = setTimeout(() => c.abort(), 20000);
            _context12.p = 3;
            _context12.n = 4;
            return fetch('/api/getItemsSearch/0/100/' + encodeURIComponent(name), {
              signal: c.signal
            });
          case 4:
            r = _context12.v;
            if (r.ok) {
              _context12.n = 5;
              break;
            }
            throw Error('تعذر إكمال البحث المحلي؛ أعد المحاولة.');
          case 5:
            _context12.n = 6;
            return r.json();
          case 6:
            rows = _context12.v;
            if (!(!currentInput(input, current) || selected !== selection || input.value.trim() !== name)) {
              _context12.n = 7;
              break;
            }
            return _context12.a(2);
          case 7:
            if (Array.isArray(rows)) {
              _context12.n = 8;
              break;
            }
            throw Error('تعذر قراءة نتائج البحث المحلي.');
          case 8:
            status.textContent = rows.length ? 'تظهر النتائج المتاحة أدناه.' : 'لا توجد نتائج في الاستراحة؛ جرّب اسمًا آخر أو عدّل البحث.';
            _context12.n = 11;
            break;
          case 9:
            _context12.p = 9;
            _t0 = _context12.v;
            if (!(!currentInput(input, current) || selected !== selection)) {
              _context12.n = 10;
              break;
            }
            return _context12.a(2);
          case 10:
            status.textContent = _t0.name === 'AbortError' ? 'تأخر البحث المحلي؛ الاسم موجود في صندوق البحث ويمكنك إعادة المحاولة.' : _t0.message;
          case 11:
            _context12.p = 11;
            clearTimeout(timeout);
            return _context12.f(11);
          case 12:
            return _context12.a(2);
        }
      }, _callee11, null, [[3, 9, 11, 12]]);
    }));
    return _selectCandidate.apply(this, arguments);
  }
  function run(_x11, _x12, _x13, _x14, _x15, _x16) {
    return _run.apply(this, arguments);
  }
  function _run() {
    _run = _asyncToGenerator(_regenerator().m(function _callee12(stage, input, q, kind, category, current) {
      var c, timer, r, v, candidates, heading, list, status, details, _iterator8, _step8, _loop5, answer, retry, _t10, _t11;
      return _regenerator().w(function (_context15) {
        while (1) switch (_context15.p = _context15.n) {
          case 0:
            stage.replaceChildren(el('p', 'جارٍ البحث في Gemini…'));
            c = new AbortController();
            controller = c;
            timer = setTimeout(() => c.abort(), 50000);
            _context15.p = 1;
            _context15.n = 2;
            return fetch('/zain/advanced-search', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json'
              },
              credentials: 'same-origin',
              signal: c.signal,
              body: JSON.stringify({
                query: q,
                kind,
                category
              })
            });
          case 2:
            r = _context15.v;
            _context15.n = 3;
            return r.json();
          case 3:
            v = _context15.v;
            if (!(!currentInput(input, current) || input.value.trim() !== q)) {
              _context15.n = 4;
              break;
            }
            return _context15.a(2);
          case 4:
            if (r.ok) {
              _context15.n = 5;
              break;
            }
            throw Error(v.error || (r.status === 405 ? 'تعذر الوصول إلى خدمة البحث؛ يلزم تحديث السيرفر.' : 'تعذر البحث'));
          case 5:
            candidates = Array.isArray(v.candidates) ? v.candidates.map(item => item && Object.assign({}, item, {
              zainAliases: candidateNames(item),
              searchQuery: preferredName(item, category)
            })).filter(item => item && typeof item.searchQuery === 'string' && item.searchQuery.trim() && item.searchQuery.length <= 200).slice(0, 6) : [];
            if (!(!v.answer && !v.message && !candidates.length)) {
              _context15.n = 6;
              break;
            }
            throw Error('لم تصل نتيجة من خدمة البحث');
          case 6:
            stage.replaceChildren(el('h4', 'نتيجة Gemini — ' + kind + ' ' + category));
            if (v.message) stage.append(el('p', v.message));
            if (!candidates.length) {
              _context15.n = 14;
              break;
            }
            heading = box && box.querySelector('h3');
            if (heading) heading.textContent = candidates.length === 1 ? 'نتائج البحث المتقدم' : 'اختر العمل المطلوب';
            list = el('div'), status = el('p'), details = el('details');
            details.className = 'zain-gemini-details';
            details.open = true;
            details.append(el('summary', 'الأسماء المقترحة'));
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            status.className = 'zain-local-search-status';
            list.className = 'zain-gemini-candidates';
            _iterator8 = _createForOfIteratorHelper(candidates);
            _context15.p = 7;
            _loop5 = _regenerator().m(function _loop5() {
              var candidate, card, label, synopsis, description, aliases, choose, _iterator9, _step9, _loop6, _t1;
              return _regenerator().w(function (_context14) {
                while (1) switch (_context14.p = _context14.n) {
                  case 0:
                    candidate = _step8.value;
                    card = el('article');
                    card.className = 'zain-gemini-card';
                    label = (candidate.title || candidate.searchQuery) + (candidate.year ? ' (' + candidate.year + ')' : '');
                    card.append(el('h4', label));
                    if (candidate.synopsis) {
                      synopsis = String(candidate.synopsis).trim();
                      description = el('p', synopsis.length > 180 ? synopsis.slice(0, 177).trim() + '…' : synopsis);
                      description.className = 'zain-gemini-synopsis';
                      description.title = synopsis;
                      card.append(description);
                    }
                    aliases = candidateNames(candidate), choose = el('button', aliases.length > 1 ? 'البحث بجميع الأسماء' : 'البحث عن «' + candidate.searchQuery + '»');
                    choose.type = 'button';
                    choose.className = 'zain-gemini-choose' + (aliases.length > 1 ? ' zain-gemini-all-names' : '');
                    choose.title = 'يجمع نتائج أسماء العمل دون تكرار';
                    choose.onclick = () => selectCandidate(input, allNamesCandidate(candidate), status, current);
                    card.append(choose);
                    if (!(aliases.length > 1)) {
                      _context14.n = 7;
                      break;
                    }
                    _iterator9 = _createForOfIteratorHelper(aliases);
                    _context14.p = 1;
                    _loop6 = _regenerator().m(function _loop6() {
                      var name, b;
                      return _regenerator().w(function (_context13) {
                        while (1) switch (_context13.n) {
                          case 0:
                            name = _step9.value;
                            b = el('button', name);
                            b.type = 'button';
                            b.className = 'zain-gemini-alternate';
                            b.title = 'البحث بهذا الاسم فقط';
                            b.onclick = () => selectCandidate(input, {
                              searchQuery: name
                            }, status, current);
                            card.append(b);
                          case 1:
                            return _context13.a(2);
                        }
                      }, _loop6);
                    });
                    _iterator9.s();
                  case 2:
                    if ((_step9 = _iterator9.n()).done) {
                      _context14.n = 4;
                      break;
                    }
                    return _context14.d(_regeneratorValues(_loop6()), 3);
                  case 3:
                    _context14.n = 2;
                    break;
                  case 4:
                    _context14.n = 6;
                    break;
                  case 5:
                    _context14.p = 5;
                    _t1 = _context14.v;
                    _iterator9.e(_t1);
                  case 6:
                    _context14.p = 6;
                    _iterator9.f();
                    return _context14.f(6);
                  case 7:
                    list.append(card);
                  case 8:
                    return _context14.a(2);
                }
              }, _loop5, null, [[1, 5, 6, 7]]);
            });
            _iterator8.s();
          case 8:
            if ((_step8 = _iterator8.n()).done) {
              _context15.n = 10;
              break;
            }
            return _context15.d(_regeneratorValues(_loop5()), 9);
          case 9:
            _context15.n = 8;
            break;
          case 10:
            _context15.n = 12;
            break;
          case 11:
            _context15.p = 11;
            _t10 = _context15.v;
            _iterator8.e(_t10);
          case 12:
            _context15.p = 12;
            _iterator8.f();
            return _context15.f(12);
          case 13:
            details.append(list);
            stage.replaceChildren(details, status);
            if (candidates.length === 1) selectCandidate(input, allNamesCandidate(candidates[0]), status, current);
            _context15.n = 15;
            break;
          case 14:
            answer = el('div', v.answer || 'لم يتم تحديد عمل مطابق؛ جرّب كتابة اسم أوضح.');
            answer.style.cssText = 'white-space:pre-wrap;line-height:1.9;font-size:17px';
            stage.append(answer);
          case 15:
            _context15.n = 18;
            break;
          case 16:
            _context15.p = 16;
            _t11 = _context15.v;
            if (currentInput(input, current)) {
              _context15.n = 17;
              break;
            }
            return _context15.a(2);
          case 17:
            stage.replaceChildren(el('p', _t11.name === 'AbortError' ? 'انتهت مهلة البحث، يمكنك إعادة المحاولة.' : _t11.message));
            if (/Gemini/.test(_t11.message) && /غير مفعّل/.test(_t11.message)) stage.append(el('p', 'للمسؤول: لوحة التحكم ← التحكم بالعناصر ← إعداد البحث المتقدم — Gemini. مفتاح TMDB مختلف عن مفتاح Gemini.'));
            retry = el('button', 'إعادة المحاولة');
            retry.type = 'button';
            retry.onclick = () => run(stage, input, q, kind, category, current);
            stage.append(retry);
          case 18:
            _context15.p = 18;
            clearTimeout(timer);
            return _context15.f(18);
          case 19:
            return _context15.a(2);
        }
      }, _callee12, null, [[7, 11, 12, 13], [1, 16, 18, 19]]);
    }));
    return _run.apply(this, arguments);
  }
  document.addEventListener('input', e => {
    if (!e.target.matches('.search-items-count .search-bar input') || e.zainAdvancedSelection) return;
    clearTimeout(debounce);
    clear();
    var input = e.target;
    debounce = setTimeout(() => search(input), 700);
  });
  setInterval(() => {
    if (!document.querySelector('.search-items-count')) {
      clearTimeout(debounce);
      if (box) clear();
    }
  }, 1500);
  var settingBusy = false;
  function geminiRequest(_x17, _x18) {
    return _geminiRequest.apply(this, arguments);
  }
  function _geminiRequest() {
    _geminiRequest = _asyncToGenerator(_regenerator().m(function _callee13(action, body) {
      var controller, timer, response, value, _t12, _t13;
      return _regenerator().w(function (_context16) {
        while (1) switch (_context16.p = _context16.n) {
          case 0:
            controller = new AbortController(), timer = setTimeout(() => controller.abort(), 60000);
            _context16.p = 1;
            _context16.p = 2;
            _context16.n = 3;
            return fetch('/admin/api/' + action, {
              method: 'POST',
              credentials: 'same-origin',
              headers: {
                'Content-Type': 'application/json'
              },
              signal: controller.signal,
              body: JSON.stringify(body)
            });
          case 3:
            response = _context16.v;
            _context16.n = 5;
            break;
          case 4:
            _context16.p = 4;
            _t12 = _context16.v;
            throw Error(_t12.name === 'AbortError' ? 'انتهت مهلة الاتصال؛ أعد المحاولة بعد قليل.' : 'تعذر الوصول إلى سيرفر الاستراحة. تأكد أنه يعمل وأن الجهاز متصل به، ثم أعد المحاولة. لم يتم تغيير الإعدادات.');
          case 5:
            if (!(response.status === 401 || response.status === 403)) {
              _context16.n = 6;
              break;
            }
            throw Error('انتهت جلسة لوحة التحكم أو لا توجد صلاحية؛ سجّل الدخول مجددًا ثم أعد المحاولة.');
          case 6:
            _context16.p = 6;
            _context16.n = 7;
            return response.json();
          case 7:
            value = _context16.v;
            _context16.n = 9;
            break;
          case 8:
            _context16.p = 8;
            _t13 = _context16.v;
            throw Error('وصل رد غير صالح من سيرفر الاستراحة؛ أعد فتح لوحة التحكم وتأكد من تشغيل النسخة المحدّثة.');
          case 9:
            if (!(!response.ok || value.msg !== 'ok')) {
              _context16.n = 10;
              break;
            }
            throw Error(value.error || 'تعذر تنفيذ الطلب؛ أعد المحاولة.');
          case 10:
            return _context16.a(2, value);
          case 11:
            _context16.p = 11;
            clearTimeout(timer);
            return _context16.f(11);
          case 12:
            return _context16.a(2);
        }
      }, _callee13, null, [[6, 8], [2, 4], [1,, 11, 12]]);
    }));
    return _geminiRequest.apply(this, arguments);
  }
  function settings() {
    return _settings.apply(this, arguments);
  }
  function _settings() {
    _settings = _asyncToGenerator(_regenerator().m(function _callee15() {
      var _document$querySelect;
      var host, response, current, area, form, key, model, enabled, translation, status, save, test, help, searchLabel, translationLabel, refreshHelp, _i3, _arr3, input, busy, submit, _submit;
      return _regenerator().w(function (_context18) {
        while (1) switch (_context18.p = _context18.n) {
          case 0:
            if (!(location.pathname !== '/admin/items' || document.getElementById('zain-gemini-settings') || settingBusy)) {
              _context18.n = 1;
              break;
            }
            return _context18.a(2);
          case 1:
            host = (_document$querySelect = document.querySelector('.left-menu .items')) === null || _document$querySelect === void 0 ? void 0 : _document$querySelect.parentElement;
            if (host) {
              _context18.n = 2;
              break;
            }
            return _context18.a(2);
          case 2:
            settingBusy = true;
            _context18.p = 3;
            _submit = function _submit3() {
              _submit = _asyncToGenerator(_regenerator().m(function _callee14(action) {
                var value, _t14;
                return _regenerator().w(function (_context17) {
                  while (1) switch (_context17.p = _context17.n) {
                    case 0:
                      if (!busy) {
                        _context17.n = 1;
                        break;
                      }
                      return _context17.a(2);
                    case 1:
                      busy = true;
                      save.disabled = test.disabled = true;
                      status.style.color = '#ddd';
                      status.textContent = action === 'testGeminiKey' ? 'جارٍ فحص المفتاح والنموذج من السيرفر…' : 'جارٍ حفظ إعدادات Gemini…';
                      _context17.p = 2;
                      _context17.n = 3;
                      return geminiRequest(action, {
                        key: key.value,
                        model: model.value.trim(),
                        enabled: enabled.checked,
                        translateDescriptions: translation.checked
                      });
                    case 3:
                      value = _context17.v;
                      status.style.color = '#aee6ad';
                      if (action === 'saveGeminiSettings') {
                        key.value = '';
                        refreshHelp(value.configured);
                        status.textContent = 'تم حفظ إعدادات Gemini. استخدم «فحص المفتاح» للتأكد من اتصال السيرفر بالخدمة.';
                      } else status.textContent = value.message || 'نجح الفحص؛ المفتاح والنموذج يعملان من هذا السيرفر.';
                      _context17.n = 5;
                      break;
                    case 4:
                      _context17.p = 4;
                      _t14 = _context17.v;
                      status.style.color = '#ffb5b5';
                      status.textContent = _t14.message;
                    case 5:
                      _context17.p = 5;
                      busy = false;
                      save.disabled = test.disabled = false;
                      return _context17.f(5);
                    case 6:
                      return _context17.a(2);
                  }
                }, _callee14, null, [[2, 4, 5, 6]]);
              }));
              return _submit.apply(this, arguments);
            };
            submit = function _submit2(_x19) {
              return _submit.apply(this, arguments);
            };
            refreshHelp = function _refreshHelp(configured) {
              key.placeholder = configured ? 'المفتاح محفوظ؛ اتركه فارغًا للاحتفاظ به' : 'أدخل مفتاح Gemini API';
              help.textContent = configured ? 'مفتاح Gemini محفوظ على السيرفر. يمكنك فحصه أو إدخال مفتاح بديل.' : 'لم يتم حفظ مفتاح Gemini بعد. مفتاح TMDB الموجود في الصفحة مخصص لبيانات الأفلام وصور الممثلين.';
            };
            _context18.n = 4;
            return fetch('/admin/api/getGeminiSettings', {
              credentials: 'same-origin'
            });
          case 4:
            response = _context18.v;
            if (response.ok) {
              _context18.n = 5;
              break;
            }
            return _context18.a(2);
          case 5:
            _context18.n = 6;
            return response.json();
          case 6:
            current = _context18.v;
            area = el('details');
            area.id = 'zain-gemini-settings';
            area.open = !current.configured;
            area.style.cssText = 'background:#202638;padding:15px;margin:20px 0;direction:rtl';
            area.append(el('summary', 'إعداد Gemini — البحث المتقدم وترجمة الوصف'));
            form = el('form'), key = el('input'), model = el('input'), enabled = el('input'), translation = el('input'), status = el('p'), save = el('button', 'حفظ إعدادات Gemini'), test = el('button', 'فحص المفتاح'), help = el('p');
            key.type = 'password';
            key.name = 'gemini-key';
            key.setAttribute('aria-label', 'مفتاح Gemini API');
            key.autocomplete = 'new-password';
            key.spellcheck = false;
            model.value = current.model;
            model.setAttribute('aria-label', 'اسم نموذج Gemini');
            model.autocomplete = 'off';
            enabled.type = 'checkbox';
            enabled.checked = current.enabled;
            translation.type = 'checkbox';
            translation.checked = current.translateDescriptions !== false;
            searchLabel = el('label', ' تفعيل البحث المتقدم'), translationLabel = el('label', ' ترجمة وصف القصة للعربية أثناء المزامنة إذا لم يتوفر وصف عربي');
            searchLabel.prepend(enabled);
            translationLabel.prepend(translation);
            translationLabel.style.display = 'block';
            refreshHelp(current.configured);
            status.setAttribute('role', 'status');
            status.setAttribute('aria-live', 'polite');
            status.style.cssText = 'white-space:pre-wrap;min-height:28px';
            for (_i3 = 0, _arr3 = [key, model]; _i3 < _arr3.length; _i3++) {
              input = _arr3[_i3];
              input.style.cssText = 'display:block;width:95%;margin:10px 0;padding:10px;color:white;background:#101523';
            }
            test.type = 'button';
            save.type = 'submit';
            test.id = 'zain-gemini-test';
            save.id = 'zain-gemini-save';
            form.append(help, searchLabel, translationLabel, el('p', 'المفتاح يبقى على السيرفر ولا يُرسل للزوار. الفحص يرسل طلبًا قصيرًا إلى Google وقد يُحتسب ضمن حصة حسابك. الترجمة تحتفظ بالوصف الإنجليزي ولا تستبدل وصفًا عربيًا موجودًا.'), key, el('label', 'اسم النموذج'), model, test, save, status);
            area.append(form);
            host.prepend(area);
            busy = false;
            form.onsubmit = event => {
              event.preventDefault();
              submit('saveGeminiSettings');
            };
            test.onclick = () => submit('testGeminiKey');
          case 7:
            _context18.p = 7;
            settingBusy = false;
            return _context18.f(7);
          case 8:
            return _context18.a(2);
        }
      }, _callee15, null, [[3,, 7, 8]]);
    }));
    return _settings.apply(this, arguments);
  }
  setInterval(() => settings().catch(() => {}), 1500);
})();
(() => {
  'use strict';

  document.addEventListener('click', e => {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var link = e.target.closest && e.target.closest('header a,header .item');
    if (!link || link.textContent.trim() !== 'طلب') return;
    e.preventDefault();
    e.stopImmediatePropagation();
    location.href = 'yemencafe://new-request';
    var notice = document.getElementById('zain-yemen-request-note');
    if (!notice) {
      notice = document.createElement('div');
      notice.id = 'zain-yemen-request-note';
      notice.style.cssText = 'position:fixed;bottom:20px;right:20px;z-index:99999;background:#202638;color:white;padding:16px;max-width:360px;direction:rtl';
      notice.textContent = 'يُفتح طلب جديد في يمن كافي. إذا لم يفتح، شغّل عميل يمن كافي المحدّث مرة واحدة على هذا الجهاز، ثم أعد المحاولة. اضغط لإخفاء الرسالة.';
      notice.onclick = () => notice.remove();
      document.body.append(notice);
    }
  }, true);
})();
(() => {
  'use strict';

  var style = document.createElement('style');
  style.textContent = `
.admin-cont .sections-cont .sec .btns{display:grid!important;grid-template-columns:28px 28px!important;grid-auto-rows:28px!important;gap:4px!important;position:absolute!important;left:6px!important;right:auto!important;top:6px!important;bottom:auto!important;width:auto!important;height:auto!important;padding:4px!important;background:#101725b8;border-radius:10px;z-index:5!important;box-sizing:border-box}
.admin-cont .sections-cont .sec .btns>.admin-button-icon{position:static!important;float:none!important;display:flex!important;align-items:center!important;justify-content:center!important;width:28px!important;height:28px!important;min-width:28px!important;margin:0!important;padding:0!important;border:0!important;border-radius:8px!important;box-sizing:border-box;cursor:pointer;font-size:15px!important;line-height:1!important}
.admin-cont .sections-cont .sec .btns svg{pointer-events:none;display:block;flex:none}.admin-cont .sections-cont .sec .btns>[aria-busy=true]{opacity:.55;cursor:wait}.admin-cont .sections-cont .sec .btns>button:focus{outline:2px solid white;outline-offset:1px}
header .zain-main-link .item{margin-left:16px!important;padding-left:16px!important;border-left:1px solid #ffffff35}header .zain-home-entry>.zain-home-section{font:700 14px Estra7ahBold,Arial,sans-serif!important;line-height:22px!important;padding:6px 5px!important;max-width:180px;overflow:hidden;text-overflow:ellipsis}header .zain-nav-expand{font-size:16px!important;padding:8px 5px!important}
.zain-home-compact .NetWorkTitle{padding:12px 0 8px!important;margin:0!important;height:auto!important;min-height:0!important}.zain-home-compact:not(.zain-has-hero) .NetWorkTitle{padding-top:calc(var(--zain-header-height,72px) + 12px)!important}.zain-home-compact .NetWorkTitle .cont{height:auto!important;min-height:0!important;padding:0!important;margin:0!important}.zain-home-compact .NetWorkTitle .title{font-size:28px!important;line-height:1.4!important;margin:0!important}.zain-home-compact .NetWorkTitle .desc{margin:3px 0!important;line-height:1.6!important}.zain-home-compact .zain-news-wrap{height:auto!important;min-height:48px!important;margin:0!important;padding:0!important}.zain-home-compact .news{margin:4px 0!important;padding:0!important;min-height:40px!important}.zain-home-compact .startSections{padding:0!important;margin:8px 0 14px!important}.zain-home-compact .zain-start-wrap{margin:0!important;padding:0!important}
#zain-advanced-search{font:14px Arial!important;line-height:1.4!important;padding:6px 10px!important;margin:6px auto!important;max-width:1100px!important;border-radius:8px!important}#zain-advanced-search h3{font-size:15px!important;line-height:1.4!important;margin:0 0 2px!important}#zain-advanced-search .zain-gemini-details>summary{cursor:pointer;padding:0 3px;color:#cbd3ff;font-size:13px;line-height:1.4}#zain-advanced-search .zain-gemini-candidates{max-height:180px;overflow:auto}#zain-advanced-search .zain-gemini-card{border:1px solid #515b76;border-radius:6px;padding:4px 6px;margin:3px 0}#zain-advanced-search .zain-gemini-card h4{font-size:14px;line-height:1.4;margin:0 0 2px}#zain-advanced-search p{font-size:14px!important;margin:4px 0!important}#zain-advanced-search .zain-gemini-synopsis{font-size:13px!important;line-height:1.35;margin:2px 0!important}#zain-advanced-search .zain-local-search-status{margin:2px 0 0!important;font-size:12px!important;line-height:1.4}#zain-advanced-search button,#zain-gemini-settings button{font:700 17px Arial!important;min-height:46px!important;padding:12px 24px!important;background:#555ea5;color:white;border:1px solid #8791d0;border-radius:9px;cursor:pointer;margin:7px}#zain-advanced-search .zain-gemini-card button{font:700 13px Arial!important;min-height:30px!important;padding:4px 8px!important;margin:2px!important;border-radius:6px}#zain-advanced-search .zain-gemini-all-names{background:#404e93}
#zain-gemini-settings{font:16px Arial!important;line-height:1.8}#zain-gemini-settings summary{font-size:19px;font-weight:bold;cursor:pointer;padding:8px}#zain-gemini-settings input:not([type=checkbox]){font-size:16px!important;min-height:42px;box-sizing:border-box}#zain-gemini-settings input[type=checkbox]{width:19px;height:19px;vertical-align:middle}
`;
  document.head.appendChild(style);
  var waiting = false;
  function update() {
    waiting = false;
    var host = document.querySelector('.interface');
    if (!host) return;
    host.classList.toggle('zain-home-compact', location.pathname === '/');
    host.classList.toggle('zain-has-hero', !!host.querySelector('#zain-exclusive'));
    var header = host.querySelector('header');
    if (header) {
      var height = Math.ceil(header.getBoundingClientRect().height) + 'px';
      if (host.style.getPropertyValue('--zain-header-height') !== height) host.style.setProperty('--zain-header-height', height);
    }
    if (location.pathname === '/') {
      var news = host.querySelector('.news'),
        cards = host.querySelector('.startSections');
      if (news) news.parentElement.classList.add('zain-news-wrap');
      if (cards) cards.parentElement.classList.add('zain-start-wrap');
    }
  }
  function schedule() {
    if (!waiting) {
      waiting = true;
      requestAnimationFrame(update);
    }
  }
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });
  window.addEventListener('resize', schedule);
  setInterval(schedule, 1500);
  schedule();
})();