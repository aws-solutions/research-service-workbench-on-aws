/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';
jest.mock('uuid', () => ({ v4: () => randomUuid }));

import { uuidRegExp, uuidWithLowercasePrefix, uuidWithLowercasePrefixRegExp } from './textUtil';

describe('textUtil', () => {
  describe('uuidWithLowercasePrefix', () => {
    test('capitalized prefix is lowercase', () => {
      const prefix = 'ABC';
      expect(uuidWithLowercasePrefix(prefix)).toEqual(`abc-${randomUuid}`);
    });
  });

  describe('uuidRegExp', () => {
    test('valid uuid', () => {
      expect(randomUuid.match(uuidRegExp)).toEqual(expect.arrayContaining([randomUuid]));
    });
    test('invalid uuid', () => {
      expect('invalidUUID'.match(uuidRegExp)).toEqual(null);
    });
  });

  describe('uuidWithLowercasePrefixRegExp', () => {
    test('valid uuid with prefix', () => {
      const prefix = 'ABC';
      expect(uuidWithLowercasePrefix(prefix).match(uuidWithLowercasePrefixRegExp(prefix))).toEqual(
        expect.arrayContaining([`abc-${randomUuid}`])
      );
    });

    test('invalid uuid with prefix', () => {
      const prefix = 'ABC';
      expect(`${prefix}-${randomUuid}`.match(uuidWithLowercasePrefixRegExp(prefix))).toEqual(null);
    });
  });
});
