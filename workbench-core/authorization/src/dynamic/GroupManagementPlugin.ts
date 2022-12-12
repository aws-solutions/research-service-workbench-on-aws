import { AddUserToGroupRequest, AddUserToGroupResponse } from './inputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './inputs/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './inputs/deleteGroup';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './inputs/doesGroupExist';
import { GetGroupUsersRequest, GetGroupUsersResponse } from './inputs/getGroupUsers';
import { GetUserGroupsRequest, GetUserGroupsResponse } from './inputs/getUserGroups';
import { IsUserAssignedToGroupRequest, IsUserAssignedToGroupResponse } from './inputs/isUserAssignedToGroup';
import { RemoveUserFromGroupRequest, RemoveUserFromGroupResponse } from './inputs/removeUserFromGroup';
import { SetGroupStatusRequest, SetGroupStatusResponse } from './inputs/setGroupStatus';

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
   * Check if a group exists
   *
   * @param request - {@link DoesGroupExistRequest}
   *
   * @returns a {@link DoesGroupExistResponse}
   */
  doesGroupExist(request: DoesGroupExistRequest): Promise<DoesGroupExistResponse>;

  /**
   * Remove a user from a group
   *
   * @param request - {@link RemoveUserFromGroupRequest}
   *
   * @returns a {@link RemoveUserFromGroupResponse}
   */
  removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse>;

  /**
   * Set the status of the group
   *
   * @param request - {@link SetGroupStatusRequest}
   *
   * @returns a {@link SetGroupStatusResponse}
   */
  setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse>;
}
