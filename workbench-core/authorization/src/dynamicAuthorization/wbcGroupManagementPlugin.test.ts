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
  UserNotFoundError
} from '@aws/workbench-core-user-management';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { AuthenticatedUser } from '../authenticatedUser';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
import { GetUserGroupsResponse } from './dynamicAuthorizationInputs/getUserGroups';
import { SetGroupStatusResponse } from './dynamicAuthorizationInputs/setGroupStatus';
import { GroupStatus } from './models/GroupMetadata';
import { WBCGroupManagementPlugin } from './wbcGroupManagementPlugin';

describe('WBCGroupManagemntPlugin', () => {
  let mockUserManagementPlugin: UserManagementPlugin;
  let ddbMock: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  let region: string;
  let table: string;
  let userGroupKeyType: string;
  let mockUser: AuthenticatedUser;

  let userManagementService: UserManagementService;
  let ddbService: DynamoDBService;
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
    region = 'region';
    table = 'fakeTable';
    userGroupKeyType = 'USERGROUP';
    mockUser = {
      id: 'sampleId',
      roles: []
    };

    userManagementService = new UserManagementService(mockUserManagementPlugin);
    ddbService = new DynamoDBService({ region, table });
    wbcGroupManagementPlugin = new WBCGroupManagementPlugin({
      userManagementService,
      ddbService,
      userGroupKeyType
    });
  });

  afterEach(() => {
    jest.resetAllMocks();
    ddbMock.reset();
  });

  describe('createGroup', () => {
    let groupId: string;

    beforeEach(() => {
      groupId = 'groupId';
    });

    it('returns the groupID in the data object when the group was successfully created', async () => {
      const response = await wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser });

      expect(response).toMatchObject<CreateGroupResponse>({ data: { groupId } });
    });

    it('throws IdpUnavailableError when the IdP encounters an error', async () => {
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new IdpUnavailableError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(IdpUnavailableError);
    });

    it('throws PluginConfigurationError when the UserManagementService has a configuration error', async () => {
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new PluginConfigurationError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(PluginConfigurationError);
    });

    it('throws GroupAlreadyExistsError when the group already exists', async () => {
      mockUserManagementPlugin.createRole = jest.fn().mockRejectedValue(new RoleAlreadyExistsError());

      await expect(
        wbcGroupManagementPlugin.createGroup({ groupId, authenticatedUser: mockUser })
      ).rejects.toThrow(GroupAlreadyExistsError);
    });
  });

  describe('getUserGroups', () => {
    let userId: string;
    let groupIds: string[];

    beforeEach(() => {
      userId = 'userId';
      groupIds = ['123', '456', '789'];
    });

    it('returns an array of groupID in the data object that the requested user is in', async () => {
      mockUserManagementPlugin.getUserRoles = jest.fn().mockResolvedValue(groupIds);
      const response = await wbcGroupManagementPlugin.getUserGroups({ userId, authenticatedUser: mockUser });

      expect(response).toMatchObject<GetUserGroupsResponse>({ data: { groupIds } });
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
  });

  describe('setGroupStatus', () => {
    let groupId: string;
    let status: GroupStatus;

    beforeEach(() => {
      groupId = 'groupId';
      status = 'active';
    });

    it('returns the status in the data object when the status was successfully set', async () => {
      ddbMock.on(UpdateItemCommand).resolves({});

      const response = await wbcGroupManagementPlugin.setGroupStatus({ groupId, status });

      expect(response).toMatchObject<SetGroupStatusResponse>({ data: { status } });
    });

    it('throws PluginConfigurationError when the ddb table doesnt exist', async () => {
      ddbMock.on(UpdateItemCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        PluginConfigurationError
      );
    });

    it('throws TooManyRequestsError when the provisioned throughput is exceeded', async () => {
      ddbMock
        .on(UpdateItemCommand)
        .rejects(new ProvisionedThroughputExceededException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('throws TooManyRequestsError when the request limit is exceeded', async () => {
      ddbMock.on(UpdateItemCommand).rejects(new RequestLimitExceeded({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('rethrows an unexpected error', async () => {
      ddbMock.on(UpdateItemCommand).rejects(new Error());

      await expect(wbcGroupManagementPlugin.setGroupStatus({ groupId, status })).rejects.toThrow(Error);
    });
  });

  describe('getGroupStatus', () => {
    let groupId: string;
    let status: GroupStatus;

    beforeEach(() => {
      groupId = 'groupId';
      status = 'active';
    });

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
});
