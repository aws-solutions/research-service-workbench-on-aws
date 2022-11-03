(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [914],
  {
    3794: function (a, r, e) {
      'use strict';
      function t(a, r, e, t, n, i, o) {
        try {
          var c = a[i](o),
            s = c.value;
        } catch (l) {
          return void e(l);
        }
        c.done ? r(s) : Promise.resolve(s).then(t, n);
      }
      function n(a) {
        return function () {
          var r = this,
            e = arguments;
          return new Promise(function (n, i) {
            var o = a.apply(r, e);
            function c(a) {
              t(o, n, i, c, s, 'next', a);
            }
            function s(a) {
              t(o, n, i, c, s, 'throw', a);
            }
            c(void 0);
          });
        };
      }
      e.r(r),
        e.d(r, {
          default: function () {
            return q;
          }
        });
      var i = e(7213),
        o = e(2825),
        c = e.n(o),
        s = e(1387),
        l = e(4365),
        h = e(1355),
        _ = e(2426),
        u = e(352),
        d = e(2204),
        v = e(6027),
        f = e(5934),
        w = e(9519),
        m = e(677),
        x = e(6393),
        p = e(5202);
      function j(a, r) {
        var e = Object.keys(a);
        if (Object.getOwnPropertySymbols) {
          var t = Object.getOwnPropertySymbols(a);
          r &&
            (t = t.filter(function (r) {
              return Object.getOwnPropertyDescriptor(a, r).enumerable;
            })),
            e.push.apply(e, t);
        }
        return e;
      }
      function g(a) {
        for (var r = 1; r < arguments.length; r++) {
          var e = null != arguments[r] ? arguments[r] : {};
          r % 2
            ? j(Object(e), !0).forEach(function (r) {
                (0, i.Z)(a, r, e[r]);
              })
            : Object.getOwnPropertyDescriptors
            ? Object.defineProperties(a, Object.getOwnPropertyDescriptors(e))
            : j(Object(e)).forEach(function (r) {
                Object.defineProperty(a, r, Object.getOwnPropertyDescriptor(e, r));
              });
        }
        return a;
      }
      function y(a, r) {
        var e = ('undefined' !== typeof Symbol && a[Symbol.iterator]) || a['@@iterator'];
        if (!e) {
          if (
            Array.isArray(a) ||
            (e = (function (a, r) {
              if (!a) return;
              if ('string' === typeof a) return b(a, r);
              var e = Object.prototype.toString.call(a).slice(8, -1);
              'Object' === e && a.constructor && (e = a.constructor.name);
              if ('Map' === e || 'Set' === e) return Array.from(a);
              if ('Arguments' === e || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(e)) return b(a, r);
            })(a)) ||
            (r && a && 'number' === typeof a.length)
          ) {
            e && (a = e);
            var t = 0,
              n = function () {};
            return {
              s: n,
              n: function () {
                return t >= a.length ? { done: !0 } : { done: !1, value: a[t++] };
              },
              e: function (a) {
                throw a;
              },
              f: n
            };
          }
          throw new TypeError(
            'Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.'
          );
        }
        var i,
          o = !0,
          c = !1;
        return {
          s: function () {
            e = e.call(a);
          },
          n: function () {
            var a = e.next();
            return (o = a.done), a;
          },
          e: function (a) {
            (c = !0), (i = a);
          },
          f: function () {
            try {
              o || null == e.return || e.return();
            } finally {
              if (c) throw i;
            }
          }
        };
      }
      function b(a, r) {
        (null == r || r > a.length) && (r = a.length);
        for (var e = 0, t = new Array(r); e < r; e++) t[e] = a[e];
        return t;
      }
      var q = function () {
        var a = (0, m.useRouter)(),
          r = (0, x.useState)(!1),
          e = r[0],
          t = r[1],
          o = (0, x.useState)(!0),
          j = o[0],
          b = o[1],
          q = (0, x.useState)(''),
          N = q[0],
          z = q[1],
          Z = (0, x.useState)({ email: '' }),
          E = Z[0],
          O = Z[1],
          R = (0, x.useState)({}),
          T = R[0],
          C = R[1],
          S = [
            {
              field: 'email',
              condition: function (a) {
                return !!a && s.HN.test(a);
              },
              message: 'A valid email address is required.'
            },
            {
              field: 'email',
              condition: function (a) {
                return !!a && a.length <= 128;
              },
              message: 'Email cannot be longer than 128 characters'
            },
            {
              field: 'firstName',
              condition: function (a) {
                return !!a;
              },
              message: 'Given Name is Required'
            },
            {
              field: 'firstName',
              condition: function (a) {
                return !!a && a.length <= 128;
              },
              message: 'Given Name cannot be longer than 128 characters'
            },
            {
              field: 'firstName',
              condition: function (a) {
                return !!a && s.yJ.test(a);
              },
              message:
                'Given Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
            },
            {
              field: 'lastName',
              condition: function (a) {
                return !!a;
              },
              message: 'Family Name is Required'
            },
            {
              field: 'lastName',
              condition: function (a) {
                return !!a && a.length <= 128;
              },
              message: 'Family Name cannot be longer than 128 characters'
            },
            {
              field: 'lastName',
              condition: function (a) {
                return !!a && s.yJ.test(a);
              },
              message:
                'Family Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
            }
          ],
          k = function (a, r) {
            var e,
              t = y(
                S.filter(function (r) {
                  return r.field === a;
                })
              );
            try {
              var n = function () {
                var t = e.value;
                if (!t.condition(r))
                  return (
                    C(function (r) {
                      return g(g({}, r), {}, (0, i.Z)({}, ''.concat(a, 'Error'), t.message));
                    }),
                    { v: !1 }
                  );
              };
              for (t.s(); !(e = t.n()).done; ) {
                var o = n();
                if ('object' === typeof o) return o.v;
              }
            } catch (c) {
              t.e(c);
            } finally {
              t.f();
            }
            return (
              C(function (r) {
                return g(g({}, r), {}, (0, i.Z)({}, ''.concat(a, 'Error'), ''));
              }),
              !0
            );
          },
          P = (function () {
            var r = n(
              c().mark(function r() {
                return c().wrap(
                  function (r) {
                    for (;;)
                      switch ((r.prev = r.next)) {
                        case 0:
                          return t(!0), (r.prev = 1), (r.next = 4), (0, s.r4)(E);
                        case 4:
                          r.next = 9;
                          break;
                        case 6:
                          (r.prev = 6), (r.t0 = r.catch(1)), z('There was a problem creating user.');
                        case 9:
                          return (r.prev = 9), (r.next = 12), (0, s.tm)(E.email, 'Researcher');
                        case 12:
                          return (
                            (r.next = 14),
                            a.push({
                              pathname: '/users',
                              query: {
                                message: 'Researcher Created Successfully',
                                notificationType: 'success'
                              }
                            })
                          );
                        case 14:
                          r.next = 19;
                          break;
                        case 16:
                          (r.prev = 16),
                            (r.t1 = r.catch(9)),
                            z('There was a problem assigning user to Researcher role.');
                        case 19:
                          return (r.prev = 19), t(!1), r.finish(19);
                        case 22:
                        case 'end':
                          return r.stop();
                      }
                  },
                  r,
                  null,
                  [
                    [1, 6],
                    [9, 16, 19, 22]
                  ]
                );
              })
            );
            return function () {
              return r.apply(this, arguments);
            };
          })();
        (0, x.useEffect)(
          function () {
            b(
              !S.every(function (a) {
                return a.condition(E[a.field]);
              })
            );
          },
          [E]
        );
        return (0, p.jsx)(s.IE, {
          breadcrumbs: [
            { text: 'Service Workbench', href: '/' },
            { text: 'Users', href: '/users' },
            { text: 'Create Researcher', href: '/users/new' }
          ],
          activeHref: '/users',
          children: (0, p.jsx)(l.Z, {
            id: 'userContainer',
            children: (0, p.jsx)(h.Z, {
              children: (0, p.jsx)('form', {
                onSubmit: function (a) {
                  return a.preventDefault();
                },
                children: (0, p.jsx)(_.Z, {
                  id: 'createUser',
                  errorText: N,
                  actions: (0, p.jsxs)(u.Z, {
                    direction: 'horizontal',
                    size: 'xs',
                    children: [
                      (0, p.jsx)(d.Z, {
                        formAction: 'none',
                        variant: 'link',
                        href: '/users',
                        children: 'Cancel'
                      }),
                      (0, p.jsx)(d.Z, {
                        variant: 'primary',
                        disabled: j || e,
                        loading: e,
                        onClick: n(
                          c().mark(function a() {
                            return c().wrap(function (a) {
                              for (;;)
                                switch ((a.prev = a.next)) {
                                  case 0:
                                    return (a.next = 2), P();
                                  case 2:
                                    return a.abrupt('return', a.sent);
                                  case 3:
                                  case 'end':
                                    return a.stop();
                                }
                            }, a);
                          })
                        ),
                        children: 'Create Researcher'
                      })
                    ]
                  }),
                  header: (0, p.jsx)(v.Z, {
                    variant: 'h1',
                    description: 'Create a user assigned to the Researcher role',
                    children: 'Create Researcher'
                  }),
                  children: (0, p.jsxs)(u.Z, {
                    direction: 'vertical',
                    size: 'l',
                    children: [
                      (0, p.jsx)(f.Z, {
                        label: 'Email',
                        constraintText: (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)('li', { children: 'Must be a valid email address.' }),
                            (0, p.jsx)('li', { children: 'Cannot be longer than 128 characters.' })
                          ]
                        }),
                        errorText: null === T || void 0 === T ? void 0 : T.emailError,
                        children: (0, p.jsx)(w.Z, {
                          value: (null === E || void 0 === E ? void 0 : E.email) || '',
                          onChange: function (a) {
                            var r = a.detail.value;
                            O(g(g({}, E), {}, { email: r })), k('email', r);
                          }
                        })
                      }),
                      (0, p.jsx)(f.Z, {
                        label: 'Given Name',
                        constraintText: (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)('li', {
                              children:
                                'Given Name can only contain alphanumeric characters (case sensitive) and hyphens.'
                            }),
                            (0, p.jsx)('li', { children: 'It must start with an alphabetic character.' }),
                            (0, p.jsx)('li', { children: 'Cannot be longer than 128 characters.' })
                          ]
                        }),
                        errorText: null === T || void 0 === T ? void 0 : T.givenNameError,
                        children: (0, p.jsx)(w.Z, {
                          value: (null === E || void 0 === E ? void 0 : E.firstName) || '',
                          onChange: function (a) {
                            var r = a.detail.value;
                            O(g(g({}, E), {}, { firstName: r })), k('firstName', r);
                          }
                        })
                      }),
                      (0, p.jsx)(f.Z, {
                        label: 'Family Name',
                        constraintText: (0, p.jsxs)(p.Fragment, {
                          children: [
                            (0, p.jsx)('li', {
                              children:
                                'Family Name can only contain alphanumeric characters (case sensitive) and hyphens.'
                            }),
                            (0, p.jsx)('li', { children: 'It must start with an alphabetic character.' }),
                            (0, p.jsx)('li', { children: 'Cannot be longer than 128 characters.' })
                          ]
                        }),
                        errorText: null === T || void 0 === T ? void 0 : T.givenNameError,
                        children: (0, p.jsx)(w.Z, {
                          value: (null === E || void 0 === E ? void 0 : E.lastName) || '',
                          onChange: function (a) {
                            var r = a.detail.value;
                            O(g(g({}, E), {}, { lastName: r })), k('lastName', r);
                          }
                        })
                      })
                    ]
                  })
                })
              })
            })
          })
        });
      };
    },
    6027: function (a, r, e) {
      'use strict';
      e.d(r, {
        Z: function () {
          return s;
        }
      });
      var t = e(5418),
        n = e(6393),
        i = e(5971),
        o = e(8018),
        c = e(2949);
      function s(a) {
        var r = a.variant,
          e = void 0 === r ? 'h2' : r,
          i = (0, t._T)(a, ['variant']),
          s = (0, c.Z)('Header');
        return n.createElement(o.Z, (0, t.pi)({ variant: e }, i, s));
      }
      (0, i.b)(s, 'Header');
    },
    8018: function (a, r, e) {
      'use strict';
      e.d(r, {
        Z: function () {
          return _;
        }
      });
      var t = e(5418),
        n = e(4722),
        i = e(2096),
        o = e(6393),
        c = e(8824),
        s = e(580),
        l = e(3902),
        h =
          (e(3357),
          {
            root: 'awsui_root_2qdw9_cj9ra_93',
            'root-no-actions': 'awsui_root-no-actions_2qdw9_cj9ra_108',
            'root-variant-h1': 'awsui_root-variant-h1_2qdw9_cj9ra_108',
            'root-variant-h1-refresh': 'awsui_root-variant-h1-refresh_2qdw9_cj9ra_111',
            'root-variant-h2': 'awsui_root-variant-h2_2qdw9_cj9ra_114',
            'root-has-description': 'awsui_root-has-description_2qdw9_cj9ra_114',
            'root-variant-h2-refresh': 'awsui_root-variant-h2-refresh_2qdw9_cj9ra_117',
            'root-variant-h3': 'awsui_root-variant-h3_2qdw9_cj9ra_120',
            'root-variant-h3-refresh': 'awsui_root-variant-h3-refresh_2qdw9_cj9ra_123',
            'root-no-wrap': 'awsui_root-no-wrap_2qdw9_cj9ra_126',
            main: 'awsui_main_2qdw9_cj9ra_130',
            'main-variant-h1': 'awsui_main-variant-h1_2qdw9_cj9ra_138',
            'main-variant-h1-refresh': 'awsui_main-variant-h1-refresh_2qdw9_cj9ra_141',
            'main-variant-h2': 'awsui_main-variant-h2_2qdw9_cj9ra_147',
            'main-variant-h3': 'awsui_main-variant-h3_2qdw9_cj9ra_147',
            'main-variant-h2-refresh': 'awsui_main-variant-h2-refresh_2qdw9_cj9ra_153',
            actions: 'awsui_actions_2qdw9_cj9ra_160',
            'actions-variant-h1': 'awsui_actions-variant-h1_2qdw9_cj9ra_164',
            'actions-variant-h1-refresh': 'awsui_actions-variant-h1-refresh_2qdw9_cj9ra_167',
            'actions-variant-h2': 'awsui_actions-variant-h2_2qdw9_cj9ra_170',
            'actions-variant-h3': 'awsui_actions-variant-h3_2qdw9_cj9ra_170',
            'actions-variant-h2-refresh': 'awsui_actions-variant-h2-refresh_2qdw9_cj9ra_176',
            'actions-variant-h3-refresh': 'awsui_actions-variant-h3-refresh_2qdw9_cj9ra_179',
            title: 'awsui_title_2qdw9_cj9ra_183',
            'title-variant-h2': 'awsui_title-variant-h2_2qdw9_cj9ra_189',
            'title-variant-h3': 'awsui_title-variant-h3_2qdw9_cj9ra_189',
            'title-variant-h2-refresh': 'awsui_title-variant-h2-refresh_2qdw9_cj9ra_198',
            info: 'awsui_info_2qdw9_cj9ra_208',
            description: 'awsui_description_2qdw9_cj9ra_212',
            'description-variant-h1': 'awsui_description-variant-h1_2qdw9_cj9ra_217',
            'description-variant-h1-refresh': 'awsui_description-variant-h1-refresh_2qdw9_cj9ra_222',
            'description-variant-h2': 'awsui_description-variant-h2_2qdw9_cj9ra_225',
            'description-variant-h3': 'awsui_description-variant-h3_2qdw9_cj9ra_230',
            'description-variant-h3-refresh': 'awsui_description-variant-h3-refresh_2qdw9_cj9ra_236',
            heading: 'awsui_heading_2qdw9_cj9ra_240',
            'heading-variant-h1': 'awsui_heading-variant-h1_2qdw9_cj9ra_249',
            'heading-variant-h2': 'awsui_heading-variant-h2_2qdw9_cj9ra_255',
            'heading-variant-h3': 'awsui_heading-variant-h3_2qdw9_cj9ra_258',
            'heading-text': 'awsui_heading-text_2qdw9_cj9ra_262',
            counter: 'awsui_counter_2qdw9_cj9ra_266'
          });
      function _(a) {
        var r = a.variant,
          e = a.headingTagOverride,
          _ = a.children,
          u = a.actions,
          d = a.counter,
          v = a.description,
          f = a.info,
          w = a.__internalRootRef,
          m = void 0 === w ? null : w,
          x = a.__disableActionsWrapping,
          p = (0, t._T)(a, [
            'variant',
            'headingTagOverride',
            'children',
            'actions',
            'counter',
            'description',
            'info',
            '__internalRootRef',
            '__disableActionsWrapping'
          ]),
          j = null !== e && void 0 !== e ? e : 'awsui-h1-sticky' === r ? 'h1' : r,
          g = (0, o.useContext)(s.d5).isStuck,
          y = (0, c.j)(p),
          b = (0, o.useRef)(null),
          q = (0, l.LV)(b),
          N = 'awsui-h1-sticky' === r ? (q ? (g ? 'h2' : 'h1') : 'h2') : r,
          z = (0, i.q)(b, m);
        return o.createElement(
          'div',
          (0, t.pi)({}, y, {
            className: (0, n.Z)(
              h.root,
              y.className,
              h['root-variant-'.concat(N)],
              q && h['root-variant-'.concat(N, '-refresh')],
              !u && [h['root-no-actions']],
              v && [h['root-has-description']],
              x && [h['root-no-wrap']]
            ),
            ref: z
          }),
          o.createElement(
            'div',
            {
              className: (0, n.Z)(
                h.main,
                h['main-variant-'.concat(N)],
                q && h['main-variant-'.concat(N, '-refresh')]
              )
            },
            o.createElement(
              'div',
              {
                className: (0, n.Z)(
                  h.title,
                  h['title-variant-'.concat(N)],
                  q && h['title-variant-'.concat(N, '-refresh')]
                )
              },
              o.createElement(
                j,
                { className: (0, n.Z)(h.heading, h['heading-variant-'.concat(N)]) },
                o.createElement('span', { className: h['heading-text'] }, _),
                void 0 !== d && o.createElement('span', { className: h.counter }, ' ', d)
              ),
              f && o.createElement('span', { className: h.info }, f)
            ),
            v &&
              o.createElement(
                'p',
                {
                  className: (0, n.Z)(
                    h.description,
                    h['description-variant-'.concat(N)],
                    q && h['description-variant-'.concat(N, '-refresh')]
                  )
                },
                v
              )
          ),
          u &&
            o.createElement(
              'div',
              {
                className: (0, n.Z)(
                  h.actions,
                  h['actions-variant-'.concat(N)],
                  q && h['actions-variant-'.concat(N, '-refresh')]
                )
              },
              u
            )
        );
      }
    },
    9773: function (a, r, e) {
      'use strict';
      e.d(r, {
        M: function () {
          return t;
        }
      });
      var t = function () {
        for (var a = [], r = 0; r < arguments.length; r++) a[r] = arguments[r];
        var e = a
          .filter(function (a) {
            return a;
          })
          .join(' ');
        return e || void 0;
      };
    },
    352: function (a, r, e) {
      'use strict';
      e.d(r, {
        Z: function () {
          return s;
        }
      });
      var t = e(5418),
        n = e(6393),
        i = e(5971),
        o = e(2941),
        c = e(2949);
      function s(a) {
        var r = a.direction,
          e = void 0 === r ? 'vertical' : r,
          i = (0, t._T)(a, ['direction']),
          s = (0, c.Z)('SpaceBetween');
        return n.createElement(o.Z, (0, t.pi)({ direction: e }, i, s));
      }
      (0, i.b)(s, 'SpaceBetween');
    },
    2941: function (a, r, e) {
      'use strict';
      e.d(r, {
        Z: function () {
          return l;
        }
      });
      var t = e(5418),
        n = e(4722),
        i = e(6393),
        o = e(8824),
        c =
          (e(6252),
          {
            root: 'awsui_root_18582_66aol_93',
            child: 'awsui_child_18582_66aol_97',
            horizontal: 'awsui_horizontal_18582_66aol_108',
            'horizontal-xxxs': 'awsui_horizontal-xxxs_18582_66aol_112',
            'horizontal-xxs': 'awsui_horizontal-xxs_18582_66aol_116',
            'horizontal-xs': 'awsui_horizontal-xs_18582_66aol_120',
            'horizontal-s': 'awsui_horizontal-s_18582_66aol_124',
            'horizontal-m': 'awsui_horizontal-m_18582_66aol_128',
            'horizontal-l': 'awsui_horizontal-l_18582_66aol_132',
            'horizontal-xl': 'awsui_horizontal-xl_18582_66aol_136',
            'horizontal-xxl': 'awsui_horizontal-xxl_18582_66aol_140',
            'child-horizontal-xxxs': 'awsui_child-horizontal-xxxs_18582_66aol_145',
            'child-horizontal-xxs': 'awsui_child-horizontal-xxs_18582_66aol_151',
            'child-horizontal-xs': 'awsui_child-horizontal-xs_18582_66aol_157',
            'child-horizontal-s': 'awsui_child-horizontal-s_18582_66aol_163',
            'child-horizontal-m': 'awsui_child-horizontal-m_18582_66aol_169',
            'child-horizontal-l': 'awsui_child-horizontal-l_18582_66aol_175',
            'child-horizontal-xl': 'awsui_child-horizontal-xl_18582_66aol_181',
            'child-horizontal-xxl': 'awsui_child-horizontal-xxl_18582_66aol_187',
            vertical: 'awsui_vertical_18582_66aol_196',
            'child-vertical-xxxs': 'awsui_child-vertical-xxxs_18582_66aol_200',
            'child-vertical-xxs': 'awsui_child-vertical-xxs_18582_66aol_204',
            'child-vertical-xs': 'awsui_child-vertical-xs_18582_66aol_208',
            'child-vertical-s': 'awsui_child-vertical-s_18582_66aol_212',
            'child-vertical-m': 'awsui_child-vertical-m_18582_66aol_216',
            'child-vertical-l': 'awsui_child-vertical-l_18582_66aol_220',
            'child-vertical-xl': 'awsui_child-vertical-xl_18582_66aol_224',
            'child-vertical-xxl': 'awsui_child-vertical-xxl_18582_66aol_228'
          }),
        s = e(2316);
      function l(a) {
        var r = a.direction,
          e = void 0 === r ? 'vertical' : r,
          l = a.size,
          h = a.children,
          _ = a.__internalRootRef,
          u = (0, t._T)(a, ['direction', 'size', 'children', '__internalRootRef']),
          d = (0, o.j)(u),
          v = (0, s.Z)(h);
        return i.createElement(
          'div',
          (0, t.pi)({}, d, {
            className: (0, n.Z)(d.className, c.root, c[e], c[''.concat(e, '-').concat(l)]),
            ref: _
          }),
          v.map(function (a) {
            var r = a.key;
            return i.createElement(
              'div',
              { key: r, className: (0, n.Z)(c.child, c['child-'.concat(e, '-').concat(l)]) },
              a
            );
          })
        );
      }
    },
    9486: function (a, r, e) {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        '/users/new',
        function () {
          return e(3794);
        }
      ]);
    },
    3357: function () {},
    6252: function () {}
  },
  function (a) {
    a.O(0, [952, 774, 888, 179], function () {
      return (r = 9486), a((a.s = r));
      var r;
    });
    var r = a.O();
    _N_E = r;
  }
]);
