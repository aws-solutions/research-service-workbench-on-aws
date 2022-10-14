/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { EndPointExistsError, isEndPointExistsError } from './endPointExistsError';
import { InvalidIamRoleError, isInvalidIamRoleError } from './invalidIamRoleError';
import { isRoleExistsOnEndpointError, RoleExistsOnEndpointError } from './roleExistsOnEndpointError';

const error = new Error();

describe('custom error tests', () => {
  test('endPointExistsError', () => {
    const endPointExistsError = new EndPointExistsError();

    expect(isEndPointExistsError(endPointExistsError)).toBe(true);
  });
  test('not endPointExistsError', () => {
    expect(isEndPointExistsError(error)).toBe(false);
  });

  test('RoleExistsOnEndPointError', () => {
    const roleExistsOnEndPointError = new RoleExistsOnEndpointError();

    expect(isRoleExistsOnEndpointError(roleExistsOnEndPointError)).toBe(true);
  });
  test('not RoleExistsOnEndPointError', () => {
    expect(isRoleExistsOnEndpointError(error)).toBe(false);
  });

  test('InvalidIamRoleError', () => {
    const invalidIamRoleError = new InvalidIamRoleError();

    expect(isInvalidIamRoleError(invalidIamRoleError)).toBe(true);
  });
  test('not InvalidIamRoleError', () => {
    expect(isInvalidIamRoleError(error)).toBe(false);
  });
});
