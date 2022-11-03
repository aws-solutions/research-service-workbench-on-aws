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
  CreateGroupResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/createGroup';
export {
  DeleteGroupRequest,
  DeleteGroupResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/deleteGroup';
export {
  IdentityType,
  IdentityPermission,
  Identity
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/identityPermission';
export {
  GetUserGroupsRequest,
  GetUserGroupsResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/getUserGroups';
export {
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/getUsersFromGroup';
export {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/createIdentityPermissions';
export {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/deleteIdentityPermissions';

export {
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/deleteSubjectPermissions';
export {
  AssignUserToGroupRequest,
  AssignUserToGroupResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/assignUserToGroup';
export {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/removeUserFromGroup';
export {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/getIdentityPermissionsBySubject';
export {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorization/dynamicPermissionsPluginInputs/getIdentityPermissionsByIdentity';
export {
  DynamoDBDynamicPermissionsPlugin,
  InitRequest,
  InitResponse
} from './dynamicAuthorization/dynamoDBDynamicPermissionsPlugin';
