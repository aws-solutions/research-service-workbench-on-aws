/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import {
  parseQueryParamFilter,
  parseQueryParamSort,
  validateSingleSortAndFilter
} from './queryParamsFiltersUtils';

describe('Query params filters utils', () => {
  describe('validateSingleSortAndFilter', () => {
    test('should throw exception when request has filter and sorting', () => {
      expect(() => validateSingleSortAndFilter({ name: { eq: 'Sauron' } }, { status: 'desc' })).toThrow(
        'Cannot apply a filter and sort at the same time'
      );
    });

    test('should throw exception when there is more than one filter', () => {
      expect(() =>
        validateSingleSortAndFilter({ name: { eq: 'Sauron' }, status: { begins: 'N' } }, undefined)
      ).toThrow('Cannot apply more than one filter.');
    });

    test('should throw exception when there is more than one sort', () => {
      expect(() => validateSingleSortAndFilter(undefined, { status: 'desc', name: 'asc' })).toThrow(
        'Cannot sort by more than one attribute'
      );
    });

    test('sohuld not throw exception when there is only one filter', () => {
      expect(() => validateSingleSortAndFilter({ name: { eq: 'Sauron' } }, undefined)).not.toThrow();
    });

    test('should not throw exception when there is only one sort', () => {
      expect(() => validateSingleSortAndFilter(undefined, { status: 'desc' })).not.toThrow();
    });
  });

  describe('parseQueryParamFilter', () => {
    test('should return undefined when filter is not defined', () => {
      expect(parseQueryParamFilter(undefined, 'sortTest', 'sortGSI')).toEqual(undefined);
    });

    test('should parse successfuly a between queryParam', () => {
      const inputQueryParam = {
        between: {
          value1: 1,
          value2: 10
        }
      };
      const expectedResult = {
        index: 'testGSI',
        sortKey: 'testProp',
        between: { value1: { N: 1 }, value2: { N: 10 } }
      };
      expect(parseQueryParamFilter(inputQueryParam, expectedResult.sortKey, expectedResult.index)).toEqual(
        expectedResult
      );
    });

    test('should parse successfuly a eq queryParam', () => {
      const inputQueryParam = {
        eq: 'Sauron'
      };
      const expectedResult = {
        index: 'testGSI',
        sortKey: 'testProp',
        eq: { S: 'Sauron' }
      };
      expect(parseQueryParamFilter(inputQueryParam, expectedResult.sortKey, expectedResult.index)).toEqual(
        expectedResult
      );
    });
    test.each(['eq', 'lt', 'lte', 'gt', 'gte', 'begins'])(
      'should parse successfully a %p query param',
      (a) => {
        const inputQueryParam = {
          [a]: 'Sauron'
        };
        const expectedResult = {
          index: 'testGSI',
          sortKey: 'testProp',
          [a]: { S: 'Sauron' }
        };
        expect(parseQueryParamFilter(inputQueryParam, expectedResult.sortKey, expectedResult.index)).toEqual(
          expectedResult
        );
      }
    );
  });

  describe('parseQueryParamSort', () => {
    test('should return undefined when sort is not defined', () => {
      expect(parseQueryParamSort(undefined, 'sortTest', 'sortGSI')).toEqual(undefined);
    });

    test('should parse successfuly an ascending sort', () => {
      const expectedResult = {
        index: 'testGSI',
        sortKey: 'testProp',
        forward: true
      };
      expect(parseQueryParamSort('asc', expectedResult.sortKey, expectedResult.index)).toEqual(
        expectedResult
      );
    });

    test('should parse successfuly a descending sort', () => {
      const expectedResult = {
        index: 'testGSI',
        sortKey: 'testProp',
        forward: false
      };
      expect(parseQueryParamSort('desc', expectedResult.sortKey, expectedResult.index)).toEqual(
        expectedResult
      );
    });
  });
});
