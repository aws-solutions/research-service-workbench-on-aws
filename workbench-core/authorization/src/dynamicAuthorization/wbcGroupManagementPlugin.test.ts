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
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { DynamoDBService } from '@aws/workbench-core-base';
import {
  UserManagementService,
  UserManagementPlugin,
  PluginConfigurationError
} from '@aws/workbench-core-user-management';
import { mockClient } from 'aws-sdk-client-mock';
import { AuthenticatedUser } from '../authenticatedUser';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
import { SetGroupStatusResponse } from './dynamicAuthorizationInputs/setGroupStatus';
import { WBCGroupManagementPlugin } from './wbcGroupManagementPlugin';

describe('WBCGroupManagemntPlugin', () => {
  const region = 'region';
  const table = 'fakeTable';
  const userGroupKeyType = 'USERGROUP';

  const mockUser: AuthenticatedUser = {
    id: 'sampleId',
    roles: []
  };

  const mockUserManagementPlugin: UserManagementPlugin = {
    getUser: jest.fn(),
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
  const ddbMock = mockClient(DynamoDBClient);

  let userManagementService: UserManagementService;
  let ddbService: DynamoDBService;
  let wbcGroupManagementPlugin: WBCGroupManagementPlugin;

  beforeEach(() => {
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

  describe('setGroupStatus', () => {
    it('returns `setStatus` as true when the status was successfully set', async () => {
      const groupId = 'groupId';
      const status = 'active';
      ddbMock.on(UpdateItemCommand).resolves({});

      const response = await wbcGroupManagementPlugin.setGroupStatus({ groupId, status });

      expect(response).toMatchObject<SetGroupStatusResponse>({ statusSet: true });
    });

    it('returns `setStatus` as false when an error is thrown setting the status', async () => {
      const groupId = 'groupId';
      const status = 'active';
      ddbMock.on(UpdateItemCommand).rejects({});

      const response = await wbcGroupManagementPlugin.setGroupStatus({ groupId, status });

      expect(response).toMatchObject<SetGroupStatusResponse>({ statusSet: false });
    });
  });

  describe('getGroupStatus', () => {
    it('returns the group status when the group exists', async () => {
      const groupId = 'groupId';
      const status = 'active';
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

      expect(response).toMatchObject<GetGroupStatusResponse>({ status });
    });

    it('throws GroupNotFoundError when the group doesnt exist', async () => {
      const groupId = 'groupId';
      ddbMock.on(GetItemCommand).resolves({});

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(GroupNotFoundError);
    });

    it('throws PluginConfigurationError when the ddb table doesnt exist', async () => {
      const groupId = 'groupId';
      ddbMock.on(GetItemCommand).rejects(new ResourceNotFoundException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        PluginConfigurationError
      );
    });

    it('throws TooManyRequestsError when the provisioned throughput is exceeded', async () => {
      const groupId = 'groupId';
      ddbMock
        .on(GetItemCommand)
        .rejects(new ProvisionedThroughputExceededException({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('throws TooManyRequestsError when the request limit is exceeded', async () => {
      const groupId = 'groupId';
      ddbMock.on(GetItemCommand).rejects(new RequestLimitExceeded({ message: '', $metadata: {} }));

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(
        TooManyRequestsError
      );
    });

    it('rethrows an unexpected error', async () => {
      const groupId = 'groupId';
      ddbMock.on(GetItemCommand).rejects(new Error());

      await expect(wbcGroupManagementPlugin.getGroupStatus({ groupId })).rejects.toThrow(Error);
    });
  });

  describe('addUserToGroup', () => {
    test('Response from addUserToGroup has added equal to true on succesfull call', async () => {
      const { added } = await wbcGroupManagementPlugin.addUserToGroup({
        groupId: 'groupId',
        userId: 'userId',
        authenticatedUser: mockUser
      });

      expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
      expect(added).toBeTruthy();
    });

    test('Response from addUserToGroup has added equal to false when UserManagementService throws exception', async () => {
      mockUserManagementPlugin.addUserToRole = jest.fn().mockRejectedValue(new Error('Test error'));
      const userManagementService = new UserManagementService(mockUserManagementPlugin);

      const wBCGroupManagemntPlugin = new WBCGroupManagementPlugin({
        userManagementService,
        ddbService,
        userGroupKeyType
      });

      const { added } = await wBCGroupManagemntPlugin.addUserToGroup({
        groupId: 'groupId',
        userId: 'userId',
        authenticatedUser: mockUser
      });

      expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
      expect(added).toBeFalsy();
    });
  });
});
