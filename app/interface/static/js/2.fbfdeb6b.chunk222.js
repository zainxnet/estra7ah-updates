(this.webpackJsonpestra7ah5 = this.webpackJsonpestra7ah5 || []).push([
    [2], {
        362: function(e, t, c) {
            "use strict";
            var s = c(0),
                n = c(13),
                i = c(1),
                a = (c(367), c(365)),
                r = c(12),
                l = c(2),
                o = c(374),
                d = (c(368), c(369), c(48));
            // مكوّن (j): يعرض عناصر 'متابعة المشاهدة' (continue-watch)
// يحتوي على:
// - دالة c لتحويل الوقت من ثواني إلى صيغة hh:mm:ss
// - واجهة تعرض الصورة والعنوان وخط زمني للتقدم
var j = function(e) {
                Object(i.useEffect)((function() {}), []);
                var t = "/itemView/" + e.item.item.type + "/" + e.item.item.id;
                if (e.item.item.content && null != e.item.item.content.contentJSON) try {
                    JSON.parse(e.item.item.content.contentJSON)
                } catch (a) {}

                function c(e) {
                    var t = parseInt(e / 3600);
                    t < 10 && (t = "0" + t);
                    var c = parseInt(e % 3600 / 60);
                    c < 10 && (c = "0" + c);
                    var s = Math.ceil(e % 60);
                    return s < 10 && (s = "0" + s), t + ":" + c + ":" + s
                }

                function n() {
                    return Object(s.jsxs)(s.Fragment, {
                        children: [Object(s.jsx)("div", {
                            className: "over",
                            title: e.item.item.name,
                            children: Object(s.jsx)("div", {
                                className: "inner",
                                children: Object(s.jsx)("div", {
                                    children: Object(s.jsx)("i", {
                                        onClick: e.onClickIcon,
                                        className: "lni lni-trash"
                                    })
                                })
                            })
                        }), Object(s.jsx)(d.a, {
                            src: l.a.host + "ItemImage/" + e.item.item.id,
                            alt: e.item.item.name,
                            type: "movie"
                        }), Object(s.jsx)("div", {
                            className: "title",
                            children: e.item.item.name && e.item.item.name.length > 20 ? "..." + e.item.item.name.substr(0, 20) : e.item.item.name
                        }), Object(s.jsx)("div", {
                            className: "det",
                            children: Object(s.jsx)("div", {
                                className: "time-line",
                                style: {
                                    width: e.item.time / e.item.duration * 100 + "%"
                                },
                                children: Object(s.jsx)("span", {
                                    children: c(e.item.time)
                                })
                            })
                        })]
                    })
                }
                return "episod" == e.item.item.type || "vidsSameFolder" == e.item.item.type ? Object(s.jsx)("a", {
                    href: "/player/" + e.item.item.id,
                    className: "movie-box-continue",
                    item: e.item.item.id,
                    children: n()
                }, e.item.item.id) : Object(s.jsx)(r.b, {
                    to: t,
                    className: "movie-box-continue",
                    item: e.item.item.id,
                    children: n()
                }, e.item.item.id)
            };
            c(370);
            // مكوّن (m): يعرض أقسام (sections)
// - يحدد إذا القسم جديد (خلال 3 أيام)
// - يظهر نص 'جديد' أو 'VIP' حسب حالة القسم
var m = function(e) {
                    if (Object(i.useEffect)((function() {}), []), e.skeleton) return Object(s.jsx)("div", {
                        children: "test"
                    });
                    if (!e.section) return Object(s.jsx)("div", {});
                    var t = parseInt(e.section.createdAt) + 259200 > parseInt(+new Date / 1e3);
                    return Object(s.jsxs)(r.b, {
                        to: "/sections/" + ("linked" == e.section.type ? e.section.linkedId : e.section.id),
                        className: "section-box " + (e.isFloat && "float"),
                        onClick: e.onClick,
                        children: [Object(s.jsx)("div", {
                            className: "over",
                            title: e.section.name,
                            children: Object(s.jsx)("div", {
                                children: Object(s.jsx)("i", {
                                    onClick: e.onClickIcon,
                                    className: "lni lni-" + e.centerIcon
                                })
                            })
                        }), Object(s.jsx)(d.a, {
                            src: l.a.host + "sectionImage/" + e.section.id,
                            alt: e.section.name,
                            type: "section"
                        }), t && Object(s.jsx)("div", {
                            className: "new-text",
                            children: "جديد"
                        }), "yes" === e.section.isVIP && Object(s.jsx)("div", {
                            title: "فقط لمشتركين VIP",
                            className: "vip-text",
                            children: "VIP"
                        }), Object(s.jsx)("div", {
                            className: "title",
                            children: e.section.name && e.section.name.length > 30 ? "..." + e.section.name.substr(0, 30) : e.section.name
                        })]
                    }, e.section.id)
                },
                b = c(373),
                h = c(375),
                O = c(376),
                u = c(377),
                x = c(378),
                v = c(379);
            c(371);
            var f = function(e) {
                return Object(s.jsx)("div", {
                    className: "skeleton skeleton-animation"
                })
            };
            // مكوّن (t.a): مكوّن رئيسي لعرض العناصر أو الأقسام
// - يدعم عدة أنواع: movie, eps, favs, continue-watch
// - يستخدم سلايدر (a.a) لعرض العناصر
// - يختار المكوّن المناسب حسب نوع العنصر
t.a = function(e) {
                return Object(s.jsxs)("section", {
                    style: Object(n.a)({}, e.style),
                    className: "items",
                    children: [Object(s.jsx)(h.a, {
                        icon: e.data.icon || e.icon,
                        title: e.data.title || "لايوجد عنوان",
                        number: e.sections && e.sections.length || e.items && e.items.length
                    }), Object(s.jsxs)("div", {
                        children: [(!e.items && !e.sections || "skeleton" === e.type) && Object(s.jsx)("div", {
                            className: "cont-all",
                            children: Object(s.jsx)(a.a, {
                                rtl: !0,
                                noEffects: !1,
                                size: e.size,
                                autoMove: e.autoMove,
                                children: window.innerWidth < 500 ? [1, 2].map((function(e) {
                                    return Object(s.jsx)(f, {})
                                })) : [1, 2, 3, 4, 6, 7, 8, 9, 10].map((function(e) {
                                    return Object(s.jsx)(f, {})
                                }))
                            })
                        }), e.sections && Object(s.jsx)("div", {
                            className: "cont-all",
                            children: Object(s.jsx)(a.a, {
                                rtl: !0,
                                noEffects: !1,
                                size: e.size,
                                isFloat: !0,
                                autoMove: e.autoMove,
                                children: e.sections && e.sections.map((function(t) {
                                    return Object(s.jsx)(m, {
                                        centerIcon: e.centerIcon,
                                        section: t,
                                        isFloat: !0,
                                        onClick: e.onItemClick
                                    })
                                }))
                            })
                        }), e.items && ("movie" == e.type || "movies" == e.type || -1 !== e.type.search("serieses") || -1 !== e.type.search("series") || "seasons" == e.type) && Object(s.jsx)("div", {
                            className: "cont-all",
                            children: Object(s.jsx)(a.a, {
                                rtl: !0,
                                noEffects: !1,
                                size: e.size,
                                autoMove: e.autoMove,
                                children: e.items && e.items.map((function(t) {
                                    return t ? Object(s.jsx)(o.a, {
                                        selected: e.selectedItemId === t.id,
                                        onClick: e.onItemClick,
                                        item: t,
                                        centerIcon: e.centerIcon,
                                        appendLink: e.appendLink
                                    }, t.id) : Object(s.jsxs)(r.b, {
                                        className: "box",
                                        children: [Object(s.jsx)("div", {
                                            className: "name",
                                            children: "error"
                                        }), Object(s.jsx)("img", {
                                            loading: "lazy",
                                            src: l.a.host + e.image + "error"
                                        })]
                                    }, t.id)
                                }))
                            })
                        }), e.items && "eps" == e.type && Object(s.jsx)("div", {
                            className: "cont-all ",
                            children: e.items && e.items.map((function(t) {
                                return t ? Object(s.jsx)(b.a, {
                                    selected: e.selectedItemId === t.id,
                                    onClick: e.onItemClick,
                                    item: t,
                                    centerIcon: e.centerIcon,
                                    eps: e.items
                                }) : Object(s.jsxs)(r.b, {
                                    className: "box",
                                    children: [Object(s.jsx)("div", {
                                        className: "name",
                                        children: "error"
                                    }), Object(s.jsx)("img", {
                                        loading: "lazy",
                                        src: l.a.host + e.image + "error"
                                    })]
                                }, t.id)
                            }))
                        }), e.items && "continue-watch" == e.type && Object(s.jsx)("div", {
                            className: "cont-all",
                            children: Object(s.jsx)(a.a, {
                                rtl: !0,
                                noEffects: !1,
                                size: e.size,
                                autoMove: e.autoMove,
                                children: e.items && e.items.map((function(t) {
                                    return t ? Object(s.jsx)(j, {
                                        item: t,
                                        onClickIcon: function(e) {
                                            l.a.delWatch(t.item.id), e.preventDefault()
                                        }
                                    }) : Object(s.jsxs)(r.b, {
                                        className: "box",
                                        children: [Object(s.jsx)("div", {
                                            className: "name",
                                            children: "error"
                                        }), Object(s.jsx)("img", {
                                            loading: "lazy",
                                            src: l.a.host + e.image + "error"
                                        })]
                                    }, t.id)
                                }))
                            })
                        }), e.items && "favs" == e.type && Object(s.jsx)("div", {
                            className: "cont-all",
                            children: Object(s.jsx)(a.a, {
                                rtl: !0,
                                noEffects: !1,
                                size: e.size,
                                autoMove: e.autoMove,
                                children: e.items && e.items.map((function(t) {
                                    return t ? "app" == t.type || "appsSameFolder" == t.type ? Object(s.jsx)("div", {
                                        style: {
                                            marginBottom: 40
                                        },
                                        children: Object(s.jsx)(O.a, {
                                            onClick: e.onItemClick,
                                            item: t,
                                            centerIcon: e.centerIcon,
                                            onClickIcon: function(e) {
                                                l.a.delFav(t.id), e.preventDefault()
                                            }
                                        })
                                    }, t.id) : "books" == t.type || "booksSameFolder" == t.type ? Object(s.jsx)(u.a, {
                                        onClick: e.onItemClick,
                                        item: t,
                                        centerIcon: e.centerIcon,
                                        onClickIcon: function(e) {
                                            l.a.delFav(t.id), e.preventDefault()
                                        }
                                    }, t.id) : "imagesSameFolder" == t.type ? Object(s.jsx)(x.a, {
                                        onClick: e.onItemClick,
                                        item: t,
                                        centerIcon: e.centerIcon,
                                        onClickIcon: function(e) {
                                            l.a.delFav(t.id), e.preventDefault()
                                        }
                                    }, t.id) : "audioSameFolder" == t.type || "singer" == t.type || "album" == t.type ? Object(s.jsx)(v.a, {
                                        onClick: e.onItemClick,
                                        item: t,
                                        centerIcon: e.centerIcon,
                                        onClickIcon: function(e) {
                                            l.a.delFav(t.id), e.preventDefault()
                                        }
                                    }, t.id) : "series" == t.type ? Object(s.jsx)("div", {
                                        style: {
                                            marginBottom: 40
                                        },
                                        children: Object(s.jsx)(o.a, {
                                            onClick: e.onItemClick,
                                            item: t,
                                            centerIcon: e.centerIcon,
                                            onClickIcon: function(e) {
                                                l.a.delFav(t.id), e.preventDefault()
                                            }
                                        }, t.id)
                                    }) : "vidsSameFolder" == t.type ? Object(s.jsx)("div", {
                                        style: {
                                            marginBottom: 40
                                        },
                                        children: Object(s.jsx)(b.a, {
                                            onClick: e.onItemClick,
                                            item: t,
                                            centerIcon: e.centerIcon,
                                            onClickIcon: function(e) {
                                                l.a.delFav(t.id), e.preventDefault()
                                            }
                                        }, t.id)
                                    }) : Object(s.jsx)(o.a, {
                                        onClick: e.onItemClick,
                                        item: t,
                                        centerIcon: e.centerIcon,
                                        onClickIcon: function(e) {
                                            l.a.delFav(t.id), e.preventDefault()
                                        }
                                    }, t.id) : Object(s.jsxs)(r.b, {
                                        className: "box",
                                        children: [Object(s.jsx)("div", {
                                            className: "name",
                                            children: "error"
                                        }), Object(s.jsx)("img", {
                                            loading: "lazy",
                                            src: l.a.host + e.image + "error"
                                        })]
                                    }, t.id)
                                }))
                            })
                        })]
                    })]
                })
            }
        },
        363: function(e, t, c) {
            "use strict";
            var s = c(0),
                n = c(4),
                i = c.n(n),
                a = c(27),
                r = c(6),
                l = c(5),
                o = c(1),
                d = (c(372), c(2)),
                j = [];

            function m() {
                return b.apply(this, arguments)
            }

            function b() {
                return (b = Object(r.a)(i.a.mark((function e() {
                    return i.a.wrap((function(e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                if (0 != j.length) {
                                    e.next = 4;
                                    break
                                }
                                return e.next = 3, d.a.fetch(d.a.host + "getLast20Items", {
                                    method: "GET"
                                }).then((function(e) {
                                    return e.json()
                                }));
                            case 3:
                                j = e.sent;
                            case 4:
                                return e.abrupt("return", j);
                            case 5:
                            case "end":
                                return e.stop()
                        }
                    }), e)
                })))).apply(this, arguments)
            }
            var h = c(12);
            t.a = function(e) {
                var t = Object(o.useState)([]),
                    c = Object(l.a)(t, 2),
                    n = c[0],
                    j = c[1],
                    b = Object(o.useState)(0),
                    O = Object(l.a)(b, 2),
                    u = O[0],
                    x = O[1],
                    v = Object(o.useState)(window.innerWidth),
                    f = Object(l.a)(v, 2),
                    p = f[0];
                return f[1], Object(o.useEffect)(Object(r.a)(i.a.mark((function e() {
                    var t;
                    return i.a.wrap((function(e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2, m();
                            case 2:
                                t = e.sent, j([].concat(Object(a.a)(t), Object(a.a)(t), Object(a.a)(t), Object(a.a)(t), Object(a.a)(t)));
                            case 4:
                            case "end":
                                return e.stop()
                        }
                    }), e)
                }))), [e]), Object(o.useEffect)((function() {
                    0 !== (null === n || void 0 === n ? void 0 : n.length) && setTimeout((function() {
                        u > 19 * (n.length - 2) ? x(0) : x(u + 19)
                    }), 1500)
                }), [n, u]), Object(s.jsxs)(s.Fragment, {
                    children: [!d.a.isApp && p < 570 && Object(s.jsx)("div", {
                        className: "play-cont",
                        children: Object(s.jsx)("a", {
                            href: "https://play.google.com/store/apps/details?id=co.yetech.estra7ahpro",
                            children: Object(s.jsx)("img", {
                                style: {
                                    width: "100%"
                                },
                                src: "/googleplay.png"
                            })
                        })
                    }), Object(s.jsxs)("div", {
                        className: "footer",
                        children: [Object(s.jsx)("div", {
                            className: "over-img"
                        }), Object(s.jsx)("div", {
                            style: {
                                clear: "both"
                            }
                        }), Object(s.jsx)("div", {
                            className: "networkname",
                            children: d.a.networkName
                        }), Object(s.jsx)("div", {
                            className: "networkdesc",
                            children: d.a.networkDesc
                        }), Object(s.jsxs)("div", {
                            className: "icons-social",
                            children: [Object(s.jsx)("a", {
                                href: d.a.main_facebook,
                                target: "_blank",
                                children: Object(s.jsx)("i", {
                                    className: "lni lni-facebook"
                                })
                            }), Object(s.jsx)("a", {
                                href: "https://wa.me/" + d.a.main_phone + "?text=اهلاً  " + d.a.networkName,
                                target: "_blank",
                                children: Object(s.jsx)("i", {
                                    className: "lni lni-whatsapp"
                                })
                            })]
                        }), Object(s.jsx)("div", {
                            style: {
                                clear: "both"
                            }
                        }), Object(s.jsx)("div", {
                            className: "new-items",
                            children: Object(s.jsx)("div", {
                                className: "items-ani-cont",
                                style: {
                                    bottom: u
                                },
                                children: n.map((function(e) {
                                    return Object(s.jsx)(h.b, {
                                        style: {
                                            color: "rgb(225 219 241)"
                                        },
                                        to: "/itemView/" + e.type + "/" + e.id,
                                        children: Object(s.jsx)("div", {
                                            className: "item",
                                            children: e.name
                                        })
                                    })
                                }))
                            })
                        }), Object(s.jsxs)("div", {
                            className: "footer-rights",
                            children: [Object(s.jsx)("div", {
                                children: " صنع بفخر في اليمن Proudly made in Yemen "
                            }), Object(s.jsxs)("div", {
                                children: ["جميع الحقوق محفوظة شركه", " ", Object(s.jsx)("span", {
                                    children: Object(s.jsxs)("a", {
                                        target: "_blank",
                                        href: "http://192.168.1.153",
                                        children: [" ", "Pr.MOHAMMED AL QIARY -771015253"]
                                    })
                                })]
                            })]
                        }), Object(s.jsx)("div", {
                            className: "versions",
                            children: Object(s.jsxs)("div", {
                                className: "system",
                                children: ["Estra7ah: ", d.a.currentVersion]
                            })
                        })]
                    })]
                })
            }
        },
        365: function(e, t, c) {
            "use strict";
            var s = c(0),
                n = c(5),
                i = c(1);
            c(366);
            t.a = function(e) {
                var t = Object(i.useState)(0),
                    c = Object(n.a)(t, 2),
                    a = c[0],
                    r = c[1];
                return e.isFloat ? Object(s.jsx)("div", {
                    className: "float-slider",
                    children: e.children
                }) : Object(s.jsxs)("div", {
                    className: "slider-kc",
                    children: [Object(s.jsx)("div", {
                        className: "items",
                        style: {
                            left: a
                        },
                        children: e.children
                    }), Object(s.jsxs)("div", {
                        className: "arrows",
                        children: [Object(s.jsx)("div", {
                            className: "left-arrow",
                            onClick: function() {
                                r(a + 400)
                            },
                            children: Object(s.jsx)("i", {
                                className: "lni lni-chevron-left"
                            })
                        }), Object(s.jsx)("div", {
                            className: "right-arrow",
                            onClick: function() {
                                r(a - 400)
                            },
                            style: {
                                display: 0 === a ? "none" : "block"
                            },
                            children: Object(s.jsx)("i", {
                                className: "lni lni-chevron-right"
                            })
                        })]
                    })]
                })
            }
        },
        366: function(e, t, c) {},
        367: function(e, t, c) {},
        369: function(e, t, c) {},
        370: function(e, t, c) {},
        371: function(e, t, c) {},
        372: function(e, t, c) {},
        382: function(e, t, c) {
            "use strict";
            t.a = function(e) {
                return "series" === e || "series.tv" === e || "series.learn" === e || "series.ramadan" === e || "series.sports" === e || "series.deen" === e || "series.sports" === e || "series.kids" === e || "series.anime" === e
            }
        },
        394: function(e, t, c) {
            "use strict";
            var s = c(0),
                n = c(4),
                i = c.n(n),
                a = c(6),
                r = c(5),
                l = c(1),
                o = c(362),
                d = c(2);
            var j = null,
                m = [];
            t.a = function(e) {
                var t = Object(l.useState)(m),
                    c = Object(r.a)(t, 2),
                    n = c[0],
                    b = c[1];
                return Object(l.useEffect)((function() {
                    JSON.stringify(e) !== j && (j = JSON.stringify(e), Object(a.a)(i.a.mark((function t() {
                        return i.a.wrap((function(t) {
                            for (;;) switch (t.prev = t.next) {
                                case 0:
                                    return t.next = 2, c = e.tags, s = e.type, n = e.sec_id, d.a.fetch(d.a.host + "getSimilerItems/" + (c || "--") + "/" + s + "/" + n, {
                                        method: "GET"
                                    }).then((function(e) {
                                        return e.json()
                                    }));
                                case 2:
                                    m = t.sent, b(m);
                                case 4:
                                case "end":
                                    return t.stop()
                            }
                            var c, s, n
                        }), t)
                    })))())
                }), [e]), 0 === n.length ? Object(s.jsx)("div", {
                    children: Object(s.jsx)(o.a, {
                        items: [],
                        data: {
                            title: e.title
                        },
                        size: e.size,
                        image: "/ItemImage/",
                        type: "skeleton",
                        centerIcon: e.centerIcon
                    })
                }) : Object(s.jsx)("div", {
                    children: Object(s.jsx)(o.a, {
                        items: n,
                        data: {
                            title: e.title
                        },
                        size: e.size,
                        image: "/ItemImage/",
                        type: e.type,
                        centerIcon: e.centerIcon,
                        onItemClick: function(t) {
                            e.onItemClick && e.onItemClick(t), window.scrollTo({
                                top: 0,
                                behavior: "smooth"
                            })
                        }
                    })
                })
            }
        },
        395: function(e, t, c) {
            "use strict";
            var s = c(0),
                n = c(4),
                i = c.n(n),
                a = c(6),
                r = c(5),
                l = c(1),
                o = c(2);

            // دالة (d): مسؤولة عن إرسال تقرير (sendReport)
// - تنشئ FormData وتضيف الرسالة ومعرّف العنصر
// - ترسل البيانات إلى المسار 'sendReport/'
function d(e, t) {
                var c = new FormData;
                return c.append("msg", e), c.append("itemId", t), o.a.fetch(o.a.host + "sendReport/", {
                    method: "POST",
                    body: c,
                    type: "post"
                }).then((function(e) {
                    return e.json()
                }))
            }
            t.a = function(e) {
                var t = e.itemId,
                    c = e.Vis,
                    n = e.setVis,
                    o = Object(l.useState)(!1),
                    j = Object(r.a)(o, 2),
                    m = j[0],
                    b = j[1],
                    h = Object(l.useState)(""),
                    O = Object(r.a)(h, 2),
                    u = O[0],
                    x = O[1],
                    v = Object(s.jsxs)(s.Fragment, {
                        children: [Object(s.jsx)("div", {
                            className: "head",
                            children: "بلاغ عن محتوى مسىء"
                        }), Object(s.jsx)("div", {
                            className: "txt",
                            children: " قم بالتبليغ عن محتوى مسيء الى ادارة الاستراحه"
                        }), Object(s.jsx)("textarea", {
                            value: u,
                            onChange: function(e) {
                                return x(e.target.value)
                            },
                            placeholder: "اكتب البلاغ هنا"
                        }), Object(s.jsx)("div", {
                            className: "sendbtn",
                            onClick: Object(a.a)(i.a.mark((function e() {
                                return i.a.wrap((function(e) {
                                    for (;;) switch (e.prev = e.next) {
                                        case 0:
                                            d(u, t), b(!0);
                                        case 2:
                                        case "end":
                                            return e.stop()
                                    }
                                }), e)
                            }))),
                            children: "ارسال"
                        })]
                    });
                return 1 == m && (v = Object(s.jsxs)("div", {
                    style: {
                        color: "#fff"
                    },
                    children: [Object(s.jsx)("div", {
                        className: "head",
                        children: "شكراً"
                    }), Object(s.jsx)("div", {
                        children: " لقد تم ارسال بلاغك بنجاح"
                    })]
                })), Object(s.jsxs)("div", {
                    className: "report-modal " + (!0 === c && "h"),
                    children: [Object(s.jsx)("div", {
                        className: "over",
                        onClick: function() {
                            n(1 != c)
                        }
                    }), Object(s.jsx)("div", {
                        className: "content",
                        children: v
                    })]
                })
            }
        },
        411: function(e, t, c) {},
        422: function(e, t, c) {
            "use strict";
            c.r(t);
            var s = c(0),
                n = c(4),
                i = c.n(n),
                a = c(6),
                r = c(5),
                l = c(1),
                o = (c(411), c(362)),
                d = c(364),
                j = c(368),
                m = c(363),
                b = c(2);

            // دالة (h): تجلب عدد المواسم والحلقات (getNumSeasonsAndEps)
function h(e) {
                return b.a.fetch(b.a.host + "getNumSeasonsAndEps/" + e, {
                    method: "GET"
                }).then((function(e) {
                    return e.json()
                }))
            }
            var O = c(394),
                u = c(382),
                x = c(48),
                v = c(395);

            // دالة (f): تحسب قيمة رقمية من نص (مثلاً من اسم الموسم) لاستخدامها في الفرز
function f(e) {
                var t = e.match(/\d+/g);
                return t ? t.reduce((function(e, t) {
                    return e + parseInt(t)
                }), 0) : 0
            }
            // المكوّن الافتراضي (default export): صفحة تفاصيل العنصر
// - يعرض تفاصيل: الاسم، التقييمات (IMDB)، السنة، عدد المواسم والحلقات
// - يستعرض الوصف (عربي/إنجليزي)
// - أزرار: إضافة للمفضلة، تبليغ عن محتوى مسيء
// - يعرض فريق العمل (cast)
// - يعرض المواسم المرتبطة بالعمل
t.default = function(e) {
                var t = Object(l.useState)({
                        eps: 0,
                        seasons: 0
                    }),
                    c = Object(r.a)(t, 2),
                    n = c[0],
                    p = c[1],
                    g = Object(l.useState)(!0),
                    N = Object(r.a)(g, 2),
                    I = N[0],
                    k = N[1],
                    y = Object(l.useState)([]),
                    C = Object(r.a)(y, 2),
                    w = C[0],
                    E = C[1],
                    S = Object(l.useState)(""),
                    F = Object(r.a)(S, 2),
                    z = F[0],
                    D = F[1];
                Object(l.useEffect)((function() {
                    Object(a.a)(i.a.mark((function t() {
                        var c;
                        return i.a.wrap((function(t) {
                            for (;;) switch (t.prev = t.next) {
                                case 0:
                                    if (!e.data) {
                                        t.next = 9;
                                        break
                                    }
                                    if (!Object(u.a)(e.data.type)) {
                                        t.next = 8;
                                        break
                                    }
                                    return t.next = 4, s = e.data.id, b.a.fetch(b.a.host + "getSeries/" + s, {
                                        method: "GET"
                                    }).then((function(e) {
                                        return e.json()
                                    }));
                                case 4:
                                    c = t.sent;
                                    try {
                                        c.sort((function(e, t) {
                                            return f(e.name) - f(t.name)
                                        }))
                                    } catch (i) {}
                                    E(c), h(e.data.id).then((function(e) {
                                        p(e || n)
                                    }));
                                case 8:
                                    D(e.data.path);
                                case 9:
                                case "end":
                                    return t.stop()
                            }
                            var s
                        }), t)
                    })))()
                }), [e]);
                var A = {
                    descArabic: "لايوجد بيانات",
                    descEnglish: "لايوجد بيانات",
                    directedByArabic: [],
                    directedByEnglish: "",
                    castArabic: [],
                    castEnglish: "",
                    ReleaseDate: "لايوجد بيانات",
                    tagsArabic: "",
                    tagsEnglish: "",
                    MPAA: "لايوجد بيانات",
                    rmRatings: "0",
                    imdbRating: "0",
                    imdbVotes: "0",
                    Runtime: "120"
                };
                if (e.data && e.data.content && null != e.data.content.contentJSON) {
                    try {
                        A = JSON.parse(e.data.content.contentJSON)
                    } catch (V) {}
                    "string" == typeof A.castEnglish && (A.castEnglish = A.castEnglish.split(",").filter((function(e) {
                        return "" !== e
                    })))
                }
                var R = null;
                return "caffe" == b.a.estra7ah_settings.estra7ah_type && z && (R = Object(s.jsx)("div", {
                    className: "explor-btn",
                    children: Object(s.jsxs)("div", {
                        class: "btn play-btn",
                        style: {
                            marginRight: 10
                        },
                        onClick: function() {
                            window.nw && window.nw.Shell.openItem(z)
                        },
                        children: [Object(s.jsx)("i", {
                            class: "lni lni-folder"
                        }), " فتح المجلد وتصفحه"]
                    })
                })), Object(s.jsxs)("div", {
                    children: [Object(s.jsx)(d.a, {}), Object(s.jsxs)("div", {
                        className: "movie-cont-desc-mobile",
                        children: [Object(s.jsxs)("div", {
                            className: "img",
                            children: [Object(s.jsx)(x.a, {
                                src: "".concat(b.a.host, "/ItemImage/").concat(e.data.id)
                            }), Object(s.jsx)("div", {
                                className: "boxShadow"
                            })]
                        }), Object(s.jsxs)("div", {
                            className: "desc",
                            children: [Object(s.jsx)("div", {
                                className: "head",
                                children: e.data.name
                            }), Object(s.jsxs)("div", {
                                className: "year-cont",
                                children: [A.imdbRating && Object(s.jsxs)("div", {
                                    className: "rate-bdg",
                                    children: [Object(s.jsxs)("div", {
                                        className: "imdb",
                                        children: [Object(s.jsxs)("span", {
                                            children: [" ", A.imdbVotes, " / "]
                                        }), " ", A.imdbRating]
                                    }), Object(s.jsx)("img", {
                                        src: j.a
                                    })]
                                }), A.ReleaseDate && Object(s.jsx)("div", {
                                    className: "year",
                                    children: A.ReleaseDate
                                }), A.Runtime && Object(s.jsxs)("div", {
                                    className: "long",
                                    children: [A.Runtime.replace("min", ""), " دقيقة"]
                                })]
                            }), Object(s.jsx)("div", {
                                className: "desc-txt",
                                children: A.descArabic || A.descEnglish
                            }), Object(s.jsxs)("div", {
                                class: "tags",
                                children: [A.tagsArabic.map && A.tagsArabic.map((function(e) {
                                    return Object(s.jsx)("div", {
                                        className: "tag",
                                        children: e
                                    })
                                })), A.castEnglish.length > 0 && A.castEnglish.map && A.castEnglish.map((function(e) {
                                    return Object(s.jsx)("div", {
                                        className: "tag",
                                        children: e
                                    })
                                }))]
                            }), Object(s.jsxs)("div", {
                                className: "btns",
                                children: [R, Object(s.jsxs)("div", {
                                    className: "btn add-btn",
                                    onClick: function(t) {
                                        b.a.addFav(e.data), t.preventDefault(), t.currentTarget.remove()
                                    },
                                    children: [Object(s.jsx)("i", {
                                        className: "lni lni-plus"
                                    }), " اضافة للقائمة"]
                                }), Object(s.jsxs)("div", {
                                    style: {
                                        background: "red",
                                        marginLeft: 10,
                                        marginRight: 10
                                    },
                                    className: "btn ",
                                    onClick: function(e) {
                                        k(1 != I)
                                    },
                                    children: [Object(s.jsx)("i", {
                                        className: "lni lni-flag"
                                    }), " تبليغ"]
                                })]
                            })]
                        })]
                    }), Object(s.jsxs)("div", {
                        className: "movie-cont-desc",
                        children: [Object(s.jsx)("div", {
                            className: "bg-img",
                            style: {
                                backgroundImage: "url(".concat(b.a.host, "/ItemImage/").concat(e.data.id, ")")
                            }
                        }), Object(s.jsxs)("div", {
                            className: "desc-img-cont",
                            children: [Object(s.jsx)("div", {
                                className: "img",
                                children: Object(s.jsx)(x.a, {
                                    src: "".concat(b.a.host, "/ItemImage/").concat(e.data.id)
                                })
                            }), Object(s.jsxs)("div", {
                                className: "desc",
                                children: [Object(s.jsx)("div", {
                                    className: "head",
                                    children: e.data.name
                                }), Object(s.jsxs)("div", {
                                    className: "year",
                                    children: [A.ReleaseDate, " ", Object(s.jsxs)("span", {
                                        children: [" ", "| ", n.seasons, " مواسم | ", n.eps, " حلقة", " "]
                                    })]
                                }), A.imdbRating && Object(s.jsxs)("div", {
                                    className: "rate-bdg",
                                    children: [Object(s.jsxs)("div", {
                                        className: "imdb",
                                        children: [Object(s.jsxs)("span", {
                                            children: [" ", A.imdbVotes, " / "]
                                        }), " ", A.imdbRating]
                                    }), Object(s.jsx)("img", {
                                        src: j.a,
                                        style: {
                                            width: 40
                                        }
                                    })]
                                }), A.tagsArabic.map && Object(s.jsx)("div", {
                                    class: "tags",
                                    children: A.tagsArabic.map && A.tagsArabic.map((function(e) {
                                        return Object(s.jsx)("div", {
                                            className: "tag",
                                            children: e
                                        })
                                    }))
                                }), Object(s.jsx)("div", {
                                    className: "desc-txt",
                                    children: A.descArabic || A.descEnglish
                                }), Object(s.jsxs)("div", {
                                    class: "btns",
                                    children: [R, Object(s.jsxs)("div", {
                                        class: "btn add-btn",
                                        children: [Object(s.jsx)("i", {
                                            class: "lni lni-plus"
                                        }), " اضافة للقائمة"]
                                    }), Object(s.jsxs)("div", {
                                        style: {
                                            background: "red",
                                            marginLeft: 10,
                                            marginRight: 10
                                        },
                                        className: "btn ",
                                        onClick: function(e) {
                                            k(1 != I)
                                        },
                                        children: [Object(s.jsx)("i", {
                                            className: "lni lni-flag"
                                        }), " تبليغ"]
                                    })]
                                }), Object(s.jsx)("div", {
                                    className: "cast",
                                    children: A.castEnglish.length > 0 && Object(s.jsxs)("div", {
                                        children: [Object(s.jsx)("div", {
                                            className: "head",
                                            children: "فريق العمل"
                                        }), A.castEnglish.map && A.castEnglish.map((function(e) {
                                            return Object(s.jsx)("div", {
                                                className: "castp",
                                                children: Object(s.jsx)("div", {
                                                    className: "name",
                                                    children: e
                                                })
                                            })
                                        }))]
                                    })
                                })]
                            })]
                        })]
                    }), Object(s.jsx)("div", {
                        style: {
                            clear: "both"
                        }
                    }), Object(s.jsxs)("div", {
                        style: {
                            marginTop: 50
                        },
                        children: [0 === w.length && Object(s.jsx)(o.a, {
                            items: [],
                            data: {
                                title: "المواسم"
                            },
                            size: "small",
                            appendLink: "/" + e.data.id,
                            image: "/ItemImage/",
                            noData: !0,
                            centerIcon: "link",
                            type: "skeleton"
                        }), w.length > 0 && Object(s.jsx)(o.a, {
                            items: w,
                            data: {
                                title: "المواسم"
                            },
                            size: "small",
                            appendLink: "/" + e.data.id,
                            image: "/ItemImage/",
                            noData: !0,
                            centerIcon: "link",
                            type: "seasons"
                        }), Object(s.jsx)(O.a, {
                            type: e.data.type,
                            sec_id: e.data.sectionId,
                            tags: A.tagsArabic,
                            title: "المزيد",
                            size: "small",
                            centerIcon: "play",
                            onItemClick: function() {}
                        })]
                    }), Object(s.jsx)(m.a, {}), Object(s.jsx)(v.a, {
                        itemId: e.data.id,
                        Vis: I,
                        setVis: k
                    })]
                })
            }
        }
    }
]);