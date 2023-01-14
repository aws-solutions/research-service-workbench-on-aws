/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  DynamoDBClient,
  GetItemCommand,
  ProvisionedThroughputExceededException,
  RequestLimitExceeded,
  ResourceNotFoundException,
  ServiceInputTypes,
  ServiceOutputTypes,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { DynamoDBService } from '@aws/workbench-core-base';
import {
  UserManagementService,
  UserManagementPlugin,
  PluginConfigurationError,
  IdpUnavailableError,
  RoleAlreadyExistsError,
  TooManyRequestsError,
  UserNotFoundError,
  RoleNotFoundError
} from '@aws/workbench-core-user-management';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { AuthenticatedUser } from '../authenticatedUser';
import { ForbiddenError } from '../errors/forbiddenError';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { DeleteGroupResponse } from './dynamicAuthorizationInputs/deleteGroup';
import { GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
import { GetGroupUsersResponse } from './dynamicAuthorizationInputs/getGroupUsers';
import { GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { IsUserAssignedToGroupResponse } from './dynamicAuthorizationInputs/isUserAssignedToGroup';
import { RemoveUserFromGroupResponse } from './dynamicAuthorizationInputs/removeUserFromGroup';
import { SetGroupStatusResponse } from './dynamicAuthorizationInputs/setGroupStatus';
import { GroupStatus } from './models/GroupMetadata';
import { WBCGroupManagementPlugin } from './wbcGroupManagementPlugin';

describe('WBCGroupManagemntPlugin', () => {
  let mockUserManagementPlugin: UserManagementPlugin;
  let ddbMock: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  let groupId: string;
  let userId: string;
  let status: GroupStatus;
  let mockUser: AuthenticatedUser;

  let wbcGroupManagementPlugin: WBCGroupManagementPlugin;

  beforeAll(() => {
    mockUserManagementPlugin = {
      getUser: jest.fn(),
      getUserRoles: jest.fn(),
      createUser: jest.fn(),
      updateUser: jest.fn(),
      deleteUser: jest.fn(),
      activateUser: jest.fn(),
      deactivateUser: jest.fn(),
      listUsers: jest.fn(),
      listUsersForRole: jest.fn(),
      listRoles: jest.fn(),
      addUserToRole: jest.fn(),
      removeUserFromRole: jest.fn(),
      createRole: jest.fn(),
      deleteRole: jest.fn()
    };
    ddbMock = mockClient(DynamoDBClient);
  });

  beforeEach(() => {
    groupId = 'groupId';
    userId = 'userId';
    status = 'active';
    mockUser = {
      id: 'sampleId',
      roles: []
    };

    wbcGroupManagementPlugin = new WBCGroupManagementPlugin({
      userManagementService: new UserManagementService(mockUserManagementPlugin),
      ddbService: new DynamoDBService({ region: 'region', table: 'fakeTable' }),
      userGroupKeyType: 'USERGROUP'
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    ddbMock.reset();
  });

  describe('createGroup', () => {
    it('returns the groupID in the data object when the group was successfully created', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      wbcGroupManagementPlugin.setGroupStatus = jest.fn();

      const response = await wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ data: { groupId } });
    });

    it('succesfully create a group even when userManagementPlugin throws RoleAlreadyExistsError', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new RoleAlreadyExistsError());
      wbcGroupManagementPlugin.setGroupStatus = jest.fn();
      const response = await wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser });
      expect(response).toMatchObject<CreateGroupResponse>({ data: { groupId } });
    });

    it('throws GroupAlreadyExistsError when the group is pending delete', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockReturnValue({ data: { status: 'delete_pending' } });

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupAlreadyExistsError);
    });

    it('throws GroupAlreadyExistsError when the group is active', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockReturnValue({ data: { status: 'active' } });

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupAlreadyExistsError);
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws TooManyRequestsError when the request is rate limited', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new TooManyRequestsError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(TooManyRequestsError);
    });

    it('rethrows an unexpected error', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new Error());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('deleteGroup', () => {
    it('returns the groupID in the data object when the group was successfully deleted', async () => {
      const response = await wbcGroupManagementPlugin.deleteGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<DeleteGroupResponse>({ data: { groupId } });
    });

    test.each([
      [IdpUnavailableError, new IdpUnavailableError('test error')],
      [PluginConfigurationError, new PluginConfigurationError('test error')],
      [GroupNotFoundError, new RoleNotFoundError('test error')],
      [TooManyRequestsError, new TooManyRequestsError('test error')],
      [Error, new Error('test error')]
    ])('throws exception %s when UserManagementService throws exception %s', async (expected, error) => {
      mockUserManagementPlugin.deleteRole = jest.fn().mockRejectedValue(error);

      await expect(
        wbcGroupManagementPlugin.deleteGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(expected);
    });
  });

  describe('getUserGroups', () => {
    it('returns an array of groupID in the data object that the requested user is in', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockResolvedValue([groupId]);
      const response = await wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetUserGroupsResponse>({ data: { groupIds: [groupId] } });
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws UserNotFoundError when the user doesnt exist', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockRejectedValue(new UserNotFoundError());

      await expect(
        wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws TooManyRequestsError when the request is rate limited', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockRejectedValue(new TooManyRequestsError());

      await expect(
        wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(TooManyRequestsError);
    });

    it('rethrows an unexpected error', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockRejectedValue(new Error());

      await expect(
        wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('getGroupUsers', () => {
    it('returns an array of userID in the data object for the requested group', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockResolvedValue([userId]);
      const response = await wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetGroupUsersResponse>({ data: { userIds: [userId] } });
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws GroupNotFoundError when the Group doesnt exist', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockRejectedValue(new RoleNotFoundError());

      await expect(
        wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });

    it('throws TooManyRequestsError when the request is rate limited', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockRejectedValue(new TooManyRequestsError());

      await expect(
        wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(TooManyRequestsError);
    });

    it('rethrows an unexpected error', async () => {
      mockUserManagementPlugin.listUsersForRole = jest.fn().mockRejectedValue(new Error());

      await expect(
        wbcGroupManagementPlugin.getGroupUsers({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('addUserToGroup', () => {
    beforeEach(() => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockReturnValue({ data: { status: 'active' } });
    });

    test('returns data about new group assignment on succesfull call', async () => {
      const { data } = await wbcGroupManagementPlugin.addUserToGroup({
        groupId,
        userId,
        authenticatedUser: mockUser
      });

      expect(data).toStrictEqual({ groupId, userId });
    });

    test('throws exception when group is in delete_pending state', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockReturnValue({ data: { status: 'delete_pending' } });

      await expect(
        wbcGroupManagementPlugin.addUserToGroup({
          groupId,
          userId,
          authenticatedUser: mockUser
        })
      ).rejects.toThrow(GroupNotFoundError);
    });

    test.each([
      [IdpUnavailableError, new IdpUnavailableError('test error')],
      [PluginConfigurationError, new PluginConfigurationError('test error')],
      [UserNotFoundError, new UserNotFoundError('test error')],
      [GroupNotFoundError, new RoleNotFoundError('test error')],
      [TooManyRequestsError, new TooManyRequestsError('test error')],
      [Error, new Error('test error')]
    ])('throws exception %s when UserManagementService throws exception %s', async (expected, error) => {
      mockUserManagementPlugin.addUserToRole = jest.fn().mockRejectedValue(error);

      await expect(
        wbcGroupManagementPlugin.addUserToGroup({
          groupId,
          userId,
          authenticatedUser: mockUser
        })
      ).rejects.toThrow(expected);
    });
  });

  describe('isUserAssignedToGroup', () => {
    it('returns true in the data object when the user is in the group', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockResolvedValue({ data: { groupIds: [groupId] } });
      const response = await wbcGroupManagementPlugin.isUserAssignedToGroup({
        userId,
        groupId,
        authenticatedUser: mockUser
      });

      expect(response).toMatchObject<IsUserAssignedToGroupResponse>({ data: { isAssigned: true } });
    });

    it('returns false in the data object when the user is not in the group', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockResolvedValue({ data: { groupIds: [groupId] } });
      const response = await wbcGroupManagementPlugin.isUserAssignedToGroup({
        userId,
        groupId: `${groupId}-not-in`,
        authenticatedUser: mockUser
      });

      expect(response).toMatchObject<IsUserAssignedToGroupResponse>({ data: { isAssigned: false } });
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.isUserAssignedToGroup({ userId, groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.isUserAssignedToGroup({ userId, groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws UserNotFoundError when the user doesnt exist', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new UserNotFoundError());

      await expect(
        wbcGroupManagementPlugin.isUserAssignedToGroup({ userId, groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws TooManyRequestsError when the request is rate limited', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new TooManyRequestsError());

      await expect(
        wbcGroupManagementPlugin.isUserAssignedToGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(TooManyRequestsError);
    });

    it('rethrows an unexpected error', async () => {
      wbcGroupManagementPlugin.getUserGroups = jest.fn().mockRejectedValue(new Error());

      await expect(
        wbcGroupManagementPlugin.isUserAssignedToGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('removeUserFromGroup', () => {
    it('returns the groupId and userId in the data object when the user was successfully removed', async () => {
      const response = await wbcGroupManagementPlugin.removeUserFromGroup({
        groupId,
        userId,
        authenticatedUser: mockUser
      });

      expect(response).toMatchObject<RemoveUserFromGroupResponse>({ data: { groupId, userId } });
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest
        .fn()
        .mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws GroupNotFoundError when the group doesnt exist', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest.fn().mockRejectedValue(new RoleNotFoundError());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupNotFoundError);
    });

    it('throws UserNotFoundError when the user doesnt exist', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest.fn().mockRejectedValue(new UserNotFoundError());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(UserNotFoundError);
    });

    it('throws TooManyRequestsError when the request is rate limited', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest.fn().mockRejectedValue(new TooManyRequestsError());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(TooManyRequestsError);
    });

    it('rethrows an unexpected error', async () => {
      mockUserManagementPlugin.removeUserFromRole = jest.fn().mockRejectedValue(new Error());

      await expect(
        wbcGroupManagementPlugin.removeUserFromGroup({ groupId, userId, authenticatedUser: mockUser })
      ).rejects.toThrow(Error);
    });
  });

  describe('getGroupStatus', () => {
    it('returns the status in the data object when the group exists', async () => {
      ddbMock.on(GetItemCommand).resolves({
        Item: {
          id: {
            S: groupId
          },
          status: {
            S: status
          }
        }
      });

      const response = await wbcGroupManagementPlugin.getGroupStatus({ groupId });

      expect(response).toMatchObject<GetGroupStatusResponse>({ data: { status } });
    });

    it('throws GroupNotFoundError when the group doesnt exist', async () => {
      ddbMock.on(GetItemCommand).resolves({});

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(GroupNotFoundError);
    });

    it('throws PluginConfigurationError when the ddb table doesnt exist', async () => {
      ddbMock.on(GetItemCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        PluginConfigurationError
      );
    });

    it('throws TooManyRequestsError when the provisioned throughput is exceeded', async () => {
      ddbMock
        .on(GetItemCommand)
        .rejects(new ProvisionedThroughputExceededException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('throws TooManyRequestsError when the request limit is exceeded', async () => {
      ddbMock.on(GetItemCommand).rejects(new RequestLimitExceeded({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('rethrows an unexpected error', async () => {
      ddbMock.on(GetItemCommand).rejects(new Error());

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(Error);
    });
  });

  describe('setGroupStatus', () => {
    it('returns the status in the data object when the status was successfully set', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      ddbMock.on(UpdateItemCommand).resolves({});

      const response = await wbcGroupManagementPlugin.setGroupStatus({ groupId, status });

      expect(response).toMatchObject<SetGroupStatusResponse>({ data: { status } });
    });

    it('throws ForbiddenError when status tried to go from delete_pending to active', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest
        .fn()
        .mockResolvedValue({ data: { status: 'delete_pending' } });

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        ForbiddenError
      );
    });

    it('throws PluginConfigurationError when the ddb table doesnt exist', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      ddbMock.on(UpdateItemCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        PluginConfigurationError
      );
    });

    it('throws TooManyRequestsError when the provisioned throughput is exceeded', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      ddbMock
        .on(UpdateItemCommand)
        .rejects(new ProvisionedThroughputExceededException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('throws TooManyRequestsError when the request limit is exceeded', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      ddbMock.on(UpdateItemCommand).rejects(new RequestLimitExceeded({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('rethrows an unexpected error', async () => {
      wbcGroupManagementPlugin.getGroupStatus = jest.fn().mockRejectedValue(new GroupNotFoundError());
      ddbMock.on(UpdateItemCommand).rejects(new Error());

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(Error);
    });
  });
});
