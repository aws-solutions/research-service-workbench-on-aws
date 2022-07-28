/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthenticatedUserNotFoundError,
  isAuthenticatedUserNotFoundError,
  ForbiddenError,
  isForbiddenError,
  PermissionNotGrantedError,
  isPermissionNotGrantedError,
  RouteNotSecuredError,
  isRouteNotSecuredError
} from '../';

const error = new Error();

describe('custom error tests', () => {
  test('authenticatedUserNotFoundError', () => {
    const authenticatedUserNotFoundError = new AuthenticatedUserNotFoundError();

    expect(isAuthenticatedUserNotFoundError(authenticatedUserNotFoundError)).toBe(true);
  });
  test('not authenticatedUserNotFoundError', () => {
    expect(isAuthenticatedUserNotFoundError(error)).toBe(false);
  });
  test('forbiddenError', () => {
    const forbdiddenError = new ForbiddenError();
    expect(isForbiddenError(forbdiddenError)).toBe(true);
  });
  test('not forbiddenError', () => {
    expect(isForbiddenError(error)).toBe(false);
  });
  test('permissionNotGrantedError', () => {
    const permissionNotGrantedError = new PermissionNotGrantedError();
    expect(isPermissionNotGrantedError(permissionNotGrantedError)).toBe(true);
  });
  test('not permissonsNotGrantedError', () => {
    expect(isPermissionNotGrantedError(error)).toBe(false);
  });
  test('routeNotSecuredError', () => {
    const routeNotSecuredError = new RouteNotSecuredError();
    expect(isRouteNotSecuredError(routeNotSecuredError)).toBe(true);
  });
  test('not routeNotSecuredError', () => {
    expect(isRouteNotSecuredError(error)).toBe(false);
  });
});
