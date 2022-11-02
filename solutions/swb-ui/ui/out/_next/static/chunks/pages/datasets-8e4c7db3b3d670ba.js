(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [671],
  {
    8884: function (e, t, n) {
      'use strict';
      n.r(t);
      var r = n(1933);
      t.default = r.Hg;
    },
    6008: function (e, t, n) {
      (window.__NEXT_P = window.__NEXT_P || []).push([
        '/datasets',
        function () {
          return n(8884);
        }
      ]);
    },
    4441: function (e, t, n) {
      e.exports = n(7792);
    },
    1933: function (e, t, n) {
      'use strict';
      n.d(t, {
        Hg: function () {
          return p;
        },
        fG: function () {
          return o;
        }
      });
      var r = n(8316),
        i = n(8758),
        o = function () {
          var e = (0, i.ZP)(function () {
            return 'datasets';
          }, r.zl);
          return { datasets: e.data || [], areDatasetsLoading: e.isValidating };
        },
        a = [
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
        u = n(8939),
        s = n(1510),
        l = n(7109),
        c = n(3e3),
        f = n(8943),
        g = n(4441),
        d = n(1738),
        p = function () {
          var e = o(),
            t = e.datasets,
            n = e.areDatasetsLoading,
            i = (0, g.useRouter)().query,
            p = i.message,
            v = i.notificationType,
            y = (0, r.zn)(),
            m = y.displayNotification,
            h = y.closeNotification,
            I = (0, d.useState)(!1),
            x = I[0],
            P = I[1];
          if (p && v && !x) {
            var C = 'DatasetMessage';
            m(C, {
              type: v,
              dismissible: !0,
              dismissLabel: 'Dismiss message',
              onDismiss: function () {
                h(C);
              },
              content: p,
              id: C
            }),
              P(!0);
          }
          var F = (0, u.K)(t, {}).items;
          return d.createElement(
            r.IE,
            {
              breadcrumbs: [
                { text: 'Service Workbench', href: '/' },
                { text: 'Datasets', href: '/datasets' }
              ],
              activeHref: '/datasets'
            },
            d.createElement(
              s.Z,
              null,
              d.createElement(l.Z, {
                loading: n,
                selectionType: 'multi',
                header: d.createElement(
                  d.Fragment,
                  null,
                  d.createElement(
                    c.Z,
                    {
                      actions: d.createElement(
                        s.Z,
                        { float: 'right' },
                        d.createElement(f.Z, { direction: 'horizontal', size: 'xs' })
                      )
                    },
                    'Datasets'
                  )
                ),
                columnDefinitions: a,
                loadingText: 'Loading datasets',
                items: F
              })
            )
          );
        };
    },
    8939: function (e, t, n) {
      'use strict';
      n.d(t, {
        K: function () {
          return v;
        }
      });
      var r = n(1738);
      function i(e, t, n) {
        if (0 === t.length) return !0;
        n = n || Object.keys(e);
        var r = t.toLowerCase();
        return n.some(function (t) {
          return String(e[t]).toLowerCase().indexOf(r) > -1;
        });
      }
      var o = function (e, t, n) {
        switch (n) {
          case '<':
            return e < t;
          case '<=':
            return e <= t;
          case '>':
            return e > t;
          case '>=':
            return e >= t;
          case '=':
            return e == t;
          case '!=':
            return e != t;
          case ':':
            return (e + '').toLowerCase().indexOf((t + '').toLowerCase()) > -1;
          case '!:':
            return -1 === (e + '').toLowerCase().indexOf((t + '').toLowerCase());
        }
      };
      function a(e, t, n) {
        if (e.propertyKey) {
          if (!(e.propertyKey in n) || !(e.operator in n[e.propertyKey].operators)) return !1;
          var r = s(t[e.propertyKey]);
          return o(r, e.value, e.operator);
        }
        return (function (e, t, n, r) {
          var i = Object.keys(r).some(function (i) {
            return !!r[i].operators[n] && o(t[i], e, ':');
          });
          return ':' === n ? i : !i;
        })(e.value, t, e.operator, n);
      }
      function u(e, t, n) {
        var r = n.filteringFunction,
          i = n.filteringProperties.reduce(function (e, t) {
            var n,
              r = t.key,
              i = t.operators,
              o = t.defaultOperator,
              a = (((n = {})[null !== o && void 0 !== o ? o : '='] = !0), n);
            return (
              null === i ||
                void 0 === i ||
                i.forEach(function (e) {
                  return (a[e] = !0);
                }),
              (e[r] = { operators: a }),
              e
            );
          }, {}),
          o =
            r ||
            (function (e) {
              return function (t, n) {
                for (
                  var r = n.tokens, i = n.operation, o = 'and' === i || !r.length, u = 0, s = r;
                  u < s.length;
                  u++
                ) {
                  var l = s[u];
                  o = 'and' === i ? o && a(l, t, e) : o || a(l, t, e);
                }
                return o;
              };
            })(i);
        return e.filter(function (e) {
          return o(e, t);
        });
      }
      var s = function (e) {
        return 'boolean' === typeof e ? e + '' : e || 0 === e ? e : '';
      };
      function l(e, t, n) {
        var r,
          o,
          a,
          s = t.filteringText,
          l = t.sortingState,
          c = t.currentPageIndex,
          f = t.propertyFilteringQuery,
          g = n.filtering,
          d = n.sorting,
          p = n.pagination,
          v = n.propertyFiltering,
          y = e;
        return (
          v && (a = (y = u(y, f || { tokens: [], operation: 'and' }, v)).length),
          g &&
            ((y = (function (e, t, n) {
              void 0 === t && (t = '');
              var r = n.filteringFunction,
                o = void 0 === r ? i : r,
                a = n.fields;
              return e.filter(function (e) {
                return o(e, t, a);
              });
            })(y, s, g)),
            (a = y.length)),
          d &&
            (y = (function (e, t) {
              if (!t) return e;
              var n,
                r = t.sortingColumn,
                i =
                  'sortingComparator' in r
                    ? r.sortingComparator
                    : r.sortingField
                    ? ((n = r.sortingField),
                      function (e, t) {
                        var r,
                          i,
                          o = null !== (r = e[n]) && void 0 !== r ? r : '',
                          a = null !== (i = t[n]) && void 0 !== i ? i : '';
                        return 'string' === typeof o && 'string' === typeof a
                          ? o.localeCompare(a)
                          : o < a
                          ? -1
                          : o == a
                          ? 0
                          : 1;
                      })
                    : void 0;
              if (!i) return e;
              var o = e.slice(),
                a = t.isDescending ? -1 : 1;
              return (
                o.sort(function (e, t) {
                  return i(e, t) * a;
                }),
                o
              );
            })(y, l)),
          p &&
            ((r = (function (e, t) {
              return void 0 === t && (t = 10), Math.ceil(e.length / t);
            })(y, p.pageSize)),
            (o = (function (e, t) {
              return !e || e < 1 || e > t ? 1 : e;
            })(c, r)),
            (y = (function (e, t, n) {
              return void 0 === n && (n = 10), e.slice((t - 1) * n, t * n);
            })(y, o, p.pageSize))),
          { items: y, pagesCount: r, filteredItemsCount: a, actualPageIndex: o }
        );
      }
      var c = function (e, t) {
          return e ? ('function' === typeof e ? e(t) : t[e]) : t;
        },
        f = function () {
          return (
            (f =
              Object.assign ||
              function (e) {
                for (var t, n = 1, r = arguments.length; n < r; n++)
                  for (var i in (t = arguments[n]))
                    Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
                return e;
              }),
            f.apply(this, arguments)
          );
        };
      function g(e, t) {
        var n = f({}, e);
        switch (t.type) {
          case 'selection':
            n.selectedItems = t.selectedItems;
            break;
          case 'filtering':
            (n.currentPageIndex = 1), (n.filteringText = t.filteringText);
            break;
          case 'sorting':
            (n.currentPageIndex = 1), (n.sortingState = t.sortingState);
            break;
          case 'pagination':
            n.currentPageIndex = t.pageIndex;
            break;
          case 'property-filtering':
            (n.currentPageIndex = 1), (n.propertyFilteringQuery = t.query);
        }
        return n;
      }
      function d(e) {
        var t = e.dispatch,
          n = e.collectionRef;
        return {
          setFiltering: function (e) {
            t({ type: 'filtering', filteringText: e }), n.current && n.current.scrollToTop();
          },
          setSorting: function (e) {
            t({ type: 'sorting', sortingState: e }), n.current && n.current.scrollToTop();
          },
          setCurrentPage: function (e) {
            t({ type: 'pagination', pageIndex: e }), n.current && n.current.scrollToTop();
          },
          setSelectedItems: function (e) {
            t({ type: 'selection', selectedItems: e });
          },
          setPropertyFiltering: function (e) {
            t({ type: 'property-filtering', query: e }), n.current && n.current.scrollToTop();
          }
        };
      }
      var p = function () {
        return (
          (p =
            Object.assign ||
            function (e) {
              for (var t, n = 1, r = arguments.length; n < r; n++)
                for (var i in (t = arguments[n])) Object.prototype.hasOwnProperty.call(t, i) && (e[i] = t[i]);
              return e;
            }),
          p.apply(this, arguments)
        );
      };
      function v(e, t) {
        var n = (0, r.useRef)(null),
          i = (function (e, t) {
            var n,
              i,
              o,
              a,
              u,
              s,
              l,
              c,
              f,
              p = (0, r.useReducer)(g, {
                selectedItems:
                  null !==
                    (i = null === (n = e.selection) || void 0 === n ? void 0 : n.defaultSelectedItems) &&
                  void 0 !== i
                    ? i
                    : [],
                sortingState: null === (o = e.sorting) || void 0 === o ? void 0 : o.defaultState,
                currentPageIndex:
                  null !== (u = null === (a = e.pagination) || void 0 === a ? void 0 : a.defaultPage) &&
                  void 0 !== u
                    ? u
                    : 1,
                filteringText:
                  null !==
                    (l = null === (s = e.filtering) || void 0 === s ? void 0 : s.defaultFilteringText) &&
                  void 0 !== l
                    ? l
                    : '',
                propertyFilteringQuery:
                  null !==
                    (f = null === (c = e.propertyFiltering) || void 0 === c ? void 0 : c.defaultQuery) &&
                  void 0 !== f
                    ? f
                    : { tokens: [], operation: 'and' }
              });
            return [p[0], d({ dispatch: p[1], collectionRef: t })];
          })(t, n),
          o = i[0],
          a = i[1],
          u = l(e, o, t),
          v = u.items,
          y = u.pagesCount,
          m = u.filteredItemsCount,
          h = u.actualPageIndex;
        if (t.selection && !t.selection.keepSelection) {
          var I = (function (e, t, n) {
            var r = new Set();
            return (
              t.forEach(function (e) {
                return r.add(c(n, e));
              }),
              e.filter(function (e) {
                return r.has(c(n, e));
              })
            );
          })(v, o.selectedItems, t.selection.trackBy);
          (function (e, t, n) {
            if (e.length !== t.length) return !1;
            var r = new Set();
            return (
              e.forEach(function (e) {
                return r.add(c(n, e));
              }),
              t.every(function (e) {
                return r.has(c(n, e));
              })
            );
          })(I, o.selectedItems, t.selection.trackBy) || a.setSelectedItems(I);
        }
        return p(
          { items: v, filteredItemsCount: m, actions: a },
          (function (e, t, n, r, i) {
            var o,
              a = t.filteringText,
              u = t.sortingState,
              l = t.selectedItems,
              c = t.currentPageIndex,
              g = t.propertyFilteringQuery,
              d = i.pagesCount,
              p = i.actualPageIndex,
              v = i.allItems,
              y = e.filtering ? (v.length ? e.filtering.noMatch : e.filtering.empty) : null;
            y = e.propertyFiltering
              ? v.length
                ? e.propertyFiltering.noMatch
                : e.propertyFiltering.empty
              : y;
            var m = e.propertyFiltering
              ? e.propertyFiltering.filteringProperties.reduce(function (e, t) {
                  return (
                    Object.keys(
                      v.reduce(function (e, n) {
                        return (e['' + s(n[t.key])] = !0), e;
                      }, {})
                    ).forEach(function (n) {
                      '' !== n && e.push({ propertyKey: t.key, value: n });
                    }),
                    e
                  );
                }, [])
              : [];
            return {
              collectionProps: f(
                f(
                  f(
                    { empty: y },
                    e.sorting
                      ? {
                          onSortingChange: function (e) {
                            var t = e.detail;
                            n.setSorting(t);
                          },
                          sortingColumn: null === u || void 0 === u ? void 0 : u.sortingColumn,
                          sortingDescending: null === u || void 0 === u ? void 0 : u.isDescending
                        }
                      : {}
                  ),
                  e.selection
                    ? {
                        onSelectionChange: function (e) {
                          var t = e.detail.selectedItems;
                          n.setSelectedItems(t);
                        },
                        selectedItems: l,
                        trackBy: e.selection.trackBy
                      }
                    : {}
                ),
                { ref: r }
              ),
              filterProps: {
                filteringText: a,
                onChange: function (e) {
                  var t = e.detail.filteringText;
                  n.setFiltering(t);
                }
              },
              propertyFilterProps: {
                query: g,
                onChange: function (e) {
                  var t = e.detail;
                  n.setPropertyFiltering(t);
                },
                filteringProperties:
                  (null === (o = e.propertyFiltering) || void 0 === o ? void 0 : o.filteringProperties) || [],
                filteringOptions: m
              },
              paginationProps: {
                currentPageIndex: null !== p && void 0 !== p ? p : c,
                pagesCount: d,
                onChange: function (e) {
                  var t = e.detail.currentPageIndex;
                  n.setCurrentPage(t);
                }
              }
            };
          })(t, o, a, n, { actualPageIndex: h, pagesCount: y, allItems: e })
        );
      }
    }
  },
  function (e) {
    e.O(0, [874, 774, 888, 179], function () {
      return (t = 6008), e((e.s = t));
      var t;
    });
    var t = e.O();
    _N_E = t;
  }
]);
