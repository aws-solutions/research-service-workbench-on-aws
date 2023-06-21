/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidAccountStateError, isInvalidAccountStateError } from './InvalidAccountStateError';
import { InvalidAwsAccountIdError, isInvalidAwsAccountIdError } from './InvalidAwsAccountIdError';

describe('custom error tests', () => {
  test('InvalidAwsAccountIdError', () => {
    const invalidAwsAccountIdError = new InvalidAwsAccountIdError();

    expect(isInvalidAwsAccountIdError(invalidAwsAccountIdError)).toBe(true);
  });

  describe('InvalidAccountStateError', () => {
    test('isInvalidAccountStateError is true when it is an InvalidAccountStateError', () => {
      const error = new InvalidAccountStateError();

      expect(isInvalidAccountStateError(error)).toBe(true);
    });

    test('isInvalidAccountStateError is true when it is not an InvalidAccountStateError', () => {
      const error = new Error();

      expect(isInvalidAccountStateError(error)).toBe(false);
    });
  });
});
