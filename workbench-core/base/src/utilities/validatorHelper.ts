/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { z, ZodString, ZodTypeAny } from 'zod';
import {
  nonHTMLValidChar,
  nonHtmlRegExp,
  swbNameValidChar,
  swbNameRegExp,
  swbDescriptionRegExp,
  swbDescriptionValidChar,
  swbDescriptionMaxLength,
  swbNameMaxLength,
  uuidWithLowercasePrefixRegExp,
  etIdRegex,
  etcIdRegex,
  nonEmptyMessage,
  invalidIdMessage,
  requiredMessage,
  lengthValidationMessage
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
    swbDescription: () => ZodString;
    etId: () => ZodString;
    etcId: () => ZodString;
    nonEmpty: () => ZodString;
  }
}

z.ZodString.prototype.required = function (): ZodString {
  return this.min(1, { message: requiredMessage });
};

z.ZodString.prototype.swbId = function (prefix: string): ZodString {
  return this.regex(uuidWithLowercasePrefixRegExp(prefix), { message: invalidIdMessage });
};

z.ZodString.prototype.nonHTML = function (): ZodString {
  return this.regex(nonHtmlRegExp(), { message: nonHTMLValidChar });
};

z.ZodString.prototype.swbName = function (): ZodString {
  return this.max(swbNameMaxLength, {
    message: lengthValidationMessage(swbNameMaxLength)
  }).regex(swbNameRegExp(), { message: swbNameValidChar });
};

z.ZodString.prototype.swbDescription = function (): ZodString {
  return this.max(swbDescriptionMaxLength, {
    message: lengthValidationMessage(swbDescriptionMaxLength)
  }).regex(swbDescriptionRegExp(), { message: swbDescriptionValidChar });
};

z.ZodString.prototype.etId = function (): ZodString {
  return this.regex(etIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.etcId = function (): ZodString {
  return this.regex(etcIdRegex(), { message: invalidIdMessage });
};

z.ZodString.prototype.nonEmpty = function (): ZodString {
  return this.min(1, { message: nonEmptyMessage });
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
