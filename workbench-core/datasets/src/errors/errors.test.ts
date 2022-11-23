/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DataSetHasEndpointError,
  isDataSetHasEndpointError,
  EndPointExistsError,
  isEndPointExistsError,
  isRoleExistsOnEndpointError,
  RoleExistsOnEndpointError
} from '../';

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
});
