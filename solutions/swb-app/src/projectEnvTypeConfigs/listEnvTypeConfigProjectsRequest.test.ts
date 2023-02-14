/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { ListEnvTypeConfigProjectsRequestParser } from './listEnvTypeConfigProjectsRequest';

describe('ListEnvTypeConfigProjectsRequestParser', () => {
  let requestObject: Record<string, JSONValue>;
  describe('when pageSize', () => {
    let expectedPageSize: number;

    describe('is valid', () => {
      beforeEach(() => {
        // BUILD
        expectedPageSize = 5;
        requestObject = {
          pageSize: `${expectedPageSize}`,
          envTypeId: 'envTypeId',
          envTypeConfigId: 'envTypeConfigId'
        };
      });

      test('it parses the page size into a number', () => {
        // OPERATE
        const parsed = ListEnvTypeConfigProjectsRequestParser.safeParse(requestObject);

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
        requestObject = {
          pageSize: 'nonNumber',
          envTypeId: 'envTypeId',
          envTypeConfigId: 'envTypeConfigId'
        };
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListEnvTypeConfigProjectsRequestParser.safeParse(requestObject);

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
        requestObject = {
          pageSize: `${expectedPageSize}`,
          envTypeId: 'envTypeId',
          envTypeConfigId: 'envTypeConfigId'
        };
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = ListEnvTypeConfigProjectsRequestParser.safeParse(requestObject);

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be Between 1 and 100',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });

      test('it returns an error when greater than 100', () => {
        // OPERATE
        const parsed = ListEnvTypeConfigProjectsRequestParser.safeParse({
          ...requestObject,
          pageSize: '101'
        });

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: 'Must be Between 1 and 100',
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
