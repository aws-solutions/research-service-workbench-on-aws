/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListKeyPairsRequestParser } from './listKeyPairsRequest';

describe('ListKeyPairsRequestParser', () => {
  let requestObject: Record<string, JSONValue>;

  beforeEach(() => {
    requestObject = { userId: 'valid-uid' };
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
        const parsed = ListKeyPairsRequestParser.safeParse(requestObject);

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
        const parsed = ListKeyPairsRequestParser.safeParse(requestObject);

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
        const parsed = ListKeyPairsRequestParser.safeParse(requestObject);

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
});
