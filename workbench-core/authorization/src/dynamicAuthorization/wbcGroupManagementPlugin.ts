import { UserManagementService } from '@aws/workbench-core-user-management';

import { AddUserToGroupRequest, AddUserToGroupResponse } from './dynamicAuthorizationInputs/addUserToGroup';
import { CreateGroupRequest, CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { DeleteGroupRequest, DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import { DoesGroupExistRequest, DoesGroupExistResponse } from './dynamicAuthorizationInputs/doesGroupExist';
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
import { GroupManagementPlugin } from './groupManagementPlugin';

/**
 * A WBCGroupManagementPlugin instance that interfaces with Workbench Core's UserManagementService to provide group management.
 */
export class WBCGroupManagemntPlugin implements GroupManagementPlugin {
  private _userManagementService: UserManagementService;

  public constructor(userManagementService: UserManagementService) {
    this._userManagementService = userManagementService;
  }
  public createGroup(request: CreateGroupRequest): Promise<CreateGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public deleteGroup(request: DeleteGroupRequest): Promise<DeleteGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public getUserGroups(request: GetUserGroupsRequest): Promise<GetUserGroupsResponse> {
    throw new Error('Method not implemented.');
  }
  public getGroupUsers(request: GetGroupUsersRequest): Promise<GetGroupUsersResponse> {
    throw new Error('Method not implemented.');
  }
  public async addUserToGroup(request: AddUserToGroupRequest): Promise<AddUserToGroupResponse> {
    const { groupId, userId } = request;

    try {
      await this._userManagementService.addUserToRole(userId, groupId);
      return { added: true };
    } catch (e) {
      // ToDo: Add logging
      return { added: false };
    }
  }
  public isUserAssignedToGroup(
    request: IsUserAssignedToGroupRequest
  ): Promise<IsUserAssignedToGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public doesGroupExist(request: DoesGroupExistRequest): Promise<DoesGroupExistResponse> {
    throw new Error('Method not implemented.');
  }
  public removeUserFromGroup(request: RemoveUserFromGroupRequest): Promise<RemoveUserFromGroupResponse> {
    throw new Error('Method not implemented.');
  }
  public getGroupStatus(request: GetGroupStatusRequest): Promise<GetGroupStatusResponse> {
    throw new Error('Method not implemented.');
  }
  public setGroupStatus(request: SetGroupStatusRequest): Promise<SetGroupStatusResponse> {
    throw new Error('Method not implemented.');
  }
}
