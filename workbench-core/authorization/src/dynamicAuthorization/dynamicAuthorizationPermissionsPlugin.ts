import {
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/createIdentityPermissions';
import {
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse
} from './dynamicAuthorizationInputs/deleteIdentityPermissions';
import {
  GetDynamicOperationsByRouteRequest,
  GetDynamicOperationsByRouteResponse
} from './dynamicAuthorizationInputs/getDynamicOperationsByRoute';
import {
  GetIdentityPermissionsByIdentityRequest,
  GetIdentityPermissionsByIdentityResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsByIdentity';
import {
  GetIdentityPermissionsBySubjectRequest,
  GetIdentityPermissionsBySubjectResponse
} from './dynamicAuthorizationInputs/getIdentityPermissionsBySubject';
import { IsRouteIgnoredRequest, IsRouteIgnoredResponse } from './dynamicAuthorizationInputs/isRouteIgnored';
import {
  IsRouteProtectedRequest,
  IsRouteProtectedResponse
} from './dynamicAuthorizationInputs/isRouteProtected';

export interface DynamicAuthorizationPermissionsPlugin {
  /**
   * Check if a route is ignored
   * @param isRouteIgnoredRequest - {@link IsRouteIgnoredRequest}
   *
   * @returns - {@link IsRouteIgnoredResponse}
   */
  isRouteIgnored(isRouteIgnoredRequest: IsRouteIgnoredRequest): Promise<IsRouteIgnoredResponse>;

  /**
   * Check if a route is protected
   * @param isRouteProtectedRequest - {@link IsRouteProtectedRequest}
   *
   * @returns - {@link IsRouteProtectedResponse}
   */
  isRouteProtected(isRouteProtectedRequest: IsRouteProtectedRequest): Promise<IsRouteProtectedResponse>;

  /**
   * Get a list of {@link DynamicOperation}s associated to the route
   * @param getDynamicOperationsByRouteRequest - {@link GetDynamicOperationsByRouteRequest}
   *
   * @returns - {@link GetDynamicOperationsByRouteResponse}
   */
  getDynamicOperationsByRoute(
    getDynamicOperationsByRouteRequest: GetDynamicOperationsByRouteRequest
  ): Promise<GetDynamicOperationsByRouteResponse>;

  /**
   * Get a list of identity permissions associated to the {@link Identity}
   * @param getIdentityPermissionsByIdentityRequest - {@link GetIdentityPermissionsByIdentityRequest}
   *
   * @returns - {@link GetIdentityPermissionsByIdentityResponse}
   */
  getIdentityPermissionsByIdentity(
    getIdentityPermissionsByIdentityRequest: GetIdentityPermissionsByIdentityRequest
  ): Promise<GetIdentityPermissionsByIdentityResponse>;

  /**
   * Get all identity permissions associated to a specific subject
   * @param getIdentityPermissionsBySubjectRequest - {@link GetIdentityPermissionsBySubjectRequest}
   *
   * @returns - {@link GetIdentityPermissionsBySubjectResponse}
   */
  getIdentityPermissionsBySubject(
    getIdentityPermissionsBySubjectRequest: GetIdentityPermissionsBySubjectRequest
  ): Promise<GetIdentityPermissionsBySubjectResponse>;

  /**
   * Create identity permissions, limited to 100 identity permissions
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsResponse}
   */
  createIdentityPermissions(
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse>;

  /**
   * Delete identity permissions, limited to 100 identity permissions
   * @param deleteIdentityPermissionsRequest - {@link DeleteIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  deleteIdentityPermissions(
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse>;
}
