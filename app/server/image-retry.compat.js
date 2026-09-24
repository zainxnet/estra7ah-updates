function _regenerator() { var e, t, r = "function" == typeof Symbol ? Symbol : {}, n = r.iterator || "@@iterator", o = r.toStringTag || "@@toStringTag"; function i(r, n, o, i) { var c = n && n.prototype instanceof Generator ? n : Generator, u = Object.create(c.prototype); return _regeneratorDefine2(u, "_invoke", function (r, n, o) { var i, c, u, f = 0, p = o || [], y = !1, G = { p: 0, n: 0, v: e, a: d, f: d.bind(e, 4), d: function d(t, r) { return i = t, c = 0, u = e, G.n = r, a; } }; function d(r, n) { for (c = r, u = n, t = 0; !y && f && !o && t < p.length; t++) { var o, i = p[t], d = G.p, l = i[2]; r > 3 ? (o = l === n) && (u = i[(c = i[4]) ? 5 : (c = 3, 3)], i[4] = i[5] = e) : i[0] <= d && ((o = r < 2 && d < i[1]) ? (c = 0, G.v = n, G.n = i[1]) : d < l && (o = r < 3 || i[0] > n || n > l) && (i[4] = r, i[5] = n, G.n = l, c = 0)); } if (o || r > 1) return a; throw y = !0, n; } return function (o, p, l) { if (f > 1) throw TypeError("Generator is already running"); for (y && 1 === p && d(p, l), c = p, u = l; (t = c < 2 ? e : u) || !y;) { i || (c ? c < 3 ? (c > 1 && (G.n = -1), d(c, u)) : G.n = u : G.v = u); try { if (f = 2, i) { if (c || (o = "next"), t = i[o]) { if (!(t = t.call(i, u))) throw TypeError("iterator result is not an object"); if (!t.done) return t; u = t.value, c < 2 && (c = 0); } else 1 === c && (t = i.return) && t.call(i), c < 2 && (u = TypeError("The iterator does not provide a '" + o + "' method"), c = 1); i = e; } else if ((t = (y = G.n < 0) ? u : r.call(n, G)) !== a) break; } catch (t) { i = e, c = 1, u = t; } finally { f = 1; } } return { value: t, done: y }; }; }(r, o, i), !0), u; } var a = {}; function Generator() {} function GeneratorFunction() {} function GeneratorFunctionPrototype() {} t = Object.getPrototypeOf; var c = [][n] ? t(t([][n]())) : (_regeneratorDefine2(t = {}, n, function () { return this; }), t), u = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(c); function f(e) { return Object.setPrototypeOf ? Object.setPrototypeOf(e, GeneratorFunctionPrototype) : (e.__proto__ = GeneratorFunctionPrototype, _regeneratorDefine2(e, o, "GeneratorFunction")), e.prototype = Object.create(u), e; } return GeneratorFunction.prototype = GeneratorFunctionPrototype, _regeneratorDefine2(u, "constructor", GeneratorFunctionPrototype), _regeneratorDefine2(GeneratorFunctionPrototype, "constructor", GeneratorFunction), GeneratorFunction.displayName = "GeneratorFunction", _regeneratorDefine2(GeneratorFunctionPrototype, o, "GeneratorFunction"), _regeneratorDefine2(u), _regeneratorDefine2(u, o, "Generator"), _regeneratorDefine2(u, n, function () { return this; }), _regeneratorDefine2(u, "toString", function () { return "[object Generator]"; }), (_regenerator = function _regenerator() { return { w: i, m: f }; })(); }
function _regeneratorDefine2(e, r, n, t) { var i = Object.defineProperty; try { i({}, "", {}); } catch (e) { i = 0; } _regeneratorDefine2 = function _regeneratorDefine(e, r, n, t) { function o(r, n) { _regeneratorDefine2(e, r, function (e) { return this._invoke(r, n, e); }); } r ? i ? i(e, r, { value: n, enumerable: !t, configurable: !t, writable: !t }) : e[r] = n : (o("next", 0), o("throw", 1), o("return", 2)); }, _regeneratorDefine2(e, r, n, t); }
function asyncGeneratorStep(n, t, e, r, o, a, c) { try { var i = n[a](c), u = i.value; } catch (n) { return void e(n); } i.done ? t(u) : Promise.resolve(u).then(r, o); }
function _asyncToGenerator(n) { return function () { var t = this, e = arguments; return new Promise(function (r, o) { var a = n.apply(t, e); function _next(n) { asyncGeneratorStep(a, r, o, _next, _throw, "next", n); } function _throw(n) { asyncGeneratorStep(a, r, o, _next, _throw, "throw", n); } _next(void 0); }); }; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
(() => {
  'use strict';

  var posterStyle = document.createElement('style');
  posterStyle.textContent = ".image-loading>svg{display:block!important}.image-loading[data-zain-pending=\"no\"]{display:none!important}.zain-poster-slot{position:relative}.zain-poster-slot>.image-loading{position:absolute;top:0;left:0;width:100%;height:100%}.zain-poster-slot>.image-loading>svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}img[data-zain-artwork=\"unavailable\"]{visibility:visible!important}.image-loading[data-zain-pending=\"yes\"]{display:block!important}.zain-poster-slot{display:block;background:#202638;border-radius:8px;overflow:hidden}img[data-zain-artwork=\"queued\"],img[data-zain-artwork=\"loading\"]{aspect-ratio:2/3;background:#202638!important;color:transparent!important;visibility:hidden!important}img[data-zain-artwork=\"ready\"]{visibility:visible!important}";
  document.head.appendChild(posterStyle);
  var states = new WeakMap(),
    tracked = new Set(),
    MAX_TRIES = 6;
  var active = 0,
    scheduled = false;
  var missing = '/assets/imgs/no-img.png';
  var connected = img => document.documentElement.contains(img);
  function source(raw) {
    try {
      var u = new URL(raw, location.href);
      if (u.origin !== location.origin || !/^\/(?:api\/+)?itemimage\/[\w.-]+\/?$/i.test(u.pathname)) return null;
      u.search = u.search.slice(1).split('&').filter(part => part && !/^zainRetry=/i.test(part)).join('&');
      return u.href;
    } catch (_unused) {
      return null;
    }
  }
  function mark(img, status) {
    img.setAttribute('data-zain-artwork', status);
    if (!window.CSS || !CSS.supports || !CSS.supports('aspect-ratio', '2 / 3')) {
      if (status === 'queued' || status === 'loading') {
        var _img$parentElement;
        var width = img.getBoundingClientRect().width || ((_img$parentElement = img.parentElement) === null || _img$parentElement === void 0 ? void 0 : _img$parentElement.clientWidth) || 100;
        img.style.minHeight = Math.round(width * 1.5) + 'px';
      } else img.style.minHeight = '';
    }
    var p = img.parentElement;
    if (p) {
      var _iterator = _createForOfIteratorHelper(p.children),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var child = _step.value;
          if (child.classList.contains('image-loading')) child.setAttribute('data-zain-pending', status === 'queued' || status === 'loading' ? 'yes' : 'no');
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }
  function freeSlot(s) {
    if (s && s.slot) {
      s.slot = false;
      active--;
    }
  }
  function release(img, s) {
    freeSlot(s);
    if (s !== null && s !== void 0 && s.controller) s.controller.abort();
    if (s !== null && s !== void 0 && s.objectUrl) URL.revokeObjectURL(s.objectUrl);
    tracked.delete(img);
    states.delete(img);
  }
  function state(img) {
    if (!img || img.tagName !== 'IMG') return null;
    var raw = img.getAttribute('src') || '',
      desired = source(img.getAttribute('data-zain-src') || '');
    var s = states.get(img);
    if (s && raw === s.rendered && (!desired || desired === s.url)) return s;
    var url = desired || source(raw);
    if (!url && (!raw || /^data:image\//i.test(raw))) {
      var _a$getAttribute;
      var a = img.closest('a[href*="/itemView/"]'),
        m = a === null || a === void 0 || (_a$getAttribute = a.getAttribute('href')) === null || _a$getAttribute === void 0 ? void 0 : _a$getAttribute.match(/\/itemView\/[^/]+\/([\w.-]+)/);
      if (m) url = new URL('/ItemImage/' + m[1], location.href).href;
    }
    if (s) release(img, s);
    if (!url) return null;
    s = {
      url,
      rendered: raw,
      next: 0,
      tries: 0,
      ready: false,
      busy: false,
      verified: false,
      nativeStarted: Date.now(),
      awaitingNative: false,
      queued: !!desired || !source(raw),
      slot: false
    };
    states.set(img, s);
    tracked.add(img);
    mark(img, s.queued ? 'queued' : 'loading');
    return s;
  }
  function distance(img) {
    var r = img.getBoundingClientRect();
    return r.top > innerHeight ? r.top - innerHeight : r.bottom < 0 ? -r.bottom : 0;
  }
  function visible(img) {
    var r = img.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom >= -150 && r.top <= innerHeight + Math.max(400, Math.min(900, innerHeight * .85)) && r.right >= -100 && r.left <= innerWidth + 100;
  }
  function begin(img, s) {
    s.queued = false;
    recover(img, s);
  }
  function ready(img, s) {
    freeSlot(s);
    s.ready = true;
    s.awaitingNative = false;
    mark(img, 'ready');
  }
  function fail(img, s) {
    freeSlot(s);
    s.verified = false;
    s.awaitingNative = false;
    if (s.tries >= MAX_TRIES) {
      s.ready = false;
      s.rendered = missing;
      img.src = missing;
      mark(img, 'unavailable');
      return;
    }
    s.next = Date.now() + Math.min(15000, 750 * Math.pow(2, s.tries - 1));
    mark(img, 'loading');
  }
  function recover(_x, _x2) {
    return _recover.apply(this, arguments);
  }
  function _recover() {
    _recover = _asyncToGenerator(_regenerator().m(function _callee(img, s) {
      var controller, timer, r, b, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            active++;
            s.busy = true;
            s.tries++;
            s.controller = new AbortController();
            controller = s.controller;
            mark(img, 'loading');
            _context.p = 1;
            _context.n = 2;
            return Promise.race([fetch(s.url, {
              signal: controller.signal,
              cache: 'default',
              credentials: 'same-origin'
            }), new Promise((_, reject) => {
              timer = setTimeout(() => {
                controller.abort();
                reject(Error('timeout'));
              }, 15000);
            })]);
          case 2:
            r = _context.v;
            if (!(!r.ok || r.headers.get('X-Zain-Placeholder') || !/^(image\/)/i.test(r.headers.get('Content-Type') || '') || /svg/i.test(r.headers.get('Content-Type') || ''))) {
              _context.n = 3;
              break;
            }
            throw Error('pending');
          case 3:
            _context.n = 4;
            return r.blob();
          case 4:
            b = _context.v;
            if (!(!b.size || b.size > 8 * 1024 * 1024)) {
              _context.n = 5;
              break;
            }
            throw Error('invalid');
          case 5:
            if (!(!connected(img) || states.get(img) !== s)) {
              _context.n = 6;
              break;
            }
            return _context.a(2);
          case 6:
            s.verified = true;
            s.awaitingNative = true;
            s.nativeStarted = Date.now();
            s.next = Date.now() + 15000;
            if (s.objectUrl) URL.revokeObjectURL(s.objectUrl);
            s.objectUrl = URL.createObjectURL(b);
            s.rendered = s.objectUrl;
            img.src = s.objectUrl;
            _context.n = 8;
            break;
          case 7:
            _context.p = 7;
            _t = _context.v;
            if (connected(img) && states.get(img) === s) fail(img, s);
          case 8:
            _context.p = 8;
            clearTimeout(timer);
            s.controller = null;
            s.busy = false;
            active--;
            schedule();
            return _context.f(8);
          case 9:
            return _context.a(2);
        }
      }, _callee, null, [[1, 7, 8, 9]]);
    }));
    return _recover.apply(this, arguments);
  }
  function refresh() {
    scheduled = false;
    var _iterator2 = _createForOfIteratorHelper(Array.from(tracked).sort((a, b) => distance(a) - distance(b))),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var img = _step2.value;
        var s = states.get(img);
        if (!connected(img)) {
          release(img, s);
          continue;
        }
        if (!s || s.ready || s.busy || s.tries >= MAX_TRIES || document.hidden) continue;
        if (s.queued) {
          if (visible(img) && active < 4) begin(img, s);
          continue;
        }
        var pending = Date.now() - s.nativeStarted < 15000;
        if (s.slot && img.complete) freeSlot(s);
        if (s.awaitingNative && pending) continue;
        if (img.complete && img.naturalWidth > 0) {
          if (s.verified || img.naturalWidth !== 300 || img.naturalHeight !== 450) {
            ready(img, s);
            continue;
          }
        } else if (!img.complete && pending) continue;
        if (Date.now() < s.next || !visible(img)) continue;
        if (active < 4) recover(img, s);
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
  }
  function schedule() {
    if (!scheduled) {
      scheduled = true;
      requestAnimationFrame(refresh);
    }
  }
  function discover(node) {
    if (node.nodeType !== 1) return;
    if (node.tagName === 'IMG') state(node);
    var _iterator3 = _createForOfIteratorHelper(node.querySelectorAll('img')),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var img = _step3.value;
        state(img);
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
  }
  document.addEventListener('load', e => {
    var img = e.target,
      s = state(img);
    if (!s || s.rendered === missing) return;
    if (img.naturalWidth > 0 && (s.verified || img.naturalWidth !== 300 || img.naturalHeight !== 450)) ready(img, s);
    schedule();
  }, true);
  document.addEventListener('error', e => {
    var img = e.target,
      s = state(img);
    if (!s || s.rendered === missing) return;
    freeSlot(s);
    s.ready = false;
    if (s.awaitingNative) {
      fail(img, s);
    } else {
      s.verified = false;
      s.next = Date.now();
    }
    schedule();
  }, true);
  new MutationObserver(records => {
    var _iterator4 = _createForOfIteratorHelper(records),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var record = _step4.value;
        if (record.type === 'attributes') state(record.target);else {
          var _iterator5 = _createForOfIteratorHelper(record.addedNodes),
            _step5;
          try {
            for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
              var node = _step5.value;
              discover(node);
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
    schedule();
  }).observe(document.documentElement, {
    childList: true,
    subtree: true,
    attributes: true,
    attributeFilter: ['src', 'data-zain-src']
  });
  var _iterator6 = _createForOfIteratorHelper(document.images),
    _step6;
  try {
    for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
      var img = _step6.value;
      state(img);
    }
  } catch (err) {
    _iterator6.e(err);
  } finally {
    _iterator6.f();
  }
  setInterval(schedule, 1500);
  schedule();
  window.addEventListener('scroll', schedule, true);
  window.addEventListener('resize', schedule);
  window.addEventListener('online', () => {
    var _iterator7 = _createForOfIteratorHelper(tracked),
      _step7;
    try {
      for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
        var img = _step7.value;
        var s = states.get(img);
        if (!s.ready && !s.busy) {
          s.tries = 0;
          s.next = 0;
          if (s.rendered === missing) {
            s.queued = true;
            s.rendered = '';
            img.removeAttribute('src');
          }
        }
      }
    } catch (err) {
      _iterator7.e(err);
    } finally {
      _iterator7.f();
    }
    schedule();
  });
  document.addEventListener('visibilitychange', schedule);
})();