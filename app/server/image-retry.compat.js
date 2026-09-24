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
  posterStyle.textContent = ".image-loading>svg{display:block!important}.image-loading[data-zain-pending=\"no\"]{display:none!important}.zain-poster-slot{position:relative}.zain-poster-slot>.image-loading{position:absolute;top:0;left:0;width:100%;height:100%}.zain-poster-slot>.image-loading>svg{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%)}img[data-zain-artwork=\"unavailable\"]{visibility:visible!important}.image-loading[data-zain-pending=\"yes\"]{display:block!important}.zain-poster-slot{display:block;background:#202638;border-radius:8px;overflow:hidden}img[data-zain-artwork=\"queued\"],img[data-zain-artwork=\"loading\"]{width:100%!important;aspect-ratio:2/3;background:#202638!important;color:transparent!important;visibility:hidden!important}img[data-zain-artwork=\"ready\"]{visibility:visible!important}";
  document.head.appendChild(posterStyle);
  var states = new WeakMap(),
    tracked = new Set(),
    MAX_TRIES = 6;
  var active = 0,
    backgroundActive = 0,
    scheduled = false,
    retryTimer = 0,
    retryAt = 0;
  var MAX_VISIBLE_REQUESTS = 12,
    MAX_BACKGROUND_REQUESTS = 6,
    MAX_PENDING_MS = 60000;
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
    if (status === 'queued' || status === 'loading') {
      var _img$parentElement;
      var width = ((_img$parentElement = img.parentElement) === null || _img$parentElement === void 0 ? void 0 : _img$parentElement.clientWidth) || img.getBoundingClientRect().width || 100;
      img.style.minHeight = Math.round(width * 1.5) + 'px';
    } else img.style.minHeight = '';
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
    if (/^\/(?:index\.html)?$/i.test(location.pathname) && raw) {
      try {
        var cover = new URL(raw, location.href);
        if (cover.origin === location.origin && /^\/(?:api\/+)?sectionimage\/[\w.-]+\/?$/i.test(cover.pathname)) {
          img.loading = 'eager';
          img.decoding = 'async';
        }
      } catch (_unused2) {}
    }
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
      slot: false,
      pendingStarted: 0
    };
    states.set(img, s);
    tracked.add(img);
    mark(img, s.queued ? 'queued' : 'loading');
    return s;
  }
  function position(img, home) {
    var r = img.getBoundingClientRect(),
      shown = r.width > 0 && r.height > 0,
      horizontal = r.right >= 0 && r.left <= innerWidth,
      visible = shown && horizontal && r.bottom >= 0 && r.top <= innerHeight,
      preloadBelow = Math.max(2400, Math.min(6000, innerHeight * 5));
    return {
      img,
      visible,
      eligible: shown && (home || horizontal && r.bottom >= -300 && r.top <= innerHeight + preloadBelow),
      distance: (r.top > innerHeight ? r.top - innerHeight : r.bottom < 0 ? -r.bottom : 0) + (horizontal ? 0 : innerHeight + Math.min(Math.abs(r.left), Math.abs(r.right - innerWidth)))
    };
  }
  function begin(img, s, background) {
    s.queued = false;
    img.loading = 'eager';
    img.decoding = 'async';
    recover(img, s, background);
  }
  function retrySoon(at) {
    if (retryTimer && retryAt <= at) return;
    clearTimeout(retryTimer);
    retryAt = at;
    retryTimer = setTimeout(() => {
      retryTimer = 0;
      retryAt = 0;
      schedule();
    }, Math.max(0, at - Date.now()));
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
    retrySoon(s.next);
  }
  function recover(_x, _x2, _x3) {
    return _recover.apply(this, arguments);
  }
  function _recover() {
    _recover = _asyncToGenerator(_regenerator().m(function _callee(img, s, background) {
      var controller, timer, r, placeholder, retrySeconds, b, _t;
      return _regenerator().w(function (_context) {
        while (1) switch (_context.p = _context.n) {
          case 0:
            active++;
            if (background) backgroundActive++;
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
            placeholder = r.headers.get('X-Zain-Placeholder');
            if (!(placeholder === 'pending-artwork' || r.headers.get('X-Zain-Artwork-State') === 'pending')) {
              _context.n = 5;
              break;
            }
            _context.n = 3;
            return r.arrayBuffer();
          case 3:
            if (!s.pendingStarted) s.pendingStarted = Date.now();
            if (!(Date.now() - s.pendingStarted >= MAX_PENDING_MS)) {
              _context.n = 4;
              break;
            }
            s.tries = MAX_TRIES;
            throw Error('pending-timeout');
          case 4:
            s.tries--;
            retrySeconds = Number(r.headers.get('Retry-After'));
            s.next = Date.now() + Math.max(300, Math.min(3000, Number.isFinite(retrySeconds) && retrySeconds > 0 ? retrySeconds * 1000 : 500));
            s.awaitingNative = false;
            retrySoon(s.next);
            return _context.a(2);
          case 5:
            if (!(!r.ok || placeholder || !/^(image\/)/i.test(r.headers.get('Content-Type') || '') || /svg/i.test(r.headers.get('Content-Type') || ''))) {
              _context.n = 6;
              break;
            }
            throw Error('pending');
          case 6:
            _context.n = 7;
            return r.blob();
          case 7:
            b = _context.v;
            if (!(!b.size || b.size > 8 * 1024 * 1024)) {
              _context.n = 8;
              break;
            }
            throw Error('invalid');
          case 8:
            if (!(!connected(img) || states.get(img) !== s)) {
              _context.n = 9;
              break;
            }
            return _context.a(2);
          case 9:
            s.verified = true;
            s.awaitingNative = true;
            s.nativeStarted = Date.now();
            s.next = Date.now() + 15000;
            if (s.objectUrl) URL.revokeObjectURL(s.objectUrl);
            s.objectUrl = URL.createObjectURL(b);
            s.rendered = s.objectUrl;
            img.src = s.objectUrl;
            _context.n = 11;
            break;
          case 10:
            _context.p = 10;
            _t = _context.v;
            if (connected(img) && states.get(img) === s) fail(img, s);
          case 11:
            _context.p = 11;
            clearTimeout(timer);
            s.controller = null;
            s.busy = false;
            active--;
            if (background) backgroundActive--;
            schedule();
            return _context.f(11);
          case 12:
            return _context.a(2);
        }
      }, _callee, null, [[1, 10, 11, 12]]);
    }));
    return _recover.apply(this, arguments);
  }
  function refresh() {
    scheduled = false;
    var home = /^\/(?:index\.html)?$/i.test(location.pathname),
      candidates = [];
    var _iterator2 = _createForOfIteratorHelper(tracked),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var _img = _step2.value;
        var _s = states.get(_img);
        if (!connected(_img)) {
          release(_img, _s);
          continue;
        }
        if (_s && !_s.ready && !_s.busy && _s.tries < MAX_TRIES) candidates.push(position(_img, home));
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    candidates.sort((a, b) => Number(b.visible) - Number(a.visible) || a.distance - b.distance);
    for (var _i = 0, _candidates = candidates; _i < _candidates.length; _i++) {
      var candidate = _candidates[_i];
      var img = candidate.img,
        visible = candidate.visible,
        eligible = candidate.eligible,
        s = states.get(img);
      if (document.hidden) break;
      var available = active < MAX_VISIBLE_REQUESTS && (visible || backgroundActive < MAX_BACKGROUND_REQUESTS);
      if (s.queued) {
        if (eligible && available) begin(img, s, !visible);
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
      if (Date.now() < s.next || !eligible) continue;
      if (available) recover(img, s, !visible);
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