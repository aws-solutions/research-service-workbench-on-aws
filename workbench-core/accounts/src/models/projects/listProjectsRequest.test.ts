/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListProjectsRequestParser } from './listProjectsRequest';

describe('ListProjectsRequestParser', () => {
  let requestObject: Record<string, JSONValue>;

  beforeEach(() => {
    requestObject = {
      user: {
        id: 'user-id',
        roles: []
      }
    };
  });

  describe('when pageSize', () => {
    let expectedPageSize: number;

    describe('is valid', () => {
      beforeEach(() => {
        // BUILD
        expectedPageSize = 5;
        requestObject.pageSize = `${expectedPageSize}`;
      });

      test('it parses the page size into a number', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.pageSize).toEqual(expectedPageSize);
        }
      });
    });

    describe('is NaN', () => {
      beforeEach(() => {
        // BUILD
        requestObject.pageSize = 'nonNumber';
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be a number',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
    describe('is less than 0', () => {
      beforeEach(() => {
        // BUILD
        expectedPageSize = -1;
        requestObject.pageSize = `${expectedPageSize}`;
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be 0 or larger',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
  describe('when sort', () => {
    describe('is valid', () => {
      beforeEach(() => {
        // BUILD
        requestObject.sort = {
          name: 'asc'
        };
      });

      test('it parses the sort request correctly', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.sort).toEqual({ name: 'asc' });
        }
      });
    });
    describe('is invalid', () => {
      beforeEach(() => {
        // BUILD
        requestObject.sort = {
          name: 'invalidValue'
        };
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'invalid_enum_value',
              message: "Invalid enum value. Expected 'asc' | 'desc', received 'invalidValue'",
              options: ['asc', 'desc'],
              path: ['sort', 'name'],
              received: 'invalidValue'
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
  describe('when filter', () => {
    describe('is valid', () => {
      beforeEach(() => {
        // BUILD
        requestObject.filter = {
          name: { eq: 'abc' }
        };
      });

      test('it parses the filter request correctly', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.filter).toEqual({ name: { eq: 'abc' } });
        }
      });
    });
    describe('is invalid', () => {
      beforeEach(() => {
        // BUILD
        requestObject.filter = {
          name: { invalidKey: 'abc' }
        };
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'unrecognized_keys',
              keys: ['invalidKey'],
              message: "Unrecognized key(s) in object: 'invalidKey'",
              path: ['filter', 'name']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
