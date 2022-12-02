/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Boom from '@hapi/boom';
import { ZodTypeAny } from 'zod';

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

export { validateAndParse };
