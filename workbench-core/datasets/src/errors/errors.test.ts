/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetHasEndpointError, isDataSetHasEndpointError } from './dataSetHasEndpointError';
import { EndPointExistsError, isEndPointExistsError } from './endPointExistsError';
import { InvalidIamRoleError, isInvalidIamRoleError } from './invalidIamRoleError';
import { isNotAuthorizedError, NotAuthorizedError } from './notAuthorizedError';
import { InvalidPermissionError, isInvalidPermissionError } from './invalidPermissionError';
import { isRoleExistsOnEndpointError, RoleExistsOnEndpointError } from './roleExistsOnEndpointError';

const error = new Error();

describe('custom error tests', () => {
  test('dataSetHasEndpointError', () => {
    const dataSetHasEndpointError = new DataSetHasEndpointError();

    expect(isDataSetHasEndpointError(dataSetHasEndpointError)).toBe(true);
  });
  test('not dataSetHasEndpointError', () => {
    expect(isDataSetHasEndpointError(error)).toBe(false);
  });

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

  test('NotAuthorizedError', () => {
    const notAuthorizedError = new NotAuthorizedError();

    expect(isNotAuthorizedError(notAuthorizedError)).toBe(true);
  });
  test('not NotAuthorizedError', () => {
    expect(isNotAuthorizedError(error)).toBe(false);
  });
  
  test('InvalidPermissionError', () => {
    const invalidPermissionError = new InvalidPermissionError();

    expect(isInvalidPermissionError(invalidPermissionError)).toBe(true);
  });
  test('not InvalidPermissionError', () => {
    expect(isInvalidPermissionError(error)).toBe(false);
  });
});
