/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuditIncompleteError, isAuditIncompleteError } from './auditIncompleteError';

const error = new Error();

describe('custom error tests', () => {
  test('AuditIncompleteError', () => {
    const auditIncompleteError = new AuditIncompleteError();

    expect(isAuditIncompleteError(auditIncompleteError)).toBe(true);
  });
  test('not AuditIncompleteError', () => {
    expect(isAuditIncompleteError(error)).toBe(false);
  });
});
