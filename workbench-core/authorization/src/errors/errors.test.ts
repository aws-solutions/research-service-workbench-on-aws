/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AuthenticatedUserNotFoundError,
  isAuthenticatedUserNotFoundError
} from './authenticatedUserNotFoundError';
import { ForbiddenError, isForbiddenError } from './forbiddenError';
import { GroupAlreadyExistsError, isGroupAlreadyExistsError } from './groupAlreadyExistsError';
import { GroupNotFoundError, isGroupNotFoundError } from './groupNotFoundError';
import {
  IdentityPermissionCreationError,
  isIdentityPermissionCreationError
} from './identityPermissionCreationError';
import { isParamNotFoundError, ParamNotFoundError } from './paramNotFoundError';
import { isPermissionNotGrantedError, PermissionNotGrantedError } from './permissionNotGrantedError';
import { isRetryError, RetryError } from './retryError';
import { isRouteMapError, RouteMapError } from './routeMapError';
import { isRouteNotFoundError, RouteNotFoundError } from './routeNotFoundError';
import { isRouteNotSecuredError, RouteNotSecuredError } from './routeNotSecuredError';
import { isThroughputExceededError, ThroughputExceededError } from './throughputExceededError';

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

  test('GroupAlreadyExistsError', () => {
    const groupAlreadyExistsError = new GroupAlreadyExistsError();
    expect(isGroupAlreadyExistsError(groupAlreadyExistsError)).toBe(true);
  });
  test('not GroupAlreadyExistsError', () => {
    expect(isGroupAlreadyExistsError(error)).toBe(false);
  });

  test('GroupNotFoundError', () => {
    const groupNotFoundError = new GroupNotFoundError();
    expect(isGroupNotFoundError(groupNotFoundError)).toBe(true);
  });
  test('not GroupNotFoundError', () => {
    expect(isGroupNotFoundError(error)).toBe(false);
  });

  test('IdentityPermissionCreationError', () => {
    const identityPermissionCreationError = new IdentityPermissionCreationError();
    expect(isIdentityPermissionCreationError(identityPermissionCreationError)).toBe(true);
  });
  test('not IdentityPermissionCreationError', () => {
    expect(isIdentityPermissionCreationError(error)).toBe(false);
  });

  test('ThroughputExceededError', () => {
    const throughputExceededError = new ThroughputExceededError();
    expect(isThroughputExceededError(throughputExceededError)).toBe(true);
  });
  test('not ThroughputExceededError', () => {
    expect(isThroughputExceededError(error)).toBe(false);
  });

  test('RetryError', () => {
    const retryError = new RetryError();
    expect(isRetryError(retryError)).toBe(true);
  });
  test('not RetryError', () => {
    expect(isRetryError(error)).toBe(false);
  });

  test('RouteNotFoundError', () => {
    const routeNotFoundError = new RouteNotFoundError();
    expect(isRouteNotFoundError(routeNotFoundError)).toBe(true);
  });
  test('not RouteNotFoundError', () => {
    expect(isRouteNotFoundError(error)).toBe(false);
  });

  test('RouteMapError', () => {
    const routeMapError = new RouteMapError();
    expect(isRouteMapError(routeMapError)).toBe(true);
  });
  test('not RouteMapError', () => {
    expect(isRouteMapError(error)).toBe(false);
  });

  test('ParamNotFoundError', () => {
    const paramNotFoundError = new ParamNotFoundError();
    expect(isParamNotFoundError(paramNotFoundError)).toBe(true);
  });
  test('not ParamNotFoundError', () => {
    expect(isParamNotFoundError(error)).toBe(false);
  });
});
