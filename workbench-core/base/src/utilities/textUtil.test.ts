/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';
jest.mock('uuid', () => ({ v4: () => randomUuid }));

import {
  etIdRegex,
  etcIdRegex,
  lengthValidationMessage,
  nonHtmlRegExp,
  swbDescriptionRegExp,
  awsAccountIdRegExp,
  swbNameRegExp,
  uuidRegExp,
  uuidWithLowercasePrefix,
  uuidWithLowercasePrefixRegExp
} from './textUtil';

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
  describe('nonHtmlRegExp', () => {
    test('valid nonHtml', () => {
      expect('this is a valid non html @#'.match(nonHtmlRegExp())).toEqual(
        expect.arrayContaining([`this is a valid non html @#`])
      );
    });

    test('invalid nonHtml', () => {
      expect(`<script>function(){while(true)}</script>`.match(nonHtmlRegExp())).toEqual(null);
    });
  });
  describe('swbNameRegExp', () => {
    test('valid swbName valid char', () => {
      expect('name.name-1'.match(swbNameRegExp())).toEqual(expect.arrayContaining([`name.name-1`]));
    });

    test('valid swbName empty string', () => {
      expect(''.match(swbNameRegExp())).toEqual(expect.arrayContaining([``]));
    });

    test('invalid swbName', () => {
      expect(`invalid name$`.match(swbNameRegExp())).toEqual(null);
    });
  });
  describe('swbDescriptionRegExp', () => {
    test('valid swbDescription valid char', () => {
      expect('description- desc'.match(swbDescriptionRegExp())).toEqual(
        expect.arrayContaining([`description- desc`])
      );
    });

    test('valid swbDescription empty string', () => {
      expect(''.match(swbDescriptionRegExp())).toEqual(expect.arrayContaining([``]));
    });

    test('invalid swbDescription', () => {
      expect(`%$<>`.match(swbDescriptionRegExp())).toEqual(null);
    });
  });

  describe('awsAccountIdRegExp', () => {
    test('valid awsAccountId', () => {
      expect('123456789012'.match(awsAccountIdRegExp())).toEqual(expect.arrayContaining([`123456789012`]));
    });

    test('invalid awsAccountId', () => {
      expect(`abd`.match(awsAccountIdRegExp())).toEqual(null);
      expect(`123`.match(awsAccountIdRegExp())).toEqual(null);
      expect(`1`.repeat(13).match(awsAccountIdRegExp())).toEqual(null);
      expect(`1`.repeat(11).match(awsAccountIdRegExp())).toEqual(null);
    });
  });

  describe('etIdRegex', () => {
    test('valid etId', () => {
      expect('et-prod-1234567890123,pa-1234567890123'.match(etIdRegex())).toEqual(
        expect.arrayContaining([`et-prod-1234567890123,pa-1234567890123`])
      );
    });

    test('invalid etId', () => {
      expect(`invalid`.match(etIdRegex())).toEqual(null);
    });
  });
  describe('etcIdRegex', () => {
    test('valid etcId', () => {
      expect(`etc-${randomUuid}`.match(etcIdRegex())).toEqual(expect.arrayContaining([`etc-${randomUuid}`]));
    });

    test('invalid etcId', () => {
      expect(`invalid`.match(etcIdRegex())).toEqual(null);
    });
  });
  describe('lengthValidationMessage', () => {
    test('returns validation message', () => {
      expect(lengthValidationMessage(3)).toEqual('Input must be less than 3 characters');
    });
  });
});
