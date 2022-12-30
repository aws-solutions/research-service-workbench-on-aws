/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { default as PermissionsPlugin } from './permissionsPlugin';
export { default as Operation } from './operation';
export { default as AuthorizationPlugin } from './authorizationPlugin';
export { default as StaticPermissionsPlugin } from './staticPermissionsPlugin';
export { default as CASLAuthorizationPlugin } from './caslAuthorizationPlugin';
export { default as Permission, PermissionsMap } from './permission';
export { Effect } from './effect';
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
export { GroupAlreadyExistsError, isGroupAlreadyExistsError } from './errors/groupAlreadyExistsError';
export { GroupNotFoundError, isGroupNotFoundError } from './errors/groupNotFoundError';
export { ThroughputExceededError, isThroughputExceededError } from './errors/throughputExceededError';
export {
  IdentityPermissionCreationError,
  isIdentityPermissionCreationError
} from './errors/identityPermissionCreationError';

// dynamic authorization
export { WBCGroupManagementPlugin } from './dynamicAuthorization/wbcGroupManagementPlugin';
export { GroupManagementPlugin } from './dynamicAuthorization/groupManagementPlugin';
export { DynamicAuthorizationService } from './dynamicAuthorization/dynamicAuthorizationService';
export { DynamicAuthorizationPermissionsPlugin } from './dynamicAuthorization/dynamicAuthorizationPermissionsPlugin';
export { DDBDynamicAuthorizationPermissionsPlugin } from './dynamicAuthorization/ddbDynamicAuthorizationPermissionsPlugin';
export {
  AddUserToGroupRequest,
  AddUserToGroupResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/addUserToGroup';
export {
  CreateGroupRequest,
  CreateGroupResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/createGroup';
export {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/createIdentityPermissions';
export {
  DeleteGroupRequest,
  DeleteGroupResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/deleteGroup';
export {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/deleteIdentityPermissions';
export {
  DoesGroupExistRequest,
  DoesGroupExistResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/doesGroupExist';
export { DynamicOperation } from './dynamicAuthorization/dynamicAuthorizationInputs/dynamicOperation';
export {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getDynamicOperationsByRoute';
export {
  GetGroupStatusRequest,
  GetGroupStatusResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getGroupStatus';
export {
  GetGroupUsersRequest,
  GetGroupUsersResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getGroupUsers';
export {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
export {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
export {
  GetUserGroupsRequest,
  GetUserGroupsResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/getUserGroups';
export {
  Identity,
  IdentityPermission,
  IdentityType
} from './dynamicAuthorization/dynamicAuthorizationInputs/identityPermission';
export { InitRequest, InitResponse } from './dynamicAuthorization/dynamicAuthorizationInputs/init';
export { IsAuthorizedOnRouteRequest } from './dynamicAuthorization/dynamicAuthorizationInputs/isAuthorizedOnRoute';
export { IsAuthorizedOnSubjectRequest } from './dynamicAuthorization/dynamicAuthorizationInputs/isAuthorizedOnSubject';
export {
  IsRouteIgnoredRequest,
  IsRouteIgnoredResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/isRouteIgnored';
export {
  IsRouteProtectedRequest,
  IsRouteProtectedResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/isRouteProtected';
export {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/isUserAssignedToGroup';
export {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/removeUserFromGroup';
export {
  SetGroupStatusRequest,
  SetGroupStatusResponse
} from './dynamicAuthorization/dynamicAuthorizationInputs/setGroupStatus';
export { GroupMetadata, GroupMetadataParser, GroupStatus } from './dynamicAuthorization/models/GroupMetadata';

// re-export userManagement package errors that are thrown
export {
  IdpUnavailableError,
  isIdpUnavailableError,
  PluginConfigurationError,
  isPluginConfigurationError,
  TooManyRequestsError,
  isTooManyRequestsError,
  UserNotFoundError,
  isUserNotFoundError
} from '@aws/workbench-core-user-management';
