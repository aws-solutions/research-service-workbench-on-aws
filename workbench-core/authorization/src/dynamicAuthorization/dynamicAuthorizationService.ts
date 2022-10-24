import { Action } from '../action';
import { AuthenticatedUser } from '../authenticatedUser';
import {
  AssignUserToGroupRequest,
  AssignUserToGroupResponse,
  CreateGroupRequest,
  CreateGroupResponse,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DeleteGroupRequest,
  DeleteGroupResponse,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DeleteSubjectPermissionsRequest,
  DeleteSubjectPermissionsResponse,
  GetUserGroupsRequest,
  GetUserGroupsResponse,
  GetUsersFromGroupRequest,
  GetUsersFromGroupResponse,
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicPermissionsPluginInputs';

/**
 * Request object for DynamicAuthorizationService's isAuthorizedOnSubjectRequest
 */
export interface IsAuthorizedOnSubjectRequest {
  /**
   * The {@link Action} a {@link User} wants to perform.
   */
  action: Action;
  /**
   * The subject that the {@link Action} acts on.
   */
  subject: string;
  /**
   * subject id associated to the subject being operated on
   */
  subjectId: string;
  /**
   * The field a {@link User} wants access to.
   */
  field?: string;
  /**
   * Attributes associated to the subject
   */
  subjectAttributes?: { [key: string]: unknown };
}

export class DynamicAuthorizationService {
  /**
   * Checks whether a {@link AuthenticatedUser} is authorized to perform {@link isAuthorizedOnSubjectRequest}
   * @param user - {@link AuthenticatedUser}
   * @param isAuthorizedOnSubjectRequest - {@link IsAuthorizedOnSubjectRequest}
   *
   * @throws - {@link ForbiddenError} when {@link AuthenticatedUser} is not authorized.
   */
  public async isAuthorizedOnSubject(
    user: AuthenticatedUser,
    isAuthorizedOnSubjectRequest: IsAuthorizedOnSubjectRequest
  ): Promise<void> {
    throw new Error('NotImplemented');
  }
  /**
   * Create an authorization group
   * @param user - {@link AuthenticatedUser}
   * @param createGroupRequest - {@link CreateGroupRequest}
   *
   * @returns - {@link CreateGroupResponse}
   *
   * @throws - {@link GroupAlreadyExistsError} Can not create a group that already exists
   */
  public async createGroup(
    user: AuthenticatedUser,
    createGroupRequest: CreateGroupRequest
  ): Promise<CreateGroupResponse> {
    //Create Group

    //Create permissions associated
    throw new Error('NotImplemented');
  }
  /**
   * Delete an authorization group
   * @param user - {@link AuthenticatedUser}
   * @param deleteGroupRequest - {@link DeleteGroupRequest}
   *
   * @returns - {@link DeleteGroupResponse}
   */
  public async deleteGroup(
    user: AuthenticatedUser,
    deleteGroupRequest: DeleteGroupRequest
  ): Promise<DeleteGroupResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Create identity permissions
   * @param user - {@link AuthenticatedUser}
   * @param createIdentityPermissionsRequest - {@link CreateIdentityPermissionsRequest}
   *
   * @returns - {@link CreateIdentityPermissionsResponse}
   *
   * @throws - {@link IdentityPermissionAlreadyExistsError} Can not create an identity permission that already exists.
   */
  public async createIdentityPermissions(
    user: AuthenticatedUser,
    createIdentityPermissionsRequest: CreateIdentityPermissionsRequest
  ): Promise<CreateIdentityPermissionsResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Delete identity permissions
   * @param user - {@link AuthenticatedUser}
   * @param deleteIdentityPermissionsRequest - {@link DeleteIdentityPermissionsRequest}
   *
   * @returns - {@link DeleteIdentityPermissionsResponse}
   */
  public async deleteIdentityPermissions(
    user: AuthenticatedUser,
    deleteIdentityPermissionsRequest: DeleteIdentityPermissionsRequest
  ): Promise<DeleteIdentityPermissionsResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Delete all permissions associated to the subject
   * @param user - {@link AuthenticatedUser}
   * @param deleteSubjectPermissionsRequest - {@link DeleteSubjectPermissionsRequest}
   *
   * @returns - {@link DeleteSubjectPermissionsResponse}
   */
  public async deleteSubjectPermissions(
    user: AuthenticatedUser,
    deleteSubjectPermissionsRequest: DeleteSubjectPermissionsRequest
  ): Promise<DeleteSubjectPermissionsResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Assign a user to an authorization group
   * @param user - {@link AuthenticatedUser}
   * @param assignUserToGroupRequest - {@link AssignUserToGroupRequest}
   *
   * @returns - {@link AssignUserToGroupResponse}
   */
  public async assignUserToGroup(
    user: AuthenticatedUser,
    assignUserToGroupRequest: AssignUserToGroupRequest
  ): Promise<AssignUserToGroupResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Remove a user from an authorization group
   * @param user - {@link AuthenticatedUser}
   * @param removeUserFromGroupRequest - {@link RemoveUserFromGroupRequest}
   *
   * @returns - {@link RemoveUserFromGroupResponse}
   */
  public async removeUserFromGroup(
    user: AuthenticatedUser,
    removeUserFromGroupRequest: RemoveUserFromGroupRequest
  ): Promise<RemoveUserFromGroupResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Get all users associated to the group
   * @param user - {@link AuthenticatedUser}
   * @param getUsersFromGroupRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUsersFromGroupResponse}
   */
  public async getUsersFromGroup(
    user: AuthenticatedUser,
    getUsersFromGroupRequest: GetUsersFromGroupRequest
  ): Promise<GetUsersFromGroupResponse> {
    throw new Error('NotImplemented');
  }
  /**
   * Get all groups associated to the user
   * @param user - {@link AuthenticatedUser}
   * @param getUserGroupsRequest - {@link GetUserGroupsRequest}
   *
   * @returns - {@link GetUserGroupsResponse}
   */
  public async getUserGroups(
    user: AuthenticatedUser,
    getUserGroupsRequest: GetUserGroupsRequest
  ): Promise<GetUserGroupsResponse> {
    throw new Error('NotImplemented');
  }
}
