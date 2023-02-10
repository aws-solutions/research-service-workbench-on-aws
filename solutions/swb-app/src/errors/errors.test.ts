/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ConflictError, isConflictError } from './conflictError';
import { DatabaseError, isDatabaseError } from './databaseError';
import { isNoKeyExistsError, NoKeyExistsError } from './noKeyExistsError';
import { isNonUniqueKeyError, NonUniqueKeyError } from './nonUniqueKeyError';

describe('custom error tests', () => {
  test('databaseError', () => {
    const databaseError = new DatabaseError();
    expect(isDatabaseError(databaseError)).toBe(true);
  });

  test('noKeyExistsError', () => {
    const noKeyExistsError = new NoKeyExistsError();
    expect(isNoKeyExistsError(noKeyExistsError)).toBe(true);
  });

  test('nonUniqueKeyError', () => {
    const nonUniqueKeyError = new NonUniqueKeyError();
    expect(isNonUniqueKeyError(nonUniqueKeyError)).toBe(true);
  });

  test('conflictError', () => {
    const conflictError = new ConflictError();
    expect(isConflictError(conflictError)).toBe(true);
  });

  describe('is not *Error', () => {
    let error: Error;

    beforeEach(() => {
      error = new Error();
    });

    test('not databaseError', () => {
      expect(isDatabaseError(error)).toBe(false);
    });

    test('not noKeyExistsError', () => {
      expect(isNoKeyExistsError(error)).toBe(false);
    });

    test('not nonUniqueKeyError', () => {
      expect(isNonUniqueKeyError(error)).toBe(false);
    });

    test('not conflictError', () => {
      expect(isConflictError(error)).toBe(false);
    });
  });
});
