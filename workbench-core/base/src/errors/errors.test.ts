/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { InvalidPaginationTokenError, isInvalidPaginationTokenError } from './invalidPaginationTokenError';

describe('custom error tests', () => {
  test('invalidPaginationTokenError', () => {
    const invalidPaginationTokenError = new InvalidPaginationTokenError();
    expect(isInvalidPaginationTokenError(invalidPaginationTokenError)).toBe(true);
  });

  describe('is not *Error', () => {
    let error: Error;

    beforeEach(() => {
      error = new Error();
    });

    test('not invalidPaginationTokenError', () => {
      expect(isInvalidPaginationTokenError(error)).toBe(false);
    });
  });
});
