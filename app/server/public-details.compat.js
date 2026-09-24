function _createForOfIteratorHelper(r, e) { var t = "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"]; if (!t) { if (Array.isArray(r) || (t = _unsupportedIterableToArray(r)) || e && r && "number" == typeof r.length) { t && (r = t); var _n = 0, F = function F() {}; return { s: F, n: function n() { return _n >= r.length ? { done: !0 } : { done: !1, value: r[_n++] }; }, e: function e(r) { throw r; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var o, a = !0, u = !1; return { s: function s() { t = t.call(r); }, n: function n() { var r = t.next(); return a = r.done, r; }, e: function e(r) { u = !0, o = r; }, f: function f() { try { a || null == t.return || t.return(); } finally { if (u) throw o; } } }; }
function _unsupportedIterableToArray(r, a) { if (r) { if ("string" == typeof r) return _arrayLikeToArray(r, a); var t = {}.toString.call(r).slice(8, -1); return "Object" === t && r.constructor && (t = r.constructor.name), "Map" === t || "Set" === t ? Array.from(r) : "Arguments" === t || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(t) ? _arrayLikeToArray(r, a) : void 0; } }
function _arrayLikeToArray(r, a) { (null == a || a > r.length) && (a = r.length); for (var e = 0, n = Array(a); e < a; e++) n[e] = r[e]; return n; }
(() => {
  var style = document.createElement('style');
  style.textContent = `.btn.add-btn{display:none!important}.btns .btn.zain-wide,.explor-btn .btn{width:auto!important;max-width:none!important;min-width:max-content!important;white-space:nowrap!important;display:inline-flex!important;align-items:center;gap:5px;padding:5px 16px!important;border-radius:24px!important;font-size:14px!important;line-height:1.5!important}.cast .castp{display:inline-flex!important;vertical-align:top;margin:8px!important}.cast .castp .name{display:flex!important;align-items:center;justify-content:center;width:82px!important;height:82px!important;box-sizing:border-box;border-radius:50%;border:1px solid #444;background:#202638;color:white;text-align:center;padding:9px;font-size:12px!important;cursor:pointer;white-space:normal!important;overflow-wrap:anywhere}.cast .name:hover,.cast .name:focus{border-color:#f33;background:#343044}.btns .btn.zain-report{width:auto!important;min-width:0!important;height:24px!important;min-height:0!important;max-height:24px!important;box-sizing:border-box!important;align-self:center!important;padding:3px 10px!important;font-size:12px!important;line-height:18px!important;display:inline-flex!important;align-items:center!important}.btns .btn.zain-series-folder{font-size:16px!important;padding:10px 22px!important;min-height:40px!important;box-sizing:border-box}.cast .castp .name{position:relative;overflow:hidden;isolation:isolate;text-shadow:0 1px 3px #000}.zain-actor-photo{position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:-1;filter:brightness(.55)}`;
  document.head.appendChild(style);
  function update() {
    document.querySelectorAll('.btns .btn,.explor-btn .btn').forEach(b => {
      var label = b.textContent.trim();
      if (/اضافة.*قائمة|إضافة.*قائمة/.test(label)) {
        b.style.setProperty('display', 'none', 'important');
        return;
      }
      if (label.includes('تبليغ')) b.classList.add('zain-report');else b.classList.add('zain-wide');
      if (location.pathname.includes('/series/') && label.includes('المجلد')) b.classList.add('zain-series-folder');
      if (label === 'تصفح' || label.startsWith('فتح المجلد')) {
        var _iterator = _createForOfIteratorHelper(b.childNodes),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var n = _step.value;
            if (n.nodeType === 3 && n.textContent.trim() && n.textContent !== ' فتح المجلد وتصفحه') n.textContent = ' فتح المجلد وتصفحه';
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    });
    document.querySelectorAll('.cast .castp .name').forEach(n => {
      if (n.dataset.zainActor) return;
      n.dataset.zainActor = '1';
      n.tabIndex = 0;
      n.setAttribute('role', 'link');
      var name = n.textContent.trim(),
        type = location.pathname.includes('/series/') || location.pathname.includes('/season/') ? 'series' : 'movie';
      n.title = 'عرض ' + (type === 'series' ? 'مسلسلات ' : 'أفلام ') + name;
      var img = document.createElement('img');
      img.src = '/zain/actor-image?name=' + encodeURIComponent(name);
      img.alt = '';
      img.className = 'zain-actor-photo';
      img.addEventListener('error', () => {
        img.style.display = 'none';
      });
      n.prepend(img);
      var open = () => location.assign('/zain/actor?type=' + type + '&name=' + encodeURIComponent(name));
      n.addEventListener('click', open);
      n.addEventListener('keydown', e => {
        if (e.key === 'Enter') {
          e.preventDefault();
          open();
        }
      });
    });
  }
  update();
  new MutationObserver(update).observe(document.body, {
    childList: true,
    subtree: true
  });
})();
(() => {
  'use strict';

  var css = document.createElement('style');
  css.textContent = `.zain-detail-cover>img:not(.zain-detail-poster),.zain-detail-cover>.image-loading{display:none!important}.zain-detail-cover>.zain-detail-poster{display:block!important;visibility:visible!important;width:100%;height:100%;object-fit:cover}`;
  document.head.append(css);
  var scheduled = false;
  function update() {
    scheduled = false;
    var match = /^\/itemView\/[^/]+\/([\w.-]+)/.exec(location.pathname);
    if (!match) return;
    var id = match[1],
      src = '/ItemImage/' + encodeURIComponent(id);
    var _iterator2 = _createForOfIteratorHelper(document.querySelectorAll('.desc-img-cont>.img,.movie-cont-desc-mobile>.img')),
      _step2;
    try {
      var _loop = function _loop() {
        var _image;
        var holder = _step2.value;
        holder.classList.add('zain-detail-cover');
        var image = holder.querySelector('.zain-detail-poster');
        if (((_image = image) === null || _image === void 0 ? void 0 : _image.dataset.itemId) === id) return 1;
        if (image) image.remove();
        image = document.createElement('img');
        image.className = 'zain-detail-poster';
        image.dataset.itemId = id;
        image.alt = 'صورة الفيلم أو المسلسل';
        image.loading = 'eager';
        image.decoding = 'async';
        var failures = 0;
        image.addEventListener('error', () => {
          if (failures >= 2) return;
          var delay = ++failures * 1500;
          setTimeout(() => {
            if (image.isConnected && image.dataset.itemId === id && location.pathname.split('/')[3] === id) image.src = src + '?detailRetry=' + failures;
          }, delay);
        });
        image.src = src;
        holder.append(image);
      };
      for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
        if (_loop()) continue;
      }
    } catch (err) {
      _iterator2.e(err);
    } finally {
      _iterator2.f();
    }
    var _iterator3 = _createForOfIteratorHelper(document.querySelectorAll('.movie-cont-desc>.bg-img')),
      _step3;
    try {
      for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
        var background = _step3.value;
        if (background.dataset.zainCover === id) continue;
        background.dataset.zainCover = id;
        background.style.backgroundImage = 'url("' + src + '")';
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
      requestAnimationFrame(update);
    }
  }
  new MutationObserver(schedule).observe(document.body, {
    childList: true,
    subtree: true
  });
  addEventListener('popstate', schedule);
  schedule();
})();
(() => {
  document.addEventListener('click', event => {
    var _event$target$closest, _event$target;
    if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    var link = (_event$target$closest = (_event$target = event.target).closest) === null || _event$target$closest === void 0 ? void 0 : _event$target$closest.call(_event$target, 'a[href]');
    if (!link) return;
    var url;
    try {
      url = new URL(link.href, location.href);
    } catch (_unused) {
      return;
    }
    if (url.origin !== location.origin) return;
    var match = /^\/itemView\/([^/]+)\/([^/]+)/.exec(url.pathname);
    if (!match || ['movie', 'film', 'season', 'singer', 'tv', 'anime', 'kids', 'deen', 'sports', 'learn', 'ramadan'].includes(match[1]) || /^series(?:\.|$)/.test(match[1])) return;
    event.preventDefault();
    event.stopImmediatePropagation();
    location.assign('/zain/folder/' + match[2]);
  }, true);
})();