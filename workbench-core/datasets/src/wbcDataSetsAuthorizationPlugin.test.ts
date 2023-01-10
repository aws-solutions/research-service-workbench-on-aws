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
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DDBDynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  IdentityPermission,
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
  let testMethod: (i: IdentityPermission[]) => PermissionsResponse[];
  let createPermissionsSpy: jest.SpyInstance;
  const dataSetId: string = 'fake-dataset-id';
  const anotherDataSetId: string = 'fake-another-dataset-id';
  const userId: string = 'fake-user-id';
  const groupId: string = 'fake-group-id';
  const fakeData: string = 'fake-data';
  const authenticatedUser = {
    id: userId,
    roles: []
  };

  const readOnlyAccessPermission: AddRemoveAccessPermissionRequest = {
    dataSetId: dataSetId,
    authenticatedUser,
    permission: {
      identityType: 'USER',
      identity: groupId,
      accessLevel: 'read-only'
    }
  };

  const readWriteAccessPermission: AddRemoveAccessPermissionRequest = {
    dataSetId: dataSetId,
    authenticatedUser,
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
        },
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

  const mockMultiDatasetPermissionsResponse: CreateIdentityPermissionsResponse = {
    data: {
      identityPermissions: [
        {
          identityType: 'GROUP',
          identityId: groupId,
          effect: 'ALLOW',
          action: 'UPDATE',
          subjectType: 'DataSet',
          subjectId: dataSetId
        },
        {
          identityType: 'GROUP',
          identityId: groupId,
          effect: 'ALLOW',
          action: 'UPDATE',
          subjectType: 'DataSet',
          subjectId: anotherDataSetId
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

    createPermissionsSpy = jest.spyOn(DynamicAuthorizationService.prototype, 'createIdentityPermissions');
    createPermissionsSpy.mockImplementation(async (params: CreateIdentityPermissionsRequest) => {
      if (params.identityPermissions[0].identityType === 'USER') {
        return mockUserPermissionResponse;
      } else if (params.identityPermissions.length === 2) {
        return mockReadWritePermissionsResponse;
      }
      return mockReadOnlyPermissionsResponse;
    });
    //@ts-ignore - get the private method under test.
    testMethod = plugin._identityPermissionsToPermissionsResponse;
  });

  beforeEach(() => {
    expect.hasAssertions();
  });

  describe('addAccessPermission tests', () => {
    it('throws a invalidPermission exception when identityType is not USER or GROUP', async () => {
      await expect(
        plugin.addAccessPermission({
          dataSetId: dataSetId,
          authenticatedUser,
          permission: {
            identityType: fakeData,
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).rejects.toThrow(new InvalidPermissionError("IdentityType must be 'GROUP' or 'USER'."));
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
      ).rejects.toThrow(new InvalidPermissionError("Access Level must be 'read-only' or 'read-write'."));
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
      });
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
      });
      expect(authzService.createIdentityPermissions).toBeCalledTimes(1);
    });

    it('throws if result contains more than one PermissionsResponse object', async () => {
      createPermissionsSpy.mockImplementationOnce(async () => mockMultiDatasetPermissionsResponse);

      // arguement should be irrelevant due to mockImplementationOnce above.
      await expect(plugin.addAccessPermission(readOnlyAccessPermission)).rejects.toThrowError(
        new InvalidPermissionError(`Expected a single permissions response, but got 2.`)
      );
    });
  });

  describe('_identityPermissionsToPermissionsResponse', () => {
    it('throws if empty input is given', () => {
      expect(() => testMethod([])).toThrowError(new InvalidPermissionError('No permissions found.'));
    });

    it('throws if input is undefined', () => {
      //@ts-ignore - to allow checking undefined input
      expect(() => testMethod()).toThrowError(new InvalidPermissionError('No permissions found.'));
    });

    it('throws if input contains an action that is not "READ" or "UPDATE"', () => {
      expect(() =>
        testMethod([
          {
            action: 'DELETE',
            effect: 'ALLOW',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          }
        ])
      ).toThrowError(
        new InvalidPermissionError(
          "Unsupported actions found in permissions. Only 'READ' and 'UPDATE' are currently supported."
        )
      );
    });

    it('throws if input contains a "DENY" effect.', () => {
      expect(() =>
        testMethod([
          {
            action: 'READ',
            effect: 'DENY',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          }
        ])
      ).toThrowError(new InvalidPermissionError("Only 'ALLOW' effect is supported."));
    });

    it('returns two permissions for a single dataset if two identities are given.', () => {
      expect(
        testMethod([
          {
            action: 'READ',
            effect: 'ALLOW',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          },
          {
            action: 'READ',
            effect: 'ALLOW',
            identityId: userId,
            identityType: 'USER',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          }
        ])
      ).toMatchObject([
        {
          data: {
            dataSetId: dataSetId,
            permissions: [
              {
                identity: groupId,
                identityType: 'GROUP',
                accessLevel: 'read-only'
              },
              {
                identity: userId,
                identityType: 'USER',
                accessLevel: 'read-only'
              }
            ]
          }
        }
      ]);
    });

    it('returns a "read-write" permission over a "read-only" permission if both "READ" and "UPDATE" actions are given.', () => {
      expect(
        testMethod([
          {
            action: 'READ',
            effect: 'ALLOW',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          },
          {
            action: 'UPDATE',
            effect: 'ALLOW',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          }
        ])
      ).toMatchObject([
        {
          data: {
            dataSetId: dataSetId,
            permissions: [
              {
                identity: groupId,
                identityType: 'GROUP',
                accessLevel: 'read-write'
              }
            ]
          }
        }
      ]);
    });

    it('returns a read-write permission for one identity and read-only for another', () => {
      expect(
        testMethod([
          {
            action: 'READ',
            effect: 'ALLOW',
            identityId: groupId,
            identityType: 'GROUP',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          },
          {
            action: 'UPDATE',
            effect: 'ALLOW',
            identityId: userId,
            identityType: 'USER',
            subjectId: dataSetId,
            subjectType: 'DataSet'
          }
        ])
      ).toMatchObject([
        {
          data: {
            dataSetId: dataSetId,
            permissions: [
              {
                identity: groupId,
                identityType: 'GROUP',
                accessLevel: 'read-only'
              },
              {
                identity: userId,
                identityType: 'USER',
                accessLevel: 'read-write'
              }
            ]
          }
        }
      ]);
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
