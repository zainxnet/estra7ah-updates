(this.webpackJsonpestra7ah5 = this.webpackJsonpestra7ah5 || []).push([
    [12], {
        365: function(e, t, n) {
            "use strict";
// 📝 تعريف دالة أو متغير رئيسي

            var s = n(0),
                c = n(5),
                a = n(1);
            n(366);
            t.a = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(a.useState)(0),
                    n = Object(c.a)(t, 2),
                    i = n[0],
                    r = n[1];
                return e.isFloat ? Object(s.jsx)("div", {
                    className: "float-slider",
                    children: e.children
                }) : Object(s.jsxs)("div", {
                    className: "slider-kc",
                    children: [Object(s.jsx)("div", {
                        className: "items",
                        style: {
                            left: i
                        },
                        children: e.children
                    }), Object(s.jsxs)("div", {
                        className: "arrows",
                        children: [Object(s.jsx)("div", {
                            className: "left-arrow",
                            onClick: function() {
                                r(i + 400)
                            },
                            children: Object(s.jsx)("i", {
                                className: "lni lni-chevron-left"
                            })
                        }), Object(s.jsx)("div", {
                            className: "right-arrow",
                            onClick: function() {
                                r(i - 400)
                            },
                            style: {
                                display: 0 === i ? "none" : "block"
                            },
                            children: Object(s.jsx)("i", {
                                className: "lni lni-chevron-right"
                            })
                        })]
                    })]
                })
            }
        },
        366: function(e, t, n) {},
        373: function(e, t, n) {
            "use strict";
// 📝 تعريف دالة أو متغير رئيسي

            var s = n(0),
                c = n(5),
                a = n(1),
                i = n(2),
                r = n(12),
                o = (n(384), n(48)),
                l = n(380);
            t.a = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = "/player/" + e.item.id,
                    n = Object(a.useState)(!1),
                    d = Object(c.a)(n, 2),
                    u = d[0],
                    p = d[1];
                if (Object(a.useEffect)((function() {
                        try {
                            JSON.parse(localStorage.getItem(e.item.id)).progress > 0 && p(!0)
                        } catch (t) {}
                    }), []), e.item.content && null != e.item.content.contentJSON) try {
                    JSON.parse(e.item.content.contentJSON)
                } catch (b) {}
// 📝 تعريف دالة أو متغير رئيسي

                var j = parseInt(e.item.createdAt) + 259200 > parseInt(+new Date / 1e3);
                return Object(s.jsxs)(r.b, {
                    to: t,
                    className: "eps-box " + (e.selected ? "selected" : ""),
                    item: e.item.id,
                    onClick: function(t) {
                        e.eps ? localStorage.setItem("eps", JSON.stringify(e.eps)) : localStorage.setItem("eps", JSON.stringify([])), e.onClick && e.onClick(t)
                    },
                    children: [Object(s.jsx)("div", {
                        className: "over",
                        children: Object(s.jsx)("div", {
                            className: "inner",
                            children: Object(s.jsx)("div", {
                                children: Object(s.jsx)("i", {
                                    onClick: e.onClickIcon,
                                    className: "lni lni-" + e.centerIcon
                                })
                            })
                        })
                    }), u && Object(s.jsx)(l.a, {
                        itemId: e.item.id,
// 🔑 جزء خاص بمشتركي VIP

                        isVIP: e.item.isVIP
                    }), Object(s.jsx)(o.a, {
                        src: i.a.host + "ItemImage/" + e.item.id,
                        alt: e.item.name,
                        type: "eps"
                    }), j && Object(s.jsx)("div", {
                        className: "new-text",
                        children: "جديد"
                    }), Object(s.jsx)("div", {
                        className: "title",
                        children: e.item.name && e.item.name.length > 30 ? "..." + e.item.name.substr(0, 30) : e.item.name
                    }), Object(s.jsx)("div", {
                        className: "det",
                        children: Object(s.jsx)("div", {
                            className: "bottom-det",
                            children: Object(s.jsxs)("div", {
                                className: "watch",
                                children: [Object(s.jsxs)("span", {
                                    children: [" ", e.item.views || 0, " "]
                                }), Object(s.jsx)("i", {
                                    className: "lni lni-eye"
                                })]
                            })
                        })
                    })]
                }, e.item.id)
            }
        },
        380: function(e, t, n) {
            "use strict";
// 📝 تعريف دالة أو متغير رئيسي

            var s = n(0),
                c = n(5),
                a = n(1);
            n(383);
            t.a = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(a.useState)(!0),
                    n = Object(c.a)(t, 2),
                    i = n[0],
                    r = n[1];
                return i ? Object(s.jsx)("i", {
                    onClick: function(t) {
                        t.preventDefault(), r(!1), localStorage.removeItem(e.itemId)
                    },
// 🔑 جزء خاص بمشتركي VIP

                    className: "watched " + (e.isVIP ? "vip" : "") + " lni lni-checkmark-circle"
                }) : Object(s.jsx)(s.Fragment, {})
            }
        },
        383: function(e, t, n) {},
        384: function(e, t, n) {},
        417: function(e, t, n) {},
        424: function(e, t, n) {
            "use strict";
            n.r(t), n.d(t, "default", (function() {
                return h
            }));
// 📝 تعريف دالة أو متغير رئيسي

            var s = n(0),
                c = n(4),
                a = n.n(c),
                i = n(6),
                r = n(5),
                o = n(1),
                l = n.n(o),
                d = n(2),
                u = (n(417), n(17)),
                p = n(373),
                j = n(365),
                b = n(39);

// 📝 تعريف دالة أو متغير رئيسي

            function h(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = l.a.createRef(),
                    n = Object(o.useState)(null),
                    c = Object(r.a)(n, 2),
                    h = c[0],
                    m = c[1],
                    f = Object(o.useState)({}),
                    O = Object(r.a)(f, 2),
                    g = O[0],
                    x = O[1],
                    v = Object(u.h)(),
                    y = Object(o.useState)(!1),
                    w = Object(r.a)(y, 2),
                    k = (w[0], w[1], Object(o.useState)([])),
                    I = Object(r.a)(k, 2),
                    N = I[0],
                    S = I[1],
                    R = Object(u.g)(),
                    M = Object(o.useRef)(null),
                    D = Object(o.useState)(window.navigator.userAgent.indexOf("Android") > -1 || d.a.isApp ? "android" : "videojs"),
                    C = Object(r.a)(D, 2),
                    U = C[0],
                    P = C[1],
                    J = v.pathname.replace("/player/", "").split("/"),
                    A = Object(o.useState)(J[0]),
                    L = Object(r.a)(A, 2),
                    E = L[0],
                    T = L[1];

// 📝 تعريف دالة أو متغير رئيسي

                function W(e, t, n) {
// 📝 تعريف دالة أو متغير رئيسي

                    var s = new URL(e);
                    return s.search = "", s.toString() + "/play." + t + "?RMUID=" + n
                }

// 📝 تعريف دالة أو متغير رئيسي

                function V(e) {
                    d.a.fetch(d.a.host + "getPlayData/" + e, {
                        method: "GET"
                    }).then((function(e) {
                        return e.json()
                    })).then(function() {
// 📝 تعريف دالة أو متغير رئيسي

                        var e = Object(i.a)(a.a.mark((function e(t) {
                            return a.a.wrap((function(e) {
                                for (;;) switch (e.prev = e.next) {
                                    case 0:
// 🔑 جزء خاص بمشتركي VIP

                                        if (!(t.isVIP && d.a.cardsEnabled && d.a.isPro())) {
                                            e.next = 7;
                                            break
                                        }
                                        return e.next = 3, d.a.checkLogin();
                                    case 3:
                                        if (e.sent) {
                                            e.next = 7;
                                            break
                                        }
                                        return localStorage.setItem("prevURL", window.location.href), e.abrupt("return", window.location.href = "/login");
                                    case 7:
                                        if (!(t.sources.length > 0)) {
                                            e.next = 14;
                                            break
                                        }
                                        if (!t.sources[0].path) {
                                            e.next = 14;
                                            break
                                        }
                                        if (!(t.sources[0].path.indexOf("avi") > -1 || t.sources[0].path.indexOf("rmvb") > -1)) {
                                            e.next = 14;
                                            break
                                        }
                                        if (!window.nw) {
                                            e.next = 14;
                                            break
                                        }
                                        return window.nw.Shell.openItem(t.sources[0].path), window.nw.Shell.openItem(((s = (s = t.sources[0].path).split("/")).splice(s.length - 1, 1), s = s.join("/"))), e.abrupt("return");
                                    case 14:
                                        m(t), x({
                                            plugins: {},
                                            keyboard: {
                                                focused: !0,
                                                global: !0
                                            },
                                            tooltips: {
                                                controls: !0,
                                                seek: !0
                                            },
                                            credentials: !0,
                                            crossorigin: !0,
                                            controls: !0,
                                            responsive: !0,
                                            stop: true,
                                            title: t.title,
                                            poster: (n = t.poster, d.a.getImage(n)),
                                            sources: F(t.sources),
                                            tracks: _(t.tracks)
                                        });
                                    case 16:
                                    case "end":
                                        return e.stop()
                                }
// 📝 تعريف دالة أو متغير رئيسي

                                var n, s
                            }), e)
                        })));
                        return function(t) {
                            return e.apply(this, arguments)
                        }
                    }()).catch((function(e) {}))
                }

// 📝 تعريف دالة أو متغير رئيسي

                function F(e) {
                    for (var t = [], n = 0; n < e.length; n++) - 1 == e[n].src.indexOf("stream") && (e[n].src = d.a.host + "stream/" + e[n].src + "?RMUID=" + d.a.RMUID), e[n].size = e[n].size, e[n].label = e[n].label, t.push(e[n]);
                    return e
                }

// 📝 تعريف دالة أو متغير رئيسي

                function _(e) {
                    for (var t = [], n = 0; n < e.length; n++) - 1 == e[n].src.indexOf("subtitle") && (e[n].src = d.a.host + "subtitle/" + e[n].src + ".vtt?RMUID=" + d.a.RMUID), e[n].srcLang = "ar", e[n].srclang = "ar", e[n].label = "عربي", e[n].kind = "captions", e[n].default = e[n].default, e[n].key = e[n].src, t.push(e[n]);
                    return t
                }
                if (d.a.AudioPlayer && (d.a.AudioPlayer.style.opacity = "0", d.a.AudioPlayer.style.display = "none", d.a.AudioPlayerDOM.pause()), Object(o.useEffect)((function() {
// 📝 تعريف دالة أو متغير رئيسي

                        var e = function(e) {
                            "popstate" === e.type && window.innerWidth < 500 && "false" !== localStorage.getItem("dontaskrating") && d.a.openModal("تقييم التطبيق", Object(s.jsxs)("div", {
                                style: {
                                    padding: 20
                                },
                                children: ["الرجاء تقييم التطبيق ب 5 نجوم .. لكي نستمر بتطويره للافضل 😍", Object(s.jsxs)("div", {
                                    style: {
                                        justifyContent: "center",
                                        alignItems: "center",
                                        gap: 20,
                                        display: "flex",
                                        marginTop: 20
                                    },
                                    children: [Object(s.jsx)("button", {
                                        style: {
                                            borderRadius: "10px",
                                            padding: "10px",
                                            paddingRight: "20px",
                                            paddingLeft: "20px",
                                            background: "#fff",
                                            border: "none",
                                            color: "#000",
                                            cursor: "pointer"
                                        },
                                        onClick: function() {
                                            window.open("https://play.google.com/store/apps/details?id=co.yetech.estra7ahpro", "_blank"), localStorage.setItem("dontaskrating", "false"), d.a.closeModal()
                                        },
                                        children: "تقييم ⭐"
                                    }), Object(s.jsxs)("button", {
                                        style: {
                                            borderRadius: "10px",
                                            padding: "10px",
                                            paddingRight: "20px",
                                            paddingLeft: "20px",
                                            border: "1px solid #fff",
                                            background: "none",
                                            color: "#fff",
                                            cursor: "pointer"
                                        },
                                        onClick: function() {
                                            localStorage.setItem("dontaskrating", "false"), d.a.closeModal()
                                        },
                                        children: ["لاتسالني بداً", " "]
                                    })]
                                })]
                            }))
                        };
                        return window.addEventListener("popstate", e),
// 📝 تعريف دالة أو متغير رئيسي

                            function() {
                                window.removeEventListener("popstate", e)
                            }
                    }), []), Object(o.useEffect)((function() {
// 📝 تعريف دالة أو متغير رئيسي

                        var e = v.pathname.replace("/player/", "").split("/");
                        T(e[0]), x({});
                        try {
                            V(e[0])
                        } catch (t) {}
                    }), [v.pathname]), Object(o.useEffect)((function() {
                        try {
// 📝 تعريف دالة أو متغير رئيسي

                            var e = JSON.parse(localStorage.getItem("eps"));
                            e && N && e.length > 0 && N.length > 0 ? e[0].name !== N[0].name && S(e) : S(e)
                        } catch (t) {}
                    }), []), Object(o.useEffect)(Object(i.a)(a.a.mark((function e() {
                        return a.a.wrap((function(e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    try {
                                        V(E)
                                    } catch (t) {}
                                case 1:
                                case "end":
                                    return e.stop()
                            }
                        }), e)
                    }))), [e]), !h) return Object(s.jsx)("div", {});
// 📝 تعريف دالة أو متغير رئيسي

                var z = null;
                z = Object(s.jsx)("a", {
                    href: d.a.host + "downloadItem/" + E + "/video?RMUID=" + d.a.RMUID,
                    download: !0,
                    onClick: function(e) {
                        if (d.a.isApp) return e.preventDefault(), void window.ReactNativeWebView.postMessage(JSON.stringify({
                            type: "download",
                            url: d.a.host + "downloadItem/" + E + "/video?RMUID=" + d.a.RMUID
                        }))
                    },
                    children: Object(s.jsxs)("div", {
                        className: "ep-downloadBtn",
                        children: [Object(s.jsx)("i", {
                            className: "lni lni-download"
                        }), " تنزيل"]
                    })
                });
// 📝 تعريف دالة أو متغير رئيسي

                var B;
                return h && 0 === h.sources.length ? Object(s.jsx)("div", {
                    className: "player-cont-center",
                    children: "هذا الفيديو لايحتوي اي ملفات فيديو لتشغيلها"
                }) : "android" === U ? Object(s.jsxs)("div", {
                    className: "player-players",
                    children: [Object(s.jsx)("div", {
                        children: " الرجاء اختيار المشغل المفضل لديك"
                    }), Object(s.jsxs)("div", {
                        style: {
                            padding: 10,
                            opacity: .6,
                            fontWeight: "bold"
                        },
                        children: ["سرعة المشاهدة والتنزيل يتم تحديدها من قبل مسؤول الشبكه", " "]
                    }), Object(s.jsxs)("div", {
                        style: {
                            display: "flex",
                            flexDirection: "column",
                            gap: 20,
                            marginTop: 20
                        },
                        children: [Object(s.jsxs)("button", {
                            className: "btn",
                            onClick: function(e) {
                                d.a.isApp ? (e.preventDefault(), window.ReactNativeWebView.postMessage(JSON.stringify({
                                    type: "download",
                                    url: d.a.host + "downloadItem/" + E + "/video?RMUID=" + d.a.RMUID
                                }))) : window.open(d.a.host + "downloadItem/" + E + "/video?RMUID=" + d.a.RMUID), window.history.back()
                            },
                            children: [Object(s.jsx)("i", {
                                class: "lni lni-download"
                            }), Object(s.jsx)("span", {
                                children: "تنزيل ملف الفيديو"
                            })]
                        }), Object(s.jsxs)("button", {
                            className: "btn",
                            onClick: function() {
                                P("default")
                            },
                            children: [Object(s.jsx)("i", {
                                class: "lni lni-play"
                            }), Object(s.jsx)("span", {
                                children: " الفتح في مشغل الافتراضي"
                            })]
                        }), Object(s.jsxs)("button", {
                            className: "btn",
                            onClick: function() {
                                return localStorage.setItem(E, JSON.stringify({
                                    progress: 1,
                                    itemId: E
                                })), window.open("vlc://".concat(h.sources[0].src, "?subtitles=").concat(encodeURIComponent(g.tracks && g.tracks.length > 0 ? g.tracks[0].src : ""), "#Intent;scheme=http;package=org.videolan.vlc;end")), window.history.back(), x({})
                            },
                            children: [Object(s.jsx)("img", {
                                style: {
                                    width: 30
                                },
                                src: "/assets/imgs/Icons8_flat_vlc.svg.png"
                            }), Object(s.jsx)("span", {
                                children: "الفتح في مشغل VLC"
                            })]
                        }), Object(s.jsxs)("button", {
                            className: "btn",
                            onClick: function() {
                                return localStorage.setItem(E, JSON.stringify({
                                    progress: 1,
                                    itemId: E
                                })), window.open("intent:".concat(W(h.sources[0].src, "mp4", d.a.RMUID), "#Intent;package=com.mxtech.videoplayer.ad;end")), window.history.back(), x({})
                            },
                            children: [Object(s.jsx)("img", {
                                style: {
                                    width: 30
                                },
                                src: "/assets/imgs/mx-player.png"
                            }), Object(s.jsx)("span", {
                                children: "الفتح في مشغل MX Player"
                            })]
                        }), Object(s.jsxs)("button", {
                            className: "btn",
                            onClick: function() {
                                return localStorage.setItem(E, JSON.stringify({
                                    progress: 1,
                                    itemId: E
                                })), window.open("intent:".concat(W(h.sources[0].src, "mp4", d.a.RMUID), "#Intent;package=com.kmplayer;end")), window.history.back(), x({})
                            },
                            children: [Object(s.jsx)("img", {
                                style: {
                                    width: 30
                                },
                                src: "/assets/imgs/kmplayer.png"
                            }), Object(s.jsx)("span", {
                                children: "الفتح في مشغل KMPlayer"
                            })]
                        })]
                    })]
                }) : h && "video/mp4" !== h.sources[0].type && "video/x-matroska" !== h.sources[0].type ? Object(s.jsx)("div", {
                    children: Object(s.jsxs)("div", {
                        className: "player-cont-center",
                        children: [Object(s.jsxs)("div", {
                            children: ["هذا الفيديو غير قابل للتشغيل على المتصفح : ", h.sources[0].type]
                        }), z && Object(s.jsx)("div", {
                            style: {
                                width: "fit-content",
                                margin: "auto",
                                background: "red",
                                padding: "10px",
                                borderRadius: "10px",
                                marginTop: "12px"
                            },
                            children: z
                        })]
                    })
                }) : Object(s.jsxs)("div", {
                    className: "player-cont",
                    children: [g && g.sources && Object(s.jsxs)(s.Fragment, {
                        children: [Object(s.jsxs)("div", {
                            className: "player-header",
                            ref: t,
                            children: [Object(s.jsx)("div", {
                                className: "title",
                                children: (B = h.title, B ? B.length > 35 ? "..." + B.substr(0, 35) : B : "لايوجد اسم")
                            }), z, Object(s.jsxs)("div", {
                                className: "back-btn",
                                onClick: function() {
                                    R.goBack(), setTimeout((function() {
                                        d.a.audios && 0 != d.a.audios.length && (d.a.AudioPlayer.style.opacity = "1", d.a.AudioPlayer.style.display = "block", d.a.AudioPlayerDOM.play())
                                    }), 300)
                                },
                                children: [Object(s.jsx)("div", {
                                    className: "txt",
                                    children: "رجوع"
                                }), Object(s.jsx)("div", {
                                    className: "ic",
                                    children: Object(s.jsx)("i", {
                                        className: "lni lni-chevron-left"
                                    })
                                })]
                            })]
                        }), Object(s.jsxs)("video", {
                            ref: M,
                            style: {
                                height: N && 0 === N.length ? "100vh" : window.innerWidth > 500 ? "70vh" : "40vh"
                            },
                            crossOrigin: "use-credentials",
                            playsInline: !0,
                            autoPlay: !0,
                            width: "100%",
                            controls: !0,
                            poster: g.poster,
                            controlsList: "nodownload",
                            onContextMenu: function(e) {
                                return e.preventDefault()
                            },
                            onPlay: function() {
                                t.current.style.top = "-100px"
                            },
                            onPause: function() {
                                t.current.style.top = "0px"
                            },
                            onTimeUpdate: function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                                var t = M.current,
                                    n = t.currentTime / t.duration * 100;
                                localStorage.setItem(E, JSON.stringify({
                                    progress: n,
                                    itemId: E
                                }))
                            },
                            children: [g.sources.map((function(e) {
                                return Object(s.jsx)("source", {
                                    src: e.src,
                                    type: "video/mp4"
                                })
                            })), g.tracks.map((function(e) {
                                return Object(s.jsx)("track", {
                                    label: e.label,
                                    kind: "subtitles",
                                    srcLang: e.srclang,
                                    src: e.src,
                                    default: !0
                                })
                            })), "متصفحك لايدعم مشغل الفيديو"]
                        })]
                    }), !(g && g.sources) && Object(s.jsx)("div", {
                        style: {
                            height: N && 0 === N.length ? "100vh" : window.innerWidth > 500 ? "70vh" : "40vh",
                            display: "flex",
                            justifyContent: "center",
                            alignItems: "center",
                            paddingTop: 10
                        },
                        children: Object(s.jsx)(b.a, {
                            style: {
                                width: 200,
                                marginTop: -10
                            }
                        })
                    }), N && N.length > 0 && Object(s.jsxs)("div", {
                        style: {
                            height: window.innerWidth > 500 ? "30vh" : "60vh",
                            margin: "auto",
                            marginTop: -13,
                            overflowY: "scroll"
                        },
                        children: [window.innerWidth > 500 && Object(s.jsx)(j.a, {
                            rtl: !0,
                            noEffects: !1,
                            children: N.map((function(e) {
                                return Object(s.jsx)(p.a, {
                                    selected: e.id === E,
                                    item: e,
                                    centerIcon: "play"
                                }, e.id)
                            }))
                        }), window.innerWidth < 500 && Object(s.jsx)("div", {
                            children: N.map((function(e) {
                                return Object(s.jsx)(p.a, {
                                    selected: e.id === E,
                                    item: e,
                                    centerIcon: "play"
                                }, e.id)
                            }))
                        })]
                    })]
                })
            }
        }
    }
]);