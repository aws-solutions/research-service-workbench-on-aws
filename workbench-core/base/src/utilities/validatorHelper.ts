/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { z, ZodString, ZodTypeAny } from 'zod';
import {
  nonHtmlRegExp,
  swbNameRegExp,
  swbDescriptionRegExp,
  swbDescriptionMaxLength,
  swbNameMaxLength,
  uuidWithLowercasePrefixRegExp
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
  }
}

z.ZodString.prototype.required = function (): ZodString {
  return this.min(1, { message: 'Required' });
};

z.ZodString.prototype.swbId = function (prefix: string): ZodString {
  return this.regex(uuidWithLowercasePrefixRegExp(prefix), { message: 'Invalid ID' });
};

z.ZodString.prototype.nonHTML = function (): ZodString {
  return this.regex(nonHtmlRegExp(), { message: 'Input contains HTML' });
};

z.ZodString.prototype.swbName = function (): ZodString {
  return this.max(swbNameMaxLength, {
    message: `Input must be less than ${swbNameMaxLength} characters`
  }).regex(swbNameRegExp(), { message: 'invalid input characters' });
};

z.ZodString.prototype.swbDescription = function (): ZodString {
  return this.max(swbDescriptionMaxLength, {
    message: `Input must be less than ${swbDescriptionMaxLength} characters`
  }).regex(swbDescriptionRegExp(), { message: 'invalid input characters' });
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
