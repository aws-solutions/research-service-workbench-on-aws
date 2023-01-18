/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListAccountsRequestParser } from './listAccountsRequest';

describe('ListAccountsRequestParser', () => {
  let requestObject: Record<string, JSONValue>;

  describe('when pageSize', () => {
    let expectedPageSize: number;

    describe('is valid', () => {
      beforeEach(() => {
        expectedPageSize = 5;
        requestObject = {
          pageSize: `${expectedPageSize}`
        };
      });

      test('it parses the page size into a number', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(true);
        if (parsed.success) {
          expect(parsed.data.pageSize).toEqual(expectedPageSize);
        }
      });
    });

    describe('is NaN', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: 'nonNumber'
        };
      });

      test('it returns an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
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

    describe('is greater than 100', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: '101'
        };
      });

      test('it returns an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);

        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be between 1 and 100',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });

    describe('is less than 1', () => {
      beforeEach(() => {
        requestObject = {
          pageSize: '0'
        };
      });

      test('it throws an error', () => {
        const parsed = ListAccountsRequestParser.safeParse(requestObject);
        expect(parsed.success).toEqual(false);

        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be between 1 and 100',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
