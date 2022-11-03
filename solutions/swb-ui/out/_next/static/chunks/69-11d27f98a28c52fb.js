'use strict';
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [69],
  {
    9371: function (e, t, n) {
      n.d(t, {
        Hg: function () {
          return m;
        },
        fG: function () {
          return i;
        }
      });
      var r = n(1387),
        a = n(7016),
        i = function () {
          var e = (0, a.ZP)(function () {
            return 'datasets';
          }, r.zl);
          return { datasets: e.data || [], areDatasetsLoading: e.isValidating };
        },
        o = [
          {
            id: 'datasetName',
            header: 'Dataset name',
            cell: function (e) {
              return e.name;
            },
            sortingField: 'name'
          },
          {
            id: 'category',
            header: 'Category',
            cell: function () {
              return 'Internal';
            },
            sortingField: 'category'
          },
          {
            id: 'description',
            header: 'Description',
            cell: function () {
              return 'Sample description of this dataset';
            },
            sortingField: 'description'
          }
        ],
        c = n(912),
        s = n(1355),
        l = n(9867),
        u = n(6027),
        d = n(352),
        p = n(677),
        f = n(6393),
        m = function () {
          var e = i(),
            t = e.datasets,
            n = e.areDatasetsLoading,
            a = (0, p.useRouter)().query,
            m = a.message,
            v = a.notificationType,
            g = (0, r.zn)(),
            h = g.displayNotification,
            y = g.closeNotification,
            E = (0, f.useState)(!1),
            b = E[0],
            S = E[1];
          if (m && v && !b) {
            var T = 'DatasetMessage';
            h(T, {
              type: v,
              dismissible: !0,
              dismissLabel: 'Dismiss message',
              onDismiss: function () {
                y(T);
              },
              content: m,
              id: T
            }),
              S(!0);
          }
          var w = (0, c.K)(t, {}).items;
          return f.createElement(
            r.IE,
            {
              breadcrumbs: [
                { text: 'Service Workbench', href: '/' },
                { text: 'Datasets', href: '/datasets' }
              ],
              activeHref: '/datasets'
            },
            f.createElement(
              s.Z,
              null,
              f.createElement(l.Z, {
                loading: n,
                selectionType: 'multi',
                header: f.createElement(
                  f.Fragment,
                  null,
                  f.createElement(
                    u.Z,
                    {
                      actions: f.createElement(
                        s.Z,
                        { float: 'right' },
                        f.createElement(d.Z, { direction: 'horizontal', size: 'xs' })
                      )
                    },
                    'Datasets'
                  )
                ),
                columnDefinitions: o,
                loadingText: 'Loading datasets',
                items: w
              })
            )
          );
        };
    },
    2069: function (e, t, n) {
      n.d(t, {
        L: function () {
          return A;
        },
        R: function () {
          return ee;
        }
      });
      var r = n(1387),
        a = n(912),
        i = n(1355),
        o = n(8070),
        c = n(9867),
        s = n(6027),
        l = n(352),
        u = n(2204),
        d = n(3942),
        p = n(8414),
        f = n(3783),
        m = n(539),
        v = n(677),
        g = n(6393),
        h = n(7016),
        y = function () {
          return (
            (y =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var a in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
                return e;
              }),
            y.apply(this, arguments)
          );
        },
        E = function (e, t, n, r) {
          return new (n || (n = Promise))(function (a, i) {
            function o(e) {
              try {
                s(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
              try {
                s(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
              var t;
              e.done
                ? a(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(o, c);
            }
            s((r = r.apply(e, t || [])).next());
          });
        },
        b = function (e, t) {
          var n,
            r,
            a,
            i,
            o = {
              label: 0,
              sent: function () {
                if (1 & a[0]) throw a[1];
                return a[1];
              },
              trys: [],
              ops: []
            };
          return (
            (i = { next: c(0), throw: c(1), return: c(2) }),
            'function' === typeof Symbol &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function c(i) {
            return function (c) {
              return (function (i) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; o; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (a =
                          2 & i[0]
                            ? r.return
                            : i[0]
                            ? r.throw || ((a = r.return) && a.call(r), 0)
                            : r.next) &&
                        !(a = a.call(r, i[1])).done)
                    )
                      return a;
                    switch (((r = 0), a && (i = [2 & i[0], a.value]), i[0])) {
                      case 0:
                      case 1:
                        a = i;
                        break;
                      case 4:
                        return o.label++, { value: i[1], done: !1 };
                      case 5:
                        o.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = o.ops.pop()), o.trys.pop();
                        continue;
                      default:
                        if (!(a = (a = o.trys).length > 0 && a[a.length - 1]) && (6 === i[0] || 2 === i[0])) {
                          o = 0;
                          continue;
                        }
                        if (3 === i[0] && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                          o.label = i[1];
                          break;
                        }
                        if (6 === i[0] && o.label < a[1]) {
                          (o.label = a[1]), (a = i);
                          break;
                        }
                        if (a && o.label < a[2]) {
                          (o.label = a[2]), o.ops.push(i);
                          break;
                        }
                        a[2] && o.ops.pop(), o.trys.pop();
                        continue;
                    }
                    i = t.call(e, o);
                  } catch (c) {
                    (i = [6, c]), (r = 0);
                  } finally {
                    n = a = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, c]);
            };
          }
        },
        S = function (e) {
          return E(void 0, void 0, void 0, function () {
            return b(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, (0, r.CY)('environments/'.concat(e, '/start'), {})];
                case 1:
                  return t.sent(), [2];
              }
            });
          });
        },
        T = function (e) {
          return E(void 0, void 0, void 0, function () {
            return b(this, function (t) {
              switch (t.label) {
                case 0:
                  return [4, (0, r.CY)('environments/'.concat(e, '/stop'), {})];
                case 1:
                  return t.sent(), [2];
              }
            });
          });
        },
        w = function (e) {
          return E(void 0, void 0, void 0, function () {
            return b(this, function (t) {
              return [2, (0, r.zl)('environments/'.concat(e, '/connections'), {})];
            });
          });
        },
        k = n(9087),
        C = n(8014);
      function I(e) {
        var t = (0, r.zn)(),
          n = t.displayNotification,
          a = t.closeNotification,
          o = function (t) {
            if (t.type && 'link' === t.type)
              return (
                (r = t),
                g.createElement(k.Z, { href: e.authCredResponse[r.hrefKey], target: '_blank' }, r.text)
              );
            var r;
            console.error('Could not find UI Element for placeholder', t);
            var i = 'EnvironmentConnectModalError';
            return (
              n(i, {
                type: 'error',
                dismissible: !0,
                dismissLabel: 'Dismiss message',
                onDismiss: function () {
                  return a(i);
                },
                content: 'Failed to get connection information'
              }),
              g.createElement(g.Fragment, null)
            );
          },
          c = function (e) {
            var t = e.match(/(\#{.*?})/g);
            if (!t) return g.createElement(g.Fragment, null, e);
            var n = t[0],
              r = e.slice(0, e.indexOf(n)),
              a = e.slice(e.indexOf(n) + n.length);
            return g.createElement(
              i.Z,
              { variant: 'span' },
              r,
              o(JSON.parse(n.replaceAll('#{', '{').replaceAll('\\"', '"'))),
              c(a)
            );
          };
        return g.createElement(
          C.Z,
          {
            visible: !0,
            closeAriaLabel: 'Close',
            onDismiss: function () {
              e.closeModal();
            },
            header: 'Connect to Workspace',
            footer: g.createElement(
              i.Z,
              { float: 'right' },
              g.createElement(
                u.Z,
                {
                  'data-testid': 'environmentConnectClose',
                  variant: 'primary',
                  onClick: function () {
                    e.closeModal();
                  }
                },
                'Close'
              )
            )
          },
          g.createElement(
            l.Z,
            { direction: 'vertical', size: 'xs' },
            g.createElement(
              i.Z,
              null,
              g.createElement(
                l.Z,
                { direction: 'vertical', size: 'xxs' },
                g.createElement(i.Z, { variant: 'div', fontWeight: 'bold' }, 'Instructions'),
                ' ',
                c(e.instructions)
              )
            )
          )
        );
      }
      var P = [
          {
            id: 'workspaceName',
            header: 'Workspace name',
            cell: function (e) {
              return g.createElement('div', { 'data-testid': e.workspaceName }, e.workspaceName);
            },
            sortingField: 'name'
          },
          {
            id: 'workspaceStatus',
            header: 'Workspace status',
            cell: function (e) {
              return e.workspaceStatus;
            },
            sortingField: 'status'
          },
          {
            id: 'createdAt',
            header: 'Created at',
            cell: function (e) {
              return new Date(e.createdAt).toLocaleString();
            },
            sortingField: 'createdAt'
          },
          {
            id: 'project',
            header: 'Project',
            cell: function (e) {
              return e.project;
            },
            sortingField: 'project'
          },
          {
            id: 'owner',
            header: 'Owner',
            cell: function (e) {
              return e.owner;
            },
            sortingField: 'owner'
          }
        ],
        Z = ['workspaceName', 'workspaceStatus', 'createdAt', 'project', 'owner'],
        x = [
          { propertyKey: 'owner', value: '' },
          { propertyKey: 'project', value: '' },
          { propertyKey: 'workspaceName', value: '' },
          { propertyKey: 'workspaceStatus', value: 'AVAILABLE' },
          { propertyKey: 'workspaceStatus', value: 'FAILED' },
          { propertyKey: 'workspaceStatus', value: 'PENDING' },
          { propertyKey: 'workspaceStatus', value: 'STARTING' },
          { propertyKey: 'workspaceStatus', value: 'STOPPED' },
          { propertyKey: 'workspaceStatus', value: 'STOPPING' },
          { propertyKey: 'workspaceStatus', value: 'TERMINATED' },
          { propertyKey: 'workspaceStatus', value: 'TERMINATING' }
        ],
        L = [
          {
            key: 'workspaceName',
            operators: ['=', '!=', ':', '!:'],
            propertyLabel: 'Workspace Name',
            groupValuesLabel: 'Workspace Name Values'
          },
          {
            key: 'workspaceStatus',
            operators: ['=', '!='],
            propertyLabel: 'Workspace Status',
            groupValuesLabel: 'Workspace Status Values'
          },
          {
            key: 'project',
            operators: ['=', '!=', ':', '!:'],
            propertyLabel: 'Project',
            groupValuesLabel: 'Project Values'
          },
          {
            key: 'owner',
            operators: ['=', '!=', ':', '!:'],
            propertyLabel: 'Owner',
            groupValuesLabel: 'Owner Values'
          }
        ],
        N = function () {
          return (
            (N =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var a in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
                return e;
              }),
            N.apply(this, arguments)
          );
        },
        O = function (e, t, n, r) {
          return new (n || (n = Promise))(function (a, i) {
            function o(e) {
              try {
                s(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
              try {
                s(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
              var t;
              e.done
                ? a(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(o, c);
            }
            s((r = r.apply(e, t || [])).next());
          });
        },
        D = function (e, t) {
          var n,
            r,
            a,
            i,
            o = {
              label: 0,
              sent: function () {
                if (1 & a[0]) throw a[1];
                return a[1];
              },
              trys: [],
              ops: []
            };
          return (
            (i = { next: c(0), throw: c(1), return: c(2) }),
            'function' === typeof Symbol &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function c(i) {
            return function (c) {
              return (function (i) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; o; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (a =
                          2 & i[0]
                            ? r.return
                            : i[0]
                            ? r.throw || ((a = r.return) && a.call(r), 0)
                            : r.next) &&
                        !(a = a.call(r, i[1])).done)
                    )
                      return a;
                    switch (((r = 0), a && (i = [2 & i[0], a.value]), i[0])) {
                      case 0:
                      case 1:
                        a = i;
                        break;
                      case 4:
                        return o.label++, { value: i[1], done: !1 };
                      case 5:
                        o.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = o.ops.pop()), o.trys.pop();
                        continue;
                      default:
                        if (!(a = (a = o.trys).length > 0 && a[a.length - 1]) && (6 === i[0] || 2 === i[0])) {
                          o = 0;
                          continue;
                        }
                        if (3 === i[0] && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                          o.label = i[1];
                          break;
                        }
                        if (6 === i[0] && o.label < a[1]) {
                          (o.label = a[1]), (a = i);
                          break;
                        }
                        if (a && o.label < a[2]) {
                          (o.label = a[2]), o.ops.push(i);
                          break;
                        }
                        a[2] && o.ops.pop(), o.trys.pop();
                        continue;
                    }
                    i = t.call(e, o);
                  } catch (c) {
                    (i = [6, c]), (r = 0);
                  } finally {
                    n = a = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, c]);
            };
          }
        },
        A = function () {
          var e,
            t = 'workspace',
            n = [
              { label: '20', value: 20 },
              { label: '30', value: 30 },
              { label: '50', value: 50 }
            ],
            y = (0, g.useState)({
              paginationToken: '',
              pageSize: null === (e = n[0]) || void 0 === e ? void 0 : e.value,
              descending: 'createdAt',
              currentPageIndex: 1,
              paginationTokens: new Map().set(1, ''),
              hasOpenEndPagination: !0,
              pageCount: 1
            }),
            k = y[0],
            C = y[1],
            A = (function (e) {
              var t,
                n = new URLSearchParams((0, r.MC)(e)).toString();
              n = n ? '?'.concat(n) : '';
              var a = (0, h.ZP)('environments'.concat(n), r.zl, { refreshInterval: 2e4 }),
                i = a.data,
                o = a.mutate,
                c = a.isValidating,
                s = null !== (t = null === i || void 0 === i ? void 0 : i.data) && void 0 !== t ? t : [];
              return (
                s.forEach(function (e) {
                  (e.workspaceName = e.name), (e.workspaceStatus = e.status), (e.project = e.projectId);
                }),
                {
                  environments: s,
                  mutate: o,
                  paginationToken: i && i.paginationToken,
                  areEnvironmentsLoading: c
                }
              );
            })({
              ascending: k.ascending,
              createdAtFrom: k.createdAtFrom,
              createdAtTo: k.createdAtTo,
              descending: k.descending,
              pageSize: k.pageSize,
              paginationToken: k.paginationToken
            }),
            j = A.environments,
            z = A.mutate,
            R = A.paginationToken,
            W = A.areEnvironmentsLoading,
            F = (0, g.useState)(''),
            M = F[0],
            V = F[1],
            K = (0, v.useRouter)().query,
            G = K.message,
            q = K.notificationType,
            _ = (0, r.zn)(),
            B = _.displayNotification,
            H = _.closeNotification,
            Y = (0, g.useState)(!1),
            J = Y[0],
            U = Y[1];
          if (G && q && !J) {
            var Q = 'EnvironmentMessage';
            B(Q, {
              type: q,
              dismissible: !0,
              dismissLabel: 'Dismiss message',
              onDismiss: function () {
                H(Q);
              },
              content: G,
              id: Q
            }),
              U(!0);
          }
          var X = g.useState(null),
            $ = X[0],
            ee = X[1],
            te = (0, a.K)(j, {
              filtering: {
                empty: (0, r._7)(t),
                noMatch: (0, r.fV)(t),
                filteringFunction: function (e, t) {
                  var n = t.toLowerCase();
                  return Z.map(function (t) {
                    return e[t];
                  }).some(function (e) {
                    return 'string' === typeof e && e.toLowerCase().indexOf(n) > -1;
                  });
                }
              },
              propertyFiltering: { filteringProperties: L, empty: (0, r._7)(t), noMatch: (0, r.fV)(t) },
              sorting: {},
              selection: {}
            }),
            ne = te.items,
            re = te.filteredItemsCount,
            ae = te.collectionProps,
            ie = te.propertyFilterProps,
            oe = ['AVAILABLE', 'STARTED', 'COMPLETED'],
            ce = ['STOPPED'],
            se = ['AVAILABLE', 'STARTED', 'COMPLETED'],
            le = ['FAILED', 'STOPPED'],
            ue = ['STOPPING'],
            de = ['TERMINATING'],
            pe = ['STARTING'],
            fe = (0, g.useState)(new Set()),
            me = fe[0],
            ve = fe[1],
            ge = (0, g.useState)(new Set()),
            he = ge[0],
            ye = ge[1],
            Ee = (0, g.useState)(new Set()),
            be = Ee[0],
            Se = Ee[1],
            Te = (0, g.useState)(!1),
            we = Te[0],
            ke = Te[1],
            Ce = (0, g.useState)(!1),
            Ie = Ce[0],
            Pe = Ce[1],
            Ze = (0, g.useState)({ instructionResponse: '', authCredResponse: {} }),
            xe = Ze[0],
            Le = Ze[1],
            Ne = function () {
              return ae.selectedItems && 1 === ae.selectedItems.length;
            },
            Oe = function () {
              return void 0 !== ae.selectedItems && Ne() && ae.selectedItems
                ? ae.selectedItems[0].workspaceStatus
                : '';
            },
            De = function () {
              return Ne() && ae.selectedItems ? ae.selectedItems[0].id : '';
            },
            Ae = function (e) {
              return O(void 0, void 0, void 0, function () {
                var t, n, a, i;
                return D(this, function (o) {
                  switch (o.label) {
                    case 0:
                      if (((t = 'Retrieve Workspaces Data'), !Ne())) return [3, 14];
                      (n = ae.selectedItems ? ae.selectedItems[0].id : ''), (o.label = 1);
                    case 1:
                      switch ((o.trys.push([1, 12, 13, 14]), V(''), e)) {
                        case 'TERMINATE':
                          return [3, 2];
                        case 'STOP':
                          return [3, 4];
                        case 'START':
                          return [3, 6];
                        case 'CONNECT':
                          return [3, 8];
                      }
                      return [3, 10];
                    case 2:
                      return (
                        ve(function (e) {
                          return new Set(e.add(n));
                        }),
                        (t = 'Terminate Workspace'),
                        [
                          4,
                          ((c = n),
                          E(void 0, void 0, void 0, function () {
                            return b(this, function (e) {
                              switch (e.label) {
                                case 0:
                                  return [4, (0, r.CY)('environments/'.concat(c, '/terminate'), {})];
                                case 1:
                                  return e.sent(), [2];
                              }
                            });
                          }))
                        ]
                      );
                    case 3:
                      return o.sent(), [3, 10];
                    case 4:
                      return (
                        ye(function (e) {
                          return new Set(e.add(n));
                        }),
                        (t = 'Stop Workspace'),
                        [4, T(n)]
                      );
                    case 5:
                      return o.sent(), [3, 10];
                    case 6:
                      return (
                        Se(function (e) {
                          return new Set(e.add(n));
                        }),
                        (t = 'Start Workspace'),
                        [4, S(n)]
                      );
                    case 7:
                      return o.sent(), [3, 10];
                    case 8:
                      return (a = ae.selectedItems ? ae.selectedItems[0].id : ''), Pe(!0), [4, w(a)];
                    case 9:
                      return (i = o.sent()), Le(i), Pe(!1), (t = 'Connect to Workspace'), ke(!0), [3, 10];
                    case 10:
                      return [4, z()];
                    case 11:
                      return o.sent(), [3, 14];
                    case 12:
                      return o.sent(), V('There was a problem trying to '.concat(t, '.')), [3, 14];
                    case 13:
                      return (
                        ve(function (e) {
                          return e.delete(n), new Set(e);
                        }),
                        ye(function (e) {
                          return e.delete(n), new Set(e);
                        }),
                        Se(function (e) {
                          return e.delete(n), new Set(e);
                        }),
                        [7]
                      );
                    case 14:
                      return [2];
                  }
                  var c;
                });
              });
            };
          (0, g.useEffect)(
            function () {
              C(function (e) {
                return N(N({}, e), { paginationTokens: e.paginationTokens.set(e.currentPageIndex + 1, R) });
              });
            },
            [R]
          );
          return g.createElement(
            r.IE,
            {
              breadcrumbs: [
                { text: 'Service Workbench', href: '/' },
                { text: 'Workspaces', href: '/environments' }
              ],
              activeHref: '/environments'
            },
            g.createElement(
              i.Z,
              null,
              we &&
                g.createElement(I, {
                  closeModal: function () {
                    ke(!1);
                  },
                  instructions: xe.instructionResponse,
                  authCredResponse: xe.authCredResponse
                }),
              !!M && g.createElement(o.Z, { type: 'error' }, M),
              g.createElement(
                c.Z,
                N({ 'data-testid': 'environmentTable' }, ae, {
                  sortingDescending: !!k.descending,
                  sortingColumn: { sortingField: k.descending || k.ascending },
                  onSortingChange: function (e) {
                    return (
                      (t = e.detail.isDescending),
                      (n = e.detail.sortingColumn.sortingField),
                      ee(null),
                      void C(function (e) {
                        return N(N({}, e), {
                          ascending: t ? void 0 : n,
                          descending: t ? n : void 0,
                          paginationToken: void 0,
                          createdAtFrom: void 0,
                          createdAtTo: void 0,
                          currentPageIndex: 1,
                          paginationTokens: new Map().set(1, ''),
                          hasOpenEndPagination: !0,
                          pageCount: 1
                        });
                      })
                    );
                    var t, n;
                  },
                  loading: W,
                  selectionType: 'multi',
                  selectedItems: ae.selectedItems,
                  ariaLabels: {
                    selectionGroupLabel: 'Items selection',
                    allItemsSelectionLabel: function (e) {
                      var t = e.selectedItems;
                      return ''.concat(t.length, ' ').concat(1 === t.length ? 'item' : 'items', ' selected');
                    },
                    itemSelectionLabel: function (e, t) {
                      var n = e.selectedItems.filter(function (e) {
                        return e.workspace === t.workspace;
                      }).length;
                      return ''.concat(t.workspace, ' is ').concat(n ? '' : 'not', ' selected');
                    }
                  },
                  header: g.createElement(
                    g.Fragment,
                    null,
                    g.createElement(
                      s.Z,
                      {
                        'data-testid': 'environmentListHeader',
                        actions: g.createElement(
                          i.Z,
                          { float: 'right' },
                          g.createElement(
                            l.Z,
                            { direction: 'horizontal', size: 'xs' },
                            g.createElement(
                              u.Z,
                              {
                                'data-testid': 'environmentConnect',
                                disabled:
                                  !oe.includes(Oe()) || (ae.selectedItems && ae.selectedItems.length > 1),
                                loading: Ie,
                                onClick: function () {
                                  return Ae('CONNECT');
                                }
                              },
                              'Connect'
                            ),
                            g.createElement(
                              u.Z,
                              {
                                'data-testid': 'environmentStart',
                                disabled: !ce.includes(Oe()) || be.has(De()),
                                loading: pe.includes(Oe()) || be.has(De()),
                                onClick: function () {
                                  return Ae('START');
                                }
                              },
                              'Start'
                            ),
                            g.createElement(
                              u.Z,
                              {
                                'data-testid': 'environmentStop',
                                disabled: !se.includes(Oe()) || he.has(De()),
                                loading: ue.includes(Oe()) || he.has(De()),
                                onClick: function () {
                                  return Ae('STOP');
                                }
                              },
                              'Stop'
                            ),
                            g.createElement(
                              u.Z,
                              {
                                'data-testid': 'environmentTerminate',
                                disabled: !le.includes(Oe()) || me.has(De()),
                                loading: de.includes(Oe()) || me.has(De()),
                                onClick: function () {
                                  return Ae('TERMINATE');
                                }
                              },
                              'Terminate'
                            ),
                            g.createElement(
                              u.Z,
                              {
                                'data-testid': 'environmentCreate',
                                variant: 'primary',
                                href: '/environments/new'
                              },
                              'Create Workspace'
                            )
                          )
                        )
                      },
                      'Workspaces'
                    )
                  ),
                  columnDefinitions: P,
                  loadingText: 'Loading workspaces',
                  filter: g.createElement(
                    l.Z,
                    { direction: 'vertical', size: 'xs' },
                    g.createElement(
                      d.Z,
                      N({}, ie, {
                        countText: (0, r.th)(re),
                        i18nStrings: r.q9,
                        filteringOptions: x,
                        expandToViewport: !0
                      })
                    ),
                    g.createElement(p.Z, {
                      onChange: function (e) {
                        return (function (e) {
                          var t = void 0,
                            n = void 0;
                          if ((ee(e), e)) {
                            var a = (0, r.Ms)(e);
                            (t = a.start), (n = a.end);
                          }
                          C(function (e) {
                            return N(N({}, e), {
                              ascending: void 0,
                              descending: void 0,
                              paginationToken: void 0,
                              createdAtFrom: null === t || void 0 === t ? void 0 : t.toISOString(),
                              createdAtTo: null === n || void 0 === n ? void 0 : n.toISOString(),
                              currentPageIndex: 1,
                              paginationTokens: new Map().set(1, ''),
                              hasOpenEndPagination: !0,
                              pageCount: 1
                            });
                          });
                        })(e.detail.value);
                      },
                      value: $,
                      relativeOptions: r.jw,
                      i18nStrings: r.e1,
                      placeholder: 'Filter by a date and time range',
                      isValidRange: r.BQ
                    })
                  ),
                  pagination: g.createElement(f.Z, {
                    disabled: W,
                    pagesCount: k.pageCount,
                    currentPageIndex: k.currentPageIndex,
                    onChange: function (e) {
                      return (function (e) {
                        if (!k.paginationTokens.get(e.currentPageIndex) && e.currentPageIndex > 1)
                          C(function (t) {
                            return N(N({}, t), {
                              currentPageIndex: e.currentPageIndex - 1,
                              hasOpenEndPagination: !1
                            });
                          });
                        else {
                          var t = k.paginationTokens.get(e.currentPageIndex) || '';
                          C(function (n) {
                            return N(N({}, n), {
                              pageCount: e.currentPageIndex > n.pageCount ? e.currentPageIndex : n.pageCount,
                              currentPageIndex: e.currentPageIndex,
                              paginationToken: t
                            });
                          });
                        }
                      })(e.detail);
                    },
                    openEnd: k.hasOpenEndPagination,
                    ariaLabels: r.gO
                  }),
                  preferences: g.createElement(m.Z, {
                    title: 'Preferences',
                    confirmLabel: 'Confirm',
                    cancelLabel: 'Cancel',
                    preferences: { pageSize: k.pageSize },
                    onConfirm: function (e) {
                      return (function (e) {
                        C(function (t) {
                          var r;
                          return N(N({}, t), {
                            pageSize: e || (null === (r = n[0]) || void 0 === r ? void 0 : r.value),
                            paginationToken: void 0,
                            currentPageIndex: 1,
                            paginationTokens: new Map().set(1, ''),
                            hasOpenEndPagination: !0,
                            pageCount: 1
                          });
                        });
                      })(e.detail.pageSize);
                    },
                    pageSizePreference: { title: 'Page size', options: n }
                  }),
                  items: ne
                })
              )
            )
          );
        },
        j = n(9371),
        z = n(4365),
        R = n(2426),
        W = n(8501),
        F = n(5934),
        M = n(9519),
        V = n(1155),
        K = n(8998),
        G = n(4102),
        q = n(1379),
        _ = n(3125),
        B = n(4988),
        H = function () {
          return (
            (H =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var a in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
                return e;
              }),
            H.apply(this, arguments)
          );
        },
        Y = ['name', 'description'];
      function J(e) {
        var t = (0, g.useState)({ pageSize: 10 }),
          n = t[0],
          o = t[1],
          c = 'Compute Platforms',
          s = (0, a.K)(e.allItems, {
            filtering: {
              empty: (0, r._7)(c),
              noMatch: (0, r.fV)(c),
              filteringFunction: function (e, t) {
                var n = t.toLowerCase();
                return Y.some(function (t) {
                  return 'string' === typeof e[t] && e[t].toLowerCase().indexOf(n) > -1;
                });
              }
            },
            pagination: { pageSize: n.pageSize }
          }),
          l = s.items,
          u = s.filterProps,
          d = s.paginationProps,
          p = e.allItems.filter(function (t) {
            return t.id === e.selectedItem;
          }),
          v = (0, g.useState)(p),
          h = v[0],
          y = v[1];
        return g.createElement(q.Z, {
          'data-testid': 'EnvTypeCards',
          loading: e.isLoading,
          loadingText: 'Loading Compute Platforms',
          onSelectionChange: function (t) {
            var n = t.detail;
            y(function (e) {
              return n.selectedItems;
            }),
              e.onSelect(n);
          },
          selectedItems: h,
          cardDefinition: {
            header: function (e) {
              return g.createElement('div', { 'data-testid': e.name }, e.name);
            },
            sections: [
              {
                id: 'description',
                content: function (e) {
                  return g.createElement(_.Z, null, e.description);
                }
              }
            ]
          },
          items: l,
          selectionType: 'single',
          trackBy: 'id',
          visibleSections: ['description'],
          empty: g.createElement(
            i.Z,
            { textAlign: 'center', color: 'inherit' },
            g.createElement('b', null, 'No ', c),
            g.createElement(
              i.Z,
              { padding: { bottom: 's' }, variant: 'p', color: 'inherit' },
              'No ',
              c,
              ' to display.'
            )
          ),
          filter: g.createElement(
            B.Z,
            H({}, u, {
              filteringPlaceholder: 'Find Compute Platform',
              'data-testid': 'environmentTypeSearch'
            })
          ),
          pagination: g.createElement(f.Z, H({}, d)),
          preferences: g.createElement(m.Z, {
            title: 'Preferences',
            confirmLabel: 'Confirm',
            cancelLabel: 'Cancel',
            preferences: n,
            onConfirm: function (e) {
              var t = e.detail.pageSize;
              return o({ pageSize: t || 10 });
            },
            pageSizePreference: {
              title: 'Page size',
              options: [
                { label: '10', value: 10 },
                { label: '15', value: 15 },
                { label: '20', value: 20 }
              ]
            }
          })
        });
      }
      function U(e) {
        var t = 'Configurations',
          n = (0, a.K)(e.allItems, {}).items,
          r = (0, g.useState)([]),
          o = r[0],
          c = r[1];
        return (
          (0, g.useEffect)(
            function () {
              c([]);
            },
            [n]
          ),
          g.createElement(q.Z, {
            'data-testid': 'EnvTypeConfigCards',
            onSelectionChange: function (t) {
              var n = t.detail;
              c(n.selectedItems), e.onSelect(n);
            },
            selectedItems: o,
            cardDefinition: {
              header: function (e) {
                return g.createElement('div', { 'data-testid': e.name }, e.name);
              },
              sections: [
                {
                  id: 'estimatedCost',
                  content: function (e) {
                    return e.estimatedCost;
                  },
                  header: 'Estimated Cost'
                },
                {
                  id: 'instanceType',
                  content: function (e) {
                    return e.type;
                  },
                  header: 'Instance Type'
                }
              ]
            },
            cardsPerRow: [{ cards: 1 }, { minWidth: 300, cards: 3 }],
            items: n,
            loading: e.isLoading,
            loadingText: 'Loading Configurations',
            selectionType: 'single',
            trackBy: 'id',
            visibleSections: ['estimatedCost', 'instanceType'],
            empty: g.createElement(
              i.Z,
              { textAlign: 'center', color: 'inherit' },
              g.createElement('b', null, 'No ', t),
              g.createElement(
                i.Z,
                { padding: { bottom: 's' }, variant: 'p', color: 'inherit' },
                'No ',
                t,
                ' to display.'
              )
            )
          })
        );
      }
      var Q = function () {
          return (
            (Q =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var a in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, a) && (e[a] = t[a]);
                return e;
              }),
            Q.apply(this, arguments)
          );
        },
        X = function (e, t, n, r) {
          return new (n || (n = Promise))(function (a, i) {
            function o(e) {
              try {
                s(r.next(e));
              } catch (t) {
                i(t);
              }
            }
            function c(e) {
              try {
                s(r.throw(e));
              } catch (t) {
                i(t);
              }
            }
            function s(e) {
              var t;
              e.done
                ? a(e.value)
                : ((t = e.value),
                  t instanceof n
                    ? t
                    : new n(function (e) {
                        e(t);
                      })).then(o, c);
            }
            s((r = r.apply(e, t || [])).next());
          });
        },
        $ = function (e, t) {
          var n,
            r,
            a,
            i,
            o = {
              label: 0,
              sent: function () {
                if (1 & a[0]) throw a[1];
                return a[1];
              },
              trys: [],
              ops: []
            };
          return (
            (i = { next: c(0), throw: c(1), return: c(2) }),
            'function' === typeof Symbol &&
              (i[Symbol.iterator] = function () {
                return this;
              }),
            i
          );
          function c(i) {
            return function (c) {
              return (function (i) {
                if (n) throw new TypeError('Generator is already executing.');
                for (; o; )
                  try {
                    if (
                      ((n = 1),
                      r &&
                        (a =
                          2 & i[0]
                            ? r.return
                            : i[0]
                            ? r.throw || ((a = r.return) && a.call(r), 0)
                            : r.next) &&
                        !(a = a.call(r, i[1])).done)
                    )
                      return a;
                    switch (((r = 0), a && (i = [2 & i[0], a.value]), i[0])) {
                      case 0:
                      case 1:
                        a = i;
                        break;
                      case 4:
                        return o.label++, { value: i[1], done: !1 };
                      case 5:
                        o.label++, (r = i[1]), (i = [0]);
                        continue;
                      case 7:
                        (i = o.ops.pop()), o.trys.pop();
                        continue;
                      default:
                        if (!(a = (a = o.trys).length > 0 && a[a.length - 1]) && (6 === i[0] || 2 === i[0])) {
                          o = 0;
                          continue;
                        }
                        if (3 === i[0] && (!a || (i[1] > a[0] && i[1] < a[3]))) {
                          o.label = i[1];
                          break;
                        }
                        if (6 === i[0] && o.label < a[1]) {
                          (o.label = a[1]), (a = i);
                          break;
                        }
                        if (a && o.label < a[2]) {
                          (o.label = a[2]), o.ops.push(i);
                          break;
                        }
                        a[2] && o.ops.pop(), o.trys.pop();
                        continue;
                    }
                    i = t.call(e, o);
                  } catch (c) {
                    (i = [6, c]), (r = 0);
                  } finally {
                    n = a = 0;
                  }
                if (5 & i[0]) throw i[1];
                return { value: i[0] ? i[1] : void 0, done: !0 };
              })([i, c]);
            };
          }
        },
        ee = function () {
          var e = (0, v.useRouter)(),
            t = (0, g.useState)(!1),
            n = t[0],
            a = t[1],
            o = (0, g.useState)(!0),
            c = o[0],
            d = o[1],
            p = (0, g.useState)(),
            f = p[0],
            m = p[1],
            S = (0, g.useState)(''),
            T = S[0],
            w = S[1],
            C = (0, g.useState)({}),
            I = C[0],
            P = C[1],
            Z = (0, g.useState)({}),
            x = Z[0],
            L = Z[1],
            N = (function () {
              var e,
                t = (0, h.ZP)('environmentTypes', r.zl),
                n = t.data,
                a = t.isValidating;
              return {
                envTypes: (null !== (e = null === n || void 0 === n ? void 0 : n.data) && void 0 !== e
                  ? e
                  : []
                ).filter(function (e) {
                  return 'APPROVED' === e.status;
                }),
                areEnvTypesLoading: a
              };
            })(),
            O = N.envTypes,
            D = N.areEnvTypesLoading,
            A = (function (e) {
              var t,
                n = (0, h.ZP)(function () {
                  return e ? 'environmentTypes/'.concat(e, '/configurations') : null;
                }, r.zl),
                a = n.data,
                i = n.isValidating;
              return {
                envTypeConfigs:
                  null !== (t = null === a || void 0 === a ? void 0 : a.data) && void 0 !== t ? t : [],
                areEnvTypeConfigsLoading: i
              };
            })((null === I || void 0 === I ? void 0 : I.envTypeId) || ''),
            q = A.envTypeConfigs,
            _ = A.areEnvTypeConfigsLoading,
            B = (function () {
              var e,
                t = (0, h.ZP)(function () {
                  return 'projects';
                }, r.zl),
                n = t.data,
                a = t.isValidating;
              return {
                projects:
                  null !== (e = null === n || void 0 === n ? void 0 : n.data) && void 0 !== e ? e : [],
                areProjectsLoading: a
              };
            })(),
            H = B.projects,
            Y = B.areProjectsLoading,
            ee = (0, j.fG)(),
            te = ee.datasets,
            ne = ee.areDatasetsLoading,
            re = [
              {
                field: 'name',
                condition: function (e) {
                  return !!e;
                },
                message: 'Workspace Name is Required'
              },
              {
                field: 'name',
                condition: function (e) {
                  return !!e && r.yJ.test(e);
                },
                message:
                  'Workspace Name must start with an alphabetic character and can only contain alphanumeric characters (case sensitive) and hyphens.'
              },
              {
                field: 'name',
                condition: function (e) {
                  return !!e && e.length <= 128;
                },
                message: 'Workspace Name cannot be longer than 128 characters'
              },
              {
                field: 'projectId',
                condition: function (e) {
                  return !!e;
                },
                message: 'Project ID is Required'
              },
              {
                field: 'envTypeId',
                condition: function (e) {
                  return !!e;
                },
                message: 'Compute Platform is Required'
              },
              {
                field: 'envTypeConfigId',
                condition: function (e) {
                  return !!e;
                },
                message: 'Configuration is Required'
              },
              {
                field: 'description',
                condition: function (e) {
                  return e && e.length <= 500;
                },
                message: 'Description cannot be longer than 500 characters'
              },
              {
                field: 'description',
                condition: function (e) {
                  return !!e;
                },
                message: 'Description is Required'
              }
            ],
            ae = function (e, t) {
              for (
                var n = function (n) {
                    if (!n.condition(t))
                      return (
                        L(function (t) {
                          var r;
                          return Q(Q({}, t), (((r = {})[''.concat(e, 'Error')] = n.message), r));
                        }),
                        { value: !1 }
                      );
                  },
                  r = 0,
                  a = re.filter(function (t) {
                    return t.field === e;
                  });
                r < a.length;
                r++
              ) {
                var i = n(a[r]);
                if ('object' === typeof i) return i.value;
              }
              return (
                L(function (t) {
                  var n;
                  return Q(Q({}, t), (((n = {})[''.concat(e, 'Error')] = ''), n));
                }),
                !0
              );
            };
          (0, g.useEffect)(
            function () {
              d(
                !re.every(function (e) {
                  return e.condition(I[e.field]);
                })
              );
            },
            [I]
          );
          return g.createElement(
            r.IE,
            {
              breadcrumbs: [
                { text: 'Service Workbench', href: '/' },
                { text: 'Workspaces', href: '/environments' },
                { text: 'Create Workspace', href: '/environments/new' }
              ],
              activeHref: '/environments'
            },
            g.createElement(
              z.Z,
              null,
              g.createElement(
                i.Z,
                null,
                g.createElement(
                  'form',
                  {
                    onSubmit: function (e) {
                      return e.preventDefault();
                    }
                  },
                  g.createElement(
                    R.Z,
                    {
                      errorText: T,
                      actions: g.createElement(
                        l.Z,
                        { direction: 'horizontal', size: 'xs' },
                        g.createElement(
                          u.Z,
                          { formAction: 'none', variant: 'link', href: '/environments' },
                          'Cancel'
                        ),
                        g.createElement(
                          u.Z,
                          {
                            'data-testid': 'environmentCreateSubmit',
                            variant: 'primary',
                            disabled: c || n,
                            loading: n,
                            onClick: function () {
                              return X(void 0, void 0, void 0, function () {
                                return $(this, function (t) {
                                  switch (t.label) {
                                    case 0:
                                      return [
                                        4,
                                        X(void 0, void 0, void 0, function () {
                                          return $(this, function (t) {
                                            switch (t.label) {
                                              case 0:
                                                a(!0), (t.label = 1);
                                              case 1:
                                                return (
                                                  t.trys.push([1, 4, 5, 6]),
                                                  [
                                                    4,
                                                    ((n = I),
                                                    E(void 0, void 0, void 0, function () {
                                                      return b(this, function (e) {
                                                        switch (e.label) {
                                                          case 0:
                                                            return [4, (0, r.Wy)('environments', y({}, n))];
                                                          case 1:
                                                            return e.sent(), [2];
                                                        }
                                                      });
                                                    }))
                                                  ]
                                                );
                                              case 2:
                                                return (
                                                  t.sent(),
                                                  [
                                                    4,
                                                    e.push({
                                                      pathname: '/environments',
                                                      query: {
                                                        message: 'Workspace Created Successfully',
                                                        notificationType: 'success'
                                                      }
                                                    })
                                                  ]
                                                );
                                              case 3:
                                                return t.sent(), [3, 6];
                                              case 4:
                                                return (
                                                  t.sent(),
                                                  w('There was a problem creating a workspace.'),
                                                  [3, 6]
                                                );
                                              case 5:
                                                return a(!1), [7];
                                              case 6:
                                                return [2];
                                            }
                                            var n;
                                          });
                                        })
                                      ];
                                    case 1:
                                      return [2, t.sent()];
                                  }
                                });
                              });
                            }
                          },
                          'Create Workspace'
                        )
                      ),
                      header: g.createElement(
                        s.Z,
                        {
                          'data-testid': 'environmentCreateHeader',
                          variant: 'h1',
                          description: 'Short Description of create workspaces'
                        },
                        'Create Research Workspace'
                      )
                    },
                    g.createElement(
                      l.Z,
                      { direction: 'vertical', size: 'l' },
                      g.createElement(
                        W.Z,
                        {
                          variant: 'container',
                          header: g.createElement(
                            s.Z,
                            { variant: 'h2' },
                            'Select Compute Platform (',
                            O.length,
                            ')',
                            g.createElement(
                              i.Z,
                              null,
                              'Selected: ',
                              (null === f || void 0 === f ? void 0 : f.name) || 'None',
                              ' '
                            )
                          ),
                          defaultExpanded: !0
                        },
                        g.createElement(
                          F.Z,
                          { errorText: null === x || void 0 === x ? void 0 : x.envTypeIdError },
                          g.createElement(J, {
                            isLoading: D,
                            allItems: O,
                            onSelect: function (e) {
                              return X(void 0, void 0, void 0, function () {
                                return $(this, function (t) {
                                  switch (t.label) {
                                    case 0:
                                      return [
                                        4,
                                        ((n = e.selectedItems),
                                        X(void 0, void 0, void 0, function () {
                                          var e;
                                          return $(this, function (t) {
                                            return (
                                              (e = (n && n[0]) || void 0),
                                              m(e),
                                              P(
                                                Q(Q({}, I), {
                                                  envTypeId: null === e || void 0 === e ? void 0 : e.id,
                                                  envTypeConfigId: void 0,
                                                  envType: null === e || void 0 === e ? void 0 : e.type,
                                                  datasetIds: []
                                                })
                                              ),
                                              ae('envType', null === e || void 0 === e ? void 0 : e.id),
                                              ae('envTypeConfigId', void 0),
                                              [2]
                                            );
                                          });
                                        }))
                                      ];
                                    case 1:
                                      return [2, t.sent()];
                                  }
                                  var n;
                                });
                              });
                            }
                          })
                        )
                      ),
                      g.createElement(
                        W.Z,
                        {
                          defaultExpanded: !0,
                          variant: 'container',
                          header: g.createElement(s.Z, { variant: 'h2' }, 'Select Configurations')
                        },
                        g.createElement(
                          l.Z,
                          { direction: 'vertical', size: 'l' },
                          g.createElement(
                            F.Z,
                            {
                              label: 'Workspace Name',
                              constraintText: g.createElement(
                                g.Fragment,
                                null,
                                g.createElement(
                                  'li',
                                  null,
                                  'Name can only contain alphanumeric characters (case sensitive) and hyphens.'
                                ),
                                g.createElement('li', null, 'It must start with an alphabetic character.'),
                                g.createElement('li', null, 'Cannot be longer than 128 characters.')
                              ),
                              errorText: null === x || void 0 === x ? void 0 : x.nameError
                            },
                            g.createElement(M.Z, {
                              'data-testid': 'environmentName',
                              value: (null === I || void 0 === I ? void 0 : I.name) || '',
                              onChange: function (e) {
                                var t = e.detail.value;
                                P(Q(Q({}, I), { name: t })), ae('name', t);
                              }
                            })
                          ),
                          g.createElement(
                            F.Z,
                            {
                              label: 'Project ID',
                              errorText: null === x || void 0 === x ? void 0 : x.projectIdError
                            },
                            g.createElement(V.Z, {
                              'data-testid': 'environmentProject',
                              selectedOption: Y
                                ? null
                                : H.map(function (e) {
                                    return { label: e.name, value: e.id };
                                  }).filter(function (e) {
                                    return e.value === (null === I || void 0 === I ? void 0 : I.projectId);
                                  })[0] || null,
                              loadingText: 'Loading Projects',
                              options: H.map(function (e) {
                                return { label: e.name, value: e.id };
                              }),
                              selectedAriaLabel: null === I || void 0 === I ? void 0 : I.projectId,
                              onChange: function (e) {
                                var t = e.detail.selectedOption;
                                P(Q(Q({}, I), { projectId: t.value })), ae('projectId', t.value);
                              },
                              statusType: Y ? 'loading' : 'finished'
                            })
                          ),
                          g.createElement(
                            F.Z,
                            {
                              label: 'Studies',
                              description: 'Studies that you would like to mount to your workspace'
                            },
                            g.createElement(K.Z, {
                              'data-testid': 'environmentStudies',
                              selectedOptions: ne
                                ? []
                                : te
                                    .map(function (e) {
                                      return { label: e.name, value: e.id };
                                    })
                                    .filter(function (e) {
                                      var t;
                                      return null === (t = I.datasetIds) || void 0 === t
                                        ? void 0
                                        : t.includes(e.value);
                                    }),
                              options: te.map(function (e) {
                                return { label: e.name, value: e.id };
                              }),
                              onChange: function (e) {
                                var t = e.detail.selectedOptions.map(function (e) {
                                  return e.value;
                                });
                                P(Q(Q({}, I), { datasetIds: t }));
                              },
                              placeholder: 'Choose options',
                              selectedAriaLabel: 'Selected'
                            })
                          ),
                          g.createElement(
                            F.Z,
                            { errorText: null === x || void 0 === x ? void 0 : x.envTypeConfigIdError },
                            g.createElement(
                              s.Z,
                              null,
                              'Configuration (',
                              q.length,
                              ') ',
                              g.createElement(k.Z, { href: '#' }, 'Info')
                            ),
                            g.createElement(U, {
                              isLoading: _,
                              allItems: q,
                              onSelect: function (e) {
                                !(function (e) {
                                  var t = (e && e[0]) || void 0;
                                  P(
                                    Q(Q({}, I), {
                                      envTypeConfigId: null === t || void 0 === t ? void 0 : t.id
                                    })
                                  ),
                                    ae('envTypeConfigId', null === t || void 0 === t ? void 0 : t.id);
                                })(e.selectedItems);
                              }
                            })
                          ),
                          g.createElement(
                            F.Z,
                            {
                              label: 'Description',
                              constraintText: 'Description cannot be longer than 500 characters.',
                              errorText: null === x || void 0 === x ? void 0 : x.descriptionError
                            },
                            g.createElement(G.Z, {
                              'data-testid': 'environmentDescription',
                              onChange: function (e) {
                                var t = e.detail.value;
                                P(Q(Q({}, I), { description: t })), ae('description', t);
                              },
                              value: (null === I || void 0 === I ? void 0 : I.description) || '',
                              placeholder: 'Description'
                            })
                          )
                        )
                      )
                    )
                  )
                )
              )
            )
          );
        };
    }
  }
]);
