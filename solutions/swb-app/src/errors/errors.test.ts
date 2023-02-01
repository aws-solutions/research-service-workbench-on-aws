/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DatabaseError, isDatabaseError } from './databaseError';
import { isNoKeyExistsError, NoKeyExistsError } from './noKeyExistsError';
import { isNonUniqueKeyError, NonUniqueKeyError } from './nonUniqueKeyError';

describe('custom error tests', () => {
  let error: Error;

  beforeAll(() => {
    error = new Error();
  });

  test('databaseError', () => {
    const databaseError = new DatabaseError();
    expect(isDatabaseError(databaseError)).toBe(true);
  });

  test('not databaseError', () => {
    expect(isDatabaseError(error)).toBe(false);
  });

  test('noKeyExistsError', () => {
    const noKeyExistsError = new NoKeyExistsError();
    expect(isNoKeyExistsError(noKeyExistsError)).toBe(true);
  });

  test('not noKeyExistsError', () => {
    expect(isNoKeyExistsError(error)).toBe(false);
  });

  test('nonUniqueKeyError', () => {
    const nonUniqueKeyError = new NonUniqueKeyError();
    expect(isNonUniqueKeyError(nonUniqueKeyError)).toBe(true);
  });

  test('not nonUniqueKeyError', () => {
    expect(isNonUniqueKeyError(error)).toBe(false);
  });
});
