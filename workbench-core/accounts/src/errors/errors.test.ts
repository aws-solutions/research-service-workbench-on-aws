/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidAwsAccountIdError, isInvalidAwsAccountIdError } from './InvalidAwsAccountIdError';

describe('custom error tests', () => {
  test('InvalidAwsAccountIdError', () => {
    const invalidAwsAccountIdError = new InvalidAwsAccountIdError();

    expect(isInvalidAwsAccountIdError(invalidAwsAccountIdError)).toBe(true);
  });
});
