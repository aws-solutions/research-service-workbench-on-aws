/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AccountNotFoundError, isAccountNotFoundError } from './accountNotFoundError';
import { DataSetExistsError, isDataSetExistsError } from './dataSetExistsError';
import { DataSetHasEndpointError, isDataSetHasEndpointError } from './dataSetHasEndpointError';
import { DataSetInvalidParameterError, isDataSetInvalidParameterError } from './dataSetInvalidParameterError';
import { DataSetNotFoundError, isDataSetNotFoundError } from './dataSetNotFoundError';
import { EndpointExistsError, isEndpointExistsError } from './endpointExistsError';
import { EndpointNotFoundError, isEndpointNotFoundError } from './endpointNotFoundError';
import { InvalidArnError, isInvalidArnError } from './invalidArnError';
import { InvalidEndpointError, isInvalidEndpointError } from './invalidEndpointError';
import { InvalidIamRoleError, isInvalidIamRoleError } from './invalidIamRoleError';
import { InvalidPermissionError, isInvalidPermissionError } from './invalidPermissionError';
import { isNotAuthorizedError, NotAuthorizedError } from './notAuthorizedError';
import { isRoleExistsOnEndpointError, RoleExistsOnEndpointError } from './roleExistsOnEndpointError';
import { StorageNotFoundError, isStorageNotFoundError } from './storageNotFoundError';

const error = new Error();

describe('custom error tests', () => {
  test('dataSetHasEndpointError', () => {
    const dataSetHasEndpointError = new DataSetHasEndpointError();

    expect(isDataSetHasEndpointError(dataSetHasEndpointError)).toBe(true);
  });
  test('not dataSetHasEndpointError', () => {
    expect(isDataSetHasEndpointError(error)).toBe(false);
  });

  test('endpointExistsError', () => {
    const endpointExistsError = new EndpointExistsError();

    expect(isEndpointExistsError(endpointExistsError)).toBe(true);
  });
  test('not endpointExistsError', () => {
    expect(isEndpointExistsError(error)).toBe(false);
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

  test('EndpointNotFoundError', () => {
    const endpointNotFoundError = new EndpointNotFoundError();

    expect(isEndpointNotFoundError(endpointNotFoundError)).toBe(true);
  });
  test('not EndpointNotFoundError', () => {
    expect(isEndpointNotFoundError(error)).toBe(false);
  });

  test('DataSetExistsError', () => {
    const dataSetExistsError = new DataSetExistsError();

    expect(isDataSetExistsError(dataSetExistsError)).toBe(true);
  });
  test('not DataSetExistsError', () => {
    expect(isDataSetExistsError(error)).toBe(false);
  });

  test('InvalidEndpointError', () => {
    const invalidEndpointError = new InvalidEndpointError();

    expect(isInvalidEndpointError(invalidEndpointError)).toBe(true);
  });

  test('not InvalidEndpointError', () => {
    expect(isInvalidEndpointError(error)).toBe(false);
  });

  test('DataSetNotFoundError', () => {
    const dataSetNotFoundError = new DataSetNotFoundError();

    expect(isDataSetNotFoundError(dataSetNotFoundError)).toBe(true);
  });
  test('not DataSetNotFoundError', () => {
    expect(isDataSetNotFoundError(error)).toBe(false);
  });

  test('InvalidArnError', () => {
    const invalidArnError = new InvalidArnError();

    expect(isInvalidArnError(invalidArnError)).toBe(true);
  });
  test('not InvalidArnError', () => {
    expect(isInvalidArnError(error)).toBe(false);
  });

  test('DataSetInvalidParameterError', () => {
    const dataSetInvalidParameterError = new DataSetInvalidParameterError();

    expect(isDataSetInvalidParameterError(dataSetInvalidParameterError)).toBe(true);
  });
  test('not DataSetInvalidParameterError', () => {
    expect(isDataSetInvalidParameterError(error)).toBe(false);
  });

  test('StorageNotFoundError', () => {
    const storageNotFoundError = new StorageNotFoundError();

    expect(isStorageNotFoundError(storageNotFoundError)).toBe(true);
  });
  test('not StorageNotFoundError', () => {
    expect(isStorageNotFoundError(error)).toBe(false);
  });

  test('AccountNotFoundError', () => {
    const accountNotFoundError = new AccountNotFoundError();

    expect(isAccountNotFoundError(accountNotFoundError)).toBe(true);
  });
  test('not AccountNotFoundError', () => {
    expect(isAccountNotFoundError(error)).toBe(false);
  });
});
