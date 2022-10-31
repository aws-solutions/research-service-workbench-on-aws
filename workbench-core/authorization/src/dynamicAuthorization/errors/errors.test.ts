/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  BadConfigurationError,
  isBadConfigurationError,
  GroupAlreadyExistsError,
  isGroupAlreadyExistsError,
  GroupNotFoundError,
  isGroupNotFoundError,
  ThroughPutExceededError,
  isThroughPutExceededError
} from '../../';

const error = new Error();

describe('custom error tests', () => {
  test('badConfigurationError', () => {
    const badConfigurationError = new BadConfigurationError();

    expect(isBadConfigurationError(badConfigurationError)).toBe(true);
  });
  test('not badConfigurationError', () => {
    expect(isBadConfigurationError(error)).toBe(false);
  });
  test('groupAlreadyExistsError', () => {
    const groupAlreadyExistsError = new GroupAlreadyExistsError();
    expect(isGroupAlreadyExistsError(groupAlreadyExistsError)).toBe(true);
  });
  test('not groupAlreadyExistsError', () => {
    expect(isGroupAlreadyExistsError(error)).toBe(false);
  });
  test('groupNotFoundError', () => {
    const groupNotFoundError = new GroupNotFoundError();
    expect(isGroupNotFoundError(groupNotFoundError)).toBe(true);
  });
  test('not groupNotFoundError', () => {
    expect(isGroupNotFoundError(error)).toBe(false);
  });
  test('throughputExceededError', () => {
    const throughputExceededError = new ThroughPutExceededError();
    expect(isThroughPutExceededError(throughputExceededError)).toBe(true);
  });
  test('not throughputExceededError', () => {
    expect(isThroughPutExceededError(error)).toBe(false);
  });
});
