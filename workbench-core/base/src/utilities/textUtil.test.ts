/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';
jest.mock('uuid', () => ({ v4: () => randomUuid }));

import {
  etIdRegex,
  etcIdRegex,
  projIdRegex,
  envIdRegex,
  lengthValidationMessage,
  nonHtmlRegExp,
  swbDescriptionRegExp,
  awsAccountIdRegExp,
  swbNameRegExp,
  personNameRegExp,
  uuidRegExp,
  uuidWithLowercasePrefix,
  uuidWithLowercasePrefixRegExp,
  costCenterIdRegex,
  accountIdRegex,
  awsRegionRegex,
  sshKeyIdRegex,
  userIdRegex
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
  describe('personNameRegExp', () => {
    test('valid personName valid char', () => {
      expect('John Doe'.match(personNameRegExp())).toEqual(expect.arrayContaining(['John Doe']));
      expect('John Doe 1'.match(personNameRegExp())).toEqual(expect.arrayContaining(['John Doe 1']));
      expect('John Doe II'.match(personNameRegExp())).toEqual(expect.arrayContaining(['John Doe II']));
      expect('Sr. John Doe'.match(personNameRegExp())).toEqual(expect.arrayContaining(['Sr. John Doe']));
      expect('Jane-Doe'.match(personNameRegExp())).toEqual(expect.arrayContaining(['Jane-Doe']));
    });

    test('invalid personName empty string', () => {
      expect(''.match(personNameRegExp())).toEqual(null);
    });

    test('invalid personName', () => {
      expect(`invalid name$`.match(personNameRegExp())).toEqual(null);
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

  describe('awsRegionRegex', () => {
    test('valid supported regions', () => {
      expect('us-east-1'.match(awsRegionRegex())).toEqual(expect.arrayContaining([`us-east-1`]));
      expect('ap-southeast-1'.match(awsRegionRegex())).toEqual(expect.arrayContaining([`ap-southeast-1`]));
    });

    test('invalid or unsupported regions', () => {
      expect(`us-gov-east-1`.match(awsAccountIdRegExp())).toEqual(null);
      expect(`123us-west-2`.match(awsAccountIdRegExp())).toEqual(null);
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
  describe('projIdRegex', () => {
    test('valid projId', () => {
      expect(`proj-${randomUuid}`.match(projIdRegex())).toEqual(
        expect.arrayContaining([`proj-${randomUuid}`])
      );
    });

    test('invalid projId', () => {
      expect(`invalid`.match(projIdRegex())).toEqual(null);
    });
  });

  describe('costCenterIdRegex', () => {
    test('valid costCenterId', () => {
      expect(`cc-${randomUuid}`.match(costCenterIdRegex())).toEqual(
        expect.arrayContaining([`cc-${randomUuid}`])
      );
    });

    test('invalid projId', () => {
      expect(`invalid`.match(costCenterIdRegex())).toEqual(null);
    });
  });

  describe('accountIdRegex', () => {
    test('valid accountId', () => {
      expect(`acc-${randomUuid}`.match(accountIdRegex())).toEqual(
        expect.arrayContaining([`acc-${randomUuid}`])
      );
    });

    test('invalid accountId', () => {
      expect(`acc-${randomUuid}#`.match(accountIdRegex())).toEqual(null);
    });
  });

  describe('envIdRegex', () => {
    test('valid envId', () => {
      expect(`env-${randomUuid}`.match(envIdRegex())).toEqual(expect.arrayContaining([`env-${randomUuid}`]));
    });

    test('invalid envId', () => {
      expect(`invalid`.match(envIdRegex())).toEqual(null);
    });
  });
  describe('lengthValidationMessage', () => {
    test('returns validation message', () => {
      expect(lengthValidationMessage(3)).toEqual('Input must be 3 characters or less');
    });
  });

  describe('sshKeyIdRegex', () => {
    test('valid sshKeyId', () => {
      const randomSshKeyUuid = '1234567812345678123456781234567812345678123456781234567812345678';
      expect(`sshkey-${randomSshKeyUuid}`.match(sshKeyIdRegex())).toEqual(
        expect.arrayContaining([`sshkey-${randomSshKeyUuid}`])
      );
    });

    test('invalid sshKeyId', () => {
      expect(`invalid`.match(sshKeyIdRegex())).toEqual(null);
    });
  });

  describe('userIdRegex', () => {
    test('valid userId', () => {
      expect(`${randomUuid}`.match(userIdRegex())).toEqual(expect.arrayContaining([randomUuid]));
    });

    test('invalid userId', () => {
      expect(`invalid`.match(userIdRegex())).toEqual(null);
    });
  });
});
