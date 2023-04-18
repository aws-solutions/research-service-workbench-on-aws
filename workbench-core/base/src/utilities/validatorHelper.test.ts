/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '../types/json';
import { getPaginationParser, validateAndParse, z } from './validatorHelper';

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
    test('returns valid Object', () => {
      expect(validateAndParse<TestType>(testParser, objectToParse)).toEqual(expectedParse);
    });
  });
  describe('is not valid', () => {
    const objectToParse = { prop1: 2 };
    test('throws exception message', () => {
      expect(() => validateAndParse<TestType>(testParser, objectToParse)).toThrowError(
        'prop1: Expected string, received number. prop2: Required'
      );
    });
  });
});
describe('zod.swbId', () => {
  const zodParser = z.object({
    id: z.string().swbId('prefix')
  });
  type SWBIdType = z.infer<typeof zodParser>;
  const invalidObjects: SWBIdType[] = [
    { id: 'prefix1-12345678-1234-1234-123f-1234567890ab' }, //invalid prefix
    { id: 'prefix-1234567g-1234-1234-123f-1234567890ab' }, //invalid out of range g in 1st uuid section
    { id: 'prefix-12345678f-1234-1234-123f-1234567890ab' }, //invalid extra char in 1st uuid section
    { id: 'prefix-12345678-123g-1234-123f-1234567890ab' }, //invalid out of range g in 2nd uuid section
    { id: 'prefix-12345678-1234f-1234-123f-1234567890ab' }, //invalid extra char in 2nd uuid section
    { id: 'prefix-12345678-1234-123g-123f-1234567890ab' }, //invalid out of range g in 3rd uuid section
    { id: 'prefix-12345678-1234-1234f-123f-1234567890ab' }, //invalid extra char in 3rd uuid section
    { id: 'prefix-12345678-1234-1234-123g-1234567890ab' }, //invalid out of range g in 4th uuid section
    { id: 'prefix-12345678-1234-1234-123ff-1234567890ab' }, //invalid extra char in 4th uuid section
    { id: 'prefix-12345678-1234-1234-123f-1234567890ag' }, //invalid out of range g in 5th uuid section
    { id: 'prefix-12345678-1234-1234-123f-1234567890abf' }, //invalid extra char in 5ht uuid section
    { id: '' } //empty value
  ];

  describe('is valid', () => {
    const validObject = { id: 'prefix-12345678-1234-1234-123f-1234567890ab' };
    test('returns valid Id', () => {
      expect(validateAndParse<SWBIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('is not valid', () => {
    test.each(invalidObjects)('returns invalid Id message', (invalidId) => {
      expect(() => validateAndParse<SWBIdType>(zodParser, invalidId)).toThrowError(': Invalid ID');
    });
  });
});
describe('zod.required', () => {
  const zodParser = z.object({
    id: z.string().required()
  });
  type RequiredType = z.infer<typeof zodParser>;
  const invalidObjects = [
    { randomProp: 'random property' }, //undefined id value
    { id: '' } //empty value
  ];

  describe('is valid', () => {
    const validObject = { id: 'required value' };
    test('returns valid Id', () => {
      expect(validateAndParse<RequiredType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('is not valid', () => {
    test.each(invalidObjects)('returns required message', (invalidObject) => {
      expect(() => validateAndParse<RequiredType>(zodParser, invalidObject)).toThrowError('id: Required');
    });
  });
});
