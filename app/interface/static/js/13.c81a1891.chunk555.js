(this.webpackJsonpestra7ah5 = this.webpackJsonpestra7ah5 || []).push([
    [13], {
        387: function(e, t, a) {},
        388: function(e, t, a) {},
        391: function(e, t, a) {
            "use strict";
            a.r(t);
// 📝 تعريف دالة أو متغير رئيسي

            var s = a(0),
                c = a(4),
                n = a.n(c),
                i = a(6),
                l = a(5),
                r = a(1),
                d = (a(387), a(362)),
                j = a(364),
                o = a(363),
                b = a(2),
                m = a(17);

// 📝 تعريف دالة أو متغير رئيسي

            function u(e) {
                return b.a.fetch(b.a.host + "getEpisods/" + e, {
                    method: "GET"
                }).then((function(e) {
                    return e.json()
                }))
            }

// 📝 تعريف دالة أو متغير رئيسي

            function h(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = e.match(/\d+/g);
                return t ? t.reduce((function(e, t) {
                    return e + parseInt(t)
                }), 0) : 0
            }
            t.default = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(r.useState)([]),
                    a = Object(l.a)(t, 2),
                    c = a[0],
                    O = a[1],
                    p = Object(r.useState)([]),
                    x = Object(l.a)(p, 2),
                    g = x[0],
                    f = x[1],
                    v = Object(r.useState)(""),
                    y = Object(l.a)(v, 2),
                    N = y[0],
                    I = y[1],
                    w = Object(m.h)().pathname.replace("/itemView/", "").split("/");

// 📝 تعريف دالة أو متغير رئيسي

                function k(e) {
                    if (g.length) {
// 📝 تعريف دالة أو متغير رئيسي

                        var t = g.filter((function(t) {
                            return t.id == e
                        }))[0];
                        return t ? t.name + " - " + g.filter((function(t) {
                            return t.id == e
                        }))[0].seriesName : "حلقات الموسم"
                    }
                    return "حلقات الموسم"
                }
                Object(r.useEffect)((function() {
                    Object(i.a)(n.a.mark((function t() {
// 📝 تعريف دالة أو متغير رئيسي

                        var a, s;
                        return n.a.wrap((function(t) {
                            for (;;) switch (t.prev = t.next) {
                                case 0:
                                    return t.next = 2, c = w[2], b.a.fetch(b.a.host + "getSeries/" + c, {
                                        method: "GET"
                                    }).then((function(e) {
                                        return e.json()
                                    }));
                                case 2:
                                    a = t.sent;
                                    try {
                                        a.sort((function(e, t) {
                                            return h(e.name) - h(t.name)
                                        }))
                                    } catch (n) {}
                                    return f(a), t.next = 7, u(w[1]);
                                case 7:
                                    s = t.sent;
                                    try {
                                        s.sort((function(e, t) {
                                            return h(e.name) - h(t.name)
                                        }))
                                    } catch (n) {}
                                    O(s), I(e.data.path);
                                case 11:
                                case "end":
                                    return t.stop()
                            }
// 📝 تعريف دالة أو متغير رئيسي

                            var c
                        }), t)
                    })))()
                }), [e]);
// 📝 تعريف دالة أو متغير رئيسي

                var E = null;
                return "caffe" === b.a.estra7ah_settings.estra7ah_type && N && (E = Object(s.jsx)("div", {
                    className: "explor-btn",
                    style: {
                        marginTop: 40
                    },
                    children: Object(s.jsxs)("div", {
                        class: "btn play-btn open-folder",
                        style: {
                            marginRight: 10
                        },
                        onClick: function() {
                            window.nw && window.nw.Shell.openItem(N)
                        },
                        children: [Object(s.jsx)("i", {
                            class: "lni lni-folder"
                        }), " فتح المجلد المسلسل وتصفحه"]
                    })
                })), Object(s.jsxs)("div", {
                    children: [Object(s.jsx)(j.a, {}), Object(s.jsx)("div", {
                        children: E
                    }), 0 === g.length && Object(s.jsx)(d.a, {
                        items: [],
                        data: {
                            title: "المواسم"
                        },
                        size: "small",
                        appendLink: "/" + w[2],
                        image: "/ItemImage/",
                        noData: !0,
                        type: "skeleton",
                        centerIcon: "link"
                    }), g.length > 0 && Object(s.jsx)(d.a, {
                        items: g,
                        selectedItemId: w[1],
                        data: {
                            title: "المواسم"
                        },
                        size: "small",
                        appendLink: "/" + w[2],
                        image: "/ItemImage/",
                        noData: !0,
                        type: "seasons",
                        centerIcon: "link"
                    }), 0 === c.length && Object(s.jsx)(d.a, {
                        items: c,
                        data: {
                            title: k(w[1]) || "حلقات الموسم"
                        },
                        size: "big",
                        noData: !0,
                        onItemClick: function(item){ window.nw && window.nw.Shell.openItem(item.path) },
                        image: "/ItemImage/",
                        type: "skeleton",
                        centerIcon: "play"
                    }), c.length > 0 && Object(s.jsx)(d.a, {
                        items: c,
                        data: {
                            title: k(w[1]) || "حلقات الموسم"
                        },
                        size: "big",
                        noData: !0,
                        onItemClick: function(item){ window.nw && window.nw.Shell.openItem(item.path) },
                        image: "/ItemImage/",
                        type: "eps",
                        centerIcon: "play"
                    }), Object(s.jsx)(o.a, {})]
                })
            }
        },
        392: function(e, t, a) {
            "use strict";
            a.r(t);
// 📝 تعريف دالة أو متغير رئيسي

            var s = a(0),
                c = a(4),
                n = a.n(c),
                i = a(6),
                l = a(5),
                r = a(1),
                d = (a(388), a(362), a(364)),
                j = a(363),
                o = (a(11), a(17)),
                b = a(2);

// 📝 تعريف دالة أو متغير رئيسي

            function m(e) {
                return b.a.fetch(b.a.host + "getSongs/" + e, {
                    method: "GET"
                }).then((function(e) {
                    return e.json()
                }))
            }
            t.default = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(r.useState)([]),
                    a = Object(l.a)(t, 2),
                    c = a[0],
                    u = a[1],
                    h = Object(r.useState)([]),
                    O = Object(l.a)(h, 2),
                    p = O[0],
                    x = O[1],
                    g = Object(r.useState)(b.a.selectedSongId),
                    f = Object(l.a)(g, 2),
                    v = f[0],
                    y = f[1],
                    N = Object(o.h)().pathname.replace("/itemView/", "").split("/"),
                    I = Object(r.useState)(null),
                    w = Object(l.a)(I, 2),
                    k = w[0],
                    E = w[1];
                return Object(r.useEffect)(Object(i.a)(n.a.mark((function e() {
// 📝 تعريف دالة أو متغير رئيسي

                    var t;
                    return n.a.wrap((function(e) {
                        for (;;) switch (e.prev = e.next) {
                            case 0:
                                return e.next = 2, a = N[1], b.a.fetch(b.a.host + "getAlbums/" + a, {
                                    method: "GET"
                                }).then((function(e) {
                                    return e.json()
                                }));
                            case 2:
                                if (t = e.sent, x(t), !(t.length > 0)) {
                                    e.next = 11;
                                    break
                                }
                                return e.t0 = u, e.next = 8, m(t[0].id);
                            case 8:
                                e.t1 = e.sent, (0, e.t0)(e.t1), E(t[0].name);
                            case 11:
                            case "end":
                                return e.stop()
                        }
// 📝 تعريف دالة أو متغير رئيسي

                        var a
                    }), e)
                }))), [e]), Object(s.jsxs)("div", {
                    children: [Object(s.jsx)(d.a, {}), Object(s.jsxs)("div", {
                        className: "audio-cont",
                        children: [Object(s.jsx)("div", {
                            className: "head",
                            children: "الالبومات : "
                        }), Object(s.jsxs)("div", {
                            style: {
                                display: "flex",
                                gap: 5,
                                margin: 10
                            },
                            children: [Object(s.jsx)("select", {
                                className: "list",
                                onChange: function() {
// 📝 تعريف دالة أو متغير رئيسي

                                    var e = Object(i.a)(n.a.mark((function e(t) {
// 📝 تعريف دالة أو متغير رئيسي

                                        var a;
                                        return n.a.wrap((function(e) {
                                            for (;;) switch (e.prev = e.next) {
                                                case 0:
                                                    return a = t.currentTarget.value, p.forEach((function(e, t) {
                                                        e.id === a ? (p[t].selected = !0, E(e.name)) : p[t].selected = !1
                                                    })), x(p), e.t0 = u, e.next = 6, m(a);
                                                case 6:
                                                    e.t1 = e.sent, (0, e.t0)(e.t1);
                                                case 8:
                                                case "end":
                                                    return e.stop()
                                            }
                                        }), e)
                                    })));
                                    return function(t) {
                                        return e.apply(this, arguments)
                                    }
                                }(),
                                children: p.map((function(e, t) {
                                    return Object(s.jsx)("option", {
                                        className: "item album " + (e.selected ? "selected" : ""),
                                        value: e.id,
                                        children: e.name
                                    })
                                }))
                            }), Object(s.jsxs)("button", {
                                onClick: function() {
// 📝 تعريف دالة أو متغير رئيسي

                                    var e = c.map((function(e) {
                                            return "#EXTINF:-1,".concat(b.a.networkName + " | " + e.name, "\n").concat(b.a.host + "stream/" + e.id + "?RMUID=" + b.a.RMUID)
                                        })),
                                        t = new Blob([e.join("\n")], {
                                            type: "audio/mpegurl"
                                        }),
                                        a = URL.createObjectURL(t),
                                        s = document.createElement("a");
                                    s.href = a, s.download = !0, s.download = "".concat(k || "playlist", " - ").concat(b.a.networkName, ".m3u"), document.body.appendChild(s), s.click(), document.body.removeChild(s)
                                },
                                children: ["تنزيل playlist ", Object(s.jsx)("i", {
                                    className: "lni  lni-download"
                                })]
                            })]
                        }), Object(s.jsx)("div", {
                            className: "list",
                            children: c.map((function(e, t) {
                                return Object(s.jsxs)("div", {
                                    className: "item song ",
                                    onClick: function() {
                                        if (v === e.id) return b.a.AudioPlayer.style.opacity = "0", b.a.AudioPlayer.style.display = "none", b.a.AudioPlayerDOM.pause(), void y(null);
                                        b.a.AudioPlayerDOM.src = b.a.host + "stream/" + e.id + "?RMUID=" + b.a.RMUID, b.a.AudioPlayerDOM.load(), b.a.AudioPlayerDOM.play(), b.a.audios = c, b.a.audioI = t, b.a.AudioPlayersetTitle(e.name), b.a.AudioPlayer.style.opacity = "1", b.a.AudioPlayer.style.display = "block", b.a.selectedSongId = e.id, y(e.id)
                                    },
                                    children: [Object(s.jsx)("div", {
                                        style: {
                                            width: "90%"
                                        },
                                        children: e.name.replace(".mp3", "").replace(".MP3", "")
                                    }), Object(s.jsx)("div", {
                                        children: Object(s.jsx)("div", {
                                            className: "icon",
                                            children: Object(s.jsx)("i", {
                                                className: "lni  lni-" + (v === e.id ? "pause" : "play")
                                            })
                                        })
                                    })]
                                })
                            }))
                        })]
                    }), Object(s.jsx)("div", {
                        style: {
                            clear: "both",
                            marginBottom: "5%"
                        }
                    }), Object(s.jsx)(j.a, {})]
                })
            }
        },
        410: function(e, t, a) {},
        412: function(e, t, a) {},
        428: function(e, t, a) {
            "use strict";
            a.r(t);
// 📝 تعريف دالة أو متغير رئيسي

            var s = a(0),
                c = a(4),
                n = a.n(c),
                i = a(6),
                l = a(5),
                r = a(1),
                d = (a(410), a(362), a(364)),
                j = a(368),
                o = a(363),
                b = a(2);

// 📝 تعريف دالة أو متغير رئيسي

            function m(e) {
                return b.a.fetch(b.a.host + "getItemData/" + e, {
                    method: "GET"
                }).then((function(e) {
                    return e.json()
                }))
            }
// 📝 تعريف دالة أو متغير رئيسي

            var u = a(17),
                h = a(422),
                O = (a(412), a(394)),
                p = a(12),
                x = a(48),
                g = a(395),
                f = {
                    descArabic: "لايوجد بيانات",
                    descEnglish: "لايوجد بيانات",
                    directedByArabic: [],
                    directedByEnglish: "",
                    castArabic: [],
                    castEnglish: "",
                    ReleaseDate: "[السنة]",
                    tagsArabic: "",
                    tagsEnglish: "",
                    MPAA: "7",
                    rmRatings: "0",
                    imdbRating: "0",
                    imdbVotes: "0",
                    Runtime: "120"
                };

// 📝 تعريف دالة أو متغير رئيسي

            function v(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(r.useState)(""),
                    a = Object(l.a)(t, 2),
                    c = a[0],
                    n = a[1],
                    i = Object(r.useState)(e),
                    m = Object(l.a)(i, 2),
                    h = m[0],
                    v = m[1],
                    y = Object(u.h)(),
                    N = Object(r.useState)(!0),
                    I = Object(l.a)(N, 2),
                    w = I[0],
                    k = I[1];
                if (Object(r.useEffect)((function() {
                        v(e), n(e.data.path)
                    }), [e, y.pathname]), h.data && h.data.content && null != h.data.content.contentJSON) {
                    try {
                        f = JSON.parse(h.data.content.contentJSON)
                    } catch (R) {}
                    "string" == typeof f.castEnglish && (f.castEnglish = f.castEnglish.split(","))
                }
// 📝 تعريف دالة أو متغير رئيسي

                var E = null;
                return "caffe" == b.a.estra7ah_settings.estra7ah_type && c && (E = Object(s.jsxs)("div", {
                    class: "btn play-btn open-folder",
                    style: {
                        marginRight: 10
                    },
                    onClick: function() {
                        window.nw && window.nw.Shell.openItem(c)
                    },
                    children: [Object(s.jsx)("i", {
                        class: "lni lni-folder"
                    }), " فتح المجلد وتصفحه"]
                })), Object(s.jsxs)("div", {
                    children: [Object(s.jsx)(d.a, {}), Object(s.jsxs)("div", {
                        className: "movie-cont-desc-mobile",
                        children: [Object(s.jsxs)("div", {
                            className: "img",
                            children: [Object(s.jsx)(x.a, {
                                src: "".concat(b.a.host, "/ItemImage/").concat(h.data.id),
                                type: "movie"
                            }), Object(s.jsx)("div", {
                                className: "boxShadow"
                            })]
                        }), Object(s.jsxs)("div", {
                            className: "desc",
                            children: [Object(s.jsx)("div", {
                                className: "head",
                                children: h.data.name
                            }), Object(s.jsxs)("div", {
                                className: "year-cont",
                                children: [f.imdbRating && Object(s.jsxs)("div", {
                                    className: "rate-bdg",
                                    children: [Object(s.jsxs)("div", {
                                        className: "imdb",
                                        children: [Object(s.jsxs)("span", {
                                            children: [" ", f.imdbVotes, " / "]
                                        }), " ", f.imdbRating]
                                    }), Object(s.jsx)("img", {
                                        src: j.a
                                    })]
                                }), f.ReleaseDate && Object(s.jsx)("div", {
                                    className: "year",
                                    children: f.ReleaseDate
                                }), f.Runtime && Object(s.jsxs)("div", {
                                    className: "long",
                                    children: [f.Runtime.replace("min", ""), " دقيقة"]
                                })]
                            }), Object(s.jsx)("div", {
                                className: "desc-txt",
                                children: f.descArabic || f.descEnglish
                            }), f.tagsArabic.map && Object(s.jsxs)("div", {
                                class: "tags",
                                children: [f.tagsArabic.map && f.tagsArabic.map((function(e) {
                                    return Object(s.jsx)("div", {
                                        className: "tag",
                                        children: e
                                    })
                                })), f.castEnglish.length > 0 && f.castEnglish.map && f.castEnglish.map((function(e) {
                                    return Object(s.jsx)("div", {
                                        className: "tag",
                                        children: e
                                    })
                                }))]
                            }), Object(s.jsxs)("div", {
                                className: "btns",
                                children: [Object(s.jsx)(p.b, {
                                    onClick: function(){ window.nw && window.nw.Shell.openItem(c) },
                                    children: Object(s.jsxs)("div", {
                                        className: "btn play-btn",
                                        
                                        children: [Object(s.jsx)("i", {
                                            className: "lni lni-play"
                                        }), " تشغيل"]
                                    })
                                }), E, Object(s.jsxs)("div", {
                                    className: "btn add-btn",
                                    onClick: function(e) {
                                        b.a.addFav(h.data), e.preventDefault(), e.currentTarget.remove()
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
                                        k(1 != w)
                                    },
                                    children: [Object(s.jsx)("i", {
                                        className: "lni lni-flag"
                                    }), " تبليغ عن محتوى سيئ"]
                                })]
                            })]
                        })]
                    }), Object(s.jsxs)("div", {
                        className: "movie-cont-desc",
                        children: [Object(s.jsx)("div", {
                            className: "bg-img",
                            style: {
                                backgroundImage: "url(".concat(b.a.host, "/ItemImage/").concat(h.data.id, ")")
                            }
                        }), Object(s.jsxs)("div", {
                            className: "desc-img-cont",
                            children: [Object(s.jsx)("div", {
                                className: "img",
                                children: Object(s.jsx)(x.a, {
                                    src: "".concat(b.a.host, "/ItemImage/").concat(h.data.id),
                                    type: "movie"
                                })
                            }), Object(s.jsxs)("div", {
                                className: "desc",
                                children: [Object(s.jsxs)("div", {
                                    className: "head",
// 🔑 جزء خاص بمشتركي VIP

                                    children: [h.data.name, " ", h.data.isVIP ? Object(s.jsx)("span", {
                                        className: "vip",
// 🔑 جزء خاص بمشتركي VIP

                                        title: "خاص بمشتركين VIP",
// 🔑 جزء خاص بمشتركي VIP

                                        children: "VIP"
                                    }) : null]
                                }), f.ReleaseDate && Object(s.jsxs)("div", {
                                    className: "year",
                                    children: [" ", f.ReleaseDate, " - ", f.Runtime.replace("min", ""), " دقيقة"]
                                }), f.imdbRating && Object(s.jsxs)("div", {
                                    className: "rate-bdg",
                                    children: [Object(s.jsxs)("div", {
                                        className: "imdb",
                                        children: [Object(s.jsxs)("span", {
                                            children: [" ", f.imdbVotes, " / "]
                                        }), " ", f.imdbRating]
                                    }), Object(s.jsx)("img", {
                                        src: j.a,
                                        style: {
                                            width: 40
                                        }
                                    })]
                                }), Object(s.jsx)("div", {
                                    class: "tags",
                                    children: f.tagsArabic.map && f.tagsArabic.map((function(e) {
                                        return Object(s.jsx)("div", {
                                            className: "tag",
                                            children: e
                                        })
                                    }))
                                }), Object(s.jsx)("div", {
                                    className: "desc-txt",
                                    children: f.descArabic || f.descEnglish
                                }), Object(s.jsxs)("div", {
                                    className: "btns",
                                    children: [Object(s.jsx)(p.b, {
                                        onClick: function(){ window.nw && window.nw.Shell.openItem(c) },
                                        children: Object(s.jsxs)("div", {
                                            className: "btn play-btn",
                                        
                                            children: [Object(s.jsx)("i", {
                                                className: "lni lni-play"
                                            }), " تشغيل"]
                                        })
                                    }), E, Object(s.jsxs)("div", {
                                        className: "btn add-btn",
                                        onClick: function(e) {
                                            b.a.addFav(h.data), e.preventDefault(), e.currentTarget.remove()
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
                                            k(1 != w)
                                        },
                                        children: [Object(s.jsx)("i", {
                                            className: "lni lni-flag"
                                        }), " تبليغ"]
                                    })]
                                }), Object(s.jsx)("div", {
                                    className: "cast",
                                    style: {
                                        minHeight: 100,
                                        marginBottom: 20
                                    },
                                    children: f.castEnglish.length > 1 && Object(s.jsxs)("div", {
                                        children: [Object(s.jsx)("div", {
                                            className: "head",
                                            children: "فريق العمل"
                                        }), f.castEnglish.map && f.castEnglish.map((function(e) {
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
                    }), Object(s.jsx)(O.a, {
                        type: h.data.type,
                        sec_id: h.data.sectionId,
                        tags: f.tagsArabic,
                        title: "افلام قد تعجبك",
                        size: "small",
                        centerIcon: "play"
                    }), Object(s.jsx)(o.a, {}), Object(s.jsx)(g.a, {
                        itemId: h.data.id,
                        Vis: w,
                        setVis: k
                    })]
                })
            }
// 📝 تعريف دالة أو متغير رئيسي

            var y = a(391),
                N = a(392),
                I = a(382);
            t.default = function(e) {
// 📝 تعريف دالة أو متغير رئيسي

                var t = Object(r.useState)(null),
                    a = Object(l.a)(t, 2),
                    c = a[0],
                    d = a[1],
                    j = Object(u.h)().pathname.replace("/itemView/", "").split("/")[1];
                return Object(r.useEffect)((function() {
                    Object(i.a)(n.a.mark((function e() {
// 📝 تعريف دالة أو متغير رئيسي

                        var t;
                        return n.a.wrap((function(e) {
                            for (;;) switch (e.prev = e.next) {
                                case 0:
                                    return e.next = 2, m(j);
                                case 2:
                                    t = e.sent, d(t), localStorage.setItem("eps", JSON.stringify([]));
                                case 5:
                                case "end":
                                    return e.stop()
                            }
                        }), e)
                    })))()
                }), [j]), c && "movie" == c.type ? Object(s.jsx)("div", {
                    className: "itemView-cont",
                    children: Object(s.jsx)(v, {
                        data: c
                    })
                }) : c && Object(I.a)(c.type) ? Object(s.jsx)("div", {
                    className: "itemView-cont",
                    children: Object(s.jsx)(h.default, {
                        data: c
                    })
                }) : c && "season" == c.type ? Object(s.jsx)("div", {
                    className: "itemView-cont",
                    children: Object(s.jsx)(y.default, {
                        data: c
                    })
                }) : c && "singer" == c.type ? Object(s.jsx)("div", {
                    className: "itemView-cont",
                    children: Object(s.jsx)(N.default, {
                        data: c
                    })
                }) : Object(s.jsx)(s.Fragment, {})
            }
        }
    }
]);