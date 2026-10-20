function _slicedToArray(r, e) { return _arrayWithHoles(r) || _iterableToArrayLimit(r, e) || _unsupportedIterableToArray(r, e) || _nonIterableRest(); }
function _nonIterableRest() { throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); }
function _iterableToArrayLimit(r, l) { var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (null != t) { var e, n, i, u, a = [], f = !0, o = !1; try { if (i = (t = t.call(r)).next, 0 === l) { if (Object(t) !== t) return; f = !1; } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0); } catch (r) { o = !0, n = r; } finally { try { if (!f && null != t.return && (u = t.return(), Object(u) !== u)) return; } finally { if (o) throw n; } } return a; } }
function _arrayWithHoles(r) { if (Array.isArray(r)) return r; }
function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
(() => {
  'use strict';

  var rows = new Map(),
    speed = 24,
    reduced = matchMedia('(prefers-reduced-motion: reduce)');
  var raf = 0,
    last = 0,
    refreshTimer = 0,
    wakeTimer = 0;
  var css = document.createElement('style');
  css.textContent = '.slider-kc.zain-carousel{position:relative;touch-action:pan-y}.slider-kc.zain-carousel>.items{left:0!important;width:max-content!important;overflow:visible!important;transition:none!important;flex-wrap:nowrap!important}.slider-kc.zain-carousel>.items>.movie-box{flex-shrink:0;transition:none!important}.slider-kc.zain-carousel>.arrows .right-arrow{display:block!important}.slider-kc.zain-carousel .zain-motion-toggle{position:absolute;bottom:0;left:12px;z-index:101;border:0;border-radius:5px;padding:3px 8px;background:#242332;color:#ddd;font:12px Arial;cursor:pointer}.slider-kc.zain-carousel .zain-motion-toggle:focus-visible{outline:2px solid white}';
  document.head.appendChild(css);
  var mod = (n, d) => (n % d + d) % d;
  function visible(s) {
    var r = s.node.getBoundingClientRect();
    return r.width > 0 && r.height > 0 && r.bottom > 40 && r.top < innerHeight - 40 && r.right > 0 && r.left < innerWidth;
  }
  function moving(s) {
    return s.overflow && s.visible && !document.hidden && !reduced.matches && !s.paused && !s.hover && !s.focus && !s.drag && performance.now() >= s.hold;
  }
  function paint(s) {
    if (!s.overflow) return;
    var right = s.right,
      period = s.period;
    var _iterator = _createForOfIteratorHelper(s.cards),
      _step;
    try {
      for (_iterator.s(); !(_step = _iterator.n()).done;) {
        var card = _step.value;
        var x = card.left + s.phase,
          wrapped = mod(x - (right - period), period) + right - period;
        card.node.style.transform = 'translate3d(' + (wrapped - card.left).toFixed(3) + 'px,0,0)';
      }
    } catch (err) {
      _iterator.e(err);
    } finally {
      _iterator.f();
    }
  }
  function measure(s) {
    var children = Array.from(s.track.children);
    s.cards = children.filter(card => card.classList.contains('movie-box')).map(node => ({
      node
    }));
    s.cards.forEach(card => card.node.style.transform = '');
    var box = s.node.getBoundingClientRect(),
      track = s.track.getBoundingClientRect();
    s.period = track.width;
    s.right = box.width - parseFloat(getComputedStyle(s.node).paddingRight || 0);
    s.overflow = s.cards.length === children.length && s.cards.length > 1 && track.width > box.width + 2;
    s.cards.forEach(card => card.left = card.node.getBoundingClientRect().left - box.left);
    s.toggle.hidden = !s.overflow;
    s.node.dataset.zainMotion = s.overflow ? 'paused' : 'static';
    s.visible = visible(s);
    if (s.overflow) {
      s.phase = mod(s.phase, s.period);
      paint(s);
    }
  }
  function frame(now) {
    raf = 0;
    var delta = last ? Math.min(50, now - last) : 0;
    last = now;
    var running = false;
    var _iterator2 = _createForOfIteratorHelper(rows.values()),
      _step2;
    try {
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        var s = _step2.value;
        var run = moving(s);
        s.node.dataset.zainMotion = run ? 'running' : s.overflow ? 'paused' : 'static';
        if (run) {
          running = true;
          s.phase = mod(s.phase + speed * delta / 1000, s.period);
          paint(s);
        }
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    if (running) raf = requestAnimationFrame(frame);else last = 0;
  }
  function wake() {
    clearTimeout(wakeTimer);
    var next = Infinity;
    var _iterator3 = _createForOfIteratorHelper(rows.values()),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var s = _step3.value;
        if (s.hold > performance.now()) next = Math.min(next, s.hold - performance.now());
      }
    } catch (err) {
      _iterator3.e(err);
    } finally {
      _iterator3.f();
    }
    if (Number.isFinite(next)) wakeTimer = setTimeout(wake, next + 20);
    if (!raf) raf = requestAnimationFrame(frame);
  }
  var observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
    var _iterator4 = _createForOfIteratorHelper(entries),
      _step4;
    try {
      for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
        var entry = _step4.value;
        var s = rows.get(entry.target);
        if (s) s.visible = entry.isIntersecting && visible(s);
      }
    } catch (err) {
      _iterator4.e(err);
    } finally {
      _iterator4.f();
    }
    wake();
  }, {
    threshold: [0, .1, .5, 1]
  }) : null;
  var resize = typeof ResizeObserver === 'function' ? new ResizeObserver(entries => {
    var _iterator5 = _createForOfIteratorHelper(entries),
      _step5;
    try {
      for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
        var entry = _step5.value;
        var s = rows.get(entry.target);
        if (s) measure(s);
      }
    } catch (err) {
      _iterator5.e(err);
    } finally {
      _iterator5.f();
    }
    wake();
  }) : null;
  function attach(node, track) {
    var toggle = document.createElement('button');
    toggle.type = 'button';
    toggle.className = 'zain-motion-toggle';
    toggle.textContent = 'إيقاف الحركة';
    toggle.setAttribute('aria-label', 'إيقاف حركة هذا الصف');
    toggle.setAttribute('aria-pressed', 'false');
    var s = {
      node,
      track,
      toggle,
      cards: [],
      phase: 0,
      hold: 0,
      visible: false,
      hover: false,
      focus: false,
      paused: false,
      drag: null,
      suppressClick: 0
    };
    rows.set(node, s);
    node.classList.add('zain-carousel');
    node.appendChild(toggle);
    toggle.addEventListener('click', event => {
      s.paused = !s.paused;
      toggle.textContent = s.paused ? 'تشغيل الحركة' : 'إيقاف الحركة';
      toggle.setAttribute('aria-label', s.paused ? 'تشغيل حركة هذا الصف' : 'إيقاف حركة هذا الصف');
      toggle.setAttribute('aria-pressed', String(s.paused));
      if (event.detail > 0) toggle.blur();
      wake();
    });
    if (window.PointerEvent) {
      node.addEventListener('pointerenter', event => {
        if (event.pointerType === 'mouse') {
          s.hover = true;
          wake();
        }
      });
      node.addEventListener('pointerleave', event => {
        if (event.pointerType === 'mouse') {
          s.hover = false;
          wake();
        }
      });
    } else {
      node.addEventListener('mouseenter', () => {
        s.hover = true;
        wake();
      });
      node.addEventListener('mouseleave', () => {
        s.hover = false;
        wake();
      });
    }
    node.addEventListener('focusin', () => {
      s.focus = true;
      wake();
    });
    node.addEventListener('focusout', () => {
      setTimeout(() => {
        s.focus = node.contains(document.activeElement);
        wake();
      }, 0);
    });
    node.addEventListener('click', event => {
      var _event$target$closest, _event$target;
      if (performance.now() < s.suppressClick) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      var arrow = (_event$target$closest = (_event$target = event.target).closest) === null || _event$target$closest === void 0 ? void 0 : _event$target$closest.call(_event$target, '.left-arrow,.right-arrow');
      if (!arrow || !s.overflow) return;
      event.preventDefault();
      event.stopImmediatePropagation();
      s.phase = mod(s.phase + (arrow.classList.contains('left-arrow') ? 400 : -400), s.period);
      s.hold = performance.now() + 4000;
      paint(s);
      wake();
    }, true);
    if (window.PointerEvent) {
      node.addEventListener('pointerdown', event => {
        if (event.pointerType === 'mouse' || event.target.closest('button,.arrows')) return;
        s.drag = {
          id: event.pointerId,
          x: event.clientX,
          y: event.clientY,
          start: s.phase,
          moved: false
        };
        wake();
      });
      node.addEventListener('pointermove', event => {
        var drag = s.drag;
        if (!drag || drag.id !== event.pointerId || !s.overflow) return;
        var dx = event.clientX - drag.x,
          dy = event.clientY - drag.y;
        if (!drag.moved && Math.abs(dy) > Math.abs(dx) && Math.abs(dy) > 8) {
          s.drag = null;
          wake();
          return;
        }
        if (!drag.moved && Math.abs(dx) < 8) return;
        drag.moved = true;
        node.setPointerCapture(event.pointerId);
        s.phase = mod(drag.start + dx, s.period);
        paint(s);
      });
      var end = () => {
        var _s$drag;
        if ((_s$drag = s.drag) !== null && _s$drag !== void 0 && _s$drag.moved) {
          s.suppressClick = performance.now() + 400;
          s.hold = performance.now() + 4000;
        }
        s.drag = null;
        wake();
      };
      node.addEventListener('pointerup', end);
      node.addEventListener('pointercancel', end);
    }
    measure(s);
    observer === null || observer === void 0 || observer.observe(node);
    resize === null || resize === void 0 || resize.observe(node);
  }
  function refresh() {
    refreshTimer = 0;
    var _iterator6 = _createForOfIteratorHelper(rows),
      _step6;
    try {
      for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
        var _step6$value = _slicedToArray(_step6.value, 2),
          _node = _step6$value[0],
          _s = _step6$value[1];
        if (!_node.isConnected || !_node.closest('.interface')) {
          observer === null || observer === void 0 || observer.unobserve(_node);
          resize === null || resize === void 0 || resize.unobserve(_node);
          rows.delete(_node);
        }
      }
    } catch (err) {
      _iterator6.e(err);
    } finally {
      _iterator6.f();
    }
    if (!location.pathname.startsWith('/admin')) {
      var _iterator7 = _createForOfIteratorHelper(document.querySelectorAll('.interface section.items .slider-kc')),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var node = _step7.value;
          var track = Array.from(node.children).find(child => child.classList.contains('items'));
          if (!track || !track.children.length || !Array.from(track.children).every(child => child.classList.contains('movie-box'))) continue;
          if (!window.PointerEvent && innerWidth < 500) continue;
          if (!rows.has(node)) attach(node, track);else {
            var s = rows.get(node);
            if (s.track !== track) {
              s.cards.forEach(card => card.node.style.transform = '');
              s.track = track;
            }
            measure(s);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }
    wake();
  }
  function schedule() {
    if (!refreshTimer) refreshTimer = setTimeout(refresh, 80);
  }
  new MutationObserver(records => {
    if (records.some(record => {
      var _record$target$closes, _record$target;
      return record.type === 'childList' && !((_record$target$closes = (_record$target = record.target).closest) !== null && _record$target$closes !== void 0 && _record$target$closes.call(_record$target, '.zain-motion-toggle'));
    })) schedule();
  }).observe(document.body, {
    childList: true,
    subtree: true
  });
  addEventListener('resize', schedule);
  addEventListener('scroll', () => {
    var _iterator8 = _createForOfIteratorHelper(rows.values()),
      _step8;
    try {
      for (_iterator8.s(); !(_step8 = _iterator8.n()).done;) {
        var s = _step8.value;
        s.visible = visible(s);
      }
    } catch (err) {
      _iterator8.e(err);
    } finally {
      _iterator8.f();
    }
    wake();
  }, {
    passive: true
  });
  document.addEventListener('visibilitychange', () => {
    last = 0;
    wake();
  });
  if (reduced.addEventListener) reduced.addEventListener('change', wake);else reduced.addListener(wake);
  refresh();
})();