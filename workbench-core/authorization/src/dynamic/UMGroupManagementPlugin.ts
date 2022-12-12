import { UserManagementService } from '@aws/workbench-core-authentication';

import { GroupManagementPlugin } from './GroupManagementPlugin';
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
 * A WBCGroupManagemntPlugin instance that interfaces with Workbench Core's UserManagementService to provide group management.
 */
export class WBCGroupManagemntPlugin implements GroupManagementPlugin {
  private _userManagementService: UserManagementService;

  constructor(userManagementService: UserManagementService) {
    this._userManagementService = userManagementService;
  }
  createGroup(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    throw new Error('Method not implemented.');
  }
  deleteGroup(request: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Method not implemented.');
  }
  getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    throw new Error('Method not implemented.');
  }
  getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    throw new Error('Method not implemented.');
  }
  addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    throw new Error('Method not implemented.');
  }
  isUserAssignedToGroup(request: IsUserAssignedToGroupRequest): Promise<IsUserAssignedToGroupResponse> {
    throw new Error('Method not implemented.');
  }
  doesGroupExist(request: DoesGroupExistRequest): Promise<DoesGroupExistResponse> {
    throw new Error('Method not implemented.');
  }
  removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse> {
    throw new Error('Method not implemented.');
  }
  setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse> {
    throw new Error('Method not implemented.');
  }
}
