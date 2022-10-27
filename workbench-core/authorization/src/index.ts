/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { default as PermissionsPlugin } from './permissionsPlugin';
export { Operation, DynamicOperation } from './operation';
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

export {
  BadConfigurationError,
  isBadConfigurationError
} from './dynamicAuthorization/errors/badConfigurationError';
export {
  GroupAlreadyExistsError,
  isGroupAlreadyExistsError
} from './dynamicAuthorization/errors/groupAlreadyExistsError';
export { GroupNotFoundError, isGroupNotFoundError } from './dynamicAuthorization/errors/groupNotFoundError';
export {
  ThroughPutExceededError,
  isThroughPutExceededError
} from './dynamicAuthorization/errors/throughputExceededError';

export {
  DynamicAuthorizationService,
  IsAuthorizedOnSubjectRequest
} from './dynamicAuthorization/dynamicAuthorizationService';
export { DynamicPermissionsPlugin } from './dynamicAuthorization/dynamicPermissionsPlugin';
export {
  CreateGroupRequest,
  CreateGroupResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  IdentityType,
  GetUserGroupsRequest,
  GetUserGroupsResponse,
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse,
  IdentityPermission,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse,
  AssignUserToGroupRequest,
  AssignUserToGroupResponse,
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse,
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse,
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs';
export {
  DynamoDBDynamicPermissionsPlugin,
  InitRequest,
  InitResponse
} from './dynamicAuthorization/dynamoDBDynamicPermissionsPlugin';
