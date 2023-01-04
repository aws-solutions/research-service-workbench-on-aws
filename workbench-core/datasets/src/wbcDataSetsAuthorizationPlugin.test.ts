/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@aws/workbench-core-audit');
jest.mock('@aws/workbench-core-authorization');
jest.mock('@aws/workbench-core-logging');
jest.mock('./dataSetMetadataPlugin');

import { AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import {
  CreateIdentityPermissionsResponse,
  DDBDynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  WBCGroupManagementPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, DynamoDBService } from '@aws/workbench-core-base';
import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { InvalidPermissionError } from './errors/invalidPermissionError';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { GetAccessPermissionRequest } from './models/getAccessPermissionRequest';
import { PermissionsResponse } from './models/permissionsResponse';
import { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';

describe('wbcDataSetsAuthorizationPlugin tests', () => {
  let writer: Writer;
  let audit: AuditService;
  let aws: AwsService;
  let ddbService: DynamoDBService;
  let groupManagementPlugin: WBCGroupManagementPlugin;
  let permissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin;
  let authzService: DynamicAuthorizationService;
  let plugin: WbcDataSetsAuthorizationPlugin;

  const dataSetId: string = 'fake-dataset-id';
  const userId: string = 'fake-user-id';
  const groupId: string = 'fake-group-id';
  const fakeData: string = 'fake-data';

  const readOnlyAccessPermission: AddRemoveAccessPermissionRequest = {
    dataSetId: dataSetId,
    authenticatedUserId: userId,
    roles: [],
    permission: {
      identityType: 'USER',
      identity: groupId,
      accessLevel: 'read-only'
    }
  };

  const readWriteAccessPermission: AddRemoveAccessPermissionRequest = {
    dataSetId: dataSetId,
    authenticatedUserId: userId,
    roles: [],
    permission: {
      identityType: 'GROUP',
      identity: groupId,
      accessLevel: 'read-write'
    }
  };

  const getAccessPermission: GetAccessPermissionRequest = {
    dataSetId: dataSetId,
    subject: groupId
  };

  const mockReadOnlyPermissionsResponse: CreateIdentityPermissionsResponse = {
    data: {
      identityPermissions: [
        {
          identityType: 'GROUP',
          identityId: groupId,
          effect: 'ALLOW',
          action: 'READ',
          subjectType: 'DataSet',
          subjectId: dataSetId
        }
      ]
    }
  };

  const mockReadWritePermissionsResponse: CreateIdentityPermissionsResponse = {
    data: {
      identityPermissions: [
        {
          identityType: 'GROUP',
          identityId: groupId,
          effect: 'ALLOW',
          action: 'UPDATE',
          subjectType: 'DataSet',
          subjectId: dataSetId
        }
      ]
    }
  };

  const mockUserPermissionResponse: CreateIdentityPermissionsResponse = {
    data: {
      identityPermissions: [
        {
          identityType: 'USER',
          identityId: userId,
          effect: 'ALLOW',
          action: 'READ',
          subjectType: 'DataSet',
          subjectId: dataSetId
        }
      ]
    }
  };

  beforeAll(() => {
    jest.resetAllMocks();
    writer = {
      prepare: jest.fn(),
      write: jest.fn()
    };
    audit = new AuditService(new BaseAuditPlugin(writer), true);
    aws = new AwsService({
      region: 'us-east-1',
      credentials: {
        accessKeyId: 'fakeKey',
        secretAccessKey: 'fakeSecret'
      }
    });
    ddbService = new DynamoDBService({ region: 'us-east-1', table: 'fakeTable' });
    groupManagementPlugin = new WBCGroupManagementPlugin({
      userManagementService: new UserManagementService(new CognitoUserManagementPlugin('fakeUserPool', aws)),
      ddbService: ddbService,
      userGroupKeyType: 'GROUP'
    });
    permissionsPlugin = new DDBDynamicAuthorizationPermissionsPlugin({
      dynamoDBService: ddbService
    });
    authzService = new DynamicAuthorizationService({
      groupManagementPlugin: groupManagementPlugin,
      dynamicAuthorizationPermissionsPlugin: permissionsPlugin,
      auditService: audit
    });
    plugin = new WbcDataSetsAuthorizationPlugin(authzService);

    jest
      .spyOn(DynamicAuthorizationService.prototype, 'createIdentityPermissions')
      .mockImplementation(async (params) => {
        if (params.identityPermissions[0].identityType === 'USER') {
          return mockUserPermissionResponse;
        } else if (params.identityPermissions[0].action === 'UPDATE') {
          return mockReadWritePermissionsResponse;
        }
        return mockReadOnlyPermissionsResponse;
      });
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('addAccessPermission tests', () => {
    it('throws a invalidPermission exception when identityType is not USER or GROUP', async () => {
      await expect(
        plugin.addAccessPermission({
          dataSetId: dataSetId,
          authenticatedUserId: userId,
          roles: [],
          permission: {
            identityType: fakeData,
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).rejects.toThrow(new InvalidPermissionError('IdentityType just be "GROUP" or "USER".'));
      expect(authzService.createIdentityPermissions).not.toBeCalled();
    });

    it('throws a invalidPermission exception when accessLevel is not read-only or read-write', async () => {
      await expect(
        plugin.addAccessPermission({
          dataSetId: dataSetId,
          authenticatedUserId: userId,
          roles: [],
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            // @ts-ignore to test poor JS usage.
            accessLevel: fakeData
          }
        })
      ).rejects.toThrow(new InvalidPermissionError('Access Level must be "read-only" or "read-write".'));
      expect(authzService.createIdentityPermissions).not.toBeCalled();
    });

    it('creates an UPDATE permission when read-write access is requested.', async () => {
      await expect(plugin.addAccessPermission(readWriteAccessPermission)).resolves.toStrictEqual({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'GROUP',
              identity: groupId,
              accessLevel: 'read-write'
            }
          ]
        }
      } as PermissionsResponse);
      expect(authzService.createIdentityPermissions).toBeCalledTimes(1);
    });

    it('creates a USER permission when identityType is USER', async () => {
      await expect(plugin.addAccessPermission(readOnlyAccessPermission)).resolves.toStrictEqual({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'USER',
              identity: userId,
              accessLevel: 'read-only'
            }
          ]
        }
      } as PermissionsResponse);
      expect(authzService.createIdentityPermissions).toBeCalledTimes(1);
    });
  });

  describe('getAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.getAccessPermissions(getAccessPermission)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('removeAccessPermission tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.removeAccessPermissions(readOnlyAccessPermission)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('getAllDataSetAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.getAllDataSetAccessPermissions(dataSetId)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });

  describe('removeAllAccessPermissions tests', () => {
    it('throws a notimplemented exception', async () => {
      await expect(plugin.removeAllAccessPermissions(dataSetId)).rejects.toThrow(
        new Error('Method not implemented.')
      );
    });
  });
});
