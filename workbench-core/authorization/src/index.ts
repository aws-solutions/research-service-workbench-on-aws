/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { default as PermissionsPlugin } from './permissionsPlugin';
export { default as Operation } from './operation';
export { default as AuthorizationPlugin } from './authorizationPlugin';
export { default as StaticPermissionsPlugin } from './staticPermissionsPlugin';
export { default as CASLAuthorizationPlugin } from './caslAuthorizationPlugin';
export { default as Permission, PermissionsMap, Effect } from './permission';
export { Action } from './action';
export { default as RoutesMap, HTTPMethod, RoutesIgnored, MethodToOperations } from './routesMap';
export { default as AuthorizationService } from './authorizationService';
export { default as withAuth, retrieveUser } from './authorizationMiddleware';
export { AuthenticatedUser } from './authenticatedUser';
export { ForbiddenError, isForbiddenError } from './errors/forbiddenError';
export {
  AuthenticatedUserNotFoundError,
  isAuthenticatedUserNotFoundError
} from './errors/authenticatedUserNotFoundError';
export { PermissionNotGrantedError, isPermissionNotGrantedError } from './errors/permissionNotGrantedError';
export { RouteNotSecuredError, isRouteNotSecuredError } from './errors/routeNotSecuredError';
