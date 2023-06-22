/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { z, ZodString, ZodTypeAny, ZodOptional } from 'zod';
import {
  nonHTMLMessage,
  nonHtmlRegExp,
  swbNameMessage,
  swbNameRegExp,
  personNameRegExp,
  personNameMessage,
  personNameMaxLength,
  swbDescriptionRegExp,
  swbDescriptionMessage,
  swbDescriptionMaxLength,
  swbNameMaxLength,
  uuidWithLowercasePrefixRegExp,
  etIdRegex,
  awsAccountIdRegExp,
  awsAccountIdMessage,
  etcIdRegex,
  projIdRegex,
  envIdRegex,
  nonEmptyMessage,
  invalidIdMessage,
  requiredMessage,
  lengthValidationMessage,
  accountIdRegex,
  costCenterIdRegex,
  awsRegionRegex,
  awsRegionMessage,
  sshKeyIdRegex,
  userIdRegex,
  datasetIdRegex,
  envMgmtRoleArnRegExp,
  envMgmtRoleArnMessage,
  envMgmtRoleArnMaxLength,
  hostingAccountHandlerRoleArnMessage,
  hostingAccountHandlerRoleArnRegExp,
  externalIdMessage,
  externalIdRegExp,
  hostingAccountHandlerRoleArnMaxLength
} from './textUtil';

interface ZodPagination {
  pageSize: z.ZodOptional<z.ZodEffects<z.ZodString, number, string>>;
  paginationToken: z.ZodOptional<z.ZodString>;
}

declare module 'zod' {
  export interface ZodString {
    required: () => ZodString;
    swbId: (prefix: string) => ZodString;
    nonHTML: () => ZodString;
    swbName: () => ZodString;
    personName: () => ZodString;
    swbDescription: () => ZodString;
    etId: () => ZodString;
    etcId: () => ZodString;
    projId: () => ZodString;
    datasetId: () => ZodString;
    envId: () => ZodString;
    costCenterId: () => ZodString;
    accountId: () => ZodString;
    externalId: () => ZodString;
    awsRegion: () => ZodString;
    optionalNonEmpty: () => ZodOptional<ZodString>;
    awsAccountId: () => ZodString;
    envMgmtRoleArn: () => ZodString;
    hostingAccountHandlerRoleArn: () => ZodString;
    sshKeyId: () => ZodString;
    userId: () => ZodString;
  }
}

/**
 * validate the field is required with min length 1
 */
z.ZodString.prototype.required = function (): ZodString {
  return this.min(1, { message: requiredMessage });
};

z.ZodString.prototype.swbId = function (prefix: string): ZodString {
  return this.regex(uuidWithLowercasePrefixRegExp(prefix), { message: invalidIdMessage });
};

z.ZodString.prototype.nonHTML = function (): ZodString {
  return this.regex(nonHtmlRegExp(), { message: nonHTMLMessage });
};

z.ZodString.prototype.swbName = function (): ZodString {
  return this.max(swbNameMaxLength, {
    message: lengthValidationMessage(swbNameMaxLength)
  }).regex(swbNameRegExp(), { message: swbNameMessage });
};

z.ZodString.prototype.personName = function (): ZodString {
  return this.max(personNameMaxLength, {
    message: lengthValidationMessage(personNameMaxLength)
  }).regex(personNameRegExp(), { message: personNameMessage });
};

z.ZodString.prototype.swbDescription = function (): ZodString {
  return this.max(swbDescriptionMaxLength, {
    message: lengthValidationMessage(swbDescriptionMaxLength)
  }).regex(swbDescriptionRegExp(), { message: swbDescriptionMessage });
};

z.ZodString.prototype.etId = function (): ZodString {
  return this.regex(etIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.etcId = function (): ZodString {
  return this.regex(etcIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.projId = function (): ZodString {
  return this.regex(projIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.datasetId = function (): ZodString {
  return this.regex(datasetIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.envId = function (): ZodString {
  return this.regex(envIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.costCenterId = function (): ZodString {
  return this.regex(costCenterIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.accountId = function (): ZodString {
  return this.regex(accountIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.externalId = function (): ZodString {
  return this.regex(externalIdRegExp(), { message: externalIdMessage });
};

z.ZodString.prototype.sshKeyId = function (): ZodString {
  return this.regex(sshKeyIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.userId = function (): ZodString {
  return this.regex(userIdRegex(), { message: invalidIdMessage });
};

/**
 * validate the field is optional but should be nonEmpty with min length 1 if provided
 */
z.ZodString.prototype.optionalNonEmpty = function (): ZodOptional<ZodString> {
  // field should be nonEmpty but is optional
  return this.min(1, { message: nonEmptyMessage }).optional();
};

z.ZodString.prototype.awsAccountId = function (): ZodString {
  return this.regex(awsAccountIdRegExp(), { message: awsAccountIdMessage });
};

z.ZodString.prototype.envMgmtRoleArn = function (): ZodString {
  return this.max(envMgmtRoleArnMaxLength, {
    message: lengthValidationMessage(envMgmtRoleArnMaxLength)
  }).regex(envMgmtRoleArnRegExp(), { message: envMgmtRoleArnMessage });
};

z.ZodString.prototype.hostingAccountHandlerRoleArn = function (): ZodString {
  return this.max(hostingAccountHandlerRoleArnMaxLength, {
    message: lengthValidationMessage(hostingAccountHandlerRoleArnMaxLength)
  }).regex(hostingAccountHandlerRoleArnRegExp(), { message: hostingAccountHandlerRoleArnMessage });
};

z.ZodString.prototype.awsRegion = function (): ZodString {
  return this.regex(awsRegionRegex(), { message: awsRegionMessage });
};

function getPaginationParser(minPageSize: number = 1, maxPageSize: number = 100): ZodPagination {
  return {
    pageSize: z
      .string()
      .transform((pageSizeString, ctx) => {
        const pageSize = parseInt(pageSizeString);
        if (isNaN(pageSize)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: 'Must be a number'
          });

          return z.NEVER;
        }
        if (pageSize < minPageSize || pageSize > maxPageSize) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            message: `Must be Between ${minPageSize} and ${maxPageSize}`
          });

          return z.NEVER;
        }

        return parseInt(pageSizeString);
      })
      .optional(),
    paginationToken: z.string().optional()
  };
}

function validateAndParse<T>(parser: ZodTypeAny, data: unknown): T {
  const parsed = parser.safeParse(data);

  if (parsed.success) {
    return parsed.data;
  }

  const errorMessages = parsed.error.issues.map((issue) => {
    return `${issue.path.join('.')}: ${issue.message}`;
  });

  throw Boom.badRequest(
    errorMessages.reduce((fullMessage, message) => {
      return `${fullMessage}. ${message}`;
    })
  );
}

export { validateAndParse, getPaginationParser, z };
