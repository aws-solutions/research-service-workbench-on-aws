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
  UserNotFoundError,
  RoleNotFoundError
} from '@aws/workbench-core-user-management';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { AuthenticatedUser } from '../authenticatedUser';
import { GroupAlreadyExistsError } from '../errors/groupAlreadyExistsError';
import { GroupNotFoundError } from '../errors/groupNotFoundError';
import { TooManyRequestsError } from '../errors/tooManyRequestsError';
import { CreateGroupResponse } from './dynamicAuthorizationInputs/createGroup';
import { GetGroupStatusResponse } from './dynamicAuthorizationInputs/getGroupStatus';
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

  describe('addUserToGroup', () => {
    test('returns added equal to true on succesfull call', async () => {
      const {
        data: { added }
      } = await wbcGroupManagementPlugin.addUserToGroup({
        groupId: 'groupId',
        userId: 'userId',
        authenticatedUser: mockUser
      });

      expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
      expect(added).toBeTruthy();
    });

    test.each([
      [IdpUnavailableError, new IdpUnavailableError('test error')],
      [PluginConfigurationError, new PluginConfigurationError('test error')],
      [UserNotFoundError, new UserNotFoundError('test error')],
      [RoleNotFoundError, new RoleNotFoundError('test error')],
      [Error, new Error('test error')]
    ])('throws exception %s when UserManagementService throws exception %s', async (expected, error) => {
      mockUserManagementPlugin.addUserToRole = jest.fn().mockRejectedValue(error);
      const userManagementService = new UserManagementService(mockUserManagementPlugin);

      const plugin = new WBCGroupManagementPlugin({
        userManagementService,
        ddbService,
        userGroupKeyType
      });

      await expect(
        plugin.addUserToGroup({
          groupId: 'groupId',
          userId: 'userId',
          authenticatedUser: mockUser
        })
      ).rejects.toThrow();

      expect(mockUserManagementPlugin.addUserToRole).toBeCalledWith('userId', 'groupId');
    });
  });
});
