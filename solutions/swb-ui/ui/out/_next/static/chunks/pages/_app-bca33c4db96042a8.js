(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [888],
  {
    4465: function (e, t, n) {
      'use strict';
      n.d(t, {
        do: function () {
          return U;
        },
        AL: function () {
          return E;
        }
      });
      var i,
        r = [],
        o = 'ResizeObserver loop completed with undelivered notifications.';
      !(function (e) {
        (e.BORDER_BOX = 'border-box'),
          (e.CONTENT_BOX = 'content-box'),
          (e.DEVICE_PIXEL_CONTENT_BOX = 'device-pixel-content-box');
      })(i || (i = {}));
      var a,
        s = function (e) {
          return Object.freeze(e);
        },
        l = function (e, t) {
          (this.inlineSize = e), (this.blockSize = t), s(this);
        },
        u = (function () {
          function e(e, t, n, i) {
            return (
              (this.x = e),
              (this.y = t),
              (this.width = n),
              (this.height = i),
              (this.top = this.y),
              (this.left = this.x),
              (this.bottom = this.top + this.height),
              (this.right = this.left + this.width),
              s(this)
            );
          }
          return (
            (e.prototype.toJSON = function () {
              var e = this;
              return {
                x: e.x,
                y: e.y,
                top: e.top,
                right: e.right,
                bottom: e.bottom,
                left: e.left,
                width: e.width,
                height: e.height
              };
            }),
            (e.fromRect = function (t) {
              return new e(t.x, t.y, t.width, t.height);
            }),
            e
          );
        })(),
        c = function (e) {
          return e instanceof SVGElement && 'getBBox' in e;
        },
        f = function (e) {
          if (c(e)) {
            var t = e.getBBox(),
              n = t.width,
              i = t.height;
            return !n && !i;
          }
          var r = e,
            o = r.offsetWidth,
            a = r.offsetHeight;
          return !(o || a || e.getClientRects().length);
        },
        d = function (e) {
          var t, n;
          if (e instanceof Element) return !0;
          var i =
            null === (n = null === (t = e) || void 0 === t ? void 0 : t.ownerDocument) || void 0 === n
              ? void 0
              : n.defaultView;
          return !!(i && e instanceof i.Element);
        },
        h = 'undefined' !== typeof window ? window : {},
        p = new WeakMap(),
        v = /auto|scroll/,
        _ = /^tb|vertical/,
        m = /msie|trident/i.test(h.navigator && h.navigator.userAgent),
        g = function (e) {
          return parseFloat(e || '0');
        },
        w = function (e, t, n) {
          return (
            void 0 === e && (e = 0),
            void 0 === t && (t = 0),
            void 0 === n && (n = !1),
            new l((n ? t : e) || 0, (n ? e : t) || 0)
          );
        },
        y = s({
          devicePixelContentBoxSize: w(),
          borderBoxSize: w(),
          contentBoxSize: w(),
          contentRect: new u(0, 0, 0, 0)
        }),
        b = function (e, t) {
          if ((void 0 === t && (t = !1), p.has(e) && !t)) return p.get(e);
          if (f(e)) return p.set(e, y), y;
          var n = getComputedStyle(e),
            i = c(e) && e.ownerSVGElement && e.getBBox(),
            r = !m && 'border-box' === n.boxSizing,
            o = _.test(n.writingMode || ''),
            a = !i && v.test(n.overflowY || ''),
            l = !i && v.test(n.overflowX || ''),
            d = i ? 0 : g(n.paddingTop),
            h = i ? 0 : g(n.paddingRight),
            b = i ? 0 : g(n.paddingBottom),
            x = i ? 0 : g(n.paddingLeft),
            E = i ? 0 : g(n.borderTopWidth),
            k = i ? 0 : g(n.borderRightWidth),
            C = i ? 0 : g(n.borderBottomWidth),
            S = x + h,
            N = d + b,
            j = (i ? 0 : g(n.borderLeftWidth)) + k,
            z = E + C,
            O = l ? e.offsetHeight - z - e.clientHeight : 0,
            T = a ? e.offsetWidth - j - e.clientWidth : 0,
            R = r ? S + j : 0,
            B = r ? N + z : 0,
            A = i ? i.width : g(n.width) - R - T,
            L = i ? i.height : g(n.height) - B - O,
            P = A + S + T + j,
            Z = L + N + O + z,
            M = s({
              devicePixelContentBoxSize: w(
                Math.round(A * devicePixelRatio),
                Math.round(L * devicePixelRatio),
                o
              ),
              borderBoxSize: w(P, Z, o),
              contentBoxSize: w(A, L, o),
              contentRect: new u(x, d, A, L)
            });
          return p.set(e, M), M;
        },
        x = function (e, t, n) {
          var r = b(e, n),
            o = r.borderBoxSize,
            a = r.contentBoxSize,
            s = r.devicePixelContentBoxSize;
          switch (t) {
            case i.DEVICE_PIXEL_CONTENT_BOX:
              return s;
            case i.BORDER_BOX:
              return o;
            default:
              return a;
          }
        },
        E = function (e) {
          var t = b(e);
          (this.target = e),
            (this.contentRect = t.contentRect),
            (this.borderBoxSize = s([t.borderBoxSize])),
            (this.contentBoxSize = s([t.contentBoxSize])),
            (this.devicePixelContentBoxSize = s([t.devicePixelContentBoxSize]));
        },
        k = function (e) {
          if (f(e)) return 1 / 0;
          for (var t = 0, n = e.parentNode; n; ) (t += 1), (n = n.parentNode);
          return t;
        },
        C = function () {
          var e = 1 / 0,
            t = [];
          r.forEach(function (n) {
            if (0 !== n.activeTargets.length) {
              var i = [];
              n.activeTargets.forEach(function (t) {
                var n = new E(t.target),
                  r = k(t.target);
                i.push(n), (t.lastReportedSize = x(t.target, t.observedBox)), r < e && (e = r);
              }),
                t.push(function () {
                  n.callback.call(n.observer, i, n.observer);
                }),
                n.activeTargets.splice(0, n.activeTargets.length);
            }
          });
          for (var n = 0, i = t; n < i.length; n++) {
            (0, i[n])();
          }
          return e;
        },
        S = function (e) {
          r.forEach(function (t) {
            t.activeTargets.splice(0, t.activeTargets.length),
              t.skippedTargets.splice(0, t.skippedTargets.length),
              t.observationTargets.forEach(function (n) {
                n.isActive() && (k(n.target) > e ? t.activeTargets.push(n) : t.skippedTargets.push(n));
              });
          });
        },
        N = function () {
          var e = 0;
          for (
            S(e);
            r.some(function (e) {
              return e.activeTargets.length > 0;
            });

          )
            (e = C()), S(e);
          return (
            r.some(function (e) {
              return e.skippedTargets.length > 0;
            }) &&
              (function () {
                var e;
                'function' === typeof ErrorEvent
                  ? (e = new ErrorEvent('error', { message: o }))
                  : ((e = document.createEvent('Event')).initEvent('error', !1, !1), (e.message = o)),
                  window.dispatchEvent(e);
              })(),
            e > 0
          );
        },
        j = [],
        z = function (e) {
          if (!a) {
            var t = 0,
              n = document.createTextNode('');
            new MutationObserver(function () {
              return j.splice(0).forEach(function (e) {
                return e();
              });
            }).observe(n, { characterData: !0 }),
              (a = function () {
                n.textContent = '' + (t ? t-- : t++);
              });
          }
          j.push(e), a();
        },
        O = 0,
        T = { attributes: !0, characterData: !0, childList: !0, subtree: !0 },
        R = [
          'resize',
          'load',
          'transitionend',
          'animationend',
          'animationstart',
          'animationiteration',
          'keyup',
          'keydown',
          'mouseup',
          'mousedown',
          'mouseover',
          'mouseout',
          'blur',
          'focus'
        ],
        B = function (e) {
          return void 0 === e && (e = 0), Date.now() + e;
        },
        A = !1,
        L = new ((function () {
          function e() {
            var e = this;
            (this.stopped = !0),
              (this.listener = function () {
                return e.schedule();
              });
          }
          return (
            (e.prototype.run = function (e) {
              var t = this;
              if ((void 0 === e && (e = 250), !A)) {
                A = !0;
                var n,
                  i = B(e);
                (n = function () {
                  var n = !1;
                  try {
                    n = N();
                  } finally {
                    if (((A = !1), (e = i - B()), !O)) return;
                    n ? t.run(1e3) : e > 0 ? t.run(e) : t.start();
                  }
                }),
                  z(function () {
                    requestAnimationFrame(n);
                  });
              }
            }),
            (e.prototype.schedule = function () {
              this.stop(), this.run();
            }),
            (e.prototype.observe = function () {
              var e = this,
                t = function () {
                  return e.observer && e.observer.observe(document.body, T);
                };
              document.body ? t() : h.addEventListener('DOMContentLoaded', t);
            }),
            (e.prototype.start = function () {
              var e = this;
              this.stopped &&
                ((this.stopped = !1),
                (this.observer = new MutationObserver(this.listener)),
                this.observe(),
                R.forEach(function (t) {
                  return h.addEventListener(t, e.listener, !0);
                }));
            }),
            (e.prototype.stop = function () {
              var e = this;
              this.stopped ||
                (this.observer && this.observer.disconnect(),
                R.forEach(function (t) {
                  return h.removeEventListener(t, e.listener, !0);
                }),
                (this.stopped = !0));
            }),
            e
          );
        })())(),
        P = function (e) {
          !O && e > 0 && L.start(), !(O += e) && L.stop();
        },
        Z = (function () {
          function e(e, t) {
            (this.target = e),
              (this.observedBox = t || i.CONTENT_BOX),
              (this.lastReportedSize = { inlineSize: 0, blockSize: 0 });
          }
          return (
            (e.prototype.isActive = function () {
              var e,
                t = x(this.target, this.observedBox, !0);
              return (
                (e = this.target),
                c(e) ||
                  (function (e) {
                    switch (e.tagName) {
                      case 'INPUT':
                        if ('image' !== e.type) break;
                      case 'VIDEO':
                      case 'AUDIO':
                      case 'EMBED':
                      case 'OBJECT':
                      case 'CANVAS':
                      case 'IFRAME':
                      case 'IMG':
                        return !0;
                    }
                    return !1;
                  })(e) ||
                  'inline' !== getComputedStyle(e).display ||
                  (this.lastReportedSize = t),
                this.lastReportedSize.inlineSize !== t.inlineSize ||
                  this.lastReportedSize.blockSize !== t.blockSize
              );
            }),
            e
          );
        })(),
        M = function (e, t) {
          (this.activeTargets = []),
            (this.skippedTargets = []),
            (this.observationTargets = []),
            (this.observer = e),
            (this.callback = t);
        },
        I = new WeakMap(),
        H = function (e, t) {
          for (var n = 0; n < e.length; n += 1) if (e[n].target === t) return n;
          return -1;
        },
        D = (function () {
          function e() {}
          return (
            (e.connect = function (e, t) {
              var n = new M(e, t);
              I.set(e, n);
            }),
            (e.observe = function (e, t, n) {
              var i = I.get(e),
                o = 0 === i.observationTargets.length;
              H(i.observationTargets, t) < 0 &&
                (o && r.push(i), i.observationTargets.push(new Z(t, n && n.box)), P(1), L.schedule());
            }),
            (e.unobserve = function (e, t) {
              var n = I.get(e),
                i = H(n.observationTargets, t),
                o = 1 === n.observationTargets.length;
              i >= 0 && (o && r.splice(r.indexOf(n), 1), n.observationTargets.splice(i, 1), P(-1));
            }),
            (e.disconnect = function (e) {
              var t = this,
                n = I.get(e);
              n.observationTargets.slice().forEach(function (n) {
                return t.unobserve(e, n.target);
              }),
                n.activeTargets.splice(0, n.activeTargets.length);
            }),
            e
          );
        })(),
        U = (function () {
          function e(e) {
            if (0 === arguments.length)
              throw new TypeError(
                "Failed to construct 'ResizeObserver': 1 argument required, but only 0 present."
              );
            if ('function' !== typeof e)
              throw new TypeError(
                "Failed to construct 'ResizeObserver': The callback provided as parameter 1 is not a function."
              );
            D.connect(this, e);
          }
          return (
            (e.prototype.observe = function (e, t) {
              if (0 === arguments.length)
                throw new TypeError(
                  "Failed to execute 'observe' on 'ResizeObserver': 1 argument required, but only 0 present."
                );
              if (!d(e))
                throw new TypeError(
                  "Failed to execute 'observe' on 'ResizeObserver': parameter 1 is not of type 'Element"
                );
              D.observe(this, e, t);
            }),
            (e.prototype.unobserve = function (e) {
              if (0 === arguments.length)
                throw new TypeError(
                  "Failed to execute 'unobserve' on 'ResizeObserver': 1 argument required, but only 0 present."
                );
              if (!d(e))
                throw new TypeError(
                  "Failed to execute 'unobserve' on 'ResizeObserver': parameter 1 is not of type 'Element"
                );
              D.unobserve(this, e);
            }),
            (e.prototype.disconnect = function () {
              D.disconnect(this);
            }),
            (e.toString = function () {
              return 'function ResizeObserver () { [polyfill code] }';
            }),
            e
          );
        })();
    },
    4266: function (e, t, n) {
      e.exports = n(580);
    },
    6853: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = n(4845),
        o = n(3968),
        a = n(6091),
        s = n(493),
        l = n(8596),
        u = n(2169),
        c = n(5110),
        f = n(7279),
        d = n(8026),
        h = n(2130);
      e.exports = function (e) {
        return new Promise(function (t, n) {
          var p,
            v = e.data,
            _ = e.headers,
            m = e.responseType;
          function g() {
            e.cancelToken && e.cancelToken.unsubscribe(p),
              e.signal && e.signal.removeEventListener('abort', p);
          }
          i.isFormData(v) && i.isStandardBrowserEnv() && delete _['Content-Type'];
          var w = new XMLHttpRequest();
          if (e.auth) {
            var y = e.auth.username || '',
              b = e.auth.password ? unescape(encodeURIComponent(e.auth.password)) : '';
            _.Authorization = 'Basic ' + btoa(y + ':' + b);
          }
          var x = s(e.baseURL, e.url);
          function E() {
            if (w) {
              var i = 'getAllResponseHeaders' in w ? l(w.getAllResponseHeaders()) : null,
                o = {
                  data: m && 'text' !== m && 'json' !== m ? w.response : w.responseText,
                  status: w.status,
                  statusText: w.statusText,
                  headers: i,
                  config: e,
                  request: w
                };
              r(
                function (e) {
                  t(e), g();
                },
                function (e) {
                  n(e), g();
                },
                o
              ),
                (w = null);
            }
          }
          if (
            (w.open(e.method.toUpperCase(), a(x, e.params, e.paramsSerializer), !0),
            (w.timeout = e.timeout),
            'onloadend' in w
              ? (w.onloadend = E)
              : (w.onreadystatechange = function () {
                  w &&
                    4 === w.readyState &&
                    (0 !== w.status || (w.responseURL && 0 === w.responseURL.indexOf('file:'))) &&
                    setTimeout(E);
                }),
            (w.onabort = function () {
              w && (n(new f('Request aborted', f.ECONNABORTED, e, w)), (w = null));
            }),
            (w.onerror = function () {
              n(new f('Network Error', f.ERR_NETWORK, e, w, w)), (w = null);
            }),
            (w.ontimeout = function () {
              var t = e.timeout ? 'timeout of ' + e.timeout + 'ms exceeded' : 'timeout exceeded',
                i = e.transitional || c;
              e.timeoutErrorMessage && (t = e.timeoutErrorMessage),
                n(new f(t, i.clarifyTimeoutError ? f.ETIMEDOUT : f.ECONNABORTED, e, w)),
                (w = null);
            }),
            i.isStandardBrowserEnv())
          ) {
            var k = (e.withCredentials || u(x)) && e.xsrfCookieName ? o.read(e.xsrfCookieName) : void 0;
            k && (_[e.xsrfHeaderName] = k);
          }
          'setRequestHeader' in w &&
            i.forEach(_, function (e, t) {
              'undefined' === typeof v && 'content-type' === t.toLowerCase()
                ? delete _[t]
                : w.setRequestHeader(t, e);
            }),
            i.isUndefined(e.withCredentials) || (w.withCredentials = !!e.withCredentials),
            m && 'json' !== m && (w.responseType = e.responseType),
            'function' === typeof e.onDownloadProgress &&
              w.addEventListener('progress', e.onDownloadProgress),
            'function' === typeof e.onUploadProgress &&
              w.upload &&
              w.upload.addEventListener('progress', e.onUploadProgress),
            (e.cancelToken || e.signal) &&
              ((p = function (e) {
                w && (n(!e || (e && e.type) ? new d() : e), w.abort(), (w = null));
              }),
              e.cancelToken && e.cancelToken.subscribe(p),
              e.signal && (e.signal.aborted ? p() : e.signal.addEventListener('abort', p))),
            v || (v = null);
          var C = h(x);
          C && -1 === ['http', 'https', 'file'].indexOf(C)
            ? n(new f('Unsupported protocol ' + C + ':', f.ERR_BAD_REQUEST, e))
            : w.send(v);
        });
      };
    },
    580: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = n(9785),
        o = n(2547),
        a = n(1356);
      var s = (function e(t) {
        var n = new o(t),
          s = r(o.prototype.request, n);
        return (
          i.extend(s, o.prototype, n),
          i.extend(s, n),
          (s.create = function (n) {
            return e(a(t, n));
          }),
          s
        );
      })(n(6727));
      (s.Axios = o),
        (s.CanceledError = n(8026)),
        (s.CancelToken = n(2605)),
        (s.isCancel = n(9341)),
        (s.VERSION = n(8329).version),
        (s.toFormData = n(8803)),
        (s.AxiosError = n(7279)),
        (s.Cancel = s.CanceledError),
        (s.all = function (e) {
          return Promise.all(e);
        }),
        (s.spread = n(9853)),
        (s.isAxiosError = n(9421)),
        (e.exports = s),
        (e.exports.default = s);
    },
    2605: function (e, t, n) {
      'use strict';
      var i = n(8026);
      function r(e) {
        if ('function' !== typeof e) throw new TypeError('executor must be a function.');
        var t;
        this.promise = new Promise(function (e) {
          t = e;
        });
        var n = this;
        this.promise.then(function (e) {
          if (n._listeners) {
            var t,
              i = n._listeners.length;
            for (t = 0; t < i; t++) n._listeners[t](e);
            n._listeners = null;
          }
        }),
          (this.promise.then = function (e) {
            var t,
              i = new Promise(function (e) {
                n.subscribe(e), (t = e);
              }).then(e);
            return (
              (i.cancel = function () {
                n.unsubscribe(t);
              }),
              i
            );
          }),
          e(function (e) {
            n.reason || ((n.reason = new i(e)), t(n.reason));
          });
      }
      (r.prototype.throwIfRequested = function () {
        if (this.reason) throw this.reason;
      }),
        (r.prototype.subscribe = function (e) {
          this.reason ? e(this.reason) : this._listeners ? this._listeners.push(e) : (this._listeners = [e]);
        }),
        (r.prototype.unsubscribe = function (e) {
          if (this._listeners) {
            var t = this._listeners.indexOf(e);
            -1 !== t && this._listeners.splice(t, 1);
          }
        }),
        (r.source = function () {
          var e;
          return {
            token: new r(function (t) {
              e = t;
            }),
            cancel: e
          };
        }),
        (e.exports = r);
    },
    8026: function (e, t, n) {
      'use strict';
      var i = n(7279);
      function r(e) {
        i.call(this, null == e ? 'canceled' : e, i.ERR_CANCELED), (this.name = 'CanceledError');
      }
      n(5928).inherits(r, i, { __CANCEL__: !0 }), (e.exports = r);
    },
    9341: function (e) {
      'use strict';
      e.exports = function (e) {
        return !(!e || !e.__CANCEL__);
      };
    },
    2547: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = n(6091),
        o = n(3188),
        a = n(2039),
        s = n(1356),
        l = n(493),
        u = n(312),
        c = u.validators;
      function f(e) {
        (this.defaults = e), (this.interceptors = { request: new o(), response: new o() });
      }
      (f.prototype.request = function (e, t) {
        'string' === typeof e ? ((t = t || {}).url = e) : (t = e || {}),
          (t = s(this.defaults, t)).method
            ? (t.method = t.method.toLowerCase())
            : this.defaults.method
            ? (t.method = this.defaults.method.toLowerCase())
            : (t.method = 'get');
        var n = t.transitional;
        void 0 !== n &&
          u.assertOptions(
            n,
            {
              silentJSONParsing: c.transitional(c.boolean),
              forcedJSONParsing: c.transitional(c.boolean),
              clarifyTimeoutError: c.transitional(c.boolean)
            },
            !1
          );
        var i = [],
          r = !0;
        this.interceptors.request.forEach(function (e) {
          ('function' === typeof e.runWhen && !1 === e.runWhen(t)) ||
            ((r = r && e.synchronous), i.unshift(e.fulfilled, e.rejected));
        });
        var o,
          l = [];
        if (
          (this.interceptors.response.forEach(function (e) {
            l.push(e.fulfilled, e.rejected);
          }),
          !r)
        ) {
          var f = [a, void 0];
          for (Array.prototype.unshift.apply(f, i), f = f.concat(l), o = Promise.resolve(t); f.length; )
            o = o.then(f.shift(), f.shift());
          return o;
        }
        for (var d = t; i.length; ) {
          var h = i.shift(),
            p = i.shift();
          try {
            d = h(d);
          } catch (v) {
            p(v);
            break;
          }
        }
        try {
          o = a(d);
        } catch (v) {
          return Promise.reject(v);
        }
        for (; l.length; ) o = o.then(l.shift(), l.shift());
        return o;
      }),
        (f.prototype.getUri = function (e) {
          e = s(this.defaults, e);
          var t = l(e.baseURL, e.url);
          return r(t, e.params, e.paramsSerializer);
        }),
        i.forEach(['delete', 'get', 'head', 'options'], function (e) {
          f.prototype[e] = function (t, n) {
            return this.request(s(n || {}, { method: e, url: t, data: (n || {}).data }));
          };
        }),
        i.forEach(['post', 'put', 'patch'], function (e) {
          function t(t) {
            return function (n, i, r) {
              return this.request(
                s(r || {}, {
                  method: e,
                  headers: t ? { 'Content-Type': 'multipart/form-data' } : {},
                  url: n,
                  data: i
                })
              );
            };
          }
          (f.prototype[e] = t()), (f.prototype[e + 'Form'] = t(!0));
        }),
        (e.exports = f);
    },
    7279: function (e, t, n) {
      'use strict';
      var i = n(5928);
      function r(e, t, n, i, r) {
        Error.call(this),
          (this.message = e),
          (this.name = 'AxiosError'),
          t && (this.code = t),
          n && (this.config = n),
          i && (this.request = i),
          r && (this.response = r);
      }
      i.inherits(r, Error, {
        toJSON: function () {
          return {
            message: this.message,
            name: this.name,
            description: this.description,
            number: this.number,
            fileName: this.fileName,
            lineNumber: this.lineNumber,
            columnNumber: this.columnNumber,
            stack: this.stack,
            config: this.config,
            code: this.code,
            status: this.response && this.response.status ? this.response.status : null
          };
        }
      });
      var o = r.prototype,
        a = {};
      [
        'ERR_BAD_OPTION_VALUE',
        'ERR_BAD_OPTION',
        'ECONNABORTED',
        'ETIMEDOUT',
        'ERR_NETWORK',
        'ERR_FR_TOO_MANY_REDIRECTS',
        'ERR_DEPRECATED',
        'ERR_BAD_RESPONSE',
        'ERR_BAD_REQUEST',
        'ERR_CANCELED'
      ].forEach(function (e) {
        a[e] = { value: e };
      }),
        Object.defineProperties(r, a),
        Object.defineProperty(o, 'isAxiosError', { value: !0 }),
        (r.from = function (e, t, n, a, s, l) {
          var u = Object.create(o);
          return (
            i.toFlatObject(e, u, function (e) {
              return e !== Error.prototype;
            }),
            r.call(u, e.message, t, n, a, s),
            (u.name = e.name),
            l && Object.assign(u, l),
            u
          );
        }),
        (e.exports = r);
    },
    3188: function (e, t, n) {
      'use strict';
      var i = n(5928);
      function r() {
        this.handlers = [];
      }
      (r.prototype.use = function (e, t, n) {
        return (
          this.handlers.push({
            fulfilled: e,
            rejected: t,
            synchronous: !!n && n.synchronous,
            runWhen: n ? n.runWhen : null
          }),
          this.handlers.length - 1
        );
      }),
        (r.prototype.eject = function (e) {
          this.handlers[e] && (this.handlers[e] = null);
        }),
        (r.prototype.forEach = function (e) {
          i.forEach(this.handlers, function (t) {
            null !== t && e(t);
          });
        }),
        (e.exports = r);
    },
    493: function (e, t, n) {
      'use strict';
      var i = n(1445),
        r = n(8016);
      e.exports = function (e, t) {
        return e && !i(t) ? r(e, t) : t;
      };
    },
    2039: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = n(5591),
        o = n(9341),
        a = n(6727),
        s = n(8026);
      function l(e) {
        if ((e.cancelToken && e.cancelToken.throwIfRequested(), e.signal && e.signal.aborted)) throw new s();
      }
      e.exports = function (e) {
        return (
          l(e),
          (e.headers = e.headers || {}),
          (e.data = r.call(e, e.data, e.headers, e.transformRequest)),
          (e.headers = i.merge(e.headers.common || {}, e.headers[e.method] || {}, e.headers)),
          i.forEach(['delete', 'get', 'head', 'post', 'put', 'patch', 'common'], function (t) {
            delete e.headers[t];
          }),
          (e.adapter || a.adapter)(e).then(
            function (t) {
              return l(e), (t.data = r.call(e, t.data, t.headers, e.transformResponse)), t;
            },
            function (t) {
              return (
                o(t) ||
                  (l(e),
                  t &&
                    t.response &&
                    (t.response.data = r.call(e, t.response.data, t.response.headers, e.transformResponse))),
                Promise.reject(t)
              );
            }
          )
        );
      };
    },
    1356: function (e, t, n) {
      'use strict';
      var i = n(5928);
      e.exports = function (e, t) {
        t = t || {};
        var n = {};
        function r(e, t) {
          return i.isPlainObject(e) && i.isPlainObject(t)
            ? i.merge(e, t)
            : i.isPlainObject(t)
            ? i.merge({}, t)
            : i.isArray(t)
            ? t.slice()
            : t;
        }
        function o(n) {
          return i.isUndefined(t[n]) ? (i.isUndefined(e[n]) ? void 0 : r(void 0, e[n])) : r(e[n], t[n]);
        }
        function a(e) {
          if (!i.isUndefined(t[e])) return r(void 0, t[e]);
        }
        function s(n) {
          return i.isUndefined(t[n]) ? (i.isUndefined(e[n]) ? void 0 : r(void 0, e[n])) : r(void 0, t[n]);
        }
        function l(n) {
          return n in t ? r(e[n], t[n]) : n in e ? r(void 0, e[n]) : void 0;
        }
        var u = {
          url: a,
          method: a,
          data: a,
          baseURL: s,
          transformRequest: s,
          transformResponse: s,
          paramsSerializer: s,
          timeout: s,
          timeoutMessage: s,
          withCredentials: s,
          adapter: s,
          responseType: s,
          xsrfCookieName: s,
          xsrfHeaderName: s,
          onUploadProgress: s,
          onDownloadProgress: s,
          decompress: s,
          maxContentLength: s,
          maxBodyLength: s,
          beforeRedirect: s,
          transport: s,
          httpAgent: s,
          httpsAgent: s,
          cancelToken: s,
          socketPath: s,
          responseEncoding: s,
          validateStatus: l
        };
        return (
          i.forEach(Object.keys(e).concat(Object.keys(t)), function (e) {
            var t = u[e] || o,
              r = t(e);
            (i.isUndefined(r) && t !== l) || (n[e] = r);
          }),
          n
        );
      };
    },
    4845: function (e, t, n) {
      'use strict';
      var i = n(7279);
      e.exports = function (e, t, n) {
        var r = n.config.validateStatus;
        n.status && r && !r(n.status)
          ? t(
              new i(
                'Request failed with status code ' + n.status,
                [i.ERR_BAD_REQUEST, i.ERR_BAD_RESPONSE][Math.floor(n.status / 100) - 4],
                n.config,
                n.request,
                n
              )
            )
          : e(n);
      };
    },
    5591: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = n(6727);
      e.exports = function (e, t, n) {
        var o = this || r;
        return (
          i.forEach(n, function (n) {
            e = n.call(o, e, t);
          }),
          e
        );
      };
    },
    6727: function (e, t, n) {
      'use strict';
      var i = n(2568),
        r = n(5928),
        o = n(7802),
        a = n(7279),
        s = n(5110),
        l = n(8803),
        u = { 'Content-Type': 'application/x-www-form-urlencoded' };
      function c(e, t) {
        !r.isUndefined(e) && r.isUndefined(e['Content-Type']) && (e['Content-Type'] = t);
      }
      var f = {
        transitional: s,
        adapter: (function () {
          var e;
          return (
            ('undefined' !== typeof XMLHttpRequest ||
              ('undefined' !== typeof i && '[object process]' === Object.prototype.toString.call(i))) &&
              (e = n(6853)),
            e
          );
        })(),
        transformRequest: [
          function (e, t) {
            if (
              (o(t, 'Accept'),
              o(t, 'Content-Type'),
              r.isFormData(e) ||
                r.isArrayBuffer(e) ||
                r.isBuffer(e) ||
                r.isStream(e) ||
                r.isFile(e) ||
                r.isBlob(e))
            )
              return e;
            if (r.isArrayBufferView(e)) return e.buffer;
            if (r.isURLSearchParams(e))
              return c(t, 'application/x-www-form-urlencoded;charset=utf-8'), e.toString();
            var n,
              i = r.isObject(e),
              a = t && t['Content-Type'];
            if ((n = r.isFileList(e)) || (i && 'multipart/form-data' === a)) {
              var s = this.env && this.env.FormData;
              return l(n ? { 'files[]': e } : e, s && new s());
            }
            return i || 'application/json' === a
              ? (c(t, 'application/json'),
                (function (e, t, n) {
                  if (r.isString(e))
                    try {
                      return (t || JSON.parse)(e), r.trim(e);
                    } catch (i) {
                      if ('SyntaxError' !== i.name) throw i;
                    }
                  return (n || JSON.stringify)(e);
                })(e))
              : e;
          }
        ],
        transformResponse: [
          function (e) {
            var t = this.transitional || f.transitional,
              n = t && t.silentJSONParsing,
              i = t && t.forcedJSONParsing,
              o = !n && 'json' === this.responseType;
            if (o || (i && r.isString(e) && e.length))
              try {
                return JSON.parse(e);
              } catch (s) {
                if (o) {
                  if ('SyntaxError' === s.name)
                    throw a.from(s, a.ERR_BAD_RESPONSE, this, null, this.response);
                  throw s;
                }
              }
            return e;
          }
        ],
        timeout: 0,
        xsrfCookieName: 'XSRF-TOKEN',
        xsrfHeaderName: 'X-XSRF-TOKEN',
        maxContentLength: -1,
        maxBodyLength: -1,
        env: { FormData: n(3021) },
        validateStatus: function (e) {
          return e >= 200 && e < 300;
        },
        headers: { common: { Accept: 'application/json, text/plain, */*' } }
      };
      r.forEach(['delete', 'get', 'head'], function (e) {
        f.headers[e] = {};
      }),
        r.forEach(['post', 'put', 'patch'], function (e) {
          f.headers[e] = r.merge(u);
        }),
        (e.exports = f);
    },
    5110: function (e) {
      'use strict';
      e.exports = { silentJSONParsing: !0, forcedJSONParsing: !0, clarifyTimeoutError: !1 };
    },
    8329: function (e) {
      e.exports = { version: '0.27.2' };
    },
    9785: function (e) {
      'use strict';
      e.exports = function (e, t) {
        return function () {
          for (var n = new Array(arguments.length), i = 0; i < n.length; i++) n[i] = arguments[i];
          return e.apply(t, n);
        };
      };
    },
    6091: function (e, t, n) {
      'use strict';
      var i = n(5928);
      function r(e) {
        return encodeURIComponent(e)
          .replace(/%3A/gi, ':')
          .replace(/%24/g, '$')
          .replace(/%2C/gi, ',')
          .replace(/%20/g, '+')
          .replace(/%5B/gi, '[')
          .replace(/%5D/gi, ']');
      }
      e.exports = function (e, t, n) {
        if (!t) return e;
        var o;
        if (n) o = n(t);
        else if (i.isURLSearchParams(t)) o = t.toString();
        else {
          var a = [];
          i.forEach(t, function (e, t) {
            null !== e &&
              'undefined' !== typeof e &&
              (i.isArray(e) ? (t += '[]') : (e = [e]),
              i.forEach(e, function (e) {
                i.isDate(e) ? (e = e.toISOString()) : i.isObject(e) && (e = JSON.stringify(e)),
                  a.push(r(t) + '=' + r(e));
              }));
          }),
            (o = a.join('&'));
        }
        if (o) {
          var s = e.indexOf('#');
          -1 !== s && (e = e.slice(0, s)), (e += (-1 === e.indexOf('?') ? '?' : '&') + o);
        }
        return e;
      };
    },
    8016: function (e) {
      'use strict';
      e.exports = function (e, t) {
        return t ? e.replace(/\/+$/, '') + '/' + t.replace(/^\/+/, '') : e;
      };
    },
    3968: function (e, t, n) {
      'use strict';
      var i = n(5928);
      e.exports = i.isStandardBrowserEnv()
        ? {
            write: function (e, t, n, r, o, a) {
              var s = [];
              s.push(e + '=' + encodeURIComponent(t)),
                i.isNumber(n) && s.push('expires=' + new Date(n).toGMTString()),
                i.isString(r) && s.push('path=' + r),
                i.isString(o) && s.push('domain=' + o),
                !0 === a && s.push('secure'),
                (document.cookie = s.join('; '));
            },
            read: function (e) {
              var t = document.cookie.match(new RegExp('(^|;\\s*)(' + e + ')=([^;]*)'));
              return t ? decodeURIComponent(t[3]) : null;
            },
            remove: function (e) {
              this.write(e, '', Date.now() - 864e5);
            }
          }
        : {
            write: function () {},
            read: function () {
              return null;
            },
            remove: function () {}
          };
    },
    1445: function (e) {
      'use strict';
      e.exports = function (e) {
        return /^([a-z][a-z\d+\-.]*:)?\/\//i.test(e);
      };
    },
    9421: function (e, t, n) {
      'use strict';
      var i = n(5928);
      e.exports = function (e) {
        return i.isObject(e) && !0 === e.isAxiosError;
      };
    },
    2169: function (e, t, n) {
      'use strict';
      var i = n(5928);
      e.exports = i.isStandardBrowserEnv()
        ? (function () {
            var e,
              t = /(msie|trident)/i.test(navigator.userAgent),
              n = document.createElement('a');
            function r(e) {
              var i = e;
              return (
                t && (n.setAttribute('href', i), (i = n.href)),
                n.setAttribute('href', i),
                {
                  href: n.href,
                  protocol: n.protocol ? n.protocol.replace(/:$/, '') : '',
                  host: n.host,
                  search: n.search ? n.search.replace(/^\?/, '') : '',
                  hash: n.hash ? n.hash.replace(/^#/, '') : '',
                  hostname: n.hostname,
                  port: n.port,
                  pathname: '/' === n.pathname.charAt(0) ? n.pathname : '/' + n.pathname
                }
              );
            }
            return (
              (e = r(window.location.href)),
              function (t) {
                var n = i.isString(t) ? r(t) : t;
                return n.protocol === e.protocol && n.host === e.host;
              }
            );
          })()
        : function () {
            return !0;
          };
    },
    7802: function (e, t, n) {
      'use strict';
      var i = n(5928);
      e.exports = function (e, t) {
        i.forEach(e, function (n, i) {
          i !== t && i.toUpperCase() === t.toUpperCase() && ((e[t] = n), delete e[i]);
        });
      };
    },
    3021: function (e) {
      e.exports = null;
    },
    8596: function (e, t, n) {
      'use strict';
      var i = n(5928),
        r = [
          'age',
          'authorization',
          'content-length',
          'content-type',
          'etag',
          'expires',
          'from',
          'host',
          'if-modified-since',
          'if-unmodified-since',
          'last-modified',
          'location',
          'max-forwards',
          'proxy-authorization',
          'referer',
          'retry-after',
          'user-agent'
        ];
      e.exports = function (e) {
        var t,
          n,
          o,
          a = {};
        return e
          ? (i.forEach(e.split('\n'), function (e) {
              if (
                ((o = e.indexOf(':')),
                (t = i.trim(e.substr(0, o)).toLowerCase()),
                (n = i.trim(e.substr(o + 1))),
                t)
              ) {
                if (a[t] && r.indexOf(t) >= 0) return;
                a[t] = 'set-cookie' === t ? (a[t] ? a[t] : []).concat([n]) : a[t] ? a[t] + ', ' + n : n;
              }
            }),
            a)
          : a;
      };
    },
    2130: function (e) {
      'use strict';
      e.exports = function (e) {
        var t = /^([-+\w]{1,25})(:?\/\/|:)/.exec(e);
        return (t && t[1]) || '';
      };
    },
    9853: function (e) {
      'use strict';
      e.exports = function (e) {
        return function (t) {
          return e.apply(null, t);
        };
      };
    },
    8803: function (e, t, n) {
      'use strict';
      var i = n(8328).Buffer,
        r = n(5928);
      e.exports = function (e, t) {
        t = t || new FormData();
        var n = [];
        function o(e) {
          return null === e
            ? ''
            : r.isDate(e)
            ? e.toISOString()
            : r.isArrayBuffer(e) || r.isTypedArray(e)
            ? 'function' === typeof Blob
              ? new Blob([e])
              : i.from(e)
            : e;
        }
        return (
          (function e(i, a) {
            if (r.isPlainObject(i) || r.isArray(i)) {
              if (-1 !== n.indexOf(i)) throw Error('Circular reference detected in ' + a);
              n.push(i),
                r.forEach(i, function (n, i) {
                  if (!r.isUndefined(n)) {
                    var s,
                      l = a ? a + '.' + i : i;
                    if (n && !a && 'object' === typeof n)
                      if (r.endsWith(i, '{}')) n = JSON.stringify(n);
                      else if (r.endsWith(i, '[]') && (s = r.toArray(n)))
                        return void s.forEach(function (e) {
                          !r.isUndefined(e) && t.append(l, o(e));
                        });
                    e(n, l);
                  }
                }),
                n.pop();
            } else t.append(a, o(i));
          })(e),
          t
        );
      };
    },
    312: function (e, t, n) {
      'use strict';
      var i = n(8329).version,
        r = n(7279),
        o = {};
      ['object', 'boolean', 'number', 'function', 'string', 'symbol'].forEach(function (e, t) {
        o[e] = function (n) {
          return typeof n === e || 'a' + (t < 1 ? 'n ' : ' ') + e;
        };
      });
      var a = {};
      (o.transitional = function (e, t, n) {
        function o(e, t) {
          return '[Axios v' + i + "] Transitional option '" + e + "'" + t + (n ? '. ' + n : '');
        }
        return function (n, i, s) {
          if (!1 === e) throw new r(o(i, ' has been removed' + (t ? ' in ' + t : '')), r.ERR_DEPRECATED);
          return (
            t &&
              !a[i] &&
              ((a[i] = !0),
              console.warn(
                o(i, ' has been deprecated since v' + t + ' and will be removed in the near future')
              )),
            !e || e(n, i, s)
          );
        };
      }),
        (e.exports = {
          assertOptions: function (e, t, n) {
            if ('object' !== typeof e) throw new r('options must be an object', r.ERR_BAD_OPTION_VALUE);
            for (var i = Object.keys(e), o = i.length; o-- > 0; ) {
              var a = i[o],
                s = t[a];
              if (s) {
                var l = e[a],
                  u = void 0 === l || s(l, a, e);
                if (!0 !== u) throw new r('option ' + a + ' must be ' + u, r.ERR_BAD_OPTION_VALUE);
              } else if (!0 !== n) throw new r('Unknown option ' + a, r.ERR_BAD_OPTION);
            }
          },
          validators: o
        });
    },
    5928: function (e, t, n) {
      'use strict';
      var i,
        r = n(9785),
        o = Object.prototype.toString,
        a =
          ((i = Object.create(null)),
          function (e) {
            var t = o.call(e);
            return i[t] || (i[t] = t.slice(8, -1).toLowerCase());
          });
      function s(e) {
        return (
          (e = e.toLowerCase()),
          function (t) {
            return a(t) === e;
          }
        );
      }
      function l(e) {
        return Array.isArray(e);
      }
      function u(e) {
        return 'undefined' === typeof e;
      }
      var c = s('ArrayBuffer');
      function f(e) {
        return null !== e && 'object' === typeof e;
      }
      function d(e) {
        if ('object' !== a(e)) return !1;
        var t = Object.getPrototypeOf(e);
        return null === t || t === Object.prototype;
      }
      var h = s('Date'),
        p = s('File'),
        v = s('Blob'),
        _ = s('FileList');
      function m(e) {
        return '[object Function]' === o.call(e);
      }
      var g = s('URLSearchParams');
      function w(e, t) {
        if (null !== e && 'undefined' !== typeof e)
          if (('object' !== typeof e && (e = [e]), l(e)))
            for (var n = 0, i = e.length; n < i; n++) t.call(null, e[n], n, e);
          else for (var r in e) Object.prototype.hasOwnProperty.call(e, r) && t.call(null, e[r], r, e);
      }
      var y,
        b =
          ((y = 'undefined' !== typeof Uint8Array && Object.getPrototypeOf(Uint8Array)),
          function (e) {
            return y && e instanceof y;
          });
      e.exports = {
        isArray: l,
        isArrayBuffer: c,
        isBuffer: function (e) {
          return (
            null !== e &&
            !u(e) &&
            null !== e.constructor &&
            !u(e.constructor) &&
            'function' === typeof e.constructor.isBuffer &&
            e.constructor.isBuffer(e)
          );
        },
        isFormData: function (e) {
          var t = '[object FormData]';
          return (
            e &&
            (('function' === typeof FormData && e instanceof FormData) ||
              o.call(e) === t ||
              (m(e.toString) && e.toString() === t))
          );
        },
        isArrayBufferView: function (e) {
          return 'undefined' !== typeof ArrayBuffer && ArrayBuffer.isView
            ? ArrayBuffer.isView(e)
            : e && e.buffer && c(e.buffer);
        },
        isString: function (e) {
          return 'string' === typeof e;
        },
        isNumber: function (e) {
          return 'number' === typeof e;
        },
        isObject: f,
        isPlainObject: d,
        isUndefined: u,
        isDate: h,
        isFile: p,
        isBlob: v,
        isFunction: m,
        isStream: function (e) {
          return f(e) && m(e.pipe);
        },
        isURLSearchParams: g,
        isStandardBrowserEnv: function () {
          return (
            ('undefined' === typeof navigator ||
              ('ReactNative' !== navigator.product &&
                'NativeScript' !== navigator.product &&
                'NS' !== navigator.product)) &&
            'undefined' !== typeof window &&
            'undefined' !== typeof document
          );
        },
        forEach: w,
        merge: function e() {
          var t = {};
          function n(n, i) {
            d(t[i]) && d(n)
              ? (t[i] = e(t[i], n))
              : d(n)
              ? (t[i] = e({}, n))
              : l(n)
              ? (t[i] = n.slice())
              : (t[i] = n);
          }
          for (var i = 0, r = arguments.length; i < r; i++) w(arguments[i], n);
          return t;
        },
        extend: function (e, t, n) {
          return (
            w(t, function (t, i) {
              e[i] = n && 'function' === typeof t ? r(t, n) : t;
            }),
            e
          );
        },
        trim: function (e) {
          return e.trim ? e.trim() : e.replace(/^\s+|\s+$/g, '');
        },
        stripBOM: function (e) {
          return 65279 === e.charCodeAt(0) && (e = e.slice(1)), e;
        },
        inherits: function (e, t, n, i) {
          (e.prototype = Object.create(t.prototype, i)),
            (e.prototype.constructor = e),
            n && Object.assign(e.prototype, n);
        },
        toFlatObject: function (e, t, n) {
          var i,
            r,
            o,
            a = {};
          t = t || {};
          do {
            for (r = (i = Object.getOwnPropertyNames(e)).length; r-- > 0; )
              a[(o = i[r])] || ((t[o] = e[o]), (a[o] = !0));
            e = Object.getPrototypeOf(e);
          } while (e && (!n || n(e, t)) && e !== Object.prototype);
          return t;
        },
        kindOf: a,
        kindOfTest: s,
        endsWith: function (e, t, n) {
          (e = String(e)), (void 0 === n || n > e.length) && (n = e.length), (n -= t.length);
          var i = e.indexOf(t, n);
          return -1 !== i && i === n;
        },
        toArray: function (e) {
          if (!e) return null;
          var t = e.length;
          if (u(t)) return null;
          for (var n = new Array(t); t-- > 0; ) n[t] = e[t];
          return n;
        },
        isTypedArray: b,
        isFileList: _
      };
    },
    704: function (e) {
      'use strict';
      function t(e, t, r) {
        e instanceof RegExp && (e = n(e, r)), t instanceof RegExp && (t = n(t, r));
        var o = i(e, t, r);
        return (
          o && {
            start: o[0],
            end: o[1],
            pre: r.slice(0, o[0]),
            body: r.slice(o[0] + e.length, o[1]),
            post: r.slice(o[1] + t.length)
          }
        );
      }
      function n(e, t) {
        var n = t.match(e);
        return n ? n[0] : null;
      }
      function i(e, t, n) {
        var i,
          r,
          o,
          a,
          s,
          l = n.indexOf(e),
          u = n.indexOf(t, l + 1),
          c = l;
        if (l >= 0 && u > 0) {
          if (e === t) return [l, u];
          for (i = [], o = n.length; c >= 0 && !s; )
            c == l
              ? (i.push(c), (l = n.indexOf(e, c + 1)))
              : 1 == i.length
              ? (s = [i.pop(), u])
              : ((r = i.pop()) < o && ((o = r), (a = u)), (u = n.indexOf(t, c + 1))),
              (c = l < u && l >= 0 ? l : u);
          i.length && (s = [o, a]);
        }
        return s;
      }
      (e.exports = t), (t.range = i);
    },
    8952: function (e, t) {
      'use strict';
      (t.byteLength = function (e) {
        var t = l(e),
          n = t[0],
          i = t[1];
        return (3 * (n + i)) / 4 - i;
      }),
        (t.toByteArray = function (e) {
          var t,
            n,
            o = l(e),
            a = o[0],
            s = o[1],
            u = new r(
              (function (e, t, n) {
                return (3 * (t + n)) / 4 - n;
              })(0, a, s)
            ),
            c = 0,
            f = s > 0 ? a - 4 : a;
          for (n = 0; n < f; n += 4)
            (t =
              (i[e.charCodeAt(n)] << 18) |
              (i[e.charCodeAt(n + 1)] << 12) |
              (i[e.charCodeAt(n + 2)] << 6) |
              i[e.charCodeAt(n + 3)]),
              (u[c++] = (t >> 16) & 255),
              (u[c++] = (t >> 8) & 255),
              (u[c++] = 255 & t);
          2 === s && ((t = (i[e.charCodeAt(n)] << 2) | (i[e.charCodeAt(n + 1)] >> 4)), (u[c++] = 255 & t));
          1 === s &&
            ((t = (i[e.charCodeAt(n)] << 10) | (i[e.charCodeAt(n + 1)] << 4) | (i[e.charCodeAt(n + 2)] >> 2)),
            (u[c++] = (t >> 8) & 255),
            (u[c++] = 255 & t));
          return u;
        }),
        (t.fromByteArray = function (e) {
          for (var t, i = e.length, r = i % 3, o = [], a = 16383, s = 0, l = i - r; s < l; s += a)
            o.push(u(e, s, s + a > l ? l : s + a));
          1 === r
            ? ((t = e[i - 1]), o.push(n[t >> 2] + n[(t << 4) & 63] + '=='))
            : 2 === r &&
              ((t = (e[i - 2] << 8) + e[i - 1]),
              o.push(n[t >> 10] + n[(t >> 4) & 63] + n[(t << 2) & 63] + '='));
          return o.join('');
        });
      for (
        var n = [],
          i = [],
          r = 'undefined' !== typeof Uint8Array ? Uint8Array : Array,
          o = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/',
          a = 0,
          s = o.length;
        a < s;
        ++a
      )
        (n[a] = o[a]), (i[o.charCodeAt(a)] = a);
      function l(e) {
        var t = e.length;
        if (t % 4 > 0) throw new Error('Invalid string. Length must be a multiple of 4');
        var n = e.indexOf('=');
        return -1 === n && (n = t), [n, n === t ? 0 : 4 - (n % 4)];
      }
      function u(e, t, i) {
        for (var r, o, a = [], s = t; s < i; s += 3)
          (r = ((e[s] << 16) & 16711680) + ((e[s + 1] << 8) & 65280) + (255 & e[s + 2])),
            a.push(n[((o = r) >> 18) & 63] + n[(o >> 12) & 63] + n[(o >> 6) & 63] + n[63 & o]);
        return a.join('');
      }
      (i['-'.charCodeAt(0)] = 62), (i['_'.charCodeAt(0)] = 63);
    },
    8328: function (e, t, n) {
      'use strict';
      var i = n(8952),
        r = n(6502),
        o =
          'function' === typeof Symbol && 'function' === typeof Symbol.for
            ? Symbol.for('nodejs.util.inspect.custom')
            : null;
      (t.Buffer = l),
        (t.SlowBuffer = function (e) {
          +e != e && (e = 0);
          return l.alloc(+e);
        }),
        (t.INSPECT_MAX_BYTES = 50);
      var a = 2147483647;
      function s(e) {
        if (e > a) throw new RangeError('The value "' + e + '" is invalid for option "size"');
        var t = new Uint8Array(e);
        return Object.setPrototypeOf(t, l.prototype), t;
      }
      function l(e, t, n) {
        if ('number' === typeof e) {
          if ('string' === typeof t)
            throw new TypeError('The "string" argument must be of type string. Received type number');
          return f(e);
        }
        return u(e, t, n);
      }
      function u(e, t, n) {
        if ('string' === typeof e)
          return (function (e, t) {
            ('string' === typeof t && '' !== t) || (t = 'utf8');
            if (!l.isEncoding(t)) throw new TypeError('Unknown encoding: ' + t);
            var n = 0 | v(e, t),
              i = s(n),
              r = i.write(e, t);
            r !== n && (i = i.slice(0, r));
            return i;
          })(e, t);
        if (ArrayBuffer.isView(e))
          return (function (e) {
            if (D(e, Uint8Array)) {
              var t = new Uint8Array(e);
              return h(t.buffer, t.byteOffset, t.byteLength);
            }
            return d(e);
          })(e);
        if (null == e)
          throw new TypeError(
            'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
              typeof e
          );
        if (D(e, ArrayBuffer) || (e && D(e.buffer, ArrayBuffer))) return h(e, t, n);
        if (
          'undefined' !== typeof SharedArrayBuffer &&
          (D(e, SharedArrayBuffer) || (e && D(e.buffer, SharedArrayBuffer)))
        )
          return h(e, t, n);
        if ('number' === typeof e)
          throw new TypeError('The "value" argument must not be of type number. Received type number');
        var i = e.valueOf && e.valueOf();
        if (null != i && i !== e) return l.from(i, t, n);
        var r = (function (e) {
          if (l.isBuffer(e)) {
            var t = 0 | p(e.length),
              n = s(t);
            return 0 === n.length || e.copy(n, 0, 0, t), n;
          }
          if (void 0 !== e.length) return 'number' !== typeof e.length || U(e.length) ? s(0) : d(e);
          if ('Buffer' === e.type && Array.isArray(e.data)) return d(e.data);
        })(e);
        if (r) return r;
        if (
          'undefined' !== typeof Symbol &&
          null != Symbol.toPrimitive &&
          'function' === typeof e[Symbol.toPrimitive]
        )
          return l.from(e[Symbol.toPrimitive]('string'), t, n);
        throw new TypeError(
          'The first argument must be one of type string, Buffer, ArrayBuffer, Array, or Array-like Object. Received type ' +
            typeof e
        );
      }
      function c(e) {
        if ('number' !== typeof e) throw new TypeError('"size" argument must be of type number');
        if (e < 0) throw new RangeError('The value "' + e + '" is invalid for option "size"');
      }
      function f(e) {
        return c(e), s(e < 0 ? 0 : 0 | p(e));
      }
      function d(e) {
        for (var t = e.length < 0 ? 0 : 0 | p(e.length), n = s(t), i = 0; i < t; i += 1) n[i] = 255 & e[i];
        return n;
      }
      function h(e, t, n) {
        if (t < 0 || e.byteLength < t) throw new RangeError('"offset" is outside of buffer bounds');
        if (e.byteLength < t + (n || 0)) throw new RangeError('"length" is outside of buffer bounds');
        var i;
        return (
          (i =
            void 0 === t && void 0 === n
              ? new Uint8Array(e)
              : void 0 === n
              ? new Uint8Array(e, t)
              : new Uint8Array(e, t, n)),
          Object.setPrototypeOf(i, l.prototype),
          i
        );
      }
      function p(e) {
        if (e >= a)
          throw new RangeError(
            'Attempt to allocate Buffer larger than maximum size: 0x' + a.toString(16) + ' bytes'
          );
        return 0 | e;
      }
      function v(e, t) {
        if (l.isBuffer(e)) return e.length;
        if (ArrayBuffer.isView(e) || D(e, ArrayBuffer)) return e.byteLength;
        if ('string' !== typeof e)
          throw new TypeError(
            'The "string" argument must be one of type string, Buffer, or ArrayBuffer. Received type ' +
              typeof e
          );
        var n = e.length,
          i = arguments.length > 2 && !0 === arguments[2];
        if (!i && 0 === n) return 0;
        for (var r = !1; ; )
          switch (t) {
            case 'ascii':
            case 'latin1':
            case 'binary':
              return n;
            case 'utf8':
            case 'utf-8':
              return M(e).length;
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return 2 * n;
            case 'hex':
              return n >>> 1;
            case 'base64':
              return I(e).length;
            default:
              if (r) return i ? -1 : M(e).length;
              (t = ('' + t).toLowerCase()), (r = !0);
          }
      }
      function _(e, t, n) {
        var i = !1;
        if (((void 0 === t || t < 0) && (t = 0), t > this.length)) return '';
        if (((void 0 === n || n > this.length) && (n = this.length), n <= 0)) return '';
        if ((n >>>= 0) <= (t >>>= 0)) return '';
        for (e || (e = 'utf8'); ; )
          switch (e) {
            case 'hex':
              return O(this, t, n);
            case 'utf8':
            case 'utf-8':
              return S(this, t, n);
            case 'ascii':
              return j(this, t, n);
            case 'latin1':
            case 'binary':
              return z(this, t, n);
            case 'base64':
              return C(this, t, n);
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return T(this, t, n);
            default:
              if (i) throw new TypeError('Unknown encoding: ' + e);
              (e = (e + '').toLowerCase()), (i = !0);
          }
      }
      function m(e, t, n) {
        var i = e[t];
        (e[t] = e[n]), (e[n] = i);
      }
      function g(e, t, n, i, r) {
        if (0 === e.length) return -1;
        if (
          ('string' === typeof n
            ? ((i = n), (n = 0))
            : n > 2147483647
            ? (n = 2147483647)
            : n < -2147483648 && (n = -2147483648),
          U((n = +n)) && (n = r ? 0 : e.length - 1),
          n < 0 && (n = e.length + n),
          n >= e.length)
        ) {
          if (r) return -1;
          n = e.length - 1;
        } else if (n < 0) {
          if (!r) return -1;
          n = 0;
        }
        if (('string' === typeof t && (t = l.from(t, i)), l.isBuffer(t)))
          return 0 === t.length ? -1 : w(e, t, n, i, r);
        if ('number' === typeof t)
          return (
            (t &= 255),
            'function' === typeof Uint8Array.prototype.indexOf
              ? r
                ? Uint8Array.prototype.indexOf.call(e, t, n)
                : Uint8Array.prototype.lastIndexOf.call(e, t, n)
              : w(e, [t], n, i, r)
          );
        throw new TypeError('val must be string, number or Buffer');
      }
      function w(e, t, n, i, r) {
        var o,
          a = 1,
          s = e.length,
          l = t.length;
        if (
          void 0 !== i &&
          ('ucs2' === (i = String(i).toLowerCase()) || 'ucs-2' === i || 'utf16le' === i || 'utf-16le' === i)
        ) {
          if (e.length < 2 || t.length < 2) return -1;
          (a = 2), (s /= 2), (l /= 2), (n /= 2);
        }
        function u(e, t) {
          return 1 === a ? e[t] : e.readUInt16BE(t * a);
        }
        if (r) {
          var c = -1;
          for (o = n; o < s; o++)
            if (u(e, o) === u(t, -1 === c ? 0 : o - c)) {
              if ((-1 === c && (c = o), o - c + 1 === l)) return c * a;
            } else -1 !== c && (o -= o - c), (c = -1);
        } else
          for (n + l > s && (n = s - l), o = n; o >= 0; o--) {
            for (var f = !0, d = 0; d < l; d++)
              if (u(e, o + d) !== u(t, d)) {
                f = !1;
                break;
              }
            if (f) return o;
          }
        return -1;
      }
      function y(e, t, n, i) {
        n = Number(n) || 0;
        var r = e.length - n;
        i ? (i = Number(i)) > r && (i = r) : (i = r);
        var o = t.length;
        i > o / 2 && (i = o / 2);
        for (var a = 0; a < i; ++a) {
          var s = parseInt(t.substr(2 * a, 2), 16);
          if (U(s)) return a;
          e[n + a] = s;
        }
        return a;
      }
      function b(e, t, n, i) {
        return H(M(t, e.length - n), e, n, i);
      }
      function x(e, t, n, i) {
        return H(
          (function (e) {
            for (var t = [], n = 0; n < e.length; ++n) t.push(255 & e.charCodeAt(n));
            return t;
          })(t),
          e,
          n,
          i
        );
      }
      function E(e, t, n, i) {
        return H(I(t), e, n, i);
      }
      function k(e, t, n, i) {
        return H(
          (function (e, t) {
            for (var n, i, r, o = [], a = 0; a < e.length && !((t -= 2) < 0); ++a)
              (i = (n = e.charCodeAt(a)) >> 8), (r = n % 256), o.push(r), o.push(i);
            return o;
          })(t, e.length - n),
          e,
          n,
          i
        );
      }
      function C(e, t, n) {
        return 0 === t && n === e.length ? i.fromByteArray(e) : i.fromByteArray(e.slice(t, n));
      }
      function S(e, t, n) {
        n = Math.min(e.length, n);
        for (var i = [], r = t; r < n; ) {
          var o,
            a,
            s,
            l,
            u = e[r],
            c = null,
            f = u > 239 ? 4 : u > 223 ? 3 : u > 191 ? 2 : 1;
          if (r + f <= n)
            switch (f) {
              case 1:
                u < 128 && (c = u);
                break;
              case 2:
                128 === (192 & (o = e[r + 1])) && (l = ((31 & u) << 6) | (63 & o)) > 127 && (c = l);
                break;
              case 3:
                (o = e[r + 1]),
                  (a = e[r + 2]),
                  128 === (192 & o) &&
                    128 === (192 & a) &&
                    (l = ((15 & u) << 12) | ((63 & o) << 6) | (63 & a)) > 2047 &&
                    (l < 55296 || l > 57343) &&
                    (c = l);
                break;
              case 4:
                (o = e[r + 1]),
                  (a = e[r + 2]),
                  (s = e[r + 3]),
                  128 === (192 & o) &&
                    128 === (192 & a) &&
                    128 === (192 & s) &&
                    (l = ((15 & u) << 18) | ((63 & o) << 12) | ((63 & a) << 6) | (63 & s)) > 65535 &&
                    l < 1114112 &&
                    (c = l);
            }
          null === c
            ? ((c = 65533), (f = 1))
            : c > 65535 && ((c -= 65536), i.push(((c >>> 10) & 1023) | 55296), (c = 56320 | (1023 & c))),
            i.push(c),
            (r += f);
        }
        return (function (e) {
          var t = e.length;
          if (t <= N) return String.fromCharCode.apply(String, e);
          var n = '',
            i = 0;
          for (; i < t; ) n += String.fromCharCode.apply(String, e.slice(i, (i += N)));
          return n;
        })(i);
      }
      (t.kMaxLength = a),
        (l.TYPED_ARRAY_SUPPORT = (function () {
          try {
            var e = new Uint8Array(1),
              t = {
                foo: function () {
                  return 42;
                }
              };
            return (
              Object.setPrototypeOf(t, Uint8Array.prototype), Object.setPrototypeOf(e, t), 42 === e.foo()
            );
          } catch (n) {
            return !1;
          }
        })()),
        l.TYPED_ARRAY_SUPPORT ||
          'undefined' === typeof console ||
          'function' !== typeof console.error ||
          console.error(
            'This browser lacks typed array (Uint8Array) support which is required by `buffer` v5.x. Use `buffer` v4.x if you require old browser support.'
          ),
        Object.defineProperty(l.prototype, 'parent', {
          enumerable: !0,
          get: function () {
            if (l.isBuffer(this)) return this.buffer;
          }
        }),
        Object.defineProperty(l.prototype, 'offset', {
          enumerable: !0,
          get: function () {
            if (l.isBuffer(this)) return this.byteOffset;
          }
        }),
        (l.poolSize = 8192),
        (l.from = function (e, t, n) {
          return u(e, t, n);
        }),
        Object.setPrototypeOf(l.prototype, Uint8Array.prototype),
        Object.setPrototypeOf(l, Uint8Array),
        (l.alloc = function (e, t, n) {
          return (function (e, t, n) {
            return (
              c(e),
              e <= 0 ? s(e) : void 0 !== t ? ('string' === typeof n ? s(e).fill(t, n) : s(e).fill(t)) : s(e)
            );
          })(e, t, n);
        }),
        (l.allocUnsafe = function (e) {
          return f(e);
        }),
        (l.allocUnsafeSlow = function (e) {
          return f(e);
        }),
        (l.isBuffer = function (e) {
          return null != e && !0 === e._isBuffer && e !== l.prototype;
        }),
        (l.compare = function (e, t) {
          if (
            (D(e, Uint8Array) && (e = l.from(e, e.offset, e.byteLength)),
            D(t, Uint8Array) && (t = l.from(t, t.offset, t.byteLength)),
            !l.isBuffer(e) || !l.isBuffer(t))
          )
            throw new TypeError('The "buf1", "buf2" arguments must be one of type Buffer or Uint8Array');
          if (e === t) return 0;
          for (var n = e.length, i = t.length, r = 0, o = Math.min(n, i); r < o; ++r)
            if (e[r] !== t[r]) {
              (n = e[r]), (i = t[r]);
              break;
            }
          return n < i ? -1 : i < n ? 1 : 0;
        }),
        (l.isEncoding = function (e) {
          switch (String(e).toLowerCase()) {
            case 'hex':
            case 'utf8':
            case 'utf-8':
            case 'ascii':
            case 'latin1':
            case 'binary':
            case 'base64':
            case 'ucs2':
            case 'ucs-2':
            case 'utf16le':
            case 'utf-16le':
              return !0;
            default:
              return !1;
          }
        }),
        (l.concat = function (e, t) {
          if (!Array.isArray(e)) throw new TypeError('"list" argument must be an Array of Buffers');
          if (0 === e.length) return l.alloc(0);
          var n;
          if (void 0 === t) for (t = 0, n = 0; n < e.length; ++n) t += e[n].length;
          var i = l.allocUnsafe(t),
            r = 0;
          for (n = 0; n < e.length; ++n) {
            var o = e[n];
            if (D(o, Uint8Array))
              r + o.length > i.length ? l.from(o).copy(i, r) : Uint8Array.prototype.set.call(i, o, r);
            else {
              if (!l.isBuffer(o)) throw new TypeError('"list" argument must be an Array of Buffers');
              o.copy(i, r);
            }
            r += o.length;
          }
          return i;
        }),
        (l.byteLength = v),
        (l.prototype._isBuffer = !0),
        (l.prototype.swap16 = function () {
          var e = this.length;
          if (e % 2 !== 0) throw new RangeError('Buffer size must be a multiple of 16-bits');
          for (var t = 0; t < e; t += 2) m(this, t, t + 1);
          return this;
        }),
        (l.prototype.swap32 = function () {
          var e = this.length;
          if (e % 4 !== 0) throw new RangeError('Buffer size must be a multiple of 32-bits');
          for (var t = 0; t < e; t += 4) m(this, t, t + 3), m(this, t + 1, t + 2);
          return this;
        }),
        (l.prototype.swap64 = function () {
          var e = this.length;
          if (e % 8 !== 0) throw new RangeError('Buffer size must be a multiple of 64-bits');
          for (var t = 0; t < e; t += 8)
            m(this, t, t + 7), m(this, t + 1, t + 6), m(this, t + 2, t + 5), m(this, t + 3, t + 4);
          return this;
        }),
        (l.prototype.toString = function () {
          var e = this.length;
          return 0 === e ? '' : 0 === arguments.length ? S(this, 0, e) : _.apply(this, arguments);
        }),
        (l.prototype.toLocaleString = l.prototype.toString),
        (l.prototype.equals = function (e) {
          if (!l.isBuffer(e)) throw new TypeError('Argument must be a Buffer');
          return this === e || 0 === l.compare(this, e);
        }),
        (l.prototype.inspect = function () {
          var e = '',
            n = t.INSPECT_MAX_BYTES;
          return (
            (e = this.toString('hex', 0, n)
              .replace(/(.{2})/g, '$1 ')
              .trim()),
            this.length > n && (e += ' ... '),
            '<Buffer ' + e + '>'
          );
        }),
        o && (l.prototype[o] = l.prototype.inspect),
        (l.prototype.compare = function (e, t, n, i, r) {
          if ((D(e, Uint8Array) && (e = l.from(e, e.offset, e.byteLength)), !l.isBuffer(e)))
            throw new TypeError(
              'The "target" argument must be one of type Buffer or Uint8Array. Received type ' + typeof e
            );
          if (
            (void 0 === t && (t = 0),
            void 0 === n && (n = e ? e.length : 0),
            void 0 === i && (i = 0),
            void 0 === r && (r = this.length),
            t < 0 || n > e.length || i < 0 || r > this.length)
          )
            throw new RangeError('out of range index');
          if (i >= r && t >= n) return 0;
          if (i >= r) return -1;
          if (t >= n) return 1;
          if (this === e) return 0;
          for (
            var o = (r >>>= 0) - (i >>>= 0),
              a = (n >>>= 0) - (t >>>= 0),
              s = Math.min(o, a),
              u = this.slice(i, r),
              c = e.slice(t, n),
              f = 0;
            f < s;
            ++f
          )
            if (u[f] !== c[f]) {
              (o = u[f]), (a = c[f]);
              break;
            }
          return o < a ? -1 : a < o ? 1 : 0;
        }),
        (l.prototype.includes = function (e, t, n) {
          return -1 !== this.indexOf(e, t, n);
        }),
        (l.prototype.indexOf = function (e, t, n) {
          return g(this, e, t, n, !0);
        }),
        (l.prototype.lastIndexOf = function (e, t, n) {
          return g(this, e, t, n, !1);
        }),
        (l.prototype.write = function (e, t, n, i) {
          if (void 0 === t) (i = 'utf8'), (n = this.length), (t = 0);
          else if (void 0 === n && 'string' === typeof t) (i = t), (n = this.length), (t = 0);
          else {
            if (!isFinite(t))
              throw new Error('Buffer.write(string, encoding, offset[, length]) is no longer supported');
            (t >>>= 0), isFinite(n) ? ((n >>>= 0), void 0 === i && (i = 'utf8')) : ((i = n), (n = void 0));
          }
          var r = this.length - t;
          if (((void 0 === n || n > r) && (n = r), (e.length > 0 && (n < 0 || t < 0)) || t > this.length))
            throw new RangeError('Attempt to write outside buffer bounds');
          i || (i = 'utf8');
          for (var o = !1; ; )
            switch (i) {
              case 'hex':
                return y(this, e, t, n);
              case 'utf8':
              case 'utf-8':
                return b(this, e, t, n);
              case 'ascii':
              case 'latin1':
              case 'binary':
                return x(this, e, t, n);
              case 'base64':
                return E(this, e, t, n);
              case 'ucs2':
              case 'ucs-2':
              case 'utf16le':
              case 'utf-16le':
                return k(this, e, t, n);
              default:
                if (o) throw new TypeError('Unknown encoding: ' + i);
                (i = ('' + i).toLowerCase()), (o = !0);
            }
        }),
        (l.prototype.toJSON = function () {
          return { type: 'Buffer', data: Array.prototype.slice.call(this._arr || this, 0) };
        });
      var N = 4096;
      function j(e, t, n) {
        var i = '';
        n = Math.min(e.length, n);
        for (var r = t; r < n; ++r) i += String.fromCharCode(127 & e[r]);
        return i;
      }
      function z(e, t, n) {
        var i = '';
        n = Math.min(e.length, n);
        for (var r = t; r < n; ++r) i += String.fromCharCode(e[r]);
        return i;
      }
      function O(e, t, n) {
        var i = e.length;
        (!t || t < 0) && (t = 0), (!n || n < 0 || n > i) && (n = i);
        for (var r = '', o = t; o < n; ++o) r += q[e[o]];
        return r;
      }
      function T(e, t, n) {
        for (var i = e.slice(t, n), r = '', o = 0; o < i.length - 1; o += 2)
          r += String.fromCharCode(i[o] + 256 * i[o + 1]);
        return r;
      }
      function R(e, t, n) {
        if (e % 1 !== 0 || e < 0) throw new RangeError('offset is not uint');
        if (e + t > n) throw new RangeError('Trying to access beyond buffer length');
      }
      function B(e, t, n, i, r, o) {
        if (!l.isBuffer(e)) throw new TypeError('"buffer" argument must be a Buffer instance');
        if (t > r || t < o) throw new RangeError('"value" argument is out of bounds');
        if (n + i > e.length) throw new RangeError('Index out of range');
      }
      function A(e, t, n, i, r, o) {
        if (n + i > e.length) throw new RangeError('Index out of range');
        if (n < 0) throw new RangeError('Index out of range');
      }
      function L(e, t, n, i, o) {
        return (t = +t), (n >>>= 0), o || A(e, 0, n, 4), r.write(e, t, n, i, 23, 4), n + 4;
      }
      function P(e, t, n, i, o) {
        return (t = +t), (n >>>= 0), o || A(e, 0, n, 8), r.write(e, t, n, i, 52, 8), n + 8;
      }
      (l.prototype.slice = function (e, t) {
        var n = this.length;
        (e = ~~e) < 0 ? (e += n) < 0 && (e = 0) : e > n && (e = n),
          (t = void 0 === t ? n : ~~t) < 0 ? (t += n) < 0 && (t = 0) : t > n && (t = n),
          t < e && (t = e);
        var i = this.subarray(e, t);
        return Object.setPrototypeOf(i, l.prototype), i;
      }),
        (l.prototype.readUintLE = l.prototype.readUIntLE =
          function (e, t, n) {
            (e >>>= 0), (t >>>= 0), n || R(e, t, this.length);
            for (var i = this[e], r = 1, o = 0; ++o < t && (r *= 256); ) i += this[e + o] * r;
            return i;
          }),
        (l.prototype.readUintBE = l.prototype.readUIntBE =
          function (e, t, n) {
            (e >>>= 0), (t >>>= 0), n || R(e, t, this.length);
            for (var i = this[e + --t], r = 1; t > 0 && (r *= 256); ) i += this[e + --t] * r;
            return i;
          }),
        (l.prototype.readUint8 = l.prototype.readUInt8 =
          function (e, t) {
            return (e >>>= 0), t || R(e, 1, this.length), this[e];
          }),
        (l.prototype.readUint16LE = l.prototype.readUInt16LE =
          function (e, t) {
            return (e >>>= 0), t || R(e, 2, this.length), this[e] | (this[e + 1] << 8);
          }),
        (l.prototype.readUint16BE = l.prototype.readUInt16BE =
          function (e, t) {
            return (e >>>= 0), t || R(e, 2, this.length), (this[e] << 8) | this[e + 1];
          }),
        (l.prototype.readUint32LE = l.prototype.readUInt32LE =
          function (e, t) {
            return (
              (e >>>= 0),
              t || R(e, 4, this.length),
              (this[e] | (this[e + 1] << 8) | (this[e + 2] << 16)) + 16777216 * this[e + 3]
            );
          }),
        (l.prototype.readUint32BE = l.prototype.readUInt32BE =
          function (e, t) {
            return (
              (e >>>= 0),
              t || R(e, 4, this.length),
              16777216 * this[e] + ((this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3])
            );
          }),
        (l.prototype.readIntLE = function (e, t, n) {
          (e >>>= 0), (t >>>= 0), n || R(e, t, this.length);
          for (var i = this[e], r = 1, o = 0; ++o < t && (r *= 256); ) i += this[e + o] * r;
          return i >= (r *= 128) && (i -= Math.pow(2, 8 * t)), i;
        }),
        (l.prototype.readIntBE = function (e, t, n) {
          (e >>>= 0), (t >>>= 0), n || R(e, t, this.length);
          for (var i = t, r = 1, o = this[e + --i]; i > 0 && (r *= 256); ) o += this[e + --i] * r;
          return o >= (r *= 128) && (o -= Math.pow(2, 8 * t)), o;
        }),
        (l.prototype.readInt8 = function (e, t) {
          return (e >>>= 0), t || R(e, 1, this.length), 128 & this[e] ? -1 * (255 - this[e] + 1) : this[e];
        }),
        (l.prototype.readInt16LE = function (e, t) {
          (e >>>= 0), t || R(e, 2, this.length);
          var n = this[e] | (this[e + 1] << 8);
          return 32768 & n ? 4294901760 | n : n;
        }),
        (l.prototype.readInt16BE = function (e, t) {
          (e >>>= 0), t || R(e, 2, this.length);
          var n = this[e + 1] | (this[e] << 8);
          return 32768 & n ? 4294901760 | n : n;
        }),
        (l.prototype.readInt32LE = function (e, t) {
          return (
            (e >>>= 0),
            t || R(e, 4, this.length),
            this[e] | (this[e + 1] << 8) | (this[e + 2] << 16) | (this[e + 3] << 24)
          );
        }),
        (l.prototype.readInt32BE = function (e, t) {
          return (
            (e >>>= 0),
            t || R(e, 4, this.length),
            (this[e] << 24) | (this[e + 1] << 16) | (this[e + 2] << 8) | this[e + 3]
          );
        }),
        (l.prototype.readFloatLE = function (e, t) {
          return (e >>>= 0), t || R(e, 4, this.length), r.read(this, e, !0, 23, 4);
        }),
        (l.prototype.readFloatBE = function (e, t) {
          return (e >>>= 0), t || R(e, 4, this.length), r.read(this, e, !1, 23, 4);
        }),
        (l.prototype.readDoubleLE = function (e, t) {
          return (e >>>= 0), t || R(e, 8, this.length), r.read(this, e, !0, 52, 8);
        }),
        (l.prototype.readDoubleBE = function (e, t) {
          return (e >>>= 0), t || R(e, 8, this.length), r.read(this, e, !1, 52, 8);
        }),
        (l.prototype.writeUintLE = l.prototype.writeUIntLE =
          function (e, t, n, i) {
            ((e = +e), (t >>>= 0), (n >>>= 0), i) || B(this, e, t, n, Math.pow(2, 8 * n) - 1, 0);
            var r = 1,
              o = 0;
            for (this[t] = 255 & e; ++o < n && (r *= 256); ) this[t + o] = (e / r) & 255;
            return t + n;
          }),
        (l.prototype.writeUintBE = l.prototype.writeUIntBE =
          function (e, t, n, i) {
            ((e = +e), (t >>>= 0), (n >>>= 0), i) || B(this, e, t, n, Math.pow(2, 8 * n) - 1, 0);
            var r = n - 1,
              o = 1;
            for (this[t + r] = 255 & e; --r >= 0 && (o *= 256); ) this[t + r] = (e / o) & 255;
            return t + n;
          }),
        (l.prototype.writeUint8 = l.prototype.writeUInt8 =
          function (e, t, n) {
            return (e = +e), (t >>>= 0), n || B(this, e, t, 1, 255, 0), (this[t] = 255 & e), t + 1;
          }),
        (l.prototype.writeUint16LE = l.prototype.writeUInt16LE =
          function (e, t, n) {
            return (
              (e = +e),
              (t >>>= 0),
              n || B(this, e, t, 2, 65535, 0),
              (this[t] = 255 & e),
              (this[t + 1] = e >>> 8),
              t + 2
            );
          }),
        (l.prototype.writeUint16BE = l.prototype.writeUInt16BE =
          function (e, t, n) {
            return (
              (e = +e),
              (t >>>= 0),
              n || B(this, e, t, 2, 65535, 0),
              (this[t] = e >>> 8),
              (this[t + 1] = 255 & e),
              t + 2
            );
          }),
        (l.prototype.writeUint32LE = l.prototype.writeUInt32LE =
          function (e, t, n) {
            return (
              (e = +e),
              (t >>>= 0),
              n || B(this, e, t, 4, 4294967295, 0),
              (this[t + 3] = e >>> 24),
              (this[t + 2] = e >>> 16),
              (this[t + 1] = e >>> 8),
              (this[t] = 255 & e),
              t + 4
            );
          }),
        (l.prototype.writeUint32BE = l.prototype.writeUInt32BE =
          function (e, t, n) {
            return (
              (e = +e),
              (t >>>= 0),
              n || B(this, e, t, 4, 4294967295, 0),
              (this[t] = e >>> 24),
              (this[t + 1] = e >>> 16),
              (this[t + 2] = e >>> 8),
              (this[t + 3] = 255 & e),
              t + 4
            );
          }),
        (l.prototype.writeIntLE = function (e, t, n, i) {
          if (((e = +e), (t >>>= 0), !i)) {
            var r = Math.pow(2, 8 * n - 1);
            B(this, e, t, n, r - 1, -r);
          }
          var o = 0,
            a = 1,
            s = 0;
          for (this[t] = 255 & e; ++o < n && (a *= 256); )
            e < 0 && 0 === s && 0 !== this[t + o - 1] && (s = 1), (this[t + o] = (((e / a) >> 0) - s) & 255);
          return t + n;
        }),
        (l.prototype.writeIntBE = function (e, t, n, i) {
          if (((e = +e), (t >>>= 0), !i)) {
            var r = Math.pow(2, 8 * n - 1);
            B(this, e, t, n, r - 1, -r);
          }
          var o = n - 1,
            a = 1,
            s = 0;
          for (this[t + o] = 255 & e; --o >= 0 && (a *= 256); )
            e < 0 && 0 === s && 0 !== this[t + o + 1] && (s = 1), (this[t + o] = (((e / a) >> 0) - s) & 255);
          return t + n;
        }),
        (l.prototype.writeInt8 = function (e, t, n) {
          return (
            (e = +e),
            (t >>>= 0),
            n || B(this, e, t, 1, 127, -128),
            e < 0 && (e = 255 + e + 1),
            (this[t] = 255 & e),
            t + 1
          );
        }),
        (l.prototype.writeInt16LE = function (e, t, n) {
          return (
            (e = +e),
            (t >>>= 0),
            n || B(this, e, t, 2, 32767, -32768),
            (this[t] = 255 & e),
            (this[t + 1] = e >>> 8),
            t + 2
          );
        }),
        (l.prototype.writeInt16BE = function (e, t, n) {
          return (
            (e = +e),
            (t >>>= 0),
            n || B(this, e, t, 2, 32767, -32768),
            (this[t] = e >>> 8),
            (this[t + 1] = 255 & e),
            t + 2
          );
        }),
        (l.prototype.writeInt32LE = function (e, t, n) {
          return (
            (e = +e),
            (t >>>= 0),
            n || B(this, e, t, 4, 2147483647, -2147483648),
            (this[t] = 255 & e),
            (this[t + 1] = e >>> 8),
            (this[t + 2] = e >>> 16),
            (this[t + 3] = e >>> 24),
            t + 4
          );
        }),
        (l.prototype.writeInt32BE = function (e, t, n) {
          return (
            (e = +e),
            (t >>>= 0),
            n || B(this, e, t, 4, 2147483647, -2147483648),
            e < 0 && (e = 4294967295 + e + 1),
            (this[t] = e >>> 24),
            (this[t + 1] = e >>> 16),
            (this[t + 2] = e >>> 8),
            (this[t + 3] = 255 & e),
            t + 4
          );
        }),
        (l.prototype.writeFloatLE = function (e, t, n) {
          return L(this, e, t, !0, n);
        }),
        (l.prototype.writeFloatBE = function (e, t, n) {
          return L(this, e, t, !1, n);
        }),
        (l.prototype.writeDoubleLE = function (e, t, n) {
          return P(this, e, t, !0, n);
        }),
        (l.prototype.writeDoubleBE = function (e, t, n) {
          return P(this, e, t, !1, n);
        }),
        (l.prototype.copy = function (e, t, n, i) {
          if (!l.isBuffer(e)) throw new TypeError('argument should be a Buffer');
          if (
            (n || (n = 0),
            i || 0 === i || (i = this.length),
            t >= e.length && (t = e.length),
            t || (t = 0),
            i > 0 && i < n && (i = n),
            i === n)
          )
            return 0;
          if (0 === e.length || 0 === this.length) return 0;
          if (t < 0) throw new RangeError('targetStart out of bounds');
          if (n < 0 || n >= this.length) throw new RangeError('Index out of range');
          if (i < 0) throw new RangeError('sourceEnd out of bounds');
          i > this.length && (i = this.length), e.length - t < i - n && (i = e.length - t + n);
          var r = i - n;
          return (
            this === e && 'function' === typeof Uint8Array.prototype.copyWithin
              ? this.copyWithin(t, n, i)
              : Uint8Array.prototype.set.call(e, this.subarray(n, i), t),
            r
          );
        }),
        (l.prototype.fill = function (e, t, n, i) {
          if ('string' === typeof e) {
            if (
              ('string' === typeof t
                ? ((i = t), (t = 0), (n = this.length))
                : 'string' === typeof n && ((i = n), (n = this.length)),
              void 0 !== i && 'string' !== typeof i)
            )
              throw new TypeError('encoding must be a string');
            if ('string' === typeof i && !l.isEncoding(i)) throw new TypeError('Unknown encoding: ' + i);
            if (1 === e.length) {
              var r = e.charCodeAt(0);
              (('utf8' === i && r < 128) || 'latin1' === i) && (e = r);
            }
          } else 'number' === typeof e ? (e &= 255) : 'boolean' === typeof e && (e = Number(e));
          if (t < 0 || this.length < t || this.length < n) throw new RangeError('Out of range index');
          if (n <= t) return this;
          var o;
          if (((t >>>= 0), (n = void 0 === n ? this.length : n >>> 0), e || (e = 0), 'number' === typeof e))
            for (o = t; o < n; ++o) this[o] = e;
          else {
            var a = l.isBuffer(e) ? e : l.from(e, i),
              s = a.length;
            if (0 === s) throw new TypeError('The value "' + e + '" is invalid for argument "value"');
            for (o = 0; o < n - t; ++o) this[o + t] = a[o % s];
          }
          return this;
        });
      var Z = /[^+/0-9A-Za-z-_]/g;
      function M(e, t) {
        var n;
        t = t || 1 / 0;
        for (var i = e.length, r = null, o = [], a = 0; a < i; ++a) {
          if ((n = e.charCodeAt(a)) > 55295 && n < 57344) {
            if (!r) {
              if (n > 56319) {
                (t -= 3) > -1 && o.push(239, 191, 189);
                continue;
              }
              if (a + 1 === i) {
                (t -= 3) > -1 && o.push(239, 191, 189);
                continue;
              }
              r = n;
              continue;
            }
            if (n < 56320) {
              (t -= 3) > -1 && o.push(239, 191, 189), (r = n);
              continue;
            }
            n = 65536 + (((r - 55296) << 10) | (n - 56320));
          } else r && (t -= 3) > -1 && o.push(239, 191, 189);
          if (((r = null), n < 128)) {
            if ((t -= 1) < 0) break;
            o.push(n);
          } else if (n < 2048) {
            if ((t -= 2) < 0) break;
            o.push((n >> 6) | 192, (63 & n) | 128);
          } else if (n < 65536) {
            if ((t -= 3) < 0) break;
            o.push((n >> 12) | 224, ((n >> 6) & 63) | 128, (63 & n) | 128);
          } else {
            if (!(n < 1114112)) throw new Error('Invalid code point');
            if ((t -= 4) < 0) break;
            o.push((n >> 18) | 240, ((n >> 12) & 63) | 128, ((n >> 6) & 63) | 128, (63 & n) | 128);
          }
        }
        return o;
      }
      function I(e) {
        return i.toByteArray(
          (function (e) {
            if ((e = (e = e.split('=')[0]).trim().replace(Z, '')).length < 2) return '';
            for (; e.length % 4 !== 0; ) e += '=';
            return e;
          })(e)
        );
      }
      function H(e, t, n, i) {
        for (var r = 0; r < i && !(r + n >= t.length || r >= e.length); ++r) t[r + n] = e[r];
        return r;
      }
      function D(e, t) {
        return (
          e instanceof t ||
          (null != e && null != e.constructor && null != e.constructor.name && e.constructor.name === t.name)
        );
      }
      function U(e) {
        return e !== e;
      }
      var q = (function () {
        for (var e = '0123456789abcdef', t = new Array(256), n = 0; n < 16; ++n)
          for (var i = 16 * n, r = 0; r < 16; ++r) t[i + r] = e[n] + e[r];
        return t;
      })();
    },
    7069: function (e, t, n) {
      'use strict';
      function i(e) {
        var t,
          n,
          r = '';
        if ('string' === typeof e || 'number' === typeof e) r += e;
        else if ('object' === typeof e)
          if (Array.isArray(e))
            for (t = 0; t < e.length; t++) e[t] && (n = i(e[t])) && (r && (r += ' '), (r += n));
          else for (t in e) e[t] && (r && (r += ' '), (r += t));
        return r;
      }
      function r() {
        for (var e, t, n = 0, r = ''; n < arguments.length; )
          (e = arguments[n++]) && (t = i(e)) && (r && (r += ' '), (r += t));
        return r;
      }
      n.d(t, {
        Z: function () {
          return r;
        }
      });
    },
    6638: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7500),
          n(8540),
          n(7324),
          n(6253),
          (function () {
            var e = o,
              t = e.lib.BlockCipher,
              n = e.algo,
              i = [],
              r = [],
              a = [],
              s = [],
              l = [],
              u = [],
              c = [],
              f = [],
              d = [],
              h = [];
            !(function () {
              for (var e = [], t = 0; t < 256; t++) e[t] = t < 128 ? t << 1 : (t << 1) ^ 283;
              var n = 0,
                o = 0;
              for (t = 0; t < 256; t++) {
                var p = o ^ (o << 1) ^ (o << 2) ^ (o << 3) ^ (o << 4);
                (p = (p >>> 8) ^ (255 & p) ^ 99), (i[n] = p), (r[p] = n);
                var v = e[n],
                  _ = e[v],
                  m = e[_],
                  g = (257 * e[p]) ^ (16843008 * p);
                (a[n] = (g << 24) | (g >>> 8)),
                  (s[n] = (g << 16) | (g >>> 16)),
                  (l[n] = (g << 8) | (g >>> 24)),
                  (u[n] = g),
                  (g = (16843009 * m) ^ (65537 * _) ^ (257 * v) ^ (16843008 * n)),
                  (c[p] = (g << 24) | (g >>> 8)),
                  (f[p] = (g << 16) | (g >>> 16)),
                  (d[p] = (g << 8) | (g >>> 24)),
                  (h[p] = g),
                  n ? ((n = v ^ e[e[e[m ^ v]]]), (o ^= e[e[o]])) : (n = o = 1);
              }
            })();
            var p = [0, 1, 2, 4, 8, 16, 32, 64, 128, 27, 54],
              v = (n.AES = t.extend({
                _doReset: function () {
                  if (!this._nRounds || this._keyPriorReset !== this._key) {
                    for (
                      var e = (this._keyPriorReset = this._key),
                        t = e.words,
                        n = e.sigBytes / 4,
                        r = 4 * ((this._nRounds = n + 6) + 1),
                        o = (this._keySchedule = []),
                        a = 0;
                      a < r;
                      a++
                    )
                      a < n
                        ? (o[a] = t[a])
                        : ((u = o[a - 1]),
                          a % n
                            ? n > 6 &&
                              a % n == 4 &&
                              (u =
                                (i[u >>> 24] << 24) |
                                (i[(u >>> 16) & 255] << 16) |
                                (i[(u >>> 8) & 255] << 8) |
                                i[255 & u])
                            : ((u =
                                (i[(u = (u << 8) | (u >>> 24)) >>> 24] << 24) |
                                (i[(u >>> 16) & 255] << 16) |
                                (i[(u >>> 8) & 255] << 8) |
                                i[255 & u]),
                              (u ^= p[(a / n) | 0] << 24)),
                          (o[a] = o[a - n] ^ u));
                    for (var s = (this._invKeySchedule = []), l = 0; l < r; l++) {
                      if (((a = r - l), l % 4)) var u = o[a];
                      else u = o[a - 4];
                      s[l] =
                        l < 4 || a <= 4
                          ? u
                          : c[i[u >>> 24]] ^ f[i[(u >>> 16) & 255]] ^ d[i[(u >>> 8) & 255]] ^ h[i[255 & u]];
                    }
                  }
                },
                encryptBlock: function (e, t) {
                  this._doCryptBlock(e, t, this._keySchedule, a, s, l, u, i);
                },
                decryptBlock: function (e, t) {
                  var n = e[t + 1];
                  (e[t + 1] = e[t + 3]),
                    (e[t + 3] = n),
                    this._doCryptBlock(e, t, this._invKeySchedule, c, f, d, h, r),
                    (n = e[t + 1]),
                    (e[t + 1] = e[t + 3]),
                    (e[t + 3] = n);
                },
                _doCryptBlock: function (e, t, n, i, r, o, a, s) {
                  for (
                    var l = this._nRounds,
                      u = e[t] ^ n[0],
                      c = e[t + 1] ^ n[1],
                      f = e[t + 2] ^ n[2],
                      d = e[t + 3] ^ n[3],
                      h = 4,
                      p = 1;
                    p < l;
                    p++
                  ) {
                    var v = i[u >>> 24] ^ r[(c >>> 16) & 255] ^ o[(f >>> 8) & 255] ^ a[255 & d] ^ n[h++],
                      _ = i[c >>> 24] ^ r[(f >>> 16) & 255] ^ o[(d >>> 8) & 255] ^ a[255 & u] ^ n[h++],
                      m = i[f >>> 24] ^ r[(d >>> 16) & 255] ^ o[(u >>> 8) & 255] ^ a[255 & c] ^ n[h++],
                      g = i[d >>> 24] ^ r[(u >>> 16) & 255] ^ o[(c >>> 8) & 255] ^ a[255 & f] ^ n[h++];
                    (u = v), (c = _), (f = m), (d = g);
                  }
                  (v =
                    ((s[u >>> 24] << 24) |
                      (s[(c >>> 16) & 255] << 16) |
                      (s[(f >>> 8) & 255] << 8) |
                      s[255 & d]) ^
                    n[h++]),
                    (_ =
                      ((s[c >>> 24] << 24) |
                        (s[(f >>> 16) & 255] << 16) |
                        (s[(d >>> 8) & 255] << 8) |
                        s[255 & u]) ^
                      n[h++]),
                    (m =
                      ((s[f >>> 24] << 24) |
                        (s[(d >>> 16) & 255] << 16) |
                        (s[(u >>> 8) & 255] << 8) |
                        s[255 & c]) ^
                      n[h++]),
                    (g =
                      ((s[d >>> 24] << 24) |
                        (s[(u >>> 16) & 255] << 16) |
                        (s[(c >>> 8) & 255] << 8) |
                        s[255 & f]) ^
                      n[h++]),
                    (e[t] = v),
                    (e[t + 1] = _),
                    (e[t + 2] = m),
                    (e[t + 3] = g);
                },
                keySize: 8
              }));
            e.AES = t._createHelper(v);
          })(),
          o.AES);
      })();
    },
    6253: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7324),
          void (
            o.lib.Cipher ||
            (function (e) {
              var t = o,
                n = t.lib,
                i = n.Base,
                r = n.WordArray,
                a = n.BufferedBlockAlgorithm,
                s = t.enc,
                l = (s.Utf8, s.Base64),
                u = t.algo.EvpKDF,
                c = (n.Cipher = a.extend({
                  cfg: i.extend(),
                  createEncryptor: function (e, t) {
                    return this.create(this._ENC_XFORM_MODE, e, t);
                  },
                  createDecryptor: function (e, t) {
                    return this.create(this._DEC_XFORM_MODE, e, t);
                  },
                  init: function (e, t, n) {
                    (this.cfg = this.cfg.extend(n)), (this._xformMode = e), (this._key = t), this.reset();
                  },
                  reset: function () {
                    a.reset.call(this), this._doReset();
                  },
                  process: function (e) {
                    return this._append(e), this._process();
                  },
                  finalize: function (e) {
                    return e && this._append(e), this._doFinalize();
                  },
                  keySize: 4,
                  ivSize: 4,
                  _ENC_XFORM_MODE: 1,
                  _DEC_XFORM_MODE: 2,
                  _createHelper: (function () {
                    function e(e) {
                      return 'string' == typeof e ? w : m;
                    }
                    return function (t) {
                      return {
                        encrypt: function (n, i, r) {
                          return e(i).encrypt(t, n, i, r);
                        },
                        decrypt: function (n, i, r) {
                          return e(i).decrypt(t, n, i, r);
                        }
                      };
                    };
                  })()
                })),
                f =
                  ((n.StreamCipher = c.extend({
                    _doFinalize: function () {
                      return this._process(!0);
                    },
                    blockSize: 1
                  })),
                  (t.mode = {})),
                d = (n.BlockCipherMode = i.extend({
                  createEncryptor: function (e, t) {
                    return this.Encryptor.create(e, t);
                  },
                  createDecryptor: function (e, t) {
                    return this.Decryptor.create(e, t);
                  },
                  init: function (e, t) {
                    (this._cipher = e), (this._iv = t);
                  }
                })),
                h = (f.CBC = (function () {
                  var t = d.extend();
                  function n(t, n, i) {
                    var r,
                      o = this._iv;
                    o ? ((r = o), (this._iv = e)) : (r = this._prevBlock);
                    for (var a = 0; a < i; a++) t[n + a] ^= r[a];
                  }
                  return (
                    (t.Encryptor = t.extend({
                      processBlock: function (e, t) {
                        var i = this._cipher,
                          r = i.blockSize;
                        n.call(this, e, t, r), i.encryptBlock(e, t), (this._prevBlock = e.slice(t, t + r));
                      }
                    })),
                    (t.Decryptor = t.extend({
                      processBlock: function (e, t) {
                        var i = this._cipher,
                          r = i.blockSize,
                          o = e.slice(t, t + r);
                        i.decryptBlock(e, t), n.call(this, e, t, r), (this._prevBlock = o);
                      }
                    })),
                    t
                  );
                })()),
                p = ((t.pad = {}).Pkcs7 = {
                  pad: function (e, t) {
                    for (
                      var n = 4 * t,
                        i = n - (e.sigBytes % n),
                        o = (i << 24) | (i << 16) | (i << 8) | i,
                        a = [],
                        s = 0;
                      s < i;
                      s += 4
                    )
                      a.push(o);
                    var l = r.create(a, i);
                    e.concat(l);
                  },
                  unpad: function (e) {
                    var t = 255 & e.words[(e.sigBytes - 1) >>> 2];
                    e.sigBytes -= t;
                  }
                }),
                v =
                  ((n.BlockCipher = c.extend({
                    cfg: c.cfg.extend({ mode: h, padding: p }),
                    reset: function () {
                      var e;
                      c.reset.call(this);
                      var t = this.cfg,
                        n = t.iv,
                        i = t.mode;
                      this._xformMode == this._ENC_XFORM_MODE
                        ? (e = i.createEncryptor)
                        : ((e = i.createDecryptor), (this._minBufferSize = 1)),
                        this._mode && this._mode.__creator == e
                          ? this._mode.init(this, n && n.words)
                          : ((this._mode = e.call(i, this, n && n.words)), (this._mode.__creator = e));
                    },
                    _doProcessBlock: function (e, t) {
                      this._mode.processBlock(e, t);
                    },
                    _doFinalize: function () {
                      var e,
                        t = this.cfg.padding;
                      return (
                        this._xformMode == this._ENC_XFORM_MODE
                          ? (t.pad(this._data, this.blockSize), (e = this._process(!0)))
                          : ((e = this._process(!0)), t.unpad(e)),
                        e
                      );
                    },
                    blockSize: 4
                  })),
                  (n.CipherParams = i.extend({
                    init: function (e) {
                      this.mixIn(e);
                    },
                    toString: function (e) {
                      return (e || this.formatter).stringify(this);
                    }
                  }))),
                _ = ((t.format = {}).OpenSSL = {
                  stringify: function (e) {
                    var t = e.ciphertext,
                      n = e.salt;
                    return (n ? r.create([1398893684, 1701076831]).concat(n).concat(t) : t).toString(l);
                  },
                  parse: function (e) {
                    var t,
                      n = l.parse(e),
                      i = n.words;
                    return (
                      1398893684 == i[0] &&
                        1701076831 == i[1] &&
                        ((t = r.create(i.slice(2, 4))), i.splice(0, 4), (n.sigBytes -= 16)),
                      v.create({ ciphertext: n, salt: t })
                    );
                  }
                }),
                m = (n.SerializableCipher = i.extend({
                  cfg: i.extend({ format: _ }),
                  encrypt: function (e, t, n, i) {
                    i = this.cfg.extend(i);
                    var r = e.createEncryptor(n, i),
                      o = r.finalize(t),
                      a = r.cfg;
                    return v.create({
                      ciphertext: o,
                      key: n,
                      iv: a.iv,
                      algorithm: e,
                      mode: a.mode,
                      padding: a.padding,
                      blockSize: e.blockSize,
                      formatter: i.format
                    });
                  },
                  decrypt: function (e, t, n, i) {
                    return (
                      (i = this.cfg.extend(i)),
                      (t = this._parse(t, i.format)),
                      e.createDecryptor(n, i).finalize(t.ciphertext)
                    );
                  },
                  _parse: function (e, t) {
                    return 'string' == typeof e ? t.parse(e, this) : e;
                  }
                })),
                g = ((t.kdf = {}).OpenSSL = {
                  execute: function (e, t, n, i) {
                    i || (i = r.random(8));
                    var o = u.create({ keySize: t + n }).compute(e, i),
                      a = r.create(o.words.slice(t), 4 * n);
                    return (o.sigBytes = 4 * t), v.create({ key: o, iv: a, salt: i });
                  }
                }),
                w = (n.PasswordBasedCipher = m.extend({
                  cfg: m.cfg.extend({ kdf: g }),
                  encrypt: function (e, t, n, i) {
                    var r = (i = this.cfg.extend(i)).kdf.execute(n, e.keySize, e.ivSize);
                    i.iv = r.iv;
                    var o = m.encrypt.call(this, e, t, r.key, i);
                    return o.mixIn(r), o;
                  },
                  decrypt: function (e, t, n, i) {
                    (i = this.cfg.extend(i)), (t = this._parse(t, i.format));
                    var r = i.kdf.execute(n, e.keySize, e.ivSize, t.salt);
                    return (i.iv = r.iv), m.decrypt.call(this, e, t, r.key, i);
                  }
                }));
            })()
          ));
      })();
    },
    4526: function (e, t, n) {
      e.exports = (function () {
        var e =
          e ||
          (function (e, t) {
            var i;
            if (
              ('undefined' !== typeof window && window.crypto && (i = window.crypto),
              'undefined' !== typeof self && self.crypto && (i = self.crypto),
              'undefined' !== typeof globalThis && globalThis.crypto && (i = globalThis.crypto),
              !i && 'undefined' !== typeof window && window.msCrypto && (i = window.msCrypto),
              !i && 'undefined' !== typeof n.g && n.g.crypto && (i = n.g.crypto),
              !i)
            )
              try {
                i = n(4390);
              } catch (_) {}
            var r = function () {
                if (i) {
                  if ('function' === typeof i.getRandomValues)
                    try {
                      return i.getRandomValues(new Uint32Array(1))[0];
                    } catch (_) {}
                  if ('function' === typeof i.randomBytes)
                    try {
                      return i.randomBytes(4).readInt32LE();
                    } catch (_) {}
                }
                throw new Error('Native crypto module could not be used to get secure random number.');
              },
              o =
                Object.create ||
                (function () {
                  function e() {}
                  return function (t) {
                    var n;
                    return (e.prototype = t), (n = new e()), (e.prototype = null), n;
                  };
                })(),
              a = {},
              s = (a.lib = {}),
              l = (s.Base = {
                extend: function (e) {
                  var t = o(this);
                  return (
                    e && t.mixIn(e),
                    (t.hasOwnProperty('init') && this.init !== t.init) ||
                      (t.init = function () {
                        t.$super.init.apply(this, arguments);
                      }),
                    (t.init.prototype = t),
                    (t.$super = this),
                    t
                  );
                },
                create: function () {
                  var e = this.extend();
                  return e.init.apply(e, arguments), e;
                },
                init: function () {},
                mixIn: function (e) {
                  for (var t in e) e.hasOwnProperty(t) && (this[t] = e[t]);
                  e.hasOwnProperty('toString') && (this.toString = e.toString);
                },
                clone: function () {
                  return this.init.prototype.extend(this);
                }
              }),
              u = (s.WordArray = l.extend({
                init: function (e, n) {
                  (e = this.words = e || []), (this.sigBytes = n != t ? n : 4 * e.length);
                },
                toString: function (e) {
                  return (e || f).stringify(this);
                },
                concat: function (e) {
                  var t = this.words,
                    n = e.words,
                    i = this.sigBytes,
                    r = e.sigBytes;
                  if ((this.clamp(), i % 4))
                    for (var o = 0; o < r; o++) {
                      var a = (n[o >>> 2] >>> (24 - (o % 4) * 8)) & 255;
                      t[(i + o) >>> 2] |= a << (24 - ((i + o) % 4) * 8);
                    }
                  else for (var s = 0; s < r; s += 4) t[(i + s) >>> 2] = n[s >>> 2];
                  return (this.sigBytes += r), this;
                },
                clamp: function () {
                  var t = this.words,
                    n = this.sigBytes;
                  (t[n >>> 2] &= 4294967295 << (32 - (n % 4) * 8)), (t.length = e.ceil(n / 4));
                },
                clone: function () {
                  var e = l.clone.call(this);
                  return (e.words = this.words.slice(0)), e;
                },
                random: function (e) {
                  for (var t = [], n = 0; n < e; n += 4) t.push(r());
                  return new u.init(t, e);
                }
              })),
              c = (a.enc = {}),
              f = (c.Hex = {
                stringify: function (e) {
                  for (var t = e.words, n = e.sigBytes, i = [], r = 0; r < n; r++) {
                    var o = (t[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
                    i.push((o >>> 4).toString(16)), i.push((15 & o).toString(16));
                  }
                  return i.join('');
                },
                parse: function (e) {
                  for (var t = e.length, n = [], i = 0; i < t; i += 2)
                    n[i >>> 3] |= parseInt(e.substr(i, 2), 16) << (24 - (i % 8) * 4);
                  return new u.init(n, t / 2);
                }
              }),
              d = (c.Latin1 = {
                stringify: function (e) {
                  for (var t = e.words, n = e.sigBytes, i = [], r = 0; r < n; r++) {
                    var o = (t[r >>> 2] >>> (24 - (r % 4) * 8)) & 255;
                    i.push(String.fromCharCode(o));
                  }
                  return i.join('');
                },
                parse: function (e) {
                  for (var t = e.length, n = [], i = 0; i < t; i++)
                    n[i >>> 2] |= (255 & e.charCodeAt(i)) << (24 - (i % 4) * 8);
                  return new u.init(n, t);
                }
              }),
              h = (c.Utf8 = {
                stringify: function (e) {
                  try {
                    return decodeURIComponent(escape(d.stringify(e)));
                  } catch (t) {
                    throw new Error('Malformed UTF-8 data');
                  }
                },
                parse: function (e) {
                  return d.parse(unescape(encodeURIComponent(e)));
                }
              }),
              p = (s.BufferedBlockAlgorithm = l.extend({
                reset: function () {
                  (this._data = new u.init()), (this._nDataBytes = 0);
                },
                _append: function (e) {
                  'string' == typeof e && (e = h.parse(e)),
                    this._data.concat(e),
                    (this._nDataBytes += e.sigBytes);
                },
                _process: function (t) {
                  var n,
                    i = this._data,
                    r = i.words,
                    o = i.sigBytes,
                    a = this.blockSize,
                    s = o / (4 * a),
                    l = (s = t ? e.ceil(s) : e.max((0 | s) - this._minBufferSize, 0)) * a,
                    c = e.min(4 * l, o);
                  if (l) {
                    for (var f = 0; f < l; f += a) this._doProcessBlock(r, f);
                    (n = r.splice(0, l)), (i.sigBytes -= c);
                  }
                  return new u.init(n, c);
                },
                clone: function () {
                  var e = l.clone.call(this);
                  return (e._data = this._data.clone()), e;
                },
                _minBufferSize: 0
              })),
              v =
                ((s.Hasher = p.extend({
                  cfg: l.extend(),
                  init: function (e) {
                    (this.cfg = this.cfg.extend(e)), this.reset();
                  },
                  reset: function () {
                    p.reset.call(this), this._doReset();
                  },
                  update: function (e) {
                    return this._append(e), this._process(), this;
                  },
                  finalize: function (e) {
                    return e && this._append(e), this._doFinalize();
                  },
                  blockSize: 16,
                  _createHelper: function (e) {
                    return function (t, n) {
                      return new e.init(n).finalize(t);
                    };
                  },
                  _createHmacHelper: function (e) {
                    return function (t, n) {
                      return new v.HMAC.init(e, n).finalize(t);
                    };
                  }
                })),
                (a.algo = {}));
            return a;
          })(Math);
        return e;
      })();
    },
    7500: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function () {
            var e = r,
              t = e.lib.WordArray;
            function n(e, n, i) {
              for (var r = [], o = 0, a = 0; a < n; a++)
                if (a % 4) {
                  var s =
                    (i[e.charCodeAt(a - 1)] << ((a % 4) * 2)) | (i[e.charCodeAt(a)] >>> (6 - (a % 4) * 2));
                  (r[o >>> 2] |= s << (24 - (o % 4) * 8)), o++;
                }
              return t.create(r, o);
            }
            e.enc.Base64 = {
              stringify: function (e) {
                var t = e.words,
                  n = e.sigBytes,
                  i = this._map;
                e.clamp();
                for (var r = [], o = 0; o < n; o += 3)
                  for (
                    var a =
                        (((t[o >>> 2] >>> (24 - (o % 4) * 8)) & 255) << 16) |
                        (((t[(o + 1) >>> 2] >>> (24 - ((o + 1) % 4) * 8)) & 255) << 8) |
                        ((t[(o + 2) >>> 2] >>> (24 - ((o + 2) % 4) * 8)) & 255),
                      s = 0;
                    s < 4 && o + 0.75 * s < n;
                    s++
                  )
                    r.push(i.charAt((a >>> (6 * (3 - s))) & 63));
                var l = i.charAt(64);
                if (l) for (; r.length % 4; ) r.push(l);
                return r.join('');
              },
              parse: function (e) {
                var t = e.length,
                  i = this._map,
                  r = this._reverseMap;
                if (!r) {
                  r = this._reverseMap = [];
                  for (var o = 0; o < i.length; o++) r[i.charCodeAt(o)] = o;
                }
                var a = i.charAt(64);
                if (a) {
                  var s = e.indexOf(a);
                  -1 !== s && (t = s);
                }
                return n(e, t, r);
              },
              _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
            };
          })(),
          r.enc.Base64);
      })();
    },
    2408: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function () {
            var e = r,
              t = e.lib.WordArray;
            function n(e, n, i) {
              for (var r = [], o = 0, a = 0; a < n; a++)
                if (a % 4) {
                  var s =
                    (i[e.charCodeAt(a - 1)] << ((a % 4) * 2)) | (i[e.charCodeAt(a)] >>> (6 - (a % 4) * 2));
                  (r[o >>> 2] |= s << (24 - (o % 4) * 8)), o++;
                }
              return t.create(r, o);
            }
            e.enc.Base64url = {
              stringify: function (e, t = !0) {
                var n = e.words,
                  i = e.sigBytes,
                  r = t ? this._safe_map : this._map;
                e.clamp();
                for (var o = [], a = 0; a < i; a += 3)
                  for (
                    var s =
                        (((n[a >>> 2] >>> (24 - (a % 4) * 8)) & 255) << 16) |
                        (((n[(a + 1) >>> 2] >>> (24 - ((a + 1) % 4) * 8)) & 255) << 8) |
                        ((n[(a + 2) >>> 2] >>> (24 - ((a + 2) % 4) * 8)) & 255),
                      l = 0;
                    l < 4 && a + 0.75 * l < i;
                    l++
                  )
                    o.push(r.charAt((s >>> (6 * (3 - l))) & 63));
                var u = r.charAt(64);
                if (u) for (; o.length % 4; ) o.push(u);
                return o.join('');
              },
              parse: function (e, t = !0) {
                var i = e.length,
                  r = t ? this._safe_map : this._map,
                  o = this._reverseMap;
                if (!o) {
                  o = this._reverseMap = [];
                  for (var a = 0; a < r.length; a++) o[r.charCodeAt(a)] = a;
                }
                var s = r.charAt(64);
                if (s) {
                  var l = e.indexOf(s);
                  -1 !== l && (i = l);
                }
                return n(e, i, o);
              },
              _map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=',
              _safe_map: 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'
            };
          })(),
          r.enc.Base64url);
      })();
    },
    1661: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function () {
            var e = r,
              t = e.lib.WordArray,
              n = e.enc;
            function i(e) {
              return ((e << 8) & 4278255360) | ((e >>> 8) & 16711935);
            }
            (n.Utf16 = n.Utf16BE =
              {
                stringify: function (e) {
                  for (var t = e.words, n = e.sigBytes, i = [], r = 0; r < n; r += 2) {
                    var o = (t[r >>> 2] >>> (16 - (r % 4) * 8)) & 65535;
                    i.push(String.fromCharCode(o));
                  }
                  return i.join('');
                },
                parse: function (e) {
                  for (var n = e.length, i = [], r = 0; r < n; r++)
                    i[r >>> 1] |= e.charCodeAt(r) << (16 - (r % 2) * 16);
                  return t.create(i, 2 * n);
                }
              }),
              (n.Utf16LE = {
                stringify: function (e) {
                  for (var t = e.words, n = e.sigBytes, r = [], o = 0; o < n; o += 2) {
                    var a = i((t[o >>> 2] >>> (16 - (o % 4) * 8)) & 65535);
                    r.push(String.fromCharCode(a));
                  }
                  return r.join('');
                },
                parse: function (e) {
                  for (var n = e.length, r = [], o = 0; o < n; o++)
                    r[o >>> 1] |= i(e.charCodeAt(o) << (16 - (o % 2) * 16));
                  return t.create(r, 2 * n);
                }
              });
          })(),
          r.enc.Utf16);
      })();
    },
    7324: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(1504),
          n(4107),
          (function () {
            var e = o,
              t = e.lib,
              n = t.Base,
              i = t.WordArray,
              r = e.algo,
              a = r.MD5,
              s = (r.EvpKDF = n.extend({
                cfg: n.extend({ keySize: 4, hasher: a, iterations: 1 }),
                init: function (e) {
                  this.cfg = this.cfg.extend(e);
                },
                compute: function (e, t) {
                  for (
                    var n,
                      r = this.cfg,
                      o = r.hasher.create(),
                      a = i.create(),
                      s = a.words,
                      l = r.keySize,
                      u = r.iterations;
                    s.length < l;

                  ) {
                    n && o.update(n), (n = o.update(e).finalize(t)), o.reset();
                    for (var c = 1; c < u; c++) (n = o.finalize(n)), o.reset();
                    a.concat(n);
                  }
                  return (a.sigBytes = 4 * l), a;
                }
              }));
            e.EvpKDF = function (e, t, n) {
              return s.create(n).compute(e, t);
            };
          })(),
          o.EvpKDF);
      })();
    },
    3355: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (function (e) {
            var t = o,
              n = t.lib.CipherParams,
              i = t.enc.Hex;
            t.format.Hex = {
              stringify: function (e) {
                return e.ciphertext.toString(i);
              },
              parse: function (e) {
                var t = i.parse(e);
                return n.create({ ciphertext: t });
              }
            };
          })(),
          o.format.Hex);
      })();
    },
    4107: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          void (function () {
            var e = r,
              t = e.lib.Base,
              n = e.enc.Utf8;
            e.algo.HMAC = t.extend({
              init: function (e, t) {
                (e = this._hasher = new e.init()), 'string' == typeof t && (t = n.parse(t));
                var i = e.blockSize,
                  r = 4 * i;
                t.sigBytes > r && (t = e.finalize(t)), t.clamp();
                for (
                  var o = (this._oKey = t.clone()),
                    a = (this._iKey = t.clone()),
                    s = o.words,
                    l = a.words,
                    u = 0;
                  u < i;
                  u++
                )
                  (s[u] ^= 1549556828), (l[u] ^= 909522486);
                (o.sigBytes = a.sigBytes = r), this.reset();
              },
              reset: function () {
                var e = this._hasher;
                e.reset(), e.update(this._iKey);
              },
              update: function (e) {
                return this._hasher.update(e), this;
              },
              finalize: function (e) {
                var t = this._hasher,
                  n = t.finalize(e);
                return t.reset(), t.finalize(this._oKey.clone().concat(n));
              }
            });
          })());
      })();
    },
    7675: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6140),
          n(8714),
          n(1661),
          n(7500),
          n(2408),
          n(8540),
          n(1504),
          n(3856),
          n(9299),
          n(5791),
          n(860),
          n(4733),
          n(3330),
          n(4107),
          n(5238),
          n(7324),
          n(6253),
          n(7524),
          n(3501),
          n(1345),
          n(192),
          n(158),
          n(8930),
          n(499),
          n(4735),
          n(2637),
          n(9523),
          n(3355),
          n(6638),
          n(4173),
          n(172),
          n(9142),
          n(9958),
          o);
      })();
    },
    8714: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function () {
            if ('function' == typeof ArrayBuffer) {
              var e = r.lib.WordArray,
                t = e.init,
                n = (e.init = function (e) {
                  if (
                    (e instanceof ArrayBuffer && (e = new Uint8Array(e)),
                    (e instanceof Int8Array ||
                      ('undefined' !== typeof Uint8ClampedArray && e instanceof Uint8ClampedArray) ||
                      e instanceof Int16Array ||
                      e instanceof Uint16Array ||
                      e instanceof Int32Array ||
                      e instanceof Uint32Array ||
                      e instanceof Float32Array ||
                      e instanceof Float64Array) &&
                      (e = new Uint8Array(e.buffer, e.byteOffset, e.byteLength)),
                    e instanceof Uint8Array)
                  ) {
                    for (var n = e.byteLength, i = [], r = 0; r < n; r++)
                      i[r >>> 2] |= e[r] << (24 - (r % 4) * 8);
                    t.call(this, i, n);
                  } else t.apply(this, arguments);
                });
              n.prototype = e;
            }
          })(),
          r.lib.WordArray);
      })();
    },
    8540: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function (e) {
            var t = r,
              n = t.lib,
              i = n.WordArray,
              o = n.Hasher,
              a = t.algo,
              s = [];
            !(function () {
              for (var t = 0; t < 64; t++) s[t] = (4294967296 * e.abs(e.sin(t + 1))) | 0;
            })();
            var l = (a.MD5 = o.extend({
              _doReset: function () {
                this._hash = new i.init([1732584193, 4023233417, 2562383102, 271733878]);
              },
              _doProcessBlock: function (e, t) {
                for (var n = 0; n < 16; n++) {
                  var i = t + n,
                    r = e[i];
                  e[i] = (16711935 & ((r << 8) | (r >>> 24))) | (4278255360 & ((r << 24) | (r >>> 8)));
                }
                var o = this._hash.words,
                  a = e[t + 0],
                  l = e[t + 1],
                  h = e[t + 2],
                  p = e[t + 3],
                  v = e[t + 4],
                  _ = e[t + 5],
                  m = e[t + 6],
                  g = e[t + 7],
                  w = e[t + 8],
                  y = e[t + 9],
                  b = e[t + 10],
                  x = e[t + 11],
                  E = e[t + 12],
                  k = e[t + 13],
                  C = e[t + 14],
                  S = e[t + 15],
                  N = o[0],
                  j = o[1],
                  z = o[2],
                  O = o[3];
                (N = u(N, j, z, O, a, 7, s[0])),
                  (O = u(O, N, j, z, l, 12, s[1])),
                  (z = u(z, O, N, j, h, 17, s[2])),
                  (j = u(j, z, O, N, p, 22, s[3])),
                  (N = u(N, j, z, O, v, 7, s[4])),
                  (O = u(O, N, j, z, _, 12, s[5])),
                  (z = u(z, O, N, j, m, 17, s[6])),
                  (j = u(j, z, O, N, g, 22, s[7])),
                  (N = u(N, j, z, O, w, 7, s[8])),
                  (O = u(O, N, j, z, y, 12, s[9])),
                  (z = u(z, O, N, j, b, 17, s[10])),
                  (j = u(j, z, O, N, x, 22, s[11])),
                  (N = u(N, j, z, O, E, 7, s[12])),
                  (O = u(O, N, j, z, k, 12, s[13])),
                  (z = u(z, O, N, j, C, 17, s[14])),
                  (N = c(N, (j = u(j, z, O, N, S, 22, s[15])), z, O, l, 5, s[16])),
                  (O = c(O, N, j, z, m, 9, s[17])),
                  (z = c(z, O, N, j, x, 14, s[18])),
                  (j = c(j, z, O, N, a, 20, s[19])),
                  (N = c(N, j, z, O, _, 5, s[20])),
                  (O = c(O, N, j, z, b, 9, s[21])),
                  (z = c(z, O, N, j, S, 14, s[22])),
                  (j = c(j, z, O, N, v, 20, s[23])),
                  (N = c(N, j, z, O, y, 5, s[24])),
                  (O = c(O, N, j, z, C, 9, s[25])),
                  (z = c(z, O, N, j, p, 14, s[26])),
                  (j = c(j, z, O, N, w, 20, s[27])),
                  (N = c(N, j, z, O, k, 5, s[28])),
                  (O = c(O, N, j, z, h, 9, s[29])),
                  (z = c(z, O, N, j, g, 14, s[30])),
                  (N = f(N, (j = c(j, z, O, N, E, 20, s[31])), z, O, _, 4, s[32])),
                  (O = f(O, N, j, z, w, 11, s[33])),
                  (z = f(z, O, N, j, x, 16, s[34])),
                  (j = f(j, z, O, N, C, 23, s[35])),
                  (N = f(N, j, z, O, l, 4, s[36])),
                  (O = f(O, N, j, z, v, 11, s[37])),
                  (z = f(z, O, N, j, g, 16, s[38])),
                  (j = f(j, z, O, N, b, 23, s[39])),
                  (N = f(N, j, z, O, k, 4, s[40])),
                  (O = f(O, N, j, z, a, 11, s[41])),
                  (z = f(z, O, N, j, p, 16, s[42])),
                  (j = f(j, z, O, N, m, 23, s[43])),
                  (N = f(N, j, z, O, y, 4, s[44])),
                  (O = f(O, N, j, z, E, 11, s[45])),
                  (z = f(z, O, N, j, S, 16, s[46])),
                  (N = d(N, (j = f(j, z, O, N, h, 23, s[47])), z, O, a, 6, s[48])),
                  (O = d(O, N, j, z, g, 10, s[49])),
                  (z = d(z, O, N, j, C, 15, s[50])),
                  (j = d(j, z, O, N, _, 21, s[51])),
                  (N = d(N, j, z, O, E, 6, s[52])),
                  (O = d(O, N, j, z, p, 10, s[53])),
                  (z = d(z, O, N, j, b, 15, s[54])),
                  (j = d(j, z, O, N, l, 21, s[55])),
                  (N = d(N, j, z, O, w, 6, s[56])),
                  (O = d(O, N, j, z, S, 10, s[57])),
                  (z = d(z, O, N, j, m, 15, s[58])),
                  (j = d(j, z, O, N, k, 21, s[59])),
                  (N = d(N, j, z, O, v, 6, s[60])),
                  (O = d(O, N, j, z, x, 10, s[61])),
                  (z = d(z, O, N, j, h, 15, s[62])),
                  (j = d(j, z, O, N, y, 21, s[63])),
                  (o[0] = (o[0] + N) | 0),
                  (o[1] = (o[1] + j) | 0),
                  (o[2] = (o[2] + z) | 0),
                  (o[3] = (o[3] + O) | 0);
              },
              _doFinalize: function () {
                var t = this._data,
                  n = t.words,
                  i = 8 * this._nDataBytes,
                  r = 8 * t.sigBytes;
                n[r >>> 5] |= 128 << (24 - (r % 32));
                var o = e.floor(i / 4294967296),
                  a = i;
                (n[15 + (((r + 64) >>> 9) << 4)] =
                  (16711935 & ((o << 8) | (o >>> 24))) | (4278255360 & ((o << 24) | (o >>> 8)))),
                  (n[14 + (((r + 64) >>> 9) << 4)] =
                    (16711935 & ((a << 8) | (a >>> 24))) | (4278255360 & ((a << 24) | (a >>> 8)))),
                  (t.sigBytes = 4 * (n.length + 1)),
                  this._process();
                for (var s = this._hash, l = s.words, u = 0; u < 4; u++) {
                  var c = l[u];
                  l[u] = (16711935 & ((c << 8) | (c >>> 24))) | (4278255360 & ((c << 24) | (c >>> 8)));
                }
                return s;
              },
              clone: function () {
                var e = o.clone.call(this);
                return (e._hash = this._hash.clone()), e;
              }
            }));
            function u(e, t, n, i, r, o, a) {
              var s = e + ((t & n) | (~t & i)) + r + a;
              return ((s << o) | (s >>> (32 - o))) + t;
            }
            function c(e, t, n, i, r, o, a) {
              var s = e + ((t & i) | (n & ~i)) + r + a;
              return ((s << o) | (s >>> (32 - o))) + t;
            }
            function f(e, t, n, i, r, o, a) {
              var s = e + (t ^ n ^ i) + r + a;
              return ((s << o) | (s >>> (32 - o))) + t;
            }
            function d(e, t, n, i, r, o, a) {
              var s = e + (n ^ (t | ~i)) + r + a;
              return ((s << o) | (s >>> (32 - o))) + t;
            }
            (t.MD5 = o._createHelper(l)), (t.HmacMD5 = o._createHmacHelper(l));
          })(Math),
          r.MD5);
      })();
    },
    7524: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.mode.CFB = (function () {
            var e = o.lib.BlockCipherMode.extend();
            function t(e, t, n, i) {
              var r,
                o = this._iv;
              o ? ((r = o.slice(0)), (this._iv = void 0)) : (r = this._prevBlock), i.encryptBlock(r, 0);
              for (var a = 0; a < n; a++) e[t + a] ^= r[a];
            }
            return (
              (e.Encryptor = e.extend({
                processBlock: function (e, n) {
                  var i = this._cipher,
                    r = i.blockSize;
                  t.call(this, e, n, r, i), (this._prevBlock = e.slice(n, n + r));
                }
              })),
              (e.Decryptor = e.extend({
                processBlock: function (e, n) {
                  var i = this._cipher,
                    r = i.blockSize,
                    o = e.slice(n, n + r);
                  t.call(this, e, n, r, i), (this._prevBlock = o);
                }
              })),
              e
            );
          })()),
          o.mode.CFB);
      })();
    },
    1345: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.mode.CTRGladman = (function () {
            var e = o.lib.BlockCipherMode.extend();
            function t(e) {
              if (255 === ((e >> 24) & 255)) {
                var t = (e >> 16) & 255,
                  n = (e >> 8) & 255,
                  i = 255 & e;
                255 === t ? ((t = 0), 255 === n ? ((n = 0), 255 === i ? (i = 0) : ++i) : ++n) : ++t,
                  (e = 0),
                  (e += t << 16),
                  (e += n << 8),
                  (e += i);
              } else e += 1 << 24;
              return e;
            }
            function n(e) {
              return 0 === (e[0] = t(e[0])) && (e[1] = t(e[1])), e;
            }
            var i = (e.Encryptor = e.extend({
              processBlock: function (e, t) {
                var i = this._cipher,
                  r = i.blockSize,
                  o = this._iv,
                  a = this._counter;
                o && ((a = this._counter = o.slice(0)), (this._iv = void 0)), n(a);
                var s = a.slice(0);
                i.encryptBlock(s, 0);
                for (var l = 0; l < r; l++) e[t + l] ^= s[l];
              }
            }));
            return (e.Decryptor = i), e;
          })()),
          o.mode.CTRGladman);
      })();
    },
    3501: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.mode.CTR = (function () {
            var e = o.lib.BlockCipherMode.extend(),
              t = (e.Encryptor = e.extend({
                processBlock: function (e, t) {
                  var n = this._cipher,
                    i = n.blockSize,
                    r = this._iv,
                    o = this._counter;
                  r && ((o = this._counter = r.slice(0)), (this._iv = void 0));
                  var a = o.slice(0);
                  n.encryptBlock(a, 0), (o[i - 1] = (o[i - 1] + 1) | 0);
                  for (var s = 0; s < i; s++) e[t + s] ^= a[s];
                }
              }));
            return (e.Decryptor = t), e;
          })()),
          o.mode.CTR);
      })();
    },
    158: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.mode.ECB = (function () {
            var e = o.lib.BlockCipherMode.extend();
            return (
              (e.Encryptor = e.extend({
                processBlock: function (e, t) {
                  this._cipher.encryptBlock(e, t);
                }
              })),
              (e.Decryptor = e.extend({
                processBlock: function (e, t) {
                  this._cipher.decryptBlock(e, t);
                }
              })),
              e
            );
          })()),
          o.mode.ECB);
      })();
    },
    192: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.mode.OFB = (function () {
            var e = o.lib.BlockCipherMode.extend(),
              t = (e.Encryptor = e.extend({
                processBlock: function (e, t) {
                  var n = this._cipher,
                    i = n.blockSize,
                    r = this._iv,
                    o = this._keystream;
                  r && ((o = this._keystream = r.slice(0)), (this._iv = void 0)), n.encryptBlock(o, 0);
                  for (var a = 0; a < i; a++) e[t + a] ^= o[a];
                }
              }));
            return (e.Decryptor = t), e;
          })()),
          o.mode.OFB);
      })();
    },
    8930: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.pad.AnsiX923 = {
            pad: function (e, t) {
              var n = e.sigBytes,
                i = 4 * t,
                r = i - (n % i),
                o = n + r - 1;
              e.clamp(), (e.words[o >>> 2] |= r << (24 - (o % 4) * 8)), (e.sigBytes += r);
            },
            unpad: function (e) {
              var t = 255 & e.words[(e.sigBytes - 1) >>> 2];
              e.sigBytes -= t;
            }
          }),
          o.pad.Ansix923);
      })();
    },
    499: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.pad.Iso10126 = {
            pad: function (e, t) {
              var n = 4 * t,
                i = n - (e.sigBytes % n);
              e.concat(o.lib.WordArray.random(i - 1)).concat(o.lib.WordArray.create([i << 24], 1));
            },
            unpad: function (e) {
              var t = 255 & e.words[(e.sigBytes - 1) >>> 2];
              e.sigBytes -= t;
            }
          }),
          o.pad.Iso10126);
      })();
    },
    4735: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.pad.Iso97971 = {
            pad: function (e, t) {
              e.concat(o.lib.WordArray.create([2147483648], 1)), o.pad.ZeroPadding.pad(e, t);
            },
            unpad: function (e) {
              o.pad.ZeroPadding.unpad(e), e.sigBytes--;
            }
          }),
          o.pad.Iso97971);
      })();
    },
    9523: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.pad.NoPadding = { pad: function () {}, unpad: function () {} }),
          o.pad.NoPadding);
      })();
    },
    2637: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6253),
          (o.pad.ZeroPadding = {
            pad: function (e, t) {
              var n = 4 * t;
              e.clamp(), (e.sigBytes += n - (e.sigBytes % n || n));
            },
            unpad: function (e) {
              var t = e.words,
                n = e.sigBytes - 1;
              for (n = e.sigBytes - 1; n >= 0; n--)
                if ((t[n >>> 2] >>> (24 - (n % 4) * 8)) & 255) {
                  e.sigBytes = n + 1;
                  break;
                }
            }
          }),
          o.pad.ZeroPadding);
      })();
    },
    5238: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(1504),
          n(4107),
          (function () {
            var e = o,
              t = e.lib,
              n = t.Base,
              i = t.WordArray,
              r = e.algo,
              a = r.SHA1,
              s = r.HMAC,
              l = (r.PBKDF2 = n.extend({
                cfg: n.extend({ keySize: 4, hasher: a, iterations: 1 }),
                init: function (e) {
                  this.cfg = this.cfg.extend(e);
                },
                compute: function (e, t) {
                  for (
                    var n = this.cfg,
                      r = s.create(n.hasher, e),
                      o = i.create(),
                      a = i.create([1]),
                      l = o.words,
                      u = a.words,
                      c = n.keySize,
                      f = n.iterations;
                    l.length < c;

                  ) {
                    var d = r.update(t).finalize(a);
                    r.reset();
                    for (var h = d.words, p = h.length, v = d, _ = 1; _ < f; _++) {
                      (v = r.finalize(v)), r.reset();
                      for (var m = v.words, g = 0; g < p; g++) h[g] ^= m[g];
                    }
                    o.concat(d), u[0]++;
                  }
                  return (o.sigBytes = 4 * c), o;
                }
              }));
            e.PBKDF2 = function (e, t, n) {
              return l.create(n).compute(e, t);
            };
          })(),
          o.PBKDF2);
      })();
    },
    9958: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7500),
          n(8540),
          n(7324),
          n(6253),
          (function () {
            var e = o,
              t = e.lib.StreamCipher,
              n = e.algo,
              i = [],
              r = [],
              a = [],
              s = (n.RabbitLegacy = t.extend({
                _doReset: function () {
                  var e = this._key.words,
                    t = this.cfg.iv,
                    n = (this._X = [
                      e[0],
                      (e[3] << 16) | (e[2] >>> 16),
                      e[1],
                      (e[0] << 16) | (e[3] >>> 16),
                      e[2],
                      (e[1] << 16) | (e[0] >>> 16),
                      e[3],
                      (e[2] << 16) | (e[1] >>> 16)
                    ]),
                    i = (this._C = [
                      (e[2] << 16) | (e[2] >>> 16),
                      (4294901760 & e[0]) | (65535 & e[1]),
                      (e[3] << 16) | (e[3] >>> 16),
                      (4294901760 & e[1]) | (65535 & e[2]),
                      (e[0] << 16) | (e[0] >>> 16),
                      (4294901760 & e[2]) | (65535 & e[3]),
                      (e[1] << 16) | (e[1] >>> 16),
                      (4294901760 & e[3]) | (65535 & e[0])
                    ]);
                  this._b = 0;
                  for (var r = 0; r < 4; r++) l.call(this);
                  for (r = 0; r < 8; r++) i[r] ^= n[(r + 4) & 7];
                  if (t) {
                    var o = t.words,
                      a = o[0],
                      s = o[1],
                      u = (16711935 & ((a << 8) | (a >>> 24))) | (4278255360 & ((a << 24) | (a >>> 8))),
                      c = (16711935 & ((s << 8) | (s >>> 24))) | (4278255360 & ((s << 24) | (s >>> 8))),
                      f = (u >>> 16) | (4294901760 & c),
                      d = (c << 16) | (65535 & u);
                    for (
                      i[0] ^= u,
                        i[1] ^= f,
                        i[2] ^= c,
                        i[3] ^= d,
                        i[4] ^= u,
                        i[5] ^= f,
                        i[6] ^= c,
                        i[7] ^= d,
                        r = 0;
                      r < 4;
                      r++
                    )
                      l.call(this);
                  }
                },
                _doProcessBlock: function (e, t) {
                  var n = this._X;
                  l.call(this),
                    (i[0] = n[0] ^ (n[5] >>> 16) ^ (n[3] << 16)),
                    (i[1] = n[2] ^ (n[7] >>> 16) ^ (n[5] << 16)),
                    (i[2] = n[4] ^ (n[1] >>> 16) ^ (n[7] << 16)),
                    (i[3] = n[6] ^ (n[3] >>> 16) ^ (n[1] << 16));
                  for (var r = 0; r < 4; r++)
                    (i[r] =
                      (16711935 & ((i[r] << 8) | (i[r] >>> 24))) |
                      (4278255360 & ((i[r] << 24) | (i[r] >>> 8)))),
                      (e[t + r] ^= i[r]);
                },
                blockSize: 4,
                ivSize: 2
              }));
            function l() {
              for (var e = this._X, t = this._C, n = 0; n < 8; n++) r[n] = t[n];
              for (
                t[0] = (t[0] + 1295307597 + this._b) | 0,
                  t[1] = (t[1] + 3545052371 + (t[0] >>> 0 < r[0] >>> 0 ? 1 : 0)) | 0,
                  t[2] = (t[2] + 886263092 + (t[1] >>> 0 < r[1] >>> 0 ? 1 : 0)) | 0,
                  t[3] = (t[3] + 1295307597 + (t[2] >>> 0 < r[2] >>> 0 ? 1 : 0)) | 0,
                  t[4] = (t[4] + 3545052371 + (t[3] >>> 0 < r[3] >>> 0 ? 1 : 0)) | 0,
                  t[5] = (t[5] + 886263092 + (t[4] >>> 0 < r[4] >>> 0 ? 1 : 0)) | 0,
                  t[6] = (t[6] + 1295307597 + (t[5] >>> 0 < r[5] >>> 0 ? 1 : 0)) | 0,
                  t[7] = (t[7] + 3545052371 + (t[6] >>> 0 < r[6] >>> 0 ? 1 : 0)) | 0,
                  this._b = t[7] >>> 0 < r[7] >>> 0 ? 1 : 0,
                  n = 0;
                n < 8;
                n++
              ) {
                var i = e[n] + t[n],
                  o = 65535 & i,
                  s = i >>> 16,
                  l = ((((o * o) >>> 17) + o * s) >>> 15) + s * s,
                  u = (((4294901760 & i) * i) | 0) + (((65535 & i) * i) | 0);
                a[n] = l ^ u;
              }
              (e[0] = (a[0] + ((a[7] << 16) | (a[7] >>> 16)) + ((a[6] << 16) | (a[6] >>> 16))) | 0),
                (e[1] = (a[1] + ((a[0] << 8) | (a[0] >>> 24)) + a[7]) | 0),
                (e[2] = (a[2] + ((a[1] << 16) | (a[1] >>> 16)) + ((a[0] << 16) | (a[0] >>> 16))) | 0),
                (e[3] = (a[3] + ((a[2] << 8) | (a[2] >>> 24)) + a[1]) | 0),
                (e[4] = (a[4] + ((a[3] << 16) | (a[3] >>> 16)) + ((a[2] << 16) | (a[2] >>> 16))) | 0),
                (e[5] = (a[5] + ((a[4] << 8) | (a[4] >>> 24)) + a[3]) | 0),
                (e[6] = (a[6] + ((a[5] << 16) | (a[5] >>> 16)) + ((a[4] << 16) | (a[4] >>> 16))) | 0),
                (e[7] = (a[7] + ((a[6] << 8) | (a[6] >>> 24)) + a[5]) | 0);
            }
            e.RabbitLegacy = t._createHelper(s);
          })(),
          o.RabbitLegacy);
      })();
    },
    9142: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7500),
          n(8540),
          n(7324),
          n(6253),
          (function () {
            var e = o,
              t = e.lib.StreamCipher,
              n = e.algo,
              i = [],
              r = [],
              a = [],
              s = (n.Rabbit = t.extend({
                _doReset: function () {
                  for (var e = this._key.words, t = this.cfg.iv, n = 0; n < 4; n++)
                    e[n] =
                      (16711935 & ((e[n] << 8) | (e[n] >>> 24))) |
                      (4278255360 & ((e[n] << 24) | (e[n] >>> 8)));
                  var i = (this._X = [
                      e[0],
                      (e[3] << 16) | (e[2] >>> 16),
                      e[1],
                      (e[0] << 16) | (e[3] >>> 16),
                      e[2],
                      (e[1] << 16) | (e[0] >>> 16),
                      e[3],
                      (e[2] << 16) | (e[1] >>> 16)
                    ]),
                    r = (this._C = [
                      (e[2] << 16) | (e[2] >>> 16),
                      (4294901760 & e[0]) | (65535 & e[1]),
                      (e[3] << 16) | (e[3] >>> 16),
                      (4294901760 & e[1]) | (65535 & e[2]),
                      (e[0] << 16) | (e[0] >>> 16),
                      (4294901760 & e[2]) | (65535 & e[3]),
                      (e[1] << 16) | (e[1] >>> 16),
                      (4294901760 & e[3]) | (65535 & e[0])
                    ]);
                  for (this._b = 0, n = 0; n < 4; n++) l.call(this);
                  for (n = 0; n < 8; n++) r[n] ^= i[(n + 4) & 7];
                  if (t) {
                    var o = t.words,
                      a = o[0],
                      s = o[1],
                      u = (16711935 & ((a << 8) | (a >>> 24))) | (4278255360 & ((a << 24) | (a >>> 8))),
                      c = (16711935 & ((s << 8) | (s >>> 24))) | (4278255360 & ((s << 24) | (s >>> 8))),
                      f = (u >>> 16) | (4294901760 & c),
                      d = (c << 16) | (65535 & u);
                    for (
                      r[0] ^= u,
                        r[1] ^= f,
                        r[2] ^= c,
                        r[3] ^= d,
                        r[4] ^= u,
                        r[5] ^= f,
                        r[6] ^= c,
                        r[7] ^= d,
                        n = 0;
                      n < 4;
                      n++
                    )
                      l.call(this);
                  }
                },
                _doProcessBlock: function (e, t) {
                  var n = this._X;
                  l.call(this),
                    (i[0] = n[0] ^ (n[5] >>> 16) ^ (n[3] << 16)),
                    (i[1] = n[2] ^ (n[7] >>> 16) ^ (n[5] << 16)),
                    (i[2] = n[4] ^ (n[1] >>> 16) ^ (n[7] << 16)),
                    (i[3] = n[6] ^ (n[3] >>> 16) ^ (n[1] << 16));
                  for (var r = 0; r < 4; r++)
                    (i[r] =
                      (16711935 & ((i[r] << 8) | (i[r] >>> 24))) |
                      (4278255360 & ((i[r] << 24) | (i[r] >>> 8)))),
                      (e[t + r] ^= i[r]);
                },
                blockSize: 4,
                ivSize: 2
              }));
            function l() {
              for (var e = this._X, t = this._C, n = 0; n < 8; n++) r[n] = t[n];
              for (
                t[0] = (t[0] + 1295307597 + this._b) | 0,
                  t[1] = (t[1] + 3545052371 + (t[0] >>> 0 < r[0] >>> 0 ? 1 : 0)) | 0,
                  t[2] = (t[2] + 886263092 + (t[1] >>> 0 < r[1] >>> 0 ? 1 : 0)) | 0,
                  t[3] = (t[3] + 1295307597 + (t[2] >>> 0 < r[2] >>> 0 ? 1 : 0)) | 0,
                  t[4] = (t[4] + 3545052371 + (t[3] >>> 0 < r[3] >>> 0 ? 1 : 0)) | 0,
                  t[5] = (t[5] + 886263092 + (t[4] >>> 0 < r[4] >>> 0 ? 1 : 0)) | 0,
                  t[6] = (t[6] + 1295307597 + (t[5] >>> 0 < r[5] >>> 0 ? 1 : 0)) | 0,
                  t[7] = (t[7] + 3545052371 + (t[6] >>> 0 < r[6] >>> 0 ? 1 : 0)) | 0,
                  this._b = t[7] >>> 0 < r[7] >>> 0 ? 1 : 0,
                  n = 0;
                n < 8;
                n++
              ) {
                var i = e[n] + t[n],
                  o = 65535 & i,
                  s = i >>> 16,
                  l = ((((o * o) >>> 17) + o * s) >>> 15) + s * s,
                  u = (((4294901760 & i) * i) | 0) + (((65535 & i) * i) | 0);
                a[n] = l ^ u;
              }
              (e[0] = (a[0] + ((a[7] << 16) | (a[7] >>> 16)) + ((a[6] << 16) | (a[6] >>> 16))) | 0),
                (e[1] = (a[1] + ((a[0] << 8) | (a[0] >>> 24)) + a[7]) | 0),
                (e[2] = (a[2] + ((a[1] << 16) | (a[1] >>> 16)) + ((a[0] << 16) | (a[0] >>> 16))) | 0),
                (e[3] = (a[3] + ((a[2] << 8) | (a[2] >>> 24)) + a[1]) | 0),
                (e[4] = (a[4] + ((a[3] << 16) | (a[3] >>> 16)) + ((a[2] << 16) | (a[2] >>> 16))) | 0),
                (e[5] = (a[5] + ((a[4] << 8) | (a[4] >>> 24)) + a[3]) | 0),
                (e[6] = (a[6] + ((a[5] << 16) | (a[5] >>> 16)) + ((a[4] << 16) | (a[4] >>> 16))) | 0),
                (e[7] = (a[7] + ((a[6] << 8) | (a[6] >>> 24)) + a[5]) | 0);
            }
            e.Rabbit = t._createHelper(s);
          })(),
          o.Rabbit);
      })();
    },
    172: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7500),
          n(8540),
          n(7324),
          n(6253),
          (function () {
            var e = o,
              t = e.lib.StreamCipher,
              n = e.algo,
              i = (n.RC4 = t.extend({
                _doReset: function () {
                  for (
                    var e = this._key, t = e.words, n = e.sigBytes, i = (this._S = []), r = 0;
                    r < 256;
                    r++
                  )
                    i[r] = r;
                  r = 0;
                  for (var o = 0; r < 256; r++) {
                    var a = r % n,
                      s = (t[a >>> 2] >>> (24 - (a % 4) * 8)) & 255;
                    o = (o + i[r] + s) % 256;
                    var l = i[r];
                    (i[r] = i[o]), (i[o] = l);
                  }
                  this._i = this._j = 0;
                },
                _doProcessBlock: function (e, t) {
                  e[t] ^= r.call(this);
                },
                keySize: 8,
                ivSize: 0
              }));
            function r() {
              for (var e = this._S, t = this._i, n = this._j, i = 0, r = 0; r < 4; r++) {
                n = (n + e[(t = (t + 1) % 256)]) % 256;
                var o = e[t];
                (e[t] = e[n]), (e[n] = o), (i |= e[(e[t] + e[n]) % 256] << (24 - 8 * r));
              }
              return (this._i = t), (this._j = n), i;
            }
            e.RC4 = t._createHelper(i);
            var a = (n.RC4Drop = i.extend({
              cfg: i.cfg.extend({ drop: 192 }),
              _doReset: function () {
                i._doReset.call(this);
                for (var e = this.cfg.drop; e > 0; e--) r.call(this);
              }
            }));
            e.RC4Drop = t._createHelper(a);
          })(),
          o.RC4);
      })();
    },
    3330: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function (e) {
            var t = r,
              n = t.lib,
              i = n.WordArray,
              o = n.Hasher,
              a = t.algo,
              s = i.create([
                0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 7, 4, 13, 1, 10, 6, 15, 3, 12, 0, 9, 5,
                2, 14, 11, 8, 3, 10, 14, 4, 9, 15, 8, 1, 2, 7, 0, 6, 13, 11, 5, 12, 1, 9, 11, 10, 0, 8, 12, 4,
                13, 3, 7, 15, 14, 5, 6, 2, 4, 0, 5, 9, 7, 12, 2, 10, 14, 1, 3, 8, 11, 6, 15, 13
              ]),
              l = i.create([
                5, 14, 7, 0, 9, 2, 11, 4, 13, 6, 15, 8, 1, 10, 3, 12, 6, 11, 3, 7, 0, 13, 5, 10, 14, 15, 8,
                12, 4, 9, 1, 2, 15, 5, 1, 3, 7, 14, 6, 9, 11, 8, 12, 2, 10, 0, 4, 13, 8, 6, 4, 1, 3, 11, 15,
                0, 5, 12, 2, 13, 9, 7, 10, 14, 12, 15, 10, 4, 1, 5, 8, 7, 6, 2, 13, 14, 0, 3, 9, 11
              ]),
              u = i.create([
                11, 14, 15, 12, 5, 8, 7, 9, 11, 13, 14, 15, 6, 7, 9, 8, 7, 6, 8, 13, 11, 9, 7, 15, 7, 12, 15,
                9, 11, 7, 13, 12, 11, 13, 6, 7, 14, 9, 13, 15, 14, 8, 13, 6, 5, 12, 7, 5, 11, 12, 14, 15, 14,
                15, 9, 8, 9, 14, 5, 6, 8, 6, 5, 12, 9, 15, 5, 11, 6, 8, 13, 12, 5, 12, 13, 14, 11, 8, 5, 6
              ]),
              c = i.create([
                8, 9, 9, 11, 13, 15, 15, 5, 7, 7, 8, 11, 14, 14, 12, 6, 9, 13, 15, 7, 12, 8, 9, 11, 7, 7, 12,
                7, 6, 15, 13, 11, 9, 7, 15, 11, 8, 6, 6, 14, 12, 13, 5, 14, 13, 13, 7, 5, 15, 5, 8, 11, 14,
                14, 6, 14, 6, 9, 12, 9, 12, 5, 15, 8, 8, 5, 12, 9, 12, 5, 14, 6, 8, 13, 6, 5, 15, 13, 11, 11
              ]),
              f = i.create([0, 1518500249, 1859775393, 2400959708, 2840853838]),
              d = i.create([1352829926, 1548603684, 1836072691, 2053994217, 0]),
              h = (a.RIPEMD160 = o.extend({
                _doReset: function () {
                  this._hash = i.create([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
                },
                _doProcessBlock: function (e, t) {
                  for (var n = 0; n < 16; n++) {
                    var i = t + n,
                      r = e[i];
                    e[i] = (16711935 & ((r << 8) | (r >>> 24))) | (4278255360 & ((r << 24) | (r >>> 8)));
                  }
                  var o,
                    a,
                    h,
                    y,
                    b,
                    x,
                    E,
                    k,
                    C,
                    S,
                    N,
                    j = this._hash.words,
                    z = f.words,
                    O = d.words,
                    T = s.words,
                    R = l.words,
                    B = u.words,
                    A = c.words;
                  for (
                    x = o = j[0], E = a = j[1], k = h = j[2], C = y = j[3], S = b = j[4], n = 0;
                    n < 80;
                    n += 1
                  )
                    (N = (o + e[t + T[n]]) | 0),
                      (N +=
                        n < 16
                          ? p(a, h, y) + z[0]
                          : n < 32
                          ? v(a, h, y) + z[1]
                          : n < 48
                          ? _(a, h, y) + z[2]
                          : n < 64
                          ? m(a, h, y) + z[3]
                          : g(a, h, y) + z[4]),
                      (N = ((N = w((N |= 0), B[n])) + b) | 0),
                      (o = b),
                      (b = y),
                      (y = w(h, 10)),
                      (h = a),
                      (a = N),
                      (N = (x + e[t + R[n]]) | 0),
                      (N +=
                        n < 16
                          ? g(E, k, C) + O[0]
                          : n < 32
                          ? m(E, k, C) + O[1]
                          : n < 48
                          ? _(E, k, C) + O[2]
                          : n < 64
                          ? v(E, k, C) + O[3]
                          : p(E, k, C) + O[4]),
                      (N = ((N = w((N |= 0), A[n])) + S) | 0),
                      (x = S),
                      (S = C),
                      (C = w(k, 10)),
                      (k = E),
                      (E = N);
                  (N = (j[1] + h + C) | 0),
                    (j[1] = (j[2] + y + S) | 0),
                    (j[2] = (j[3] + b + x) | 0),
                    (j[3] = (j[4] + o + E) | 0),
                    (j[4] = (j[0] + a + k) | 0),
                    (j[0] = N);
                },
                _doFinalize: function () {
                  var e = this._data,
                    t = e.words,
                    n = 8 * this._nDataBytes,
                    i = 8 * e.sigBytes;
                  (t[i >>> 5] |= 128 << (24 - (i % 32))),
                    (t[14 + (((i + 64) >>> 9) << 4)] =
                      (16711935 & ((n << 8) | (n >>> 24))) | (4278255360 & ((n << 24) | (n >>> 8)))),
                    (e.sigBytes = 4 * (t.length + 1)),
                    this._process();
                  for (var r = this._hash, o = r.words, a = 0; a < 5; a++) {
                    var s = o[a];
                    o[a] = (16711935 & ((s << 8) | (s >>> 24))) | (4278255360 & ((s << 24) | (s >>> 8)));
                  }
                  return r;
                },
                clone: function () {
                  var e = o.clone.call(this);
                  return (e._hash = this._hash.clone()), e;
                }
              }));
            function p(e, t, n) {
              return e ^ t ^ n;
            }
            function v(e, t, n) {
              return (e & t) | (~e & n);
            }
            function _(e, t, n) {
              return (e | ~t) ^ n;
            }
            function m(e, t, n) {
              return (e & n) | (t & ~n);
            }
            function g(e, t, n) {
              return e ^ (t | ~n);
            }
            function w(e, t) {
              return (e << t) | (e >>> (32 - t));
            }
            (t.RIPEMD160 = o._createHelper(h)), (t.HmacRIPEMD160 = o._createHmacHelper(h));
          })(Math),
          r.RIPEMD160);
      })();
    },
    1504: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function () {
            var e = r,
              t = e.lib,
              n = t.WordArray,
              i = t.Hasher,
              o = e.algo,
              a = [],
              s = (o.SHA1 = i.extend({
                _doReset: function () {
                  this._hash = new n.init([1732584193, 4023233417, 2562383102, 271733878, 3285377520]);
                },
                _doProcessBlock: function (e, t) {
                  for (
                    var n = this._hash.words, i = n[0], r = n[1], o = n[2], s = n[3], l = n[4], u = 0;
                    u < 80;
                    u++
                  ) {
                    if (u < 16) a[u] = 0 | e[t + u];
                    else {
                      var c = a[u - 3] ^ a[u - 8] ^ a[u - 14] ^ a[u - 16];
                      a[u] = (c << 1) | (c >>> 31);
                    }
                    var f = ((i << 5) | (i >>> 27)) + l + a[u];
                    (f +=
                      u < 20
                        ? 1518500249 + ((r & o) | (~r & s))
                        : u < 40
                        ? 1859775393 + (r ^ o ^ s)
                        : u < 60
                        ? ((r & o) | (r & s) | (o & s)) - 1894007588
                        : (r ^ o ^ s) - 899497514),
                      (l = s),
                      (s = o),
                      (o = (r << 30) | (r >>> 2)),
                      (r = i),
                      (i = f);
                  }
                  (n[0] = (n[0] + i) | 0),
                    (n[1] = (n[1] + r) | 0),
                    (n[2] = (n[2] + o) | 0),
                    (n[3] = (n[3] + s) | 0),
                    (n[4] = (n[4] + l) | 0);
                },
                _doFinalize: function () {
                  var e = this._data,
                    t = e.words,
                    n = 8 * this._nDataBytes,
                    i = 8 * e.sigBytes;
                  return (
                    (t[i >>> 5] |= 128 << (24 - (i % 32))),
                    (t[14 + (((i + 64) >>> 9) << 4)] = Math.floor(n / 4294967296)),
                    (t[15 + (((i + 64) >>> 9) << 4)] = n),
                    (e.sigBytes = 4 * t.length),
                    this._process(),
                    this._hash
                  );
                },
                clone: function () {
                  var e = i.clone.call(this);
                  return (e._hash = this._hash.clone()), e;
                }
              }));
            (e.SHA1 = i._createHelper(s)), (e.HmacSHA1 = i._createHmacHelper(s));
          })(),
          r.SHA1);
      })();
    },
    9299: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(3856),
          (function () {
            var e = o,
              t = e.lib.WordArray,
              n = e.algo,
              i = n.SHA256,
              r = (n.SHA224 = i.extend({
                _doReset: function () {
                  this._hash = new t.init([
                    3238371032, 914150663, 812702999, 4144912697, 4290775857, 1750603025, 1694076839,
                    3204075428
                  ]);
                },
                _doFinalize: function () {
                  var e = i._doFinalize.call(this);
                  return (e.sigBytes -= 4), e;
                }
              }));
            (e.SHA224 = i._createHelper(r)), (e.HmacSHA224 = i._createHmacHelper(r));
          })(),
          o.SHA224);
      })();
    },
    3856: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function (e) {
            var t = r,
              n = t.lib,
              i = n.WordArray,
              o = n.Hasher,
              a = t.algo,
              s = [],
              l = [];
            !(function () {
              function t(t) {
                for (var n = e.sqrt(t), i = 2; i <= n; i++) if (!(t % i)) return !1;
                return !0;
              }
              function n(e) {
                return (4294967296 * (e - (0 | e))) | 0;
              }
              for (var i = 2, r = 0; r < 64; )
                t(i) && (r < 8 && (s[r] = n(e.pow(i, 0.5))), (l[r] = n(e.pow(i, 1 / 3))), r++), i++;
            })();
            var u = [],
              c = (a.SHA256 = o.extend({
                _doReset: function () {
                  this._hash = new i.init(s.slice(0));
                },
                _doProcessBlock: function (e, t) {
                  for (
                    var n = this._hash.words,
                      i = n[0],
                      r = n[1],
                      o = n[2],
                      a = n[3],
                      s = n[4],
                      c = n[5],
                      f = n[6],
                      d = n[7],
                      h = 0;
                    h < 64;
                    h++
                  ) {
                    if (h < 16) u[h] = 0 | e[t + h];
                    else {
                      var p = u[h - 15],
                        v = ((p << 25) | (p >>> 7)) ^ ((p << 14) | (p >>> 18)) ^ (p >>> 3),
                        _ = u[h - 2],
                        m = ((_ << 15) | (_ >>> 17)) ^ ((_ << 13) | (_ >>> 19)) ^ (_ >>> 10);
                      u[h] = v + u[h - 7] + m + u[h - 16];
                    }
                    var g = (i & r) ^ (i & o) ^ (r & o),
                      w = ((i << 30) | (i >>> 2)) ^ ((i << 19) | (i >>> 13)) ^ ((i << 10) | (i >>> 22)),
                      y =
                        d +
                        (((s << 26) | (s >>> 6)) ^ ((s << 21) | (s >>> 11)) ^ ((s << 7) | (s >>> 25))) +
                        ((s & c) ^ (~s & f)) +
                        l[h] +
                        u[h];
                    (d = f),
                      (f = c),
                      (c = s),
                      (s = (a + y) | 0),
                      (a = o),
                      (o = r),
                      (r = i),
                      (i = (y + (w + g)) | 0);
                  }
                  (n[0] = (n[0] + i) | 0),
                    (n[1] = (n[1] + r) | 0),
                    (n[2] = (n[2] + o) | 0),
                    (n[3] = (n[3] + a) | 0),
                    (n[4] = (n[4] + s) | 0),
                    (n[5] = (n[5] + c) | 0),
                    (n[6] = (n[6] + f) | 0),
                    (n[7] = (n[7] + d) | 0);
                },
                _doFinalize: function () {
                  var t = this._data,
                    n = t.words,
                    i = 8 * this._nDataBytes,
                    r = 8 * t.sigBytes;
                  return (
                    (n[r >>> 5] |= 128 << (24 - (r % 32))),
                    (n[14 + (((r + 64) >>> 9) << 4)] = e.floor(i / 4294967296)),
                    (n[15 + (((r + 64) >>> 9) << 4)] = i),
                    (t.sigBytes = 4 * n.length),
                    this._process(),
                    this._hash
                  );
                },
                clone: function () {
                  var e = o.clone.call(this);
                  return (e._hash = this._hash.clone()), e;
                }
              }));
            (t.SHA256 = o._createHelper(c)), (t.HmacSHA256 = o._createHmacHelper(c));
          })(Math),
          r.SHA256);
      })();
    },
    4733: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6140),
          (function (e) {
            var t = o,
              n = t.lib,
              i = n.WordArray,
              r = n.Hasher,
              a = t.x64.Word,
              s = t.algo,
              l = [],
              u = [],
              c = [];
            !(function () {
              for (var e = 1, t = 0, n = 0; n < 24; n++) {
                l[e + 5 * t] = (((n + 1) * (n + 2)) / 2) % 64;
                var i = (2 * e + 3 * t) % 5;
                (e = t % 5), (t = i);
              }
              for (e = 0; e < 5; e++) for (t = 0; t < 5; t++) u[e + 5 * t] = t + ((2 * e + 3 * t) % 5) * 5;
              for (var r = 1, o = 0; o < 24; o++) {
                for (var s = 0, f = 0, d = 0; d < 7; d++) {
                  if (1 & r) {
                    var h = (1 << d) - 1;
                    h < 32 ? (f ^= 1 << h) : (s ^= 1 << (h - 32));
                  }
                  128 & r ? (r = (r << 1) ^ 113) : (r <<= 1);
                }
                c[o] = a.create(s, f);
              }
            })();
            var f = [];
            !(function () {
              for (var e = 0; e < 25; e++) f[e] = a.create();
            })();
            var d = (s.SHA3 = r.extend({
              cfg: r.cfg.extend({ outputLength: 512 }),
              _doReset: function () {
                for (var e = (this._state = []), t = 0; t < 25; t++) e[t] = new a.init();
                this.blockSize = (1600 - 2 * this.cfg.outputLength) / 32;
              },
              _doProcessBlock: function (e, t) {
                for (var n = this._state, i = this.blockSize / 2, r = 0; r < i; r++) {
                  var o = e[t + 2 * r],
                    a = e[t + 2 * r + 1];
                  (o = (16711935 & ((o << 8) | (o >>> 24))) | (4278255360 & ((o << 24) | (o >>> 8)))),
                    (a = (16711935 & ((a << 8) | (a >>> 24))) | (4278255360 & ((a << 24) | (a >>> 8)))),
                    ((j = n[r]).high ^= a),
                    (j.low ^= o);
                }
                for (var s = 0; s < 24; s++) {
                  for (var d = 0; d < 5; d++) {
                    for (var h = 0, p = 0, v = 0; v < 5; v++) (h ^= (j = n[d + 5 * v]).high), (p ^= j.low);
                    var _ = f[d];
                    (_.high = h), (_.low = p);
                  }
                  for (d = 0; d < 5; d++) {
                    var m = f[(d + 4) % 5],
                      g = f[(d + 1) % 5],
                      w = g.high,
                      y = g.low;
                    for (
                      h = m.high ^ ((w << 1) | (y >>> 31)), p = m.low ^ ((y << 1) | (w >>> 31)), v = 0;
                      v < 5;
                      v++
                    )
                      ((j = n[d + 5 * v]).high ^= h), (j.low ^= p);
                  }
                  for (var b = 1; b < 25; b++) {
                    var x = (j = n[b]).high,
                      E = j.low,
                      k = l[b];
                    k < 32
                      ? ((h = (x << k) | (E >>> (32 - k))), (p = (E << k) | (x >>> (32 - k))))
                      : ((h = (E << (k - 32)) | (x >>> (64 - k))), (p = (x << (k - 32)) | (E >>> (64 - k))));
                    var C = f[u[b]];
                    (C.high = h), (C.low = p);
                  }
                  var S = f[0],
                    N = n[0];
                  for (S.high = N.high, S.low = N.low, d = 0; d < 5; d++)
                    for (v = 0; v < 5; v++) {
                      var j = n[(b = d + 5 * v)],
                        z = f[b],
                        O = f[((d + 1) % 5) + 5 * v],
                        T = f[((d + 2) % 5) + 5 * v];
                      (j.high = z.high ^ (~O.high & T.high)), (j.low = z.low ^ (~O.low & T.low));
                    }
                  j = n[0];
                  var R = c[s];
                  (j.high ^= R.high), (j.low ^= R.low);
                }
              },
              _doFinalize: function () {
                var t = this._data,
                  n = t.words,
                  r = (this._nDataBytes, 8 * t.sigBytes),
                  o = 32 * this.blockSize;
                (n[r >>> 5] |= 1 << (24 - (r % 32))),
                  (n[((e.ceil((r + 1) / o) * o) >>> 5) - 1] |= 128),
                  (t.sigBytes = 4 * n.length),
                  this._process();
                for (
                  var a = this._state, s = this.cfg.outputLength / 8, l = s / 8, u = [], c = 0;
                  c < l;
                  c++
                ) {
                  var f = a[c],
                    d = f.high,
                    h = f.low;
                  (d = (16711935 & ((d << 8) | (d >>> 24))) | (4278255360 & ((d << 24) | (d >>> 8)))),
                    (h = (16711935 & ((h << 8) | (h >>> 24))) | (4278255360 & ((h << 24) | (h >>> 8)))),
                    u.push(h),
                    u.push(d);
                }
                return new i.init(u, s);
              },
              clone: function () {
                for (var e = r.clone.call(this), t = (e._state = this._state.slice(0)), n = 0; n < 25; n++)
                  t[n] = t[n].clone();
                return e;
              }
            }));
            (t.SHA3 = r._createHelper(d)), (t.HmacSHA3 = r._createHmacHelper(d));
          })(Math),
          o.SHA3);
      })();
    },
    860: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6140),
          n(5791),
          (function () {
            var e = o,
              t = e.x64,
              n = t.Word,
              i = t.WordArray,
              r = e.algo,
              a = r.SHA512,
              s = (r.SHA384 = a.extend({
                _doReset: function () {
                  this._hash = new i.init([
                    new n.init(3418070365, 3238371032),
                    new n.init(1654270250, 914150663),
                    new n.init(2438529370, 812702999),
                    new n.init(355462360, 4144912697),
                    new n.init(1731405415, 4290775857),
                    new n.init(2394180231, 1750603025),
                    new n.init(3675008525, 1694076839),
                    new n.init(1203062813, 3204075428)
                  ]);
                },
                _doFinalize: function () {
                  var e = a._doFinalize.call(this);
                  return (e.sigBytes -= 16), e;
                }
              }));
            (e.SHA384 = a._createHelper(s)), (e.HmacSHA384 = a._createHmacHelper(s));
          })(),
          o.SHA384);
      })();
    },
    5791: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(6140),
          (function () {
            var e = o,
              t = e.lib.Hasher,
              n = e.x64,
              i = n.Word,
              r = n.WordArray,
              a = e.algo;
            function s() {
              return i.create.apply(i, arguments);
            }
            var l = [
                s(1116352408, 3609767458),
                s(1899447441, 602891725),
                s(3049323471, 3964484399),
                s(3921009573, 2173295548),
                s(961987163, 4081628472),
                s(1508970993, 3053834265),
                s(2453635748, 2937671579),
                s(2870763221, 3664609560),
                s(3624381080, 2734883394),
                s(310598401, 1164996542),
                s(607225278, 1323610764),
                s(1426881987, 3590304994),
                s(1925078388, 4068182383),
                s(2162078206, 991336113),
                s(2614888103, 633803317),
                s(3248222580, 3479774868),
                s(3835390401, 2666613458),
                s(4022224774, 944711139),
                s(264347078, 2341262773),
                s(604807628, 2007800933),
                s(770255983, 1495990901),
                s(1249150122, 1856431235),
                s(1555081692, 3175218132),
                s(1996064986, 2198950837),
                s(2554220882, 3999719339),
                s(2821834349, 766784016),
                s(2952996808, 2566594879),
                s(3210313671, 3203337956),
                s(3336571891, 1034457026),
                s(3584528711, 2466948901),
                s(113926993, 3758326383),
                s(338241895, 168717936),
                s(666307205, 1188179964),
                s(773529912, 1546045734),
                s(1294757372, 1522805485),
                s(1396182291, 2643833823),
                s(1695183700, 2343527390),
                s(1986661051, 1014477480),
                s(2177026350, 1206759142),
                s(2456956037, 344077627),
                s(2730485921, 1290863460),
                s(2820302411, 3158454273),
                s(3259730800, 3505952657),
                s(3345764771, 106217008),
                s(3516065817, 3606008344),
                s(3600352804, 1432725776),
                s(4094571909, 1467031594),
                s(275423344, 851169720),
                s(430227734, 3100823752),
                s(506948616, 1363258195),
                s(659060556, 3750685593),
                s(883997877, 3785050280),
                s(958139571, 3318307427),
                s(1322822218, 3812723403),
                s(1537002063, 2003034995),
                s(1747873779, 3602036899),
                s(1955562222, 1575990012),
                s(2024104815, 1125592928),
                s(2227730452, 2716904306),
                s(2361852424, 442776044),
                s(2428436474, 593698344),
                s(2756734187, 3733110249),
                s(3204031479, 2999351573),
                s(3329325298, 3815920427),
                s(3391569614, 3928383900),
                s(3515267271, 566280711),
                s(3940187606, 3454069534),
                s(4118630271, 4000239992),
                s(116418474, 1914138554),
                s(174292421, 2731055270),
                s(289380356, 3203993006),
                s(460393269, 320620315),
                s(685471733, 587496836),
                s(852142971, 1086792851),
                s(1017036298, 365543100),
                s(1126000580, 2618297676),
                s(1288033470, 3409855158),
                s(1501505948, 4234509866),
                s(1607167915, 987167468),
                s(1816402316, 1246189591)
              ],
              u = [];
            !(function () {
              for (var e = 0; e < 80; e++) u[e] = s();
            })();
            var c = (a.SHA512 = t.extend({
              _doReset: function () {
                this._hash = new r.init([
                  new i.init(1779033703, 4089235720),
                  new i.init(3144134277, 2227873595),
                  new i.init(1013904242, 4271175723),
                  new i.init(2773480762, 1595750129),
                  new i.init(1359893119, 2917565137),
                  new i.init(2600822924, 725511199),
                  new i.init(528734635, 4215389547),
                  new i.init(1541459225, 327033209)
                ]);
              },
              _doProcessBlock: function (e, t) {
                for (
                  var n = this._hash.words,
                    i = n[0],
                    r = n[1],
                    o = n[2],
                    a = n[3],
                    s = n[4],
                    c = n[5],
                    f = n[6],
                    d = n[7],
                    h = i.high,
                    p = i.low,
                    v = r.high,
                    _ = r.low,
                    m = o.high,
                    g = o.low,
                    w = a.high,
                    y = a.low,
                    b = s.high,
                    x = s.low,
                    E = c.high,
                    k = c.low,
                    C = f.high,
                    S = f.low,
                    N = d.high,
                    j = d.low,
                    z = h,
                    O = p,
                    T = v,
                    R = _,
                    B = m,
                    A = g,
                    L = w,
                    P = y,
                    Z = b,
                    M = x,
                    I = E,
                    H = k,
                    D = C,
                    U = S,
                    q = N,
                    F = j,
                    W = 0;
                  W < 80;
                  W++
                ) {
                  var V,
                    G,
                    K = u[W];
                  if (W < 16) (G = K.high = 0 | e[t + 2 * W]), (V = K.low = 0 | e[t + 2 * W + 1]);
                  else {
                    var X = u[W - 15],
                      $ = X.high,
                      J = X.low,
                      Y = (($ >>> 1) | (J << 31)) ^ (($ >>> 8) | (J << 24)) ^ ($ >>> 7),
                      Q = ((J >>> 1) | ($ << 31)) ^ ((J >>> 8) | ($ << 24)) ^ ((J >>> 7) | ($ << 25)),
                      ee = u[W - 2],
                      te = ee.high,
                      ne = ee.low,
                      ie = ((te >>> 19) | (ne << 13)) ^ ((te << 3) | (ne >>> 29)) ^ (te >>> 6),
                      re = ((ne >>> 19) | (te << 13)) ^ ((ne << 3) | (te >>> 29)) ^ ((ne >>> 6) | (te << 26)),
                      oe = u[W - 7],
                      ae = oe.high,
                      se = oe.low,
                      le = u[W - 16],
                      ue = le.high,
                      ce = le.low;
                    (G =
                      (G =
                        (G = Y + ae + ((V = Q + se) >>> 0 < Q >>> 0 ? 1 : 0)) +
                        ie +
                        ((V += re) >>> 0 < re >>> 0 ? 1 : 0)) +
                      ue +
                      ((V += ce) >>> 0 < ce >>> 0 ? 1 : 0)),
                      (K.high = G),
                      (K.low = V);
                  }
                  var fe,
                    de = (Z & I) ^ (~Z & D),
                    he = (M & H) ^ (~M & U),
                    pe = (z & T) ^ (z & B) ^ (T & B),
                    ve = (O & R) ^ (O & A) ^ (R & A),
                    _e = ((z >>> 28) | (O << 4)) ^ ((z << 30) | (O >>> 2)) ^ ((z << 25) | (O >>> 7)),
                    me = ((O >>> 28) | (z << 4)) ^ ((O << 30) | (z >>> 2)) ^ ((O << 25) | (z >>> 7)),
                    ge = ((Z >>> 14) | (M << 18)) ^ ((Z >>> 18) | (M << 14)) ^ ((Z << 23) | (M >>> 9)),
                    we = ((M >>> 14) | (Z << 18)) ^ ((M >>> 18) | (Z << 14)) ^ ((M << 23) | (Z >>> 9)),
                    ye = l[W],
                    be = ye.high,
                    xe = ye.low,
                    Ee = q + ge + ((fe = F + we) >>> 0 < F >>> 0 ? 1 : 0),
                    ke = me + ve;
                  (q = D),
                    (F = U),
                    (D = I),
                    (U = H),
                    (I = Z),
                    (H = M),
                    (Z =
                      (L +
                        (Ee =
                          (Ee =
                            (Ee = Ee + de + ((fe += he) >>> 0 < he >>> 0 ? 1 : 0)) +
                            be +
                            ((fe += xe) >>> 0 < xe >>> 0 ? 1 : 0)) +
                          G +
                          ((fe += V) >>> 0 < V >>> 0 ? 1 : 0)) +
                        ((M = (P + fe) | 0) >>> 0 < P >>> 0 ? 1 : 0)) |
                      0),
                    (L = B),
                    (P = A),
                    (B = T),
                    (A = R),
                    (T = z),
                    (R = O),
                    (z =
                      (Ee +
                        (_e + pe + (ke >>> 0 < me >>> 0 ? 1 : 0)) +
                        ((O = (fe + ke) | 0) >>> 0 < fe >>> 0 ? 1 : 0)) |
                      0);
                }
                (p = i.low = p + O),
                  (i.high = h + z + (p >>> 0 < O >>> 0 ? 1 : 0)),
                  (_ = r.low = _ + R),
                  (r.high = v + T + (_ >>> 0 < R >>> 0 ? 1 : 0)),
                  (g = o.low = g + A),
                  (o.high = m + B + (g >>> 0 < A >>> 0 ? 1 : 0)),
                  (y = a.low = y + P),
                  (a.high = w + L + (y >>> 0 < P >>> 0 ? 1 : 0)),
                  (x = s.low = x + M),
                  (s.high = b + Z + (x >>> 0 < M >>> 0 ? 1 : 0)),
                  (k = c.low = k + H),
                  (c.high = E + I + (k >>> 0 < H >>> 0 ? 1 : 0)),
                  (S = f.low = S + U),
                  (f.high = C + D + (S >>> 0 < U >>> 0 ? 1 : 0)),
                  (j = d.low = j + F),
                  (d.high = N + q + (j >>> 0 < F >>> 0 ? 1 : 0));
              },
              _doFinalize: function () {
                var e = this._data,
                  t = e.words,
                  n = 8 * this._nDataBytes,
                  i = 8 * e.sigBytes;
                return (
                  (t[i >>> 5] |= 128 << (24 - (i % 32))),
                  (t[30 + (((i + 128) >>> 10) << 5)] = Math.floor(n / 4294967296)),
                  (t[31 + (((i + 128) >>> 10) << 5)] = n),
                  (e.sigBytes = 4 * t.length),
                  this._process(),
                  this._hash.toX32()
                );
              },
              clone: function () {
                var e = t.clone.call(this);
                return (e._hash = this._hash.clone()), e;
              },
              blockSize: 32
            }));
            (e.SHA512 = t._createHelper(c)), (e.HmacSHA512 = t._createHmacHelper(c));
          })(),
          o.SHA512);
      })();
    },
    4173: function (e, t, n) {
      !(function (t, i, r) {
        var o;
        e.exports =
          ((o = n(4526)),
          n(7500),
          n(8540),
          n(7324),
          n(6253),
          (function () {
            var e = o,
              t = e.lib,
              n = t.WordArray,
              i = t.BlockCipher,
              r = e.algo,
              a = [
                57, 49, 41, 33, 25, 17, 9, 1, 58, 50, 42, 34, 26, 18, 10, 2, 59, 51, 43, 35, 27, 19, 11, 3,
                60, 52, 44, 36, 63, 55, 47, 39, 31, 23, 15, 7, 62, 54, 46, 38, 30, 22, 14, 6, 61, 53, 45, 37,
                29, 21, 13, 5, 28, 20, 12, 4
              ],
              s = [
                14, 17, 11, 24, 1, 5, 3, 28, 15, 6, 21, 10, 23, 19, 12, 4, 26, 8, 16, 7, 27, 20, 13, 2, 41,
                52, 31, 37, 47, 55, 30, 40, 51, 45, 33, 48, 44, 49, 39, 56, 34, 53, 46, 42, 50, 36, 29, 32
              ],
              l = [1, 2, 4, 6, 8, 10, 12, 14, 15, 17, 19, 21, 23, 25, 27, 28],
              u = [
                {
                  0: 8421888,
                  268435456: 32768,
                  536870912: 8421378,
                  805306368: 2,
                  1073741824: 512,
                  1342177280: 8421890,
                  1610612736: 8389122,
                  1879048192: 8388608,
                  2147483648: 514,
                  2415919104: 8389120,
                  2684354560: 33280,
                  2952790016: 8421376,
                  3221225472: 32770,
                  3489660928: 8388610,
                  3758096384: 0,
                  4026531840: 33282,
                  134217728: 0,
                  402653184: 8421890,
                  671088640: 33282,
                  939524096: 32768,
                  1207959552: 8421888,
                  1476395008: 512,
                  1744830464: 8421378,
                  2013265920: 2,
                  2281701376: 8389120,
                  2550136832: 33280,
                  2818572288: 8421376,
                  3087007744: 8389122,
                  3355443200: 8388610,
                  3623878656: 32770,
                  3892314112: 514,
                  4160749568: 8388608,
                  1: 32768,
                  268435457: 2,
                  536870913: 8421888,
                  805306369: 8388608,
                  1073741825: 8421378,
                  1342177281: 33280,
                  1610612737: 512,
                  1879048193: 8389122,
                  2147483649: 8421890,
                  2415919105: 8421376,
                  2684354561: 8388610,
                  2952790017: 33282,
                  3221225473: 514,
                  3489660929: 8389120,
                  3758096385: 32770,
                  4026531841: 0,
                  134217729: 8421890,
                  402653185: 8421376,
                  671088641: 8388608,
                  939524097: 512,
                  1207959553: 32768,
                  1476395009: 8388610,
                  1744830465: 2,
                  2013265921: 33282,
                  2281701377: 32770,
                  2550136833: 8389122,
                  2818572289: 514,
                  3087007745: 8421888,
                  3355443201: 8389120,
                  3623878657: 0,
                  3892314113: 33280,
                  4160749569: 8421378
                },
                {
                  0: 1074282512,
                  16777216: 16384,
                  33554432: 524288,
                  50331648: 1074266128,
                  67108864: 1073741840,
                  83886080: 1074282496,
                  100663296: 1073758208,
                  117440512: 16,
                  134217728: 540672,
                  150994944: 1073758224,
                  167772160: 1073741824,
                  184549376: 540688,
                  201326592: 524304,
                  218103808: 0,
                  234881024: 16400,
                  251658240: 1074266112,
                  8388608: 1073758208,
                  25165824: 540688,
                  41943040: 16,
                  58720256: 1073758224,
                  75497472: 1074282512,
                  92274688: 1073741824,
                  109051904: 524288,
                  125829120: 1074266128,
                  142606336: 524304,
                  159383552: 0,
                  176160768: 16384,
                  192937984: 1074266112,
                  209715200: 1073741840,
                  226492416: 540672,
                  243269632: 1074282496,
                  260046848: 16400,
                  268435456: 0,
                  285212672: 1074266128,
                  301989888: 1073758224,
                  318767104: 1074282496,
                  335544320: 1074266112,
                  352321536: 16,
                  369098752: 540688,
                  385875968: 16384,
                  402653184: 16400,
                  419430400: 524288,
                  436207616: 524304,
                  452984832: 1073741840,
                  469762048: 540672,
                  486539264: 1073758208,
                  503316480: 1073741824,
                  520093696: 1074282512,
                  276824064: 540688,
                  293601280: 524288,
                  310378496: 1074266112,
                  327155712: 16384,
                  343932928: 1073758208,
                  360710144: 1074282512,
                  377487360: 16,
                  394264576: 1073741824,
                  411041792: 1074282496,
                  427819008: 1073741840,
                  444596224: 1073758224,
                  461373440: 524304,
                  478150656: 0,
                  494927872: 16400,
                  511705088: 1074266128,
                  528482304: 540672
                },
                {
                  0: 260,
                  1048576: 0,
                  2097152: 67109120,
                  3145728: 65796,
                  4194304: 65540,
                  5242880: 67108868,
                  6291456: 67174660,
                  7340032: 67174400,
                  8388608: 67108864,
                  9437184: 67174656,
                  10485760: 65792,
                  11534336: 67174404,
                  12582912: 67109124,
                  13631488: 65536,
                  14680064: 4,
                  15728640: 256,
                  524288: 67174656,
                  1572864: 67174404,
                  2621440: 0,
                  3670016: 67109120,
                  4718592: 67108868,
                  5767168: 65536,
                  6815744: 65540,
                  7864320: 260,
                  8912896: 4,
                  9961472: 256,
                  11010048: 67174400,
                  12058624: 65796,
                  13107200: 65792,
                  14155776: 67109124,
                  15204352: 67174660,
                  16252928: 67108864,
                  16777216: 67174656,
                  17825792: 65540,
                  18874368: 65536,
                  19922944: 67109120,
                  20971520: 256,
                  22020096: 67174660,
                  23068672: 67108868,
                  24117248: 0,
                  25165824: 67109124,
                  26214400: 67108864,
                  27262976: 4,
                  28311552: 65792,
                  29360128: 67174400,
                  30408704: 260,
                  31457280: 65796,
                  32505856: 67174404,
                  17301504: 67108864,
                  18350080: 260,
                  19398656: 67174656,
                  20447232: 0,
                  21495808: 65540,
                  22544384: 67109120,
                  23592960: 256,
                  24641536: 67174404,
                  25690112: 65536,
                  26738688: 67174660,
                  27787264: 65796,
                  28835840: 67108868,
                  29884416: 67109124,
                  30932992: 67174400,
                  31981568: 4,
                  33030144: 65792
                },
                {
                  0: 2151682048,
                  65536: 2147487808,
                  131072: 4198464,
                  196608: 2151677952,
                  262144: 0,
                  327680: 4198400,
                  393216: 2147483712,
                  458752: 4194368,
                  524288: 2147483648,
                  589824: 4194304,
                  655360: 64,
                  720896: 2147487744,
                  786432: 2151678016,
                  851968: 4160,
                  917504: 4096,
                  983040: 2151682112,
                  32768: 2147487808,
                  98304: 64,
                  163840: 2151678016,
                  229376: 2147487744,
                  294912: 4198400,
                  360448: 2151682112,
                  425984: 0,
                  491520: 2151677952,
                  557056: 4096,
                  622592: 2151682048,
                  688128: 4194304,
                  753664: 4160,
                  819200: 2147483648,
                  884736: 4194368,
                  950272: 4198464,
                  1015808: 2147483712,
                  1048576: 4194368,
                  1114112: 4198400,
                  1179648: 2147483712,
                  1245184: 0,
                  1310720: 4160,
                  1376256: 2151678016,
                  1441792: 2151682048,
                  1507328: 2147487808,
                  1572864: 2151682112,
                  1638400: 2147483648,
                  1703936: 2151677952,
                  1769472: 4198464,
                  1835008: 2147487744,
                  1900544: 4194304,
                  1966080: 64,
                  2031616: 4096,
                  1081344: 2151677952,
                  1146880: 2151682112,
                  1212416: 0,
                  1277952: 4198400,
                  1343488: 4194368,
                  1409024: 2147483648,
                  1474560: 2147487808,
                  1540096: 64,
                  1605632: 2147483712,
                  1671168: 4096,
                  1736704: 2147487744,
                  1802240: 2151678016,
                  1867776: 4160,
                  1933312: 2151682048,
                  1998848: 4194304,
                  2064384: 4198464
                },
                {
                  0: 128,
                  4096: 17039360,
                  8192: 262144,
                  12288: 536870912,
                  16384: 537133184,
                  20480: 16777344,
                  24576: 553648256,
                  28672: 262272,
                  32768: 16777216,
                  36864: 537133056,
                  40960: 536871040,
                  45056: 553910400,
                  49152: 553910272,
                  53248: 0,
                  57344: 17039488,
                  61440: 553648128,
                  2048: 17039488,
                  6144: 553648256,
                  10240: 128,
                  14336: 17039360,
                  18432: 262144,
                  22528: 537133184,
                  26624: 553910272,
                  30720: 536870912,
                  34816: 537133056,
                  38912: 0,
                  43008: 553910400,
                  47104: 16777344,
                  51200: 536871040,
                  55296: 553648128,
                  59392: 16777216,
                  63488: 262272,
                  65536: 262144,
                  69632: 128,
                  73728: 536870912,
                  77824: 553648256,
                  81920: 16777344,
                  86016: 553910272,
                  90112: 537133184,
                  94208: 16777216,
                  98304: 553910400,
                  102400: 553648128,
                  106496: 17039360,
                  110592: 537133056,
                  114688: 262272,
                  118784: 536871040,
                  122880: 0,
                  126976: 17039488,
                  67584: 553648256,
                  71680: 16777216,
                  75776: 17039360,
                  79872: 537133184,
                  83968: 536870912,
                  88064: 17039488,
                  92160: 128,
                  96256: 553910272,
                  100352: 262272,
                  104448: 553910400,
                  108544: 0,
                  112640: 553648128,
                  116736: 16777344,
                  120832: 262144,
                  124928: 537133056,
                  129024: 536871040
                },
                {
                  0: 268435464,
                  256: 8192,
                  512: 270532608,
                  768: 270540808,
                  1024: 268443648,
                  1280: 2097152,
                  1536: 2097160,
                  1792: 268435456,
                  2048: 0,
                  2304: 268443656,
                  2560: 2105344,
                  2816: 8,
                  3072: 270532616,
                  3328: 2105352,
                  3584: 8200,
                  3840: 270540800,
                  128: 270532608,
                  384: 270540808,
                  640: 8,
                  896: 2097152,
                  1152: 2105352,
                  1408: 268435464,
                  1664: 268443648,
                  1920: 8200,
                  2176: 2097160,
                  2432: 8192,
                  2688: 268443656,
                  2944: 270532616,
                  3200: 0,
                  3456: 270540800,
                  3712: 2105344,
                  3968: 268435456,
                  4096: 268443648,
                  4352: 270532616,
                  4608: 270540808,
                  4864: 8200,
                  5120: 2097152,
                  5376: 268435456,
                  5632: 268435464,
                  5888: 2105344,
                  6144: 2105352,
                  6400: 0,
                  6656: 8,
                  6912: 270532608,
                  7168: 8192,
                  7424: 268443656,
                  7680: 270540800,
                  7936: 2097160,
                  4224: 8,
                  4480: 2105344,
                  4736: 2097152,
                  4992: 268435464,
                  5248: 268443648,
                  5504: 8200,
                  5760: 270540808,
                  6016: 270532608,
                  6272: 270540800,
                  6528: 270532616,
                  6784: 8192,
                  7040: 2105352,
                  7296: 2097160,
                  7552: 0,
                  7808: 268435456,
                  8064: 268443656
                },
                {
                  0: 1048576,
                  16: 33555457,
                  32: 1024,
                  48: 1049601,
                  64: 34604033,
                  80: 0,
                  96: 1,
                  112: 34603009,
                  128: 33555456,
                  144: 1048577,
                  160: 33554433,
                  176: 34604032,
                  192: 34603008,
                  208: 1025,
                  224: 1049600,
                  240: 33554432,
                  8: 34603009,
                  24: 0,
                  40: 33555457,
                  56: 34604032,
                  72: 1048576,
                  88: 33554433,
                  104: 33554432,
                  120: 1025,
                  136: 1049601,
                  152: 33555456,
                  168: 34603008,
                  184: 1048577,
                  200: 1024,
                  216: 34604033,
                  232: 1,
                  248: 1049600,
                  256: 33554432,
                  272: 1048576,
                  288: 33555457,
                  304: 34603009,
                  320: 1048577,
                  336: 33555456,
                  352: 34604032,
                  368: 1049601,
                  384: 1025,
                  400: 34604033,
                  416: 1049600,
                  432: 1,
                  448: 0,
                  464: 34603008,
                  480: 33554433,
                  496: 1024,
                  264: 1049600,
                  280: 33555457,
                  296: 34603009,
                  312: 1,
                  328: 33554432,
                  344: 1048576,
                  360: 1025,
                  376: 34604032,
                  392: 33554433,
                  408: 34603008,
                  424: 0,
                  440: 34604033,
                  456: 1049601,
                  472: 1024,
                  488: 33555456,
                  504: 1048577
                },
                {
                  0: 134219808,
                  1: 131072,
                  2: 134217728,
                  3: 32,
                  4: 131104,
                  5: 134350880,
                  6: 134350848,
                  7: 2048,
                  8: 134348800,
                  9: 134219776,
                  10: 133120,
                  11: 134348832,
                  12: 2080,
                  13: 0,
                  14: 134217760,
                  15: 133152,
                  2147483648: 2048,
                  2147483649: 134350880,
                  2147483650: 134219808,
                  2147483651: 134217728,
                  2147483652: 134348800,
                  2147483653: 133120,
                  2147483654: 133152,
                  2147483655: 32,
                  2147483656: 134217760,
                  2147483657: 2080,
                  2147483658: 131104,
                  2147483659: 134350848,
                  2147483660: 0,
                  2147483661: 134348832,
                  2147483662: 134219776,
                  2147483663: 131072,
                  16: 133152,
                  17: 134350848,
                  18: 32,
                  19: 2048,
                  20: 134219776,
                  21: 134217760,
                  22: 134348832,
                  23: 131072,
                  24: 0,
                  25: 131104,
                  26: 134348800,
                  27: 134219808,
                  28: 134350880,
                  29: 133120,
                  30: 2080,
                  31: 134217728,
                  2147483664: 131072,
                  2147483665: 2048,
                  2147483666: 134348832,
                  2147483667: 133152,
                  2147483668: 32,
                  2147483669: 134348800,
                  2147483670: 134217728,
                  2147483671: 134219808,
                  2147483672: 134350880,
                  2147483673: 134217760,
                  2147483674: 134219776,
                  2147483675: 0,
                  2147483676: 133120,
                  2147483677: 2080,
                  2147483678: 131104,
                  2147483679: 134350848
                }
              ],
              c = [4160749569, 528482304, 33030144, 2064384, 129024, 8064, 504, 2147483679],
              f = (r.DES = i.extend({
                _doReset: function () {
                  for (var e = this._key.words, t = [], n = 0; n < 56; n++) {
                    var i = a[n] - 1;
                    t[n] = (e[i >>> 5] >>> (31 - (i % 32))) & 1;
                  }
                  for (var r = (this._subKeys = []), o = 0; o < 16; o++) {
                    var u = (r[o] = []),
                      c = l[o];
                    for (n = 0; n < 24; n++)
                      (u[(n / 6) | 0] |= t[(s[n] - 1 + c) % 28] << (31 - (n % 6))),
                        (u[4 + ((n / 6) | 0)] |= t[28 + ((s[n + 24] - 1 + c) % 28)] << (31 - (n % 6)));
                    for (u[0] = (u[0] << 1) | (u[0] >>> 31), n = 1; n < 7; n++)
                      u[n] = u[n] >>> (4 * (n - 1) + 3);
                    u[7] = (u[7] << 5) | (u[7] >>> 27);
                  }
                  var f = (this._invSubKeys = []);
                  for (n = 0; n < 16; n++) f[n] = r[15 - n];
                },
                encryptBlock: function (e, t) {
                  this._doCryptBlock(e, t, this._subKeys);
                },
                decryptBlock: function (e, t) {
                  this._doCryptBlock(e, t, this._invSubKeys);
                },
                _doCryptBlock: function (e, t, n) {
                  (this._lBlock = e[t]),
                    (this._rBlock = e[t + 1]),
                    d.call(this, 4, 252645135),
                    d.call(this, 16, 65535),
                    h.call(this, 2, 858993459),
                    h.call(this, 8, 16711935),
                    d.call(this, 1, 1431655765);
                  for (var i = 0; i < 16; i++) {
                    for (var r = n[i], o = this._lBlock, a = this._rBlock, s = 0, l = 0; l < 8; l++)
                      s |= u[l][((a ^ r[l]) & c[l]) >>> 0];
                    (this._lBlock = a), (this._rBlock = o ^ s);
                  }
                  var f = this._lBlock;
                  (this._lBlock = this._rBlock),
                    (this._rBlock = f),
                    d.call(this, 1, 1431655765),
                    h.call(this, 8, 16711935),
                    h.call(this, 2, 858993459),
                    d.call(this, 16, 65535),
                    d.call(this, 4, 252645135),
                    (e[t] = this._lBlock),
                    (e[t + 1] = this._rBlock);
                },
                keySize: 2,
                ivSize: 2,
                blockSize: 2
              }));
            function d(e, t) {
              var n = ((this._lBlock >>> e) ^ this._rBlock) & t;
              (this._rBlock ^= n), (this._lBlock ^= n << e);
            }
            function h(e, t) {
              var n = ((this._rBlock >>> e) ^ this._lBlock) & t;
              (this._lBlock ^= n), (this._rBlock ^= n << e);
            }
            e.DES = i._createHelper(f);
            var p = (r.TripleDES = i.extend({
              _doReset: function () {
                var e = this._key.words;
                if (2 !== e.length && 4 !== e.length && e.length < 6)
                  throw new Error(
                    'Invalid key length - 3DES requires the key length to be 64, 128, 192 or >192.'
                  );
                var t = e.slice(0, 2),
                  i = e.length < 4 ? e.slice(0, 2) : e.slice(2, 4),
                  r = e.length < 6 ? e.slice(0, 2) : e.slice(4, 6);
                (this._des1 = f.createEncryptor(n.create(t))),
                  (this._des2 = f.createEncryptor(n.create(i))),
                  (this._des3 = f.createEncryptor(n.create(r)));
              },
              encryptBlock: function (e, t) {
                this._des1.encryptBlock(e, t), this._des2.decryptBlock(e, t), this._des3.encryptBlock(e, t);
              },
              decryptBlock: function (e, t) {
                this._des3.decryptBlock(e, t), this._des2.encryptBlock(e, t), this._des1.decryptBlock(e, t);
              },
              keySize: 6,
              ivSize: 2,
              blockSize: 2
            }));
            e.TripleDES = i._createHelper(p);
          })(),
          o.TripleDES);
      })();
    },
    6140: function (e, t, n) {
      !(function (t, i) {
        var r;
        e.exports =
          ((r = n(4526)),
          (function (e) {
            var t = r,
              n = t.lib,
              i = n.Base,
              o = n.WordArray,
              a = (t.x64 = {});
            (a.Word = i.extend({
              init: function (e, t) {
                (this.high = e), (this.low = t);
              }
            })),
              (a.WordArray = i.extend({
                init: function (t, n) {
                  (t = this.words = t || []), (this.sigBytes = n != e ? n : 8 * t.length);
                },
                toX32: function () {
                  for (var e = this.words, t = e.length, n = [], i = 0; i < t; i++) {
                    var r = e[i];
                    n.push(r.high), n.push(r.low);
                  }
                  return o.create(n, this.sigBytes);
                },
                clone: function () {
                  for (
                    var e = i.clone.call(this), t = (e.words = this.words.slice(0)), n = t.length, r = 0;
                    r < n;
                    r++
                  )
                    t[r] = t[r].clone();
                  return e;
                }
              }));
          })(),
          r);
      })();
    },
    5529: function (e, t, n) {
      'use strict';
      function i(e, t) {
        if (t.length < e)
          throw new TypeError(
            e + ' argument' + (e > 1 ? 's' : '') + ' required, but only ' + t.length + ' present'
          );
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    670: function (e, t, n) {
      'use strict';
      function i(e) {
        if (null === e || !0 === e || !1 === e) return NaN;
        var t = Number(e);
        return isNaN(t) ? t : t < 0 ? Math.ceil(t) : Math.floor(t);
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    6205: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return a;
        }
      });
      var i = n(670),
        r = n(7245),
        o = n(5529);
      function a(e, t) {
        (0, o.Z)(2, arguments);
        var n = (0, r.Z)(e),
          a = (0, i.Z)(t);
        return isNaN(a) ? new Date(NaN) : a ? (n.setDate(n.getDate() + a), n) : n;
      }
    },
    7138: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return a;
        }
      });
      var i = n(670),
        r = n(7245),
        o = n(5529);
      function a(e, t) {
        (0, o.Z)(2, arguments);
        var n = (0, r.Z)(e).getTime(),
          a = (0, i.Z)(t);
        return new Date(n + a);
      }
    },
    5409: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return a;
        }
      });
      var i = n(670),
        r = n(7138),
        o = n(5529);
      function a(e, t) {
        (0, o.Z)(2, arguments);
        var n = (0, i.Z)(t);
        return (0, r.Z)(e, 6e4 * n);
      }
    },
    1574: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return a;
        }
      });
      var i = n(670),
        r = n(7245),
        o = n(5529);
      function a(e, t) {
        (0, o.Z)(2, arguments);
        var n = (0, r.Z)(e),
          a = (0, i.Z)(t);
        if (isNaN(a)) return new Date(NaN);
        if (!a) return n;
        var s = n.getDate(),
          l = new Date(n.getTime());
        l.setMonth(n.getMonth() + a + 1, 0);
        var u = l.getDate();
        return s >= u ? l : (n.setFullYear(l.getFullYear(), l.getMonth(), s), n);
      }
    },
    3112: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return a;
        }
      });
      var i = n(670),
        r = n(6205),
        o = n(5529);
      function a(e, t) {
        (0, o.Z)(2, arguments);
        var n = (0, i.Z)(t),
          a = 7 * n;
        return (0, r.Z)(e, a);
      }
    },
    7245: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return r;
        }
      });
      var i = n(5529);
      function r(e) {
        (0, i.Z)(1, arguments);
        var t = Object.prototype.toString.call(e);
        return e instanceof Date || ('object' === typeof e && '[object Date]' === t)
          ? new Date(e.getTime())
          : 'number' === typeof e || '[object Number]' === t
          ? new Date(e)
          : (('string' !== typeof e && '[object String]' !== t) ||
              'undefined' === typeof console ||
              (console.warn(
                "Starting with v2.0.0-beta.1 date-fns doesn't accept strings as date arguments. Please use `parseISO` to parse strings. See: https://git.io/fjule"
              ),
              console.warn(new Error().stack)),
            new Date(NaN));
      }
    },
    6502: function (e, t) {
      (t.read = function (e, t, n, i, r) {
        var o,
          a,
          s = 8 * r - i - 1,
          l = (1 << s) - 1,
          u = l >> 1,
          c = -7,
          f = n ? r - 1 : 0,
          d = n ? -1 : 1,
          h = e[t + f];
        for (
          f += d, o = h & ((1 << -c) - 1), h >>= -c, c += s;
          c > 0;
          o = 256 * o + e[t + f], f += d, c -= 8
        );
        for (a = o & ((1 << -c) - 1), o >>= -c, c += i; c > 0; a = 256 * a + e[t + f], f += d, c -= 8);
        if (0 === o) o = 1 - u;
        else {
          if (o === l) return a ? NaN : (1 / 0) * (h ? -1 : 1);
          (a += Math.pow(2, i)), (o -= u);
        }
        return (h ? -1 : 1) * a * Math.pow(2, o - i);
      }),
        (t.write = function (e, t, n, i, r, o) {
          var a,
            s,
            l,
            u = 8 * o - r - 1,
            c = (1 << u) - 1,
            f = c >> 1,
            d = 23 === r ? Math.pow(2, -24) - Math.pow(2, -77) : 0,
            h = i ? 0 : o - 1,
            p = i ? 1 : -1,
            v = t < 0 || (0 === t && 1 / t < 0) ? 1 : 0;
          for (
            t = Math.abs(t),
              isNaN(t) || t === 1 / 0
                ? ((s = isNaN(t) ? 1 : 0), (a = c))
                : ((a = Math.floor(Math.log(t) / Math.LN2)),
                  t * (l = Math.pow(2, -a)) < 1 && (a--, (l *= 2)),
                  (t += a + f >= 1 ? d / l : d * Math.pow(2, 1 - f)) * l >= 2 && (a++, (l /= 2)),
                  a + f >= c
                    ? ((s = 0), (a = c))
                    : a + f >= 1
                    ? ((s = (t * l - 1) * Math.pow(2, r)), (a += f))
                    : ((s = t * Math.pow(2, f - 1) * Math.pow(2, r)), (a = 0)));
            r >= 8;
            e[n + h] = 255 & s, h += p, s /= 256, r -= 8
          );
          for (a = (a << r) | s, u += r; u > 0; e[n + h] = 255 & a, h += p, a /= 256, u -= 8);
          e[n + h - p] |= 128 * v;
        });
    },
    5187: function (e, t, n) {
      'use strict';
      var i;
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.AmpStateContext = void 0);
      var r = ((i = n(1738)) && i.__esModule ? i : { default: i }).default.createContext({});
      t.AmpStateContext = r;
    },
    6932: function (e, t, n) {
      'use strict';
      Object.defineProperty(t, '__esModule', { value: !0 }),
        (t.isInAmpMode = a),
        (t.useAmp = function () {
          return a(r.default.useContext(o.AmpStateContext));
        });
      var i,
        r = (i = n(1738)) && i.__esModule ? i : { default: i },
        o = n(5187);
      function a() {
        var e = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : {},
          t = e.ampFirst,
          n = void 0 !== t && t,
          i = e.hybrid,
          r = void 0 !== i && i,
          o = e.hasQuery,
          a = void 0 !== o && o;
        return n || (r && a);
      }
      ('function' === typeof t.default || ('object' === typeof t.default && null !== t.default)) &&
        (Object.assign(t.default, t), (e.exports = t.default));
    },
    1716: function (e, t, n) {
      'use strict';
      var i = n(4008);
      function r(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          t &&
            (i = i.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, i);
        }
        return n;
      }
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.defaultHead = f), (t.default = void 0);
      var o,
        a = (function (e) {
          if (e && e.__esModule) return e;
          var t = {};
          if (null != e)
            for (var n in e)
              if (Object.prototype.hasOwnProperty.call(e, n)) {
                var i =
                  Object.defineProperty && Object.getOwnPropertyDescriptor
                    ? Object.getOwnPropertyDescriptor(e, n)
                    : {};
                i.get || i.set ? Object.defineProperty(t, n, i) : (t[n] = e[n]);
              }
          return (t.default = e), t;
        })(n(1738)),
        s = (o = n(2322)) && o.__esModule ? o : { default: o },
        l = n(5187),
        u = n(5339),
        c = n(6932);
      n(8172);
      function f() {
        var e = arguments.length > 0 && void 0 !== arguments[0] && arguments[0],
          t = [a.default.createElement('meta', { charSet: 'utf-8' })];
        return (
          e || t.push(a.default.createElement('meta', { name: 'viewport', content: 'width=device-width' })), t
        );
      }
      function d(e, t) {
        return 'string' === typeof t || 'number' === typeof t
          ? e
          : t.type === a.default.Fragment
          ? e.concat(
              a.default.Children.toArray(t.props.children).reduce(function (e, t) {
                return 'string' === typeof t || 'number' === typeof t ? e : e.concat(t);
              }, [])
            )
          : e.concat(t);
      }
      var h = ['name', 'httpEquiv', 'charSet', 'itemProp'];
      function p(e, t) {
        return e
          .reduce(function (e, t) {
            var n = a.default.Children.toArray(t.props.children);
            return e.concat(n);
          }, [])
          .reduce(d, [])
          .reverse()
          .concat(f(t.inAmpMode))
          .filter(
            (function () {
              var e = new Set(),
                t = new Set(),
                n = new Set(),
                i = {};
              return function (r) {
                var o = !0,
                  a = !1;
                if (r.key && 'number' !== typeof r.key && r.key.indexOf('$') > 0) {
                  a = !0;
                  var s = r.key.slice(r.key.indexOf('$') + 1);
                  e.has(s) ? (o = !1) : e.add(s);
                }
                switch (r.type) {
                  case 'title':
                  case 'base':
                    t.has(r.type) ? (o = !1) : t.add(r.type);
                    break;
                  case 'meta':
                    for (var l = 0, u = h.length; l < u; l++) {
                      var c = h[l];
                      if (r.props.hasOwnProperty(c))
                        if ('charSet' === c) n.has(c) ? (o = !1) : n.add(c);
                        else {
                          var f = r.props[c],
                            d = i[c] || new Set();
                          ('name' === c && a) || !d.has(f) ? (d.add(f), (i[c] = d)) : (o = !1);
                        }
                    }
                }
                return o;
              };
            })()
          )
          .reverse()
          .map(function (e, n) {
            var o = e.key || n;
            if (
              !t.inAmpMode &&
              'link' === e.type &&
              e.props.href &&
              ['https://fonts.googleapis.com/css', 'https://use.typekit.net/'].some(function (t) {
                return e.props.href.startsWith(t);
              })
            ) {
              var s = (function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = null != arguments[t] ? arguments[t] : {};
                  t % 2
                    ? r(Object(n), !0).forEach(function (t) {
                        i(e, t, n[t]);
                      })
                    : Object.getOwnPropertyDescriptors
                    ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
                    : r(Object(n)).forEach(function (t) {
                        Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
                      });
                }
                return e;
              })({}, e.props || {});
              return (
                (s['data-href'] = s.href),
                (s.href = void 0),
                (s['data-optimized-fonts'] = !0),
                a.default.cloneElement(e, s)
              );
            }
            return a.default.cloneElement(e, { key: o });
          });
      }
      var v = function (e) {
        var t = e.children,
          n = a.useContext(l.AmpStateContext),
          i = a.useContext(u.HeadManagerContext);
        return a.default.createElement(
          s.default,
          { reduceComponentsToState: p, headManager: i, inAmpMode: c.isInAmpMode(n) },
          t
        );
      };
      (t.default = v),
        ('function' === typeof t.default || ('object' === typeof t.default && null !== t.default)) &&
          (Object.assign(t.default, t), (e.exports = t.default));
    },
    2322: function (e, t, n) {
      'use strict';
      var i = n(6595),
        r = n(3052),
        o = n(6506),
        a = (n(8196), n(6236)),
        s = n(8859),
        l = n(4887);
      function u(e) {
        var t = (function () {
          if ('undefined' === typeof Reflect || !Reflect.construct) return !1;
          if (Reflect.construct.sham) return !1;
          if ('function' === typeof Proxy) return !0;
          try {
            return Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})), !0;
          } catch (e) {
            return !1;
          }
        })();
        return function () {
          var n,
            i = l(e);
          if (t) {
            var r = l(this).constructor;
            n = Reflect.construct(i, arguments, r);
          } else n = i.apply(this, arguments);
          return s(this, n);
        };
      }
      Object.defineProperty(t, '__esModule', { value: !0 }), (t.default = void 0);
      var c = (function (e) {
        if (e && e.__esModule) return e;
        var t = {};
        if (null != e)
          for (var n in e)
            if (Object.prototype.hasOwnProperty.call(e, n)) {
              var i =
                Object.defineProperty && Object.getOwnPropertyDescriptor
                  ? Object.getOwnPropertyDescriptor(e, n)
                  : {};
              i.get || i.set ? Object.defineProperty(t, n, i) : (t[n] = e[n]);
            }
        return (t.default = e), t;
      })(n(1738));
      var f = (function (e) {
        a(n, e);
        var t = u(n);
        function n(e) {
          var o;
          return (
            r(this, n),
            ((o = t.call(this, e)).emitChange = function () {
              o._hasHeadManager &&
                o.props.headManager.updateHead(
                  o.props.reduceComponentsToState(i(o.props.headManager.mountedInstances), o.props)
                );
            }),
            (o._hasHeadManager = o.props.headManager && o.props.headManager.mountedInstances),
            o
          );
        }
        return (
          o(n, [
            {
              key: 'componentDidMount',
              value: function () {
                this._hasHeadManager && this.props.headManager.mountedInstances.add(this), this.emitChange();
              }
            },
            {
              key: 'componentDidUpdate',
              value: function () {
                this.emitChange();
              }
            },
            {
              key: 'componentWillUnmount',
              value: function () {
                this._hasHeadManager && this.props.headManager.mountedInstances.delete(this),
                  this.emitChange();
              }
            },
            {
              key: 'render',
              value: function () {
                return null;
              }
            }
          ]),
          n
        );
      })(c.Component);
      t.default = f;
    },
    4858: function (e, t, n) {
      'use strict';
      n.r(t);
      var i = n(4831),
        r = (n(790), n(6002), n(8316)),
        o = n(1030);
      function a(e, t) {
        var n = Object.keys(e);
        if (Object.getOwnPropertySymbols) {
          var i = Object.getOwnPropertySymbols(e);
          t &&
            (i = i.filter(function (t) {
              return Object.getOwnPropertyDescriptor(e, t).enumerable;
            })),
            n.push.apply(n, i);
        }
        return n;
      }
      function s(e) {
        for (var t = 1; t < arguments.length; t++) {
          var n = null != arguments[t] ? arguments[t] : {};
          t % 2
            ? a(Object(n), !0).forEach(function (t) {
                (0, i.Z)(e, t, n[t]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(e, Object.getOwnPropertyDescriptors(n))
            : a(Object(n)).forEach(function (t) {
                Object.defineProperty(e, t, Object.getOwnPropertyDescriptor(n, t));
              });
        }
        return e;
      }
      t.default = function (e) {
        var t = e.Component,
          n = e.pageProps;
        return (0, o.jsx)(r.mu, {
          children: (0, o.jsx)(r.N$, {
            children: (0, o.jsxs)(r.iK, {
              children: [
                (0, o.jsx)(r.h4, {}),
                (0, o.jsx)(t, s({}, n)),
                (0, o.jsx)('footer', { id: 'footer' })
              ]
            })
          })
        });
      };
    },
    2538: function (e, t, n) {
      'use strict';
      n.d(t, {
        k: function () {
          return a;
        }
      });
      var i = n(4997),
        r = { navigationOpen: !0, minContentWidth: 280, maxContentWidth: void 0 },
        o = {
          default: (0, i.pi)({}, r),
          cards: { navigationOpen: !0, minContentWidth: 280, maxContentWidth: void 0 },
          form: { navigationOpen: !1, minContentWidth: 280, maxContentWidth: 800 },
          table: { navigationOpen: !0, minContentWidth: 280, maxContentWidth: void 0 },
          wizard: { navigationOpen: !1, minContentWidth: 280, maxContentWidth: 1080 }
        };
      function a(e, t, n) {
        var r,
          a,
          s,
          l,
          u = n ? (0, i.pi)((0, i.pi)({}, o[e]), { maxContentWidth: void 0 }) : o[e];
        return {
          maxContentWidth: null !== (r = t.maxContentWidth) && void 0 !== r ? r : u.maxContentWidth,
          minContentWidth: null !== (a = t.minContentWidth) && void 0 !== a ? a : u.minContentWidth,
          navigationOpen: null !== (s = t.navigationOpen) && void 0 !== s ? s : u.navigationOpen,
          toolsOpen: null !== (l = t.toolsOpen) && void 0 !== l ? l : u.toolsOpen
        };
      }
    },
    8006: function (e, t, n) {
      'use strict';
      n.d(t, {
        x: function () {
          return o;
        }
      });
      var i = n(4673),
        r = n(1738);
      function o(e) {
        var t = (0, r.useCallback)(
            function () {
              var t, n;
              return 'string' === typeof e
                ? document.querySelector(e)
                : 'function' === typeof e
                ? null !== (t = e()) && void 0 !== t
                  ? t
                  : null
                : null !== (n = null === e || void 0 === e ? void 0 : e.current) && void 0 !== n
                ? n
                : null;
            },
            [e]
          ),
          n = (0, r.useState)(0),
          o = n[0],
          a = n[1];
        return (
          (0, i.y)(t, function (e) {
            return a(e.borderBoxHeight);
          }),
          o
        );
      }
    },
    1170: function (e, t, n) {
      'use strict';
      n.d(t, {
        T: function () {
          return m;
        },
        w: function () {
          return g;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(7579),
        a = n(5857),
        s = n(6066),
        l = n(6208),
        u = n(4673),
        c = n(6918),
        f = n(7059),
        d = n(7345),
        h = n(857),
        p = n(2391),
        v = n(2538),
        _ = {
          breadcrumbs: null,
          content: null,
          contentHeader: null,
          contentType: 'default',
          disableBodyScroll: !1,
          disableContentHeaderOverlap: !1,
          disableContentPaddings: !1,
          dynamicOverlapHeight: 0,
          headerHeight: 0,
          footerHeight: 0,
          handleNavigationClick: function (e) {
            return e;
          },
          handleSplitPanelClick: function () {},
          handleSplitPanelPreferencesChange: function () {},
          handleSplitPanelResize: function () {},
          handleToolsClick: function (e) {
            return e;
          },
          hasDefaultToolsWidth: !0,
          hasNotificationsContent: !1,
          isAnyPanelOpen: !1,
          isMobile: !1,
          isNavigationOpen: !1,
          isSplitPanelForcedPosition: !1,
          isSplitPanelOpen: !1,
          isToolsOpen: !1,
          layoutElement: (0, r.createRef)(),
          layoutWidth: 0,
          mainElement: (0, r.createRef)(),
          mainOffsetLeft: 0,
          maxContentWidth: 0,
          minContentWidth: 280,
          navigation: null,
          navigationHide: !1,
          navigationOpen: !1,
          notifications: null,
          notificationsElement: (0, r.createRef)(),
          notificationsHeight: 0,
          offsetBottom: 0,
          onNavigationChange: function () {},
          onSplitPanelResize: function () {},
          onSplitPanelToggle: function () {},
          onSplitPanelPreferencesChange: function () {},
          setDynamicOverlapHeight: function (e) {},
          setIsNavigationOpen: function (e) {
            return e;
          },
          setIsToolsOpen: function (e) {
            return e;
          },
          setOffsetBottom: function (e) {},
          setSplitPanelReportedSize: function (e) {},
          splitPanelMaxWidth: 280,
          splitPanelMinWidth: 280,
          splitPanelOpen: !1,
          splitPanelPosition: 'bottom',
          splitPanelPreferences: { position: 'bottom' },
          splitPanelReportedSize: 0,
          splitPanelSize: 0,
          stickyNotifications: !1,
          tools: null
        },
        m = (0, r.createContext)((0, i.pi)({}, _)),
        g = r.forwardRef(function (e, t) {
          var n,
            g,
            w,
            y = e.toolsHide,
            b = e.toolsOpen,
            x = e.navigationHide,
            E = e.navigationOpen,
            k = e.contentType,
            C = void 0 === k ? 'default' : k,
            S = e.headerSelector,
            N = void 0 === S ? '#b #h' : S,
            j = e.footerSelector,
            z = void 0 === j ? '#b #h' : j,
            O = e.children,
            T = (0, i._T)(e, [
              'toolsHide',
              'toolsOpen',
              'navigationHide',
              'navigationOpen',
              'contentType',
              'headerSelector',
              'footerSelector',
              'children'
            ]),
            R = (0, l.X)();
          h.y &&
            b &&
            y &&
            (0, p.O)(
              'AppLayout',
              'You have enabled both the `toolsOpen` prop and the `toolsHide` prop. This is not supported. Set `toolsOpen` to `false` when you set `toolsHide` to `true`.'
            );
          var B = (0, r.useState)(0),
            A = B[0],
            L = B[1],
            P = 8947848.525,
            Z =
              T.maxContentWidth && T.maxContentWidth > P
                ? P
                : null !== (n = T.maxContentWidth) && void 0 !== n
                ? n
                : 0,
            M = null !== (g = T.minContentWidth) && void 0 !== g ? g : 280,
            I = (0, v.k)(C, { maxContentWidth: Z, minContentWidth: M }, !0),
            H = (0, s.q)(E, T.onNavigationChange, !R && I.navigationOpen, {
              componentName: 'AppLayout',
              controlledProp: 'navigationOpen',
              changeHandler: 'onNavigationChange'
            }),
            D = H[0],
            U = void 0 !== D && D,
            q = H[1],
            F = (0, r.useCallback)(
              function (e) {
                q(e), (0, o.B4)(T.onNavigationChange, { open: e });
              },
              [T.onNavigationChange, q]
            ),
            W = null !== (w = T.toolsWidth) && void 0 !== w ? w : 290,
            V = void 0 === T.toolsWidth,
            G = (0, s.q)(b, T.onToolsChange, !R && I.toolsOpen, {
              componentName: 'AppLayout',
              controlledProp: 'toolsOpen',
              changeHandler: 'onToolsChange'
            }),
            K = G[0],
            X = void 0 !== K && K,
            $ = G[1],
            J = (0, r.useCallback)(
              function (e) {
                $(e), (0, o.B4)(T.onToolsChange, { open: e });
              },
              [T.onToolsChange, $]
            ),
            Y = (!x && U) || (!y && X);
          (0, r.useEffect)(
            function () {
              return (
                R && (U || X)
                  ? document.body.classList.add(d.Z['block-body-scroll'])
                  : document.body.classList.remove(d.Z['block-body-scroll']),
                function () {
                  document.body.classList.remove(d.Z['block-body-scroll']);
                }
              );
            },
            [R, U, X]
          ),
            (0, r.useImperativeHandle)(
              t,
              function () {
                return {
                  closeNavigationIfNecessary: function () {
                    R && F(!1);
                  },
                  openTools: function () {
                    J(!0);
                  }
                };
              },
              [R, F, J]
            );
          var Q = (0, r.useState)(0),
            ee = Q[0],
            te = Q[1],
            ne = (0, r.useCallback)(
              function () {
                return document.querySelector(N);
              },
              [N]
            );
          (0, u.y)(ne, function (e) {
            return te(e.borderBoxHeight);
          });
          var ie = (0, r.useState)(0),
            re = ie[0],
            oe = ie[1],
            ae = (0, r.useCallback)(
              function () {
                return document.querySelector(z);
              },
              [z]
            );
          (0, u.y)(ae, function (e) {
            return oe(e.borderBoxHeight);
          });
          var se = 280,
            le = (0, r.useState)(se),
            ue = le[0],
            ce = le[1],
            fe = (0, s.q)(T.splitPanelOpen, T.onSplitPanelToggle, !1, {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelOpen',
              changeHandler: 'onSplitPanelToggle'
            }),
            de = fe[0],
            he = fe[1],
            pe = (0, r.useCallback)(
              function () {
                he(!de), (0, o.B4)(T.onSplitPanelToggle, { open: !de });
              },
              [T.onSplitPanelToggle, de, he]
            ),
            ve = (0, s.q)(T.splitPanelPreferences, T.onSplitPanelPreferencesChange, void 0, {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelPreferences',
              changeHandler: 'onSplitPanelPreferencesChange'
            }),
            _e = ve[0],
            me = ve[1],
            ge = (0, r.useState)(!1),
            we = ge[0],
            ye = ge[1],
            be = (0, a.P)(we, _e);
          (0, r.useLayoutEffect)(
            function () {
              ye(se > ue);
            },
            [ue, se]
          );
          var xe = (0, r.useState)(0),
            Ee = xe[0],
            ke = xe[1],
            Ce = (0, s.q)(T.splitPanelSize, T.onSplitPanelResize, (0, f.LV)(be), {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelSize',
              changeHandler: 'onSplitPanelResize'
            }),
            Se = Ce[0],
            Ne = Ce[1],
            je = (0, r.useCallback)(
              function (e) {
                Ne(e.size), (0, o.B4)(T.onSplitPanelResize, e);
              },
              [T.onSplitPanelResize, Ne]
            ),
            ze = (0, r.useCallback)(
              function (e) {
                me(e), (0, o.B4)(T.onSplitPanelPreferencesChange, e);
              },
              [T.onSplitPanelPreferencesChange, me]
            ),
            Oe = (0, c.D)(function (e) {
              return e.width;
            }),
            Te = Oe[0],
            Re = Oe[1],
            Be = null !== Te && void 0 !== Te ? Te : 0,
            Ae = (0, r.useRef)(null),
            Le = (0, r.useState)(0),
            Pe = Le[0],
            Ze = Le[1];
          (0, r.useLayoutEffect)(
            function () {
              var e, t;
              Ze(
                null !==
                  (t =
                    null === (e = null === Ae || void 0 === Ae ? void 0 : Ae.current) || void 0 === e
                      ? void 0
                      : e.offsetLeft) && void 0 !== t
                  ? t
                  : 0
              );
            },
            [Be, U, X, Ee]
          ),
            (0, r.useLayoutEffect)(
              function () {
                ce(Be - Pe - M - 80 - (X ? W : 0) - 160);
              },
              [U, X, Be, Pe, M, W]
            );
          var Me = (0, c.D)(function (e) {
              return e.height;
            }),
            Ie = Me[0],
            He = Me[1],
            De = (0, r.useState)(0),
            Ue = De[0],
            qe = De[1],
            Fe = (0, r.useState)(!1),
            We = Fe[0],
            Ve = Fe[1];
          (0, r.useEffect)(
            function () {
              qe(null !== Ie && void 0 !== Ie ? Ie : 0), Ve(!!(Ie && Ie > 0));
            },
            [Ie]
          );
          var Ge = (0, r.useState)(0),
            Ke = Ge[0],
            Xe = Ge[1];
          return r.createElement(
            m.Provider,
            {
              value: (0, i.pi)((0, i.pi)((0, i.pi)({}, _), T), {
                contentType: C,
                dynamicOverlapHeight: A,
                headerHeight: ee,
                footerHeight: re,
                hasDefaultToolsWidth: V,
                handleNavigationClick: F,
                handleSplitPanelClick: pe,
                handleSplitPanelPreferencesChange: ze,
                handleSplitPanelResize: je,
                handleToolsClick: J,
                hasNotificationsContent: We,
                isAnyPanelOpen: Y,
                isMobile: R,
                isNavigationOpen: null !== U && void 0 !== U && U,
                isSplitPanelForcedPosition: we,
                isSplitPanelOpen: de,
                isToolsOpen: X,
                layoutElement: Re,
                layoutWidth: Be,
                mainElement: Ae,
                mainOffsetLeft: Pe,
                maxContentWidth: Z,
                minContentWidth: M,
                navigationHide: x,
                notificationsElement: He,
                notificationsHeight: Ue,
                offsetBottom: Ke,
                setDynamicOverlapHeight: L,
                setOffsetBottom: Xe,
                setSplitPanelReportedSize: ke,
                splitPanelMaxWidth: ue,
                splitPanelMinWidth: se,
                splitPanelPosition: be,
                splitPanelPreferences: _e,
                splitPanelReportedSize: Ee,
                splitPanelSize: Se,
                toolsHide: y,
                toolsOpen: X,
                toolsWidth: W
              })
            },
            O
          );
        });
    },
    5857: function (e, t, n) {
      'use strict';
      n.d(t, {
        P: function () {
          return p;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(7069),
        a = n(1170),
        s = n(2592),
        l = n(7345),
        u = n(6270),
        c = n(7398),
        f = n(8006),
        d = n(9095);
      function h(e) {
        var t = e.children,
          n = (0, r.useContext)(a.T),
          o = n.handleSplitPanelClick,
          l = n.handleSplitPanelPreferencesChange,
          c = n.handleSplitPanelResize,
          f = n.isMobile,
          d = n.isSplitPanelForcedPosition,
          h = n.isSplitPanelOpen,
          p = n.setSplitPanelReportedSize,
          v = n.splitPanelPosition,
          _ = n.splitPanelSize,
          m = n.headerHeight,
          g = n.footerHeight,
          w = (0, r.useState)(void 0),
          y = w[0],
          b = w[1],
          x = (0, r.useState)(),
          E = x[0],
          k = x[1];
        (0, u.G)(
          function () {
            return k(h ? { type: 'open' } : { type: 'close' });
          },
          [h]
        ),
          (0, u.G)(
            function () {
              return k({ type: 'position' });
            },
            [v]
          );
        var C = (0, r.useRef)(null),
          S = (0, r.useRef)(null),
          N = {
            bottomOffset: 0,
            getMaxHeight: function () {
              var e = document.documentElement.clientHeight - m - g;
              return e < 400 ? e - 40 : e - 250;
            },
            getMaxWidth: function () {
              return document.documentElement.clientWidth;
            },
            getHeader: function () {
              return S.current;
            },
            isForcedPosition: d,
            isMobile: f,
            isOpen: h,
            isRefresh: !0,
            leftOffset: 0,
            onPreferencesChange: l,
            onResize: c,
            onToggle: o,
            position: v,
            reportSize: p,
            rightOffset: 0,
            size: _ || 0,
            splitPanelRef: C,
            splitPanelHeaderRef: S,
            topOffset: 0,
            openButtonAriaLabel: y,
            setOpenButtonAriaLabel: b,
            lastInteraction: E
          };
        return r.createElement(s.C.Provider, { value: (0, i.pi)({}, N) }, t);
      }
      function p(e, t) {
        var n = 'bottom';
        return e || 'side' !== (null === t || void 0 === t ? void 0 : t.position) || (n = 'side'), n;
      }
      (h.Bottom = function () {
        var e = (0, r.useContext)(a.T),
          t = e.disableBodyScroll,
          n = e.isNavigationOpen,
          i = e.isSplitPanelOpen,
          u = e.isToolsOpen,
          p = e.splitPanel,
          v = e.splitPanelReportedSize,
          _ = (0, r.useContext)(s.C),
          m = _.position,
          g = _.getHeader,
          w = (0, f.x)(g);
        return p
          ? r.createElement(c.u, { in: null !== i && void 0 !== i && i, exit: !1 }, function (e, a) {
              var s, c;
              return r.createElement(
                'section',
                {
                  className: (0, o.Z)(
                    l.Z['split-panel-bottom'],
                    l.Z['position-'.concat(m)],
                    ((s = {}),
                    (s[l.Z.animating] = 'entering' === e),
                    (s[l.Z['disable-body-scroll']] = t),
                    (s[l.Z['is-navigation-open']] = n),
                    (s[l.Z['is-split-panel-open']] = i),
                    (s[l.Z['is-tools-open']] = u),
                    s)
                  ),
                  ref: a,
                  style:
                    ((c = {}),
                    (c[d.Z.splitPanelReportedSize] = ''.concat(v, 'px')),
                    (c[d.Z.splitPanelReportedHeaderSize] = ''.concat(w, 'px')),
                    c)
                },
                r.createElement(h, null),
                'bottom' === m && p
              );
            })
          : null;
      }),
        (h.Side = function () {
          var e = (0, r.useContext)(a.T),
            t = e.isSplitPanelOpen,
            n = e.splitPanel,
            i = e.splitPanelMaxWidth,
            u = e.splitPanelMinWidth,
            f = e.splitPanelReportedSize,
            h = (0, r.useContext)(s.C).position;
          return n
            ? r.createElement(c.u, { in: null !== t && void 0 !== t && t, exit: !1 }, function (e, a) {
                var s, c;
                return r.createElement(
                  'section',
                  {
                    'aria-hidden': !t || 'bottom' === h,
                    className: (0, o.Z)(
                      l.Z['split-panel-side'],
                      l.Z['position-'.concat(h)],
                      ((s = {}),
                      (s[l.Z.animating] = 'entering' === e),
                      (s[l.Z['is-split-panel-open']] = t),
                      s)
                    ),
                    ref: a,
                    style:
                      ((c = {}),
                      (c[d.Z.splitPanelMaxWidth] = ''.concat(i, 'px')),
                      (c[d.Z.splitPanelMinWidth] = ''.concat(u, 'px')),
                      (c[d.Z.splitPanelReportedHeaderSize] = ''.concat(f, 'px')),
                      c)
                  },
                  r.createElement('div', { className: (0, o.Z)(l.Z['animated-content']) }, 'side' === h && n)
                );
              })
            : null;
        }),
        (t.Z = h);
    },
    7345: function (e, t, n) {
      'use strict';
      n(5441);
      t.Z = {
        appbar: 'awsui_appbar_hyvsj_1cvzy_93',
        'appbar-nav': 'awsui_appbar-nav_hyvsj_1cvzy_117',
        breadcrumbs: 'awsui_breadcrumbs_hyvsj_1cvzy_121',
        'appbar-tools': 'awsui_appbar-tools_hyvsj_1cvzy_125',
        'has-breadcrumbs': 'awsui_has-breadcrumbs_hyvsj_1cvzy_160',
        'has-notifications-content': 'awsui_has-notifications-content_hyvsj_1cvzy_167',
        'has-header': 'awsui_has-header_hyvsj_1cvzy_173',
        'has-dynamic-overlap-height': 'awsui_has-dynamic-overlap-height_hyvsj_1cvzy_173',
        'content-type-wizard': 'awsui_content-type-wizard_hyvsj_1cvzy_174',
        'content-type-cards': 'awsui_content-type-cards_hyvsj_1cvzy_177',
        'content-type-table': 'awsui_content-type-table_hyvsj_1cvzy_178',
        background: 'awsui_background_hyvsj_1cvzy_213',
        'notifications-appbar-header': 'awsui_notifications-appbar-header_hyvsj_1cvzy_216',
        'sticky-notifications': 'awsui_sticky-notifications_hyvsj_1cvzy_228',
        overlap: 'awsui_overlap_hyvsj_1cvzy_234',
        content: 'awsui_content_hyvsj_1cvzy_174',
        layout: 'awsui_layout_hyvsj_1cvzy_322',
        'has-max-content-width': 'awsui_has-max-content-width_hyvsj_1cvzy_404',
        'is-overlap-disabled': 'awsui_is-overlap-disabled_hyvsj_1cvzy_431',
        'disable-body-scroll': 'awsui_disable-body-scroll_hyvsj_1cvzy_434',
        'has-sticky-notifications': 'awsui_has-sticky-notifications_hyvsj_1cvzy_438',
        'has-split-panel': 'awsui_has-split-panel_hyvsj_1cvzy_452',
        'split-panel-position-bottom': 'awsui_split-panel-position-bottom_hyvsj_1cvzy_452',
        'has-content-gap-left': 'awsui_has-content-gap-left_hyvsj_1cvzy_464',
        'has-content-gap-right': 'awsui_has-content-gap-right_hyvsj_1cvzy_467',
        'block-body-scroll': 'awsui_block-body-scroll_hyvsj_1cvzy_482',
        container: 'awsui_container_hyvsj_1cvzy_490',
        'disable-content-paddings': 'awsui_disable-content-paddings_hyvsj_1cvzy_507',
        'is-navigation-open': 'awsui_is-navigation-open_hyvsj_1cvzy_512',
        'is-tools-open': 'awsui_is-tools-open_hyvsj_1cvzy_515',
        'is-split-panel-open': 'awsui_is-split-panel-open_hyvsj_1cvzy_515',
        'split-panel-position-side': 'awsui_split-panel-position-side_hyvsj_1cvzy_515',
        'content-type-default': 'awsui_content-type-default_hyvsj_1cvzy_535',
        'content-type-form': 'awsui_content-type-form_hyvsj_1cvzy_535',
        unfocusable: 'awsui_unfocusable_hyvsj_1cvzy_576',
        'navigation-container': 'awsui_navigation-container_hyvsj_1cvzy_584',
        'show-navigation': 'awsui_show-navigation_hyvsj_1cvzy_608',
        animating: 'awsui_animating_hyvsj_1cvzy_630',
        showButtons: 'awsui_showButtons_hyvsj_1cvzy_1',
        navigation: 'awsui_navigation_hyvsj_1cvzy_584',
        openNavigation: 'awsui_openNavigation_hyvsj_1cvzy_1',
        'animated-content': 'awsui_animated-content_hyvsj_1cvzy_690',
        'hide-navigation': 'awsui_hide-navigation_hyvsj_1cvzy_699',
        notifications: 'awsui_notifications_hyvsj_1cvzy_216',
        'split-panel-bottom': 'awsui_split-panel-bottom_hyvsj_1cvzy_766',
        'position-bottom': 'awsui_position-bottom_hyvsj_1cvzy_801',
        openSplitPanelBottom: 'awsui_openSplitPanelBottom_hyvsj_1cvzy_1',
        'split-panel-side': 'awsui_split-panel-side_hyvsj_1cvzy_830',
        'position-side': 'awsui_position-side_hyvsj_1cvzy_857',
        openSplitPanelSide: 'awsui_openSplitPanelSide_hyvsj_1cvzy_1',
        'tools-container': 'awsui_tools-container_hyvsj_1cvzy_894',
        tools: 'awsui_tools_hyvsj_1cvzy_894',
        openTools: 'awsui_openTools_hyvsj_1cvzy_1',
        'has-tools-form-persistence': 'awsui_has-tools-form-persistence_hyvsj_1cvzy_977',
        'hide-tools': 'awsui_hide-tools_hyvsj_1cvzy_987',
        'show-tools': 'awsui_show-tools_hyvsj_1cvzy_999',
        'has-tools-form': 'awsui_has-tools-form_hyvsj_1cvzy_977',
        trigger: 'awsui_trigger_hyvsj_1cvzy_1056',
        selected: 'awsui_selected_hyvsj_1cvzy_1094'
      };
    },
    1510: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return l;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(6430),
        a = n(6794),
        s = n(822);
      function l(e) {
        var t = e.variant,
          n = void 0 === t ? 'div' : t,
          o = e.margin,
          l = void 0 === o ? {} : o,
          u = e.padding,
          c = void 0 === u ? {} : u,
          f = (0, i._T)(e, ['variant', 'margin', 'padding']),
          d = (0, s.Z)('Box');
        return r.createElement(a.Z, (0, i.pi)({ variant: n, margin: l, padding: c }, f, d));
      }
      (0, o.b)(l, 'Box');
    },
    6794: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return l;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(286),
        a = n(7069),
        s =
          (n(4318),
          {
            root: 'awsui_root_18wu0_1xtkt_93',
            box: 'awsui_box_18wu0_1xtkt_205',
            'p-variant': 'awsui_p-variant_18wu0_1xtkt_205',
            'color-default': 'awsui_color-default_18wu0_1xtkt_205',
            'b-variant': 'awsui_b-variant_18wu0_1xtkt_205',
            'strong-variant': 'awsui_strong-variant_18wu0_1xtkt_205',
            'code-variant': 'awsui_code-variant_18wu0_1xtkt_205',
            'pre-variant': 'awsui_pre-variant_18wu0_1xtkt_205',
            'samp-variant': 'awsui_samp-variant_18wu0_1xtkt_205',
            'h1-variant': 'awsui_h1-variant_18wu0_1xtkt_209',
            'h2-variant': 'awsui_h2-variant_18wu0_1xtkt_209',
            'h3-variant': 'awsui_h3-variant_18wu0_1xtkt_209',
            'h4-variant': 'awsui_h4-variant_18wu0_1xtkt_209',
            'h5-variant': 'awsui_h5-variant_18wu0_1xtkt_209',
            'small-variant': 'awsui_small-variant_18wu0_1xtkt_213',
            'a-variant': 'awsui_a-variant_18wu0_1xtkt_217',
            'font-size-default': 'awsui_font-size-default_18wu0_1xtkt_221',
            'font-weight-default': 'awsui_font-weight-default_18wu0_1xtkt_261',
            'key-label-variant': 'awsui_key-label-variant_18wu0_1xtkt_301',
            'value-large-variant': 'awsui_value-large-variant_18wu0_1xtkt_306',
            'color-inverted': 'awsui_color-inverted_18wu0_1xtkt_314',
            'color-text-label': 'awsui_color-text-label_18wu0_1xtkt_317',
            'color-text-body-secondary': 'awsui_color-text-body-secondary_18wu0_1xtkt_320',
            'color-text-status-error': 'awsui_color-text-status-error_18wu0_1xtkt_323',
            'color-text-status-success': 'awsui_color-text-status-success_18wu0_1xtkt_326',
            'color-text-status-info': 'awsui_color-text-status-info_18wu0_1xtkt_329',
            'color-text-status-inactive': 'awsui_color-text-status-inactive_18wu0_1xtkt_332',
            'color-inherit': 'awsui_color-inherit_18wu0_1xtkt_335',
            'font-size-body-s': 'awsui_font-size-body-s_18wu0_1xtkt_338',
            'font-size-body-m': 'awsui_font-size-body-m_18wu0_1xtkt_343',
            'font-size-heading-xs': 'awsui_font-size-heading-xs_18wu0_1xtkt_347',
            'font-size-heading-s': 'awsui_font-size-heading-s_18wu0_1xtkt_351',
            'font-size-heading-m': 'awsui_font-size-heading-m_18wu0_1xtkt_356',
            'font-size-heading-l': 'awsui_font-size-heading-l_18wu0_1xtkt_361',
            'font-size-heading-xl': 'awsui_font-size-heading-xl_18wu0_1xtkt_366',
            'font-size-display-l': 'awsui_font-size-display-l_18wu0_1xtkt_371',
            'font-weight-light': 'awsui_font-weight-light_18wu0_1xtkt_376',
            'font-weight-normal': 'awsui_font-weight-normal_18wu0_1xtkt_379',
            'font-weight-bold': 'awsui_font-weight-bold_18wu0_1xtkt_382',
            'font-weight-heavy': 'awsui_font-weight-heavy_18wu0_1xtkt_385',
            't-left': 'awsui_t-left_18wu0_1xtkt_389',
            't-right': 'awsui_t-right_18wu0_1xtkt_393',
            't-center': 'awsui_t-center_18wu0_1xtkt_397',
            'p-n': 'awsui_p-n_18wu0_1xtkt_498',
            'p-top-n': 'awsui_p-top-n_18wu0_1xtkt_502',
            'p-vertical-n': 'awsui_p-vertical-n_18wu0_1xtkt_503',
            'p-right-n': 'awsui_p-right-n_18wu0_1xtkt_507',
            'p-horizontal-n': 'awsui_p-horizontal-n_18wu0_1xtkt_508',
            'p-bottom-n': 'awsui_p-bottom-n_18wu0_1xtkt_512',
            'p-left-n': 'awsui_p-left-n_18wu0_1xtkt_517',
            'p-xxxs': 'awsui_p-xxxs_18wu0_1xtkt_522',
            'p-top-xxxs': 'awsui_p-top-xxxs_18wu0_1xtkt_526',
            'p-vertical-xxxs': 'awsui_p-vertical-xxxs_18wu0_1xtkt_527',
            'p-right-xxxs': 'awsui_p-right-xxxs_18wu0_1xtkt_531',
            'p-horizontal-xxxs': 'awsui_p-horizontal-xxxs_18wu0_1xtkt_532',
            'p-bottom-xxxs': 'awsui_p-bottom-xxxs_18wu0_1xtkt_536',
            'p-left-xxxs': 'awsui_p-left-xxxs_18wu0_1xtkt_541',
            'p-xxs': 'awsui_p-xxs_18wu0_1xtkt_546',
            'p-top-xxs': 'awsui_p-top-xxs_18wu0_1xtkt_550',
            'p-vertical-xxs': 'awsui_p-vertical-xxs_18wu0_1xtkt_551',
            'p-right-xxs': 'awsui_p-right-xxs_18wu0_1xtkt_555',
            'p-horizontal-xxs': 'awsui_p-horizontal-xxs_18wu0_1xtkt_556',
            'p-bottom-xxs': 'awsui_p-bottom-xxs_18wu0_1xtkt_560',
            'p-left-xxs': 'awsui_p-left-xxs_18wu0_1xtkt_565',
            'p-xs': 'awsui_p-xs_18wu0_1xtkt_570',
            'p-top-xs': 'awsui_p-top-xs_18wu0_1xtkt_574',
            'p-vertical-xs': 'awsui_p-vertical-xs_18wu0_1xtkt_575',
            'p-right-xs': 'awsui_p-right-xs_18wu0_1xtkt_579',
            'p-horizontal-xs': 'awsui_p-horizontal-xs_18wu0_1xtkt_580',
            'p-bottom-xs': 'awsui_p-bottom-xs_18wu0_1xtkt_584',
            'p-left-xs': 'awsui_p-left-xs_18wu0_1xtkt_589',
            'p-s': 'awsui_p-s_18wu0_1xtkt_594',
            'p-top-s': 'awsui_p-top-s_18wu0_1xtkt_598',
            'p-vertical-s': 'awsui_p-vertical-s_18wu0_1xtkt_599',
            'p-right-s': 'awsui_p-right-s_18wu0_1xtkt_603',
            'p-horizontal-s': 'awsui_p-horizontal-s_18wu0_1xtkt_604',
            'p-bottom-s': 'awsui_p-bottom-s_18wu0_1xtkt_608',
            'p-left-s': 'awsui_p-left-s_18wu0_1xtkt_613',
            'p-m': 'awsui_p-m_18wu0_1xtkt_618',
            'p-top-m': 'awsui_p-top-m_18wu0_1xtkt_622',
            'p-vertical-m': 'awsui_p-vertical-m_18wu0_1xtkt_623',
            'p-right-m': 'awsui_p-right-m_18wu0_1xtkt_627',
            'p-horizontal-m': 'awsui_p-horizontal-m_18wu0_1xtkt_628',
            'p-bottom-m': 'awsui_p-bottom-m_18wu0_1xtkt_632',
            'p-left-m': 'awsui_p-left-m_18wu0_1xtkt_637',
            'p-l': 'awsui_p-l_18wu0_1xtkt_517',
            'p-top-l': 'awsui_p-top-l_18wu0_1xtkt_646',
            'p-vertical-l': 'awsui_p-vertical-l_18wu0_1xtkt_647',
            'p-right-l': 'awsui_p-right-l_18wu0_1xtkt_651',
            'p-horizontal-l': 'awsui_p-horizontal-l_18wu0_1xtkt_652',
            'p-bottom-l': 'awsui_p-bottom-l_18wu0_1xtkt_656',
            'p-left-l': 'awsui_p-left-l_18wu0_1xtkt_661',
            'p-xl': 'awsui_p-xl_18wu0_1xtkt_666',
            'p-top-xl': 'awsui_p-top-xl_18wu0_1xtkt_670',
            'p-vertical-xl': 'awsui_p-vertical-xl_18wu0_1xtkt_671',
            'p-right-xl': 'awsui_p-right-xl_18wu0_1xtkt_675',
            'p-horizontal-xl': 'awsui_p-horizontal-xl_18wu0_1xtkt_676',
            'p-bottom-xl': 'awsui_p-bottom-xl_18wu0_1xtkt_680',
            'p-left-xl': 'awsui_p-left-xl_18wu0_1xtkt_685',
            'p-xxl': 'awsui_p-xxl_18wu0_1xtkt_690',
            'p-top-xxl': 'awsui_p-top-xxl_18wu0_1xtkt_694',
            'p-vertical-xxl': 'awsui_p-vertical-xxl_18wu0_1xtkt_695',
            'p-right-xxl': 'awsui_p-right-xxl_18wu0_1xtkt_699',
            'p-horizontal-xxl': 'awsui_p-horizontal-xxl_18wu0_1xtkt_700',
            'p-bottom-xxl': 'awsui_p-bottom-xxl_18wu0_1xtkt_704',
            'p-left-xxl': 'awsui_p-left-xxl_18wu0_1xtkt_709',
            'p-xxxl': 'awsui_p-xxxl_18wu0_1xtkt_714',
            'p-top-xxxl': 'awsui_p-top-xxxl_18wu0_1xtkt_718',
            'p-vertical-xxxl': 'awsui_p-vertical-xxxl_18wu0_1xtkt_719',
            'p-right-xxxl': 'awsui_p-right-xxxl_18wu0_1xtkt_723',
            'p-horizontal-xxxl': 'awsui_p-horizontal-xxxl_18wu0_1xtkt_724',
            'p-bottom-xxxl': 'awsui_p-bottom-xxxl_18wu0_1xtkt_728',
            'p-left-xxxl': 'awsui_p-left-xxxl_18wu0_1xtkt_733',
            'm-n': 'awsui_m-n_18wu0_1xtkt_738',
            'm-top-n': 'awsui_m-top-n_18wu0_1xtkt_742',
            'm-vertical-n': 'awsui_m-vertical-n_18wu0_1xtkt_743',
            'm-right-n': 'awsui_m-right-n_18wu0_1xtkt_747',
            'm-horizontal-n': 'awsui_m-horizontal-n_18wu0_1xtkt_748',
            'm-bottom-n': 'awsui_m-bottom-n_18wu0_1xtkt_752',
            'm-left-n': 'awsui_m-left-n_18wu0_1xtkt_757',
            'm-xxxs': 'awsui_m-xxxs_18wu0_1xtkt_762',
            'm-top-xxxs': 'awsui_m-top-xxxs_18wu0_1xtkt_766',
            'm-vertical-xxxs': 'awsui_m-vertical-xxxs_18wu0_1xtkt_767',
            'm-right-xxxs': 'awsui_m-right-xxxs_18wu0_1xtkt_771',
            'm-horizontal-xxxs': 'awsui_m-horizontal-xxxs_18wu0_1xtkt_772',
            'm-bottom-xxxs': 'awsui_m-bottom-xxxs_18wu0_1xtkt_776',
            'm-left-xxxs': 'awsui_m-left-xxxs_18wu0_1xtkt_781',
            'm-xxs': 'awsui_m-xxs_18wu0_1xtkt_786',
            'm-top-xxs': 'awsui_m-top-xxs_18wu0_1xtkt_790',
            'm-vertical-xxs': 'awsui_m-vertical-xxs_18wu0_1xtkt_791',
            'm-right-xxs': 'awsui_m-right-xxs_18wu0_1xtkt_795',
            'm-horizontal-xxs': 'awsui_m-horizontal-xxs_18wu0_1xtkt_796',
            'm-bottom-xxs': 'awsui_m-bottom-xxs_18wu0_1xtkt_800',
            'm-left-xxs': 'awsui_m-left-xxs_18wu0_1xtkt_805',
            'm-xs': 'awsui_m-xs_18wu0_1xtkt_810',
            'm-top-xs': 'awsui_m-top-xs_18wu0_1xtkt_814',
            'm-vertical-xs': 'awsui_m-vertical-xs_18wu0_1xtkt_815',
            'm-right-xs': 'awsui_m-right-xs_18wu0_1xtkt_819',
            'm-horizontal-xs': 'awsui_m-horizontal-xs_18wu0_1xtkt_820',
            'm-bottom-xs': 'awsui_m-bottom-xs_18wu0_1xtkt_824',
            'm-left-xs': 'awsui_m-left-xs_18wu0_1xtkt_829',
            'm-s': 'awsui_m-s_18wu0_1xtkt_834',
            'm-top-s': 'awsui_m-top-s_18wu0_1xtkt_838',
            'm-vertical-s': 'awsui_m-vertical-s_18wu0_1xtkt_839',
            'm-right-s': 'awsui_m-right-s_18wu0_1xtkt_843',
            'm-horizontal-s': 'awsui_m-horizontal-s_18wu0_1xtkt_844',
            'm-bottom-s': 'awsui_m-bottom-s_18wu0_1xtkt_848',
            'm-left-s': 'awsui_m-left-s_18wu0_1xtkt_853',
            'm-m': 'awsui_m-m_18wu0_1xtkt_858',
            'm-top-m': 'awsui_m-top-m_18wu0_1xtkt_862',
            'm-vertical-m': 'awsui_m-vertical-m_18wu0_1xtkt_863',
            'm-right-m': 'awsui_m-right-m_18wu0_1xtkt_867',
            'm-horizontal-m': 'awsui_m-horizontal-m_18wu0_1xtkt_868',
            'm-bottom-m': 'awsui_m-bottom-m_18wu0_1xtkt_872',
            'm-left-m': 'awsui_m-left-m_18wu0_1xtkt_877',
            'm-l': 'awsui_m-l_18wu0_1xtkt_757',
            'm-top-l': 'awsui_m-top-l_18wu0_1xtkt_886',
            'm-vertical-l': 'awsui_m-vertical-l_18wu0_1xtkt_887',
            'm-right-l': 'awsui_m-right-l_18wu0_1xtkt_891',
            'm-horizontal-l': 'awsui_m-horizontal-l_18wu0_1xtkt_892',
            'm-bottom-l': 'awsui_m-bottom-l_18wu0_1xtkt_896',
            'm-left-l': 'awsui_m-left-l_18wu0_1xtkt_901',
            'm-xl': 'awsui_m-xl_18wu0_1xtkt_906',
            'm-top-xl': 'awsui_m-top-xl_18wu0_1xtkt_910',
            'm-vertical-xl': 'awsui_m-vertical-xl_18wu0_1xtkt_911',
            'm-right-xl': 'awsui_m-right-xl_18wu0_1xtkt_915',
            'm-horizontal-xl': 'awsui_m-horizontal-xl_18wu0_1xtkt_916',
            'm-bottom-xl': 'awsui_m-bottom-xl_18wu0_1xtkt_920',
            'm-left-xl': 'awsui_m-left-xl_18wu0_1xtkt_925',
            'm-xxl': 'awsui_m-xxl_18wu0_1xtkt_930',
            'm-top-xxl': 'awsui_m-top-xxl_18wu0_1xtkt_934',
            'm-vertical-xxl': 'awsui_m-vertical-xxl_18wu0_1xtkt_935',
            'm-right-xxl': 'awsui_m-right-xxl_18wu0_1xtkt_939',
            'm-horizontal-xxl': 'awsui_m-horizontal-xxl_18wu0_1xtkt_940',
            'm-bottom-xxl': 'awsui_m-bottom-xxl_18wu0_1xtkt_944',
            'm-left-xxl': 'awsui_m-left-xxl_18wu0_1xtkt_949',
            'm-xxxl': 'awsui_m-xxxl_18wu0_1xtkt_954',
            'm-top-xxxl': 'awsui_m-top-xxxl_18wu0_1xtkt_958',
            'm-vertical-xxxl': 'awsui_m-vertical-xxxl_18wu0_1xtkt_959',
            'm-right-xxxl': 'awsui_m-right-xxxl_18wu0_1xtkt_963',
            'm-horizontal-xxxl': 'awsui_m-horizontal-xxxl_18wu0_1xtkt_964',
            'm-bottom-xxxl': 'awsui_m-bottom-xxxl_18wu0_1xtkt_968',
            'm-left-xxxl': 'awsui_m-left-xxxl_18wu0_1xtkt_973',
            'd-block': 'awsui_d-block_18wu0_1xtkt_978',
            'd-inline': 'awsui_d-inline_18wu0_1xtkt_981',
            'd-inline-block': 'awsui_d-inline-block_18wu0_1xtkt_984',
            'd-none': 'awsui_d-none_18wu0_1xtkt_987',
            'f-left': 'awsui_f-left_18wu0_1xtkt_991',
            'f-right': 'awsui_f-right_18wu0_1xtkt_995'
          });
      function l(e) {
        var t = e.variant,
          n = void 0 === t ? 'div' : t,
          l = e.tagOverride,
          f = e.margin,
          d = void 0 === f ? {} : f,
          h = e.padding,
          p = void 0 === h ? {} : h,
          v = e.display,
          _ = e.textAlign,
          m = e.float,
          g = e.fontSize,
          w = e.fontWeight,
          y = e.color,
          b = e.children,
          x = e.__internalRootRef,
          E = void 0 === x ? null : x,
          k = (0, i._T)(e, [
            'variant',
            'tagOverride',
            'margin',
            'padding',
            'display',
            'textAlign',
            'float',
            'fontSize',
            'fontWeight',
            'color',
            'children',
            '__internalRootRef'
          ]),
          C = (0, o.j)(k),
          S = u(d),
          N = u(p),
          j = c(n, l),
          z = (0, a.Z)(
            C.className,
            s.root,
            s.box,
            s[''.concat(n.replace(/^awsui-/, ''), '-variant')],
            S.map(function (e) {
              return s['m-'.concat(e)];
            }),
            N.map(function (e) {
              return s['p-'.concat(e)];
            }),
            s['d-'.concat(v)],
            s['f-'.concat(m)],
            s['color-'.concat(y || 'default')],
            s['font-size-'.concat(g || 'default')],
            s['font-weight-'.concat(w || 'default')],
            s['t-'.concat(_)]
          );
        return r.createElement(j, (0, i.pi)({}, C, { className: z, ref: E }), b);
      }
      var u = function (e) {
          if ('string' === typeof e) return [e];
          return ['top', 'right', 'bottom', 'left', 'horizontal', 'vertical']
            .filter(function (t) {
              return !!e[t];
            })
            .map(function (t) {
              return ''.concat(t, '-').concat(e[t]);
            });
        },
        c = function (e, t) {
          return t || ('awsui-value-large' === e ? 'span' : 'awsui-key-label' === e ? 'div' : e);
        };
    },
    9720: function (e, t, n) {
      'use strict';
      var i = n(4997),
        r = n(1738),
        o = n(286),
        a = n(7472),
        s = n(6430),
        l = n(822),
        u = r.forwardRef(function (e, t) {
          var n = e.children,
            s = e.iconName,
            u = e.iconAlign,
            c = void 0 === u ? 'left' : u,
            f = e.iconUrl,
            d = e.iconSvg,
            h = e.iconAlt,
            p = e.variant,
            v = void 0 === p ? 'normal' : p,
            _ = e.loading,
            m = void 0 !== _ && _,
            g = e.disabled,
            w = void 0 !== g && g,
            y = e.wrapText,
            b = void 0 === y || y,
            x = e.href,
            E = e.target,
            k = e.download,
            C = e.formAction,
            S = void 0 === C ? 'submit' : C,
            N = e.ariaLabel,
            j = e.onClick,
            z = e.onFollow,
            O = e.ariaExpanded,
            T = (0, i._T)(e, [
              'children',
              'iconName',
              'iconAlign',
              'iconUrl',
              'iconSvg',
              'iconAlt',
              'variant',
              'loading',
              'disabled',
              'wrapText',
              'href',
              'target',
              'download',
              'formAction',
              'ariaLabel',
              'onClick',
              'onFollow',
              'ariaExpanded'
            ]),
            R = (0, l.Z)('Button'),
            B = (0, o.j)(T);
          return r.createElement(
            a.l,
            (0, i.pi)({}, B, R, {
              ref: t,
              iconName: s,
              iconAlign: c,
              iconUrl: f,
              iconSvg: d,
              iconAlt: h,
              variant: v,
              loading: m,
              disabled: w,
              wrapText: b,
              href: x,
              target: E,
              download: k,
              formAction: S,
              ariaLabel: N,
              onClick: j,
              onFollow: z,
              ariaExpanded: O
            }),
            n
          );
        });
      (0, s.b)(u, 'Button'), (t.Z = u);
    },
    7472: function (e, t, n) {
      'use strict';
      n.d(t, {
        l: function () {
          return g;
        },
        Z: function () {
          return w;
        }
      });
      var i = n(4997),
        r = n(7069),
        o = n(1738),
        a = n(7579),
        s = n(3090),
        l = n(7740),
        u =
          (n(9748),
          {
            content: 'awsui_content_vjswe_kyvev_97',
            button: 'awsui_button_vjswe_kyvev_101',
            'variant-normal': 'awsui_variant-normal_vjswe_kyvev_122',
            'is-activated': 'awsui_is-activated_vjswe_kyvev_135',
            'variant-icon': 'awsui_variant-icon_vjswe_kyvev_162',
            'variant-modal-dismiss': 'awsui_variant-modal-dismiss_vjswe_kyvev_162',
            'variant-flashbar-icon': 'awsui_variant-flashbar-icon_vjswe_kyvev_162',
            'variant-inline-icon': 'awsui_variant-inline-icon_vjswe_kyvev_180',
            disabled: 'awsui_disabled_vjswe_kyvev_198',
            'variant-primary': 'awsui_variant-primary_vjswe_kyvev_206',
            'variant-link': 'awsui_variant-link_vjswe_kyvev_290',
            'variant-breadcrumb-group': 'awsui_variant-breadcrumb-group_vjswe_kyvev_710',
            'variant-menu-trigger': 'awsui_variant-menu-trigger_vjswe_kyvev_797',
            'button-no-text': 'awsui_button-no-text_vjswe_kyvev_881',
            'button-no-wrap': 'awsui_button-no-wrap_vjswe_kyvev_885',
            'icon-left': 'awsui_icon-left_vjswe_kyvev_901',
            'icon-right': 'awsui_icon-right_vjswe_kyvev_906',
            icon: 'awsui_icon_vjswe_kyvev_901'
          }),
        c = n(789),
        f = n(745);
      function d(e) {
        return 'icon' === e.variant || 'inline-icon' === e.variant ? 'left' : e.iconAlign;
      }
      function h(e) {
        var t = e.iconName,
          n = e.iconUrl,
          a = e.iconAlt,
          s = e.iconSvg,
          l = e.iconSize,
          f = (0, i._T)(e, ['iconName', 'iconUrl', 'iconAlt', 'iconSvg', 'iconSize']);
        return t || n || s
          ? o.createElement(c.Z, {
              className: (0, r.Z)(u.icon, u['icon-'.concat(d(f))], f.iconClass),
              name: t,
              url: n,
              svg: s,
              alt: a,
              size: l
            })
          : null;
      }
      function p(e) {
        return e.loading
          ? o.createElement(f.Z, { className: (0, r.Z)(u.icon, u['icon-left']) })
          : 'left' === d(e)
          ? o.createElement(h, (0, i.pi)({}, e))
          : null;
      }
      function v(e) {
        return 'right' === d(e) ? o.createElement(h, (0, i.pi)({}, e)) : null;
      }
      var _ = n(9810),
        m = n(2384),
        g = o.forwardRef(function (e, t) {
          var n,
            c = e.children,
            f = e.iconName,
            d = e.__iconClass,
            h = e.onClick,
            g = e.onFollow,
            w = e.iconAlign,
            y = void 0 === w ? 'left' : w,
            b = e.iconUrl,
            x = e.iconSvg,
            E = e.iconAlt,
            k = e.variant,
            C = void 0 === k ? 'normal' : k,
            S = e.loading,
            N = void 0 !== S && S,
            j = e.disabled,
            z = void 0 !== j && j,
            O = e.wrapText,
            T = void 0 === O || O,
            R = e.href,
            B = e.target,
            A = e.download,
            L = e.formAction,
            P = void 0 === L ? 'submit' : L,
            Z = e.ariaLabel,
            M = e.ariaExpanded,
            I = e.__nativeAttributes,
            H = e.__internalRootRef,
            D = void 0 === H ? null : H,
            U = e.__activated,
            q = void 0 !== U && U,
            F = (0, i._T)(e, [
              'children',
              'iconName',
              '__iconClass',
              'onClick',
              'onFollow',
              'iconAlign',
              'iconUrl',
              'iconSvg',
              'iconAlt',
              'variant',
              'loading',
              'disabled',
              'wrapText',
              'href',
              'target',
              'download',
              'formAction',
              'ariaLabel',
              'ariaExpanded',
              '__nativeAttributes',
              '__internalRootRef',
              '__activated'
            ]);
          (0, _.J)('Button', R);
          var W = (0, s.Z)(),
            V = Boolean(R),
            G = N || z,
            K = c && -1 === ['icon', 'inline-icon', 'flashbar-icon', 'modal-dismiss'].indexOf(C),
            X = (0, o.useRef)(null);
          (0, l.Z)(t, X);
          var $ = (0, o.useCallback)(
              function (e) {
                if (V && G) return e.preventDefault();
                V && (0, a.p_)(e) && (0, a.y1)(g, null, e);
                var t = e.altKey,
                  n = e.button,
                  i = e.ctrlKey,
                  r = e.metaKey,
                  o = e.shiftKey;
                (0, a.y1)(h, { altKey: t, button: n, ctrlKey: i, metaKey: r, shiftKey: o }, e);
              },
              [V, G, h, g]
            ),
            J = (0, r.Z)(
              F.className,
              u.button,
              u['variant-'.concat(C)],
              (((n = {})[u.disabled] = G),
              (n[u['button-no-wrap']] = !T),
              (n[u['button-no-text']] = !K),
              (n[u['is-activated']] = q),
              n)
            ),
            Y = (0, i.pi)((0, i.pi)((0, i.pi)((0, i.pi)({}, F), W), I), {
              ref: (0, m.q)(X, D),
              'aria-label': Z,
              'aria-expanded': M,
              className: J,
              onClick: $
            }),
            Q = {
              loading: N,
              iconName: f,
              iconAlign: y,
              iconUrl: b,
              iconSvg: x,
              iconAlt: E,
              variant: C,
              iconClass: d,
              iconSize: 'modal-dismiss' === C ? 'medium' : 'normal'
            },
            ee = o.createElement(
              o.Fragment,
              null,
              o.createElement(p, (0, i.pi)({}, Q)),
              K && o.createElement('span', { className: u.content }, c),
              o.createElement(v, (0, i.pi)({}, Q))
            );
          return V
            ? o.createElement(
                'a',
                (0, i.pi)({}, Y, {
                  href: R,
                  target: B,
                  rel: '_blank' === B ? 'noopener noreferrer' : void 0,
                  tabIndex: G ? -1 : void 0,
                  'aria-disabled': !!G || void 0,
                  download: A
                }),
                ee
              )
            : o.createElement(
                'button',
                (0, i.pi)({}, Y, { type: 'none' === P ? 'button' : 'submit', disabled: G }),
                ee
              );
        }),
        w = g;
    },
    3965: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return h;
        }
      });
      var i = n(4997),
        r = n(7069),
        o = n(1738),
        a = n(1170),
        s = n(6918);
      var l = n(286),
        u = n(2019),
        c = n(2384),
        f = n(2319),
        d =
          (n(2589),
          {
            root: 'awsui_root_14iqq_v306r_97',
            'variant-default': 'awsui_variant-default_14iqq_v306r_109',
            'variant-stacked': 'awsui_variant-stacked_14iqq_v306r_109',
            header: 'awsui_header_14iqq_v306r_132',
            'header-sticky-disabled': 'awsui_header-sticky-disabled_14iqq_v306r_136',
            'header-sticky-enabled': 'awsui_header-sticky-enabled_14iqq_v306r_140',
            'header-stuck': 'awsui_header-stuck_14iqq_v306r_146',
            'header-dynamic-height': 'awsui_header-dynamic-height_14iqq_v306r_151',
            'with-paddings': 'awsui_with-paddings_14iqq_v306r_157',
            'header-variant-cards': 'awsui_header-variant-cards_14iqq_v306r_160',
            'header-variant-full-page': 'awsui_header-variant-full-page_14iqq_v306r_184',
            'dark-header': 'awsui_dark-header_14iqq_v306r_192',
            content: 'awsui_content_14iqq_v306r_196',
            footer: 'awsui_footer_14iqq_v306r_203',
            'with-divider': 'awsui_with-divider_14iqq_v306r_206'
          });
      function h(e) {
        var t,
          n,
          h,
          p = e.header,
          v = e.footer,
          _ = e.children,
          m = e.variant,
          g = void 0 === m ? 'default' : m,
          w = e.disableHeaderPaddings,
          y = void 0 !== w && w,
          b = e.disableContentPaddings,
          x = void 0 !== b && b,
          E = e.__stickyOffset,
          k = e.__stickyHeader,
          C = void 0 !== k && k,
          S = e.__internalRootRef,
          N = void 0 === S ? null : S,
          j = e.__disableFooterDivider,
          z = void 0 !== j && j,
          O = e.__disableFooterPaddings,
          T = void 0 !== O && O,
          R = e.__headerRef,
          B = (0, i._T)(e, [
            'header',
            'footer',
            'children',
            'variant',
            'disableHeaderPaddings',
            'disableContentPaddings',
            '__stickyOffset',
            '__stickyHeader',
            '__internalRootRef',
            '__disableFooterDivider',
            '__disableFooterPaddings',
            '__headerRef'
          ]),
          A = (0, l.j)(B),
          L = (0, o.useRef)(null),
          P = (0, o.useRef)(null),
          Z = (0, u._T)(L, P, C, E),
          M = Z.isSticky,
          I = Z.isStuck,
          H = Z.stickyStyles,
          D = (0, f.LV)(L) && 'full-page' === g,
          U = (function (e) {
            var t,
              n = null !== (t = null === e || void 0 === e ? void 0 : e.disabled) && void 0 !== t && t,
              i = (0, o.useContext)(a.T).setDynamicOverlapHeight,
              r = (0, s.D)(function (e) {
                return e.height;
              }),
              l = r[0],
              u = r[1];
            return (
              (0, o.useLayoutEffect)(
                function () {
                  return (
                    n || i(null !== l && void 0 !== l ? l : 0),
                    function () {
                      n || i(0);
                    }
                  );
                },
                [n, l, i]
              ),
              u
            );
          })({ disabled: !D }),
          q = (0, c.q)(L, N),
          F = (0, c.q)(P, U, R);
        return o.createElement(
          'div',
          (0, i.pi)({}, A, { className: (0, r.Z)(A.className, d.root, d['variant-'.concat(g)]), ref: q }),
          p &&
            o.createElement(
              u.d5.Provider,
              { value: { isStuck: I } },
              o.createElement(
                'div',
                (0, i.pi)(
                  {
                    className: (0, r.Z)(
                      d.header,
                      d['header-variant-'.concat(g)],
                      ((t = {}),
                      (t[d['header-sticky-disabled']] = C && !M),
                      (t[d['header-sticky-enabled']] = M),
                      (t[d['header-dynamic-height']] = D),
                      (t[d['header-stuck']] = I),
                      (t[d['with-paddings']] = !y),
                      t)
                    )
                  },
                  H,
                  { ref: F }
                ),
                D
                  ? o.createElement(
                      'div',
                      { className: (0, r.Z)(d['dark-header'], 'awsui-context-content-header') },
                      p
                    )
                  : p
              )
            ),
          o.createElement(
            'div',
            { className: (0, r.Z)(d.content, ((n = {}), (n[d['with-paddings']] = !x), n)) },
            _
          ),
          v &&
            o.createElement(
              'div',
              {
                className: (0, r.Z)(
                  d.footer,
                  ((h = {}), (h[d['with-divider']] = !z), (h[d['with-paddings']] = !T), h)
                )
              },
              v
            )
        );
      }
    },
    2019: function (e, t, n) {
      'use strict';
      n.d(t, {
        AI: function () {
          return d;
        },
        _T: function () {
          return f;
        },
        d5: function () {
          return c;
        }
      });
      var i = n(1738),
        r = n(9227),
        o = n(6208),
        a = n(1265),
        s = n(2555),
        l = n(2319),
        u = n(9095),
        c = (0, i.createContext)({ isStuck: !1 }),
        f = function (e, t, n, o) {
          var c = e.current,
            f = t.current,
            h = (0, i.useMemo)(
              function () {
                return (
                  (c ? parseInt(getComputedStyle(c).getPropertyValue('border-top-width'), 10) : 0) +
                  (f ? parseInt(getComputedStyle(f).getPropertyValue('border-top-width'), 10) : 0)
                );
              },
              [c, f]
            ),
            p = (0, r.b)().stickyOffsetTop,
            v = d() && !!n,
            _ = (0, l.LV)(e),
            m = (0, i.useState)(!1),
            g = m[0],
            w = m[1],
            y = (0, i.useState)(!1),
            b = y[0],
            x = y[1];
          (0, i.useLayoutEffect)(
            function () {
              if (e.current) {
                var t = (0, s.Et)(e.current),
                  n = (0, a.jX)(e.current, function (e) {
                    return 'MAIN' === e.tagName;
                  });
                w(t.length > 0 && t[0] !== n);
              }
            },
            [e]
          );
          var E = ''.concat((null !== o && void 0 !== o ? o : g ? 0 : p) - h, 'px');
          _ && !g && (E = 'var('.concat(u.Z.offsetTopWithNotifications, ', ').concat(E, ')'));
          var k = v ? { style: { top: E } } : {},
            C = (0, i.useCallback)(
              function () {
                if (e.current && t.current) {
                  var n = e.current.getBoundingClientRect().top,
                    i = t.current.getBoundingClientRect().top;
                  x(n + h < i);
                }
              },
              [e, t, h]
            );
          return (
            (0, i.useEffect)(
              function () {
                if (v)
                  return (
                    window.addEventListener('scroll', C, !0),
                    window.addEventListener('resize', C),
                    function () {
                      window.removeEventListener('scroll', C, !0), window.removeEventListener('resize', C);
                    }
                  );
              },
              [v, C]
            ),
            { isSticky: v, isStuck: b, stickyStyles: k }
          );
        };
      function d() {
        var e = (0, o.X)();
        return (0, a.eN)() && !e;
      }
    },
    8014: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return C;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(3638),
        a = n(3891),
        s = n(162);
      function l(e, t) {
        return e
          .replace(new RegExp('(^|\\s)' + t + '(?:\\s|$)', 'g'), '$1')
          .replace(/\s+/g, ' ')
          .replace(/^\s*|\s*$/g, '');
      }
      var u = n(9043),
        c = function (e, t) {
          return (
            e &&
            t &&
            t.split(' ').forEach(function (t) {
              return (
                (i = t),
                void ((n = e).classList
                  ? n.classList.remove(i)
                  : 'string' === typeof n.className
                  ? (n.className = l(n.className, i))
                  : n.setAttribute('class', l((n.className && n.className.baseVal) || '', i)))
              );
              var n, i;
            })
          );
        },
        f = (function (e) {
          function t() {
            for (var t, n = arguments.length, i = new Array(n), r = 0; r < n; r++) i[r] = arguments[r];
            return (
              ((t = e.call.apply(e, [this].concat(i)) || this).appliedClasses = {
                appear: {},
                enter: {},
                exit: {}
              }),
              (t.onEnter = function (e, n) {
                var i = t.resolveArguments(e, n),
                  r = i[0],
                  o = i[1];
                t.removeClasses(r, 'exit'),
                  t.addClass(r, o ? 'appear' : 'enter', 'base'),
                  t.props.onEnter && t.props.onEnter(e, n);
              }),
              (t.onEntering = function (e, n) {
                var i = t.resolveArguments(e, n),
                  r = i[0],
                  o = i[1] ? 'appear' : 'enter';
                t.addClass(r, o, 'active'), t.props.onEntering && t.props.onEntering(e, n);
              }),
              (t.onEntered = function (e, n) {
                var i = t.resolveArguments(e, n),
                  r = i[0],
                  o = i[1] ? 'appear' : 'enter';
                t.removeClasses(r, o), t.addClass(r, o, 'done'), t.props.onEntered && t.props.onEntered(e, n);
              }),
              (t.onExit = function (e) {
                var n = t.resolveArguments(e)[0];
                t.removeClasses(n, 'appear'),
                  t.removeClasses(n, 'enter'),
                  t.addClass(n, 'exit', 'base'),
                  t.props.onExit && t.props.onExit(e);
              }),
              (t.onExiting = function (e) {
                var n = t.resolveArguments(e)[0];
                t.addClass(n, 'exit', 'active'), t.props.onExiting && t.props.onExiting(e);
              }),
              (t.onExited = function (e) {
                var n = t.resolveArguments(e)[0];
                t.removeClasses(n, 'exit'),
                  t.addClass(n, 'exit', 'done'),
                  t.props.onExited && t.props.onExited(e);
              }),
              (t.resolveArguments = function (e, n) {
                return t.props.nodeRef ? [t.props.nodeRef.current, e] : [e, n];
              }),
              (t.getClassNames = function (e) {
                var n = t.props.classNames,
                  i = 'string' === typeof n,
                  r = i ? '' + (i && n ? n + '-' : '') + e : n[e];
                return {
                  baseClassName: r,
                  activeClassName: i ? r + '-active' : n[e + 'Active'],
                  doneClassName: i ? r + '-done' : n[e + 'Done']
                };
              }),
              t
            );
          }
          (0, s.Z)(t, e);
          var n = t.prototype;
          return (
            (n.addClass = function (e, t, n) {
              var i = this.getClassNames(t)[n + 'ClassName'],
                r = this.getClassNames('enter').doneClassName;
              'appear' === t && 'done' === n && r && (i += ' ' + r),
                'active' === n && e && e.scrollTop,
                i &&
                  ((this.appliedClasses[t][n] = i),
                  (function (e, t) {
                    e &&
                      t &&
                      t.split(' ').forEach(function (t) {
                        return (
                          (i = t),
                          void ((n = e).classList
                            ? n.classList.add(i)
                            : (function (e, t) {
                                return e.classList
                                  ? !!t && e.classList.contains(t)
                                  : -1 !==
                                      (' ' + (e.className.baseVal || e.className) + ' ').indexOf(
                                        ' ' + t + ' '
                                      );
                              })(n, i) ||
                              ('string' === typeof n.className
                                ? (n.className = n.className + ' ' + i)
                                : n.setAttribute(
                                    'class',
                                    ((n.className && n.className.baseVal) || '') + ' ' + i
                                  )))
                        );
                        var n, i;
                      });
                  })(e, i));
            }),
            (n.removeClasses = function (e, t) {
              var n = this.appliedClasses[t],
                i = n.base,
                r = n.active,
                o = n.done;
              (this.appliedClasses[t] = {}), i && c(e, i), r && c(e, r), o && c(e, o);
            }),
            (n.render = function () {
              var e = this.props,
                t = (e.classNames, (0, a.Z)(e, ['classNames']));
              return r.createElement(
                u.ZP,
                (0, o.Z)({}, t, {
                  onEnter: this.onEnter,
                  onEntered: this.onEntered,
                  onEntering: this.onEntering,
                  onExit: this.onExit,
                  onExiting: this.onExiting,
                  onExited: this.onExited
                })
              );
            }),
            t
          );
        })(r.Component);
      (f.defaultProps = { classNames: '' }), (f.propTypes = {});
      var d = f,
        h = n(7069),
        p = n(286),
        v = n(6066),
        _ = n(3366),
        m = n(7906),
        g = n(7579),
        w =
          (n(5495),
          {
            'content-enter': 'awsui_content-enter_gwq0h_1k4hj_97',
            'awsui-motion-fade-in': 'awsui_awsui-motion-fade-in_gwq0h_1k4hj_1',
            'trigger-expanded': 'awsui_trigger-expanded_gwq0h_1k4hj_119',
            icon: 'awsui_icon_gwq0h_1k4hj_133',
            root: 'awsui_root_gwq0h_1k4hj_151',
            expanded: 'awsui_expanded_gwq0h_1k4hj_169',
            'icon-container': 'awsui_icon-container_gwq0h_1k4hj_173',
            trigger: 'awsui_trigger_gwq0h_1k4hj_119',
            'trigger-default': 'awsui_trigger-default_gwq0h_1k4hj_188',
            'trigger-footer': 'awsui_trigger-footer_gwq0h_1k4hj_191',
            'trigger-navigation': 'awsui_trigger-navigation_gwq0h_1k4hj_197',
            'trigger-container': 'awsui_trigger-container_gwq0h_1k4hj_209',
            header: 'awsui_header_gwq0h_1k4hj_219',
            'header-container': 'awsui_header-container_gwq0h_1k4hj_222',
            'header-navigation': 'awsui_header-navigation_gwq0h_1k4hj_229',
            content: 'awsui_content_gwq0h_1k4hj_97',
            'content-default': 'awsui_content-default_gwq0h_1k4hj_265',
            'content-footer': 'awsui_content-footer_gwq0h_1k4hj_268',
            'content-expanded': 'awsui_content-expanded_gwq0h_1k4hj_271',
            focusable: 'awsui_focusable_gwq0h_1k4hj_275'
          }),
        y = n(3965),
        b = function (e) {
          var t = e.className,
            n = e.children,
            o = e.header,
            a = e.variant,
            s = e.expanded,
            l = e.disableContentPaddings,
            u = e.__internalRootRef,
            c = (0, i._T)(e, [
              'className',
              'children',
              'header',
              'variant',
              'expanded',
              'disableContentPaddings',
              '__internalRootRef'
            ]);
          return 'container' === a
            ? r.createElement(
                y.Z,
                (0, i.pi)({}, c, {
                  className: t,
                  header: o,
                  variant: 'default',
                  disableContentPaddings: l || !s,
                  disableHeaderPaddings: !0,
                  __internalRootRef: u
                }),
                n
              )
            : r.createElement('div', (0, i.pi)({ className: t }, c, { ref: u }), o, n);
        },
        x = n(3090),
        E = n(789),
        k = function (e) {
          var t = e.id,
            n = e.className,
            o = e.variant,
            a = e.children,
            s = e.expanded,
            l = e.ariaControls,
            u = e.ariaLabelledBy,
            c = e.onKeyUp,
            f = e.onKeyDown,
            d = e.onClick,
            p = (0, x.Z)(),
            v = r.createElement(E.Z, {
              size: 'container' === o ? 'medium' : 'normal',
              className: (0, h.Z)(w.icon, s && w.expanded),
              name: 'caret-down-filled'
            }),
            _ = { 'aria-controls': l, 'aria-expanded': s },
            m = (0, h.Z)(w.trigger, w['trigger-'.concat(o)], s && w['trigger-expanded']);
          return 'navigation' === o
            ? r.createElement(
                'div',
                { id: t, className: (0, h.Z)(n, m), onClick: d },
                r.createElement(
                  'button',
                  (0, i.pi)({ className: w['icon-container'], type: 'button', 'aria-labelledby': u }, p, _),
                  v
                ),
                a
              )
            : r.createElement(
                'div',
                (0, i.pi)(
                  {
                    id: t,
                    role: 'button',
                    className: (0, h.Z)(n, m, w.focusable, s && w.expanded),
                    tabIndex: 0,
                    onKeyUp: c,
                    onKeyDown: f,
                    onClick: d
                  },
                  p,
                  _
                ),
                r.createElement('div', { className: w['icon-container'] }, v),
                a
              );
        };
      function C(e) {
        var t = e.expanded,
          n = e.defaultExpanded,
          o = e.onChange,
          a = e.variant,
          s = void 0 === a ? 'default' : a,
          l = e.children,
          u = e.header,
          c = e.disableContentPaddings,
          f = e.__internalRootRef,
          y = (0, i._T)(e, [
            'expanded',
            'defaultExpanded',
            'onChange',
            'variant',
            'children',
            'header',
            'disableContentPaddings',
            '__internalRootRef'
          ]),
          x = (0, r.useRef)(null),
          E = (0, _.L)(),
          C = ''.concat(E, '-trigger'),
          S = (0, p.j)(y),
          N = (0, v.q)(t, o, n, {
            componentName: 'ExpandableSection',
            controlledProp: 'expanded',
            changeHandler: 'onChange'
          }),
          j = N[0],
          z = N[1],
          O = (0, r.useCallback)(
            function (e) {
              z(e), (0, g.B4)(o, { expanded: e });
            },
            [o, z]
          ),
          T = (0, r.useCallback)(
            function () {
              O(!j);
            },
            [O, j]
          ),
          R = {
            ariaControls: E,
            ariaLabelledBy: C,
            onKeyUp: (0, r.useCallback)(
              function (e) {
                -1 !== [m.V.enter, m.V.space].indexOf(e.keyCode) && O(!j);
              },
              [O, j]
            ),
            onKeyDown: (0, r.useCallback)(function (e) {
              e.keyCode === m.V.space && e.preventDefault();
            }, []),
            onClick: T
          };
        return r.createElement(
          b,
          (0, i.pi)({}, S, {
            expanded: j,
            className: (0, h.Z)(S.className, w.root),
            variant: s,
            disableContentPaddings: c,
            header: r.createElement(
              k,
              (0, i.pi)(
                { id: C, className: (0, h.Z)(w.header, w['header-'.concat(s)]), variant: s, expanded: !!j },
                R
              ),
              u
            ),
            __internalRootRef: f
          }),
          r.createElement(
            d,
            { in: j, timeout: 30, classNames: { enter: w['content-enter'] }, nodeRef: x },
            r.createElement(
              'div',
              {
                id: E,
                ref: x,
                className: (0, h.Z)(w.content, w['content-'.concat(s)], j && w['content-expanded']),
                role: 'group',
                'aria-labelledby': C
              },
              l
            )
          )
        );
      }
    },
    2940: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return v;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(7069),
        a = n(5926),
        s = n(286),
        l = n(7520),
        u = n(857),
        c = n(2391),
        f =
          (n(1513),
          {
            grid: 'awsui_grid_14yj0_1ecf3_93',
            'no-gutters': 'awsui_no-gutters_14yj0_1ecf3_107',
            'grid-column': 'awsui_grid-column_14yj0_1ecf3_111',
            'colspan-1': 'awsui_colspan-1_14yj0_1ecf3_120',
            'push-1': 'awsui_push-1_14yj0_1ecf3_124',
            'pull-1': 'awsui_pull-1_14yj0_1ecf3_127',
            'colspan-2': 'awsui_colspan-2_14yj0_1ecf3_130',
            'push-2': 'awsui_push-2_14yj0_1ecf3_134',
            'pull-2': 'awsui_pull-2_14yj0_1ecf3_137',
            'colspan-3': 'awsui_colspan-3_14yj0_1ecf3_140',
            'push-3': 'awsui_push-3_14yj0_1ecf3_144',
            'pull-3': 'awsui_pull-3_14yj0_1ecf3_147',
            'colspan-4': 'awsui_colspan-4_14yj0_1ecf3_150',
            'push-4': 'awsui_push-4_14yj0_1ecf3_154',
            'pull-4': 'awsui_pull-4_14yj0_1ecf3_157',
            'colspan-5': 'awsui_colspan-5_14yj0_1ecf3_160',
            'push-5': 'awsui_push-5_14yj0_1ecf3_164',
            'pull-5': 'awsui_pull-5_14yj0_1ecf3_167',
            'colspan-6': 'awsui_colspan-6_14yj0_1ecf3_170',
            'push-6': 'awsui_push-6_14yj0_1ecf3_174',
            'pull-6': 'awsui_pull-6_14yj0_1ecf3_177',
            'colspan-7': 'awsui_colspan-7_14yj0_1ecf3_180',
            'push-7': 'awsui_push-7_14yj0_1ecf3_184',
            'pull-7': 'awsui_pull-7_14yj0_1ecf3_187',
            'colspan-8': 'awsui_colspan-8_14yj0_1ecf3_190',
            'push-8': 'awsui_push-8_14yj0_1ecf3_194',
            'pull-8': 'awsui_pull-8_14yj0_1ecf3_197',
            'colspan-9': 'awsui_colspan-9_14yj0_1ecf3_200',
            'push-9': 'awsui_push-9_14yj0_1ecf3_204',
            'pull-9': 'awsui_pull-9_14yj0_1ecf3_207',
            'colspan-10': 'awsui_colspan-10_14yj0_1ecf3_210',
            'push-10': 'awsui_push-10_14yj0_1ecf3_214',
            'pull-10': 'awsui_pull-10_14yj0_1ecf3_217',
            'colspan-11': 'awsui_colspan-11_14yj0_1ecf3_220',
            'push-11': 'awsui_push-11_14yj0_1ecf3_224',
            'pull-11': 'awsui_pull-11_14yj0_1ecf3_227',
            'colspan-12': 'awsui_colspan-12_14yj0_1ecf3_230',
            'push-12': 'awsui_push-12_14yj0_1ecf3_234',
            'pull-12': 'awsui_pull-12_14yj0_1ecf3_237',
            'push-0': 'awsui_push-0_14yj0_1ecf3_240',
            'pull-0': 'awsui_pull-0_14yj0_1ecf3_243',
            'offset-1': 'awsui_offset-1_14yj0_1ecf3_246',
            'offset-2': 'awsui_offset-2_14yj0_1ecf3_249',
            'offset-3': 'awsui_offset-3_14yj0_1ecf3_252',
            'offset-4': 'awsui_offset-4_14yj0_1ecf3_255',
            'offset-5': 'awsui_offset-5_14yj0_1ecf3_258',
            'offset-6': 'awsui_offset-6_14yj0_1ecf3_261',
            'offset-7': 'awsui_offset-7_14yj0_1ecf3_264',
            'offset-8': 'awsui_offset-8_14yj0_1ecf3_267',
            'offset-9': 'awsui_offset-9_14yj0_1ecf3_270',
            'offset-10': 'awsui_offset-10_14yj0_1ecf3_273',
            'offset-11': 'awsui_offset-11_14yj0_1ecf3_276',
            'restore-pointer-events': 'awsui_restore-pointer-events_14yj0_1ecf3_280'
          }),
        d = n(6210),
        h = n(2384);
      function p(e, t, n) {
        return 'number' === typeof t
          ? f[''.concat(e, '-').concat(t)]
          : null === n || void 0 === t
          ? null
          : f[''.concat(e, '-').concat((0, l.Zz)(t, n))];
      }
      var v = r.forwardRef(function (e, t) {
        var n,
          l = e.__breakpoint,
          v = e.gridDefinition,
          _ = void 0 === v ? [] : v,
          m = e.disableGutters,
          g = void 0 !== m && m,
          w = e.children,
          y = e.__responsiveClassName,
          b = e.__internalRootRef,
          x = void 0 === b ? null : b,
          E = (0, i._T)(e, [
            '__breakpoint',
            'gridDefinition',
            'disableGutters',
            'children',
            '__responsiveClassName',
            '__internalRootRef'
          ]),
          k = (0, d.d)(void 0),
          C = k[0],
          S = k[1];
        void 0 !== l && ((C = l), (S = t));
        var N = (0, s.j)(E),
          j = (0, a.Z)(w);
        if (u.y) {
          var z = _.length,
            O = j.length;
          z !== O &&
            c.O(
              'Grid',
              'The number of children ('
                .concat(O, ') does not match the number of columns defined (')
                .concat(z, ').')
            );
        }
        var T = (0, h.q)(S, x);
        return r.createElement(
          'div',
          (0, i.pi)({}, N, {
            className: (0, o.Z)(
              f.grid,
              N.className,
              ((n = {}), (n[f['no-gutters']] = g), n),
              y ? y(C) : null
            ),
            ref: T
          }),
          j.map(function (e, t) {
            var n,
              i,
              a,
              s,
              l = e.key;
            return r.createElement(
              'div',
              {
                key: l,
                className: (0, o.Z)(
                  f['grid-column'],
                  p('colspan', null === (n = _[t]) || void 0 === n ? void 0 : n.colspan, C),
                  p('offset', null === (i = _[t]) || void 0 === i ? void 0 : i.offset, C),
                  p('pull', null === (a = _[t]) || void 0 === a ? void 0 : a.pull, C),
                  p('push', null === (s = _[t]) || void 0 === s ? void 0 : s.push, C)
                )
              },
              r.createElement('div', { className: f['restore-pointer-events'] }, e)
            );
          })
        );
      });
    },
    789: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return d;
        }
      });
      var i = n(4997),
        r = n(7069),
        o = n(1738),
        a = n(286),
        s = n(2391),
        l =
          (n(4192),
          {
            icon: 'awsui_icon_h11ix_k54ie_98',
            'icon-flex-height': 'awsui_icon-flex-height_h11ix_k54ie_104',
            'size-small': 'awsui_size-small_h11ix_k54ie_129',
            'size-small-mapped-height': 'awsui_size-small-mapped-height_h11ix_k54ie_133',
            'size-normal': 'awsui_size-normal_h11ix_k54ie_147',
            'size-normal-mapped-height': 'awsui_size-normal-mapped-height_h11ix_k54ie_151',
            'size-medium': 'awsui_size-medium_h11ix_k54ie_165',
            'size-medium-mapped-height': 'awsui_size-medium-mapped-height_h11ix_k54ie_169',
            'size-big': 'awsui_size-big_h11ix_k54ie_183',
            'size-big-mapped-height': 'awsui_size-big-mapped-height_h11ix_k54ie_187',
            'size-large': 'awsui_size-large_h11ix_k54ie_201',
            'size-large-mapped-height': 'awsui_size-large-mapped-height_h11ix_k54ie_205',
            'variant-normal': 'awsui_variant-normal_h11ix_k54ie_219',
            'variant-disabled': 'awsui_variant-disabled_h11ix_k54ie_222',
            'variant-inverted': 'awsui_variant-inverted_h11ix_k54ie_225',
            'variant-subtle': 'awsui_variant-subtle_h11ix_k54ie_228',
            'variant-warning': 'awsui_variant-warning_h11ix_k54ie_231',
            'variant-error': 'awsui_variant-error_h11ix_k54ie_234',
            'variant-success': 'awsui_variant-success_h11ix_k54ie_237',
            'variant-link': 'awsui_variant-link_h11ix_k54ie_240',
            badge: 'awsui_badge_h11ix_k54ie_244'
          }),
        u = {
          'add-plus':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M8 1v14M15 8H1"/></svg>',
          'angle-down':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="m1 4 7 7 7-7"/></svg>',
          'angle-left-double':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M14 1 7 8l7 7"/><path d="M9 1 2 8l7 7"/></svg>',
          'angle-left':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M12 1 5 8l7 7"/></svg>',
          'angle-right-double':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="m2 1 7 7-7 7"/><path d="m7 1 7 7-7 7"/></svg>',
          'angle-right':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="m4 1 7 7-7 7"/></svg>',
          'angle-up':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="m1 12 7-7 7 7"/></svg>',
          'arrow-left':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M9 1 2 8l7 7M2 8h13"/></svg>',
          bug: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M5 5h6a1 1 0 0 1 1 1v5.5A3.5 3.5 0 0 1 8.5 15h-1A3.5 3.5 0 0 1 4 11.5V6a1 1 0 0 1 1-1ZM5 5a3 3 0 0 1 6 0"/><path d="M12 9h3M1 9h3M12 12h2l1 2M4 12H2l-1 2M12 6h2l1-2M4 6H2L1 4"/></svg>',
          calendar:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M2 2h12v12H2z"/><path d="M4.99 8H5v.01h-.01zM7.99 8H8v.01h-.01zM10.99 8H11v.01h-.01zM4.99 5H5v.01h-.01zM7.99 5H8v.01h-.01zM10.99 5H11v.01h-.01zM4.99 11H5v.01h-.01zM7.99 11H8v.01h-.01z"/></svg>',
          call: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M9 2c2.8 0 5 2.2 5 5M7.9 13c1.3 1.3 3.5 1.3 4.8 0l1-1c.4-.4.4-1 0-1.4l-1.5-1.5c-.3-.3-1-.2-1.3.1l-.1.1c-.5.5-1.4.5-2 0L6.6 7.2c-.5-.5-.5-1.4 0-2l.1-.1c.3-.3.4-1 .1-1.3L5.3 2.3c-.3-.4-1-.4-1.3 0l-1 1C1.7 4.6 1.7 6.7 3 8.1L7.9 13z"/></svg>',
          'caret-down-filled':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled stroke-linejoin-round" d="M4 5h8l-4 6-4-6z"/></svg>',
          'caret-down':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M4 5h8l-4 6-4-6z"/></svg>',
          'caret-left-filled':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled stroke-linejoin-round" d="M11 4v8L5 8l6-4z"/></svg>',
          'caret-right-filled':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled stroke-linejoin-round" d="M5 4v8l6-4-6-4z"/></svg>',
          'caret-up-filled':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled stroke-linejoin-round" d="M4 11h8L8 5l-4 6z"/></svg>',
          'caret-up':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M4 11h8L8 5l-4 6z"/></svg>',
          close:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="m2 2 12 12M14 2 2 14"/></svg>',
          contact:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round stroke-linecap-round" d="M2 12.286h5.143L8.857 14l1.714-1.714H14V2H2v10.286z"/><path class="stroke-linecap-round" d="M4.99 7H5v.01h-.01zM7.99 7H8v.01h-.01zM10.99 7H11v.01h-.01z"/></svg>',
          copy: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M2 5h9v9H2z"/><path class="stroke-linejoin-round" d="M5 5V2h9v9h-3"/></svg>',
          download:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M11 2h3v12H2V2h3"/><path d="m4 6 4 4 4-4M8 1v9"/></svg>',
          edit: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M13 8v6H3V2h6.5M6 10l8-8"/></svg>',
          ellipsis:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="filled" cx="8" cy="2.5" r=".5"/><circle class="filled" cx="8" cy="8" r=".5"/><circle class="filled" cx="8" cy="13.5" r=".5"/></svg>',
          envelope:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M1 2h14v12H1z"/><path class="stroke-linejoin-round" d="m1 4 7 6 7-6"/></svg>',
          expand:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M9 2h5v5M7 2H2v5M7 14H2V9M9 14h5V9M2 2l12 12M14 2 2 14"/></svg>',
          external:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linecap-square" d="M10 2h4v4"/><path d="m6 10 8-8"/><path class="stroke-linejoin-round" d="M14 9.048V14H2V2h5"/></svg>',
          'file-open':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M8 1v4a1 1 0 0 0 1 1h4"/><path class="stroke-linejoin-round" d="M3 15h10V5L9 1H3v14z"/><path d="m3 8 7 7"/></svg>',
          file: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M8 1v5h5"/><path class="stroke-linejoin-round" d="M3 15V1h6l4 4v10H3z"/></svg>',
          filter:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M15 2H1l5 6v7h4V8l5-6z"/></svg>',
          'folder-open':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M2 7V2h7l1 2h5v9a1 1 0 0 1-1 1H3L1 7h10l2.006 7"/></svg>',
          folder:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M14 14H2V2h5.143L9 5h5v9z"/></svg>',
          heart:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M13.92 3.061a3.729 3.729 0 0 0-5.21 0L8 3.76l-.71-.699a3.729 3.729 0 0 0-5.21 0 3.58 3.58 0 0 0 0 5.123l5.21 5.124.003-.004L8 14l.707-.696.004.004 5.21-5.124a3.58 3.58 0 0 0 0-5.123Z"/></svg>',
          key: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M9 10a5.023 5.023 0 0 1 0 1 3.996 3.996 0 1 1-3-3.874L13 1h2v5h-2v2h-2l.016 1.983Z"/><path d="M4.99 11H5v.01h-.01z"/></svg>',
          'lock-private':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M2 7h12v7H2z"/><path d="M4 7V5a4 4 0 0 1 8 0v2"/></svg>',
          menu: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M15 8H1M15 3H1M15 13H1"/></svg>',
          microphone:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><rect class="stroke-linejoin-round" x="6" y="1" width="4" height="8" rx="2"/><path class="stroke-linejoin-round" d="M3 6v1a5 5 0 0 0 10 0V6M8 12v3M3 15h10"/></svg>',
          notification:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M8 2.167c-3.5 0-3.5 4.666-3.5 4.666L1 11.5h14l-3.5-4.667s0-4.666-3.5-4.666ZM5.667 11.5v1.167a2.333 2.333 0 0 0 4.666 0V11.5"/><path class="stroke-linecap-round" d="M8 1v1.167"/></svg>',
          redo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M12 5H6.38c-4.5 0-4.5 8 0 8H13"/><path class="stroke-linejoin-round" d="m10 8 3-3-3-3"/></svg>',
          refresh:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M10 5h5V0"/><path d="M15 8a6.957 6.957 0 0 1-7 7 6.957 6.957 0 0 1-7-7 6.957 6.957 0 0 1 7-7 6.87 6.87 0 0 1 6.3 4"/></svg>',
          search:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle cx="7" cy="7" r="5"/><path d="m15 15-4.5-4.5"/></svg>',
          settings:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path d="M13.33 5.792a1.942 1.942 0 0 1 .287-1.97 6.984 6.984 0 0 0-1.44-1.439 1.943 1.943 0 0 1-3.159-1.308 6.965 6.965 0 0 0-2.037 0 1.943 1.943 0 0 1-3.158 1.308 6.962 6.962 0 0 0-1.44 1.44 1.943 1.943 0 0 1-1.308 3.158 6.972 6.972 0 0 0 0 2.037 1.943 1.943 0 0 1 1.308 3.159 6.952 6.952 0 0 0 1.44 1.44 1.942 1.942 0 0 1 3.159 1.308 6.962 6.962 0 0 0 2.036 0 1.942 1.942 0 0 1 3.159-1.308 6.974 6.974 0 0 0 1.44-1.44 1.943 1.943 0 0 1 1.308-3.159 6.974 6.974 0 0 0 0-2.037 1.942 1.942 0 0 1-1.596-1.189Z"/><circle cx="8" cy="8" r="2"/></svg>',
          share:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle cx="11" cy="4" r="2"/><circle cx="4" cy="8" r="2"/><circle cx="11" cy="12" r="2"/><path d="M9.2 4.9 5.8 7.1M9.2 11.1 5.8 8.9"/></svg>',
          'status-in-progress':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path class="stroke-linecap-round" d="M4.99 7.995H5v.01h-.01zM7.99 7.995H8v.01h-.01zM10.99 7.995H11v.01h-.01z"/></svg>',
          'status-info':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path d="M8 11V8H6"/><path class="stroke-linejoin-round" d="M10 11H6"/><path d="M7.99 5H8v.01h-.01z"/></svg>',
          'status-negative':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path d="m10.828 5.172-5.656 5.656M10.828 10.828 5.172 5.172"/></svg>',
          'status-pending':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path class="stroke-linecap-square" d="M8 5v4H5"/></svg>',
          'status-positive':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path class="stroke-linecap-square" d="m5 8 2 2 3.521-3.521"/></svg>',
          'status-stopped':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle class="stroke-linejoin-round" cx="8" cy="8" r="7"/><path class="stroke-linecap-square" d="M11 8H5"/></svg>',
          'status-warning':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="m8 1 7 14H1L8 1z"/><path d="M7.99 12H8v.01h-.01zM8 6v4"/></svg>',
          'treeview-collapse':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M5 8h6M2 2h12v12H2z"/></svg>',
          'treeview-expand':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M5 8h6M8 11V5M2 2h12v12H2z"/></svg>',
          undo: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M4 13h5.625c4.5 0 4.5-8 0-8H3"/><path class="stroke-linejoin-round" d="M6 2 3 5l3 3"/></svg>',
          unlocked:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M2 7h12v7H2z"/><path d="M11.874 4A4 4 0 0 0 4 5v2"/></svg>',
          upload:
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M5 14H2V2h12v12h-3"/><path d="M12 10 8 6l-4 4M8 6v9"/></svg>',
          'user-profile':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="stroke-linejoin-round" d="M4.61 4.39C4.61 2.52 6.13 1 8 1s3.39 1.52 3.39 3.39S9.87 7.78 8 7.78 4.61 6.26 4.61 4.39M2.05 14.08h11.91c0-2.25-1.17-4.23-2.9-5.3A5.77 5.77 0 0 0 8 7.91c-3.29 0-5.95 2.76-5.95 6.17z"/></svg>',
          'view-full':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled" d="M5 5h6v6H5z"/><path class="stroke-linejoin-round" d="M2 2h12v12H2z"/></svg>',
          'view-horizontal':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled" d="M5 9h6v2H5z"/><path class="stroke-linejoin-round" d="M2 2h12v12H2z"/></svg>',
          'view-vertical':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><path class="filled" d="M11 5v6H9V5z"/><path class="stroke-linejoin-round" d="M2 2h12v12H2z"/></svg>',
          'zoom-in':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle cx="6.885" cy="6.885" r="5.385"/><path d="m14.5 14.5-3.846-3.846M7 4v6M10 7H4"/></svg>',
          'zoom-out':
            '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 16 16" focusable="false" aria-hidden="true"><circle cx="6.885" cy="6.885" r="5.385"/><path d="m14.5 14.5-3.846-3.846M10 7H4"/></svg>'
        },
        c = n(2384),
        f = n(2319);
      var d = function (e) {
        var t = e.name,
          n = e.size,
          d = void 0 === n ? 'normal' : n,
          h = e.variant,
          p = void 0 === h ? 'normal' : h,
          v = e.url,
          _ = e.alt,
          m = e.svg,
          g = e.badge,
          w = e.__internalRootRef,
          y = void 0 === w ? null : w,
          b = (0, i._T)(e, ['name', 'size', 'variant', 'url', 'alt', 'svg', 'badge', '__internalRootRef']),
          x = (0, o.useRef)(null);
        (0, f.LV)(x);
        var E,
          k = (0, o.useState)(null),
          C = k[0],
          S = k[1],
          N = 'inherit' === d,
          j = N
            ? null === (E = C)
              ? 'normal'
              : E >= 50
              ? 'large'
              : E >= 36
              ? 'big'
              : E >= 24
              ? 'medium'
              : E <= 16
              ? 'small'
              : 'normal'
            : d,
          z = N && null !== C ? { height: ''.concat(C, 'px') } : {},
          O = (0, a.j)(b);
        (O.className = (0, r.Z)(
          O.className,
          l.icon,
          N && l['icon-flex-height'],
          g && l.badge,
          !N && l['size-'.concat(j, '-mapped-height')],
          l['size-'.concat(j)],
          l['variant-'.concat(p)]
        )),
          (0, o.useLayoutEffect)(function () {
            if (N && x.current) {
              var e = getComputedStyle(x.current).lineHeight,
                t = parseInt(e, 10);
              S(t);
            }
          });
        var T = (0, c.q)(x, y);
        if (m)
          return (
            v &&
              (0, s.O)(
                'Icon',
                'You have specified both `url` and `svg`. `svg` will take precedence and `url` will be ignored.'
              ),
            o.createElement('span', (0, i.pi)({}, O, { ref: T, 'aria-hidden': 'true', style: z }), m)
          );
        if (v)
          return o.createElement(
            'span',
            (0, i.pi)({}, O, { ref: T, style: z }),
            o.createElement('img', { src: v, alt: _ })
          );
        var R = t && Object.prototype.hasOwnProperty.call(u, t);
        return o.createElement(
          'span',
          (0, i.pi)({}, O, { dangerouslySetInnerHTML: R ? { __html: u[t] } : void 0, ref: T, style: z })
        );
      };
    },
    286: function (e, t, n) {
      'use strict';
      n.d(t, {
        j: function () {
          return r;
        }
      });
      n(8126);
      var i = n(1046);
      function r(e) {
        var t = {};
        return (
          Object.keys(e).forEach(function (n) {
            ('id' === n || 'className' === n || n.match(/^data-/)) && (t[n] = e[n]);
          }),
          t
        );
      }
      window.awsuiVersions || (window.awsuiVersions = {}),
        window.awsuiVersions.components || (window.awsuiVersions.components = []),
        window.awsuiVersions.components.push(i.ll);
    },
    7520: function (e, t, n) {
      'use strict';
      n.d(t, {
        Il: function () {
          return r;
        },
        Zz: function () {
          return a;
        },
        zm: function () {
          return s;
        }
      });
      var i = [
          ['xl', 1840],
          ['l', 1320],
          ['m', 1120],
          ['s', 912],
          ['xs', 688],
          ['xxs', 465],
          ['default', -1]
        ],
        r = i.filter(function (e) {
          return 'xs' === e[0];
        })[0][1],
        o = i.map(function (e) {
          return e[0];
        });
      function a(e, t) {
        for (var n = 0, r = i.slice(o.indexOf(t)); n < r.length; n++) {
          var a = e[r[n][0]];
          if (void 0 !== a) return a;
        }
        return null;
      }
      function s(e, t) {
        for (var n = 0, r = i; n < r.length; n++) {
          var o = r[n],
            a = o[0];
          if (e > o[1] && (!t || -1 !== t.indexOf(a))) return a;
        }
        return 'default';
      }
    },
    5088: function (e, t, n) {
      'use strict';
      n.d(t, {
        q: function () {
          return o;
        },
        t: function () {
          return a;
        }
      });
      var i = n(1738),
        r = i.createContext({ position: 'bottom-right' });
      function o(e) {
        var t = e.children,
          n = e.position,
          o = void 0 === n ? 'bottom-right' : n;
        return i.createElement(r.Provider, { value: { position: o } }, t);
      }
      function a() {
        return (0, i.useContext)(r);
      }
    },
    9591: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return H;
        }
      });
      var i = n(4997),
        r = (n(6366), 'awsui_dropdown-content-wrapper_qwoo0_1aum0_93'),
        o = 'awsui_refresh_qwoo0_1aum0_114',
        a = 'awsui_root_qwoo0_1aum0_143',
        s = 'awsui_interior_qwoo0_1aum0_155',
        l = 'awsui_dropdown_qwoo0_1aum0_93',
        u = 'awsui_use-portal_qwoo0_1aum0_166',
        c = 'awsui_dropdown-drop-up_qwoo0_1aum0_211',
        f = 'awsui_with-limited-width_qwoo0_1aum0_215',
        d = 'awsui_dropdown-drop-left_qwoo0_1aum0_218',
        h = 'awsui_dropdown-drop-right_qwoo0_1aum0_221',
        p = 'awsui_occupy-entire-width_qwoo0_1aum0_224',
        v = 'awsui_hide-upper-border_qwoo0_1aum0_227',
        _ = 'awsui_open_qwoo0_1aum0_234',
        m = 'awsui_nowrap_qwoo0_1aum0_243',
        g = 'awsui_is-empty_qwoo0_1aum0_247',
        w = 'awsui_dropdown-content_qwoo0_1aum0_93',
        y = 'awsui_ie11-wrapper_qwoo0_1aum0_257',
        b = 'awsui_stretch-trigger-height_qwoo0_1aum0_261',
        x = n(7069),
        E = n(2384),
        k = n(1738),
        C = n(3489),
        S = n(7579),
        N = n(2555),
        j = function (e, t, n, i, r, o, a, s) {
          void 0 === r && (r = !1), void 0 === o && (o = !1), void 0 === a && (a = !1);
          var l = (function (e, t, n, i, r, o) {
              void 0 === i && (i = !1), void 0 === r && (r = !1);
              var a = r ? 0 : o ? 19 : 50,
                s = i ? 0 : o ? 20 : 50,
                l = e.getBoundingClientRect(),
                u = l.bottom,
                c = l.left,
                f = l.right;
              return n.reduce(
                function (t, n) {
                  var i = t.above,
                    r = t.below,
                    o = t.left,
                    l = t.right,
                    d = u - n.top,
                    h = d - e.offsetHeight - a,
                    p = n.height - d - a,
                    v = f - n.left - s,
                    _ = n.left + n.width - c - s;
                  return {
                    above: Math.min(i, h),
                    below: Math.min(r, p),
                    left: Math.min(o, v),
                    right: Math.min(l, _)
                  };
                },
                {
                  above: Number.MAX_VALUE,
                  below: Number.MAX_VALUE,
                  left: Number.MAX_VALUE,
                  right: Number.MAX_VALUE
                }
              );
            })(e, 0, n, o, a, s),
            u = e.getBoundingClientRect().width;
          i = i ? Math.min(u, i) : u;
          var c,
            f = t.getBoundingClientRect().width,
            d = Math.max(f, i),
            h = null,
            p = d;
          if (
            (d <= l.right
              ? (c = !1)
              : d <= l.left
              ? (c = !0)
              : ((c = l.left > l.right), (p = Math.max(l.left, l.right, i))),
            r)
          ) {
            var v = (d - u) / 2,
              _ = l.left - u,
              m = l.right - u;
            _ >= v && m >= v && (h = -v);
          }
          var g = l.below < t.offsetHeight && l.above > l.below,
            w = g ? l.above : l.below,
            y = a ? w : 31 * Math.floor(w / 31) + 16;
          return {
            dropUp: g,
            dropLeft: c,
            left: null === h ? 'auto' : ''.concat(h, 'px'),
            height: ''.concat(y, 'px'),
            width: ''.concat(p, 'px')
          };
        },
        z = function (e, t, n, i) {
          var r,
            o,
            a = (function (e, t, n, i) {
              var r = i ? 19 : 50,
                o = i ? 20 : 50,
                a = e.getBoundingClientRect(),
                s = a.bottom,
                l = a.top,
                u = a.left,
                c = a.right;
              return n.reduce(
                function (e, t) {
                  var n = e.above,
                    i = e.below,
                    a = e.left,
                    f = e.right,
                    d = s - t.top - r,
                    h = t.height - l + t.top - r,
                    p = u - t.left - o,
                    v = t.left + t.width - c - o;
                  return {
                    above: Math.min(n, d),
                    below: Math.min(i, h),
                    left: Math.min(a, p),
                    right: Math.min(f, v)
                  };
                },
                {
                  above: Number.MAX_VALUE,
                  below: Number.MAX_VALUE,
                  left: Number.MAX_VALUE,
                  right: Number.MAX_VALUE
                }
              );
            })(e, 0, n, i),
            s = e.getBoundingClientRect(),
            l = s.bottom,
            u = s.top,
            c = s.width,
            f =
              ((r = e),
              (0, N.Et)(r)
                .map(function (e) {
                  var t = e.getBoundingClientRect();
                  return { height: t.height, width: t.width, top: t.top, left: t.left };
                })
                .shift()),
            d = f.top,
            h = f.height,
            p = t.getBoundingClientRect().width,
            v = u - d;
          p <= a.right
            ? (o = !1)
            : p <= a.left
            ? (o = !0)
            : ((o = a.left > a.right), (p = Math.max(a.left, a.right)));
          var _ = o ? 0 - p : c,
            m = a.below < t.offsetHeight && a.above > a.below,
            g = m ? d + h - l : 0,
            w = m ? a.above : a.below,
            y = 31 * Math.floor(w / 31) + 16;
          return {
            dropUp: m,
            dropLeft: o,
            height: ''.concat(y, 'px'),
            width: ''.concat(p, 'px'),
            top: ''.concat(v, 'px'),
            bottom: ''.concat(g, 'px'),
            left: ''.concat(_, 'px')
          };
        },
        O = n(7398),
        T = n(2319),
        R = n(4125),
        B = n(5088),
        A = n(6208),
        L = n(4091),
        P = n(9015),
        Z = function (e) {
          var t = e.children,
            n = e.renderWithPortal,
            i = void 0 !== n && n,
            r = e.id,
            o = e.open;
          return i
            ? o
              ? (0, C.createPortal)(k.createElement('div', { id: r }, t), document.body)
              : null
            : k.createElement(k.Fragment, null, t);
        },
        M = function (e) {
          var t,
            n = e.state,
            i = e.transitionRef,
            a = e.dropdownClasses,
            c = e.stretchWidth,
            d = e.interior,
            h = e.hasContent,
            p = e.isRefresh,
            m = e.dropdownRef,
            b = e.verticalContainerRef,
            C = e.expandToViewport,
            S = e.header,
            N = e.children,
            j = e.footer,
            z = e.position,
            O = e.open,
            T = e.onMouseDown,
            R = (0, E.q)(m, i);
          return k.createElement(
            'div',
            {
              className: (0, x.Z)(
                l,
                a,
                ((t = {}),
                (t[_] = O),
                (t[f] = !c),
                (t[v] = c),
                (t[s] = d),
                (t[g] = !S && !h),
                (t[o] = p),
                (t[u] = C && !d),
                t)
              ),
              ref: R,
              'data-open': O,
              'data-animating': 'exited' !== n,
              onMouseDown: T
            },
            k.createElement(
              'div',
              { className: (0, x.Z)(r, p && o) },
              k.createElement(
                'div',
                { className: y },
                k.createElement(
                  'div',
                  { ref: b, className: w },
                  k.createElement(B.q, { position: z }, S, N, j)
                )
              )
            )
          );
        },
        I = function (e) {
          return void 0 !== e.bottom;
        },
        H = function (e) {
          var t = e.children,
            n = e.trigger,
            r = e.open,
            o = e.onDropdownClose,
            l = e.onMouseDown,
            u = e.header,
            f = e.footer,
            v = e.dropdownId,
            _ = e.stretchTriggerHeight,
            g = void 0 !== _ && _,
            w = e.stretchWidth,
            y = void 0 === w || w,
            E = e.stretchHeight,
            C = void 0 !== E && E,
            B = e.stretchToTriggerWidth,
            H = void 0 === B || B,
            D = e.expandToViewport,
            U = void 0 !== D && D,
            q = e.preferCenter,
            F = void 0 !== q && q,
            W = e.interior,
            V = void 0 !== W && W,
            G = e.minWidth,
            K = e.hasContent,
            X = void 0 === K || K,
            $ = e.scrollable,
            J = void 0 === $ || $,
            Y = e.trapFocus,
            Q = void 0 !== Y && Y,
            ee = (0, k.useRef)(null),
            te = (0, k.useRef)(null),
            ne = (0, k.useRef)(null),
            ie = (0, k.useRef)(null),
            re = (0, T.LV)(ee),
            oe = (0, R.g)(ee),
            ae = (0, k.useState)('bottom-right'),
            se = ae[0],
            le = ae[1],
            ue = (0, A.X)(),
            ce = function (e, t, n, i) {
              var r = !V && y;
              if (
                ((i.style.maxHeight = y ? e.height : ''.concat(parseInt(e.height) + 1, 'px')),
                r && !U ? H && n.classList.add(p) : (n.style.width = e.width),
                e.dropUp && !V ? (n.classList.add(c), U || (n.style.bottom = '100%')) : n.classList.remove(c),
                n.classList.add(e.dropLeft ? d : h),
                e.left && 'auto' !== e.left && (n.style.left = e.left),
                U && !V)
              )
                return (
                  (n.style.position = 'fixed'),
                  e.dropUp
                    ? (n.style.bottom = 'calc(100% - '.concat(t.top, 'px)'))
                    : (n.style.top = ''.concat(t.bottom, 'px')),
                  e.dropLeft
                    ? (n.style.left = 'calc('.concat(t.right, 'px - ').concat(e.width, ')'))
                    : (n.style.left = ''.concat(t.left, 'px')),
                  void (ie.current = e)
                );
              V &&
                I(e) &&
                (e.dropUp ? (n.style.bottom = e.bottom) : (n.style.top = e.top), (n.style.left = e.left)),
                e.dropUp && e.dropLeft
                  ? le('top-left')
                  : e.dropUp
                  ? le('top-right')
                  : e.dropLeft
                  ? le('bottom-left')
                  : le('bottom-right');
            };
          return (
            (0, k.useLayoutEffect)(
              function () {
                var e = function () {
                  r &&
                    te.current &&
                    ee.current &&
                    ne.current &&
                    (J && te.current.classList.add(m),
                    ce.apply(
                      void 0,
                      (0, i.ev)(
                        (0, i.ev)(
                          [],
                          (function (e, t, n, i, r, o, a, s, l, u) {
                            (n.style.maxHeight = ''),
                              (e.style.width = ''),
                              (e.style.top = ''),
                              (e.style.bottom = ''),
                              (e.style.left = ''),
                              e.classList.remove(d),
                              e.classList.remove(h),
                              e.classList.remove(c);
                            var f = (0, N.YA)(e, i, r, s);
                            return [i ? z(t, e, f, l) : j(t, e, f, u, o, a, s, l), t.getBoundingClientRect()];
                          })(te.current, ee.current, ne.current, V, U, F, y, C, ue, G),
                          !1
                        ),
                        [te.current, ne.current],
                        !1
                      )
                    ),
                    J && te.current.classList.remove(m));
                };
                if ((e(), r)) {
                  window.addEventListener('scroll', e);
                  var t = setTimeout(function () {
                    window.removeEventListener('scroll', e);
                  }, 500);
                  return function () {
                    clearTimeout(t), window.removeEventListener('scroll', e);
                  };
                }
              },
              [r, te, ee, ne, V, y, ue]
            ),
            (0, k.useEffect)(
              function () {
                if (r) {
                  var e = function (e) {
                      var t;
                      (null === (t = te.current) || void 0 === t ? void 0 : t.contains(e.target)) ||
                        (0, S.B4)(o);
                    },
                    t = setTimeout(function () {
                      window.addEventListener('click', e);
                    }, 0);
                  return function () {
                    clearTimeout(t), window.removeEventListener('click', e);
                  };
                }
              },
              [r, o]
            ),
            (0, k.useLayoutEffect)(
              function () {
                if (U && r) {
                  var e = function () {
                    if (ee.current && te.current && ne.current) {
                      var e = ee.current.getBoundingClientRect(),
                        t = te.current;
                      ie.current &&
                        (ie.current.dropUp
                          ? (te.current.style.bottom = 'calc(100% - '.concat(e.top, 'px)'))
                          : (t.style.top = ''.concat(e.bottom, 'px')),
                        ie.current.dropLeft
                          ? (t.style.left = 'calc('.concat(e.right, 'px - ').concat(ie.current.width, ')'))
                          : (t.style.left = ''.concat(e.left, 'px')));
                    }
                  };
                  return (
                    e(),
                    window.addEventListener('scroll', e, !0),
                    window.addEventListener('resize', e, !0),
                    function () {
                      window.removeEventListener('scroll', e, !0),
                        window.removeEventListener('resize', e, !0);
                    }
                  );
                }
              },
              [r, U]
            ),
            k.createElement(
              'div',
              { className: (0, x.Z)(a, V && s, g && b) },
              k.createElement('div', { className: (0, x.Z)(g && b), ref: ee }, n),
              k.createElement(L.Z, {
                focusNextCallback: function () {
                  var e;
                  return (
                    te.current && (null === (e = (0, P.ft)(te.current)) || void 0 === e ? void 0 : e.focus())
                  );
                },
                disabled: !r || !Q
              }),
              k.createElement(
                Z,
                { renderWithPortal: U && !V, id: v, open: r },
                k.createElement(O.u, { in: null !== r && void 0 !== r && r, exit: !1 }, function (e, n) {
                  return k.createElement(
                    'div',
                    {
                      onBlur: function (e) {
                        return Q && e.stopPropagation();
                      }
                    },
                    k.createElement(L.Z, {
                      focusNextCallback: function () {
                        var e;
                        return (
                          ee.current &&
                          (null === (e = (0, P.TE)(ee.current)) || void 0 === e ? void 0 : e.focus())
                        );
                      },
                      disabled: !r || !Q
                    }),
                    k.createElement(
                      M,
                      {
                        state: e,
                        transitionRef: n,
                        dropdownClasses: oe,
                        open: r,
                        stretchWidth: y,
                        interior: V,
                        header: u,
                        hasContent: X,
                        expandToViewport: U,
                        footer: f,
                        onMouseDown: l,
                        isRefresh: re,
                        dropdownRef: te,
                        verticalContainerRef: ne,
                        position: se
                      },
                      t
                    ),
                    k.createElement(L.Z, {
                      focusNextCallback: function () {
                        var e;
                        return (
                          ee.current &&
                          (null === (e = (0, P.ft)(ee.current)) || void 0 === e ? void 0 : e.focus())
                        );
                      },
                      disabled: !r || !Q
                    })
                  );
                })
              )
            )
          );
        };
    },
    9015: function (e, t, n) {
      'use strict';
      n.d(t, {
        TE: function () {
          return a;
        },
        ft: function () {
          return o;
        }
      });
      var i = [
        'button:enabled',
        'select:enabled',
        'textarea:enabled',
        'input:enabled',
        'a[href]',
        'area[href]',
        'summary',
        'iframe',
        'object',
        'embed',
        'audio[controls]',
        'video[controls]',
        '[tabindex]',
        '[contenteditable]',
        '[autofocus]'
      ].join(',');
      function r(e) {
        return Array.prototype.slice.call(e.querySelectorAll(i)).filter(function (e) {
          return -1 !== e.tabIndex;
        });
      }
      function o(e) {
        var t;
        return null !== (t = r(e)[0]) && void 0 !== t ? t : null;
      }
      function a(e) {
        var t,
          n = r(e);
        return null !== (t = n[n.length - 1]) && void 0 !== t ? t : null;
      }
    },
    8003: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return p;
        }
      });
      var i = n(4997),
        r = n(7069),
        o = n(2384),
        a = n(1738),
        s = n(286),
        l = n(7579),
        u = n(1265),
        c = (n(5084), 'awsui_options-list_19gcf_fc5oi_93'),
        f = 'awsui_decrease-top-margin_19gcf_fc5oi_113',
        d = function (e, t) {
          var n = (0, u.jX)(t.target, function (t) {
              return t === e.current || !!t.dataset.mouseTarget;
            }),
            i = null === n || void 0 === n ? void 0 : n.dataset.mouseTarget;
          return i ? parseInt(i) : -1;
        },
        h = function (e, t) {
          var n,
            u = e.open,
            h = e.children,
            p = e.nativeAttributes,
            v = void 0 === p ? {} : p,
            _ = e.onKeyDown,
            m = e.onBlur,
            g = e.onFocus,
            w = e.onLoadMore,
            y = e.onMouseUp,
            b = e.onMouseMove,
            x = e.position,
            E = void 0 === x ? 'relative' : x,
            k = e.role,
            C = void 0 === k ? 'listbox' : k,
            S = e.decreaseTopMargin,
            N = void 0 !== S && S,
            j = e.ariaLabelledby,
            z = (0, i._T)(e, [
              'open',
              'children',
              'nativeAttributes',
              'onKeyDown',
              'onBlur',
              'onFocus',
              'onLoadMore',
              'onMouseUp',
              'onMouseMove',
              'position',
              'role',
              'decreaseTopMargin',
              'ariaLabelledby'
            ]),
            O = (0, s.j)(z),
            T = (0, a.useRef)(null),
            R = function () {
              var e = null === T || void 0 === T ? void 0 : T.current;
              if (e) {
                var t = e.scrollTop + e.clientHeight;
                e.scrollHeight - t < 80 && (0, l.B4)(w);
              }
            };
          (0, a.useEffect)(function () {
            u && R();
          });
          var B = (0, r.Z)(c, (((n = {})[f] = N), n)),
            A = (0, o.q)(t, T);
          return a.createElement(
            'ul',
            (0, i.pi)({}, O, v, {
              className: B,
              ref: A,
              style: { position: E },
              role: C,
              onScroll: R,
              onKeyDown: function (e) {
                return _ && (0, l.nm)(_, e);
              },
              onMouseMove: function (e) {
                return null === b || void 0 === b ? void 0 : b(d(T, e));
              },
              onMouseUp: function (e) {
                return null === y || void 0 === y ? void 0 : y(d(T, e));
              },
              onBlur: function (e) {
                return (0, l.B4)(m, { relatedTarget: (0, l.rr)(e.nativeEvent) });
              },
              onFocus: function () {
                return (0, l.B4)(g);
              },
              tabIndex: -1,
              'aria-labelledby': j
            }),
            u && h
          );
        },
        p = a.forwardRef(h);
    },
    4233: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return r;
        }
      });
      var i = n(1738),
        r = function (e) {
          var t = e.onOpen,
            n = e.onClose,
            r = (0, i.useState)(!1),
            o = r[0],
            a = r[1],
            s = function () {
              o || (a(!0), null === t || void 0 === t || t());
            },
            l = function () {
              o && (a(!1), null === n || void 0 === n || n());
            };
          return {
            isOpen: o,
            openDropdown: s,
            closeDropdown: l,
            toggleDropdown: function () {
              o ? l() : s();
            }
          };
        };
    },
    2675: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return o;
        }
      });
      var i = n(1738),
        r = n(3489);
      function o(e) {
        var t = e.container,
          n = e.children,
          o = (0, i.useState)(null !== t && void 0 !== t ? t : null),
          a = o[0],
          s = o[1];
        return (
          (0, i.useLayoutEffect)(
            function () {
              if (!t) {
                var e = document.createElement('div');
                return (
                  document.body.appendChild(e),
                  s(e),
                  function () {
                    document.body.removeChild(e), s(null);
                  }
                );
              }
              s(t);
            },
            [t]
          ),
          a && (0, r.createPortal)(n, a)
        );
      }
    },
    4091: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return r;
        }
      });
      var i = n(1738);
      function r(e) {
        var t = e.focusNextCallback,
          n = e.disabled,
          r = void 0 !== n && n;
        return i.createElement('div', { tabIndex: r ? -1 : 0, onFocus: t });
      }
    },
    7398: function (e, t, n) {
      'use strict';
      n.d(t, {
        u: function () {
          return s;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(9043),
        a = n(2319);
      function s(e) {
        var t = e.in,
          n = e.children,
          s = e.exit,
          l = void 0 === s || s,
          u = e.onStatusChange,
          c = void 0 === u ? function () {} : u,
          f = e.disabled,
          d = void 0 !== f && f,
          h = e.transitionChangeDelay,
          p = (0, i._T)(e, ['in', 'children', 'exit', 'onStatusChange', 'disabled', 'transitionChangeDelay']),
          v = (0, r.useRef)(null),
          _ = (0, r.useState)(t ? 'entered' : 'exited'),
          m = _[0],
          g = _[1],
          w = (0, a.JZ)(v) || d,
          y = (0, r.useCallback)(function (e) {
            var t = v.current;
            if (null !== t) {
              var n = function n(i) {
                i.target === t &&
                  (t.removeEventListener('transitionend', n), t.removeEventListener('animationend', n), e());
              };
              t.addEventListener('transitionend', n), t.addEventListener('animationend', n);
            }
          }, []);
        return r.createElement(
          o.ZP,
          (0, i.pi)(
            {
              addEndListener: y,
              timeout: w ? 0 : void 0,
              in: t,
              nodeRef: v,
              exit: l,
              onEnter: function (e) {
                e || (g('enter'), c('enter'));
              },
              onEntering: function (e) {
                var t;
                e ||
                  (null === (t = v.current) || void 0 === t || t.offsetHeight,
                  (null === h || void 0 === h ? void 0 : h.entering)
                    ? setTimeout(
                        function () {
                          g('entering'), c('entering');
                        },
                        null === h || void 0 === h ? void 0 : h.entering
                      )
                    : (g('entering'), c('entering')));
              },
              onEntered: function (e) {
                e || (g('entered'), c('entered'));
              },
              onExit: function () {
                g('exit'), c('exit');
              },
              onExiting: function () {
                g('exiting'), c('exiting');
              },
              onExited: function () {
                g('exited'), c('exited');
              }
            },
            p
          ),
          function () {
            return n(m, v);
          }
        );
      }
    },
    5511: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return l;
        },
        r: function () {
          return s;
        }
      });
      var i = n(7069),
        r = n(1738),
        o = n(2473),
        a = n(1265),
        s = function (e) {
          var t = /awsui-context-([\w-]+)/,
            n = (0, r.useState)(''),
            i = n[0],
            s = n[1];
          return (
            (0, o.I)(e, function (e) {
              var n = (0, a.jX)(e, function (e) {
                return !!e.className.match(t);
              });
              s(n ? n.className.match(t)[1] : '');
            }),
            i
          );
        };
      function l(e) {
        var t = e.contextName,
          n = e.className,
          o = e.children;
        return r.createElement('div', { className: (0, i.Z)('awsui-context-'.concat(t), n) }, o);
      }
    },
    9227: function (e, t, n) {
      'use strict';
      n.d(t, {
        T: function () {
          return o;
        },
        b: function () {
          return a;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = (0, r.createContext)({ stickyOffsetTop: 0, stickyOffsetBottom: 0 });
      function a() {
        var e = (0, r.useContext)(o);
        return (0, i.pi)({}, e);
      }
    },
    2592: function (e, t, n) {
      'use strict';
      n.d(t, {
        C: function () {
          return i;
        }
      });
      var i = (0, n(1738).createContext)({
        topOffset: 0,
        bottomOffset: 0,
        leftOffset: 0,
        rightOffset: 0,
        position: 'bottom',
        size: 0,
        getMaxWidth: function () {
          return 0;
        },
        getMaxHeight: function () {
          return 0;
        },
        getHeader: function () {
          return null;
        },
        isCopy: !1,
        isOpen: !0,
        isMobile: !1,
        isRefresh: !1,
        isForcedPosition: !1,
        lastInteraction: void 0,
        splitPanelRef: void 0,
        splitPanelHeaderRef: void 0,
        onResize: function () {},
        onToggle: function () {},
        onPreferencesChange: function () {},
        reportSize: function () {}
      });
    },
    1046: function (e, t, n) {
      'use strict';
      n.d(t, {
        C6: function () {
          return r;
        },
        Jp: function () {
          return o;
        },
        ll: function () {
          return i;
        }
      });
      var i = '3.0.0 (ccb0172)',
        r = 'open-source-visual-refresh',
        o = !0;
    },
    7579: function (e, t, n) {
      'use strict';
      n.d(t, {
        B4: function () {
          return o;
        },
        nm: function () {
          return s;
        },
        p_: function () {
          return l;
        },
        rr: function () {
          return u;
        },
        y1: function () {
          return a;
        }
      });
      var i = (function () {
        function e(e, t) {
          void 0 === e && (e = !1),
            void 0 === t && (t = null),
            (this.cancelable = e),
            (this.detail = t),
            (this.defaultPrevented = !1),
            (this.cancelBubble = !1);
        }
        return (
          (e.prototype.preventDefault = function () {
            this.defaultPrevented = !0;
          }),
          (e.prototype.stopPropagation = function () {
            this.cancelBubble = !0;
          }),
          e
        );
      })();
      function r(e) {
        var t = e.cancelable,
          n = e.detail;
        return new i(t, n);
      }
      function o(e, t) {
        e && e(r({ cancelable: !1, detail: t }));
      }
      function a(e, t, n) {
        if (!e) return !1;
        var i = r({ cancelable: !0, detail: t });
        return (
          e(i),
          i.defaultPrevented && n && n.preventDefault(),
          i.cancelBubble && n && n.stopPropagation(),
          i.defaultPrevented
        );
      }
      function s(e, t) {
        return a(
          e,
          {
            keyCode: t.keyCode,
            key: t.key,
            ctrlKey: t.ctrlKey,
            shiftKey: t.shiftKey,
            altKey: t.altKey,
            metaKey: t.metaKey
          },
          t
        );
      }
      function l(e) {
        return (
          e &&
          (!(void 0 !== e.button) || 0 === e.button) &&
          !e.ctrlKey &&
          !e.altKey &&
          !e.shiftKey &&
          !e.metaKey
        );
      }
      var u = function (e) {
        return e.relatedTarget || document.activeElement;
      };
    },
    9095: function (e, t) {
      'use strict';
      t.Z = {
        offsetTop: '--awsui-offset-top-ujkcpl',
        offsetTopWithNotifications: '--awsui-offset-top-with-notifications-ujkcpl',
        contentGapLeft: '--awsui-content-gap-left-ujkcpl',
        contentGapRight: '--awsui-content-gap-right-ujkcpl',
        contentHeight: '--awsui-content-height-ujkcpl',
        defaultMaxContentWidth: '--awsui-default-max-content-width-ujkcpl',
        defaultMinContentWidth: '--awsui-default-min-content-width-ujkcpl',
        footerHeight: '--awsui-footer-height-ujkcpl',
        headerHeight: '--awsui-header-height-ujkcpl',
        layoutWidth: '--awsui-layout-width-ujkcpl',
        mainOffsetLeft: '--awsui-main-offset-left-ujkcpl',
        maxContentWidth: '--awsui-max-content-width-ujkcpl',
        minContentWidth: '--awsui-min-content-width-ujkcpl',
        notificationsHeight: '--awsui-notifications-height-ujkcpl',
        overlapHeight: '--awsui-overlap-height-ujkcpl',
        navigationWidth: '--awsui-navigation-width-ujkcpl',
        splitPanelReportedHeaderSize: '--awsui-split-panel-reported-header-size-ujkcpl',
        splitPanelReportedSize: '--awsui-split-panel-reported-size-ujkcpl',
        splitPanelMinWidth: '--awsui-split-panel-min-width-ujkcpl',
        splitPanelMaxWidth: '--awsui-split-panel-max-width-ujkcpl',
        toolsMaxWidth: '--awsui-tools-max-width-ujkcpl',
        toolsWidth: '--awsui-tools-width-ujkcpl',
        toolsAnimationStartingOpacity: '--awsui-tools-animation-starting-opacity-ujkcpl',
        contentScrollMargin: '--awsui-content-scroll-margin-ujkcpl'
      };
    },
    6210: function (e, t, n) {
      'use strict';
      n.d(t, {
        d: function () {
          return o;
        }
      });
      var i = n(6918),
        r = n(7520);
      function o(e) {
        var t = null === e || void 0 === e ? void 0 : e.join();
        return (0, i.D)(
          function (t) {
            return (0, r.zm)(t.width, e);
          },
          [t]
        );
      }
    },
    6918: function (e, t, n) {
      'use strict';
      n.d(t, {
        D: function () {
          return o;
        }
      });
      var i = n(1738),
        r = n(4673);
      function o(e, t) {
        void 0 === t && (t = []);
        var n = (0, i.useRef)(null),
          o = (0, i.useState)(null),
          a = o[0],
          s = o[1],
          l = (0, i.useCallback)(function () {
            return n.current;
          }, t);
        return (
          (0, r.y)(l, function (t) {
            return s(function (n) {
              return e(t, n);
            });
          }),
          [a, n]
        );
      }
    },
    4673: function (e, t, n) {
      'use strict';
      n.d(t, {
        y: function () {
          return a;
        }
      });
      var i = n(4465),
        r = n(1738),
        o = n(6656);
      function a(e, t) {
        var n = (0, o.S)(t);
        (0, r.useLayoutEffect)(function () {
          var n = 'function' === typeof e ? e() : null === e || void 0 === e ? void 0 : e.current;
          n && t(s(new i.AL(n)));
        }, []),
          (0, r.useEffect)(
            function () {
              var t = 'function' === typeof e ? e() : null === e || void 0 === e ? void 0 : e.current;
              if (t) {
                var r = !0,
                  o = new i.do(function (e) {
                    r && n(s(e[0]));
                  });
                return (
                  o.observe(t),
                  function () {
                    (r = !1), o.disconnect();
                  }
                );
              }
            },
            [e, n]
          );
      }
      function s(e) {
        return {
          target: e.target,
          contentBoxWidth: e.contentBoxSize[0].inlineSize,
          contentBoxHeight: e.contentBoxSize[0].blockSize,
          borderBoxWidth: e.borderBoxSize[0].inlineSize,
          borderBoxHeight: e.borderBoxSize[0].blockSize,
          width: e.contentBoxSize[0].inlineSize,
          height: e.contentBoxSize[0].blockSize
        };
      }
    },
    3090: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return o;
        }
      });
      var i = n(7906),
        r = (0, n(8929).M)({
          initialState: !1,
          factory: function (e) {
            var t = function () {
                return e(!1);
              },
              n = function (t) {
                [i.V.shift, i.V.alt, i.V.control, i.V.meta].indexOf(t.keyCode) > -1 || e(!0);
              };
            return (
              document.addEventListener('mousedown', t),
              document.addEventListener('keydown', n),
              function () {
                document.removeEventListener('mousedown', t), document.removeEventListener('keydown', n);
              }
            );
          }
        });
      function o() {
        var e = r();
        return e ? { 'data-awsui-focus-visible': e } : {};
      }
    },
    7740: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return r;
        }
      });
      var i = n(1738);
      function r(e, t) {
        (0, i.useImperativeHandle)(
          e,
          function () {
            return {
              focus: function () {
                for (var e, n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
                null === (e = t.current) || void 0 === e || e.focus.apply(e, n);
              }
            };
          },
          [t]
        );
      }
    },
    822: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return d;
        }
      });
      var i = n(1738),
        r = n(1046),
        o = {},
        a = function (e) {
          return e.replace(/\s/g, '');
        },
        s = function (e, t) {
          return ''.concat(e.charAt(0)).concat(
            (function (e) {
              var t = e.match(/^(\d+\.\d+)/);
              return t ? t[1] : '';
            })(t).replace('.', '')
          );
        },
        l = function e(t) {
          try {
            if ('object' === typeof (null === t || void 0 === t ? void 0 : t.AWSC))
              return null === t || void 0 === t ? void 0 : t.AWSC;
            if (!t || t.parent === t) return;
            return e(t.parent);
          } catch (n) {
            return;
          }
        },
        u = 'react';
      var c = {
        initMetrics: function (e) {
          !(function (e) {
            u = e;
          })(e);
        },
        sendMetric: function (e, t, n) {
          if (e && /^[a-zA-Z0-9_-]{1,32}$/.test(e))
            if (n && n.length > 200)
              console.error('Detail for metric '.concat(e, ' is too long: ').concat(n));
            else {
              var i = l(window);
              'object' === typeof i &&
                'object' === typeof i.Clog &&
                'function' === typeof i.Clog.log &&
                i.Clog.log(e, t, n);
            }
          else console.error('Invalid metric name: '.concat(e));
        },
        sendMetricObject: function (e, t) {
          this.sendMetric(
            (function (e) {
              var t = e.source,
                n = e.version;
              return ['awsui', t, ''.concat(s(r.C6, n))].join('_');
            })(e),
            t,
            (function (e) {
              var t = e.source,
                n = e.action,
                i = e.version,
                o = {
                  o: 'undefined' !== typeof AWSUI_METRIC_ORIGIN ? AWSUI_METRIC_ORIGIN : 'main',
                  s: t,
                  t: r.C6,
                  a: n,
                  f: u,
                  v: a(i)
                };
              return JSON.stringify(o);
            })(e)
          );
        },
        sendMetricObjectOnce: function (e, t) {
          var n = (function (e) {
            var t = e.source,
              n = e.action;
            return ['src'.concat(t), 'action'.concat(n)].join('_');
          })(e);
          o[n] || (this.sendMetricObject(e, t), (o[n] = !0));
        },
        sendMetricOnce: function (e, t, n) {
          o[e] || (this.sendMetric(e, t, n), (o[e] = !0));
        },
        logComponentLoaded: function () {
          this.sendMetricObjectOnce({ source: 'components', action: 'loaded', version: r.ll }, 1);
        },
        logComponentUsed: function (e) {
          this.sendMetricObjectOnce({ source: e, action: 'used', version: r.ll }, 1);
        }
      };
      var f = '__awsuiMetadata__';
      function d(e) {
        var t = (0, i.useRef)(null);
        return (
          (function (e) {
            (0, i.useEffect)(function () {
              c.sendMetricOnce('awsui-viewport-width', window.innerWidth || 0),
                c.sendMetricOnce('awsui-viewport-height', window.innerHeight || 0),
                c.logComponentLoaded(),
                c.logComponentUsed(e.toLowerCase());
            }, []);
          })(e),
          (function (e, t) {
            (0, i.useEffect)(
              function () {
                if (t.current && !Object.prototype.hasOwnProperty.call(t.current, f)) {
                  var n = t.current,
                    i = { name: e, version: r.ll };
                  Object.freeze(i), Object.defineProperty(n, f, { value: i, writable: !1 });
                }
              },
              [t.current]
            );
          })(e, t),
          { __internalRootRef: t }
        );
      }
    },
    6066: function (e, t, n) {
      'use strict';
      n.d(t, {
        q: function () {
          return a;
        }
      });
      var i = n(1738),
        r = n(857),
        o = n(2391);
      function a(e, t, n, a) {
        var l = a.componentName,
          u = a.changeHandler,
          c = a.controlledProp,
          f = i.useState(void 0 !== e)[0];
        r.y &&
          (i.useEffect(
            function () {
              f &&
                void 0 === t &&
                (0, o.O)(
                  l,
                  'You provided a `'
                    .concat(c, '` prop without an `')
                    .concat(u, '` handler. This will render a non-interactive component.')
                );
            },
            [t, f, l, u, c]
          ),
          i.useEffect(
            function () {
              var t = void 0 !== e;
              if (f !== t) {
                var n = f ? 'controlled' : 'uncontrolled',
                  i = t ? 'controlled' : 'uncontrolled';
                (0, o.O)(
                  l,
                  'A component tried to change '
                    .concat(n, " '")
                    .concat(c, "' property to be ")
                    .concat(i, '. ') +
                    'This is not supported. Properties should not switch from '
                      .concat(n, ' to ')
                      .concat(i, ' (or vice versa). ') +
                    'Decide between using a controlled or uncontrolled mode for the lifetime of the component. More info: https://fb.me/react-controlled-components'
                );
              }
            },
            [f, c, l, e]
          ));
        var d = i.useState(n),
          h = d[0],
          p = d[1],
          v = i.useState(!1),
          _ = v[0],
          m = v[1],
          g = _ ? h : n,
          w = i.useCallback(
            function (e) {
              p(e), m(!0);
            },
            [p, m]
          );
        return f ? [e, s] : [g, w];
      }
      function s() {}
    },
    6270: function (e, t, n) {
      'use strict';
      n.d(t, {
        G: function () {
          return r;
        }
      });
      var i = n(1738);
      function r(e, t) {
        var n = (0, i.useRef)(!0);
        (0, i.useEffect)(function () {
          if (!n.current) return e();
          n.current = !1;
        }, t);
      }
    },
    2384: function (e, t, n) {
      'use strict';
      n.d(t, {
        q: function () {
          return r;
        }
      });
      var i = n(1738);
      function r() {
        for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
        return (0, i.useMemo)(function () {
          return e.every(function (e) {
            return null === e || void 0 === e;
          })
            ? null
            : function (t) {
                e.forEach(function (e) {
                  'function' === typeof e ? e(t) : null !== e && void 0 !== e && (e.current = t);
                });
              };
        }, e);
      }
    },
    6208: function (e, t, n) {
      'use strict';
      n.d(t, {
        X: function () {
          return o;
        }
      });
      var i = n(7520);
      function r() {
        return window.matchMedia
          ? window.matchMedia('(max-width: '.concat(i.Il, 'px)')).matches
          : 'xs' !== (0, i.zm)(window.innerWidth, ['xs']);
      }
      var o = (0, n(8929).M)({
        initialState: function () {
          return r();
        },
        factory: function (e) {
          var t = function () {
            return e(r());
          };
          return (
            window.addEventListener('resize', t),
            function () {
              window.removeEventListener('resize', t);
            }
          );
        }
      });
    },
    2473: function (e, t, n) {
      'use strict';
      n.d(t, {
        I: function () {
          return a;
        }
      });
      var i = n(1738),
        r = n(6656),
        o = (0, n(8929)._)(function (e) {
          var t = new MutationObserver(function () {
            return e();
          });
          return (
            t.observe(document.body, { attributes: !0, subtree: !0 }),
            function () {
              return t.disconnect();
            }
          );
        });
      function a(e, t) {
        var n = (0, r.S)(function () {
          e.current && t(e.current);
        });
        o(n),
          (0, i.useEffect)(
            function () {
              n();
            },
            [n]
          );
      }
    },
    4125: function (e, t, n) {
      'use strict';
      n.d(t, {
        g: function () {
          return a;
        }
      });
      var i = n(7069),
        r = n(5511),
        o = n(2319);
      function a(e) {
        var t,
          n = (0, o.DY)(e),
          a = (0, o.v6)(e),
          s = (0, r.r)(e),
          l = (0, o.LV)(e);
        return (0, i.Z)(
          (((t = {
            'awsui-polaris-dark-mode awsui-dark-mode': 'dark' === n,
            'awsui-polaris-compact-mode awsui-compact-mode': 'compact' === a,
            'awsui-visual-refresh': l
          })['awsui-context-'.concat(s)] = s),
          t)
        );
      }
    },
    4935: function (e, t, n) {
      'use strict';
      n.d(t, {
        D: function () {
          return r;
        }
      });
      var i = n(1738),
        r = function (e) {
          var t = (0, i.useRef)();
          return (
            (0, i.useEffect)(function () {
              t.current = e;
            }),
            t.current
          );
        };
    },
    8929: function (e, t, n) {
      'use strict';
      n.d(t, {
        M: function () {
          return a;
        },
        _: function () {
          return o;
        }
      });
      var i = n(1738),
        r = n(3489);
      function o(e) {
        var t,
          n = [],
          o = function (e) {
            (0, r.unstable_batchedUpdates)(function () {
              for (var t = 0, i = n; t < i.length; t++) {
                (0, i[t])(e);
              }
            });
          };
        return function (r) {
          (0, i.useEffect)(function () {
            return (
              0 === n.length && (t = e(o)),
              n.push(r),
              function () {
                n.splice(n.indexOf(r), 1), 0 === n.length && (t(), (t = void 0));
              }
            );
          }, []);
        };
      }
      function a(e) {
        var t = e.factory,
          n = e.initialState,
          r = o(t),
          a = n;
        return function () {
          var e = (0, i.useState)(a),
            t = e[0],
            n = e[1];
          return (
            r(function (e) {
              (a = e), n(e);
            }),
            t
          );
        };
      }
    },
    6656: function (e, t, n) {
      'use strict';
      n.d(t, {
        S: function () {
          return r;
        }
      });
      var i = n(1738);
      function r(e) {
        var t = (0, i.useRef)();
        return (
          (0, i.useEffect)(function () {
            t.current = e;
          }),
          (0, i.useCallback)(function () {
            for (var e, n = [], i = 0; i < arguments.length; i++) n[i] = arguments[i];
            return null === (e = t.current) || void 0 === e ? void 0 : e.apply(void 0, n);
          }, [])
        );
      }
    },
    3366: function (e, t, n) {
      'use strict';
      n.d(t, {
        L: function () {
          return a;
        },
        l: function () {
          return o;
        }
      });
      var i = n(1738),
        r = 0;
      function o(e) {
        return ''
          .concat(e || '')
          .concat(r++, '-')
          .concat(Date.now(), '-')
          .concat(Math.round(1e4 * Math.random()));
      }
      function a(e) {
        var t = (0, i.useRef)(null);
        return t.current || (t.current = o(e)), t.current;
      }
    },
    2319: function (e, t, n) {
      'use strict';
      n.d(t, {
        DY: function () {
          return l;
        },
        JZ: function () {
          return f;
        },
        LV: function () {
          return c;
        },
        v6: function () {
          return u;
        }
      });
      var i = n(1738),
        r = n(1046),
        o = n(5450),
        a = n(1265),
        s = n(2473);
      function l(e) {
        var t = (0, i.useState)('light'),
          n = t[0],
          r = t[1];
        return (
          (0, s.I)(e, function (e) {
            var t = (0, a.jX)(e, function (e) {
              return (
                e.classList.contains('awsui-polaris-dark-mode') || e.classList.contains('awsui-dark-mode')
              );
            });
            r(t ? 'dark' : 'light');
          }),
          n
        );
      }
      function u(e) {
        var t = (0, i.useState)('comfortable'),
          n = t[0],
          r = t[1];
        return (
          (0, s.I)(e, function (e) {
            var t = (0, a.jX)(e, function (e) {
              return (
                e.classList.contains('awsui-polaris-compact-mode') ||
                e.classList.contains('awsui-compact-mode')
              );
            });
            r(t ? 'compact' : 'comfortable');
          }),
          n
        );
      }
      function c(e) {
        var t = (0, i.useState)(Boolean(r.Jp)),
          n = t[0],
          o = t[1];
        return (
          (0, s.I)(e, function (e) {
            var t, n;
            if (
              (null === (n = null === (t = window.CSS) || void 0 === t ? void 0 : t.supports) || void 0 === n
                ? void 0
                : n.call(t, 'color', 'var(--test-var)')) &&
              !r.Jp
            ) {
              var i = (0, a.jX)(e, function (e) {
                return e.classList.contains('awsui-visual-refresh');
              });
              o(!!i);
            }
          }),
          n
        );
      }
      function f(e) {
        var t = (0, i.useState)(!1),
          n = t[0],
          r = t[1];
        return (
          (0, s.I)(e, function (e) {
            r((0, o.g)(e));
          }),
          n
        );
      }
    },
    857: function (e, t, n) {
      'use strict';
      n.d(t, {
        y: function () {
          return i;
        }
      });
      var i = !1;
    },
    7906: function (e, t, n) {
      'use strict';
      var i;
      n.d(t, {
        V: function () {
          return i;
        }
      }),
        (function (e) {
          (e[(e.pageUp = 33)] = 'pageUp'),
            (e[(e.pageDown = 34)] = 'pageDown'),
            (e[(e.end = 35)] = 'end'),
            (e[(e.home = 36)] = 'home'),
            (e[(e.backspace = 8)] = 'backspace'),
            (e[(e.space = 32)] = 'space'),
            (e[(e.down = 40)] = 'down'),
            (e[(e.left = 37)] = 'left'),
            (e[(e.right = 39)] = 'right'),
            (e[(e.up = 38)] = 'up'),
            (e[(e.escape = 27)] = 'escape'),
            (e[(e.enter = 13)] = 'enter'),
            (e[(e.tab = 9)] = 'tab'),
            (e[(e.shift = 16)] = 'shift'),
            (e[(e.control = 17)] = 'control'),
            (e[(e.alt = 18)] = 'alt'),
            (e[(e.meta = 91)] = 'meta');
        })(i || (i = {}));
    },
    2391: function (e, t, n) {
      'use strict';
      n.d(t, {
        O: function () {
          return o;
        }
      });
      var i = n(857),
        r = {};
      function o(e, t) {
        if (i.y) {
          var n = '[AwsUi] ['.concat(e, '] ').concat(t);
          r[n] || ((r[n] = !0), console.warn(n));
        }
      }
    },
    5450: function (e, t, n) {
      'use strict';
      n.d(t, {
        g: function () {
          return r;
        }
      });
      var i = n(1265),
        r = function (e) {
          var t;
          return (
            !!(0, i.jX)(e, function (e) {
              return e.classList.contains('awsui-motion-disabled');
            }) ||
            (window.matchMedia &&
              (null === (t = window.matchMedia('(prefers-reduced-motion: reduce)')) || void 0 === t
                ? void 0
                : t.matches))
          );
        };
    },
    6430: function (e, t, n) {
      'use strict';
      function i(e, t) {
        e.displayName = t;
      }
      n.d(t, {
        b: function () {
          return i;
        }
      });
    },
    1316: function (e, t, n) {
      'use strict';
      function i(e) {
        var t = void 0;
        return function () {
          return void 0 === t && (t = e()), t;
        };
      }
      n.d(t, {
        k: function () {
          return i;
        }
      });
    },
    9810: function (e, t, n) {
      'use strict';
      n.d(t, {
        J: function () {
          return o;
        }
      });
      var i = n(2391),
        r = ['javascript:void(0)', 'javascript:void(0);', 'javascript:;'];
      function o(e, t) {
        if (t && -1 === r.indexOf(t.toLowerCase())) {
          var n;
          try {
            n = new URL(t);
          } catch (o) {
            return;
          }
          if ('javascript:' === n.protocol)
            throw (
              ((0, i.O)(
                e,
                'A javascript: URL was blocked as a security precaution. The URL was "'.concat(t, '".')
              ),
              new Error('A javascript: URL was blocked as a security precaution.'))
            );
        }
      }
    },
    1265: function (e, t, n) {
      'use strict';
      n.d(t, {
        bE: function () {
          return s;
        },
        eN: function () {
          return r;
        },
        gQ: function () {
          return a;
        },
        jX: function () {
          return i;
        },
        sj: function () {
          return l;
        }
      });
      n(704);
      function i(e, t) {
        for (var n = e; n && !t(n); )
          for (n = n.parentElement; n && !(n instanceof HTMLElement); ) n = n.parentElement;
        return n;
      }
      function r() {
        var e, t, n;
        return (
          null !==
            (n =
              null === (t = null === (e = window.CSS) || void 0 === e ? void 0 : e.supports) || void 0 === t
                ? void 0
                : t.call(e, 'position', 'sticky')) &&
          void 0 !== n &&
          n
        );
      }
      var o = (0, n(1316).k)(function () {
        var e = document.createElement('div');
        (e.style.transform = 'translateY(5px)'), document.body.appendChild(e);
        var t = document.createElement('div');
        (t.style.position = 'fixed'), (t.style.top = '0'), e.appendChild(t);
        var n = e.getBoundingClientRect().top === t.getBoundingClientRect().top;
        return document.body.removeChild(e), n;
      });
      function a(e) {
        return e.parentElement && o()
          ? i(e.parentElement, function (e) {
              var t = getComputedStyle(e);
              return (
                (!!t.transform && 'none' !== t.transform) || (!!t.perspective && 'none' !== t.perspective)
              );
            })
          : null;
      }
      function s(e, t) {
        if (!e || !t) return !1;
        if (e.contains && t.nodeType === Node.ELEMENT_NODE) return e === t || e.contains(t);
        for (var n = t; n && e !== n; ) n = n.parentNode;
        return n === e;
      }
      function l(e, t) {
        return null !== e && (e === t || e.contains(t));
      }
    },
    2555: function (e, t, n) {
      'use strict';
      n.d(t, {
        Et: function () {
          return i;
        },
        JP: function () {
          return o;
        },
        YA: function () {
          return r;
        }
      });
      var i = function (e) {
          for (var t = [], n = e; (n = n.parentElement) && n !== document.body; )
            'visible' !== getComputedStyle(n).overflow && t.push(n);
          return t;
        },
        r = function (e, t, n, r) {
          void 0 === t && (t = !1), void 0 === n && (n = !1), void 0 === r && (r = !1);
          var o = n
            ? []
            : i(e).map(function (e) {
                var t = e.getBoundingClientRect(),
                  n = t.height,
                  i = t.width,
                  o = t.top,
                  a = t.left;
                return { height: r ? e.scrollHeight : n, width: i, top: o, left: a };
              });
          if (r && !n) {
            var a = document.documentElement.getBoundingClientRect();
            o.push({
              width: Math.max(a.width, document.documentElement.clientWidth),
              height: Math.max(a.height, document.documentElement.clientHeight),
              top: a.top,
              left: a.left
            });
          } else o.push({ height: window.innerHeight, width: window.innerWidth, top: 0, left: 0 });
          return t && !n && o.shift(), o;
        };
      function o(e) {
        var t,
          n = null !== (t = e.offsetParent) && void 0 !== t ? t : document.documentElement;
        e.offsetTop < n.scrollTop && (n.scrollTop = e.offsetTop),
          e.offsetTop + e.clientHeight > n.scrollTop + n.clientHeight &&
            (n.scrollTop = e.offsetTop + e.clientHeight - n.clientHeight);
      }
    },
    1646: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return w;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(7069),
        a = n(789),
        s =
          (n(3639),
          {
            link: 'awsui_link_4c84z_1o5jy_93',
            'variant-secondary': 'awsui_variant-secondary_4c84z_1o5jy_138',
            'variant-primary': 'awsui_variant-primary_4c84z_1o5jy_173',
            'variant-info': 'awsui_variant-info_4c84z_1o5jy_208',
            'variant-value-large': 'awsui_variant-value-large_4c84z_1o5jy_243',
            'variant-top-navigation': 'awsui_variant-top-navigation_4c84z_1o5jy_277',
            'variant-recovery': 'awsui_variant-recovery_4c84z_1o5jy_312',
            button: 'awsui_button_4c84z_1o5jy_347',
            'color-inverted': 'awsui_color-inverted_4c84z_1o5jy_382',
            'font-size-body-s': 'awsui_font-size-body-s_4c84z_1o5jy_401',
            'font-size-body-m': 'awsui_font-size-body-m_4c84z_1o5jy_406',
            'font-size-heading-xs': 'awsui_font-size-heading-xs_4c84z_1o5jy_410',
            'font-size-heading-s': 'awsui_font-size-heading-s_4c84z_1o5jy_414',
            'font-size-heading-m': 'awsui_font-size-heading-m_4c84z_1o5jy_419',
            'font-size-heading-l': 'awsui_font-size-heading-l_4c84z_1o5jy_424',
            'font-size-heading-xl': 'awsui_font-size-heading-xl_4c84z_1o5jy_429',
            'font-size-display-l': 'awsui_font-size-display-l_4c84z_1o5jy_434',
            icon: 'awsui_icon_4c84z_1o5jy_440'
          }),
        l = n(3090),
        u = n(286),
        c = n(7579),
        f = n(7740),
        d = n(7906),
        h = n(2384),
        p = n(2319),
        v = n(9810);
      function _(e) {
        return 'variant-'.concat(e.replace(/^awsui-/, ''));
      }
      function m(e, t) {
        switch (e) {
          case 'info':
            return 'font-size-body-s';
          case 'awsui-value-large':
            return 'font-size-display-l';
          default:
            return 'font-size-'.concat(t);
        }
      }
      function g(e, t) {
        return 'color-'.concat('info' === e ? 'normal' : t);
      }
      var w = r.forwardRef(function (e, t) {
        var n = e.variant,
          w = void 0 === n ? 'secondary' : n,
          y = e.fontSize,
          b = void 0 === y ? 'body-m' : y,
          x = e.color,
          E = void 0 === x ? 'normal' : x,
          k = e.external,
          C = void 0 !== k && k,
          S = e.target,
          N = e.href,
          j = e.rel,
          z = e.ariaLabel,
          O = e.externalIconAriaLabel,
          T = e.onFollow,
          R = e.children,
          B = e.__internalRootRef,
          A = void 0 === B ? null : B,
          L = (0, i._T)(e, [
            'variant',
            'fontSize',
            'color',
            'external',
            'target',
            'href',
            'rel',
            'ariaLabel',
            'externalIconAriaLabel',
            'onFollow',
            'children',
            '__internalRootRef'
          ]);
        (0, v.J)('Link', N);
        var P = !N,
          Z = ['top-navigation', 'link', 'recovery'].indexOf(w) > -1,
          M = (0, l.Z)(),
          I = (0, u.j)(L),
          H = null !== S && void 0 !== S ? S : C ? '_blank' : void 0,
          D = null !== j && void 0 !== j ? j : '_blank' === H ? 'noopener noreferrer' : void 0,
          U = function (e) {
            (0, c.y1)(T, { href: N, external: C, target: H }, e);
          },
          q = (0, r.useRef)(null),
          F = (0, p.LV)(q);
        (0, f.Z)(t, q);
        var W = P && F && !Z,
          V = (0, i.pi)((0, i.pi)((0, i.pi)({}, M), I), {
            ref: (0, h.q)(q, A),
            className: (0, o.Z)(s.link, I.className, W ? s.button : null, s[_(w)], s[m(w, b)], s[g(w, E)]),
            'aria-label': z
          }),
          G = r.createElement(
            r.Fragment,
            null,
            R,
            C &&
              r.createElement(
                r.Fragment,
                null,
                ' ',
                r.createElement(
                  'span',
                  { className: s.icon, 'aria-label': O, role: O ? 'img' : void 0 },
                  r.createElement(a.Z, { name: 'external', size: 'inherit' })
                )
              )
          );
        return P
          ? r.createElement(
              'a',
              (0, i.pi)({}, V, {
                role: 'button',
                tabIndex: 0,
                onKeyDown: function (e) {
                  (e.keyCode !== d.V.space && e.keyCode !== d.V.enter) || (e.preventDefault(), U(e));
                },
                onClick: function (e) {
                  U(e);
                }
              }),
              G
            )
          : r.createElement(
              'a',
              (0, i.pi)({}, V, {
                target: H,
                rel: D,
                href: N,
                onClick: function (e) {
                  (0, c.p_)(e) && U(e);
                }
              }),
              G
            );
      });
    },
    3: function (e, t, n) {
      'use strict';
      var i = n(1738),
        r = n(7069),
        o = n(6766),
        a = function (e) {
          return i.createElement(
            'div',
            { className: (0, r.Z)(o.Z.arrow, e.position && o.Z['arrow-position-'.concat(e.position)]) },
            i.createElement('div', { className: o.Z['arrow-outer'] }),
            i.createElement('div', { className: o.Z['arrow-inner'] })
          );
        };
      t.Z = i.memo(a);
    },
    8742: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return c;
        }
      });
      var i = n(1738),
        r = n(7069),
        o = n(2086),
        a = n(7906),
        s = n(3366),
        l = n(7472),
        u = n(6766);
      function c(e) {
        var t,
          n,
          c = e.size,
          f = e.fixedWidth,
          d = e.dismissButton,
          h = e.dismissAriaLabel,
          p = e.header,
          v = e.children,
          _ = e.onDismiss,
          m = e.variant,
          g = e.returnFocus,
          w = void 0 === g || g,
          y = e.overflowVisible,
          b = e.dismissButtonRef,
          x = e.className,
          E = (0, s.L)('awsui-popover-'),
          k = (0, i.useCallback)(
            function (e) {
              e.keyCode === a.V.escape && _();
            },
            [_]
          ),
          C =
            (null !== d && void 0 !== d ? d : null) &&
            i.createElement(
              'div',
              { className: u.Z.dismiss },
              i.createElement(l.l, {
                variant: 'icon',
                formAction: 'none',
                iconName: 'close',
                className: u.Z['dismiss-control'],
                ariaLabel: h,
                onClick: function () {
                  return _();
                },
                ref: b
              })
            );
        return i.createElement(
          'div',
          {
            className: (0, r.Z)(
              u.Z.body,
              x,
              u.Z['body-size-'.concat(c)],
              ((t = {}),
              (t[u.Z['fixed-width']] = f),
              (t[u.Z['variant-'.concat(m)]] = m),
              (t[u.Z['body-overflow-visible']] = 'both' === y),
              t)
            ),
            role: p ? 'dialog' : void 0,
            onKeyDown: k,
            'aria-modal': !(!d || 'annotation' === m) || void 0,
            'aria-labelledby': p ? E : void 0
          },
          i.createElement(
            o.ZP,
            { disabled: 'annotation' === m || !d, autoFocus: !0, returnFocus: w },
            p &&
              i.createElement(
                'div',
                { className: (0, r.Z)(u.Z['header-row'], d && u.Z['has-dismiss']) },
                C,
                i.createElement('div', { className: u.Z.header, id: E }, i.createElement('h2', null, p))
              ),
            i.createElement(
              'div',
              { className: !p && d ? u.Z['has-dismiss'] : void 0 },
              !p && C,
              i.createElement(
                'div',
                {
                  className: (0, r.Z)(u.Z.content, ((n = {}), (n[u.Z['content-overflow-visible']] = !!y), n))
                },
                v
              )
            )
          )
        );
      }
    },
    9258: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return _;
        }
      });
      var i = n(4997),
        r = n(1738),
        o = n(7069),
        a = n(1265),
        s = n(6918),
        l = {
          top: [
            'top-center',
            'bottom-center',
            'right-top',
            'right-bottom',
            'left-top',
            'left-bottom',
            'top-right',
            'top-left',
            'bottom-right',
            'bottom-left'
          ],
          bottom: [
            'bottom-center',
            'top-center',
            'right-top',
            'right-bottom',
            'left-top',
            'left-bottom',
            'bottom-right',
            'bottom-left',
            'top-right',
            'top-left'
          ],
          left: [
            'left-top',
            'left-bottom',
            'right-top',
            'right-bottom',
            'bottom-center',
            'top-center',
            'bottom-left',
            'top-left',
            'bottom-right',
            'top-right'
          ],
          right: [
            'right-top',
            'right-bottom',
            'left-top',
            'left-bottom',
            'bottom-center',
            'top-center',
            'bottom-right',
            'top-right',
            'bottom-left',
            'top-left'
          ]
        },
        u = {
          'top-center': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top - t.height - i.height,
              left: n.left + n.width / 2 - t.width / 2,
              width: t.width,
              height: t.height
            };
          },
          'top-right': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return { top: n.top - t.height - i.height, left: n.left, width: t.width, height: t.height };
          },
          'top-left': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top - t.height - i.height,
              left: n.left + n.width - t.width,
              width: t.width,
              height: t.height
            };
          },
          'bottom-center': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height + i.height,
              left: n.left + n.width / 2 - t.width / 2,
              width: t.width,
              height: t.height
            };
          },
          'bottom-right': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return { top: n.top + n.height + i.height, left: n.left, width: t.width, height: t.height };
          },
          'bottom-left': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height + i.height,
              left: n.left + n.width - t.width,
              width: t.width,
              height: t.height
            };
          },
          'right-top': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height / 2 - 12 - i.height,
              left: n.left + n.width + i.height,
              width: t.width,
              height: t.height
            };
          },
          'right-bottom': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height / 2 - t.height + 12 + i.height,
              left: n.left + n.width + i.height,
              width: t.width,
              height: t.height
            };
          },
          'left-top': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height / 2 - 12 - i.height,
              left: n.left - t.width - i.height,
              width: t.width,
              height: t.height
            };
          },
          'left-bottom': function (e) {
            var t = e.body,
              n = e.trigger,
              i = e.arrow;
            return {
              top: n.top + n.height / 2 - t.height + 12 + i.height,
              left: n.left - t.width - i.height,
              width: t.width,
              height: t.height
            };
          }
        };
      function c(e, t) {
        return (
          e.left >= t.left &&
          e.top >= t.top &&
          e.left + e.width <= t.left + t.width &&
          e.top + e.height <= t.top + t.height
        );
      }
      function f(e) {
        for (var t = null, n = 0, i = e; n < i.length; n++) {
          var r = i[n];
          if (t) {
            var o = Math.max(t.left, r.left),
              a = Math.max(t.top, r.top),
              s = Math.min(t.left + t.width, r.left + r.width),
              l = Math.min(t.top + t.height, r.top + r.height);
            if (s < o || l < a) return null;
            t = { left: o, top: a, width: s - o, height: l - a };
          } else t = r;
        }
        return t && t.height * t.width;
      }
      var d = n(6766),
        h = n(2319),
        p = n(2384),
        v = { position: 'absolute', top: -9999, left: -9999 };
      function _(e) {
        var t = e.position,
          n = e.trackRef,
          _ = e.trackKey,
          g = e.arrow,
          w = e.children,
          y = e.zIndex,
          b = e.renderWithPortal,
          x = (0, s.D)(function (e, t) {
            var n = Math.round(e.width),
              i = Math.round(e.height);
            return (null === t || void 0 === t ? void 0 : t.width) === n &&
              (null === t || void 0 === t ? void 0 : t.height) === i
              ? t
              : e;
          }),
          E = x[0],
          k = x[1],
          C = (0, r.useRef)(null),
          S = (0, r.useRef)(null),
          N = (0, r.useState)(v),
          j = N[0],
          z = N[1],
          O = (0, r.useState)(null),
          T = O[0],
          R = O[1],
          B = (0, h.LV)(k),
          A = (0, r.useRef)(function () {}),
          L = (0, r.useCallback)(
            function () {
              if (n.current && k.current && C.current && S.current) {
                var e = C.current,
                  i = S.current,
                  r = k.current.ownerDocument,
                  o = n.current;
                if (0 !== e.offsetWidth && 0 !== e.offsetHeight && (0, a.bE)(r.body, o)) {
                  var s = e.style.top,
                    d = e.style.left;
                  (e.style.top = '0'), (e.style.left = '0');
                  var h = (function (e) {
                      return { top: 0, left: 0, width: e.innerWidth, height: e.innerHeight };
                    })(r.defaultView),
                    p = o.getBoundingClientRect(),
                    v = {
                      width: parseFloat(getComputedStyle(i).width),
                      height: parseFloat(getComputedStyle(i).height)
                    },
                    _ = (0, a.gQ)(e),
                    g = _ ? _.getBoundingClientRect() : h,
                    w = e.getBoundingClientRect(),
                    y = { top: w.top, left: w.left, width: Math.ceil(w.width), height: Math.ceil(w.height) },
                    x = (function (e, t, n, i, r, o, a) {
                      for (var s = null, d = 0, h = 0, p = l[e]; h < p.length; h++) {
                        var v = p[h],
                          _ = u[v]({ body: i, trigger: t, arrow: n }),
                          m = a || c(_, r),
                          g = c(_, o);
                        if (m && g) return { internalPosition: v, boundingOffset: _ };
                        var w = [_, o];
                        a || w.push(r);
                        var y = f(w);
                        y && y > d && ((s = { internalPosition: v, boundingOffset: _ }), (d = y));
                      }
                      return null !== s
                        ? s
                        : {
                            internalPosition: 'right-top',
                            boundingOffset: u['right-top']({ body: i, trigger: t, arrow: n })
                          };
                    })(
                      t,
                      p,
                      v,
                      y,
                      _
                        ? g
                        : (function (e) {
                            var t = e.documentElement.getBoundingClientRect(),
                              n = t.top,
                              i = t.left;
                            return {
                              top: n,
                              left: i,
                              width: e.documentElement.scrollWidth,
                              height: e.documentElement.scrollHeight
                            };
                          })(r),
                      h,
                      b
                    ),
                    E = x.internalPosition,
                    N = m(x.boundingOffset, g),
                    j = m(N, m(p, g));
                  (e.style.top = s),
                    (e.style.left = d),
                    R(E),
                    z({ top: N.top, left: N.left }),
                    (A.current = function () {
                      var e = m(o.getBoundingClientRect(), _ ? _.getBoundingClientRect() : h);
                      z({ top: e.top + j.top, left: e.left + j.left });
                    });
                }
              }
            },
            [t, n, k, b]
          );
        (0, r.useLayoutEffect)(
          function () {
            L();
          },
          [L, _, E]
        ),
          (0, r.useLayoutEffect)(
            function () {
              var e = function () {
                  return requestAnimationFrame(function () {
                    return L();
                  });
                },
                t = function () {
                  return requestAnimationFrame(function () {
                    return A.current();
                  });
                };
              return (
                window.addEventListener('click', e),
                window.addEventListener('resize', e),
                window.addEventListener('scroll', t, !0),
                function () {
                  window.removeEventListener('click', e),
                    window.removeEventListener('resize', e),
                    window.removeEventListener('scroll', t, !0);
                }
              );
            },
            [L]
          );
        var P = (0, p.q)(C, k);
        return r.createElement(
          'div',
          {
            ref: P,
            style: (0, i.pi)((0, i.pi)({}, j), { zIndex: y }),
            className: (0, o.Z)(d.Z.container, B && d.Z.refresh)
          },
          r.createElement(
            'div',
            {
              ref: S,
              className: (0, o.Z)(d.Z['container-arrow'], d.Z['container-arrow-position-'.concat(T)]),
              'aria-hidden': !0
            },
            g(T)
          ),
          w
        );
      }
      function m(e, t) {
        return { top: e.top - t.top, left: e.left - t.left };
      }
    },
    6766: function (e, t, n) {
      'use strict';
      n(9208);
      t.Z = {
        arrow: 'awsui_arrow_xjuzf_jcb5h_185',
        'arrow-outer': 'awsui_arrow-outer_xjuzf_jcb5h_189',
        'arrow-inner': 'awsui_arrow-inner_xjuzf_jcb5h_189',
        'arrow-position-right-top': 'awsui_arrow-position-right-top_xjuzf_jcb5h_220',
        'arrow-position-right-bottom': 'awsui_arrow-position-right-bottom_xjuzf_jcb5h_220',
        'arrow-position-left-top': 'awsui_arrow-position-left-top_xjuzf_jcb5h_223',
        'arrow-position-left-bottom': 'awsui_arrow-position-left-bottom_xjuzf_jcb5h_223',
        'arrow-position-top-center': 'awsui_arrow-position-top-center_xjuzf_jcb5h_226',
        'arrow-position-top-right': 'awsui_arrow-position-top-right_xjuzf_jcb5h_226',
        'arrow-position-top-left': 'awsui_arrow-position-top-left_xjuzf_jcb5h_226',
        'arrow-position-top-responsive': 'awsui_arrow-position-top-responsive_xjuzf_jcb5h_226',
        'arrow-position-bottom-center': 'awsui_arrow-position-bottom-center_xjuzf_jcb5h_229',
        'arrow-position-bottom-right': 'awsui_arrow-position-bottom-right_xjuzf_jcb5h_229',
        'arrow-position-bottom-left': 'awsui_arrow-position-bottom-left_xjuzf_jcb5h_229',
        'arrow-position-bottom-responsive': 'awsui_arrow-position-bottom-responsive_xjuzf_jcb5h_229',
        body: 'awsui_body_xjuzf_jcb5h_325',
        'body-overflow-visible': 'awsui_body-overflow-visible_xjuzf_jcb5h_344',
        'variant-annotation': 'awsui_variant-annotation_xjuzf_jcb5h_348',
        'body-size-small': 'awsui_body-size-small_xjuzf_jcb5h_353',
        'fixed-width': 'awsui_fixed-width_xjuzf_jcb5h_356',
        'body-size-medium': 'awsui_body-size-medium_xjuzf_jcb5h_360',
        'body-size-large': 'awsui_body-size-large_xjuzf_jcb5h_367',
        'has-dismiss': 'awsui_has-dismiss_xjuzf_jcb5h_374',
        dismiss: 'awsui_dismiss_xjuzf_jcb5h_379',
        'dismiss-control': 'awsui_dismiss-control_xjuzf_jcb5h_386',
        'header-row': 'awsui_header-row_xjuzf_jcb5h_390',
        header: 'awsui_header_xjuzf_jcb5h_390',
        content: 'awsui_content_xjuzf_jcb5h_412',
        'content-overflow-visible': 'awsui_content-overflow-visible_xjuzf_jcb5h_419',
        container: 'awsui_container_xjuzf_jcb5h_431',
        'container-arrow': 'awsui_container-arrow_xjuzf_jcb5h_439',
        'container-arrow-position-right-top': 'awsui_container-arrow-position-right-top_xjuzf_jcb5h_443',
        'container-arrow-position-right-bottom':
          'awsui_container-arrow-position-right-bottom_xjuzf_jcb5h_443',
        'container-arrow-position-left-top': 'awsui_container-arrow-position-left-top_xjuzf_jcb5h_455',
        'container-arrow-position-left-bottom': 'awsui_container-arrow-position-left-bottom_xjuzf_jcb5h_455',
        'container-arrow-position-top-center': 'awsui_container-arrow-position-top-center_xjuzf_jcb5h_467',
        'container-arrow-position-top-right': 'awsui_container-arrow-position-top-right_xjuzf_jcb5h_467',
        'container-arrow-position-top-left': 'awsui_container-arrow-position-top-left_xjuzf_jcb5h_467',
        'container-arrow-position-top-responsive':
          'awsui_container-arrow-position-top-responsive_xjuzf_jcb5h_467',
        'container-arrow-position-bottom-center':
          'awsui_container-arrow-position-bottom-center_xjuzf_jcb5h_483',
        'container-arrow-position-bottom-right':
          'awsui_container-arrow-position-bottom-right_xjuzf_jcb5h_487',
        'container-arrow-position-bottom-left': 'awsui_container-arrow-position-bottom-left_xjuzf_jcb5h_491',
        'awsui-motion-fade-in': 'awsui_awsui-motion-fade-in_xjuzf_jcb5h_1',
        refresh: 'awsui_refresh_xjuzf_jcb5h_609',
        root: 'awsui_root_xjuzf_jcb5h_631',
        trigger: 'awsui_trigger_xjuzf_jcb5h_643',
        'trigger-type-text': 'awsui_trigger-type-text_xjuzf_jcb5h_650',
        'trigger-inner-text': 'awsui_trigger-inner-text_xjuzf_jcb5h_679'
      };
    },
    745: function (e, t, n) {
      'use strict';
      n.d(t, {
        Z: function () {
          return l;
        }
      });
      var i = n(4997),
        r = n(7069),
        o = n(1738),
        a = n(286),
        s =
          (n(1545),
          {
            root: 'awsui_root_1612d_9hw1o_127',
            'spinner-rotator': 'awsui_spinner-rotator_1612d_9hw1o_1',
            'size-normal': 'awsui_size-normal_1612d_9hw1o_135',
            'size-big': 'awsui_size-big_1612d_9hw1o_143',
            'size-large': 'awsui_size-large_1612d_9hw1o_151',
            'variant-normal': 'awsui_variant-normal_1612d_9hw1o_159',
            'variant-disabled': 'awsui_variant-disabled_1612d_9hw1o_162',
            'variant-inverted': 'awsui_variant-inverted_1612d_9hw1o_165',
            circle: 'awsui_circle_1612d_9hw1o_169',
            'circle-left': 'awsui_circle-left_1612d_9hw1o_193',
            'spinner-line-left': 'awsui_spinner-line-left_1612d_9hw1o_1',
            'circle-right': 'awsui_circle-right_1612d_9hw1o_198',
            'spinner-line-right': 'awsui_spinner-line-right_1612d_9hw1o_1'
          });
      function l(e) {
        var t = e.size,
          n = void 0 === t ? 'normal' : t,
          l = e.variant,
          u = void 0 === l ? 'normal' : l,
          c = e.__internalRootRef,
          f = (0, i._T)(e, ['size', 'variant', '__internalRootRef']),
          d = (0, a.j)(f);
        return o.createElement(
          'span',
          (0, i.pi)({}, d, {
            className: (0, r.Z)(d.className, s.root, s['size-'.concat(n)], s['variant-'.concat(u)]),
            ref: c
          }),
          o.createElement('span', { className: (0, r.Z)(s.circle, s['circle-left']) }),
          o.createElement('span', { className: (0, r.Z)(s.circle, s['circle-right']) })
        );
      }
    },
    7059: function (e, t, n) {
      'use strict';
      n.d(t, {
        LV: function () {
          return a;
        },
        Zl: function () {
          return i;
        },
        lX: function () {
          return o;
        },
        pV: function () {
          return r;
        }
      });
      var i = 400,
        r = 250,
        o = 40;
      function a(e) {
        return 'undefined' === typeof document
          ? 0
          : 'side' === e
          ? document.documentElement.clientWidth / 3
          : document.documentElement.clientHeight / 2;
      }
    },
    8526: function (e, t, n) {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        '/_app',
        function () {
          return n(4858);
        }
      ]);
    },
    4663: function () {},
    9101: function () {},
    7426: function () {},
    6004: function () {},
    8221: function () {},
    2304: function () {},
    9568: function () {},
    5441: function () {},
    4318: function () {},
    7722: function () {},
    3144: function () {},
    601: function () {},
    7874: function () {},
    6774: function () {},
    3950: function () {},
    9748: function () {},
    2589: function () {},
    5495: function () {},
    7318: function () {},
    1513: function () {},
    4192: function () {},
    8126: function () {},
    6366: function () {},
    9983: function () {},
    5084: function () {},
    3639: function () {},
    9208: function () {},
    9233: function () {},
    1545: function () {},
    913: function () {},
    442: function () {},
    790: function () {},
    6002: function () {},
    7007: function (e, t, n) {
      e.exports = n(1716);
    },
    2568: function (e) {
      var t,
        n,
        i = (e.exports = {});
      function r() {
        throw new Error('setTimeout has not been defined');
      }
      function o() {
        throw new Error('clearTimeout has not been defined');
      }
      function a(e) {
        if (t === setTimeout) return setTimeout(e, 0);
        if ((t === r || !t) && setTimeout) return (t = setTimeout), setTimeout(e, 0);
        try {
          return t(e, 0);
        } catch (n) {
          try {
            return t.call(null, e, 0);
          } catch (n) {
            return t.call(this, e, 0);
          }
        }
      }
      !(function () {
        try {
          t = 'function' === typeof setTimeout ? setTimeout : r;
        } catch (e) {
          t = r;
        }
        try {
          n = 'function' === typeof clearTimeout ? clearTimeout : o;
        } catch (e) {
          n = o;
        }
      })();
      var s,
        l = [],
        u = !1,
        c = -1;
      function f() {
        u && s && ((u = !1), s.length ? (l = s.concat(l)) : (c = -1), l.length && d());
      }
      function d() {
        if (!u) {
          var e = a(f);
          u = !0;
          for (var t = l.length; t; ) {
            for (s = l, l = []; ++c < t; ) s && s[c].run();
            (c = -1), (t = l.length);
          }
          (s = null),
            (u = !1),
            (function (e) {
              if (n === clearTimeout) return clearTimeout(e);
              if ((n === o || !n) && clearTimeout) return (n = clearTimeout), clearTimeout(e);
              try {
                n(e);
              } catch (t) {
                try {
                  return n.call(null, e);
                } catch (t) {
                  return n.call(this, e);
                }
              }
            })(e);
        }
      }
      function h(e, t) {
        (this.fun = e), (this.array = t);
      }
      function p() {}
      (i.nextTick = function (e) {
        var t = new Array(arguments.length - 1);
        if (arguments.length > 1) for (var n = 1; n < arguments.length; n++) t[n - 1] = arguments[n];
        l.push(new h(e, t)), 1 !== l.length || u || a(d);
      }),
        (h.prototype.run = function () {
          this.fun.apply(null, this.array);
        }),
        (i.title = 'browser'),
        (i.browser = !0),
        (i.env = {}),
        (i.argv = []),
        (i.version = ''),
        (i.versions = {}),
        (i.on = p),
        (i.addListener = p),
        (i.once = p),
        (i.off = p),
        (i.removeListener = p),
        (i.removeAllListeners = p),
        (i.emit = p),
        (i.prependListener = p),
        (i.prependOnceListener = p),
        (i.listeners = function (e) {
          return [];
        }),
        (i.binding = function (e) {
          throw new Error('process.binding is not supported');
        }),
        (i.cwd = function () {
          return '/';
        }),
        (i.chdir = function (e) {
          throw new Error('process.chdir is not supported');
        }),
        (i.umask = function () {
          return 0;
        });
    },
    2086: function (e, t, n) {
      'use strict';
      n.d(t, {
        ZP: function () {
          return Ce;
        }
      });
      var i = n(3891),
        r = n(3638),
        o = n(1738),
        a = 'data-focus-lock',
        s = 'data-focus-lock-disabled';
      function l(e, t) {
        return (function (e, t) {
          var n = (0, o.useState)(function () {
            return {
              value: e,
              callback: t,
              facade: {
                get current() {
                  return n.value;
                },
                set current(e) {
                  var t = n.value;
                  t !== e && ((n.value = e), n.callback(e, t));
                }
              }
            };
          })[0];
          return (n.callback = t), n.facade;
        })(t || null, function (t) {
          return e.forEach(function (e) {
            return (function (e, t) {
              return 'function' === typeof e ? e(t) : e && (e.current = t), e;
            })(e, t);
          });
        });
      }
      var u = {
          width: '1px',
          height: '0px',
          padding: 0,
          overflow: 'hidden',
          position: 'fixed',
          top: '1px',
          left: '1px'
        },
        c = function (e) {
          var t = e.children;
          return o.createElement(
            o.Fragment,
            null,
            o.createElement('div', {
              key: 'guard-first',
              'data-focus-guard': !0,
              'data-focus-auto-guard': !0,
              style: u
            }),
            t,
            t &&
              o.createElement('div', {
                key: 'guard-last',
                'data-focus-guard': !0,
                'data-focus-auto-guard': !0,
                style: u
              })
          );
        };
      (c.propTypes = {}), (c.defaultProps = { children: null });
      var f = n(4997);
      function d(e) {
        return e;
      }
      function h(e, t) {
        void 0 === t && (t = d);
        var n = [],
          i = !1;
        return {
          read: function () {
            if (i)
              throw new Error(
                'Sidecar: could not `read` from an `assigned` medium. `read` could be used only with `useMedium`.'
              );
            return n.length ? n[n.length - 1] : e;
          },
          useMedium: function (e) {
            var r = t(e, i);
            return (
              n.push(r),
              function () {
                n = n.filter(function (e) {
                  return e !== r;
                });
              }
            );
          },
          assignSyncMedium: function (e) {
            for (i = !0; n.length; ) {
              var t = n;
              (n = []), t.forEach(e);
            }
            n = {
              push: function (t) {
                return e(t);
              },
              filter: function () {
                return n;
              }
            };
          },
          assignMedium: function (e) {
            i = !0;
            var t = [];
            if (n.length) {
              var r = n;
              (n = []), r.forEach(e), (t = n);
            }
            var o = function () {
                var n = t;
                (t = []), n.forEach(e);
              },
              a = function () {
                return Promise.resolve().then(o);
              };
            a(),
              (n = {
                push: function (e) {
                  t.push(e), a();
                },
                filter: function (e) {
                  return (t = t.filter(e)), n;
                }
              });
          }
        };
      }
      function p(e, t) {
        return void 0 === t && (t = d), h(e, t);
      }
      var v = p({}, function (e) {
          return { target: e.target, currentTarget: e.currentTarget };
        }),
        _ = p(),
        m = p(),
        g = (function (e) {
          void 0 === e && (e = {});
          var t = h(null);
          return (t.options = (0, f.pi)({ async: !0, ssr: !1 }, e)), t;
        })({ async: !0 }),
        w = [],
        y = o.forwardRef(function (e, t) {
          var n,
            i = o.useState(),
            c = i[0],
            f = i[1],
            d = o.useRef(),
            h = o.useRef(!1),
            p = o.useRef(null),
            m = e.children,
            y = e.disabled,
            b = e.noFocusGuards,
            x = e.persistentFocus,
            E = e.crossFrame,
            k = e.autoFocus,
            C = (e.allowTextSelection, e.group),
            S = e.className,
            N = e.whiteList,
            j = e.hasPositiveIndices,
            z = e.shards,
            O = void 0 === z ? w : z,
            T = e.as,
            R = void 0 === T ? 'div' : T,
            B = e.lockProps,
            A = void 0 === B ? {} : B,
            L = e.sideCar,
            P = e.returnFocus,
            Z = e.focusOptions,
            M = e.onActivation,
            I = e.onDeactivation,
            H = o.useState({})[0],
            D = o.useCallback(
              function () {
                (p.current = p.current || (document && document.activeElement)),
                  d.current && M && M(d.current),
                  (h.current = !0);
              },
              [M]
            ),
            U = o.useCallback(
              function () {
                (h.current = !1), I && I(d.current);
              },
              [I]
            );
          (0, o.useEffect)(function () {
            y || (p.current = null);
          }, []);
          var q = o.useCallback(
              function (e) {
                var t = p.current;
                if (t && t.focus) {
                  var n = 'function' === typeof P ? P(t) : P;
                  if (n) {
                    var i = 'object' === typeof n ? n : void 0;
                    (p.current = null),
                      e
                        ? Promise.resolve().then(function () {
                            return t.focus(i);
                          })
                        : t.focus(i);
                  }
                }
              },
              [P]
            ),
            F = o.useCallback(function (e) {
              h.current && v.useMedium(e);
            }, []),
            W = _.useMedium,
            V = o.useCallback(function (e) {
              d.current !== e && ((d.current = e), f(e));
            }, []);
          var G = (0, r.Z)((((n = {})[s] = y && 'disabled'), (n[a] = C), n), A),
            K = !0 !== b,
            X = K && 'tail' !== b,
            $ = l([t, V]);
          return o.createElement(
            o.Fragment,
            null,
            K && [
              o.createElement('div', {
                key: 'guard-first',
                'data-focus-guard': !0,
                tabIndex: y ? -1 : 0,
                style: u
              }),
              j
                ? o.createElement('div', {
                    key: 'guard-nearest',
                    'data-focus-guard': !0,
                    tabIndex: y ? -1 : 1,
                    style: u
                  })
                : null
            ],
            !y &&
              o.createElement(L, {
                id: H,
                sideCar: g,
                observed: c,
                disabled: y,
                persistentFocus: x,
                crossFrame: E,
                autoFocus: k,
                whiteList: N,
                shards: O,
                onActivation: D,
                onDeactivation: U,
                returnFocus: q,
                focusOptions: Z
              }),
            o.createElement(R, (0, r.Z)({ ref: $ }, G, { className: S, onBlur: W, onFocus: F }), m),
            X && o.createElement('div', { 'data-focus-guard': !0, tabIndex: y ? -1 : 0, style: u })
          );
        });
      (y.propTypes = {}),
        (y.defaultProps = {
          children: void 0,
          disabled: !1,
          returnFocus: !1,
          focusOptions: void 0,
          noFocusGuards: !1,
          autoFocus: !0,
          persistentFocus: !1,
          crossFrame: !0,
          hasPositiveIndices: void 0,
          allowTextSelection: void 0,
          group: void 0,
          className: void 0,
          whiteList: void 0,
          shards: void 0,
          as: 'div',
          lockProps: {},
          onActivation: void 0,
          onDeactivation: void 0
        });
      var b = y,
        x = n(162),
        E = n(6082);
      var k = function (e, t) {
          return function (n) {
            var i,
              r = [];
            function a() {
              (i = e(
                r.map(function (e) {
                  return e.props;
                })
              )),
                t(i);
            }
            var s = (function (e) {
              function t() {
                return e.apply(this, arguments) || this;
              }
              (0, x.Z)(t, e),
                (t.peek = function () {
                  return i;
                });
              var s = t.prototype;
              return (
                (s.componentDidMount = function () {
                  r.push(this), a();
                }),
                (s.componentDidUpdate = function () {
                  a();
                }),
                (s.componentWillUnmount = function () {
                  var e = r.indexOf(this);
                  r.splice(e, 1), a();
                }),
                (s.render = function () {
                  return o.createElement(n, this.props);
                }),
                t
              );
            })(o.PureComponent);
            return (
              (0, E.Z)(
                s,
                'displayName',
                'SideEffect(' +
                  (function (e) {
                    return e.displayName || e.name || 'Component';
                  })(n) +
                  ')'
              ),
              s
            );
          };
        },
        C = function (e, t) {
          return (
            !e ||
            e === document ||
            (e && e.nodeType === Node.DOCUMENT_NODE) ||
            (!(function (e) {
              if (e.nodeType !== Node.ELEMENT_NODE) return !1;
              var t = window.getComputedStyle(e, null);
              return (
                !(!t || !t.getPropertyValue) &&
                ('none' === t.getPropertyValue('display') || 'hidden' === t.getPropertyValue('visibility'))
              );
            })(e) &&
              t(
                e.parentNode && e.parentNode.nodeType === Node.DOCUMENT_FRAGMENT_NODE
                  ? e.parentNode.host
                  : e.parentNode
              ))
          );
        },
        S = function (e, t) {
          var n = e.get(t);
          if (void 0 !== n) return n;
          var i = C(t, S.bind(void 0, e));
          return e.set(t, i), i;
        },
        N = function (e) {
          return e.dataset;
        },
        j = function (e) {
          return 'INPUT' === e.tagName;
        },
        z = function (e) {
          return j(e) && 'radio' === e.type;
        },
        O = function (e) {
          var t;
          return Boolean(e && (null === (t = N(e)) || void 0 === t ? void 0 : t.focusGuard));
        },
        T = function (e) {
          return !O(e);
        },
        R = function (e) {
          return Boolean(e);
        },
        B = function (e, t) {
          return z(e) && e.name
            ? (function (e, t) {
                return (
                  t
                    .filter(z)
                    .filter(function (t) {
                      return t.name === e.name;
                    })
                    .filter(function (e) {
                      return e.checked;
                    })[0] || e
                );
              })(e, t)
            : e;
        },
        A = function (e) {
          return e[0] && e.length > 1 ? B(e[0], e) : e[0];
        },
        L = function (e, t) {
          return e.length > 1 ? e.indexOf(B(e[t], e)) : t;
        },
        P = 'NEW_FOCUS',
        Z = function (e, t, n, i) {
          var r = e.length,
            o = e[0],
            a = e[r - 1],
            s = O(n);
          if (!(n && e.indexOf(n) >= 0)) {
            var l = void 0 !== n ? t.indexOf(n) : -1,
              u = i ? t.indexOf(i) : l,
              c = i ? e.indexOf(i) : -1,
              f = l - u,
              d = t.indexOf(o),
              h = t.indexOf(a),
              p = (function (e) {
                var t = new Set();
                return (
                  e.forEach(function (n) {
                    return t.add(B(n, e));
                  }),
                  e.filter(function (e) {
                    return t.has(e);
                  })
                );
              })(t),
              v = (void 0 !== n ? p.indexOf(n) : -1) - (i ? p.indexOf(i) : l),
              _ = L(e, 0),
              m = L(e, r - 1);
            return -1 === l || -1 === c
              ? P
              : !f && c >= 0
              ? c
              : l <= d && s && Math.abs(f) > 1
              ? m
              : l >= h && s && Math.abs(f) > 1
              ? _
              : f && Math.abs(v) > 1
              ? c
              : l <= d
              ? m
              : l > h
              ? _
              : f
              ? Math.abs(f) > 1
                ? c
                : (r + c + f) % r
              : void 0;
          }
        },
        M = function (e) {
          for (var t = Array(e.length), n = 0; n < e.length; ++n) t[n] = e[n];
          return t;
        },
        I = function (e) {
          return Array.isArray(e) ? e : [e];
        },
        H = function (e, t) {
          var n = e.tabIndex - t.tabIndex,
            i = e.index - t.index;
          if (n) {
            if (!e.tabIndex) return 1;
            if (!t.tabIndex) return -1;
          }
          return n || i;
        },
        D = function (e, t, n) {
          return M(e)
            .map(function (e, t) {
              return {
                node: e,
                index: t,
                tabIndex: n && -1 === e.tabIndex ? ((e.dataset || {}).focusGuard ? 0 : -1) : e.tabIndex
              };
            })
            .filter(function (e) {
              return !t || e.tabIndex >= 0;
            })
            .sort(H);
        },
        U = [
          'button:enabled',
          'select:enabled',
          'textarea:enabled',
          'input:enabled',
          'a[href]',
          'area[href]',
          'summary',
          'iframe',
          'object',
          'embed',
          'audio[controls]',
          'video[controls]',
          '[tabindex]',
          '[contenteditable]',
          '[autofocus]'
        ].join(','),
        q = ''.concat(U, ', [data-focus-guard]'),
        F = function (e, t) {
          return e.reduce(function (e, n) {
            return e.concat(
              M(n.querySelectorAll(t ? q : U)),
              n.parentNode
                ? M(n.parentNode.querySelectorAll(U)).filter(function (e) {
                    return e === n;
                  })
                : []
            );
          }, []);
        },
        W = function (e, t) {
          return M(e)
            .filter(function (e) {
              return S(t, e);
            })
            .filter(function (e) {
              return (function (e) {
                return (
                  !(
                    (j(e) ||
                      (function (e) {
                        return 'BUTTON' === e.tagName;
                      })(e)) &&
                    ('hidden' === e.type || e.disabled)
                  ) && !e.ariaDisabled
                );
              })(e);
            });
        },
        V = function (e, t, n) {
          return D(W(F(e, n), t), !0, n);
        },
        G = function (e, t) {
          return D(W(F(e), t), !1);
        },
        K = function (e, t) {
          return W(
            (function (e) {
              var t = e.querySelectorAll('['.concat('data-autofocus-inside', ']'));
              return M(t)
                .map(function (e) {
                  return F([e]);
                })
                .reduce(function (e, t) {
                  return e.concat(t);
                }, []);
            })(e),
            t
          );
        },
        X = function (e) {
          return e.parentNode ? X(e.parentNode) : e;
        },
        $ = function (e) {
          return I(e)
            .filter(Boolean)
            .reduce(function (e, t) {
              var n = t.getAttribute(a);
              return (
                e.push.apply(
                  e,
                  n
                    ? (function (e) {
                        for (var t = new Set(), n = e.length, i = 0; i < n; i += 1)
                          for (var r = i + 1; r < n; r += 1) {
                            var o = e[i].compareDocumentPosition(e[r]);
                            (o & Node.DOCUMENT_POSITION_CONTAINED_BY) > 0 && t.add(r),
                              (o & Node.DOCUMENT_POSITION_CONTAINS) > 0 && t.add(i);
                          }
                        return e.filter(function (e, n) {
                          return !t.has(n);
                        });
                      })(
                        M(
                          X(t).querySelectorAll(
                            '['.concat(a, '="').concat(n, '"]:not([').concat(s, '="disabled"])')
                          )
                        )
                      )
                    : [t]
                ),
                e
              );
            }, []);
        },
        J = function () {
          return document.activeElement
            ? document.activeElement.shadowRoot
              ? document.activeElement.shadowRoot.activeElement
              : document.activeElement
            : void 0;
        },
        Y = function (e, t) {
          return void 0 === t && (t = []), t.push(e), e.parentNode && Y(e.parentNode, t), t;
        },
        Q = function (e, t) {
          for (var n = Y(e), i = Y(t), r = 0; r < n.length; r += 1) {
            var o = n[r];
            if (i.indexOf(o) >= 0) return o;
          }
          return !1;
        },
        ee = function (e, t, n) {
          var i = I(e),
            r = I(t),
            o = i[0],
            a = !1;
          return (
            r.filter(Boolean).forEach(function (e) {
              (a = Q(a || e, e) || a),
                n.filter(Boolean).forEach(function (e) {
                  var t = Q(o, e);
                  t && (a = !a || t.contains(a) ? t : Q(t, a));
                });
            }),
            a
          );
        },
        te = function (e, t) {
          var n = document && J(),
            i = $(e).filter(T),
            r = ee(n || e, e, i),
            o = new Map(),
            a = G(i, o),
            s = V(i, o).filter(function (e) {
              var t = e.node;
              return T(t);
            });
          if (s[0] || (s = a)[0]) {
            var l,
              u = G([r], o).map(function (e) {
                return e.node;
              }),
              c = (function (e, t) {
                var n = new Map();
                return (
                  t.forEach(function (e) {
                    return n.set(e.node, e);
                  }),
                  e
                    .map(function (e) {
                      return n.get(e);
                    })
                    .filter(R)
                );
              })(u, s),
              f = c.map(function (e) {
                return e.node;
              }),
              d = Z(f, u, n, t);
            if (d === P) {
              var h = a
                .map(function (e) {
                  return e.node;
                })
                .filter(
                  ((l = (function (e, t) {
                    return e.reduce(function (e, n) {
                      return e.concat(K(n, t));
                    }, []);
                  })(i, o)),
                  function (e) {
                    var t;
                    return (
                      e.autofocus ||
                      !!(null === (t = N(e)) || void 0 === t ? void 0 : t.autofocus) ||
                      l.indexOf(e) >= 0
                    );
                  })
                );
              return { node: h && h.length ? A(h) : A(f) };
            }
            return void 0 === d ? d : c[d];
          }
        },
        ne = 0,
        ie = !1,
        re = function (e, t, n) {
          void 0 === n && (n = {});
          var i,
            r,
            o = te(e, t);
          if (!ie && o) {
            if (ne > 2)
              return (
                console.error(
                  'FocusLock: focus-fighting detected. Only one focus management system could be active. See https://github.com/theKashey/focus-lock/#focus-fighting'
                ),
                (ie = !0),
                void setTimeout(function () {
                  ie = !1;
                }, 1)
              );
            ne++,
              (i = o.node),
              (r = n.focusOptions),
              'focus' in i && i.focus(r),
              'contentWindow' in i && i.contentWindow && i.contentWindow.focus(),
              ne--;
          }
        },
        oe = function (e) {
          return Boolean(
            M(e.querySelectorAll('iframe')).some(function (e) {
              return e === document.activeElement;
            })
          );
        },
        ae = function (e) {
          var t = document && J();
          return (
            !(!t || (t.dataset && t.dataset.focusGuard)) &&
            $(e).reduce(function (e, n) {
              return e || n.contains(t) || oe(n);
            }, !1)
          );
        };
      function se(e) {
        var t = window.setImmediate;
        'undefined' !== typeof t ? t(e) : setTimeout(e, 1);
      }
      var le = function () {
          return (
            (document && document.activeElement === document.body) ||
            (function () {
              var e = document && J();
              return (
                !!e &&
                M(document.querySelectorAll('['.concat('data-no-focus-lock', ']'))).some(function (t) {
                  return t.contains(e);
                })
              );
            })()
          );
        },
        ue = null,
        ce = null,
        fe = null,
        de = !1,
        he = function () {
          return !0;
        };
      function pe(e, t, n, i) {
        var r = null,
          o = e;
        do {
          var a = i[o];
          if (a.guard) a.node.dataset.focusAutoGuard && (r = a);
          else {
            if (!a.lockItem) break;
            if (o !== e) return;
            r = null;
          }
        } while ((o += n) !== t);
        r && (r.node.tabIndex = 0);
      }
      var ve = function (e) {
          return e && 'current' in e ? e.current : e;
        },
        _e = function e(t, n, i) {
          return (
            n &&
            ((n.host === t && (!n.activeElement || i.contains(n.activeElement))) ||
              (n.parentNode && e(t, n.parentNode, i)))
          );
        },
        me = function () {
          var e,
            t = !1;
          if (ue) {
            var n = ue,
              i = n.observed,
              r = n.persistentFocus,
              o = n.autoFocus,
              a = n.shards,
              s = n.crossFrame,
              l = n.focusOptions,
              u = i || (fe && fe.portaledElement),
              c = document && document.activeElement;
            if (u) {
              var f = [u].concat(a.map(ve).filter(Boolean));
              if (
                ((c &&
                  !(function (e) {
                    return (ue.whiteList || he)(e);
                  })(c)) ||
                  ((r || (s ? Boolean(de) : 'meanwhile' === de) || !le() || (!ce && o)) &&
                    (u &&
                      !(
                        ae(f) ||
                        (c &&
                          (function (e, t) {
                            return t.some(function (t) {
                              return _e(e, t, t);
                            });
                          })(c, f)) ||
                        ((e = c), fe && fe.portaledElement === e)
                      ) &&
                      (document && !ce && c && !o
                        ? (c.blur && c.blur(), document.body.focus())
                        : ((t = re(f, ce, { focusOptions: l })), (fe = {}))),
                    (de = !1),
                    (ce = document && document.activeElement))),
                document)
              ) {
                var d = document && document.activeElement,
                  h = (function (e) {
                    var t = $(e).filter(T),
                      n = ee(e, e, t),
                      i = new Map(),
                      r = V([n], i, !0),
                      o = V(t, i)
                        .filter(function (e) {
                          var t = e.node;
                          return T(t);
                        })
                        .map(function (e) {
                          return e.node;
                        });
                    return r.map(function (e) {
                      var t = e.node;
                      return { node: t, index: e.index, lockItem: o.indexOf(t) >= 0, guard: O(t) };
                    });
                  })(f),
                  p = h
                    .map(function (e) {
                      return e.node;
                    })
                    .indexOf(d);
                p > -1 &&
                  (h
                    .filter(function (e) {
                      var t = e.guard,
                        n = e.node;
                      return t && n.dataset.focusAutoGuard;
                    })
                    .forEach(function (e) {
                      return e.node.removeAttribute('tabIndex');
                    }),
                  pe(p, h.length, 1, h),
                  pe(p, -1, -1, h));
              }
            }
          }
          return t;
        },
        ge = function (e) {
          me() && e && (e.stopPropagation(), e.preventDefault());
        },
        we = function () {
          return se(me);
        },
        ye = function (e) {
          var t = e.target,
            n = e.currentTarget;
          n.contains(t) || (fe = { observerNode: n, portaledElement: t });
        },
        be = function () {
          (de = 'just'),
            setTimeout(function () {
              de = 'meanwhile';
            }, 0);
        };
      v.assignSyncMedium(ye),
        _.assignMedium(we),
        m.assignMedium(function (e) {
          return e({ moveFocusInside: re, focusInside: ae });
        });
      var xe = k(
          function (e) {
            return e.filter(function (e) {
              return !e.disabled;
            });
          },
          function (e) {
            var t = e.slice(-1)[0];
            t &&
              !ue &&
              (document.addEventListener('focusin', ge),
              document.addEventListener('focusout', we),
              window.addEventListener('blur', be));
            var n = ue,
              i = n && t && t.id === n.id;
            (ue = t),
              n &&
                !i &&
                (n.onDeactivation(),
                e.filter(function (e) {
                  return e.id === n.id;
                }).length || n.returnFocus(!t)),
              t
                ? ((ce = null), (i && n.observed === t.observed) || t.onActivation(), me(), se(me))
                : (document.removeEventListener('focusin', ge),
                  document.removeEventListener('focusout', we),
                  window.removeEventListener('blur', be),
                  (ce = null));
          }
        )(function () {
          return null;
        }),
        Ee = o.forwardRef(function (e, t) {
          return o.createElement(b, (0, r.Z)({ sideCar: xe, ref: t }, e));
        }),
        ke = b.propTypes || {};
      ke.sideCar, (0, i.Z)(ke, ['sideCar']);
      Ee.propTypes = {};
      var Ce = Ee;
    },
    4910: function (e, t) {
      'use strict';
      var n = 'function' === typeof Symbol && Symbol.for,
        i = n ? Symbol.for('react.element') : 60103,
        r = n ? Symbol.for('react.portal') : 60106,
        o = n ? Symbol.for('react.fragment') : 60107,
        a = n ? Symbol.for('react.strict_mode') : 60108,
        s = n ? Symbol.for('react.profiler') : 60114,
        l = n ? Symbol.for('react.provider') : 60109,
        u = n ? Symbol.for('react.context') : 60110,
        c = n ? Symbol.for('react.async_mode') : 60111,
        f = n ? Symbol.for('react.concurrent_mode') : 60111,
        d = n ? Symbol.for('react.forward_ref') : 60112,
        h = n ? Symbol.for('react.suspense') : 60113,
        p = n ? Symbol.for('react.suspense_list') : 60120,
        v = n ? Symbol.for('react.memo') : 60115,
        _ = n ? Symbol.for('react.lazy') : 60116,
        m = n ? Symbol.for('react.block') : 60121,
        g = n ? Symbol.for('react.fundamental') : 60117,
        w = n ? Symbol.for('react.responder') : 60118,
        y = n ? Symbol.for('react.scope') : 60119;
      function b(e) {
        if ('object' === typeof e && null !== e) {
          var t = e.$$typeof;
          switch (t) {
            case i:
              switch ((e = e.type)) {
                case c:
                case f:
                case o:
                case s:
                case a:
                case h:
                  return e;
                default:
                  switch ((e = e && e.$$typeof)) {
                    case u:
                    case d:
                    case _:
                    case v:
                    case l:
                      return e;
                    default:
                      return t;
                  }
              }
            case r:
              return t;
          }
        }
      }
      function x(e) {
        return b(e) === f;
      }
      (t.AsyncMode = c),
        (t.ConcurrentMode = f),
        (t.ContextConsumer = u),
        (t.ContextProvider = l),
        (t.Element = i),
        (t.ForwardRef = d),
        (t.Fragment = o),
        (t.Lazy = _),
        (t.Memo = v),
        (t.Portal = r),
        (t.Profiler = s),
        (t.StrictMode = a),
        (t.Suspense = h),
        (t.isAsyncMode = function (e) {
          return x(e) || b(e) === c;
        }),
        (t.isConcurrentMode = x),
        (t.isContextConsumer = function (e) {
          return b(e) === u;
        }),
        (t.isContextProvider = function (e) {
          return b(e) === l;
        }),
        (t.isElement = function (e) {
          return 'object' === typeof e && null !== e && e.$$typeof === i;
        }),
        (t.isForwardRef = function (e) {
          return b(e) === d;
        }),
        (t.isFragment = function (e) {
          return b(e) === o;
        }),
        (t.isLazy = function (e) {
          return b(e) === _;
        }),
        (t.isMemo = function (e) {
          return b(e) === v;
        }),
        (t.isPortal = function (e) {
          return b(e) === r;
        }),
        (t.isProfiler = function (e) {
          return b(e) === s;
        }),
        (t.isStrictMode = function (e) {
          return b(e) === a;
        }),
        (t.isSuspense = function (e) {
          return b(e) === h;
        }),
        (t.isValidElementType = function (e) {
          return (
            'string' === typeof e ||
            'function' === typeof e ||
            e === o ||
            e === f ||
            e === s ||
            e === a ||
            e === h ||
            e === p ||
            ('object' === typeof e &&
              null !== e &&
              (e.$$typeof === _ ||
                e.$$typeof === v ||
                e.$$typeof === l ||
                e.$$typeof === u ||
                e.$$typeof === d ||
                e.$$typeof === g ||
                e.$$typeof === w ||
                e.$$typeof === y ||
                e.$$typeof === m))
          );
        }),
        (t.typeOf = b);
    },
    3551: function (e, t, n) {
      'use strict';
      e.exports = n(4910);
    },
    5926: function (e, t, n) {
      'use strict';
      var i = n(1738),
        r = n(3551);
      t.Z = function e(t, n, o) {
        return (
          void 0 === n && (n = 0),
          void 0 === o && (o = []),
          i.Children.toArray(t).reduce(function (t, a, s) {
            return (
              r.isFragment(a)
                ? t.push.apply(t, e(a.props.children, n + 1, o.concat(a.key || s)))
                : i.isValidElement(a)
                ? t.push(i.cloneElement(a, { key: o.concat(String(a.key)).join('.') }))
                : ('string' !== typeof a && 'number' !== typeof a) || t.push(a),
              t
            );
          }, [])
        );
      };
    },
    9043: function (e, t, n) {
      'use strict';
      n.d(t, {
        ZP: function () {
          return _;
        }
      });
      var i = n(3891),
        r = n(162),
        o = n(1738),
        a = n(3489),
        s = !1,
        l = n(2560),
        u = 'unmounted',
        c = 'exited',
        f = 'entering',
        d = 'entered',
        h = 'exiting',
        p = (function (e) {
          function t(t, n) {
            var i;
            i = e.call(this, t, n) || this;
            var r,
              o = n && !n.isMounting ? t.enter : t.appear;
            return (
              (i.appearStatus = null),
              t.in
                ? o
                  ? ((r = c), (i.appearStatus = f))
                  : (r = d)
                : (r = t.unmountOnExit || t.mountOnEnter ? u : c),
              (i.state = { status: r }),
              (i.nextCallback = null),
              i
            );
          }
          (0, r.Z)(t, e),
            (t.getDerivedStateFromProps = function (e, t) {
              return e.in && t.status === u ? { status: c } : null;
            });
          var n = t.prototype;
          return (
            (n.componentDidMount = function () {
              this.updateStatus(!0, this.appearStatus);
            }),
            (n.componentDidUpdate = function (e) {
              var t = null;
              if (e !== this.props) {
                var n = this.state.status;
                this.props.in ? n !== f && n !== d && (t = f) : (n !== f && n !== d) || (t = h);
              }
              this.updateStatus(!1, t);
            }),
            (n.componentWillUnmount = function () {
              this.cancelNextCallback();
            }),
            (n.getTimeouts = function () {
              var e,
                t,
                n,
                i = this.props.timeout;
              return (
                (e = t = n = i),
                null != i &&
                  'number' !== typeof i &&
                  ((e = i.exit), (t = i.enter), (n = void 0 !== i.appear ? i.appear : t)),
                { exit: e, enter: t, appear: n }
              );
            }),
            (n.updateStatus = function (e, t) {
              void 0 === e && (e = !1),
                null !== t
                  ? (this.cancelNextCallback(), t === f ? this.performEnter(e) : this.performExit())
                  : this.props.unmountOnExit && this.state.status === c && this.setState({ status: u });
            }),
            (n.performEnter = function (e) {
              var t = this,
                n = this.props.enter,
                i = this.context ? this.context.isMounting : e,
                r = this.props.nodeRef ? [i] : [a.findDOMNode(this), i],
                o = r[0],
                l = r[1],
                u = this.getTimeouts(),
                c = i ? u.appear : u.enter;
              (!e && !n) || s
                ? this.safeSetState({ status: d }, function () {
                    t.props.onEntered(o);
                  })
                : (this.props.onEnter(o, l),
                  this.safeSetState({ status: f }, function () {
                    t.props.onEntering(o, l),
                      t.onTransitionEnd(c, function () {
                        t.safeSetState({ status: d }, function () {
                          t.props.onEntered(o, l);
                        });
                      });
                  }));
            }),
            (n.performExit = function () {
              var e = this,
                t = this.props.exit,
                n = this.getTimeouts(),
                i = this.props.nodeRef ? void 0 : a.findDOMNode(this);
              t && !s
                ? (this.props.onExit(i),
                  this.safeSetState({ status: h }, function () {
                    e.props.onExiting(i),
                      e.onTransitionEnd(n.exit, function () {
                        e.safeSetState({ status: c }, function () {
                          e.props.onExited(i);
                        });
                      });
                  }))
                : this.safeSetState({ status: c }, function () {
                    e.props.onExited(i);
                  });
            }),
            (n.cancelNextCallback = function () {
              null !== this.nextCallback && (this.nextCallback.cancel(), (this.nextCallback = null));
            }),
            (n.safeSetState = function (e, t) {
              (t = this.setNextCallback(t)), this.setState(e, t);
            }),
            (n.setNextCallback = function (e) {
              var t = this,
                n = !0;
              return (
                (this.nextCallback = function (i) {
                  n && ((n = !1), (t.nextCallback = null), e(i));
                }),
                (this.nextCallback.cancel = function () {
                  n = !1;
                }),
                this.nextCallback
              );
            }),
            (n.onTransitionEnd = function (e, t) {
              this.setNextCallback(t);
              var n = this.props.nodeRef ? this.props.nodeRef.current : a.findDOMNode(this),
                i = null == e && !this.props.addEndListener;
              if (n && !i) {
                if (this.props.addEndListener) {
                  var r = this.props.nodeRef ? [this.nextCallback] : [n, this.nextCallback],
                    o = r[0],
                    s = r[1];
                  this.props.addEndListener(o, s);
                }
                null != e && setTimeout(this.nextCallback, e);
              } else setTimeout(this.nextCallback, 0);
            }),
            (n.render = function () {
              var e = this.state.status;
              if (e === u) return null;
              var t = this.props,
                n = t.children,
                r =
                  (t.in,
                  t.mountOnEnter,
                  t.unmountOnExit,
                  t.appear,
                  t.enter,
                  t.exit,
                  t.timeout,
                  t.addEndListener,
                  t.onEnter,
                  t.onEntering,
                  t.onEntered,
                  t.onExit,
                  t.onExiting,
                  t.onExited,
                  t.nodeRef,
                  (0, i.Z)(t, [
                    'children',
                    'in',
                    'mountOnEnter',
                    'unmountOnExit',
                    'appear',
                    'enter',
                    'exit',
                    'timeout',
                    'addEndListener',
                    'onEnter',
                    'onEntering',
                    'onEntered',
                    'onExit',
                    'onExiting',
                    'onExited',
                    'nodeRef'
                  ]));
              return o.createElement(
                l.Z.Provider,
                { value: null },
                'function' === typeof n ? n(e, r) : o.cloneElement(o.Children.only(n), r)
              );
            }),
            t
          );
        })(o.Component);
      function v() {}
      (p.contextType = l.Z),
        (p.propTypes = {}),
        (p.defaultProps = {
          in: !1,
          mountOnEnter: !1,
          unmountOnExit: !1,
          appear: !1,
          enter: !0,
          exit: !0,
          onEnter: v,
          onEntering: v,
          onEntered: v,
          onExit: v,
          onExiting: v,
          onExited: v
        }),
        (p.UNMOUNTED = u),
        (p.EXITED = c),
        (p.ENTERING = f),
        (p.ENTERED = d),
        (p.EXITING = h);
      var _ = p;
    },
    2560: function (e, t, n) {
      'use strict';
      var i = n(1738);
      t.Z = i.createContext(null);
    },
    4997: function (e, t, n) {
      'use strict';
      n.d(t, {
        _T: function () {
          return r;
        },
        ev: function () {
          return o;
        },
        pi: function () {
          return i;
        }
      });
      var i = function () {
        return (
          (i =
            Object.assign ||
            function (e) {
              for (var t, n = 1, i = arguments.length; n < i; n++)
                for (var r in (t = arguments[n])) Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
              return e;
            }),
          i.apply(this, arguments)
        );
      };
      function r(e, t) {
        var n = {};
        for (var i in e) Object.prototype.hasOwnProperty.call(e, i) && t.indexOf(i) < 0 && (n[i] = e[i]);
        if (null != e && 'function' === typeof Object.getOwnPropertySymbols) {
          var r = 0;
          for (i = Object.getOwnPropertySymbols(e); r < i.length; r++)
            t.indexOf(i[r]) < 0 && Object.prototype.propertyIsEnumerable.call(e, i[r]) && (n[i[r]] = e[i[r]]);
        }
        return n;
      }
      Object.create;
      function o(e, t, n) {
        if (n || 2 === arguments.length)
          for (var i, r = 0, o = t.length; r < o; r++)
            (!i && r in t) || (i || (i = Array.prototype.slice.call(t, 0, r)), (i[r] = t[r]));
        return e.concat(i || Array.prototype.slice.call(t));
      }
      Object.create;
    },
    8316: function (e, t, n) {
      'use strict';
      n.d(t, {
        iK: function () {
          return Mi;
        },
        IE: function () {
          return Yi;
        },
        h4: function () {
          return Tr;
        },
        VM: function () {
          return Zr;
        },
        N$: function () {
          return Vi;
        },
        mu: function () {
          return $i;
        },
        _7: function () {
          return W;
        },
        fV: function () {
          return V;
        },
        tm: function () {
          return y;
        },
        Ms: function () {
          return Z;
        },
        MC: function () {
          return X;
        },
        r4: function () {
          return b;
        },
        e1: function () {
          return C;
        },
        HN: function () {
          return K;
        },
        th: function () {
          return U;
        },
        zl: function () {
          return c;
        },
        Wy: function () {
          return f;
        },
        CY: function () {
          return d;
        },
        q9: function () {
          return M;
        },
        BQ: function () {
          return P;
        },
        yJ: function () {
          return G;
        },
        gO: function () {
          return H;
        },
        jw: function () {
          return k;
        },
        zn: function () {
          return Gi;
        },
        rV: function () {
          return Ji;
        },
        UV: function () {
          return x;
        }
      });
      var i = n(4266),
        r = n.n(i),
        o = n(2568),
        a = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        s = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        },
        l = o.env.NEXT_PUBLIC_API_BASE_URL,
        u = function (e) {
          return a(void 0, void 0, void 0, function () {
            var t;
            return s(this, function (n) {
              switch (n.label) {
                case 0:
                  return (
                    (t = localStorage.getItem('csrfToken')) && (e.headers = { 'csrf-token': t }),
                    [
                      4,
                      r()(e).catch(function (e) {
                        throw (console.log(e), new Error('there was an error while trying to retrieve data'));
                      })
                    ]
                  );
                case 1:
                  return [2, n.sent().data];
              }
            });
          });
        },
        c = function (e, t, n) {
          return (
            void 0 === n && (n = !0),
            a(void 0, void 0, void 0, function () {
              var i;
              return s(this, function (r) {
                switch (r.label) {
                  case 0:
                    return (
                      (i = { method: 'GET', url: ''.concat(l).concat(e), data: t, withCredentials: n }),
                      [4, u(i)]
                    );
                  case 1:
                    return [2, r.sent()];
                }
              });
            })
          );
        },
        f = function (e, t, n) {
          return (
            void 0 === n && (n = !0),
            a(void 0, void 0, void 0, function () {
              var i;
              return s(this, function (r) {
                switch (r.label) {
                  case 0:
                    return (
                      (i = { method: 'POST', url: ''.concat(l).concat(e), data: t, withCredentials: n }),
                      [4, u(i)]
                    );
                  case 1:
                    return [2, r.sent()];
                }
              });
            })
          );
        },
        d = function (e, t, n) {
          return (
            void 0 === n && (n = !0),
            a(void 0, void 0, void 0, function () {
              var i;
              return s(this, function (r) {
                switch (r.label) {
                  case 0:
                    return (
                      (i = { method: 'PUT', url: ''.concat(l).concat(e), data: t, withCredentials: n }),
                      [4, u(i)]
                    );
                  case 1:
                    return [2, r.sent()];
                }
              });
            })
          );
        };
      r().interceptors.response.use(
        function (e) {
          return e;
        },
        function (e) {
          return a(this, void 0, void 0, function () {
            var t, n;
            return s(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    (t = e.config),
                    401 !== e.response.status || t._retry ? [3, 2] : ((t._retry = !0), [4, c('refresh', {})])
                  );
                case 1:
                  return (n = i.sent()), localStorage.setItem('idToken', n.idToken), [2, r()(t)];
                case 2:
                  return [2, Promise.reject(e)];
              }
            });
          });
        }
      );
      var h = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        p = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        },
        v = function (e) {
          return h(void 0, void 0, void 0, function () {
            return p(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, f('token', e)];
                case 1:
                  return [2, t.sent()];
              }
            });
          });
        },
        _ = n(8758),
        m = function () {
          return (
            (m =
              Object.assign ||
              function (e) {
                for (var t, n = 1, i = arguments.length; n < i; n++)
                  for (var r in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
                return e;
              }),
            m.apply(this, arguments)
          );
        },
        g = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        w = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        },
        y = function (e, t) {
          return g(void 0, void 0, void 0, function () {
            return w(this, function (n) {
              switch (n.label) {
                case 0:
                  return [4, d('/roles/'.concat(t), { username: e })];
                case 1:
                  return n.sent(), [2];
              }
            });
          });
        },
        b = function (e) {
          return g(void 0, void 0, void 0, function () {
            return w(this, function (t) {
              switch (t.label) {
                case 0:
                  return console.log(e), [4, f('users', m({}, e))];
                case 1:
                  return t.sent(), [2];
              }
            });
          });
        },
        x = function () {
          var e,
            t = (0, _.ZP)('users', c, {}),
            n = t.data,
            i = t.mutate;
          return {
            users: null !== (e = null === n || void 0 === n ? void 0 : n.users) && void 0 !== e ? e : [],
            mutate: i
          };
        },
        E = n(1738);
      var k = [
          { key: 'previous-1-day', amount: 1, unit: 'day', type: 'relative' },
          { key: 'previous-1-week', amount: 1, unit: 'week', type: 'relative' },
          { key: 'previous-2-weeks', amount: 2, unit: 'week', type: 'relative' },
          { key: 'previous-4-weeks', amount: 4, unit: 'week', type: 'relative' }
        ],
        C = {
          todayAriaLabel: 'Today',
          nextMonthAriaLabel: 'Next month',
          previousMonthAriaLabel: 'Previous month',
          customRelativeRangeDurationLabel: 'Duration',
          customRelativeRangeDurationPlaceholder: 'Enter duration',
          customRelativeRangeOptionLabel: 'Custom range',
          customRelativeRangeOptionDescription: 'Set a custom range in the past',
          customRelativeRangeUnitLabel: 'Unit of time',
          formatRelativeRange: function (e) {
            var t = 1 === e.amount ? e.unit : ''.concat(e.unit, 's');
            return 'Last '.concat(e.amount, ' ').concat(t);
          },
          formatUnit: function (e, t) {
            return 1 === t ? e : ''.concat(e, 's');
          },
          dateTimeConstraintText: 'Range must be between 1 and 365 days. Use 24 hour format.',
          relativeModeTitle: 'Relative range',
          absoluteModeTitle: 'Absolute range',
          relativeRangeSelectionHeading: 'Choose a range',
          startDateLabel: 'Start date',
          endDateLabel: 'End date',
          startTimeLabel: 'Start time',
          endTimeLabel: 'End time',
          clearButtonLabel: 'Clear and dismiss',
          cancelButtonLabel: 'Cancel',
          applyButtonLabel: 'Apply'
        },
        S = n(670),
        N = n(7138),
        j = n(5529);
      var z = n(5409),
        O = 36e5;
      var T = n(6205),
        R = n(3112),
        B = n(1574);
      var A = function (e, t) {
          var n = Math.abs(new Date(t) - new Date(e));
          return Math.ceil(n / 864e5);
        },
        L = function (e, t) {
          switch (e) {
            case 'second':
              return t / 86400;
            case 'minute':
              return t / 1440;
            case 'hour':
              return t / 24;
            case 'day':
              return t;
            case 'week':
              return 7 * t;
            case 'month':
              return 30 * t;
            case 'year':
              return 365 * t;
          }
        },
        P = function (e) {
          if ('absolute' === e.type) {
            var t = e.startDate.split('T')[0],
              n = e.endDate.split('T')[0];
            if (!t || !n)
              return {
                valid: !1,
                errorMessage:
                  'The selected date range is incomplete. Select a start and end date for the date range.'
              };
            if (A(e.startDate, e.endDate) >= 366)
              return {
                valid: !1,
                errorMessage: 'The selected date range is too large. Select a range up to one year.'
              };
            if (A(e.startDate, e.endDate) < 1)
              return {
                valid: !1,
                errorMessage: 'The selected date range is too small. Select a range that is at least one day.'
              };
          } else if ('relative' === e.type) {
            if (isNaN(e.amount))
              return {
                valid: !1,
                errorMessage: 'The selected date range is incomplete. Specify a duration for the date range.'
              };
            if (L(e.unit, e.amount) < 1)
              return {
                valid: !1,
                errorMessage: 'The selected date range is too small. Select a range that is at least one day.'
              };
            if (L(e.unit, e.amount) >= 366)
              return {
                valid: !1,
                errorMessage: 'The selected date range is too large. Select a range up to one year.'
              };
          }
          return { valid: !0 };
        };
      function Z(e) {
        if ('absolute' === e.type) return { start: new Date(e.startDate), end: new Date(e.endDate) };
        var t = new Date(),
          n = (function () {
            switch (e.unit) {
              case 'second':
                return (function (e, t) {
                  (0, j.Z)(2, arguments);
                  var n = (0, S.Z)(t);
                  return (0, N.Z)(e, 1e3 * n);
                })(t, -e.amount);
              case 'minute':
                return (0, z.Z)(t, -e.amount);
              case 'hour':
                return (function (e, t) {
                  (0, j.Z)(2, arguments);
                  var n = (0, S.Z)(t);
                  return (0, N.Z)(e, n * O);
                })(t, -e.amount);
              case 'day':
                return (0, T.Z)(t, -e.amount);
              case 'week':
                return (0, R.Z)(t, -e.amount);
              case 'month':
                return (0, B.Z)(t, -e.amount);
              case 'year':
                return (function (e, t) {
                  (0, j.Z)(2, arguments);
                  var n = (0, S.Z)(t);
                  return (0, B.Z)(e, 12 * n);
                })(t, -e.amount);
            }
          })();
        return { start: n, end: t };
      }
      var M = {
          filteringAriaLabel: 'your choice',
          dismissAriaLabel: 'Dismiss',
          filteringPlaceholder: 'Search',
          groupValuesText: 'Values',
          groupPropertiesText: 'Properties',
          operatorsText: 'Operators',
          operationAndText: 'and',
          operationOrText: 'or',
          operatorLessText: 'Less than',
          operatorLessOrEqualText: 'Less than or equal to',
          operatorGreaterText: 'Greater than',
          operatorGreaterOrEqualText: 'Greater than or equal to',
          operatorContainsText: 'Contains',
          operatorDoesNotContainText: 'Does not contain',
          operatorEqualsText: 'Equals',
          operatorDoesNotEqualText: 'Does not equal',
          editTokenHeader: 'Edit filter',
          propertyText: 'Property',
          operatorText: 'Operator',
          valueText: 'Value',
          cancelActionText: 'Cancel',
          applyActionText: 'Apply',
          allPropertiesLabel: 'All properties',
          tokenLimitShowMore: 'Show more',
          tokenLimitShowFewer: 'Show fewer',
          clearFiltersText: 'Clear filters',
          removeTokenButtonAriaLabel: function () {
            return 'Remove token';
          },
          enteredTextLabel: function (e) {
            return 'Use: "'.concat(e, '"');
          }
        },
        I = {
          navigation: 'Navigation drawer',
          navigationClose: 'Close navigation drawer',
          navigationToggle: 'Open navigation drawer',
          notifications: 'Notifications',
          tools: 'Help panel',
          toolsClose: 'Close help panel',
          toolsToggle: 'Open help panel'
        },
        H = {
          nextPageLabel: 'Next page',
          previousPageLabel: 'Previous page',
          pageLabel: function (e) {
            return 'Page '.concat(e, ' of all pages');
          }
        },
        D = {
          searchIconAriaLabel: 'Search',
          searchDismissIconAriaLabel: 'Close search',
          overflowMenuTriggerText: 'More',
          overflowMenuTitleText: 'All',
          overflowMenuBackIconAriaLabel: 'Back',
          overflowMenuDismissIconAriaLabel: 'Close menu',
          signout: 'Sign out'
        },
        U = function (e) {
          return ''.concat(e, ' ').concat(1 === e ? 'match' : 'matches');
        },
        q = n(1510),
        F = n(9720);
      function W(e, t) {
        return (
          void 0 === t && (t = ''),
          E.createElement(
            q.Z,
            { textAlign: 'center', color: 'inherit' },
            E.createElement('b', null, 'No ', e, 's'),
            E.createElement(
              q.Z,
              { padding: { bottom: 's' }, variant: 'p', color: 'inherit' },
              'No ',
              e,
              's to display.'
            ),
            E.createElement(F.Z, { href: t }, 'Create ', e)
          )
        );
      }
      function V(e) {
        return E.createElement(
          q.Z,
          { textAlign: 'center', color: 'inherit' },
          E.createElement('b', null, 'No matches'),
          E.createElement(
            q.Z,
            { padding: { bottom: 's' }, variant: 'p', color: 'inherit' },
            'No ',
            e,
            's match filter.'
          )
        );
      }
      var G = new RegExp('^[A-Za-z]{1}[A-Za-z0-9-\\s]*$'),
        K = new RegExp(
          /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,4}))$/
        ),
        X = function (e) {
          var t = {};
          return e
            ? (Object.entries(e).forEach(function (e) {
                var n = e[0],
                  i = e[1];
                i && (t[n] = i);
              }),
              t)
            : t;
        },
        $ = n(4997),
        J = n(7069),
        Y = n(286),
        Q = n(6066),
        ee = n(6208),
        te = n(7579),
        ne = n(2538),
        ie = (n(6004), { 'notifications-sticky': 'awsui_notifications-sticky_1hmm4_1udd3_9' }),
        re = n(6918),
        oe = n(2384);
      function ae(e) {
        void 0 === e && (e = 0);
        var t = (0, re.D)(function (e) {
            return e.height;
          }),
          n = t[0],
          i = t[1],
          r = (0, E.useRef)(null),
          o = (0, oe.q)(i, r),
          a = (0, re.D)(function (e) {
            return e.width;
          }),
          s = a[0],
          l = a[1],
          u = (0, E.useRef)(null),
          c = (0, oe.q)(l, u),
          f = E.createElement('div', { ref: c });
        return (
          (0, E.useEffect)(
            function () {
              if (r.current && u.current) {
                var t = r.current,
                  i = u.current,
                  o = (function (e) {
                    for (var t = e; (t = t.parentElement) && t !== document.body; )
                      if (['scroll', 'auto'].indexOf(getComputedStyle(t).overflow) > -1) return t;
                    return null;
                  })(t),
                  a = function () {
                    var r = t.getBoundingClientRect(),
                      a = o ? o.getBoundingClientRect() : { top: 0 };
                    r.top - a.top <= e
                      ? ((t.style.position = 'fixed'),
                        (t.style.width = ''.concat(s, 'px')),
                        (t.style.top = ''.concat(e, 'px')),
                        (i.style.height = ''.concat(n, 'px')))
                      : ((t.style.position = ''),
                        (t.style.width = ''),
                        (t.style.top = ''),
                        (i.style.height = ''));
                  },
                  l = o || window;
                return (
                  l.addEventListener('scroll', a),
                  a(),
                  function () {
                    return l.removeEventListener('scroll', a);
                  }
                );
              }
            },
            [e, s, n, r, u]
          ),
          [o, f]
        );
      }
      var se = function (e) {
          var t = e.testUtilsClassName,
            n = e.children,
            i = e.labels;
          return E.createElement(
            'div',
            {
              className: (0, J.Z)(t),
              role: 'region',
              'aria-label': null === i || void 0 === i ? void 0 : i.notifications
            },
            n
          );
        },
        le = function (e) {
          var t = ae(e.topOffset),
            n = t[0],
            i = t[1];
          return E.createElement(
            E.Fragment,
            null,
            E.createElement(
              'div',
              { ref: n, className: ie['notifications-sticky'] },
              E.createElement(se, (0, $.pi)({}, e))
            ),
            i
          );
        },
        ue = E.forwardRef(function (e, t) {
          var n = e.navigationPadding,
            i = e.toolsPadding,
            r = e.sticky,
            o = e.isMobile,
            a = (0, $._T)(e, ['navigationPadding', 'toolsPadding', 'sticky', 'isMobile']),
            s = (0, $.pi)({ isMobile: o }, a);
          return E.createElement(
            'div',
            {
              ref: t,
              className: (0, J.Z)(
                o && ie['root-mobile'],
                !n && ie['root-no-navigation-padding'],
                !i && ie['root-no-tools-padding']
              )
            },
            r ? E.createElement(le, (0, $.pi)({}, s)) : E.createElement(se, (0, $.pi)({}, s))
          );
        }),
        ce = n(7472),
        fe = (n(9568), 'awsui_close-button_16w0h_kzvce_93'),
        de = {
          navigation: {
            TagName: 'nav',
            iconName: 'menu',
            getLabels: function (e) {
              return (
                void 0 === e && (e = {}),
                { mainLabel: e.navigation, openLabel: e.navigationToggle, closeLabel: e.navigationClose }
              );
            }
          },
          tools: {
            TagName: 'aside',
            iconName: 'status-info',
            getLabels: function (e) {
              return (
                void 0 === e && (e = {}),
                { mainLabel: e.tools, openLabel: e.toolsToggle, closeLabel: e.toolsClose }
              );
            }
          }
        },
        he = E.forwardRef(function (e, t) {
          var n = e.className,
            i = e.ariaLabel,
            r = e.ariaExpanded,
            o = e.iconName,
            a = e.disabled,
            s = e.onClick;
          return E.createElement(ce.l, {
            ref: t,
            className: n,
            ariaLabel: i,
            variant: 'icon',
            formAction: 'none',
            onClick: s,
            iconName: o,
            disabled: a,
            ariaExpanded: r
          });
        }),
        pe = E.forwardRef(function (e, t) {
          var n = e.className,
            i = e.ariaLabel,
            r = e.onClick,
            o = e.iconName;
          return E.createElement(
            'span',
            { className: fe },
            E.createElement(he, { ref: t, className: n, ariaLabel: i, iconName: o, onClick: r })
          );
        }),
        ve = (n(7426), 'awsui_block-body-scroll_19d8l_l5x8d_97'),
        _e = 'awsui_mobile-bar_19d8l_l5x8d_101',
        me = 'awsui_mobile-bar-breadcrumbs_19d8l_l5x8d_115',
        ge = 'awsui_mobile-toggle_19d8l_l5x8d_122',
        we =
          (n(8221),
          {
            root: 'awsui_root_lm6vo_d9e10_97',
            'layout-wrapper': 'awsui_layout-wrapper_lm6vo_d9e10_98',
            'root-no-scroll': 'awsui_root-no-scroll_lm6vo_d9e10_104',
            layout: 'awsui_layout_lm6vo_d9e10_98',
            'layout-no-scroll': 'awsui_layout-no-scroll_lm6vo_d9e10_115',
            'layout-main': 'awsui_layout-main_lm6vo_d9e10_119',
            'layout-main-scrollable': 'awsui_layout-main-scrollable_lm6vo_d9e10_125',
            unfocusable: 'awsui_unfocusable_lm6vo_d9e10_130',
            drawer: 'awsui_drawer_lm6vo_d9e10_134',
            'drawer-mobile': 'awsui_drawer-mobile_lm6vo_d9e10_140',
            'drawer-closed': 'awsui_drawer-closed_lm6vo_d9e10_143',
            'opaque-background': 'awsui_opaque-background_lm6vo_d9e10_150',
            'drawer-content': 'awsui_drawer-content_lm6vo_d9e10_154',
            toggle: 'awsui_toggle_lm6vo_d9e10_179',
            'visual-refresh-toggle': 'awsui_visual-refresh-toggle_lm6vo_d9e10_184',
            'visual-refresh-toggle-type-tools': 'awsui_visual-refresh-toggle-type-tools_lm6vo_d9e10_188',
            'visual-refresh-toggle-type-navigation':
              'awsui_visual-refresh-toggle-type-navigation_lm6vo_d9e10_191',
            'button-toggles-container': 'awsui_button-toggles-container_lm6vo_d9e10_201',
            'button-toggles-container-is-hidden': 'awsui_button-toggles-container-is-hidden_lm6vo_d9e10_206',
            'breadcrumbs-desktop': 'awsui_breadcrumbs-desktop_lm6vo_d9e10_220',
            'content-header-wrapper': 'awsui_content-header-wrapper_lm6vo_d9e10_225',
            'content-wrapper': 'awsui_content-wrapper_lm6vo_d9e10_229',
            'content-overlapped': 'awsui_content-overlapped_lm6vo_d9e10_233',
            'content-extra-top-padding': 'awsui_content-extra-top-padding_lm6vo_d9e10_237',
            'navigation-toggle': 'awsui_navigation-toggle_lm6vo_d9e10_242',
            'tools-toggle': 'awsui_tools-toggle_lm6vo_d9e10_247',
            navigation: 'awsui_navigation_lm6vo_d9e10_242',
            'navigation-close': 'awsui_navigation-close_lm6vo_d9e10_259',
            tools: 'awsui_tools_lm6vo_d9e10_247',
            'tools-close': 'awsui_tools-close_lm6vo_d9e10_271',
            notifications: 'awsui_notifications_lm6vo_d9e10_275',
            breadcrumbs: 'awsui_breadcrumbs_lm6vo_d9e10_220',
            content: 'awsui_content_lm6vo_d9e10_225',
            'panel-wrapper-outer': 'awsui_panel-wrapper-outer_lm6vo_d9e10_287',
            'panel-wrapper-inner': 'awsui_panel-wrapper-inner_lm6vo_d9e10_288',
            mobile: 'awsui_mobile_lm6vo_d9e10_297',
            open: 'awsui_open_lm6vo_d9e10_303'
          }),
        ye = (n(2304), 'awsui_root_1fj9k_avnjw_5'),
        be = 'awsui_navigation_1fj9k_avnjw_9',
        xe = 'awsui_navigation-toggle_1fj9k_avnjw_13',
        Ee = 'awsui_navigation-close_1fj9k_avnjw_17',
        ke = 'awsui_content_1fj9k_avnjw_21',
        Ce = 'awsui_notifications_1fj9k_avnjw_25',
        Se = 'awsui_breadcrumbs_1fj9k_avnjw_29',
        Ne = 'awsui_tools_1fj9k_avnjw_33',
        je = 'awsui_tools-close_1fj9k_avnjw_37',
        ze = 'awsui_tools-toggle_1fj9k_avnjw_41',
        Oe = 'awsui_drawer-closed_1fj9k_avnjw_45',
        Te = 'awsui_mobile-bar_1fj9k_avnjw_49',
        Re = 'awsui_disable-body-scroll-root_1fj9k_avnjw_53',
        Be = E.forwardRef(function (e, t) {
          var n = e.className,
            i = e.ariaLabels,
            r = e.type,
            o = e.disabled,
            a = e.onClick,
            s = de[r],
            l = s.TagName,
            u = s.iconName,
            c = (0, s.getLabels)(i),
            f = c.mainLabel,
            d = c.openLabel;
          return E.createElement(
            l,
            { className: (0, J.Z)(ge), 'aria-hidden': o, 'aria-label': f, onClick: a },
            E.createElement(he, {
              ref: t,
              className: n,
              iconName: u,
              onClick: a,
              ariaLabel: d,
              disabled: o,
              ariaExpanded: o
            })
          );
        });
      function Ae(e) {
        var t = e.ariaLabels,
          n = void 0 === t ? {} : t,
          i = e.toggleRefs,
          r = e.topOffset,
          o = e.navigationHide,
          a = e.toolsHide,
          s = e.anyPanelOpen,
          l = void 0 !== s && s,
          u = e.unfocusable,
          c = e.children,
          f = e.onNavigationOpen,
          d = e.onToolsOpen;
        return (
          (0, E.useEffect)(
            function () {
              if (l)
                return (
                  document.body.classList.add(ve),
                  function () {
                    document.body.classList.remove(ve);
                  }
                );
              document.body.classList.remove(ve);
            },
            [l]
          ),
          E.createElement(
            'div',
            { className: (0, J.Z)(_e, u && we.unfocusable), style: { top: r } },
            !o &&
              E.createElement(Be, {
                ref: i.navigation,
                type: 'navigation',
                className: (0, J.Z)(we['navigation-toggle'], xe),
                ariaLabels: n,
                disabled: l,
                onClick: f
              }),
            E.createElement(
              'div',
              { className: me },
              c && E.createElement('div', { className: (0, J.Z)(we.breadcrumbs, Se) }, c)
            ),
            !a &&
              E.createElement(Be, {
                ref: i.tools,
                type: 'tools',
                className: (0, J.Z)(we['tools-toggle'], ze),
                ariaLabels: n,
                disabled: l,
                onClick: d
              })
          )
        );
      }
      var Le = n(2592);
      function Pe(e) {
        var t = e.context,
          n = e.children,
          i = e.isCopy;
        return n
          ? E.createElement(Le.C.Provider, { value: (0, $.pi)((0, $.pi)({}, t), { isCopy: i }) }, n)
          : null;
      }
      function Ze(e) {
        var t = (0, E.useRef)(null),
          n = (0, E.useRef)(null);
        return (
          (0, E.useLayoutEffect)(
            function () {
              var i, r;
              e
                ? null === (i = n.current) || void 0 === i || i.focus()
                : null === (r = t.current) || void 0 === r || r.focus();
            },
            [e]
          ),
          { toggle: t, close: n }
        );
      }
      var Me = n(8006);
      var Ie = n(1265),
        He = n(9227),
        De = n(6656),
        Ue = n(6430),
        qe = n(7059),
        Fe = n(822),
        We = n(2319),
        Ve =
          (n(4663),
          {
            'content-wrapper': 'awsui_content-wrapper_zycdx_s6r07_93',
            'content-wrapper-mobile': 'awsui_content-wrapper-mobile_zycdx_s6r07_97'
          }),
        Ge = E.forwardRef(function (e, t) {
          var n = e.className,
            i = e.children,
            r = e.toolsPadding,
            o = e.disablePaddings,
            a = e.navigationPadding,
            s = e.isMobile,
            l = e.contentWidthStyles;
          return o
            ? E.createElement('div', { className: n, ref: t }, i)
            : E.createElement(
                'div',
                {
                  ref: t,
                  className: (0, J.Z)(
                    n,
                    Ve['content-wrapper'],
                    !a && Ve['content-wrapper-no-navigation-padding'],
                    !r && Ve['content-wrapper-no-tools-padding'],
                    s && Ve['content-wrapper-mobile']
                  ),
                  style: l
                },
                i
              );
        }),
        Ke = (n(9101), { 'content-header-sticky': 'awsui_content-header-sticky_szx2o_8sakc_9' });
      function Xe(e) {
        var t = e.children,
          n = e.topOffset,
          i = e.sticky;
        return E.createElement(
          'div',
          { className: (0, J.Z)(Ke['content-header'], i && Ke['content-header-sticky']), style: { top: n } },
          t
        );
      }
      var $e = n(5450),
        Je = n(6270);
      function Ye(e) {
        var t,
          n = e.contentClassName,
          i = e.toggleClassName,
          r = e.closeClassName,
          o = e.width,
          a = e.type,
          s = e.toggleRefs,
          l = e.topOffset,
          u = e.bottomOffset,
          c = e.ariaLabels,
          f = e.children,
          d = e.isOpen,
          h = e.isHidden,
          p = e.isMobile,
          v = e.hasDividerWithSplitPanel,
          _ = e.onToggle,
          m = e.onClick,
          g = e.extendRight,
          w = void 0 === g ? 0 : g,
          y = de[a],
          b = y.TagName,
          x = y.iconName,
          k = (0, y.getLabels)(c),
          C = k.mainLabel,
          S = k.closeLabel,
          N = k.openLabel,
          j = d && 0 !== w,
          z = d ? (p ? void 0 : o) : void 0,
          O = j && z ? z + 2 : z,
          T = E.createElement(
            b,
            { 'aria-label': C, className: we.toggle, 'aria-hidden': d },
            E.createElement(he, {
              ref: s.toggle,
              className: i,
              iconName: x,
              ariaLabel: N,
              onClick: function () {
                return _(!0);
              },
              ariaExpanded: !1
            })
          );
        return E.createElement(
          'div',
          {
            className: (0, J.Z)(
              we.drawer,
              ((t = {}),
              (t[we['drawer-closed']] = !d),
              (t[we['drawer-hidden']] = h),
              (t[we['drawer-mobile']] = p),
              (t[we['has-divider-with-splitpanel']] = v),
              (t[we['opaque-background']] = j),
              t)
            ),
            style: { width: O, marginRight: d ? -1 * w : 0, paddingRight: d ? w : 0 },
            onClick: function (e) {
              m && m(e), d || ('BUTTON' !== e.target.tagName && _(!0));
            }
          },
          E.createElement(
            'div',
            { style: { width: z, top: l, bottom: u }, className: (0, J.Z)(we['drawer-content'], n) },
            !p && T,
            E.createElement(
              b,
              { 'aria-label': C, 'aria-hidden': !d },
              E.createElement(pe, {
                ref: s.close,
                className: r,
                ariaLabel: S,
                onClick: function () {
                  return _(!1);
                },
                iconName: 'close'
              }),
              f
            )
          )
        );
      }
      function Qe(e) {
        var t,
          n = e.ariaLabels,
          i = e.footerHeight,
          r = e.headerHeight,
          o = e.isHidden,
          a = e.isMobile,
          s = e.navigation,
          l = e.navigationDrawerWidth,
          u = e.navigationWidth,
          c = e.navigationOpen,
          f = e.onClick,
          d = e.onNavigationToggle,
          h = e.panelHeightStyle,
          p = e.toggleRefs;
        return E.createElement(
          'div',
          { style: { width: l } },
          E.createElement(
            'div',
            {
              className: (0, J.Z)(
                we['panel-wrapper-outer'],
                ((t = {}), (t[we.mobile] = a), (t[we.open] = c), t)
              ),
              style: (0, $.pi)({}, a ? { top: r, bottom: i } : h)
            },
            E.createElement(
              Ye,
              {
                type: 'navigation',
                isMobile: a,
                width: u,
                isOpen: c,
                isHidden: o,
                onToggle: d,
                toggleRefs: p,
                onClick: f,
                contentClassName: (0, J.Z)(we.navigation, be),
                closeClassName: (0, J.Z)(we['navigation-close'], Ee),
                toggleClassName: (0, J.Z)(we['navigation-toggle'], xe),
                topOffset: r,
                bottomOffset: i,
                ariaLabels: n
              },
              s
            )
          )
        );
      }
      function et(e) {
        var t,
          n = e.ariaLabels,
          i = e.drawerWidth,
          r = e.footerHeight,
          o = e.headerHeight,
          a = e.isHidden,
          s = e.isMobile,
          l = e.onToolsToggle,
          u = e.panelHeightStyle,
          c = e.splitPanel,
          f = e.splitPanelContext,
          d = e.toggleRefs,
          h = e.tools,
          p = e.toolsHide,
          v = e.toolsOpen,
          _ = e.toolsWidth,
          m = e.splitPanelOpen && Boolean(c);
        return E.createElement(
          E.Fragment,
          null,
          E.createElement(
            'div',
            { style: { width: i } },
            E.createElement(
              'div',
              {
                className: (0, J.Z)(
                  we['panel-wrapper-outer'],
                  ((t = {}), (t[we.mobile] = s), (t[we.open] = v), t)
                ),
                style: (0, $.pi)({}, s ? { top: o, bottom: r } : u)
              },
              c && E.createElement(Pe, { context: f }, c),
              !p &&
                E.createElement(
                  Ye,
                  {
                    type: 'tools',
                    isMobile: s,
                    width: _,
                    isOpen: v,
                    onToggle: l,
                    toggleRefs: d,
                    isHidden: a,
                    externalizedToggle: Boolean(c),
                    contentClassName: (0, J.Z)(we.tools, Ne),
                    closeClassName: (0, J.Z)(we['tools-close'], je),
                    toggleClassName: (0, J.Z)(we['tools-toggle'], ze),
                    topOffset: o,
                    bottomOffset: r,
                    ariaLabels: n,
                    extendRight: 0,
                    hasDividerWithSplitPanel: m
                  },
                  h
                )
            )
          )
        );
      }
      var tt = n(4673);
      var nt = n(857),
        it = n(2391),
        rt = n(1170),
        ot = n(7345);
      function at() {
        var e,
          t,
          n,
          i,
          r,
          o,
          a,
          s = (0, E.useContext)(rt.T),
          l = s.ariaLabels,
          u = s.breadcrumbs,
          c = s.contentHeader,
          f = s.contentType,
          d = s.dynamicOverlapHeight,
          h = s.handleNavigationClick,
          p = s.handleToolsClick,
          v = s.hasNotificationsContent,
          _ = s.isMobile,
          m = s.navigationHide,
          g = s.isNavigationOpen,
          w = s.isToolsOpen,
          y = s.toolsHide,
          b = s.isAnyPanelOpen,
          x = Ze(g),
          k = Ze(w);
        return m && !u && y
          ? null
          : E.createElement(
              'section',
              {
                'aria-hidden': (!_ && !u) || void 0,
                className: (0, J.Z)(
                  ot.Z.appbar,
                  ((e = {}),
                  (e[ot.Z['has-breadcrumbs']] = u),
                  (e[ot.Z.unfocusable] = _ && b),
                  (e[Te] = _),
                  e),
                  'awsui-context-content-header'
                )
              },
              !m &&
                _ &&
                E.createElement(
                  'nav',
                  { className: (0, J.Z)(ot.Z['appbar-nav'], ((t = {}), (t[Oe] = !g), t)), 'aria-hidden': g },
                  E.createElement(ce.l, {
                    ariaLabel:
                      null !== (r = null === l || void 0 === l ? void 0 : l.navigationToggle) && void 0 !== r
                        ? r
                        : void 0,
                    ariaExpanded: g,
                    iconName: 'menu',
                    formAction: 'none',
                    onClick: function () {
                      return h(!0);
                    },
                    variant: 'icon',
                    className: xe,
                    ref: x.toggle,
                    disabled: b
                  })
                ),
              u &&
                E.createElement(
                  'div',
                  {
                    className: (0, J.Z)(
                      ot.Z.breadcrumbs,
                      ot.Z['content-type-'.concat(f)],
                      Se,
                      ((n = {}),
                      (n[ot.Z['has-dynamic-overlap-height']] = d > 0),
                      (n[ot.Z['has-header']] = c),
                      (n[ot.Z['has-notifications-content']] = v),
                      n)
                    )
                  },
                  u
                ),
              !y &&
                _ &&
                E.createElement(
                  'aside',
                  {
                    className: (0, J.Z)(ot.Z['appbar-tools'], ((i = {}), (i[Oe] = !w), i)),
                    'aria-hidden': w,
                    'aria-label':
                      null !== (o = null === l || void 0 === l ? void 0 : l.tools) && void 0 !== o
                        ? o
                        : void 0
                  },
                  E.createElement(ce.l, {
                    className: ze,
                    ariaExpanded: w,
                    disabled: b,
                    ariaLabel:
                      null !== (a = null === l || void 0 === l ? void 0 : l.toolsToggle) && void 0 !== a
                        ? a
                        : void 0,
                    iconName: 'status-info',
                    formAction: 'none',
                    onClick: function () {
                      return p(!0);
                    },
                    variant: 'icon',
                    ref: k.toggle
                  })
                )
            );
      }
      function st() {
        var e,
          t = (0, E.useContext)(rt.T),
          n = t.contentType,
          i = t.hasNotificationsContent,
          r = t.stickyNotifications;
        return E.createElement(
          'div',
          { className: (0, J.Z)(ot.Z.background, 'awsui-context-content-header') },
          E.createElement('div', {
            className: (0, J.Z)(
              ot.Z['notifications-appbar-header'],
              ot.Z['content-type-'.concat(n)],
              ((e = {}), (e[ot.Z['has-notifications-content']] = i), (e[ot.Z['sticky-notifications']] = r), e)
            )
          }),
          E.createElement('div', { className: (0, J.Z)(ot.Z.overlap, ot.Z['content-type-'.concat(n)]) })
        );
      }
      function lt() {
        var e,
          t = (0, E.useContext)(rt.T),
          n = t.breadcrumbs,
          i = t.contentHeader,
          r = t.hasNotificationsContent;
        return i
          ? E.createElement(
              'header',
              {
                className: (0, J.Z)(
                  ot.Z.content,
                  ((e = {}), (e[ot.Z['has-breadcrumbs']] = n), (e[ot.Z['has-notifications-content']] = r), e),
                  'awsui-context-content-header'
                )
              },
              i
            )
          : null;
      }
      var ut = n(9095);
      function ct(e) {
        var t,
          n,
          i,
          r,
          o,
          a,
          s = e.children,
          l = (0, E.useContext)(rt.T),
          u = l.contentHeader,
          c = l.contentType,
          f = l.disableBodyScroll,
          d = l.disableContentHeaderOverlap,
          h = l.dynamicOverlapHeight,
          p = l.footerHeight,
          v = l.hasNotificationsContent,
          _ = l.headerHeight,
          m = l.isNavigationOpen,
          g = l.isSplitPanelOpen,
          w = l.isToolsOpen,
          y = l.layoutElement,
          b = l.layoutWidth,
          x = l.mainOffsetLeft,
          k = l.maxContentWidth,
          C = l.minContentWidth,
          S = l.navigationHide,
          N = l.notificationsHeight,
          j = l.setOffsetBottom,
          z = l.splitPanel,
          O = l.stickyNotifications,
          T = l.toolsHide,
          R = (0, E.useContext)(Le.C),
          B = R.getHeader,
          A = R.position,
          L = R.size,
          P = (function (e, t, n) {
            var i = !1;
            (n || (!t && e <= 0)) && (i = !0);
            return i;
          })(h, u, d),
          Z = (function (e, t) {
            return !(!e && !t);
          })(m, S),
          M = (function (e, t, n, i, r) {
            var o = !1;
            !i && r && (o = !0);
            (i && t) || r || !n || (o = !0);
            i && 'bottom' === e && (n || r) && (o = !0);
            i && t && 'side' === e && (o = !0);
            return o;
          })(A, g, w, z, T);
        return (
          (0, E.useLayoutEffect)(
            function () {
              var e = p;
              if (z && 'bottom' === A)
                if (g) e += L;
                else {
                  var t = B();
                  e += t ? t.clientHeight : 0;
                }
              j(e);
            },
            [p, B, g, j, A, z, L]
          ),
          E.createElement(
            'main',
            {
              className: (0, J.Z)(
                ot.Z.layout,
                ot.Z['content-type-'.concat(c)],
                ot.Z['split-panel-position-'.concat(null !== A && void 0 !== A ? A : 'bottom')],
                ((t = {}),
                (t[ot.Z['disable-body-scroll']] = f),
                (t[Re] = f),
                (t[ot.Z['has-content-gap-left']] = Z),
                (t[ot.Z['has-content-gap-right']] = M),
                (t[ot.Z['has-max-content-width']] = k && k > 0),
                (t[ot.Z['has-split-panel']] = z),
                (t[ot.Z['has-sticky-notifications']] = O && v),
                (t[ot.Z['is-overlap-disabled']] = P),
                t),
                ye
              ),
              ref: y,
              style: (0, $.pi)(
                (0, $.pi)(
                  (0, $.pi)(
                    (0, $.pi)(
                      ((n = {}),
                      (n[ut.Z.headerHeight] = ''.concat(_, 'px')),
                      (n[ut.Z.footerHeight] = ''.concat(p, 'px')),
                      (n[ut.Z.layoutWidth] = ''.concat(b, 'px')),
                      (n[ut.Z.mainOffsetLeft] = ''.concat(x, 'px')),
                      n),
                      k && ((i = {}), (i[ut.Z.maxContentWidth] = ''.concat(k, 'px')), i)
                    ),
                    C && ((r = {}), (r[ut.Z.minContentWidth] = ''.concat(C, 'px')), r)
                  ),
                  ((o = {}), (o[ut.Z.notificationsHeight] = ''.concat(N, 'px')), o)
                ),
                !P && h > 0 && ((a = {}), (a[ut.Z.overlapHeight] = ''.concat(h, 'px')), a)
              )
            },
            s
          )
        );
      }
      function ft() {
        var e,
          t = (0, E.useContext)(rt.T),
          n = t.breadcrumbs,
          i = t.content,
          r = t.contentHeader,
          o = t.contentType,
          a = t.disableContentPaddings,
          s = t.dynamicOverlapHeight,
          l = t.hasNotificationsContent,
          u = t.isNavigationOpen,
          c = t.isSplitPanelOpen,
          f = t.isToolsOpen,
          d = t.isMobile,
          h = t.isAnyPanelOpen,
          p = t.mainElement,
          v = (0, E.useContext)(Le.C).position,
          _ = d && h;
        return E.createElement(
          'div',
          {
            className: (0, J.Z)(
              ot.Z.container,
              ot.Z['content-type-'.concat(o)],
              ot.Z['split-panel-position-'.concat(null !== v && void 0 !== v ? v : 'bottom')],
              ((e = {}),
              (e[ot.Z['disable-content-paddings']] = a),
              (e[ot.Z['has-breadcrumbs']] = n),
              (e[ot.Z['has-dynamic-overlap-height']] = s > 0),
              (e[ot.Z['has-header']] = r),
              (e[ot.Z['has-notifications-content']] = l),
              (e[ot.Z['is-navigation-open']] = u),
              (e[ot.Z['is-tools-open']] = f),
              (e[ot.Z['is-split-panel-open']] = c),
              (e[ot.Z.unfocusable] = _),
              e),
              ke
            ),
            ref: p
          },
          i
        );
      }
      var dt = n(3090),
        ht = n(789);
      function pt(e, t) {
        var n,
          i = e.ariaLabel,
          r = e.iconName,
          o = e.onClick,
          a = e.selected,
          s = void 0 !== a && a,
          l = e.className,
          u = (0, dt.Z)();
        return E.createElement(
          'button',
          (0, $.pi)(
            {
              'aria-label': i,
              'aria-expanded': !1,
              className: (0, J.Z)(ot.Z.trigger, ((n = {}), (n[ot.Z.selected] = s), n), l),
              onClick: o,
              type: 'button',
              ref: t
            },
            u
          ),
          E.createElement(ht.Z, { name: r })
        );
      }
      var vt = E.forwardRef(pt),
        _t = n(7398);
      function mt() {
        var e = (0, E.useContext)(rt.T),
          t = e.ariaLabels,
          n = e.handleNavigationClick,
          i = e.isMobile,
          r = e.isNavigationOpen,
          o = e.navigation,
          a = e.navigationHide,
          s = e.navigationWidth,
          l = e.isToolsOpen,
          u = e.isAnyPanelOpen,
          c = e.toolsHide,
          f = Ze(r);
        if (a) return null;
        var d = function (e) {
            (0, Ie.jX)(e.target, function (e) {
              return 'A' === e.tagName && !!e.href;
            }) &&
              i &&
              n(!1);
          },
          h = i && u && l && !c;
        return E.createElement(_t.u, { in: r }, function (e, a) {
          var l, u, c, p, v, _, m;
          return E.createElement(
            'div',
            {
              className: (0, J.Z)(
                ot.Z['navigation-container'],
                ((l = {}), (l[Oe] = !r), (l[ot.Z.unfocusable] = h), l)
              ),
              style: (0, $.pi)({}, s && ((u = {}), (u[ut.Z.navigationWidth] = ''.concat(s, 'px')), u))
            },
            !i &&
              E.createElement(
                'nav',
                {
                  'aria-hidden': !(!i && !r),
                  'aria-label':
                    null !== (v = null === t || void 0 === t ? void 0 : t.navigation) && void 0 !== v
                      ? v
                      : void 0,
                  className: (0, J.Z)(
                    ot.Z['show-navigation'],
                    ((c = {}), (c[ot.Z.animating] = 'exiting' === e), (c[ot.Z['is-navigation-open']] = r), c)
                  ),
                  ref: 'exiting' === e ? a : void 0
                },
                E.createElement(vt, {
                  ariaLabel: null === t || void 0 === t ? void 0 : t.navigationToggle,
                  iconName: 'menu',
                  className: xe,
                  onClick: function () {
                    return n(!0);
                  },
                  ref: f.toggle
                })
              ),
            E.createElement(
              'nav',
              {
                'aria-label':
                  null !== (_ = null === t || void 0 === t ? void 0 : t.navigation) && void 0 !== _
                    ? _
                    : void 0,
                className: (0, J.Z)(
                  ot.Z.navigation,
                  ((p = {}), (p[ot.Z.animating] = 'entering' === e), (p[ot.Z['is-navigation-open']] = r), p),
                  be
                ),
                ref: 'exiting' !== e ? a : void 0,
                'aria-hidden': !r,
                onClick: function (e) {
                  d && d(e);
                }
              },
              E.createElement(
                'div',
                { className: (0, J.Z)(ot.Z['animated-content']) },
                E.createElement(
                  'div',
                  { className: (0, J.Z)(ot.Z['hide-navigation']) },
                  E.createElement(ce.l, {
                    ariaLabel:
                      null !== (m = null === t || void 0 === t ? void 0 : t.navigationClose) && void 0 !== m
                        ? m
                        : void 0,
                    iconName: i ? 'close' : 'angle-left',
                    onClick: function () {
                      return n(!1);
                    },
                    variant: 'icon',
                    formAction: 'none',
                    className: Ee,
                    ref: f.close
                  })
                ),
                o
              )
            )
          );
        });
      }
      function gt() {
        var e,
          t,
          n = (0, E.useContext)(rt.T),
          i = n.ariaLabels,
          r = n.hasNotificationsContent,
          o = n.notifications,
          a = n.notificationsElement,
          s = n.stickyNotifications;
        return o
          ? E.createElement(
              'div',
              {
                'aria-label':
                  null !== (t = null === i || void 0 === i ? void 0 : i.notifications) && void 0 !== t
                    ? t
                    : void 0,
                className: (0, J.Z)(
                  ot.Z.notifications,
                  ((e = {}),
                  (e[ot.Z['has-notifications-content']] = r),
                  (e[ot.Z['sticky-notifications']] = s),
                  e),
                  Ce,
                  'awsui-context-content-header'
                ),
                role: 'region',
                ref: a
              },
              o
            )
          : null;
      }
      var wt = n(5857),
        yt = (n(913), 'awsui_root_1r9lg_1uze1_303'),
        bt = 'awsui_open-button_1r9lg_1uze1_451';
      function xt(e) {
        var t = e.children,
          n = (0, E.useContext)(rt.T),
          i = n.ariaLabels,
          r = n.handleSplitPanelClick,
          o = n.handleToolsClick,
          a = n.hasDefaultToolsWidth,
          s = n.isNavigationOpen,
          l = n.isMobile,
          u = n.isSplitPanelOpen,
          c = n.isToolsOpen,
          f = n.splitPanel,
          d = n.tools,
          h = n.toolsHide,
          p = n.toolsWidth,
          v = n.isAnyPanelOpen,
          _ = n.navigationHide,
          m = (0, E.useContext)(Le.C),
          g = m.position,
          w = m.openButtonAriaLabel,
          y = (function (e, t) {
            return !(!e || 'side' !== t);
          })(f, g),
          b = (function (e, t, n, i, r) {
            var o = !1;
            t || (e && !r && (o = !0), e && !n && r && (o = !0), e || r || i || (o = !0));
            return o;
          })(y, l, u, c, h),
          x = (function (e, t, n, i) {
            var r = !1;
            e && !i && (t || n) && (r = !0);
            return r;
          })(y, u, c, h),
          k = Ze(c);
        if (h && !y) return null;
        var C = l && v && s && !_;
        return E.createElement(_t.u, { in: null !== c && void 0 !== c && c }, function (e, n) {
          var s, f, v, _, m, g, S;
          return E.createElement(
            'div',
            {
              className: (0, J.Z)(
                ot.Z['tools-container'],
                ((s = {}), (s[Oe] = !c), (s[ot.Z.unfocusable] = C), s)
              ),
              style:
                ((f = {}),
                (f[ut.Z.toolsAnimationStartingOpacity] = ''.concat(y && u ? 1 : 0)),
                (f[ut.Z.toolsWidth] = a ? '' : ''.concat(p, 'px')),
                f)
            },
            t,
            !h &&
              E.createElement(
                'aside',
                {
                  'aria-hidden': !c,
                  'aria-label':
                    null !== (m = null === i || void 0 === i ? void 0 : i.tools) && void 0 !== m ? m : void 0,
                  className: (0, J.Z)(
                    ot.Z.tools,
                    ((v = {}),
                    (v[ot.Z.animating] = 'entering' === e),
                    (v[ot.Z['has-tools-form-persistence']] = x),
                    (v[ot.Z['is-tools-open']] = c),
                    v),
                    Ne
                  ),
                  ref: 'exiting' !== e ? n : void 0
                },
                E.createElement(
                  'div',
                  { className: (0, J.Z)(ot.Z['animated-content']) },
                  E.createElement(
                    'div',
                    { className: (0, J.Z)(ot.Z['hide-tools']) },
                    E.createElement(ce.l, {
                      ariaLabel:
                        null !== (g = null === i || void 0 === i ? void 0 : i.toolsClose) && void 0 !== g
                          ? g
                          : void 0,
                      iconName: l ? 'close' : 'angle-right',
                      onClick: function () {
                        return o(!1);
                      },
                      variant: 'icon',
                      formAction: 'none',
                      className: je,
                      ref: k.close
                    })
                  ),
                  d
                )
              ),
            !l &&
              E.createElement(
                'aside',
                {
                  'aria-hidden': !b,
                  'aria-label':
                    null !== (S = null === i || void 0 === i ? void 0 : i.tools) && void 0 !== S ? S : void 0,
                  className: (0, J.Z)(
                    ot.Z['show-tools'],
                    ((_ = {}),
                    (_[ot.Z.animating] = 'exiting' === e),
                    (_[ot.Z['has-tools-form']] = b),
                    (_[ot.Z['has-tools-form-persistence']] = x),
                    _),
                    yt
                  ),
                  ref: 'exiting' === e ? n : void 0
                },
                !h &&
                  E.createElement(vt, {
                    ariaLabel: null === i || void 0 === i ? void 0 : i.toolsToggle,
                    iconName: 'status-info',
                    onClick: function () {
                      return o(!c);
                    },
                    selected: y && c,
                    className: ze,
                    ref: k.toggle
                  }),
                y &&
                  E.createElement(vt, {
                    ariaLabel: w,
                    iconName: 'view-vertical',
                    onClick: function () {
                      return r();
                    },
                    selected: y && u,
                    className: bt
                  })
              )
          );
        });
      }
      var Et = E.forwardRef(function (e, t) {
          var n = (0, E.useContext)(rt.T).isMobile;
          return E.createElement(
            rt.w,
            (0, $.pi)({}, e, { ref: t }),
            E.createElement(
              wt.Z,
              null,
              E.createElement(
                ct,
                null,
                E.createElement(st, null),
                E.createElement(mt, null),
                n && E.createElement(at, null),
                E.createElement(gt, null),
                !n && E.createElement(at, null),
                E.createElement(lt, null),
                E.createElement(ft, null),
                E.createElement(wt.Z.Bottom, null),
                E.createElement(xt, null, E.createElement(wt.Z.Side, null))
              )
            )
          );
        }),
        kt = E.forwardRef(function (e, t) {
          var n = e.contentType,
            i = void 0 === n ? 'default' : n,
            r = e.headerSelector,
            o = void 0 === r ? '#b #h' : r,
            a = e.footerSelector,
            s = void 0 === a ? '#b #f' : a,
            l = (0, $._T)(e, ['contentType', 'headerSelector', 'footerSelector']),
            u = (0, Fe.Z)('AppLayout').__internalRootRef,
            c = (0, We.LV)(u),
            f = (0, $.pi)({ contentType: i, headerSelector: o, footerSelector: s }, l),
            d = (0, Y.j)(l);
          return E.createElement(
            'div',
            (0, $.pi)({ ref: u }, d),
            c
              ? E.createElement(Et, (0, $.pi)({}, f, { ref: t }))
              : E.createElement(Ct, (0, $.pi)({}, f, { ref: t }))
          );
        }),
        Ct = E.forwardRef(function (e, t) {
          var n,
            i,
            r = e.navigation,
            o = e.navigationWidth,
            a = void 0 === o ? 280 : o,
            s = e.navigationHide,
            l = e.navigationOpen,
            u = e.tools,
            c = e.toolsWidth,
            f = void 0 === c ? 290 : c,
            d = e.toolsHide,
            h = e.toolsOpen,
            p = e.breadcrumbs,
            v = e.notifications,
            _ = e.stickyNotifications,
            m = e.contentHeader,
            g = e.disableContentHeaderOverlap,
            w = e.content,
            y = e.contentType,
            b = void 0 === y ? 'default' : y,
            x = e.disableContentPaddings,
            k = e.disableBodyScroll,
            C = e.maxContentWidth,
            S = e.minContentWidth,
            N = e.headerSelector,
            j = void 0 === N ? '#b #h' : N,
            z = e.footerSelector,
            O = void 0 === z ? '#b #f' : z,
            T = e.ariaLabels,
            R = e.splitPanel,
            B = e.splitPanelSize,
            A = e.splitPanelOpen,
            L = e.splitPanelPreferences,
            P = e.onSplitPanelPreferencesChange,
            Z = e.onSplitPanelResize,
            M = e.onSplitPanelToggle,
            I = e.onNavigationChange,
            H = e.onToolsChange;
          nt.y &&
            h &&
            d &&
            (0, it.O)(
              'AppLayout',
              'You have enabled both the `toolsOpen` prop and the `toolsHide` prop. This is not supported. Set `toolsOpen` to `false` when you set `toolsHide` to `true`.'
            );
          var D = (0, E.useRef)(null),
            U = (0, ee.X)(),
            q = !!D.current && !(0, $e.g)(D.current),
            F = (0, ne.k)(b, { maxContentWidth: C, minContentWidth: S }, !1),
            W = ['cards', 'table'].indexOf(b) > -1,
            V = (0, Q.q)(l, I, !U && F.navigationOpen, {
              componentName: 'AppLayout',
              controlledProp: 'navigationOpen',
              changeHandler: 'onNavigationChange'
            }),
            G = V[0],
            K = void 0 !== G && G,
            X = V[1],
            Y = (0, Q.q)(h, H, !U && F.toolsOpen, {
              componentName: 'AppLayout',
              controlledProp: 'toolsOpen',
              changeHandler: 'onToolsChange'
            }),
            ie = Y[0],
            ae = void 0 !== ie && ie,
            se = Y[1],
            le = (0, E.useCallback)(
              function (e) {
                X(e), (0, te.B4)(I, { open: e });
              },
              [X, I]
            ),
            ce = (0, E.useCallback)(
              function (e) {
                se(e), (0, te.B4)(H, { open: e });
              },
              [se, H]
            ),
            fe = !s && K,
            de = !d && ae,
            he = (function (e, t, n) {
              var i,
                r = (0, Me.x)(e),
                o = (0, Me.x)(t),
                a = (0, E.useState)(0),
                s = a[0],
                l = a[1];
              (0, E.useEffect)(
                function () {
                  var e = requestAnimationFrame(function () {
                    return l(r + o);
                  });
                  return function () {
                    return cancelAnimationFrame(e);
                  };
                },
                [r, o]
              );
              var u = 'calc(100vh - '.concat(s, 'px)');
              return {
                headerHeight: r,
                footerHeight: o,
                contentHeightStyle: ((i = {}), (i[n ? 'height' : 'minHeight'] = u), i),
                panelHeightStyle: { height: u }
              };
            })(j, O, k),
            pe = he.contentHeightStyle,
            ve = he.headerHeight,
            _e = he.footerHeight,
            me = he.panelHeightStyle,
            ge = (0, re.D)(function (e) {
              return e.height;
            }),
            be = ge[0],
            xe = ge[1],
            Ee = (0, re.D)(
              function (e) {
                return R ? e.height : 0;
              },
              [R]
            ),
            Ne = Ee[0],
            je = Ee[1],
            ze = (0, E.useRef)(null),
            Oe = (0, oe.q)(je, ze),
            Te = fe || de,
            Be = !!be && be > 0,
            Le = _ ? be : null,
            Ue = (0, Q.q)(L, P, void 0, {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelPreferences',
              changeHandler: 'onSplitPanelPreferencesChange'
            }),
            Fe = Ue[0],
            We = Ue[1],
            Ve = (null === Fe || void 0 === Fe ? void 0 : Fe.position) || 'bottom',
            Ke = (0, re.D)(
              function (e) {
                return R ? e.height : 0;
              },
              [R, Ve]
            ),
            Ye = Ke[0],
            rt = Ke[1],
            ot = 40,
            at = s ? 0 : K ? a : ot,
            st =
              !d || (R && 'side' === (null === Fe || void 0 === Fe ? void 0 : Fe.position))
                ? ae
                  ? f
                  : ot
                : 0,
            lt = (0, qe.LV)(Ve),
            ut = (0, Q.q)(B, Z, lt, {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelSize',
              changeHandler: 'onSplitPanelResize'
            }),
            ct = ut[0],
            ft = void 0 === ct ? lt : ct,
            dt = ut[1],
            ht = (0, Q.q)(A, M, !1, {
              componentName: 'AppLayout',
              controlledProp: 'splitPanelOpen',
              changeHandler: 'onSplitPanelToggle'
            }),
            pt = ht[0],
            vt = void 0 !== pt && pt,
            _t = ht[1],
            mt = (0, E.useRef)(null),
            gt = (0, E.useRef)(null),
            wt = (0, E.useCallback)(
              function (e) {
                We(e), (0, te.B4)(P, e);
              },
              [We, P]
            ),
            yt = (0, E.useCallback)(
              function (e) {
                dt(e.size), (0, te.B4)(Z, e);
              },
              [dt, Z]
            ),
            bt = (0, E.useCallback)(
              function () {
                _t(!vt), (0, te.B4)(M, { open: !vt });
              },
              [_t, vt, M]
            ),
            xt = (0, De.S)(function () {
              if (!mt.current || !F.minContentWidth) return NaN;
              var e = parseInt(getComputedStyle(mt.current).width),
                t = x ? 80 : 0,
                n = e - F.minContentWidth - t,
                i = 'side' === Nt ? ft : 0;
              return Math.max(0, i + n);
            }),
            Et = (0, De.S)(function () {
              return 'undefined' === typeof document
                ? 0
                : k && gt.current
                ? (e = gt.current.clientHeight) < qe.Zl
                  ? e
                  : e - qe.pV
                : (e = document.documentElement.clientHeight - ve - _e) < qe.Zl
                ? e - qe.lX
                : e - qe.pV;
              var e;
            }),
            kt = (0, E.useState)(!1),
            Ct = kt[0],
            St = kt[1],
            Nt = Ct ? 'bottom' : Ve,
            jt = Boolean(R) && 'side' === Nt && vt,
            zt = (function () {
              var e = (0, E.useState)(function () {
                  return window.innerWidth;
                }),
                t = e[0],
                n = e[1];
              return (
                (0, E.useEffect)(function () {
                  var e = function () {
                    return n(window.innerWidth);
                  };
                  return (
                    window.addEventListener('resize', e),
                    function () {
                      return window.removeEventListener('resize', e);
                    }
                  );
                }, []),
                t
              );
            })(),
            Ot = (function (e) {
              var t = (0, E.useState)({ left: 0, right: 0 }),
                n = t[0],
                i = t[1],
                r = (0, E.useCallback)(
                  function () {
                    if (e) {
                      var t = e.getBoundingClientRect(),
                        n = t.left,
                        r = t.right,
                        o = document.body.clientWidth;
                      i({ left: n, right: o - r });
                    }
                  },
                  [e]
                );
              (0, E.useEffect)(
                function () {
                  return (
                    window.addEventListener('resize', r),
                    function () {
                      return window.removeEventListener('resize', r);
                    }
                  );
                },
                [r]
              );
              var o = (0, E.useCallback)(
                function () {
                  return e;
                },
                [e]
              );
              return (0, tt.y)(o, r), n;
            })(D.current),
            Tt = Ot.left,
            Rt = Ot.right,
            Bt = zt - Tt - Rt - st - at - 0;
          (0, E.useEffect)(
            function () {
              var e = Bt - ft;
              St(U || (F.minContentWidth || 0) > e);
            },
            [Bt, F.minContentWidth, U]
          );
          var At = s || U ? 0 : ot,
            Lt = d || U ? 0 : ot,
            Pt = (0, E.useState)(),
            Zt = Pt[0],
            Mt = Pt[1];
          (0, Je.G)(
            function () {
              return Mt(vt ? { type: 'open' } : { type: 'close' });
            },
            [vt]
          ),
            (0, Je.G)(
              function () {
                return Mt({ type: 'position' });
              },
              [Ve]
            );
          var It = U ? void 0 : { maxWidth: F.maxContentWidth },
            Ht = (0, E.useState)(0),
            Dt = Ht[0],
            Ut = Ht[1],
            qt = {
              topOffset: ve + (('bottom' === Nt && Le) || 0),
              bottomOffset: _e,
              leftOffset: Tt + (U ? 0 : !s && K ? a : At),
              rightOffset: Rt + (U ? 0 : !d && ae ? f : Lt),
              position: Nt,
              size: ft,
              getMaxWidth: xt,
              getMaxHeight: Et,
              getHeader: function () {
                return ze.current;
              },
              disableContentPaddings: x,
              contentWidthStyles: It,
              isOpen: vt,
              isMobile: U,
              isRefresh: !1,
              isForcedPosition: Ct,
              lastInteraction: Zt,
              splitPanelRef: rt,
              splitPanelHeaderRef: Oe,
              onResize: yt,
              onToggle: bt,
              onPreferencesChange: wt,
              reportSize: Ut
            },
            Ft = {
              navigationPadding: s || !!K,
              toolsPadding: (d && (!R || 'side' !== Nt)) || de || jt,
              isMobile: U
            },
            Wt = Ze(K),
            Vt = Ze(ae);
          (0, E.useImperativeHandle)(
            t,
            function () {
              return {
                openTools: function () {
                  return ce(!0);
                },
                closeNavigationIfNecessary: function () {
                  U && le(!1);
                }
              };
            },
            [U, le, ce]
          );
          var Gt = null !== (i = R && 'bottom' === Nt ? (vt ? Ye : Ne) : void 0) && void 0 !== i ? i : void 0,
            Kt = U ? void 0 : { minWidth: F.minContentWidth, maxWidth: F.maxContentWidth },
            Xt = x,
            $t = U ? 0 : (d ? 0 : ae ? f : ot) + (R && 'side' === Nt ? (vt ? Dt : ot) : 0),
            Jt = U ? 0 : at,
            Yt = { isMobile: U, navigationWidth: at, toolsWidth: x ? 0 : $t || 0 };
          !(function (e) {
            var t = (0, E.useRef)();
            (0, E.useEffect)(function () {
              var n = requestAnimationFrame(function () {
                t.current = e;
              });
              return function () {
                return cancelAnimationFrame(n);
              };
            }),
              t.current;
          })(Bt - (jt ? Dt : 0));
          return E.createElement(
            'div',
            { className: (0, J.Z)(we.root, ye, k && we['root-no-scroll']), ref: D },
            E.createElement(
              'div',
              { className: we['layout-wrapper'], style: pe },
              U &&
                (!d || !s || p) &&
                E.createElement(
                  Ae,
                  {
                    anyPanelOpen: Te,
                    toggleRefs: { navigation: Wt.toggle, tools: Vt.toggle },
                    topOffset: ve,
                    ariaLabels: T,
                    navigationHide: s,
                    toolsHide: d,
                    onNavigationOpen: function () {
                      return le(!0);
                    },
                    onToolsOpen: function () {
                      return ce(!0);
                    },
                    unfocusable: Te
                  },
                  p
                ),
              E.createElement(
                'div',
                { className: (0, J.Z)(we.layout, k && we['layout-no-scroll']) },
                !s &&
                  E.createElement(Qe, {
                    ariaLabels: T,
                    footerHeight: _e,
                    headerHeight: ve,
                    isHidden: x,
                    isMobile: U,
                    isMotionEnabled: q,
                    navigation: r,
                    navigationDrawerWidth: Jt,
                    navigationOpen: K,
                    onClick: U
                      ? function (e) {
                          (0, Ie.jX)(e.target, function (e) {
                            return 'A' === e.tagName && !!e.href;
                          }) && le(!1);
                        }
                      : void 0,
                    onNavigationToggle: le,
                    panelHeightStyle: me,
                    toggleRefs: Wt,
                    navigationWidth: a
                  }),
                E.createElement(
                  'main',
                  {
                    ref: gt,
                    className: (0, J.Z)(
                      we['layout-main'],
                      ((n = {}),
                      (n[we['layout-main-scrollable']] = k),
                      (n[Re] = k),
                      (n[we.unfocusable] = U && Te),
                      n)
                    )
                  },
                  E.createElement(
                    'div',
                    { style: { marginBottom: Gt, transform: void 0 } },
                    v &&
                      E.createElement(
                        Xe,
                        (0, $.pi)({}, Yt, { topOffset: k ? 0 : ve, sticky: !U && W && _ }),
                        E.createElement(
                          ue,
                          {
                            testUtilsClassName: (0, J.Z)(we.notifications, Ce),
                            labels: T,
                            topOffset: ve,
                            sticky: !U && _,
                            ref: xe,
                            isMobile: U,
                            navigationPadding: Ft.navigationPadding,
                            toolsPadding: Ft.toolsPadding,
                            contentWidthStyles: Kt
                          },
                          v
                        )
                      ),
                    ((!U && p) || m) &&
                      E.createElement(
                        Xe,
                        (0, $.pi)({}, Yt),
                        E.createElement(
                          Ge,
                          (0, $.pi)({}, Ft, { contentWidthStyles: Kt }),
                          !U &&
                            p &&
                            E.createElement(
                              'div',
                              {
                                className: (0, J.Z)(
                                  we.breadcrumbs,
                                  Se,
                                  we['breadcrumbs-desktop'],
                                  W && we['breadcrumbs-desktop-sticky-header']
                                )
                              },
                              p
                            ),
                          m &&
                            E.createElement(
                              'div',
                              {
                                className: (0, J.Z)(
                                  we['content-header-wrapper'],
                                  !Be && (U || !p) && we['content-extra-top-padding'],
                                  !Be && !p && we['content-header-wrapper-first-child'],
                                  !g && we['content-header-wrapper-overlapped']
                                )
                              },
                              m
                            )
                        )
                      ),
                    E.createElement(
                      Ge,
                      (0, $.pi)({}, Ft, {
                        ref: mt,
                        disablePaddings: x,
                        className: (0, J.Z)(
                          !x && we['content-wrapper'],
                          !x && (U || !p) && !m && we['content-extra-top-padding'],
                          !Be && !p && !U && !m && we['content-wrapper-first-child']
                        )
                      }),
                      E.createElement(
                        'div',
                        {
                          className: (0, J.Z)(we.content, ke, !g && m && we['content-overlapped']),
                          style: Kt
                        },
                        E.createElement(
                          He.T.Provider,
                          {
                            value: {
                              stickyOffsetTop: (k ? 0 : ve) + (null !== Le ? Le : 0),
                              stickyOffsetBottom: _e + (Gt || 0)
                            }
                          },
                          w
                        )
                      )
                    )
                  ),
                  'bottom' === Nt && E.createElement(Pe, { context: qt }, R)
                ),
                E.createElement(et, {
                  splitPanel: 'side' === Nt ? R : void 0,
                  ariaLabels: T,
                  closedDrawerWidth: ot,
                  contentHeightStyle: pe,
                  disableContentPaddings: x,
                  drawerWidth: $t,
                  footerHeight: _e,
                  headerHeight: ve,
                  isHidden: Xt,
                  isMobile: U,
                  isMotionEnabled: q,
                  onToolsToggle: ce,
                  panelHeightStyle: me,
                  splitPanelContext: qt,
                  splitPanelOpen: jt,
                  splitPanelReportedSize: Dt,
                  toggleRefs: Vt,
                  tools: u,
                  toolsHide: Boolean(d),
                  toolsOpen: ae,
                  toolsWidth: f
                })
              )
            )
          );
        });
      (0, Ue.b)(kt, 'AppLayout');
      var St = kt,
        Nt = (n(3144), 'awsui_breadcrumb-group_d19fg_zzbk1_93'),
        jt = 'awsui_item_d19fg_zzbk1_105',
        zt = 'awsui_breadcrumb-group-list_d19fg_zzbk1_116',
        Ot = 'awsui_ellipsis_d19fg_zzbk1_126',
        Tt = 'awsui_icon_d19fg_zzbk1_134',
        Rt = 'awsui_mobile_d19fg_zzbk1_138',
        Bt =
          (n(3950),
          {
            'button-dropdown': 'awsui_button-dropdown_sne0l_1gwdq_93',
            'items-list-container': 'awsui_items-list-container_sne0l_1gwdq_97',
            'awsui-motion-fade-in-0': 'awsui_awsui-motion-fade-in-0_sne0l_1gwdq_1',
            'rotate-up': 'awsui_rotate-up_sne0l_1gwdq_114',
            'rotate-down': 'awsui_rotate-down_sne0l_1gwdq_129',
            header: 'awsui_header_sne0l_1gwdq_144',
            title: 'awsui_title_sne0l_1gwdq_153',
            description: 'awsui_description_sne0l_1gwdq_154'
          }),
        At = n(3366),
        Lt = n(9591),
        Pt = function (e) {
          return e && void 0 !== e.items;
        },
        Zt = function (e) {
          return e && void 0 !== e.href;
        },
        Mt = function (e) {
          return e.external ? '_blank' : void 0;
        };
      function It(e, t) {
        for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
        return !0;
      }
      function Ht(e, t) {
        if (e.length !== t.length) return !1;
        for (var n = 0; n < e.length; n++) if (e[n] !== t[n]) return !1;
        return !0;
      }
      n(7874);
      var Dt = {
          'item-element': 'awsui_item-element_93a1u_1cg8g_93',
          disabled: 'awsui_disabled_93a1u_1cg8g_103',
          last: 'awsui_last_93a1u_1cg8g_110',
          highlighted: 'awsui_highlighted_93a1u_1cg8g_113',
          'variant-icon': 'awsui_variant-icon_93a1u_1cg8g_117',
          'variant-normal': 'awsui_variant-normal_93a1u_1cg8g_117',
          'variant-primary': 'awsui_variant-primary_93a1u_1cg8g_117',
          'variant-navigation': 'awsui_variant-navigation_93a1u_1cg8g_127',
          first: 'awsui_first_93a1u_1cg8g_130',
          'has-category-header': 'awsui_has-category-header_93a1u_1cg8g_130',
          'menu-item': 'awsui_menu-item_93a1u_1cg8g_144',
          icon: 'awsui_icon_93a1u_1cg8g_162',
          'external-icon': 'awsui_external-icon_93a1u_1cg8g_167'
        },
        Ut = n(3),
        qt = n(9258),
        Ft = n(8742),
        Wt = n(2675),
        Vt = n(4125);
      function Gt(e) {
        var t = e.children,
          n = e.content,
          i = e.position,
          r = void 0 === i ? 'right' : i,
          o = (0, E.useRef)(null),
          a = (function (e) {
            var t = (0, E.useRef)(),
              n = (0, E.useState)(!1),
              i = n[0],
              r = n[1],
              o = function () {
                clearTimeout(t.current), r(!1);
              },
              a = function () {
                return r(!0);
              },
              s = function (e) {
                i && Kt(e.key) && (e.preventDefault(), e.stopPropagation(), o());
              };
            return {
              open: i,
              triggerProps: {
                onBlur: o,
                onFocus: function () {
                  t.current = setTimeout(a, e);
                },
                onKeyDown: s
              }
            };
          })((0, We.JZ)(o) ? 0 : 120),
          s = a.open,
          l = a.triggerProps,
          u = (0, Vt.g)(o);
        return E.createElement(
          'span',
          (0, $.pi)({ ref: o }, l),
          t,
          s &&
            E.createElement(
              Wt.Z,
              null,
              E.createElement(
                'span',
                { className: u },
                E.createElement(
                  qt.Z,
                  {
                    position: r,
                    trackRef: o,
                    arrow: function (e) {
                      return E.createElement(Ut.Z, { position: e });
                    },
                    renderWithPortal: !0,
                    zIndex: 7e3
                  },
                  E.createElement(
                    Ft.Z,
                    {
                      size: 'small',
                      fixedWidth: !1,
                      dismissButton: !1,
                      dismissAriaLabel: void 0,
                      header: null,
                      onDismiss: function () {},
                      overflowVisible: 'both'
                    },
                    E.createElement(
                      'span',
                      { 'data-testid': 'button-dropdown-disabled-reason', role: 'tooltip' },
                      n
                    )
                  )
                )
              )
            )
        );
      }
      var Kt = function (e) {
        return 'Escape' === e || 'Esc' === e;
      };
      function Xt(e) {
        var t = (0, At.L)();
        return {
          targetProps: { 'aria-describedby': e ? t : void 0 },
          descriptionEl: e ? E.createElement('span', { id: t, hidden: !0 }, e) : null
        };
      }
      var $t = n(5088),
        Jt = function (e) {
          var t = e.disabled,
            n = e.parent;
          return {
            role: 'menuitem',
            'aria-disabled': t ? 'true' : void 0,
            'aria-haspopup': n ? 'true' : void 0,
            'aria-expanded': e.expanded ? 'true' : n ? 'false' : void 0
          };
        };
      function Yt(e) {
        var t = e.item,
          n = e.disabled,
          i = e.highlighted,
          r = (0, E.useRef)(null);
        (0, E.useEffect)(
          function () {
            i && r.current && r.current.focus();
          },
          [i]
        );
        var o = n && t.disabledReason,
          a = Xt(t.disabledReason),
          s = a.targetProps,
          l = a.descriptionEl,
          u = (0, $.pi)(
            (0, $.pi)({ className: Dt['menu-item'], ref: r, tabIndex: i ? 0 : -1 }, Jt({ disabled: n })),
            o ? s : {}
          ),
          c = Zt(t)
            ? E.createElement(
                'a',
                (0, $.pi)({}, u, {
                  href: n ? void 0 : t.href,
                  target: Mt(t),
                  rel: t.external ? 'noopener noreferrer' : void 0
                }),
                E.createElement(Qt, { item: t, disabled: n })
              )
            : E.createElement('span', (0, $.pi)({}, u), E.createElement(Qt, { item: t, disabled: n })),
          f = (0, $t.t)().position,
          d = 'bottom-left' === f || 'top-left' === f ? 'left' : 'right';
        return o ? E.createElement(Gt, { content: t.disabledReason, position: d }, c, l) : c;
      }
      var Qt = function (e) {
          var t = e.item,
            n = e.disabled,
            i = !!(t.iconName || t.iconUrl || t.iconSvg),
            r = Zt(t) && t.external;
          return E.createElement(
            E.Fragment,
            null,
            i && E.createElement(en, { name: t.iconName, url: t.iconUrl, svg: t.iconSvg, alt: t.iconAlt }),
            ' ',
            t.text,
            ' ',
            r && E.createElement(tn, { disabled: n, ariaLabel: t.externalIconAriaLabel })
          );
        },
        en = function (e) {
          return E.createElement('span', { className: Dt.icon }, E.createElement(ht.Z, (0, $.pi)({}, e)));
        },
        tn = function (e) {
          var t = e.disabled,
            n = e.ariaLabel,
            i = E.createElement(ht.Z, { variant: t ? 'disabled' : 'normal', name: 'external' });
          return E.createElement(
            'span',
            { className: Dt['external-icon'], role: n ? 'img' : void 0, 'aria-label': n },
            i
          );
        },
        nn = function (e) {
          var t,
            n = e.item,
            i = e.disabled,
            r = e.onItemActivate,
            o = e.highlighted,
            a = e.highlightItem,
            s = e.first,
            l = void 0 !== s && s,
            u = e.last,
            c = e.hasCategoryHeader,
            f = e.variant,
            d = void 0 === f ? 'normal' : f,
            h = Zt(n),
            p = function (e) {
              e.preventDefault(), a(n);
            };
          return E.createElement(
            'li',
            {
              className: (0, J.Z)(
                Dt['item-element'],
                Dt['variant-'.concat(d)],
                ((t = {}),
                (t[Dt.highlighted] = o),
                (t[Dt.disabled] = i),
                (t[Dt.first] = l),
                (t[Dt.last] = u),
                (t[Dt['has-category-header']] = c),
                t)
              ),
              role: 'presentation',
              'data-testid': n.id,
              'data-description': n.description,
              onClick: function (e) {
                e.stopPropagation(), h || e.preventDefault(), i || r(n, e);
              },
              onMouseEnter: p,
              onTouchStart: p
            },
            E.createElement(Yt, { item: n, disabled: i, highlighted: o })
          );
        },
        rn =
          (n(601),
          {
            header: 'awsui_header_16mm3_o5wv1_93',
            disabled: 'awsui_disabled_16mm3_o5wv1_108',
            'expandable-header': 'awsui_expandable-header_16mm3_o5wv1_112',
            'rolled-down': 'awsui_rolled-down_16mm3_o5wv1_123',
            highlighted: 'awsui_highlighted_16mm3_o5wv1_126',
            'variant-navigation': 'awsui_variant-navigation_16mm3_o5wv1_139',
            category: 'awsui_category_16mm3_o5wv1_151',
            expandable: 'awsui_expandable_16mm3_o5wv1_112',
            'expand-icon': 'awsui_expand-icon_16mm3_o5wv1_172',
            'expand-icon-up': 'awsui_expand-icon-up_16mm3_o5wv1_179',
            'expand-icon-right': 'awsui_expand-icon-right_16mm3_o5wv1_182',
            'items-list-container': 'awsui_items-list-container_16mm3_o5wv1_196'
          }),
        on = function (e) {
          var t,
            n,
            i = e.item,
            r = e.onItemActivate,
            o = e.onGroupToggle,
            a = e.targetItem,
            s = e.isHighlighted,
            l = e.isExpanded,
            u = e.highlightItem,
            c = e.disabled,
            f = e.expandToViewport,
            d = e.variant,
            h = s(i),
            p = l(i),
            v = E.useRef(null),
            _ = (0, E.useRef)(null);
          (0, E.useEffect)(
            function () {
              v.current && h && !p && v.current.focus();
            },
            [p, h]
          );
          var m,
            g = function (e) {
              e.preventDefault(), u(i);
            },
            w = !!i.disabledReason && i.disabled,
            y = Xt(i.disabledReason),
            b = y.targetProps,
            x = y.descriptionEl,
            k =
              i.text &&
              E.createElement(
                'span',
                (0, $.pi)(
                  {
                    className: (0, J.Z)(
                      rn.header,
                      rn['expandable-header'],
                      rn['variant-'.concat(d)],
                      ((t = {}), (t[rn.disabled] = c), (t[rn.highlighted] = h), t)
                    ),
                    tabIndex: h ? 0 : -1,
                    ref: v
                  },
                  Jt({ parent: !0, expanded: p, disabled: c }),
                  w ? b : {}
                ),
                i.text,
                E.createElement(
                  'span',
                  { className: (0, J.Z)(rn['expand-icon'], rn['expand-icon-right']) },
                  E.createElement(ht.Z, { name: 'caret-down-filled' })
                )
              );
          return (
            (m = w
              ? E.createElement(Gt, { content: i.disabledReason }, k, x)
              : c
              ? k
              : E.createElement(
                  Lt.Z,
                  { open: p, stretchWidth: !1, interior: !0, expandToViewport: f, trigger: k },
                  i.items &&
                    p &&
                    E.createElement(
                      'ul',
                      { role: 'menu', 'aria-label': i.text, className: (0, J.Z)(rn['items-list-container']) },
                      E.createElement(hn, {
                        items: i.items,
                        onItemActivate: r,
                        onGroupToggle: o,
                        targetItem: a,
                        isHighlighted: s,
                        isExpanded: l,
                        highlightItem: u,
                        variant: d
                      })
                    )
                )),
            E.createElement(
              'li',
              {
                className: (0, J.Z)(
                  rn.category,
                  rn['variant-'.concat(d)],
                  rn.expandable,
                  ((n = {}), (n[rn.expanded] = p), (n[rn.disabled] = c), (n[rn.highlighted] = h), n)
                ),
                role: 'presentation',
                'data-testid': i.id,
                ref: _,
                onClick: function (e) {
                  var t;
                  c || (e.preventDefault(), o(i, e), null === (t = v.current) || void 0 === t || t.focus());
                },
                onMouseEnter: g,
                onTouchStart: g
              },
              m
            )
          );
        },
        an = function (e) {
          var t,
            n = e.item,
            i = e.onItemActivate,
            r = e.onGroupToggle,
            o = e.targetItem,
            a = e.isHighlighted,
            s = e.isExpanded,
            l = e.highlightItem,
            u = e.disabled,
            c = e.variant;
          return E.createElement(
            'li',
            {
              className: (0, J.Z)(rn.category, rn['variant-'.concat(c)], u && rn.disabled),
              role: 'presentation',
              'aria-disabled': u ? 'true' : void 0
            },
            n.text &&
              E.createElement(
                'p',
                {
                  className: (0, J.Z)(rn.header, ((t = {}), (t[rn.disabled] = u), t)),
                  'aria-hidden': 'true'
                },
                n.text
              ),
            E.createElement(
              'ul',
              { className: (0, J.Z)(rn['items-list-container']), role: 'group', 'aria-label': n.text },
              n.items &&
                E.createElement(hn, {
                  items: n.items,
                  onItemActivate: i,
                  onGroupToggle: r,
                  targetItem: o,
                  isHighlighted: a,
                  isExpanded: s,
                  highlightItem: l,
                  categoryDisabled: u,
                  hasCategoryHeader: !!n.text,
                  variant: c
                })
            )
          );
        },
        sn = (n(6774), 'awsui_root_14cnr_zbvdk_93'),
        ln = 'awsui_trigger_14cnr_zbvdk_106',
        un = 'awsui_dropdown_14cnr_zbvdk_109',
        cn = 'awsui_open_14cnr_zbvdk_123',
        fn = function (e) {
          var t,
            n = e.children,
            i = e.trigger,
            r = e.open;
          return E.createElement(
            'div',
            { className: (0, J.Z)(sn) },
            E.createElement('div', { className: ln }, i),
            E.createElement('div', { className: (0, J.Z)(un, ((t = {}), (t[cn] = r), t)), 'data-open': r }, n)
          );
        },
        dn = function (e) {
          var t,
            n,
            i,
            r = e.item,
            o = e.onItemActivate,
            a = e.onGroupToggle,
            s = e.targetItem,
            l = e.isHighlighted,
            u = e.isExpanded,
            c = e.highlightItem,
            f = e.disabled,
            d = e.variant,
            h = l(r),
            p = u(r),
            v = E.useRef(null);
          (0, E.useEffect)(
            function () {
              v.current && h && !p && v.current.focus();
            },
            [p, h]
          );
          var _,
            m = function (e) {
              e.preventDefault(), c(r);
            },
            g = !!r.disabledReason && r.disabled,
            w = Xt(r.disabledReason),
            y = w.targetProps,
            b = w.descriptionEl,
            x =
              r.text &&
              E.createElement(
                'span',
                (0, $.pi)(
                  {
                    className: (0, J.Z)(
                      rn.header,
                      rn['expandable-header'],
                      rn['variant-'.concat(d)],
                      ((t = {}), (t[rn.highlighted] = h), (t[rn['rolled-down']] = p), (t[rn.disabled] = f), t)
                    ),
                    tabIndex: h ? 0 : -1,
                    ref: v
                  },
                  Jt({ parent: !0, disabled: f, expanded: p }),
                  g ? y : {}
                ),
                r.text,
                E.createElement(
                  'span',
                  { className: (0, J.Z)(rn['expand-icon'], ((n = {}), (n[rn['expand-icon-up']] = p), n)) },
                  E.createElement(ht.Z, { name: 'caret-down-filled' })
                )
              );
          return (
            (_ = g
              ? E.createElement(E.Fragment, null, b, E.createElement(Gt, { content: r.disabledReason }, x))
              : f
              ? x
              : E.createElement(
                  fn,
                  { open: p, trigger: x },
                  r.items &&
                    p &&
                    E.createElement(
                      'ul',
                      { role: 'menu', 'aria-label': r.text, className: (0, J.Z)(rn['items-list-container']) },
                      E.createElement(hn, {
                        items: r.items,
                        onItemActivate: o,
                        onGroupToggle: a,
                        targetItem: s,
                        isHighlighted: l,
                        isExpanded: u,
                        highlightItem: c,
                        hasCategoryHeader: !0,
                        variant: d
                      })
                    )
                )),
            E.createElement(
              'li',
              {
                className: (0, J.Z)(
                  rn.category,
                  rn['variant-'.concat(d)],
                  rn.expandable,
                  ((i = {}),
                  (i[rn.expanded] = p),
                  (i[rn.disabled] = f),
                  (i[rn.highlighted] = h || p),
                  (i[rn.expandable] = !0),
                  i)
                ),
                role: 'presentation',
                onClick: function (e) {
                  f || (e.preventDefault(), a(r, e));
                },
                onMouseEnter: m,
                onTouchStart: m,
                'data-testid': r.id
              },
              _
            )
          );
        };
      function hn(e) {
        var t = e.items,
          n = e.onItemActivate,
          i = e.onGroupToggle,
          r = e.targetItem,
          o = e.isHighlighted,
          a = e.isExpanded,
          s = e.highlightItem,
          l = e.categoryDisabled,
          u = void 0 !== l && l,
          c = e.hasExpandableGroups,
          f = void 0 !== c && c,
          d = e.hasCategoryHeader,
          h = void 0 !== d && d,
          p = e.expandToViewport,
          v = void 0 !== p && p,
          _ = e.variant,
          m = void 0 === _ ? 'normal' : _,
          g = (0, ee.X)(),
          w = t.map(function (e, l) {
            var c, d, p, _;
            return Pt(e)
              ? f
                ? e.text
                  ? g
                    ? E.createElement(dn, {
                        key: l,
                        item: e,
                        onItemActivate: n,
                        onGroupToggle: i,
                        targetItem: r,
                        isHighlighted: o,
                        isExpanded: a,
                        highlightItem: s,
                        disabled: null !== (d = e.disabled) && void 0 !== d && d,
                        variant: m
                      })
                    : E.createElement(on, {
                        key: l,
                        item: e,
                        onItemActivate: n,
                        onGroupToggle: i,
                        targetItem: r,
                        isHighlighted: o,
                        isExpanded: a,
                        highlightItem: s,
                        disabled: null !== (p = e.disabled) && void 0 !== p && p,
                        expandToViewport: v,
                        variant: m
                      })
                  : null
                : E.createElement(an, {
                    key: l,
                    item: e,
                    onItemActivate: n,
                    onGroupToggle: i,
                    targetItem: r,
                    isHighlighted: o,
                    isExpanded: a,
                    highlightItem: s,
                    disabled: null !== (_ = e.disabled) && void 0 !== _ && _,
                    variant: m
                  })
              : E.createElement(nn, {
                  key: l,
                  item: e,
                  onItemActivate: n,
                  disabled: null !== (c = e.disabled) && void 0 !== c ? c : u,
                  highlighted: o(e),
                  highlightItem: s,
                  first: 0 === l || Pt(t[l - 1]),
                  last: l === t.length - 1 || Pt(t[l + 1]),
                  hasCategoryHeader: h,
                  variant: m
                });
          });
        return E.createElement(E.Fragment, null, w);
      }
      var pn = n(4233),
        vn = n(7906);
      function _n(e) {
        var t = new Map(),
          n = new Map(),
          i = [];
        return (
          mn(e, function (e, r) {
            var o = gn(r);
            t.set(e, o), n.set(o, e), i.push(o);
          }),
          {
            getItem: function (e) {
              var t = gn(e);
              return n.get(t) || null;
            },
            getItemIndex: function (e) {
              var n = t.get(e);
              if (!n) throw new Error('Invariant violation: item is not found.');
              return wn(n);
            },
            getSequentialIndex: function (e, t) {
              var n = gn(e),
                r = i.indexOf(n),
                o = i[r + t];
              return o ? wn(o) : null;
            },
            getParentIndex: function (e) {
              var n = t.get(e);
              if (!n) throw new Error('Invariant violation: item is not found.');
              var i = wn(n);
              return 1 === i.length ? null : i.slice(0, i.length - 1);
            }
          }
        );
      }
      function mn(e, t, n) {
        void 0 === n && (n = []),
          e.forEach(function (e, i) {
            var r = (0, $.ev)((0, $.ev)([], n, !0), [i], !1);
            t(e, r), Pt(e) && mn(e.items, t, r);
          });
      }
      function gn(e) {
        return e.join('-');
      }
      function wn(e) {
        return e.split('-').map(function (e) {
          return parseInt(e);
        });
      }
      function yn(e) {
        var t = e.startIndex,
          n = e.expandedIndex,
          i = e.getNext,
          r = e.hasExpandableGroups,
          o = e.isInRestrictedView;
        return (function e(a) {
          var s,
            l,
            u,
            c,
            f,
            d = i(a);
          return d
            ? ((null === (s = d.parent) || void 0 === s ? void 0 : s.disabled) && r) || (Pt(d.item) && !r)
              ? e(d.index)
              : !r || o || ((l = t), (u = d.index), Ht(l.slice(0, -1), u.slice(0, -1)))
              ? r &&
                o &&
                !(function (e, t) {
                  return e.length === t.length;
                })(d.index, n) &&
                ((c = n), (f = d.index), !Ht(c, f.slice(0, -1)))
                ? e(d.index)
                : d.index
              : e(d.index)
            : null;
        })(t);
      }
      function bn(e) {
        var t = e.items,
          n = e.onItemClick,
          i = e.onItemFollow,
          r = e.hasExpandableGroups,
          o = e.isInRestrictedView,
          a = void 0 !== o && o,
          s = e.usingMouse,
          l = (function (e) {
            var t = e.items,
              n = e.hasExpandableGroups,
              i = e.isInRestrictedView,
              r = void 0 !== i && i,
              o = (0, E.useState)([]),
              a = o[0],
              s = o[1],
              l = (0, E.useState)([]),
              u = l[0],
              c = l[1],
              f = (0, E.useMemo)(
                function () {
                  return _n(t);
                },
                [t]
              ),
              d = f.getItem,
              h = f.getItemIndex,
              p = f.getSequentialIndex,
              v = f.getParentIndex;
            return {
              targetItem: (0, E.useMemo)(
                function () {
                  return d(a);
                },
                [a, d]
              ),
              isHighlighted: (0, E.useCallback)(
                function (e) {
                  return It(h(e), a);
                },
                [a, h]
              ),
              isExpanded: (0, E.useCallback)(
                function (e) {
                  return It(h(e), u);
                },
                [u, h]
              ),
              moveHighlight: (0, E.useCallback)(
                function (e) {
                  var t = yn({
                    startIndex: a,
                    expandedIndex: u,
                    getNext: function (t) {
                      var n = p(t, e),
                        i = d(n || [-1]);
                      if (!n || !i) return null;
                      var r = v(i);
                      return { index: n, item: i, parent: (r && d(r)) || void 0 };
                    },
                    hasExpandableGroups: n,
                    isInRestrictedView: r
                  });
                  t && s(t);
                },
                [a, u, d, p, v, n, r]
              ),
              highlightItem: (0, E.useCallback)(
                function (e) {
                  s(h(e));
                },
                [h]
              ),
              expandGroup: (0, E.useCallback)(
                function (e) {
                  var t = e ? h(e) : a,
                    n = (0, $.ev)((0, $.ev)([], t, !0), [0], !1);
                  s(r ? t : n), c(t);
                },
                [a, h, r]
              ),
              collapseGroup: (0, E.useCallback)(
                function () {
                  u.length > 0 && (s(u), c(u.slice(0, -1)));
                },
                [u]
              ),
              reset: (0, E.useCallback)(function () {
                s([]), c([]);
              }, [])
            };
          })({ items: t, hasExpandableGroups: r, isInRestrictedView: a }),
          u = l.targetItem,
          c = l.isHighlighted,
          f = l.isExpanded,
          d = l.highlightItem,
          h = l.moveHighlight,
          p = l.expandGroup,
          v = l.collapseGroup,
          _ = l.reset,
          m = (0, pn.Z)({ onClose: _ }),
          g = m.isOpen,
          w = m.closeDropdown,
          y = m.toggleDropdown,
          b = function (e) {
            return f(e) ? v() : p(e);
          },
          x = function (e, t) {
            var r = { id: e.id || 'undefined', href: e.href, external: e.external, target: Mt(e) };
            i && e.href && (0, te.p_)(t) && (0, te.y1)(i, r, t), n && (0, te.y1)(n, r, t), w();
          },
          k = function (e) {
            g && h(e);
          },
          C = function (e) {
            u
              ? Pt(u)
                ? b(u)
                : x(u, e)
              : g && !a
              ? y()
              : (function (e) {
                  y(), h(1), e.preventDefault();
                })(e);
          },
          S = function (e, t) {
            (s.current = !1), (u && Zt(u) && t) || (e.preventDefault(), C(e));
          };
        return {
          isOpen: g,
          targetItem: u,
          isHighlighted: c,
          isExpanded: f,
          highlightItem: d,
          onKeyDown: function (e) {
            switch (e.keyCode) {
              case vn.V.down:
                k(1), e.preventDefault();
                break;
              case vn.V.up:
                k(-1), e.preventDefault();
                break;
              case vn.V.space:
                (s.current = !1), e.preventDefault();
                break;
              case vn.V.enter:
                (null === u || void 0 === u ? void 0 : u.disabled) || S(e, !0);
                break;
              case vn.V.left:
              case vn.V.right:
                u && !u.disabled && Pt(u) && !f(u) ? p() : r && v(), e.preventDefault();
                break;
              case vn.V.escape:
                w(), e.preventDefault();
                break;
              case vn.V.tab:
                w();
            }
          },
          onKeyUp: function (e) {
            e.keyCode !== vn.V.space || (null === u || void 0 === u ? void 0 : u.disabled) || S(e);
          },
          onItemActivate: x,
          onGroupToggle: b,
          toggleDropdown: y
        };
      }
      var xn = n(8003),
        En = n(7740),
        kn = n(4935),
        Cn = n(6794),
        Sn = n(9810),
        Nn = E.forwardRef(function (e, t) {
          for (
            var n = e.items,
              i = e.variant,
              r = void 0 === i ? 'normal' : i,
              o = e.loading,
              a = void 0 !== o && o,
              s = e.disabled,
              l = void 0 !== s && s,
              u = e.expandableGroups,
              c = void 0 !== u && u,
              f = e.children,
              d = e.onItemClick,
              h = e.onItemFollow,
              p = e.customTriggerBuilder,
              v = e.expandToViewport,
              _ = e.ariaLabel,
              m = e.title,
              g = e.description,
              w = e.preferCenter,
              y = e.__internalRootRef,
              b = (0, $._T)(e, [
                'items',
                'variant',
                'loading',
                'disabled',
                'expandableGroups',
                'children',
                'onItemClick',
                'onItemFollow',
                'customTriggerBuilder',
                'expandToViewport',
                'ariaLabel',
                'title',
                'description',
                'preferCenter',
                '__internalRootRef'
              ]),
              x = (0, ee.X)(),
              k = (0, E.useRef)(!0),
              C = (0, At.L)('dropdown'),
              S = 0,
              N = n;
            S < N.length;
            S++
          ) {
            var j = N[S];
            (0, Sn.J)('ButtonDropdown', j.href);
          }
          var z = bn({
              items: n,
              onItemClick: d,
              onItemFollow: h,
              hasExpandableGroups: c,
              isInRestrictedView: x,
              usingMouse: k
            }),
            O = z.isOpen,
            T = z.targetItem,
            R = z.isHighlighted,
            B = z.isExpanded,
            A = z.highlightItem,
            L = z.onKeyDown,
            P = z.onKeyUp,
            Z = z.onItemActivate,
            M = z.onGroupToggle,
            I = z.toggleDropdown,
            H = (0, Y.j)(b),
            D = (0, E.useRef)(null);
          (0, En.Z)(t, D);
          var U = function () {
              k.current && (a || l || (I(), D.current && D.current.focus()));
            },
            q = !a && !l,
            F = (0, kn.D)(O);
          (0, E.useEffect)(
            function () {
              !O && D.current && F && D.current.focus();
            },
            [O, F]
          );
          var W = 'navigation' === r ? void 0 : r,
            V =
              'icon' === r
                ? { iconName: 'ellipsis' }
                : {
                    iconName: 'caret-down-filled',
                    iconAlign: 'right',
                    __iconClass: q && O ? Bt['rotate-up'] : Bt['rotate-down']
                  },
            G = p
              ? p(U, D, l, O)
              : E.createElement(
                  ce.l,
                  (0, $.pi)({ ref: D }, V, {
                    variant: W,
                    loading: a,
                    disabled: l,
                    onClick: function (e) {
                      e.preventDefault(), U();
                    },
                    ariaLabel: _,
                    'aria-haspopup': !0,
                    ariaExpanded: q && O,
                    formAction: 'none'
                  }),
                  f
                ),
            K = m || g,
            X = (0, At.L)('awsui-button-dropdown__header');
          return E.createElement(
            'div',
            (0, $.pi)({}, H, {
              onKeyDown: L,
              onKeyUp: P,
              onMouseDown: function () {
                k.current = !0;
              },
              className: (0, J.Z)(Bt['button-dropdown'], Bt['variant-'.concat(r)], H.className),
              'aria-owns': v && O ? C : void 0,
              ref: y
            }),
            E.createElement(
              Lt.Z,
              {
                open: q && O,
                stretchWidth: !1,
                stretchTriggerHeight: 'navigation' === r,
                expandToViewport: v,
                preferCenter: w,
                onDropdownClose: function () {
                  I();
                },
                trigger: G,
                dropdownId: C
              },
              K &&
                E.createElement(
                  'div',
                  { className: Bt.header, id: X },
                  m &&
                    E.createElement(
                      Cn.Z,
                      { fontSize: 'heading-s', fontWeight: 'bold' },
                      E.createElement('span', { className: Bt.title }, m)
                    ),
                  g &&
                    E.createElement(
                      Cn.Z,
                      { fontSize: 'body-s' },
                      E.createElement('span', { className: Bt.description }, g)
                    )
                ),
              E.createElement(
                xn.Z,
                {
                  open: q && O,
                  position: 'static',
                  role: 'menu',
                  decreaseTopMargin: !0,
                  ariaLabelledby: K ? X : void 0
                },
                E.createElement(hn, {
                  items: n,
                  onItemActivate: Z,
                  onGroupToggle: M,
                  hasExpandableGroups: c,
                  targetItem: T,
                  isHighlighted: R,
                  isExpanded: B,
                  highlightItem: A,
                  expandToViewport: v,
                  variant: r
                })
              )
            )
          );
        }),
        jn = (n(7722), 'awsui_breadcrumb_1kosq_10si8_97'),
        zn = 'awsui_icon_1kosq_10si8_100',
        On = 'awsui_anchor_1kosq_10si8_104',
        Tn = 'awsui_last_1kosq_10si8_147',
        Rn = 'awsui_compressed_1kosq_10si8_157',
        Bn = 'awsui_text_1kosq_10si8_161';
      function An(e) {
        var t,
          n = e.item,
          i = e.onClick,
          r = e.onFollow,
          o = e.isLast,
          a = void 0 !== o && o,
          s = e.isCompressed,
          l = void 0 !== s && s,
          u = (0, dt.Z)();
        return E.createElement(
          'div',
          { className: (0, J.Z)(jn, a && Tn) },
          E.createElement(
            'a',
            (0, $.pi)({}, u, {
              href: n.href || '#',
              className: (0, J.Z)(On, ((t = {}), (t[Rn] = l), t)),
              'aria-current': a ? 'page' : void 0,
              'aria-disabled': a && 'true',
              onClick: a
                ? function (e) {
                    return e.preventDefault();
                  }
                : function (e) {
                    (0, te.p_)(e) && (0, te.y1)(r, Zn(n), e), (0, te.y1)(i, Zn(n), e);
                  }
            }),
            E.createElement('span', { className: Bn }, n.text)
          ),
          a
            ? null
            : E.createElement('span', { className: zn }, E.createElement(ht.Z, { name: 'angle-right' }))
        );
      }
      var Ln = function (e, t, n, i) {
          return E.createElement(
            ce.l,
            {
              disabled: n,
              onClick: function (t) {
                t.preventDefault(), e();
              },
              ref: t,
              'aria-expanded': !!i || void 0,
              'aria-haspopup': !0,
              variant: 'breadcrumb-group'
            },
            '...'
          );
        },
        Pn = function (e) {
          var t = e.ariaLabel,
            n = e.dropdownItems,
            i = e.onDropdownItemClick,
            r = e.onDropdownItemFollow;
          return E.createElement(
            'li',
            { className: Ot, 'aria-label': t },
            E.createElement(Nn, { items: n, onItemClick: i, onItemFollow: r, customTriggerBuilder: Ln }),
            E.createElement('span', { className: Tt }, E.createElement(ht.Z, { name: 'angle-right' }))
          );
        },
        Zn = function (e) {
          return { item: e, text: e.text, href: e.href };
        };
      function Mn(e) {
        for (
          var t = e.items,
            n = void 0 === t ? [] : t,
            i = e.ariaLabel,
            r = e.expandAriaLabel,
            o = e.onClick,
            a = e.onFollow,
            s = e.__internalRootRef,
            l = (0, $._T)(e, [
              'items',
              'ariaLabel',
              'expandAriaLabel',
              'onClick',
              'onFollow',
              '__internalRootRef'
            ]),
            u = 0,
            c = n;
          u < c.length;
          u++
        ) {
          var f = c[u];
          (0, Sn.J)('BreadcrumbGroup', f.href);
        }
        var d = (0, Y.j)(l),
          h = (0, ee.X)(),
          p = n.map(function (e, t) {
            return E.createElement(
              'li',
              { className: jt, key: t },
              E.createElement(An, {
                item: e,
                onClick: o,
                onFollow: a,
                isCompressed: h,
                isLast: t === n.length - 1
              })
            );
          }),
          v = function (e) {
            var t = e.detail.id;
            return n[parseInt(t)];
          };
        if (p.length >= 3) {
          var _ = n.slice(1, n.length - 1).map(function (e, t) {
            return { id: (t + 1).toString(), text: e.text, href: e.href || '#' };
          });
          p = (0, $.ev)(
            [
              p[0],
              E.createElement(Pn, {
                key: 'ellipsis',
                ariaLabel: r,
                dropdownItems: _,
                onDropdownItemClick: function (e) {
                  return (0, te.y1)(o, Zn(v(e)), e);
                },
                onDropdownItemFollow: function (e) {
                  return (0, te.y1)(a, Zn(v(e)), e);
                }
              })
            ],
            p.slice(1),
            !0
          );
        }
        return E.createElement(
          'nav',
          (0, $.pi)({}, d, {
            className: (0, J.Z)(Nt, h && Rt, d.className),
            'aria-label': i || void 0,
            ref: s
          }),
          E.createElement('ol', { className: zt }, p)
        );
      }
      function In(e) {
        var t = e.items,
          n = void 0 === t ? [] : t,
          i = e.expandAriaLabel,
          r = void 0 === i ? 'Show path' : i,
          o = (0, $._T)(e, ['items', 'expandAriaLabel']),
          a = (0, Fe.Z)('BreadcrumbGroup');
        return E.createElement(Mn, (0, $.pi)({ items: n, expandAriaLabel: r }, o, a));
      }
      (0, Ue.b)(In, 'BreadcrumbGroup');
      n(7318);
      var Hn = {
          'flash-refresh': 'awsui_flash-refresh_1q84n_zqvy6_93',
          enter: 'awsui_enter_1q84n_zqvy6_93',
          'flash-body': 'awsui_flash-body_1q84n_zqvy6_108',
          'flash-message': 'awsui_flash-message_1q84n_zqvy6_108',
          'flash-header': 'awsui_flash-header_1q84n_zqvy6_108',
          'flash-content': 'awsui_flash-content_1q84n_zqvy6_109',
          'action-button-wrapper': 'awsui_action-button-wrapper_1q84n_zqvy6_110',
          'dismiss-button-wrapper': 'awsui_dismiss-button-wrapper_1q84n_zqvy6_111',
          'flash-icon': 'awsui_flash-icon_1q84n_zqvy6_134',
          entering: 'awsui_entering_1q84n_zqvy6_147',
          entered: 'awsui_entered_1q84n_zqvy6_168',
          exiting: 'awsui_exiting_1q84n_zqvy6_273',
          flashbar: 'awsui_flashbar_1q84n_zqvy6_295',
          flash: 'awsui_flash_1q84n_zqvy6_93',
          'flash-text': 'awsui_flash-text_1q84n_zqvy6_359',
          'dismiss-button': 'awsui_dismiss-button_1q84n_zqvy6_111',
          'breakpoint-default': 'awsui_breakpoint-default_1q84n_zqvy6_401',
          'action-button': 'awsui_action-button_1q84n_zqvy6_110',
          'flash-type-success': 'awsui_flash-type-success_1q84n_zqvy6_414',
          'flash-type-error': 'awsui_flash-type-error_1q84n_zqvy6_418',
          'flash-type-warning': 'awsui_flash-type-warning_1q84n_zqvy6_422',
          'flash-type-info': 'awsui_flash-type-info_1q84n_zqvy6_426'
        },
        Dn = n(745),
        Un = {
          success: 'status-positive',
          warning: 'status-warning',
          info: 'status-info',
          error: 'status-negative'
        };
      var qn = E.forwardRef(function (e, t) {
          var n,
            i = e.header,
            r = e.content,
            o = e.dismissible,
            a = e.dismissLabel,
            s = e.loading,
            l = e.action,
            u = e.buttonText,
            c = e.onButtonClick,
            f = e.onDismiss,
            d = e.className,
            h = e.transitionState,
            p = e.type,
            v = void 0 === p ? 'info' : p;
          nt.y &&
            (u &&
              !c &&
              (0, it.O)(
                'Flashbar',
                'You provided a `buttonText` prop without an `onButtonClick` handler. This will render a non-interactive action button.'
              ),
            o &&
              !f &&
              (0, it.O)(
                'Flashbar',
                'You have set the `dismissible` prop without an `onDismiss` handler. This will render a non-interactive dismiss button.'
              ));
          var _ =
              l ||
              (u &&
                (function (e, t) {
                  return E.createElement(
                    ce.l,
                    { onClick: t, className: Hn['action-button'], formAction: 'none' },
                    e
                  );
                })(u, c)),
            m = Un[v],
            g = s ? E.createElement(Dn.Z, null) : E.createElement(ht.Z, { name: m }),
            w = s ? 'info' : v;
          return E.createElement(
            'div',
            {
              ref: t,
              className: (0, J.Z)(
                Hn.flash,
                Hn['flash-type-'.concat(w)],
                d,
                h
                  ? ((n = {}),
                    (n[Hn.enter] = 'enter' === h),
                    (n[Hn.entering] = 'entering' === h),
                    (n[Hn.entered] = 'entered' === h),
                    (n[Hn.exit] = 'exit' === h),
                    (n[Hn.exiting] = 'exiting' === h),
                    (n[Hn.exited] = 'exited' === h),
                    n)
                  : ''
              )
            },
            E.createElement('div', { className: (0, J.Z)(Hn['flash-icon'], Hn['flash-text']) }, g),
            E.createElement(
              'div',
              { className: Hn['flash-body'] },
              E.createElement(
                'div',
                { className: (0, J.Z)(Hn['flash-message'], Hn['flash-text']) },
                E.createElement('div', { className: Hn['flash-header'] }, i),
                E.createElement('div', { className: Hn['flash-content'] }, r)
              ),
              _ && E.createElement('div', { className: Hn['action-button-wrapper'] }, _)
            ),
            o &&
              (function (e, t) {
                return E.createElement(
                  'div',
                  { className: Hn['dismiss-button-wrapper'] },
                  E.createElement(ce.l, {
                    onClick: t,
                    className: Hn['dismiss-button'],
                    variant: 'flashbar-icon',
                    iconName: 'close',
                    formAction: 'none',
                    ariaLabel: e
                  })
                );
              })(a, f)
          );
        }),
        Fn = n(6210),
        Wn = n(5511),
        Vn = n(3891),
        Gn = n(3638);
      var Kn = n(162),
        Xn = n(2560);
      function $n(e, t) {
        var n = Object.create(null);
        return (
          e &&
            E.Children.map(e, function (e) {
              return e;
            }).forEach(function (e) {
              n[e.key] = (function (e) {
                return t && (0, E.isValidElement)(e) ? t(e) : e;
              })(e);
            }),
          n
        );
      }
      function Jn(e, t, n) {
        return null != n[t] ? n[t] : e.props[t];
      }
      function Yn(e, t, n) {
        var i = $n(e.children),
          r = (function (e, t) {
            function n(n) {
              return n in t ? t[n] : e[n];
            }
            (e = e || {}), (t = t || {});
            var i,
              r = Object.create(null),
              o = [];
            for (var a in e) a in t ? o.length && ((r[a] = o), (o = [])) : o.push(a);
            var s = {};
            for (var l in t) {
              if (r[l])
                for (i = 0; i < r[l].length; i++) {
                  var u = r[l][i];
                  s[r[l][i]] = n(u);
                }
              s[l] = n(l);
            }
            for (i = 0; i < o.length; i++) s[o[i]] = n(o[i]);
            return s;
          })(t, i);
        return (
          Object.keys(r).forEach(function (o) {
            var a = r[o];
            if ((0, E.isValidElement)(a)) {
              var s = o in t,
                l = o in i,
                u = t[o],
                c = (0, E.isValidElement)(u) && !u.props.in;
              !l || (s && !c)
                ? l || !s || c
                  ? l &&
                    s &&
                    (0, E.isValidElement)(u) &&
                    (r[o] = (0, E.cloneElement)(a, {
                      onExited: n.bind(null, a),
                      in: u.props.in,
                      exit: Jn(a, 'exit', e),
                      enter: Jn(a, 'enter', e)
                    }))
                  : (r[o] = (0, E.cloneElement)(a, { in: !1 }))
                : (r[o] = (0, E.cloneElement)(a, {
                    onExited: n.bind(null, a),
                    in: !0,
                    exit: Jn(a, 'exit', e),
                    enter: Jn(a, 'enter', e)
                  }));
            }
          }),
          r
        );
      }
      var Qn =
          Object.values ||
          function (e) {
            return Object.keys(e).map(function (t) {
              return e[t];
            });
          },
        ei = (function (e) {
          function t(t, n) {
            var i,
              r = (i = e.call(this, t, n) || this).handleExited.bind(
                (function (e) {
                  if (void 0 === e)
                    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
                  return e;
                })(i)
              );
            return (i.state = { contextValue: { isMounting: !0 }, handleExited: r, firstRender: !0 }), i;
          }
          (0, Kn.Z)(t, e);
          var n = t.prototype;
          return (
            (n.componentDidMount = function () {
              (this.mounted = !0), this.setState({ contextValue: { isMounting: !1 } });
            }),
            (n.componentWillUnmount = function () {
              this.mounted = !1;
            }),
            (t.getDerivedStateFromProps = function (e, t) {
              var n,
                i,
                r = t.children,
                o = t.handleExited;
              return {
                children: t.firstRender
                  ? ((n = e),
                    (i = o),
                    $n(n.children, function (e) {
                      return (0,
                      E.cloneElement)(e, { onExited: i.bind(null, e), in: !0, appear: Jn(e, 'appear', n), enter: Jn(e, 'enter', n), exit: Jn(e, 'exit', n) });
                    }))
                  : Yn(e, r, o),
                firstRender: !1
              };
            }),
            (n.handleExited = function (e, t) {
              var n = $n(this.props.children);
              e.key in n ||
                (e.props.onExited && e.props.onExited(t),
                this.mounted &&
                  this.setState(function (t) {
                    var n = (0, Gn.Z)({}, t.children);
                    return delete n[e.key], { children: n };
                  }));
            }),
            (n.render = function () {
              var e = this.props,
                t = e.component,
                n = e.childFactory,
                i = (0, Vn.Z)(e, ['component', 'childFactory']),
                r = this.state.contextValue,
                o = Qn(this.state.children).map(n);
              return (
                delete i.appear,
                delete i.enter,
                delete i.exit,
                null === t
                  ? E.createElement(Xn.Z.Provider, { value: r }, o)
                  : E.createElement(Xn.Z.Provider, { value: r }, E.createElement(t, i, o))
              );
            }),
            t
          );
        })(E.Component);
      (ei.propTypes = {}),
        (ei.defaultProps = {
          component: 'div',
          childFactory: function (e) {
            return e;
          }
        });
      var ti = ei;
      function ni(e) {
        var t = e.items,
          n = (0, $._T)(e, ['items']),
          i = (0, Fe.Z)('Flashbar').__internalRootRef,
          r = (0, Fn.d)(['xs']),
          o = r[0],
          a = r[1],
          s = (0, We.LV)(i),
          l = (0, Y.j)(n),
          u = (0, oe.q)(a, i),
          c =
            (0, We.JZ)(a) ||
            !s ||
            (t &&
              !t.every(function (e) {
                return 'id' in e;
              }));
        return E.createElement(
          'div',
          (0, $.pi)({}, l, {
            className: (0, J.Z)(l.className, Hn.flashbar, Hn['breakpoint-'.concat(o)]),
            ref: u
          }),
          E.createElement(
            Wn.Z,
            { contextName: 'flashbar' },
            t &&
              E.createElement(
                E.Fragment,
                null,
                c
                  ? t.map(function (e, t) {
                      return (function (e, t) {
                        var n;
                        return E.createElement(
                          qn,
                          (0, $.pi)(
                            {
                              key: null !== (n = e.id) && void 0 !== n ? n : t,
                              className: (0, J.Z)(s ? Hn['flash-refresh'] : '')
                            },
                            e
                          )
                        );
                      })(e, t);
                    })
                  : (function (e) {
                      return E.createElement(
                        E.Fragment,
                        null,
                        E.createElement(
                          ti,
                          { component: null },
                          e &&
                            e.map(function (e, t) {
                              var n;
                              return E.createElement(
                                _t.u,
                                {
                                  transitionChangeDelay: { entering: 115 },
                                  key: null !== (n = e.id) && void 0 !== n ? n : t,
                                  in: !0
                                },
                                function (n, i) {
                                  var r;
                                  return E.createElement(
                                    qn,
                                    (0, $.pi)(
                                      {
                                        ref: i,
                                        key: null !== (r = e.id) && void 0 !== r ? r : t,
                                        transitionState: n,
                                        className: (0, J.Z)(s ? Hn['flash-refresh'] : '')
                                      },
                                      e
                                    )
                                  );
                                }
                              );
                            })
                        )
                      );
                    })(t)
              )
          )
        );
      }
      (0, Ue.b)(ni, 'Flashbar');
      var ii = n(7007),
        ri = n.n(ii),
        oi = n(8014),
        ai =
          (n(9233),
          {
            root: 'awsui_root_l0dv0_1mtlo_93',
            header: 'awsui_header_l0dv0_1mtlo_107',
            'header-link': 'awsui_header-link_l0dv0_1mtlo_112',
            'header-link--has-logo': 'awsui_header-link--has-logo_l0dv0_1mtlo_120',
            'header-link-text': 'awsui_header-link-text_l0dv0_1mtlo_120',
            'header-logo': 'awsui_header-logo_l0dv0_1mtlo_124',
            'header-logo--stretched': 'awsui_header-logo--stretched_l0dv0_1mtlo_130',
            'list-container': 'awsui_list-container_l0dv0_1mtlo_135',
            list: 'awsui_list_l0dv0_1mtlo_135',
            'list-variant-root': 'awsui_list-variant-root_l0dv0_1mtlo_145',
            'list-variant-expandable-link-group': 'awsui_list-variant-expandable-link-group_l0dv0_1mtlo_151',
            'list-item': 'awsui_list-item_l0dv0_1mtlo_155',
            section: 'awsui_section_l0dv0_1mtlo_161',
            'expandable-link-group': 'awsui_expandable-link-group_l0dv0_1mtlo_162',
            'section-header': 'awsui_section-header_l0dv0_1mtlo_175',
            link: 'awsui_link_l0dv0_1mtlo_180',
            'link-active': 'awsui_link-active_l0dv0_1mtlo_187',
            info: 'awsui_info_l0dv0_1mtlo_219',
            'external-icon': 'awsui_external-icon_l0dv0_1mtlo_223',
            divider: 'awsui_divider_l0dv0_1mtlo_227',
            'divider-default': 'awsui_divider-default_l0dv0_1mtlo_232',
            'divider-header': 'awsui_divider-header_l0dv0_1mtlo_236'
          });
      function si(e, t) {
        for (var n = 0, i = e; n < i.length; n++) {
          var r = i[n];
          if (
            ('link' === r.type || 'link-group' === r.type || 'expandable-link-group' === r.type) &&
            r.href === t
          )
            return !0;
          if (
            ('section' === r.type || 'link-group' === r.type || 'expandable-link-group' === r.type) &&
            si(r.items, t)
          )
            return !0;
        }
        return !1;
      }
      function li(e, t, n) {
        return (
          void 0 === t && (t = new WeakMap()),
          void 0 === n && (n = []),
          e.forEach(function (e) {
            var i = n.slice();
            ('section' !== e.type && 'expandable-link-group' !== e.type) || (t.set(e, n), i.unshift(e)),
              ('section' !== e.type && 'link-group' !== e.type && 'expandable-link-group' !== e.type) ||
                li(e.items, t, i);
          }),
          t
        );
      }
      function ui(e) {
        var t,
          n,
          i = e.definition,
          r = e.activeHref,
          o = e.fireFollow;
        (0, Sn.J)('SideNavigation', i.href);
        var a = (0, dt.Z)(),
          s = (0, E.useCallback)(
            function (e) {
              (0, te.p_)(e) && o(i, e);
            },
            [o, i]
          );
        return E.createElement(
          E.Fragment,
          null,
          E.createElement(
            'div',
            { className: ai.header },
            E.createElement(
              'a',
              (0, $.pi)({}, a, {
                href: i.href,
                className: (0, J.Z)(
                  ai['header-link'],
                  ((t = {}), (t[ai['header-link--has-logo']] = !!i.logo), t)
                ),
                'aria-current': i.href === r ? 'page' : void 0,
                onClick: s
              }),
              i.logo &&
                E.createElement(
                  'img',
                  (0, $.pi)(
                    {
                      className: (0, J.Z)(
                        ai['header-logo'],
                        ((n = {}), (n[ai['header-logo--stretched']] = !i.text), n)
                      )
                    },
                    i.logo
                  )
                ),
              E.createElement('span', { className: ai['header-link-text'] }, i.text)
            )
          ),
          E.createElement(fi, { variant: 'header' })
        );
      }
      function ci(e) {
        var t = e.variant,
          n = e.items,
          i = e.activeHref,
          r = e.fireChange,
          o = e.fireFollow;
        return E.createElement(
          'ul',
          { className: (0, J.Z)(ai.list, ai['list-variant-'.concat(t)]) },
          n.map(function (e, t) {
            return E.createElement(
              'li',
              { key: t, className: ai['list-item'] },
              'divider' === e.type && E.createElement(fi, { variant: 'default' }),
              'link' === e.type &&
                E.createElement(di, { definition: e, activeHref: i, fireChange: r, fireFollow: o }),
              'section' === e.type &&
                E.createElement(hi, { definition: e, activeHref: i, fireChange: r, fireFollow: o }),
              'link-group' === e.type &&
                E.createElement(pi, { definition: e, activeHref: i, fireChange: r, fireFollow: o }),
              'expandable-link-group' === e.type &&
                E.createElement(vi, { definition: e, activeHref: i, fireChange: r, fireFollow: o })
            );
          })
        );
      }
      function fi(e) {
        var t = e.variant,
          n = void 0 === t ? 'default' : t;
        return E.createElement('hr', { className: (0, J.Z)(ai.divider, ai['divider-'.concat(n)]) });
      }
      function di(e) {
        var t,
          n = e.definition,
          i = e.expanded,
          r = e.activeHref,
          o = e.fireFollow;
        (0, Sn.J)('SideNavigation', n.href);
        var a = n.href === r,
          s = (0, dt.Z)(),
          l = (0, E.useCallback)(
            function (e) {
              e.stopPropagation(), (0, te.p_)(e) && o(n, e);
            },
            [o, n]
          );
        return E.createElement(
          E.Fragment,
          null,
          E.createElement(
            'a',
            (0, $.pi)({}, s, {
              href: n.href,
              className: (0, J.Z)(ai.link, ((t = {}), (t[ai['link-active']] = a), t)),
              target: n.external ? '_blank' : void 0,
              rel: n.external ? 'noopener noreferrer' : void 0,
              'aria-expanded': i,
              'aria-current': n.href === r ? 'page' : void 0,
              onClick: l
            }),
            n.text,
            n.external &&
              E.createElement(
                'span',
                { 'aria-label': n.externalIconAriaLabel, role: n.externalIconAriaLabel ? 'img' : void 0 },
                E.createElement(ht.Z, { name: 'external', className: ai['external-icon'] })
              )
          ),
          n.info && E.createElement('span', { className: ai.info }, n.info)
        );
      }
      function hi(e) {
        var t,
          n = e.definition,
          i = e.activeHref,
          r = e.fireFollow,
          o = e.fireChange,
          a = (0, E.useState)(null === (t = n.defaultExpanded) || void 0 === t || t),
          s = a[0],
          l = a[1],
          u = (0, E.useCallback)(
            function (e) {
              o(n, e.detail.expanded), l(e.detail.expanded);
            },
            [n, o]
          );
        return (
          (0, E.useEffect)(
            function () {
              var e;
              l(null === (e = n.defaultExpanded) || void 0 === e || e);
            },
            [n]
          ),
          E.createElement(
            oi.Z,
            { variant: 'footer', expanded: s, onChange: u, className: ai.section, header: n.text },
            E.createElement(ci, {
              variant: 'section',
              items: n.items,
              fireFollow: r,
              fireChange: o,
              activeHref: i
            })
          )
        );
      }
      function pi(e) {
        var t = e.definition,
          n = e.activeHref,
          i = e.fireFollow,
          r = e.fireChange;
        return (
          (0, Sn.J)('SideNavigation', t.href),
          E.createElement(
            E.Fragment,
            null,
            E.createElement(di, {
              definition: { type: 'link', href: t.href, text: t.text },
              fireFollow: function (e, n) {
                return i(t, n);
              },
              fireChange: r,
              activeHref: n
            }),
            E.createElement(ci, {
              variant: 'link-group',
              items: t.items,
              fireFollow: i,
              fireChange: r,
              activeHref: n
            })
          )
        );
      }
      function vi(e) {
        var t = e.definition,
          n = e.fireFollow,
          i = e.fireChange,
          r = e.activeHref,
          o = (0, E.useMemo)(
            function () {
              return !!r && si(t.items, r);
            },
            [r, t.items]
          ),
          a = (0, E.useState)(function () {
            var e;
            return null !== (e = t.defaultExpanded) && void 0 !== e ? e : t.href === r || o;
          }),
          s = a[0],
          l = a[1],
          u = (0, E.useState)(),
          c = u[0],
          f = u[1];
        (0, E.useEffect)(
          function () {
            return f(void 0);
          },
          [t]
        ),
          (0, E.useEffect)(
            function () {
              l(t.href === r || o);
            },
            [t.href, o, r]
          ),
          (0, E.useEffect)(
            function () {
              void 0 !== t.defaultExpanded && l(t.defaultExpanded);
            },
            [t]
          );
        var d = (0, E.useCallback)(
          function (e) {
            i(t, e.detail.expanded), f(e.detail.expanded);
          },
          [t, i]
        );
        return E.createElement(
          oi.Z,
          {
            className: ai['expandable-link-group'],
            variant: 'navigation',
            expanded: null !== c && void 0 !== c ? c : s,
            onChange: d,
            header: E.createElement(di, {
              definition: { type: 'link', href: t.href, text: t.text },
              expanded: null !== c && void 0 !== c ? c : s,
              fireFollow: function (e, r) {
                n(t, r), f(!0), s || i(t, !0);
              },
              fireChange: i,
              activeHref: r
            })
          },
          E.createElement(ci, {
            variant: 'expandable-link-group',
            items: t.items,
            fireFollow: n,
            fireChange: i,
            activeHref: r
          })
        );
      }
      function _i(e) {
        var t = e.header,
          n = e.activeHref,
          i = e.items,
          r = void 0 === i ? [] : i,
          o = e.onFollow,
          a = e.onChange,
          s = (0, $._T)(e, ['header', 'activeHref', 'items', 'onFollow', 'onChange']),
          l = (0, Fe.Z)('SideNavigation').__internalRootRef,
          u = (0, Y.j)(s),
          c = (0, E.useMemo)(
            function () {
              return li(r);
            },
            [r]
          );
        nt.y &&
          (0, E.useEffect)(
            function () {
              return (function (e) {
                for (var t = new Set(), n = e.slice(); n.length > 0; ) {
                  var i = n.shift();
                  'href' in i &&
                    (t.has(i.href) &&
                      (0, it.O)('SideNavigation', 'duplicate href in "'.concat(i.text, '": ').concat(i.href)),
                    t.add(i.href)),
                    'items' in i && n.push.apply(n, i.items);
                }
              })(r);
            },
            [r]
          );
        var f = (0, E.useCallback)(
            function (e, t) {
              (0, te.B4)(a, { item: e, expanded: t, expandableParents: c.get(e) });
            },
            [a, c]
          ),
          d = (0, E.useCallback)(
            function (e, t) {
              (0, te.y1)(o, e, t);
            },
            [o]
          );
        return E.createElement(
          'div',
          (0, $.pi)({}, u, { className: (0, J.Z)(ai.root, u.className), ref: l }),
          t && E.createElement(ui, { definition: t, activeHref: n, fireChange: f, fireFollow: d }),
          r &&
            E.createElement(
              'div',
              { className: ai['list-container'] },
              E.createElement(ci, { variant: 'root', items: r, fireFollow: d, fireChange: f, activeHref: n })
            )
        );
      }
      function mi(e) {
        this.message = e;
      }
      (0, Ue.b)(_i, 'SideNavigation'),
        (mi.prototype = new Error()),
        (mi.prototype.name = 'InvalidCharacterError');
      var gi =
        ('undefined' != typeof window && window.atob && window.atob.bind(window)) ||
        function (e) {
          var t = String(e).replace(/=+$/, '');
          if (t.length % 4 == 1)
            throw new mi("'atob' failed: The string to be decoded is not correctly encoded.");
          for (
            var n, i, r = 0, o = 0, a = '';
            (i = t.charAt(o++));
            ~i && ((n = r % 4 ? 64 * n + i : i), r++ % 4)
              ? (a += String.fromCharCode(255 & (n >> ((-2 * r) & 6))))
              : 0
          )
            i = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='.indexOf(i);
          return a;
        };
      function wi(e) {
        var t = e.replace(/-/g, '+').replace(/_/g, '/');
        switch (t.length % 4) {
          case 0:
            break;
          case 2:
            t += '==';
            break;
          case 3:
            t += '=';
            break;
          default:
            throw 'Illegal base64url string!';
        }
        try {
          return (function (e) {
            return decodeURIComponent(
              gi(e).replace(/(.)/g, function (e, t) {
                var n = t.charCodeAt(0).toString(16).toUpperCase();
                return n.length < 2 && (n = '0' + n), '%' + n;
              })
            );
          })(t);
        } catch (e) {
          return gi(t);
        }
      }
      function yi(e) {
        this.message = e;
      }
      (yi.prototype = new Error()), (yi.prototype.name = 'InvalidTokenError');
      var bi,
        xi = function (e, t) {
          if ('string' != typeof e) throw new yi('Invalid token specified');
          var n = !0 === (t = t || {}).header ? 0 : 1;
          try {
            return JSON.parse(wi(e.split('.')[n]));
          } catch (e) {
            throw new yi('Invalid token specified: ' + e.message);
          }
        },
        Ei = n(7675);
      function ki(e) {
        const t = Ei.lib.WordArray.random(e),
          n = [];
        return (
          t.words.forEach((e) => {
            const t = (function (e) {
                const t = new ArrayBuffer(4);
                return new DataView(t).setUint32(0, e, !1), t;
              })(e),
              i = new Uint8Array(t);
            for (let r = 0; r < 4; r++) n.push(i[r]);
          }),
          n
        );
      }
      function Ci(e) {
        return (function (e) {
          const t = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789-._~';
          let n = '';
          const i = ki(e);
          for (let r = 0; r < e; r++) n += t[i[r] % t.length];
          return n;
        })(e);
      }
      function Si(e) {
        return (0, Ei.SHA256)(e).toString(Ei.enc.Base64url);
      }
      var Ni = new Uint8Array(16);
      function ji() {
        if (
          !bi &&
          !(bi =
            ('undefined' !== typeof crypto &&
              crypto.getRandomValues &&
              crypto.getRandomValues.bind(crypto)) ||
            ('undefined' !== typeof msCrypto &&
              'function' === typeof msCrypto.getRandomValues &&
              msCrypto.getRandomValues.bind(msCrypto)))
        )
          throw new Error(
            'crypto.getRandomValues() not supported. See https://github.com/uuidjs/uuid#getrandomvalues-not-supported'
          );
        return bi(Ni);
      }
      var zi =
        /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000)$/i;
      for (
        var Oi = function (e) {
            return 'string' === typeof e && zi.test(e);
          },
          Ti = [],
          Ri = 0;
        Ri < 256;
        ++Ri
      )
        Ti.push((Ri + 256).toString(16).substr(1));
      var Bi = function (e) {
        var t = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : 0,
          n = (
            Ti[e[t + 0]] +
            Ti[e[t + 1]] +
            Ti[e[t + 2]] +
            Ti[e[t + 3]] +
            '-' +
            Ti[e[t + 4]] +
            Ti[e[t + 5]] +
            '-' +
            Ti[e[t + 6]] +
            Ti[e[t + 7]] +
            '-' +
            Ti[e[t + 8]] +
            Ti[e[t + 9]] +
            '-' +
            Ti[e[t + 10]] +
            Ti[e[t + 11]] +
            Ti[e[t + 12]] +
            Ti[e[t + 13]] +
            Ti[e[t + 14]] +
            Ti[e[t + 15]]
          ).toLowerCase();
        if (!Oi(n)) throw TypeError('Stringified UUID is invalid');
        return n;
      };
      var Ai = function (e, t, n) {
          var i = (e = e || {}).random || (e.rng || ji)();
          if (((i[6] = (15 & i[6]) | 64), (i[8] = (63 & i[8]) | 128), t)) {
            n = n || 0;
            for (var r = 0; r < 16; ++r) t[n + r] = i[r];
            return t;
          }
          return Bi(i);
        },
        Li = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        Pi = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        },
        Zi = (0, E.createContext)({});
      function Mi(e) {
        var t = e.children,
          n = (0, E.useState)(),
          i = n[0],
          r = n[1];
        function o(e) {
          var t,
            n = xi(String(e)),
            i =
              (null === (t = n['cognito:groups']) || void 0 === t ? void 0 : t.length) > 0
                ? n['cognito:groups'][0]
                : 'N/A';
          r({
            id: n.sub,
            givenName: n.given_name,
            familyName: n.family_name,
            email: n.email,
            avatar: { name: 'user-profile' },
            claims: [],
            role: i
          });
        }
        function a() {
          return Li(this, void 0, void 0, function () {
            var e, t, n, i, r;
            return Pi(this, function (o) {
              switch (o.label) {
                case 0:
                  return (
                    o.trys.push([0, 2, , 3]),
                    [
                      4,
                      h(void 0, void 0, void 0, function () {
                        return p(this, function (e) {
                          switch (e.label) {
                            case 0:
                              return [
                                4,
                                c(
                                  'login/?stateVerifier=TEMP_STATE_VERIFIER&codeChallenge=TEMP_CODE_CHALLENGE',
                                  {}
                                )
                              ];
                            case 1:
                              return [2, e.sent()];
                          }
                        });
                      })
                    ]
                  );
                case 1:
                  return (
                    (e = o.sent()),
                    (t = e.signInUrl),
                    localStorage.setItem('csrfToken', e.csrfToken),
                    (n = (function (e) {
                      if ((e || (e = 43), e < 43 || e > 128))
                        throw `Expected a length between 43 and 128. Received ${e}.`;
                      const t = Ci(e);
                      return { code_verifier: t, code_challenge: Si(t) };
                    })(128)),
                    localStorage.setItem('pkceVerifier', n.code_verifier),
                    (t = t.replace('TEMP_CODE_CHALLENGE', n.code_challenge)),
                    (i = Ai()),
                    localStorage.setItem('stateVerifier', i),
                    (t = t.replace('TEMP_STATE_VERIFIER', i)),
                    window.location.assign(t),
                    [3, 3]
                  );
                case 2:
                  return (r = o.sent()), console.log(r), [3, 3];
                case 3:
                  return [2];
              }
            });
          });
        }
        function s() {
          return Li(this, void 0, void 0, function () {
            var e, t, n;
            return Pi(this, function (i) {
              switch (i.label) {
                case 0:
                  return (
                    i.trys.push([0, 2, , 3]),
                    [
                      4,
                      h(void 0, void 0, void 0, function () {
                        return p(this, function (e) {
                          switch (e.label) {
                            case 0:
                              return [4, f('logout', {})];
                            case 1:
                              return [2, e.sent()];
                          }
                        });
                      })
                    ]
                  );
                case 1:
                  return (
                    (e = i.sent()),
                    (t = e.logoutUrl),
                    window.localStorage.removeItem('idToken'),
                    window.location.assign(t),
                    [3, 3]
                  );
                case 2:
                  return (n = i.sent()), console.log(n), [3, 3];
                case 3:
                  return [2];
              }
            });
          });
        }
        (0, E.useEffect)(function () {
          if ('undefined' !== typeof window) {
            var e = localStorage.getItem('idToken');
            void 0 !== e && null !== e && o(e);
          }
          (function () {
            return Li(this, void 0, void 0, function () {
              var e, t, n, i, r, a;
              return Pi(this, function (s) {
                switch (s.label) {
                  case 0:
                    if (((e = Ii(window.location, 'code')), (t = Ii(window.location, 'state')), !e || !t))
                      return [3, 4];
                    if (
                      ((n = localStorage.getItem('stateVerifier')),
                      (i = localStorage.getItem('pkceVerifier')),
                      t !== n)
                    )
                      throw new Error('State verification was not successful, login denied.');
                    s.label = 1;
                  case 1:
                    return s.trys.push([1, 3, , 4]), [4, v({ code: e, codeVerifier: i })];
                  case 2:
                    return (
                      (r = s.sent()),
                      localStorage.setItem('idToken', r.idToken),
                      o(r.idToken),
                      localStorage.removeItem('stateVerifier'),
                      localStorage.removeItem('pkceVerifier'),
                      window.history.replaceState({}, '', window.location.origin + window.location.pathname),
                      window.location.assign(
                        window.location.origin + window.location.pathname + 'environments'
                      ),
                      [3, 4]
                    );
                  case 3:
                    return (a = s.sent()), console.log(a), [3, 4];
                  case 4:
                    return [2];
                }
              });
            });
          })().catch(function (e) {
            return console.log(e);
          });
        }, []);
        var l = (0, E.useMemo)(
          function () {
            return { user: i, signIn: a, signOut: s };
          },
          [i]
        );
        return E.createElement(Zi.Provider, { value: l }, t);
      }
      function Ii(e, t) {
        var n = e.search,
          i = {},
          r = n.substring(1).split('&');
        return (
          r &&
            r.forEach(function (e) {
              var t = e.split('='),
                n = t[0].replace('?', ''),
                r = t[1];
              r && (i[n] = r);
            }),
          i[t]
        );
      }
      function Hi() {
        return (0, E.useContext)(Zi);
      }
      function Di(e) {
        var t = e.children;
        'undefined' !== typeof window &&
          (localStorage.getItem('idToken') || window.location.assign(window.location.origin));
        return t;
      }
      function Ui(e) {
        var t = e.activeHref,
          n = e.header,
          i = e.items,
          r = e.onFollowHandler,
          o = [
            { type: 'link', text: 'Users', href: '/users' },
            { type: 'link', text: 'Workspaces', href: '/environments' },
            { type: 'link', text: 'Datasets', href: '/datasets' }
          ],
          a = Hi().user,
          s = o;
        return (
          (s =
            'Admin' === (a ? a.role : 'researcher')
              ? o
              : [
                  { type: 'link', text: 'Workspaces', href: '/environments' },
                  { type: 'link', text: 'Datasets', href: '/datasets' }
                ]),
          E.createElement(
            Di,
            null,
            E.createElement(_i, {
              'data-testid': 'sideNavigation',
              activeHref: t,
              header: n || { text: 'Service Workbench', href: '#/' },
              items: i || s,
              onFollow: r
            })
          )
        );
      }
      var qi,
        Fi = function () {
          return (
            (Fi =
              Object.assign ||
              function (e) {
                for (var t, n = 1, i = arguments.length; n < i; n++)
                  for (var r in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, r) && (e[r] = t[r]);
                return e;
              }),
            Fi.apply(this, arguments)
          );
        },
        Wi = E.createContext({
          notifications: {},
          displayNotification: function (e, t) {},
          closeNotification: function (e) {}
        });
      function Vi(e) {
        var t = e.children,
          n = E.useState({}),
          i = n[0],
          r = n[1];
        return E.createElement(
          Wi.Provider,
          {
            value: {
              notifications: i,
              displayNotification: function (e, t) {
                if (!(e in i)) {
                  var n = Fi({}, i);
                  (n[e] = t), r(n);
                }
              },
              closeNotification: function (e) {
                var t = Fi({}, i);
                delete t[e], r(t);
              }
            }
          },
          t
        );
      }
      function Gi() {
        return E.useContext(Wi);
      }
      !(function (e) {
        (e.en = 'en'), (e.es = 'es'), (e.pt = 'pt');
      })(qi || (qi = {}));
      var Ki = {
          language: qi.en,
          logo: '/logo-image.png',
          favicon: '/favicon.ico',
          name: 'Service Workbench on AWS (BETA)',
          slogan: '',
          description: ''
        },
        Xi = E.createContext({ settings: Ki, reload: function () {} });
      function $i(e) {
        var t = e.children,
          n = E.useState(Ki)[0];
        return E.createElement(Xi.Provider, { value: { settings: n, reload: function () {} } }, t);
      }
      function Ji() {
        return E.useContext(Xi);
      }
      function Yi(e) {
        var t = e.navigationHide,
          n = e.children,
          i = e.breadcrumbs,
          r = e.activeHref,
          o = void 0 === r ? '#/' : r,
          a = E.useState(!1),
          s = a[0],
          l = a[1],
          u = Gi(),
          c = u.notifications;
        (0, u.displayNotification)('BetaCodeWarning', {
          type: 'warning',
          dismissible: !1,
          content:
            'This software is in active development/testing mode. Do not put any critical, production, or otherwise important data in workspaces or studies.'
        });
        var f = Ji().settings,
          d = I;
        return E.createElement(
          E.Fragment,
          null,
          E.createElement(
            ri(),
            null,
            E.createElement('title', null, f.name),
            E.createElement('meta', { name: 'description', content: f.description }),
            E.createElement('link', { rel: 'icon', href: f.favicon })
          ),
          E.createElement(St, {
            id: 'app-layout',
            headerSelector: '#header',
            stickyNotifications: !0,
            toolsHide: !0,
            ariaLabels: d,
            navigationOpen: s,
            navigationHide: t,
            navigation: E.createElement(Ui, { activeHref: o }),
            notifications: E.createElement(ni, { items: Object.values(c) }),
            breadcrumbs: E.createElement(In, {
              items: i,
              expandAriaLabel: 'Show path',
              ariaLabel: 'Breadcrumbs'
            }),
            contentType: 'table',
            content: n,
            onNavigationChange: function (e) {
              var t = e.detail;
              l(t.open);
            }
          })
        );
      }
      n(442);
      var Qi = {
        icon: 'awsui_icon_k5dlb_14a5k_93',
        'top-navigation': 'awsui_top-navigation_k5dlb_14a5k_111',
        'padding-box': 'awsui_padding-box_k5dlb_14a5k_122',
        medium: 'awsui_medium_k5dlb_14a5k_132',
        narrow: 'awsui_narrow_k5dlb_14a5k_132',
        virtual: 'awsui_virtual_k5dlb_14a5k_143',
        hidden: 'awsui_hidden_k5dlb_14a5k_147',
        '\t': 'awsui_\t_k5dlb_14a5k_1',
        identity: 'awsui_identity_k5dlb_14a5k_159',
        'identity-link': 'awsui_identity-link_k5dlb_14a5k_162',
        'no-logo': 'awsui_no-logo_k5dlb_14a5k_179',
        logo: 'awsui_logo_k5dlb_14a5k_183',
        title: 'awsui_title_k5dlb_14a5k_195',
        inputs: 'awsui_inputs_k5dlb_14a5k_208',
        search: 'awsui_search_k5dlb_14a5k_215',
        'search-expanded': 'awsui_search-expanded_k5dlb_14a5k_219',
        utilities: 'awsui_utilities_k5dlb_14a5k_223',
        'utility-wrapper': 'awsui_utility-wrapper_k5dlb_14a5k_234',
        'utility-type-button-link': 'awsui_utility-type-button-link_k5dlb_14a5k_255',
        'utility-type-menu-dropdown': 'awsui_utility-type-menu-dropdown_k5dlb_14a5k_259',
        'utility-type-button-primary-button': 'awsui_utility-type-button-primary-button_k5dlb_14a5k_267',
        'utility-link-icon': 'awsui_utility-link-icon_k5dlb_14a5k_275',
        'utility-button-external-icon': 'awsui_utility-button-external-icon_k5dlb_14a5k_279',
        'offset-right-none': 'awsui_offset-right-none_k5dlb_14a5k_283',
        'offset-right-l': 'awsui_offset-right-l_k5dlb_14a5k_287',
        'offset-right-xxl': 'awsui_offset-right-xxl_k5dlb_14a5k_291',
        'overflow-menu-drawer': 'awsui_overflow-menu-drawer_k5dlb_14a5k_296',
        'overflow-menu': 'awsui_overflow-menu_k5dlb_14a5k_296',
        'overflow-menu-header': 'awsui_overflow-menu-header_k5dlb_14a5k_316',
        'overflow-menu-header-text': 'awsui_overflow-menu-header-text_k5dlb_14a5k_323',
        'overflow-menu-header-text--secondary': 'awsui_overflow-menu-header-text--secondary_k5dlb_14a5k_332',
        'overflow-menu-header-text--title': 'awsui_overflow-menu-header-text--title_k5dlb_14a5k_338',
        'overflow-menu-back-button': 'awsui_overflow-menu-back-button_k5dlb_14a5k_342',
        'overflow-menu-dismiss-button': 'awsui_overflow-menu-dismiss-button_k5dlb_14a5k_346',
        'overflow-menu-control': 'awsui_overflow-menu-control_k5dlb_14a5k_350',
        'overflow-menu-list-item-utility': 'awsui_overflow-menu-list-item-utility_k5dlb_14a5k_365',
        'overflow-menu-control-link': 'awsui_overflow-menu-control-link_k5dlb_14a5k_372',
        'overflow-menu-control-expandable-menu-trigger':
          'awsui_overflow-menu-control-expandable-menu-trigger_k5dlb_14a5k_375',
        'overflow-menu-list': 'awsui_overflow-menu-list_k5dlb_14a5k_365',
        'overflow-menu-list-submenu': 'awsui_overflow-menu-list-submenu_k5dlb_14a5k_406',
        'overflow-menu-list-item': 'awsui_overflow-menu-list-item_k5dlb_14a5k_365',
        'overflow-menu-list-item-icon': 'awsui_overflow-menu-list-item-icon_k5dlb_14a5k_414',
        'overflow-menu-list-item-text': 'awsui_overflow-menu-list-item-text_k5dlb_14a5k_417',
        'overflow-menu-list-item-submenu': 'awsui_overflow-menu-list-item-submenu_k5dlb_14a5k_424',
        'overflow-menu-list-item-dropdown-menu':
          'awsui_overflow-menu-list-item-dropdown-menu_k5dlb_14a5k_429',
        'overflow-menu-list-item-expandable': 'awsui_overflow-menu-list-item-expandable_k5dlb_14a5k_432',
        expanded: 'awsui_expanded_k5dlb_14a5k_440'
      };
      function er(e) {
        var t = e.identity,
          n = e.search,
          i = e.utilities,
          r = (0, E.useRef)(null),
          o = (0, E.useRef)(null),
          a = (0, Fn.d)(['xxs', 's']),
          s = a[0],
          l = a[1],
          u = !!n,
          c = t && !!t.logo && !!t.title,
          f = (0, E.useMemo)(
            function () {
              return (function (e, t, n) {
                var i = [{}];
                e.some(function (e) {
                  return e.text;
                }) && i.push({ hideUtilityText: !0 });
                t && i.push({ hideUtilityText: !0, hideSearch: !0 });
                for (var r = [], o = 0; o < e.length; o++)
                  e[o].disableUtilityCollapse ||
                    (r.push(o),
                    i.push({
                      hideUtilityText: !0,
                      hideSearch: t || void 0,
                      hideUtilities: r.length > 0 ? r.slice() : void 0
                    }));
                n &&
                  i.push({
                    hideUtilityText: !0,
                    hideSearch: t || void 0,
                    hideUtilities: r.length > 0 ? r.slice() : void 0,
                    hideTitle: !0
                  });
                return i;
              })(i, u, c);
            },
            [i, u, c]
          ),
          d = (0, E.useState)(),
          h = d[0],
          p = d[1],
          v = (0, E.useCallback)(
            function () {
              var e, t, n, i;
              if ((null === r || void 0 === r ? void 0 : r.current) && o.current) {
                var a = (function (e) {
                  var t = getComputedStyle(e);
                  return (
                    parseFloat(t.width || '0px') -
                    parseFloat(t.paddingLeft || '0px') -
                    parseFloat(t.paddingRight || '0px')
                  );
                })(r.current.querySelector('.'.concat(Qi['padding-box'])));
                if (0 !== a) {
                  var s = {
                    hasSearch: u,
                    availableWidth: a,
                    fullIdentityWidth: o.current
                      .querySelector('.'.concat(Qi.identity))
                      .getBoundingClientRect().width,
                    titleWidth:
                      null !==
                        (t =
                          null === (e = o.current.querySelector('.'.concat(Qi.title))) || void 0 === e
                            ? void 0
                            : e.getBoundingClientRect().width) && void 0 !== t
                        ? t
                        : 0,
                    searchSlotWidth:
                      null !==
                        (i =
                          null === (n = o.current.querySelector('.'.concat(Qi.search))) || void 0 === n
                            ? void 0
                            : n.getBoundingClientRect().width) && void 0 !== i
                        ? i
                        : 0,
                    searchUtilityWidth: o.current
                      .querySelector('[data-utility-special="search"]')
                      .getBoundingClientRect().width,
                    utilitiesLeftPadding: parseFloat(
                      getComputedStyle(o.current.querySelector('.'.concat(Qi.utilities))).paddingLeft || '0px'
                    ),
                    utilityWithLabelWidths: Array.prototype.slice
                      .call(o.current.querySelectorAll('[data-utility-hide="false"]'))
                      .map(function (e) {
                        return e.getBoundingClientRect().width;
                      }),
                    utilityWithoutLabelWidths: Array.prototype.slice
                      .call(o.current.querySelectorAll('[data-utility-hide="true"]'))
                      .map(function (e) {
                        return e.getBoundingClientRect().width;
                      }),
                    menuTriggerUtilityWidth: o.current
                      .querySelector('[data-utility-special="menu-trigger"]')
                      .getBoundingClientRect().width
                  };
                  p(
                    (function (e, t) {
                      for (
                        var n = t.hasSearch,
                          i = t.availableWidth,
                          r = t.utilitiesLeftPadding,
                          o = t.fullIdentityWidth,
                          a = t.titleWidth,
                          s = t.searchSlotWidth,
                          l = t.searchUtilityWidth,
                          u = t.utilityWithLabelWidths,
                          c = t.utilityWithoutLabelWidths,
                          f = t.menuTriggerUtilityWidth,
                          d = function (e) {
                            var t = n ? (e.hideSearch ? l : s) : 0,
                              d = (e.hideUtilityText ? c : u)
                                .filter(function (t, n) {
                                  return !e.hideUtilities || -1 === e.hideUtilities.indexOf(n);
                                })
                                .reduce(function (e, t) {
                                  return e + t;
                                }, 0),
                              h = e.hideUtilities ? f : 0;
                            if ((e.hideTitle ? o - a : o) + t + r + d + h <= i - 20) return { value: e };
                          },
                          h = 0,
                          p = e;
                        h < p.length;
                        h++
                      ) {
                        var v = d(p[h]);
                        if ('object' === typeof v) return v.value;
                      }
                      return e[e.length - 1];
                    })(f, s)
                  );
                } else p(f[0]);
              } else p(f[0]);
            },
            [f, u]
          ),
          _ = (0, re.D)(
            function () {
              v();
            },
            [v]
          )[1],
          m = (0, E.useCallback)(
            function (e) {
              (o.current = e), v();
            },
            [v]
          ),
          g = (0, E.useState)(!0),
          w = g[0],
          y = g[1],
          b = !w && u && (null === h || void 0 === h ? void 0 : h.hideSearch);
        return (
          (0, E.useEffect)(
            function () {
              (null === h || void 0 === h ? void 0 : h.hideSearch) || y(!0);
            },
            [h]
          ),
          (0, E.useEffect)(
            function () {
              var e, t;
              b &&
                (null ===
                  (t =
                    null === (e = null === r || void 0 === r ? void 0 : r.current) || void 0 === e
                      ? void 0
                      : e.querySelector('.'.concat(Qi.search, ' input'))) ||
                  void 0 === t ||
                  t.focus());
            },
            [b, r]
          ),
          {
            mainRef: (0, oe.q)(r, _, l),
            virtualRef: m,
            responsiveState: null !== h && void 0 !== h ? h : f[0],
            breakpoint: null !== s && void 0 !== s ? s : 'default',
            isSearchExpanded: !!b,
            onSearchUtilityClick: function () {
              return y(function (e) {
                return !e;
              });
            }
          }
        );
      }
      var tr = n(1646),
        nr =
          (n(9983),
          {
            button: 'awsui_button_m5h9f_vm2i5_93',
            expanded: 'awsui_expanded_m5h9f_vm2i5_123',
            'offset-right-none': 'awsui_offset-right-none_m5h9f_vm2i5_134',
            'offset-right-l': 'awsui_offset-right-l_m5h9f_vm2i5_137',
            'offset-right-xxl': 'awsui_offset-right-xxl_m5h9f_vm2i5_140',
            text: 'awsui_text_m5h9f_vm2i5_162',
            icon: 'awsui_icon_m5h9f_vm2i5_166'
          }),
        ir = E.forwardRef(function (e, t) {
          var n,
            i = e.iconName,
            r = e.iconUrl,
            o = e.iconAlt,
            a = e.iconSvg,
            s = e.badge,
            l = e.ariaLabel,
            u = e.offsetRight,
            c = e.disabled,
            f = e.expanded,
            d = e.children,
            h = e.onClick,
            p = (0, dt.Z)(),
            v = i || r || a;
          return E.createElement(
            'button',
            (0, $.pi)({}, p, {
              ref: t,
              type: 'button',
              className: (0, J.Z)(
                nr.button,
                nr['offset-right-'.concat(u)],
                ((n = {}), (n[nr.expanded] = f), n)
              ),
              'aria-label': l,
              'aria-expanded': !!f,
              'aria-haspopup': !0,
              disabled: c,
              onClick: function (e) {
                e.preventDefault(), h && h();
              }
            }),
            v && E.createElement(ht.Z, { className: nr.icon, name: i, url: r, alt: o, svg: a, badge: s }),
            d && E.createElement('span', { className: nr.text }, d),
            d &&
              E.createElement(ht.Z, {
                name: 'caret-down-filled',
                className: f ? Bt['rotate-up'] : Bt['rotate-down']
              })
          );
        }),
        rr = function (e) {
          var t = e.iconName,
            n = e.iconUrl,
            i = e.iconAlt,
            r = e.iconSvg,
            o = e.badge,
            a = e.ariaLabel,
            s = e.offsetRight,
            l = e.children,
            u = (0, $._T)(e, [
              'iconName',
              'iconUrl',
              'iconAlt',
              'iconSvg',
              'badge',
              'ariaLabel',
              'offsetRight',
              'children'
            ]),
            c = (0, Y.j)(u);
          return E.createElement(
            Nn,
            (0, $.pi)({}, c, u, {
              variant: 'navigation',
              customTriggerBuilder: function (e, u, c, f) {
                return E.createElement(
                  ir,
                  {
                    ref: u,
                    disabled: c,
                    expanded: f,
                    iconName: t,
                    iconUrl: n,
                    iconAlt: i,
                    iconSvg: r,
                    badge: o,
                    ariaLabel: a,
                    offsetRight: s,
                    onClick: e
                  },
                  l
                );
              },
              preferCenter: !0
            })
          );
        };
      (0, Ue.b)(rr, 'MenuDropdown');
      var or = rr;
      function ar(e) {
        var t,
          n = e.hideText,
          i = e.definition,
          r = e.offsetRight,
          o = !!i.iconName || !!i.iconUrl || !!i.iconAlt || !!i.iconSvg,
          a = n && !i.disableTextCollapse && o,
          s = null !== (t = i.ariaLabel) && void 0 !== t ? t : i.text;
        if ('button' === i.type)
          return (
            (0, Sn.J)('TopNavigation', i.href),
            'primary-button' === i.variant
              ? E.createElement(
                  'span',
                  { className: Qi['offset-right-'.concat(r)] },
                  E.createElement(
                    ce.l,
                    {
                      variant: 'primary',
                      href: i.href,
                      target: i.external ? '_blank' : void 0,
                      onClick: i.onClick,
                      ariaLabel: s,
                      iconName: i.iconName,
                      iconUrl: i.iconUrl,
                      iconAlt: i.iconAlt,
                      iconSvg: i.iconSvg
                    },
                    a
                      ? null
                      : E.createElement(
                          E.Fragment,
                          null,
                          i.text,
                          i.external &&
                            E.createElement(
                              E.Fragment,
                              null,
                              ' ',
                              E.createElement(
                                'span',
                                {
                                  className: (0, J.Z)(
                                    Qi['utility-button-external-icon'],
                                    Qi['offset-right-'.concat(r)]
                                  ),
                                  'aria-label': i.externalIconAriaLabel,
                                  role: i.externalIconAriaLabel ? 'img' : void 0
                                },
                                E.createElement(ht.Z, { name: 'external' })
                              )
                            )
                        )
                  )
                )
              : E.createElement(
                  'span',
                  { className: Qi['offset-right-'.concat(r)] },
                  E.createElement(
                    tr.Z,
                    {
                      variant: 'top-navigation',
                      href: i.href,
                      target: i.external ? '_blank' : void 0,
                      onFollow: i.onClick,
                      ariaLabel: s
                    },
                    o &&
                      E.createElement(ht.Z, {
                        name: i.iconName,
                        url: i.iconUrl,
                        alt: i.iconAlt,
                        svg: i.iconSvg,
                        badge: i.badge
                      }),
                    !a &&
                      i.text &&
                      E.createElement('span', { className: o ? Qi['utility-link-icon'] : void 0 }, i.text),
                    i.external &&
                      E.createElement(
                        E.Fragment,
                        null,
                        ' ',
                        E.createElement(
                          'span',
                          {
                            role: i.externalIconAriaLabel ? 'img' : void 0,
                            'aria-label': i.externalIconAriaLabel
                          },
                          E.createElement(ht.Z, { name: 'external', size: 'normal' })
                        )
                      )
                  )
                )
          );
        if ('menu-dropdown' === i.type) {
          var l = i.title || i.text,
            u = a || !i.text;
          return (
            sr(i.items),
            E.createElement(
              or,
              (0, $.pi)({}, i, { title: u ? l : '', ariaLabel: s, offsetRight: r }),
              !a && i.text
            )
          );
        }
        return null;
      }
      function sr(e) {
        for (var t = 0, n = e; t < n.length; t++) {
          var i = n[t];
          (0, Sn.J)('TopNavigation', i.href), 'items' in i && sr(i.items);
        }
      }
      var lr = { state: { view: 'utilities', data: null }, setState: function () {} },
        ur = (0, E.createContext)(lr),
        cr = function () {
          var e = (0, E.useContext)(ur).setState;
          return function (t, n) {
            e({ view: t, data: n });
          };
        },
        fr = function (e) {
          var t = e.view,
            n = e.element,
            i = (0, E.useContext)(ur).state;
          return t === i.view
            ? 'function' === typeof n
              ? n(i.data)
              : E.createElement(E.Fragment, null, n)
            : null;
        },
        dr = function (e) {
          var t = e.children,
            n = (0, E.useState)({ view: 'utilities', data: null }),
            i = n[0],
            r = n[1];
          return E.createElement(ur.Provider, { value: { state: i, setState: r } }, t);
        },
        hr = n(2086),
        pr = function (e) {
          var t = e.children,
            n = e.secondaryText,
            i = e.backIconAriaLabel,
            r = e.dismissIconAriaLabel,
            o = e.onBack,
            a = e.onClose;
          return E.createElement(
            'div',
            { className: Qi['overflow-menu-header'] },
            o &&
              E.createElement(ce.Z, {
                className: Qi['overflow-menu-back-button'],
                ariaLabel: i,
                iconName: 'angle-left',
                variant: 'icon',
                onClick: function () {
                  return o();
                }
              }),
            E.createElement(
              'h2',
              { className: Qi['overflow-menu-header-text'] },
              E.createElement('div', { className: Qi['overflow-menu-header-text--title'] }, t),
              n && E.createElement('div', { className: Qi['overflow-menu-header-text--secondary'] }, n)
            ),
            E.createElement(ce.Z, {
              className: Qi['overflow-menu-dismiss-button'],
              ariaLabel: r,
              iconName: 'close',
              variant: 'icon',
              onClick: function () {
                return a && a();
              }
            })
          );
        },
        vr = function (e) {
          var t = e.children,
            n = e.startIcon,
            i = e.endIcon;
          return E.createElement(
            E.Fragment,
            null,
            n && E.createElement('span', { className: Qi['overflow-menu-list-item-icon'] }, n),
            E.createElement('span', { className: Qi['overflow-menu-list-item-text'] }, t),
            i && i
          );
        },
        _r = (0, E.forwardRef)(function (e, t) {
          var n = e.children,
            i = e.external,
            r = e.href,
            o = e.startIcon,
            a = e.endIcon,
            s = e.onFollow,
            l = e.context,
            u = e.testId,
            c = (0, dt.Z)(),
            f = {
              rel: i ? 'noopener noreferrer' : void 0,
              target: i ? '_blank' : void 0,
              href: r,
              onClick: function (e) {
                (0, te.p_)(e) && (null === s || void 0 === s || s(e));
              }
            },
            d = {
              role: 'button',
              tabIndex: 0,
              onKeyDown: function (e) {
                ' ' === e.key && e.preventDefault();
              },
              onKeyUp: function (e) {
                (' ' !== e.key && 'Enter' !== e.key) || null === s || void 0 === s || s(e);
              },
              onClick: s
            };
          return E.createElement(
            'a',
            (0, $.pi)(
              {
                ref: t,
                className: (0, J.Z)(
                  Qi['overflow-menu-control'],
                  Qi['overflow-menu-control-link'],
                  l && Qi['overflow-menu-control-'.concat(l)]
                )
              },
              'string' === typeof r ? f : d,
              c,
              u ? { 'data-testid': u } : {}
            ),
            E.createElement(vr, { startIcon: o, endIcon: a }, n)
          );
        }),
        mr = (0, E.forwardRef)(function (e, t) {
          var n = e.children,
            i = e.startIcon,
            r = e.endIcon,
            o = e.onFollow,
            a = e.testId,
            s = (0, dt.Z)();
          return E.createElement(
            'button',
            (0, $.pi)(
              { ref: t, className: Qi['overflow-menu-control'], onClick: o },
              s,
              'string' === typeof a ? { 'data-testid': a } : {}
            ),
            E.createElement(vr, { startIcon: i, endIcon: r }, n)
          );
        }),
        gr = (0, E.forwardRef)(function (e, t) {
          var n = e.startIcon,
            i = e.children,
            r = e.index,
            o = e.testId,
            a = (0, $._T)(e, ['startIcon', 'children', 'index', 'testId']),
            s = cr();
          return E.createElement(
            mr,
            {
              ref: t,
              startIcon: n,
              endIcon: E.createElement(ht.Z, { name: 'angle-right' }),
              testId: o,
              onFollow: function () {
                return s('dropdown-menu', {
                  definition: a,
                  headerText: a.text || a.title,
                  headerSecondaryText: a.description,
                  utilityIndex: r
                });
              }
            },
            i
          );
        }),
        wr = function (e) {
          var t = e.children,
            n = e.onItemClick,
            i = (0, $._T)(e, ['children', 'onItemClick']),
            r = (0, dt.Z)(),
            o = (0, E.useState)(!1),
            a = o[0],
            s = o[1],
            l = (0, At.L)('overflow-menu-item');
          return E.createElement(
            E.Fragment,
            null,
            E.createElement(
              'button',
              (0, $.pi)(
                {
                  className: (0, J.Z)(
                    Qi['overflow-menu-control'],
                    Qi['overflow-menu-control-expandable-menu-trigger']
                  ),
                  onClick: function () {
                    return s(function (e) {
                      return !e;
                    });
                  },
                  'aria-expanded': a
                },
                r
              ),
              E.createElement(
                vr,
                {
                  endIcon: E.createElement(
                    'span',
                    { className: (0, J.Z)(Qi.icon, a && Qi.expanded) },
                    E.createElement(ht.Z, { name: 'caret-up-filled' })
                  )
                },
                E.createElement('span', { id: l }, t)
              )
            ),
            a &&
              E.createElement(
                'ul',
                {
                  className: (0, J.Z)(Qi['overflow-menu-list'], Qi['overflow-menu-list-submenu']),
                  'aria-labelledby': l
                },
                i.items.map(function (e, t) {
                  var i = 'undefined' !== typeof e.items;
                  return E.createElement(
                    'li',
                    {
                      key: t,
                      className: (0, J.Z)(
                        Qi['overflow-menu-list-item'],
                        Qi['overflow-menu-list-item-dropdown-menu']
                      )
                    },
                    yr(e, i, n)
                  );
                })
              )
          );
        };
      function yr(e, t, n) {
        var i = e.text,
          r =
            (!!e.iconName || !!e.iconUrl || !!e.iconAlt || !!e.iconSvg) &&
            E.createElement(ht.Z, { name: e.iconName, url: e.iconUrl, alt: e.iconAlt, svg: e.iconSvg });
        return t
          ? E.createElement(wr, (0, $.pi)({}, e, { onItemClick: n }), i)
          : E.createElement(
              _r,
              {
                startIcon: r,
                href: e.href,
                external: e.external,
                context: 'dropdown-menu',
                testId: e.id,
                onFollow: function () {
                  return n(e);
                }
              },
              i,
              e.external &&
                E.createElement(
                  E.Fragment,
                  null,
                  ' ',
                  E.createElement(
                    'span',
                    { 'aria-label': e.externalIconAriaLabel, role: e.externalIconAriaLabel ? 'img' : void 0 },
                    E.createElement(ht.Z, { name: 'external', size: 'normal' })
                  )
                )
            );
      }
      var br = (0, E.forwardRef)(function (e, t) {
          var n = e.index,
            i = (0, $._T)(e, ['index']);
          return E.createElement(
            'li',
            { className: (0, J.Z)(Qi['overflow-menu-list-item'], Qi['overflow-menu-list-item-utility']) },
            (function (e, t, n) {
              var i = e.text || e.title,
                r =
                  (!!e.iconName || !!e.iconUrl || !!e.iconAlt || !!e.iconSvg) &&
                  E.createElement(ht.Z, { name: e.iconName, url: e.iconUrl, alt: e.iconAlt, svg: e.iconSvg });
              switch (e.type) {
                case 'button':
                  var o = function (t) {
                    (0, te.y1)(e.onClick, {}, t);
                  };
                  return 'primary-button' === e.variant
                    ? E.createElement(mr, { ref: n, startIcon: r, onFollow: o, testId: '__'.concat(t) }, i)
                    : E.createElement(
                        _r,
                        {
                          ref: n,
                          startIcon: r,
                          href: e.href,
                          external: e.external,
                          testId: '__'.concat(t),
                          onFollow: o
                        },
                        i,
                        e.external &&
                          E.createElement(
                            E.Fragment,
                            null,
                            ' ',
                            E.createElement(
                              'span',
                              {
                                'aria-label': e.externalIconAriaLabel,
                                role: e.externalIconAriaLabel ? 'img' : void 0
                              },
                              E.createElement(ht.Z, { name: 'external', size: 'normal' })
                            )
                          )
                      );
                case 'menu-dropdown':
                  return E.createElement(
                    gr,
                    (0, $.pi)({ ref: n, startIcon: r, index: t }, e, { testId: '__'.concat(t) }),
                    i
                  );
              }
            })(i, n, t)
          );
        }),
        xr = function (e) {
          var t = 'undefined' !== typeof e.items;
          return E.createElement(
            'li',
            {
              className: (0, J.Z)(
                Qi['overflow-menu-list-item'],
                Qi['overflow-menu-list-item-submenu'],
                t && Qi['overflow-menu-list-item-expandable']
              )
            },
            yr(e, t, e.onItemClick)
          );
        },
        Er = function (e) {
          var t = e.headerText,
            n = e.dismissIconAriaLabel,
            i = e.onClose,
            r = e.items,
            o = void 0 === r ? [] : r,
            a = e.focusIndex,
            s = (0, At.L)('overflow-menu-header'),
            l = (0, E.useRef)(null);
          return (
            (0, E.useEffect)(
              function () {
                var e;
                'number' === typeof a && (null === (e = l.current) || void 0 === e || e.focus());
              },
              [a]
            ),
            E.createElement(
              hr.ZP,
              { returnFocus: !0 },
              E.createElement(
                pr,
                { dismissIconAriaLabel: n, onClose: i },
                E.createElement('span', { id: s }, t)
              ),
              E.createElement(
                'ul',
                { className: Qi['overflow-menu-list'], 'aria-labelledby': s },
                o.map(function (e, t) {
                  return E.createElement(br, (0, $.pi)({ key: t, index: t, ref: t === a ? l : void 0 }, e));
                })
              )
            )
          );
        },
        kr = function (e) {
          var t = e.onClose,
            n = e.utilityIndex,
            i = e.headerText,
            r = e.headerSecondaryText,
            o = e.dismissIconAriaLabel,
            a = e.backIconAriaLabel,
            s = e.definition,
            l = cr(),
            u = (0, At.L)('overflow-menu-header');
          return E.createElement(
            hr.ZP,
            { returnFocus: !0 },
            E.createElement(
              pr,
              {
                secondaryText: r,
                dismissIconAriaLabel: o,
                backIconAriaLabel: a,
                onClose: t,
                onBack: function () {
                  return l('utilities', { utilityIndex: n });
                }
              },
              E.createElement('span', { id: u }, i)
            ),
            E.createElement(
              'ul',
              {
                className: (0, J.Z)(Qi['overflow-menu-list'], Qi['overflow-menu-list-submenu']),
                'aria-labelledby': u
              },
              s.items.map(function (e, n) {
                return E.createElement(
                  xr,
                  (0, $.pi)({ key: n }, e, {
                    onItemClick: function (e) {
                      (0, te.y1)(s.onItemClick, { id: e.id, href: e.href, external: e.external }),
                        null === t || void 0 === t || t();
                    }
                  })
                );
              })
            )
          );
        },
        Cr = function (e) {
          var t = e.headerText,
            n = e.dismissIconAriaLabel,
            i = e.backIconAriaLabel,
            r = e.items,
            o = void 0 === r ? [] : r,
            a = e.onClose;
          return E.createElement(
            'div',
            {
              className: Qi['overflow-menu'],
              onKeyUp: function (e) {
                'Escape' === e.key && (null === a || void 0 === a || a());
              }
            },
            E.createElement(
              dr,
              null,
              E.createElement(fr, {
                view: 'utilities',
                element: function (e) {
                  return E.createElement(Er, {
                    headerText: t,
                    items: o,
                    focusIndex: null === e || void 0 === e ? void 0 : e.utilityIndex,
                    dismissIconAriaLabel: n,
                    backIconAriaLabel: i,
                    onClose: a
                  });
                }
              }),
              E.createElement(fr, {
                view: 'dropdown-menu',
                element: function (e) {
                  return E.createElement(kr, {
                    headerText: null === e || void 0 === e ? void 0 : e.headerText,
                    headerSecondaryText: null === e || void 0 === e ? void 0 : e.headerSecondaryText,
                    dismissIconAriaLabel: n,
                    backIconAriaLabel: i,
                    definition: null === e || void 0 === e ? void 0 : e.definition,
                    utilityIndex: null === e || void 0 === e ? void 0 : e.utilityIndex,
                    onClose: a
                  });
                }
              })
            )
          );
        };
      function Sr(e) {
        var t = e.__internalRootRef,
          n = e.identity,
          i = e.i18nStrings,
          r = e.utilities,
          o = e.search,
          a = (0, $._T)(e, ['__internalRootRef', 'identity', 'i18nStrings', 'utilities', 'search']);
        (0, Sn.J)('TopNavigation', n.href);
        var s = (0, Y.j)(a),
          l = er({ identity: n, search: o, utilities: r }),
          u = l.mainRef,
          c = l.virtualRef,
          f = l.breakpoint,
          d = l.responsiveState,
          h = l.isSearchExpanded,
          p = l.onSearchUtilityClick,
          v = (0, E.useState)(!1),
          _ = v[0],
          m = v[1],
          g = (0, E.useRef)(null),
          w = 'default' === f,
          y = 'xxs' === f,
          b = 's' === f,
          x = function (e) {
            (0, te.p_)(e) && (0, te.y1)(n.onFollow, {}, e);
          },
          k = function () {
            m(function (e) {
              return !e;
            });
          },
          C = (0, dt.Z)(),
          S = !h && d.hideUtilities;
        (0, E.useEffect)(
          function () {
            m(!1);
          },
          [S]
        ),
          (0, Je.G)(
            function () {
              var e;
              _ || null === (e = g.current) || void 0 === e || e.focus();
            },
            [_]
          );
        var N = function (e) {
          var t,
            a,
            s,
            l,
            f,
            v,
            m = e ? 'div' : 'header',
            N = e || !h,
            j = e || !d.hideTitle,
            z = o && (e || !d.hideSearch || h),
            O = e || (o && d.hideSearch),
            T = e || !h,
            R = e || S;
          return E.createElement(
            m,
            {
              ref: e ? c : u,
              'aria-hidden': !!e || void 0,
              className: (0, J.Z)(
                Qi['top-navigation'],
                ((t = {}), (t[Qi.virtual] = e), (t[Qi.hidden] = e), (t[Qi.narrow] = w), (t[Qi.medium] = y), t)
              )
            },
            E.createElement(
              'div',
              { className: Qi['padding-box'] },
              N &&
                E.createElement(
                  'div',
                  { className: (0, J.Z)(Qi.identity, !n.logo && Qi['no-logo']) },
                  E.createElement(
                    'a',
                    (0, $.pi)({}, C, { className: Qi['identity-link'], href: n.href, onClick: x }),
                    n.logo &&
                      E.createElement('img', {
                        role: 'img',
                        src: null === (f = n.logo) || void 0 === f ? void 0 : f.src,
                        alt: null === (v = n.logo) || void 0 === v ? void 0 : v.alt,
                        className: (0, J.Z)(Qi.logo, ((a = {}), (a[Qi.narrow] = w), a))
                      }),
                    j && E.createElement('span', { className: Qi.title }, n.title)
                  )
                ),
              E.createElement(
                'div',
                { className: Qi.inputs },
                z &&
                  E.createElement(
                    'div',
                    { className: (0, J.Z)(Qi.search, !e && h && Qi['search-expanded']) },
                    o
                  )
              ),
              E.createElement(
                'div',
                { className: Qi.utilities },
                O &&
                  E.createElement(
                    'div',
                    {
                      className: (0, J.Z)(
                        Qi['utility-wrapper'],
                        Qi['utility-type-button'],
                        Qi['utility-type-button-link'],
                        ((s = {}), (s[Qi.narrow] = w), (s[Qi.medium] = y), s)
                      ),
                      'data-utility-special': 'search'
                    },
                    E.createElement(ar, {
                      hideText: !0,
                      definition: {
                        type: 'button',
                        iconName: h ? 'close' : 'search',
                        ariaLabel: h ? i.searchDismissIconAriaLabel : i.searchIconAriaLabel,
                        onClick: p
                      }
                    })
                  ),
                T &&
                  r
                    .filter(function (t, n) {
                      return e || !d.hideUtilities || -1 === d.hideUtilities.indexOf(n);
                    })
                    .map(function (t, n) {
                      var i,
                        o,
                        a = !!d.hideUtilityText,
                        s = (e || !R) && n === r.length - 1,
                        l = s && b ? 'xxl' : s ? 'l' : void 0;
                      return E.createElement(
                        'div',
                        {
                          key: n,
                          className: (0, J.Z)(
                            Qi['utility-wrapper'],
                            Qi['utility-type-'.concat(t.type)],
                            'button' === t.type &&
                              Qi[
                                'utility-type-button-'.concat(
                                  null !== (o = t.variant) && void 0 !== o ? o : 'link'
                                )
                              ],
                            ((i = {}), (i[Qi.narrow] = w), (i[Qi.medium] = y), i)
                          ),
                          'data-utility-index': n,
                          'data-utility-hide': ''.concat(a)
                        },
                        E.createElement(ar, { hideText: a, definition: t, offsetRight: l })
                      );
                    }),
                e &&
                  r.map(function (e, t) {
                    var n,
                      i,
                      o = !d.hideUtilityText,
                      a = !R && t === r.length - 1,
                      s = a && b ? 'xxl' : a ? 'l' : void 0;
                    return E.createElement(
                      'div',
                      {
                        key: t,
                        className: (0, J.Z)(
                          Qi['utility-wrapper'],
                          Qi['utility-type-'.concat(e.type)],
                          'button' === e.type &&
                            Qi[
                              'utility-type-button-'.concat(
                                null !== (i = e.variant) && void 0 !== i ? i : 'link'
                              )
                            ],
                          ((n = {}), (n[Qi.narrow] = w), (n[Qi.medium] = y), n)
                        ),
                        'data-utility-index': t,
                        'data-utility-hide': ''.concat(o)
                      },
                      E.createElement(ar, { hideText: o, definition: e, offsetRight: s })
                    );
                  }),
                R &&
                  E.createElement(
                    'div',
                    {
                      className: (0, J.Z)(
                        Qi['utility-wrapper'],
                        Qi['utility-type-menu-dropdown'],
                        ((l = {}), (l[Qi.narrow] = w), (l[Qi.medium] = y), l)
                      ),
                      'data-utility-special': 'menu-trigger'
                    },
                    E.createElement(
                      ir,
                      { expanded: _, onClick: k, offsetRight: 'l', ref: e ? void 0 : g },
                      i.overflowMenuTriggerText
                    )
                  )
              )
            )
          );
        };
        return E.createElement(
          'div',
          (0, $.pi)({}, s, { ref: t }),
          E.createElement(
            Wn.Z,
            { contextName: 'top-navigation' },
            N(!1),
            E.createElement(Wt.Z, null, N(!0)),
            S &&
              _ &&
              E.createElement(
                'div',
                { className: Qi['overflow-menu-drawer'] },
                E.createElement(Cr, {
                  headerText: i.overflowMenuTitleText,
                  dismissIconAriaLabel: i.overflowMenuDismissIconAriaLabel,
                  backIconAriaLabel: i.overflowMenuBackIconAriaLabel,
                  items: r.filter(function (e, t) {
                    return (
                      (!d.hideUtilities || -1 !== d.hideUtilities.indexOf(t)) && !e.disableUtilityCollapse
                    );
                  }),
                  onClose: k
                })
              )
          )
        );
      }
      function Nr(e) {
        var t = e.utilities,
          n = void 0 === t ? [] : t,
          i = (0, $._T)(e, ['utilities']),
          r = (0, Fe.Z)('TopNavigation');
        return E.createElement(Sr, (0, $.pi)({}, r, { utilities: n }, i));
      }
      (0, Ue.b)(Nr, 'TopNavigation');
      var jr = {
          id: 'sample-researcher-id',
          givenName: 'Researcher',
          familyName: 'User',
          email: 'sample.user@example.com',
          avatar: { name: 'user-profile' },
          claims: [],
          role: 'researcher'
        },
        zr = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        Or = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        };
      function Tr() {
        var e = this,
          t = Ji().settings,
          n = Hi(),
          i = n.user,
          r = n.signOut,
          o = null !== i && void 0 !== i ? i : jr,
          a = [{ id: 'signout', text: D.signout }];
        return E.createElement(Nr, {
          id: 'header',
          className: 'header',
          i18nStrings: D,
          identity: { href: '/', title: t.name, logo: { src: t.logo, alt: t.name } },
          utilities: [
            {
              type: 'menu-dropdown',
              text: ''.concat(o.givenName, ' ').concat(o.familyName),
              description: o.email,
              items: a,
              onItemClick: function () {
                return zr(e, void 0, void 0, function () {
                  return Or(this, function (e) {
                    switch (e.label) {
                      case 0:
                        return [4, r()];
                      case 1:
                        return [2, e.sent()];
                    }
                  });
                });
              }
            }
          ]
        });
      }
      var Rr = n(2940);
      function Br(e) {
        var t = e.gridDefinition,
          n = void 0 === t ? [] : t,
          i = e.disableGutters,
          r = void 0 !== i && i,
          o = e.children,
          a = (0, $._T)(e, ['gridDefinition', 'disableGutters', 'children']),
          s = (0, Fe.Z)('Grid'),
          l = (0, Y.j)(a),
          u = (0, Fn.d)(void 0),
          c = u[0],
          f = u[1];
        return E.createElement(
          Rr.Z,
          (0, $.pi)({}, l, s, { ref: f, __breakpoint: c, gridDefinition: n, disableGutters: r }),
          o
        );
      }
      (0, Ue.b)(Br, 'Grid');
      var Ar = function (e, t, n, i) {
          return new (n || (n = Promise))(function (r, o) {
            function a(e) {
              try {
                l(i.next(e));
              } catch (mi) {
                o(mi);
              }
            }
            function s(e) {
              try {
                l(i.throw(e));
              } catch (mi) {
                o(mi);
              }
            }
            function l(e) {
              var t;
              e.done
                ? r(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(a, s);
            }
            l((i = i.apply(e, t || [])).next());
          });
        },
        Lr = function (e, t) {
          var n,
            i,
            r,
            o,
            a = {
              label: 0,
              sent: function () {
                if (1 & r[0]) throw r[1];
                return r[1];
              },
              trys: [],
              ops: []
            };
          return (
            (o = { next: s(0), throw: s(1), return: s(2) }),
            'function' === typeof Symbol &&
              (o[Symbol.iterator] = function () {
                return this;
              }),
            o
          );
          function s(o) {
            return function (s) {
              return (function (o) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; a; )
                  try {
                    if (
                      ((n = 1),
                      i &&
                        (r =
                          2 & o[0]
                            ? i.return
                            : o[0]
                            ? i.throw || ((r = i.return) && r.call(i), 0)
                            : i.next) &&
                        !(r = r.call(i, o[1])).done)
                    )
                      return r;
                    switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                      case 0:
                      case 1:
                        r = o;
                        break;
                      case 4:
                        return a.label++, { value: o[1], done: !1 };
                      case 5:
                        a.label++, (i = o[1]), (o = [0]);
                        continue;
                      case 7:
                        (o = a.ops.pop()), a.trys.pop();
                        continue;
                      default:
                        if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                          a = 0;
                          continue;
                        }
                        if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                          a.label = o[1];
                          break;
                        }
                        if (6 === o[0] && a.label < r[1]) {
                          (a.label = r[1]), (r = o);
                          break;
                        }
                        if (r && a.label < r[2]) {
                          (a.label = r[2]), a.ops.push(o);
                          break;
                        }
                        r[2] && a.ops.pop(), a.trys.pop();
                        continue;
                    }
                    o = t.call(e, a);
                  } catch (mi) {
                    (o = [6, mi]), (i = 0);
                  } finally {
                    n = r = 0;
                  }
                if (5 & o[0]) throw o[1];
                return { value: o[0] ? o[1] : void 0, done: !0 };
              })([o, s]);
            };
          }
        };
      function Pr() {
        var e = this,
          t = Hi().signIn;
        return E.createElement(
          F.Z,
          {
            'data-testid': 'login',
            className: 'primaryButton',
            variant: 'primary',
            onClick: function () {
              return Ar(e, void 0, void 0, function () {
                return Lr(this, function (e) {
                  switch (e.label) {
                    case 0:
                      return [4, t()];
                    case 1:
                      return [2, e.sent()];
                  }
                });
              });
            }
          },
          'Login'
        );
      }
      function Zr() {
        var e = Ji().settings;
        return E.createElement(
          'div',
          { className: 'custom-home__header' },
          E.createElement(
            q.Z,
            { padding: { vertical: 'xxxl', horizontal: 's' } },
            E.createElement(
              Br,
              {
                gridDefinition: [
                  { colspan: { xl: 6, l: 5, s: 6, xxs: 10 }, offset: { l: 2, xxs: 1 } },
                  { colspan: { xl: 2, l: 3, s: 4, xxs: 10 }, offset: { s: 0, xxs: 1 } }
                ]
              },
              E.createElement(
                'div',
                { className: 'custom-home__header-title' },
                E.createElement(
                  q.Z,
                  {
                    variant: 'h1',
                    fontWeight: 'heavy',
                    padding: 'n',
                    fontSize: 'display-l',
                    color: 'inherit'
                  },
                  E.createElement('span', null, e.name)
                ),
                e.slogan &&
                  E.createElement(
                    q.Z,
                    {
                      fontWeight: 'light',
                      padding: { bottom: 's' },
                      fontSize: 'display-l',
                      color: 'inherit'
                    },
                    E.createElement('span', null, e.slogan)
                  ),
                e.description &&
                  E.createElement(
                    q.Z,
                    { variant: 'p', fontWeight: 'light' },
                    E.createElement('span', { className: 'custom-home__header-sub-title' }, e.description)
                  ),
                E.createElement(Pr, null)
              ),
              E.createElement('div', { className: 'custom-home__header-cta' })
            )
          )
        );
      }
    },
    4390: function () {},
    6082: function (e, t, n) {
      'use strict';
      function i(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
            : (e[t] = n),
          e
        );
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    3638: function (e, t, n) {
      'use strict';
      function i() {
        return (
          (i = Object.assign
            ? Object.assign.bind()
            : function (e) {
                for (var t = 1; t < arguments.length; t++) {
                  var n = arguments[t];
                  for (var i in n) Object.prototype.hasOwnProperty.call(n, i) && (e[i] = n[i]);
                }
                return e;
              }),
          i.apply(this, arguments)
        );
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    162: function (e, t, n) {
      'use strict';
      function i(e, t) {
        return (
          (i = Object.setPrototypeOf
            ? Object.setPrototypeOf.bind()
            : function (e, t) {
                return (e.__proto__ = t), e;
              }),
          i(e, t)
        );
      }
      function r(e, t) {
        (e.prototype = Object.create(t.prototype)), (e.prototype.constructor = e), i(e, t);
      }
      n.d(t, {
        Z: function () {
          return r;
        }
      });
    },
    3891: function (e, t, n) {
      'use strict';
      function i(e, t) {
        if (null == e) return {};
        var n,
          i,
          r = {},
          o = Object.keys(e);
        for (i = 0; i < o.length; i++) (n = o[i]), t.indexOf(n) >= 0 || (r[n] = e[n]);
        return r;
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    4831: function (e, t, n) {
      'use strict';
      function i(e, t, n) {
        return (
          t in e
            ? Object.defineProperty(e, t, { value: n, enumerable: !0, configurable: !0, writable: !0 })
            : (e[t] = n),
          e
        );
      }
      n.d(t, {
        Z: function () {
          return i;
        }
      });
    },
    8758: function (e, t, n) {
      'use strict';
      n.d(t, {
        ZP: function () {
          return $;
        }
      });
      var i = n(1738);
      function r(e, t, n, i) {
        return new (n || (n = Promise))(function (r, o) {
          function a(e) {
            try {
              l(i.next(e));
            } catch (t) {
              o(t);
            }
          }
          function s(e) {
            try {
              l(i.throw(e));
            } catch (t) {
              o(t);
            }
          }
          function l(e) {
            var t;
            e.done
              ? r(e.value)
              : ((t = e.value),
                t instanceof n
                  ? t
                  : new n(function (e) {
                      e(t);
                    })).then(a, s);
          }
          l((i = i.apply(e, t || [])).next());
        });
      }
      function o(e, t) {
        var n,
          i,
          r,
          o,
          a = {
            label: 0,
            sent: function () {
              if (1 & r[0]) throw r[1];
              return r[1];
            },
            trys: [],
            ops: []
          };
        return (
          (o = { next: s(0), throw: s(1), return: s(2) }),
          'function' === typeof Symbol &&
            (o[Symbol.iterator] = function () {
              return this;
            }),
          o
        );
        function s(o) {
          return function (s) {
            return (function (o) {
              if (n) throw new TypeError('Generator is already executing.');
              for (; a; )
                try {
                  if (
                    ((n = 1),
                    i &&
                      (r =
                        2 & o[0] ? i.return : o[0] ? i.throw || ((r = i.return) && r.call(i), 0) : i.next) &&
                      !(r = r.call(i, o[1])).done)
                  )
                    return r;
                  switch (((i = 0), r && (o = [2 & o[0], r.value]), o[0])) {
                    case 0:
                    case 1:
                      r = o;
                      break;
                    case 4:
                      return a.label++, { value: o[1], done: !1 };
                    case 5:
                      a.label++, (i = o[1]), (o = [0]);
                      continue;
                    case 7:
                      (o = a.ops.pop()), a.trys.pop();
                      continue;
                    default:
                      if (!(r = (r = a.trys).length > 0 && r[r.length - 1]) && (6 === o[0] || 2 === o[0])) {
                        a = 0;
                        continue;
                      }
                      if (3 === o[0] && (!r || (o[1] > r[0] && o[1] < r[3]))) {
                        a.label = o[1];
                        break;
                      }
                      if (6 === o[0] && a.label < r[1]) {
                        (a.label = r[1]), (r = o);
                        break;
                      }
                      if (r && a.label < r[2]) {
                        (a.label = r[2]), a.ops.push(o);
                        break;
                      }
                      r[2] && a.ops.pop(), a.trys.pop();
                      continue;
                  }
                  o = t.call(e, a);
                } catch (s) {
                  (o = [6, s]), (i = 0);
                } finally {
                  n = r = 0;
                }
              if (5 & o[0]) throw o[1];
              return { value: o[0] ? o[1] : void 0, done: !0 };
            })([o, s]);
          };
        }
      }
      var a,
        s = function () {},
        l = s(),
        u = Object,
        c = function (e) {
          return e === l;
        },
        f = function (e) {
          return 'function' == typeof e;
        },
        d = function (e, t) {
          return u.assign({}, e, t);
        },
        h = 'undefined',
        p = function () {
          return typeof window != h;
        },
        v = new WeakMap(),
        _ = 0,
        m = function (e) {
          var t,
            n,
            i = typeof e,
            r = e && e.constructor,
            o = r == Date;
          if (u(e) !== e || o || r == RegExp)
            t = o ? e.toJSON() : 'symbol' == i ? e.toString() : 'string' == i ? JSON.stringify(e) : '' + e;
          else {
            if ((t = v.get(e))) return t;
            if (((t = ++_ + '~'), v.set(e, t), r == Array)) {
              for (t = '@', n = 0; n < e.length; n++) t += m(e[n]) + ',';
              v.set(e, t);
            }
            if (r == u) {
              t = '#';
              for (var a = u.keys(e).sort(); !c((n = a.pop())); ) c(e[n]) || (t += n + ':' + m(e[n]) + ',');
              v.set(e, t);
            }
          }
          return t;
        },
        g = !0,
        w = p(),
        y = typeof document != h,
        b = w && window.addEventListener ? window.addEventListener.bind(window) : s,
        x = y ? document.addEventListener.bind(document) : s,
        E = w && window.removeEventListener ? window.removeEventListener.bind(window) : s,
        k = y ? document.removeEventListener.bind(document) : s,
        C = {
          isOnline: function () {
            return g;
          },
          isVisible: function () {
            var e = y && document.visibilityState;
            return c(e) || 'hidden' !== e;
          }
        },
        S = {
          initFocus: function (e) {
            return (
              x('visibilitychange', e),
              b('focus', e),
              function () {
                k('visibilitychange', e), E('focus', e);
              }
            );
          },
          initReconnect: function (e) {
            var t = function () {
                (g = !0), e();
              },
              n = function () {
                g = !1;
              };
            return (
              b('online', t),
              b('offline', n),
              function () {
                E('online', t), E('offline', n);
              }
            );
          }
        },
        N = !p() || 'Deno' in window,
        j = function (e) {
          return p() && typeof window.requestAnimationFrame != h
            ? window.requestAnimationFrame(e)
            : setTimeout(e, 1);
        },
        z = N ? i.useEffect : i.useLayoutEffect,
        O = 'undefined' !== typeof navigator && navigator.connection,
        T = !N && O && (['slow-2g', '2g'].includes(O.effectiveType) || O.saveData),
        R = function (e) {
          if (f(e))
            try {
              e = e();
            } catch (n) {
              e = '';
            }
          var t = [].concat(e);
          return [
            (e = 'string' == typeof e ? e : (Array.isArray(e) ? e.length : e) ? m(e) : ''),
            t,
            e ? '$swr$' + e : ''
          ];
        },
        B = new WeakMap(),
        A = function (e, t, n, i, r, o, a) {
          void 0 === a && (a = !0);
          var s = B.get(e),
            l = s[0],
            u = s[1],
            c = s[3],
            f = l[t],
            d = u[t];
          if (a && d) for (var h = 0; h < d.length; ++h) d[h](n, i, r);
          return o && (delete c[t], f && f[0])
            ? f[0](2).then(function () {
                return e.get(t);
              })
            : e.get(t);
        },
        L = 0,
        P = function () {
          return ++L;
        },
        Z = function () {
          for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
          return r(void 0, void 0, void 0, function () {
            var t, n, i, r, a, s, u, h, p, v, _, m, g, w, y, b, x, E, k, C, S;
            return o(this, function (o) {
              switch (o.label) {
                case 0:
                  if (
                    ((t = e[0]),
                    (n = e[1]),
                    (i = e[2]),
                    (r = e[3]),
                    (s =
                      !!c((a = 'boolean' === typeof r ? { revalidate: r } : r || {}).populateCache) ||
                      a.populateCache),
                    (u = !1 !== a.revalidate),
                    (h = !1 !== a.rollbackOnError),
                    (p = a.optimisticData),
                    (v = R(n)),
                    (_ = v[0]),
                    (m = v[2]),
                    !_)
                  )
                    return [2];
                  if (((g = B.get(t)), (w = g[2]), e.length < 3)) return [2, A(t, _, t.get(_), l, l, u, !0)];
                  if (
                    ((y = i),
                    (x = P()),
                    (w[_] = [x, 0]),
                    (E = !c(p)),
                    (k = t.get(_)),
                    E && ((C = f(p) ? p(k) : p), t.set(_, C), A(t, _, C)),
                    f(y))
                  )
                    try {
                      y = y(t.get(_));
                    } catch (N) {
                      b = N;
                    }
                  return y && f(y.then)
                    ? [
                        4,
                        y.catch(function (e) {
                          b = e;
                        })
                      ]
                    : [3, 2];
                case 1:
                  if (((y = o.sent()), x !== w[_][0])) {
                    if (b) throw b;
                    return [2, y];
                  }
                  b && E && h && ((s = !0), (y = k), t.set(_, k)), (o.label = 2);
                case 2:
                  return (
                    s && (b || (f(s) && (y = s(y, k)), t.set(_, y)), t.set(m, d(t.get(m), { error: b }))),
                    (w[_][1] = P()),
                    [4, A(t, _, y, b, l, u, !!s)]
                  );
                case 3:
                  if (((S = o.sent()), b)) throw b;
                  return [2, s ? S : y];
              }
            });
          });
        },
        M = function (e, t) {
          for (var n in e) e[n][0] && e[n][0](t);
        },
        I = function (e, t) {
          if (!B.has(e)) {
            var n = d(S, t),
              i = {},
              r = Z.bind(l, e),
              o = s;
            if ((B.set(e, [i, {}, {}, {}, r]), !N)) {
              var a = n.initFocus(setTimeout.bind(l, M.bind(l, i, 0))),
                u = n.initReconnect(setTimeout.bind(l, M.bind(l, i, 1)));
              o = function () {
                a && a(), u && u(), B.delete(e);
              };
            }
            return [e, r, o];
          }
          return [e, B.get(e)[4]];
        },
        H = I(new Map()),
        D = H[0],
        U = H[1],
        q = d(
          {
            onLoadingSlow: s,
            onSuccess: s,
            onError: s,
            onErrorRetry: function (e, t, n, i, r) {
              var o = n.errorRetryCount,
                a = r.retryCount,
                s = ~~((Math.random() + 0.5) * (1 << (a < 8 ? a : 8))) * n.errorRetryInterval;
              (!c(o) && a > o) || setTimeout(i, s, r);
            },
            onDiscarded: s,
            revalidateOnFocus: !0,
            revalidateOnReconnect: !0,
            revalidateIfStale: !0,
            shouldRetryOnError: !0,
            errorRetryInterval: T ? 1e4 : 5e3,
            focusThrottleInterval: 5e3,
            dedupingInterval: 2e3,
            loadingTimeout: T ? 5e3 : 3e3,
            compare: function (e, t) {
              return m(e) == m(t);
            },
            isPaused: function () {
              return !1;
            },
            cache: D,
            mutate: U,
            fallback: {}
          },
          C
        ),
        F = function (e, t) {
          var n = d(e, t);
          if (t) {
            var i = e.use,
              r = e.fallback,
              o = t.use,
              a = t.fallback;
            i && o && (n.use = i.concat(o)), r && a && (n.fallback = d(r, a));
          }
          return n;
        },
        W = (0, i.createContext)({}),
        V = function (e) {
          return f(e[1]) ? [e[0], e[1], e[2] || {}] : [e[0], null, (null === e[1] ? e[2] : e[1]) || {}];
        },
        G = function () {
          return d(q, (0, i.useContext)(W));
        },
        K = function (e, t, n) {
          var i = t[e] || (t[e] = []);
          return (
            i.push(n),
            function () {
              var e = i.indexOf(n);
              e >= 0 && ((i[e] = i[i.length - 1]), i.pop());
            }
          );
        },
        X = { dedupe: !0 },
        $ =
          (u.defineProperty(
            function (e) {
              var t = e.value,
                n = F((0, i.useContext)(W), t),
                r = t && t.provider,
                o = (0, i.useState)(function () {
                  return r ? I(r(n.cache || D), t) : l;
                })[0];
              return (
                o && ((n.cache = o[0]), (n.mutate = o[1])),
                z(function () {
                  return o ? o[2] : l;
                }, []),
                (0, i.createElement)(W.Provider, d(e, { value: n }))
              );
            },
            'default',
            { value: q }
          ),
          (a = function (e, t, n) {
            var a = n.cache,
              s = n.compare,
              u = n.fallbackData,
              h = n.suspense,
              p = n.revalidateOnMount,
              v = n.refreshInterval,
              _ = n.refreshWhenHidden,
              m = n.refreshWhenOffline,
              g = B.get(a),
              w = g[0],
              y = g[1],
              b = g[2],
              x = g[3],
              E = R(e),
              k = E[0],
              C = E[1],
              S = E[2],
              O = (0, i.useRef)(!1),
              T = (0, i.useRef)(!1),
              L = (0, i.useRef)(k),
              M = (0, i.useRef)(t),
              I = (0, i.useRef)(n),
              H = function () {
                return I.current;
              },
              D = function () {
                return H().isVisible() && H().isOnline();
              },
              U = function (e) {
                return a.set(S, d(a.get(S), e));
              },
              q = a.get(k),
              F = c(u) ? n.fallback[k] : u,
              W = c(q) ? F : q,
              V = a.get(S) || {},
              G = V.error,
              $ = !O.current,
              J = function () {
                return $ && !c(p)
                  ? p
                  : !H().isPaused() && (h ? !c(W) && n.revalidateIfStale : c(W) || n.revalidateIfStale);
              },
              Y = !(!k || !t) && (!!V.isValidating || ($ && J())),
              Q = (function (e, t) {
                var n = (0, i.useState)({})[1],
                  r = (0, i.useRef)(e),
                  o = (0, i.useRef)({ data: !1, error: !1, isValidating: !1 }),
                  a = (0, i.useCallback)(function (e) {
                    var i = !1,
                      a = r.current;
                    for (var s in e) {
                      var l = s;
                      a[l] !== e[l] && ((a[l] = e[l]), o.current[l] && (i = !0));
                    }
                    i && !t.current && n({});
                  }, []);
                return (
                  z(function () {
                    r.current = e;
                  }),
                  [r, o.current, a]
                );
              })({ data: W, error: G, isValidating: Y }, T),
              ee = Q[0],
              te = Q[1],
              ne = Q[2],
              ie = (0, i.useCallback)(
                function (e) {
                  return r(void 0, void 0, void 0, function () {
                    var t, i, r, u, d, h, p, v, _, m, g, w, y;
                    return o(this, function (o) {
                      switch (o.label) {
                        case 0:
                          if (((t = M.current), !k || !t || T.current || H().isPaused())) return [2, !1];
                          (u = !0),
                            (d = e || {}),
                            (h = !x[k] || !d.dedupe),
                            (p = function () {
                              return !T.current && k === L.current && O.current;
                            }),
                            (v = function () {
                              var e = x[k];
                              e && e[1] === r && delete x[k];
                            }),
                            (_ = { isValidating: !1 }),
                            (m = function () {
                              U({ isValidating: !1 }), p() && ne(_);
                            }),
                            U({ isValidating: !0 }),
                            ne({ isValidating: !0 }),
                            (o.label = 1);
                        case 1:
                          return (
                            o.trys.push([1, 3, , 4]),
                            h &&
                              (A(a, k, ee.current.data, ee.current.error, !0),
                              n.loadingTimeout &&
                                !a.get(k) &&
                                setTimeout(function () {
                                  u && p() && H().onLoadingSlow(k, n);
                                }, n.loadingTimeout),
                              (x[k] = [t.apply(void 0, C), P()])),
                            (y = x[k]),
                            (i = y[0]),
                            (r = y[1]),
                            [4, i]
                          );
                        case 2:
                          return (
                            (i = o.sent()),
                            h && setTimeout(v, n.dedupingInterval),
                            x[k] && x[k][1] === r
                              ? (U({ error: l }),
                                (_.error = l),
                                (g = b[k]),
                                !c(g) && (r <= g[0] || r <= g[1] || 0 === g[1])
                                  ? (m(), h && p() && H().onDiscarded(k), [2, !1])
                                  : (s(ee.current.data, i) ? (_.data = ee.current.data) : (_.data = i),
                                    s(a.get(k), i) || a.set(k, i),
                                    h && p() && H().onSuccess(i, k, n),
                                    [3, 4]))
                              : (h && p() && H().onDiscarded(k), [2, !1])
                          );
                        case 3:
                          return (
                            (w = o.sent()),
                            v(),
                            H().isPaused() ||
                              (U({ error: w }),
                              (_.error = w),
                              h &&
                                p() &&
                                (H().onError(w, k, n),
                                (('boolean' === typeof n.shouldRetryOnError && n.shouldRetryOnError) ||
                                  (f(n.shouldRetryOnError) && n.shouldRetryOnError(w))) &&
                                  D() &&
                                  H().onErrorRetry(w, k, n, ie, {
                                    retryCount: (d.retryCount || 0) + 1,
                                    dedupe: !0
                                  }))),
                            [3, 4]
                          );
                        case 4:
                          return (u = !1), m(), p() && h && A(a, k, _.data, _.error, !1), [2, !0];
                      }
                    });
                  });
                },
                [k]
              ),
              re = (0, i.useCallback)(
                Z.bind(l, a, function () {
                  return L.current;
                }),
                []
              );
            if (
              (z(function () {
                (M.current = t), (I.current = n);
              }),
              z(
                function () {
                  if (k) {
                    var e = k !== L.current,
                      t = ie.bind(l, X),
                      n = 0,
                      i = K(k, y, function (e, t, n) {
                        ne(d({ error: t, isValidating: n }, s(ee.current.data, e) ? l : { data: e }));
                      }),
                      r = K(k, w, function (e) {
                        if (0 == e) {
                          var i = Date.now();
                          H().revalidateOnFocus && i > n && D() && ((n = i + H().focusThrottleInterval), t());
                        } else if (1 == e) H().revalidateOnReconnect && D() && t();
                        else if (2 == e) return ie();
                      });
                    return (
                      (T.current = !1),
                      (L.current = k),
                      (O.current = !0),
                      e && ne({ data: W, error: G, isValidating: Y }),
                      J() && (c(W) || N ? t() : j(t)),
                      function () {
                        (T.current = !0), i(), r();
                      }
                    );
                  }
                },
                [k, ie]
              ),
              z(
                function () {
                  var e;
                  function t() {
                    var t = f(v) ? v(W) : v;
                    t && -1 !== e && (e = setTimeout(n, t));
                  }
                  function n() {
                    ee.current.error || (!_ && !H().isVisible()) || (!m && !H().isOnline())
                      ? t()
                      : ie(X).then(t);
                  }
                  return (
                    t(),
                    function () {
                      e && (clearTimeout(e), (e = -1));
                    }
                  );
                },
                [v, _, m, ie]
              ),
              (0, i.useDebugValue)(W),
              h && c(W) && k)
            )
              throw ((M.current = t), (I.current = n), (T.current = !1), c(G) ? ie(X) : G);
            return {
              mutate: re,
              get data() {
                return (te.data = !0), W;
              },
              get error() {
                return (te.error = !0), G;
              },
              get isValidating() {
                return (te.isValidating = !0), Y;
              }
            };
          }),
          function () {
            for (var e = [], t = 0; t < arguments.length; t++) e[t] = arguments[t];
            var n = G(),
              i = V(e),
              r = i[0],
              o = i[1],
              s = i[2],
              l = F(n, s),
              u = a,
              c = l.use;
            if (c) for (var f = c.length; f-- > 0; ) u = c[f](u);
            return u(r, o || l.fetcher, l);
          });
    }
  },
  function (e) {
    var t = function (t) {
      return e((e.s = t));
    };
    e.O(0, [774, 179], function () {
      return t(8526), t(7792);
    });
    var n = e.O();
    _N_E = n;
  }
]);
