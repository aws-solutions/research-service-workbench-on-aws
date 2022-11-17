/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryNumberParamFilterParser } from '../interfaces/queryNumberParamFilter';
import {
  getFilterQueryParams,
  getSortQueryParams,
  validateSingleSortAndFilter
} from './queryParamsFiltersUtils';

describe('Query params filters utils', () => {
  describe('validateSingleSortAndFilter', () => {
    test('should throw exception when request has filter and sorting', () => {
      expect(() => validateSingleSortAndFilter({ name: { eq: 'Sauron' } }, { status: 'desc' })).toThrow(
        'Cannot apply a filter and sort to different properties at the same time'
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

    test('should not throw exception when there is only one filter', () => {
      expect(() => validateSingleSortAndFilter({ name: { eq: 'Sauron' } }, undefined)).not.toThrow();
    });

    test('should not throw exception when there is only one sort', () => {
      expect(() => validateSingleSortAndFilter(undefined, { status: 'desc' })).not.toThrow();
    });
  });

  describe('getFilterQueryParams', () => {
    test('should return undefined when filter is not defined', () => {
      expect(getFilterQueryParams(undefined, [])).toEqual({});
    });

    test('should parse successfuly a between queryParam', () => {
      const inputQueryParam = {
        age: QueryNumberParamFilterParser.parse({
          between: {
            value1: 1,
            value2: 10
          }
        })
      };

      const expectedResult = {
        index: 'getResourceByAge',
        sortKey: 'age',
        between: {
          value1: { N: '1' },
          value2: { N: '10' }
        }
      };
      expect(getFilterQueryParams(inputQueryParam, ['getResourceByAge'])).toEqual(expectedResult);
    });

    test.each(['eq', 'lt', 'lte', 'gt', 'gte', 'begins'])(
      'should parse successfully a %p query param',
      (a) => {
        const inputQueryParam = {
          name: {
            [a]: 'Sauron'
          }
        };
        const expectedResult = {
          index: 'getResourceByName',
          sortKey: 'name',
          [a]: { S: 'Sauron' }
        };
        expect(getFilterQueryParams(inputQueryParam, ['getResourceByName'])).toEqual(expectedResult);
      }
    );
  });

  describe('getSortQueryParams', () => {
    test('should return undefined when sort is not defined', () => {
      expect(getSortQueryParams(undefined, [])).toEqual({});
    });

    test('should parse successfuly an ascending sort', () => {
      const expectedResult = {
        index: 'getResourceByName',
        sortKey: 'name',
        forward: true
      };
      expect(getSortQueryParams({ name: 'asc' }, ['getResourceByName'])).toEqual(expectedResult);
    });

    test('should parse successfuly a descending sort', () => {
      const expectedResult = {
        index: 'getResourceByName',
        sortKey: 'name',
        forward: false
      };
      expect(getSortQueryParams({ name: 'desc' }, ['getResourceByName'])).toEqual(expectedResult);
    });
  });
});
