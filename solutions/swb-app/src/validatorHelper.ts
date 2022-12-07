/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as Boom from '@hapi/boom';
import { ValidatorResult } from 'jsonschema';
import { ZodTypeAny } from 'zod';

function processValidatorResult(validatorResult: ValidatorResult): void {
  if (!validatorResult.valid) {
    throw Boom.badRequest(
      validatorResult.errors
        .map((error) => {
          const messageWithoutQuotes = error.toString().replace(/"/g, "'");
          return messageWithoutQuotes.replace(/instance[.]{0,1}/g, '').trim();
        })
        .reduce((fullMessage, message) => {
          return `${fullMessage}. ${message}`;
        })
    );
  }
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

export { processValidatorResult, validateAndParse };
