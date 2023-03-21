/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { z } from 'zod';
import { getPaginationParser, validateAndParse } from './validatorHelper';

describe('getPaginationProperties', () => {
  let requestObject: Record<string, JSONValue>;
  const paginationParser = z.object({ ...getPaginationParser() });
  const customMinValue = 5;
  const customMaxValue = 10;
  const customPaginationParser = z.object({ ...getPaginationParser(customMinValue, customMaxValue) });
  const parsersList = [
    { parser: paginationParser, minValue: 1, maxValue: 100 },
    { parser: customPaginationParser, minValue: customMinValue, maxValue: customMaxValue }
  ];
  describe('when pageSize', () => {
    let expectedPageSize: number;

    describe('is valid', () => {
      beforeEach(() => {
        // BUILD
        expectedPageSize = 5;
        requestObject = {
          pageSize: `${expectedPageSize}`
        };
      });

      test('it parses the page size into a number', () => {
        // OPERATE
        const parsed = paginationParser.safeParse(requestObject);

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
          pageSize: 'nonNumber'
        };
      });

      test('it returns an error', () => {
        // OPERATE
        const parsed = paginationParser.safeParse(requestObject);

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
    describe('is out of range', () => {
      test.each(parsersList)('it returns an error when lower than min value', (parserItem) => {
        // OPERATE
        const parsed = parserItem.parser.safeParse({
          pageSize: `${parserItem.minValue - 1}`
        });

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: `Must be Between ${parserItem.minValue} and ${parserItem.maxValue}`,
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });

      test.each(parsersList)('it returns an error when greater than max value', (parserItem) => {
        // OPERATE
        const parsed = parserItem.parser.safeParse({
          pageSize: `${parserItem.maxValue + 1}`
        });

        // CHECK
        expect(parsed.success).toEqual(false);
        if (!parsed.success) {
          const expectedIssues = [
            {
              code: 'custom',
              message: `Must be Between ${parserItem.minValue} and ${parserItem.maxValue}`,
              path: ['pageSize']
            }
          ];
          expect(parsed.error.issues).toEqual(expectedIssues);
        }
      });
    });
  });
});
describe('validateAndParse', () => {
  const testParser = z
    .object({
      prop1: z.string(),
      prop2: z.number()
    })
    .strict();
  type TestType = z.infer<typeof testParser>;
  describe('is valid', () => {
    const objectToParse = { prop1: 'prop1', prop2: 3 };
    const expectedParse = { prop1: 'prop1', prop2: 3 };
    expect(validateAndParse<TestType>(testParser, objectToParse)).toEqual(expectedParse);
  });
  describe('is not valid', () => {
    const objectToParse = { prop1: 2 };
    try {
      validateAndParse<TestType>(testParser, objectToParse);
    } catch (e) {
      expect(e.message).toEqual('prop1: Expected string, received number. prop2: Required');
    }
  });
});
