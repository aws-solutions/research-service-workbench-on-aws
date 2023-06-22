/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export { default as PermissionsPlugin } from './permissionsPlugin';
export { default as Operation } from './models/operation';
export { default as AuthorizationPlugin } from './authorizationPlugin';
export { default as StaticPermissionsPlugin } from './staticPermissionsPlugin';
export { default as CASLAuthorizationPlugin } from './caslAuthorizationPlugin';
export { default as Permission, PermissionsMap } from './models/permission';
export { Effect } from './models/effect';
export { Action } from './models/action';
export {
  default as RoutesMap,
  HTTPMethod,
  HTTPMethodParser,
  RoutesIgnored,
  MethodToOperations,
  DynamicRoutesMap
} from './models/routesMap';
export { default as AuthorizationService } from './authorizationService';
export { default as withAuth, retrieveUser } from './authorizationMiddleware';
export { default as withDynamicAuth } from './dynamicAuthorization/dynamicAuthorizationMiddleware';
export { AuthenticatedUser, AuthenticatedUserParser } from './models/authenticatedUser';
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
export { RetryError, isRetryError } from './errors/retryError';
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
export { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorization/models/addUserToGroup';
export { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorization/models/createGroup';
export {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsRequestParser,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorization/models/createIdentityPermissions';
export { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorization/models/deleteGroup';
export {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsRequestParser,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorization/models/deleteIdentityPermissions';

export {
  DeleteSubjectIdentityPermissionsRequest,
  DeleteSubjectIdentityPermissionsRequestParser,
  DeleteSubjectIdentityPermissionsResponse
} from './dynamicAuthorization/models/deleteSubjectIdentityPermissions';
export {
  DoesGroupExistRequest,
  DoesGroupExistRequestParser,
  DoesGroupExistResponse
} from './dynamicAuthorization/models/doesGroupExist';
export { DynamicOperation } from './dynamicAuthorization/models/dynamicOperation';
export {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteRequestParser,
  GetDynamicOperationsByRouteResponse
} from './dynamicAuthorization/models/getDynamicOperationsByRoute';
export { GetGroupStatusRequest, GetGroupStatusResponse } from './dynamicAuthorization/models/getGroupStatus';
export { GetGroupUsersRequest, GetGroupUsersResponse } from './dynamicAuthorization/models/getGroupUsers';
export {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityRequestParser,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorization/models/getIdentityPermissionsByIdentity';
export {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectRequestParser,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorization/models/getIdentityPermissionsBySubject';
export { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicAuthorization/models/getUserGroups';
export {
  Identity,
  IdentityPermission,
  IdentityPermissionParser,
  IdentityType,
  JSONValueParser
} from './dynamicAuthorization/models/identityPermission';
export { IsAuthorizedOnRouteRequest } from './dynamicAuthorization/models/isAuthorizedOnRoute';
export {
  IsAuthorizedOnSubjectRequest,
  IsAuthorizedOnSubjectRequestParser
} from './dynamicAuthorization/models/isAuthorizedOnSubject';
export {
  IsRouteIgnoredRequest,
  IsRouteIgnoredRequestParser,
  IsRouteIgnoredResponse
} from './dynamicAuthorization/models/isRouteIgnored';
export {
  IsRouteProtectedRequest,
  IsRouteProtectedRequestParser,
  IsRouteProtectedResponse
} from './dynamicAuthorization/models/isRouteProtected';
export {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorization/models/isUserAssignedToGroup';
export {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorization/models/removeUserFromGroup';
export { SetGroupStatusRequest, SetGroupStatusResponse } from './dynamicAuthorization/models/setGroupStatus';
export {
  GetGroupMetadata,
  GetGroupMetadataParser,
  GetGroupStatus
} from './dynamicAuthorization/models/GetGroupMetadata';
export {
  SetGroupMetadata,
  SetGroupMetadataParser,
  SetGroupStatus
} from './dynamicAuthorization/models/SetGroupMetadata';

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
