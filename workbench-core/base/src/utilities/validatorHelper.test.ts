/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '../types/json';
import {
  nonHTMLMessage,
  swbNameMaxLength,
  swbNameMessage,
  swbDescriptionMaxLength,
  swbDescriptionMessage,
  awsAccountIdMessage,
  nonEmptyMessage,
  invalidIdMessage
} from './textUtil';
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
      expect(() => validateAndParse<SWBIdType>(zodParser, invalidId)).toThrowError('id: Invalid ID');
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

describe('tests for zod.nonHTML', () => {
  const zodParser = z.object({
    id: z.string().nonHTML()
  });
  type NonHTMLType = z.infer<typeof zodParser>;

  describe('when input does not contains HTML', () => {
    const validObjects = [{ id: 'non HTML' }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<NonHTMLType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input contains HTML', () => {
    const invalidObjects = [
      // String with any of <>{}
      { id: '<' },
      { id: '>' },
      { id: '{' },
      { id: '}' },
      // String is HTML with empty quote
      { id: '<>' },
      // String is HTML with double quote
      { id: "<tag key='value'></tag>" },
      { id: "<tag key='value'>content</tag>" },
      // String is Single quote HTML
      { id: "<tag key='value'/>" },
      // String contains HTML
      { id: "randomString<tag key='value'></tag> randomString" },
      { id: "randomString<tag key='value'>content</tag> randomString" },
      { id: "randomString<tag key='value'/> randomString" },
      // String contains multiple HTML
      { id: "randomString<tag key='value'/> randomString <tag key='value'/> randomString" },
      //multi-line with HTML
      { id: "randomString<tag\nkey='value'/> randomString" }
    ];
    test.each(invalidObjects)('returns required message', (invalidObject) => {
      expect(() => validateAndParse<NonHTMLType>(zodParser, invalidObject)).toThrowError(nonHTMLMessage);
    });
  });
});

describe('tests for zod.swbName', () => {
  const zodParser = z.object({
    id: z.string().swbName()
  });
  type SwbNameType = z.infer<typeof zodParser>;

  describe('when input is valid', () => {
    const validObjects = [{ id: 'ABCabc123-_.' }, { id: '' }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<SwbNameType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when length exceed maximum', () => {
      const invalidObjects = [
        // String exceeds max length
        { id: 'A'.repeat(swbNameMaxLength + 1) }
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<SwbNameType>(zodParser, invalidObject)).toThrowError(
          `id: Input must be ${swbNameMaxLength} characters or less`
        );
      });
    });

    describe('when contains invalid char', () => {
      const invalidObjects = [
        // String contains invalid character
        { id: '<' },
        { id: ' ' },
        { id: 'aaa&123' }
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<SwbNameType>(zodParser, invalidObject)).toThrowError(
          `${swbNameMessage}`
        );
      });
    });
  });
});

describe('tests for zod.swbDescription', () => {
  const zodParser = z.object({
    id: z.string().swbDescription()
  });
  type SwbDescriptionType = z.infer<typeof zodParser>;

  describe('when input is valid', () => {
    const validObjects = [{ id: 'ABCabc123-_. ' }, { id: '' }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<SwbDescriptionType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when length exceed maximum', () => {
      const invalidObjects = [
        // String exceeds max length
        { id: 'A'.repeat(swbDescriptionMaxLength + 1) }
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<SwbDescriptionType>(zodParser, invalidObject)).toThrowError(
          `id: Input must be ${swbDescriptionMaxLength} characters or less`
        );
      });
    });

    describe('when contains invalid char', () => {
      const invalidObjects = [
        // String contains invalid character
        { id: '<' },
        { id: 'aaa&123' }
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<SwbDescriptionType>(zodParser, invalidObject)).toThrowError(
          `${swbDescriptionMessage}`
        );
      });
    });
  });
});

describe('tests for zod.awsAccountId', () => {
  const zodParser = z.object({
    id: z.string().awsAccountId()
  });
  type AwsAccountIdType = z.infer<typeof zodParser>;

  describe('when input is valid', () => {
    const validObjects = [{ id: '123456789012' }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<AwsAccountIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when length is not 12', () => {
      const invalidObjects = [{ id: '1'.repeat(13) }, { id: '1'.repeat(11) }];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<AwsAccountIdType>(zodParser, invalidObject)).toThrowError(
          `id: ${awsAccountIdMessage}`
        );
      });
    });

    describe('when contains invalid char', () => {
      const invalidObjects = [
        // String contains invalid character
        { id: '<'.repeat(12) },
        { id: 'a'.repeat(12) }
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<AwsAccountIdType>(zodParser, invalidObject)).toThrowError(
          `${awsAccountIdMessage}`
        );
      });
    });
  });
});

describe('zod.etId', () => {
  const zodParser = z.object({
    id: z.string().etId()
  });
  type SWBIdType = z.infer<typeof zodParser>;
  const invalidObjects: SWBIdType[] = [
    { id: 'et1-prod-1234567890123,pa-1234567890123' }, //invalid prefix
    { id: 'et-prod1-1234567890123,pa-1234567890123' }, //invalid product prefix
    { id: 'et-prod-12345678901234,pa-1234567890123' }, //invalid product length
    { id: 'et-prod-123456789012$,pa-1234567890123' }, //invalid product character
    { id: 'et-prod-1234567890123,pa1-1234567890123' }, //invalid provisioning artifact prefix
    { id: 'et-prod-1234567890123,pa-1234567890123423' }, //invalid provisioning artifact length
    { id: 'et-prod-1234567890123,pa-123456789012$' }, //invalid provisioning artifact character
    { id: '' } //empty value
  ];

  describe('is valid', () => {
    const validObject = { id: 'et-prod-1234567890123,pa-1234567890123' };
    test('returns valid Id', () => {
      expect(validateAndParse<SWBIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('is not valid', () => {
    test.each(invalidObjects)('returns invalid et Id message', (invalidId) => {
      expect(() => validateAndParse<SWBIdType>(zodParser, invalidId)).toThrowError('id: Invalid ID');
    });
  });
});

describe('tests for zod.projId', () => {
  const zodParser = z.object({
    id: z.string().projId()
  });
  type ProjIdType = z.infer<typeof zodParser>;
  const randomUuid = '1234abcd-1234-abcd-1234-aaaabbbbcccc';

  describe('when input is valid', () => {
    const validObjects = [{ id: `proj-${randomUuid}` }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<ProjIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when contains invalid char', () => {
      const invalidObjects: ProjIdType[] = [
        { id: `invalid-${randomUuid}` }, //invalid prefix
        { id: 'proj-invalid-uuid' }, //invalid uuid format
        { id: `proj-${randomUuid}#ProjAdmin` }, //invalid uuid format
        { id: '' } //empty value
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<ProjIdType>(zodParser, invalidObject)).toThrowError(
          `${invalidIdMessage}`
        );
      });
    });
  });
});

describe('tests for zod.accountId', () => {
  const zodParser = z.object({
    id: z.string().accountId()
  });
  type AccountIdType = z.infer<typeof zodParser>;
  const randomUuid = '1234abcd-1234-abcd-1234-aaaabbbbcccc';

  describe('when input is valid', () => {
    const validObjects = [{ id: `acc-${randomUuid}` }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<AccountIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when contains invalid char', () => {
      const invalidObjects: AccountIdType[] = [
        { id: `invalid-${randomUuid}` }, //invalid prefix
        { id: 'acc-invalid-uuid' }, //invalid uuid format
        { id: `acc-${randomUuid}#ProjAdmin` }, //invalid uuid format
        { id: '' } //empty value
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<AccountIdType>(zodParser, invalidObject)).toThrowError(
          `${invalidIdMessage}`
        );
      });
    });
  });
});

describe('tests for zod.costCenterId', () => {
  const zodParser = z.object({
    id: z.string().costCenterId()
  });
  type CostCenterIdType = z.infer<typeof zodParser>;
  const randomUuid = '1234abcd-1234-abcd-1234-aaaabbbbcccc';

  describe('when input is valid', () => {
    const validObjects = [{ id: `cc-${randomUuid}` }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<CostCenterIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when contains invalid char', () => {
      const invalidObjects: CostCenterIdType[] = [
        { id: `invalid-${randomUuid}` }, //invalid prefix
        { id: 'cc-invalid-uuid' }, //invalid uuid format
        { id: `cc-${randomUuid}#ProjAdmin` }, //invalid uuid format
        { id: '' } //empty value
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<CostCenterIdType>(zodParser, invalidObject)).toThrowError(
          `${invalidIdMessage}`
        );
      });
    });
  });
});

describe('zod.etcId', () => {
  const zodParser = z.object({
    id: z.string().etcId()
  });
  type SWBIdType = z.infer<typeof zodParser>;
  const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';
  const invalidObjects: SWBIdType[] = [
    { id: `invalid-${randomUuid}` }, //invalid prefix
    { id: 'etc-invalid-uuid' }, //invalid uuid format
    { id: '' } //empty value
  ];

  describe('is valid', () => {
    const validObject = { id: `etc-${randomUuid}` };
    test('returns valid Id', () => {
      expect(validateAndParse<SWBIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('is not valid', () => {
    test.each(invalidObjects)('returns invalid et Id message', (invalidId) => {
      expect(() => validateAndParse<SWBIdType>(zodParser, invalidId)).toThrowError('id: Invalid ID');
    });
  });
});

describe('zod.optionalNonEmpty', () => {
  const zodParser = z.object({
    id: z.string().optionalNonEmpty()
  });
  type OptionalNonEmpType = z.infer<typeof zodParser>;

  describe('is valid', () => {
    const validObjects = [{ id: 'nonEmptyId' }, { id: undefined }, {}];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<OptionalNonEmpType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('is not valid', () => {
    const invalidObject = { id: '' };
    test('returns nonEmpty message', () => {
      expect(() => validateAndParse<OptionalNonEmpType>(zodParser, invalidObject)).toThrowError(
        `id: ${nonEmptyMessage}`
      );
    });
  });
});

describe('tests for zod.sshKeyId', () => {
  const zodParser = z.object({
    id: z.string().sshKeyId()
  });
  type SshKeyIdType = z.infer<typeof zodParser>;
  const randomUuid = '1234567812345678123456781234567812345678123456781234567812345678';

  describe('when input is valid', () => {
    const validObjects = [{ id: `sshkey-${randomUuid}` }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<SshKeyIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when contains invalid char', () => {
      const invalidObjects: SshKeyIdType[] = [
        { id: `invalid-${randomUuid}` }, //invalid prefix
        { id: 'sshkey-invalid-uuid' }, //invalid uuid format
        { id: `sshkey-${randomUuid}#ProjAdmin` }, //invalid uuid format
        { id: '' } //empty value
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<SshKeyIdType>(zodParser, invalidObject)).toThrowError(
          `${invalidIdMessage}`
        );
      });
    });
  });
});

describe('tests for zod.userId', () => {
  const zodParser = z.object({
    id: z.string().userId()
  });
  type UserIdType = z.infer<typeof zodParser>;
  const randomUuid = '6d4e4f5b-8121-4bfb-b2c1-68b133177bbb';

  describe('when input is valid', () => {
    const validObjects = [{ id: randomUuid }];
    test.each(validObjects)('returns valid Id', (validObject) => {
      expect(validateAndParse<UserIdType>(zodParser, validObject)).toEqual(validObject);
    });
  });

  describe('when input is not valid', () => {
    describe('when contains invalid char', () => {
      const invalidObjects: UserIdType[] = [
        { id: `invalid-${randomUuid}` }, //invalid prefix
        { id: 'sshkey-invalid-uuid' }, //invalid uuid format
        { id: `${randomUuid}-0000` }, //invalid uuid format
        { id: '' } //empty value
      ];
      test.each(invalidObjects)('returns required message', (invalidObject) => {
        expect(() => validateAndParse<UserIdType>(zodParser, invalidObject)).toThrowError(
          `${invalidIdMessage}`
        );
      });
    });
  });
});
