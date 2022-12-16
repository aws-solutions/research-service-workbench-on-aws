import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import { GetGroupStatusRequest, GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import {
  IsUserAssignedToGroupRequest,
  IsUserAssignedToGroupResponse
} from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import {
  RemoveUserFromGroupRequest,
  RemoveUserFromGroupResponse
} from './dynamicAuthorizationInputs/removeUserFromGroup';
import { SetGroupStatusRequest, SetGroupStatusResponse } from './dynamicAuthorizationInputs/setGroupStatus';

/**
 * Implement the `GroupManagementPlugin` interface to connect the DynamicAuthorizationService
 * to an Identity Provider or other datastore for group management.
 */
export interface GroupManagementPlugin {
  /**
   * Create a new group
   *
   * @param request - {@link CreateGroupRequest}
   *
   * @returns a {@link CreateGroupResponse}
   */
  createGroup(request: CreateGroupRequest): Promise<CreateGroupResponse>;

  /**
   * Delete a group
   *
   * @param request - {@link DeleteGroupRequest}
   *
   * @returns a {@link DeleteGroupResponse}
   */
  deleteGroup(request: DeleteGroupRequest): Promise<DeleteGroupResponse>;

  /**
   * Get the groups a user is in
   *
   * @param request - {@link GetUserGroupsRequest}
   *
   * @returns a {@link GetUserGroupsResponse}
   */
  getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse>;

  /**
   * Get the users of a group
   *
   * @param request - {@link GetGroupUsersRequest}
   *
   * @returns a {@link GetGroupUsersResponse}
   */
  getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse>;

  /**
   * Add a user to a group
   *
   * @param request - {@link AddUserToGroupRequest}
   *
   * @returns a {@link AddUserToGroupResponse}
   */
  addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse>;

  /**
   * Check if a user is in a group
   *
   * @param request - {@link IsUserAssignedToGroupRequest}
   *
   * @returns a {@link IsUserAssignedToGroupResponse}
   */
  isUserAssignedToGroup(request: IsUserAssignedToGroupRequest): Promise<IsUserAssignedToGroupResponse>;

  /**
   * Remove a user from a group
   *
   * @param request - {@link RemoveUserFromGroupRequest}
   *
   * @returns a {@link RemoveUserFromGroupResponse}
   */
  removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse>;

  /**
   * Get the status of the group
   *
   * @param request - {@link GetGroupStatusRequest}
   *
   * @returns a {@link GetGroupStatusResponse}
   */
  getGroupStatus(request: GetGroupStatusRequest): Promise<GetGroupStatusResponse>;

  /**
   * Set the status of the group
   *
   * @param request - {@link SetGroupStatusRequest}
   *
   * @returns a {@link SetGroupStatusResponse}
   */
  setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse>;
}
