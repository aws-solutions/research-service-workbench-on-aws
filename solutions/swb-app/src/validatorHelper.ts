/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import Boom from '@hapi/boom';
import { ValidatorResult } from 'jsonschema';

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

export { processValidatorResult };
