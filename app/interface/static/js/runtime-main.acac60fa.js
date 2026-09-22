/* license-gate: runs before app */
(function () {
  var BLOCK = [
    /\/uuser\/isc\b/i,
    /\/uuser\/gk\b/i,
    /\/getCard\b/i,
    /\/admin\/getSubKey\b/i,
  ];

  function mock(url) {
    if (/getCard/i.test(url)) return { active: false, ok: true, disabled: true };
    if (/gk/i.test(url)) return { keys: [], ok: true };
    if (/getSubKey/i.test(url)) return { timeup: null, ok: true, disabled: true };
    return { check: true };
  }

  // fetch()
  var _fetch = window.fetch && window.fetch.bind(window);
  if (_fetch) {
    window.fetch = function (input, init) {
      var url = typeof input === "string" ? input : input && input.url;
      if (url && BLOCK.some(function (rx) { return rx.test(url); })) {
        var body = JSON.stringify(mock(url));
        return Promise.resolve(new Response(body, {
          status: 200,
          headers: { "Content-Type": "application/json" }
        }));
      }
      return _fetch(input, init);
    };
  }

  // XMLHttpRequest
  if (window.XMLHttpRequest) {
    var X = window.XMLHttpRequest;
    var oOpen = X.prototype.open;
    var oSend = X.prototype.send;
    X.prototype.open = function (m, url) {
      this.__blk = url && BLOCK.some(function (rx) { return rx.test(url); });
      this.__blkUrl = url;
      return oOpen.apply(this, arguments);
    };
    X.prototype.send = function () {
      if (this.__blk) {
        var self = this;
        setTimeout(function () {
          self.readyState = 4;
          self.status = 200;
          self.responseText = JSON.stringify(mock(self.__blkUrl));
          if (self.onreadystatechange) self.onreadystatechange();
          if (self.onload) self.onload();
        }, 0);
        return;
      }
      return oSend.apply(this, arguments);
    };
  }

  // sendBeacon (optional)
  if (navigator && navigator.sendBeacon) {
    var _sb = navigator.sendBeacon.bind(navigator);
    navigator.sendBeacon = function (url, data) {
      if (url && BLOCK.some(function (rx) { return rx.test(url); })) return true;
      return _sb(url, data);
    };
  }

  // flag for debugging
  window.__ESTRA7AH_LICENSE_CHECK_DISABLED__ = true;
})();\n! function(e) {
// 📝 دالة المسؤولة عن معالجة الـ chunks (الأجزاء) وتحميلها

    function t(t) {
        for (var n, a, u = t[0], i = t[1], f = t[2], l = 0, d = []; l < u.length; l++) a = u[l], Object.prototype.hasOwnProperty.call(o, a) && o[a] && d.push(o[a][0]), o[a] = 0;
        for (n in i) Object.prototype.hasOwnProperty.call(i, n) && (e[n] = i[n]);
        for (s && s(t); d.length;) d.shift()();
        return c.push.apply(c, f || []), r()
    }

// 📝 دالة لفحص حالة تحميل الأجزاء وتنفيذها عند اكتمالها

    function r() {
        for (var e, t = 0; t < c.length; t++) {
            for (var r = c[t], n = !0, a = 1; a < r.length; a++) {
                var i = r[a];
                0 !== o[i] && (n = !1)
            }
            n && (c.splice(t--, 1), e = u(u.s = r[0]))
        }
        return e
    }
    var n = {},
        a = {
            4: 0
        },
        o = {
            4: 0
        },
        c = [];

    function u(t) {
        if (n[t]) return n[t].exports;
        var r = n[t] = {
            i: t,
            l: !1,
            exports: {}
        };
        return e[t].call(r.exports, r, r.exports, u), r.l = !0, r.exports
    }
// 📝 الدالة الخاصة بتحميل ملفات CSS و JS الإضافية (chunks)

    u.e = function(e) {
        var t = [];
        a[e] ? t.push(a[e]) : 0 !== a[e] && {
            0: 1,
            1: 1,
            2: 1,
            6: 1,
            7: 1,
            8: 1,
            9: 1,
            10: 1,
            11: 1,
            12: 1,
            13: 1,
            14: 1,
            15: 1,
            16: 1,
            17: 1
        } [e] && t.push(a[e] = new Promise((function(t, r) {
            for (var n = "static/css/" + ({} [e] || e) + "." + {
                    0: "44633078",
                    1: "503c0d22",
                    2: "89a5dc3c",
                    6: "ae9a6588",
                    7: "7eaa7938",
                    8: "1229693c",
                    9: "81b599c7",
                    10: "25a9f922",
                    11: "bf2b9ea5",
                    12: "62f90cd8",
                    13: "d4ead9e6",
                    14: "de43a2ac",
                    15: "ffd56efb",
                    16: "8d647e51",
                    17: "143efd4b"
                } [e] + ".chunk.css", o = u.p + n, c = document.getElementsByTagName("link"), i = 0; i < c.length; i++) {
                var f = (s = c[i]).getAttribute("data-href") || s.getAttribute("href");
                if ("stylesheet" === s.rel && (f === n || f === o)) return t()
            }
            var l = document.getElementsByTagName("style");
            for (i = 0; i < l.length; i++) {
                var s;
                if ((f = (s = l[i]).getAttribute("data-href")) === n || f === o) return t()
            }
            var d = document.createElement("link");
            d.rel = "stylesheet", d.type = "text/css", d.onload = t, d.onerror = function(t) {
                var n = t && t.target && t.target.src || o,
                    c = new Error("Loading CSS chunk " + e + " failed.\n(" + n + ")");
// ⚠️ معالجة خطأ عند فشل تحميل ملف CSS

                c.code = "CSS_CHUNK_LOAD_FAILED", c.request = n, delete a[e], d.parentNode.removeChild(d), r(c)
            }, d.href = o, document.getElementsByTagName("head")[0].appendChild(d)
        })).then((function() {
            a[e] = 0
        })));
        var r = o[e];
        if (0 !== r)
            if (r) t.push(r[2]);
            else {
                var n = new Promise((function(t, n) {
                    r = o[e] = [t, n]
                }));
                t.push(r[2] = n);
                var c, i = document.createElement("script");
                i.charset = "utf-8", i.timeout = 120, u.nc && i.setAttribute("nonce", u.nc), i.src = function(e) {
                    return u.p + "static/js/" + ({} [e] || e) + "." + {
                        0: "537afed0",
                        1: "811645d4",
                        2: "fbfdeb6b",
                        6: "a52ee216",
                        7: "ce7d3261",
                        8: "3c15ebdc",
                        9: "1fc8d482",
                        10: "72634ab2",
                        11: "f5a0c79c",
                        12: "04ea1ede",
                        13: "c81a1891",
                        14: "7c78f905",
                        15: "64d2a075",
                        16: "ccc25959",
                        17: "072a8ce5"
                    } [e] + ".chunk.js"
                }(e);
                var f = new Error;
                c = function(t) {
                    i.onerror = i.onload = null, clearTimeout(l);
                    var r = o[e];
                    if (0 !== r) {
                        if (r) {
                            var n = t && ("load" === t.type ? "missing" : t.type),
                                a = t && t.target && t.target.src;
// ⚠️ معالجة خطأ عند فشل تحميل ملف JS

                            f.message = "Loading chunk " + e + " failed.\n(" + n + ": " + a + ")", f.name = "ChunkLoadError", f.type = n, f.request = a, r[1](f)
                        }
                        o[e] = void 0
                    }
                };
                var l = setTimeout((function() {
                    c({
                        type: "timeout",
                        target: i
                    })
                }), 12e4);
                i.onerror = i.onload = c, document.head.appendChild(i)
            } return Promise.all(t)
// 📌 قائمة جميع الوحدات (modules)

// 📌 الكاش الخاص بالوحدات المحملة

    }, u.m = e, u.c = n, u.d = function(e, t, r) {
        u.o(e, t) || Object.defineProperty(e, t, {
            enumerable: !0,
            get: r
        })
// 📌 تمييز الموديول كـ ES Module

    }, u.r = function(e) {
        "undefined" !== typeof Symbol && Symbol.toStringTag && Object.defineProperty(e, Symbol.toStringTag, {
            value: "Module"
        }), Object.defineProperty(e, "__esModule", {
            value: !0
        })
    }, u.t = function(e, t) {
        if (1 & t && (e = u(e)), 8 & t) return e;
        if (4 & t && "object" === typeof e && e && e.__esModule) return e;
        var r = Object.create(null);
        if (u.r(r), Object.defineProperty(r, "default", {
                enumerable: !0,
                value: e
            }), 2 & t && "string" != typeof e)
            for (var n in e) u.d(r, n, function(t) {
                return e[t]
            }.bind(null, n));
        return r
    }, u.n = function(e) {
        var t = e && e.__esModule ? function() {
            return e.default
        } : function() {
            return e
        };
        return u.d(t, "a", t), t
    }, u.o = function(e, t) {
        return Object.prototype.hasOwnProperty.call(e, t)
// 📌 تحديد المسار الأساسي لتحميل الملفات (public path)

    }, u.p = "/", u.oe = function(e) {
        throw console.error(e), e
    };
    var i = this.webpackJsonpestra7ah5 = this.webpackJsonpestra7ah5 || [],
        f = i.push.bind(i);
    i.push = t, i = i.slice();
    for (var l = 0; l < i.length; l++) t(i[l]);
    var s = f;
    r()
}([]);;(function(){try{
  if (window.__SYNC_SUB_V3__) return; window.__SYNC_SUB_V3__=1;

  function onLoad(cb){ if(document.readyState==='complete'){ setTimeout(cb,0); } else { window.addEventListener('load', cb, {once:true}); }}

  function apiBase(){ try{
    var g=(window.__API_BASE__||window.API_BASE||window.ESTRA7AH_API_BASE||'').trim();
    return g? g.replace(/\/+$/,'') : '';
  }catch(_){ return ''; }}

  function buildUrl(path){ var B=apiBase(); if(/^https?:\/\//i.test(path)) return path; if(B){ if(path[0]!=='/') path='/'+path; return B+path;} return path; }
  function headers(){ var h={}; try{ var id=localStorage.getItem('RMUID')||''; if(id) h['X-estra7ah-user-id']=id; }catch(_){ } return h; }

  async function getChildren(pid){
    var r=await fetch(buildUrl('/sections/'+encodeURIComponent(pid)+'/999/all'),{headers:headers()});
    var j=null; try{ j=await r.json(); }catch(_){ j=[]; }
    var arr = (j && j.items && Array.isArray(j.items)) ? j.items : (Array.isArray(j)? j : []);
    var out=[]; for(var i=0;i<arr.length;i++){ var s=arr[i]; if(String(s && s.parentId)===String(pid)) out.push(s); }
    return out;
  }

  function syncOne(id){ return fetch(buildUrl('/admin/SyncSection/'+encodeURIComponent(id)),{headers:headers()}); }
  function syncMany(ids, limit){
    limit=Math.max(1,Math.min(5,limit||3));
    return new Promise(function(resolve){
      var i=0,running=0,ok=0,fail=0;
      function next(){
        if(i>=ids.length && running===0) return resolve({ok:ok,fail:fail,total:ids.length});
        while(running<limit && i<ids.length){
          (function(id){
            i++; running++;
            syncOne(id).then(function(r){ if(r && r.ok) ok++; else fail++; }).catch(function(){ fail++; }).finally(function(){ running--; next(); });
          })(ids[i]);
        }
      }
      next();
    });
  }

  function findAll(root, selector){
    var out = Array.prototype.slice.call(root.querySelectorAll(selector));
    // traverse open shadow roots
    var nodes = root.querySelectorAll('*');
    for (var i=0;i<nodes.length;i++){
      var n = nodes[i];
      if (n.shadowRoot) {
        try { out = out.concat(findAll(n.shadowRoot, selector)); } catch(_){}
      }
    }
    return out;
  }

  function closestAny(el, selectors){
    while (el){
      for (var i=0;i<selectors.length;i++){
        if (el.matches && el.matches(selectors[i])) return el;
      }
      el = el.parentNode;
    }
    return null;
  }

  function extractParentIdFrom(el){
    // 1) from href
    var a = el.closest('a[href*="/admin/sections/"]') || el.querySelector && el.querySelector('a[href*="/admin/sections/"]');
    if (a){
      var m = (a.getAttribute('href')||'').match(/\/admin\/sections\/(\d+)/);
      if (m) return m[1];
    }
    // 2) from text like #123
    var text = (el.textContent||''); var m2 = text.match(/#\s*(\d{1,10})/); if (m2) return m2[1];
    // 3) data attributes
    var ds = el.dataset||{}; return ds.sectionId || ds.id || null;
  }

  function addButton(row){
    if (!row || row.__syncSubBtnV3__) return;
    var pid = extractParentIdFrom(row);
    if (!pid) return;
    row.__syncSubBtnV3__ = 1;

    var btn=document.createElement('button');
    btn.type='button'; btn.textContent='مزامنة الفرعية'; btn.className='btn btn-outline-primary';
    btn.style.marginInlineStart='8px';

    var status=document.createElement('small'); status.style.marginInlineStart='6px'; status.style.fontSize='12px';

    btn.addEventListener('click', function(){
      btn.disabled=true; status.textContent='...يجلب الأقسام الفرعية';
      getChildren(pid).then(function(kids){
        if(!kids || !kids.length){ status.textContent='لا توجد أقسام فرعية'; btn.disabled=false; return; }
        status.textContent='يُزامِن '+kids.length+' قسمًا';
        var ids=kids.map(function(k){ return k.id; });
        return syncMany(ids,3).then(function(res){ status.textContent='تم: '+res.ok+' / '+res.fail; });
      }).catch(function(){ status.textContent='فشل'; }).finally(function(){ btn.disabled=false; });
    });

    // Place next to existing buttons group if any, else at end of row
    var host = row.querySelector('.btn-group, .actions, .controls, .buttons') || row;
    host.appendChild(btn); host.appendChild(status);
  }

  function isMainSectionsPage(){
    var p = location.pathname || '';
    return /\/admin\/sections(?:\/?$)/i.test(p);
  }

  function scan(){
    if (!isMainSectionsPage()) return;
    // Identify rows by the presence of three admin buttons or link to /admin/sections/{id}
    var rows = findAll(document, '.row, tr, .list-item, .card, li, .section-row, .item, div');
    for (var i=0;i<rows.length;i++){
      var r = rows[i];
      // must contain a link to /admin/sections/{id}
      var link = r.querySelector('a[href*="/admin/sections/"]');
      if (!link) continue;
      // must contain at least two buttons to avoid false positives
      var btnCount = r.querySelectorAll('button, a.btn').length;
      if (btnCount < 2) continue;
      addButton(r);
    }
  }

  function start(){
    if (!/\/admin\/sections/i.test(location.pathname||'')) return;
    scan();
    var obs = new MutationObserver(function(){ scan(); });
    obs.observe(document.documentElement, {childList:true, subtree:true});
  }

  onLoad(start);
}catch(e){ /* silent */ }})();