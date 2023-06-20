/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('@aws/workbench-core-audit');
jest.mock('@aws/workbench-core-logging');
jest.mock('./dataSetMetadataPlugin');
jest.mock('./wbcDataSetsAuthorizationPlugin');
import { AuditService, BaseAuditPlugin, Writer } from '@aws/workbench-core-audit';
import {
  CASLAuthorizationPlugin,
  DDBDynamicAuthorizationPermissionsPlugin,
  DynamicAuthorizationService,
  ForbiddenError,
  WBCGroupManagementPlugin
} from '@aws/workbench-core-authorization';
import { AwsService, DynamoDBService, PaginatedResponse } from '@aws/workbench-core-base';
import { LoggingService } from '@aws/workbench-core-logging';
import { CognitoUserManagementPlugin, UserManagementService } from '@aws/workbench-core-user-management';
import { DataSetService } from './dataSetService';
import { DdbDataSetMetadataPlugin } from './ddbDataSetMetadataPlugin';
import { AccountNotFoundError } from './errors/accountNotFoundError';
import { DataSetHasEndpointError } from './errors/dataSetHasEndpointError';
import { DataSetInvalidParameterError } from './errors/dataSetInvalidParameterError';
import { DataSetNotFoundError, isDataSetNotFoundError } from './errors/dataSetNotFoundError';
import { EndpointExistsError } from './errors/endpointExistsError';
import { EndpointNotFoundError } from './errors/endpointNotFoundError';
import { NotAuthorizedError } from './errors/notAuthorizedError';
import { StorageNotFoundError } from './errors/storageNotFoundError';
import { AddDataSetExternalEndpointResponse } from './models/addDataSetExternalEndpoint';
import { AddRemoveAccessPermissionRequest } from './models/addRemoveAccessPermissionRequest';
import { DataSet } from './models/dataSet';
import { DataSetPermission } from './models/dataSetPermission';
import { DataSetsAccessLevel } from './models/dataSetsAccessLevel';
import { ExternalEndpoint } from './models/externalEndpoint';
import { GetDataSetMountPointResponse } from './models/getDataSetMountPoint';
import { PermissionsResponse } from './models/permissionsResponse';
import { StorageLocation } from './models/storageLocation';
import { S3DataSetStoragePlugin } from './s3DataSetStoragePlugin';
import { WbcDataSetsAuthorizationPlugin } from './wbcDataSetsAuthorizationPlugin';

describe('DataSetService', () => {
  let writer: Writer;
  let audit: AuditService;
  let log: LoggingService;
  let aws: AwsService;
  let ddbService: DynamoDBService;
  let groupManagementPlugin: WBCGroupManagementPlugin;
  let permissionsPlugin: DDBDynamicAuthorizationPermissionsPlugin;
  let caslAuthorizationPlugin: CASLAuthorizationPlugin;
  let authzService: DynamicAuthorizationService;
  let metaPlugin: DdbDataSetMetadataPlugin;
  let authzPlugin: WbcDataSetsAuthorizationPlugin;
  let s3Plugin: S3DataSetStoragePlugin;
  let dataSetService: DataSetService;

  const mockDataSetId = 'sampleDataSetId';
  const mockInvalidId = 'Sample-Invalid-Id';
  const mockDataSetName = 'Sample-DataSet';
  const mockDataSetPath = 'sample-s3-prefix';
  const mockAwsAccountId = 'Sample-AWS-Account';
  const mockAwsBucketRegion = 'Sample-AWS-Bucket-Region';
  const mockDataSetStorageType = 'S3';
  const mockDataSetStorageName = 'S3-Bucket';
  const mockAccessPointName = 'Sample-Access-Point';
  const mockAccessPointAlias = `${mockAccessPointName}-s3alias`;
  const mockRoleArn = 'Sample-Role-Arn';
  const mockAlternateRoleArn = 'Another-Sample-Role-Arn';
  const mockExistingEndpointName = 'Sample-Existing-AP';
  const mockExistingEndpointId = 'Sample-Endpoint-Id';
  const mockNoRolesEndpointId = 'Sample-NoRoles-Endpoint-Id';
  const mockDataSetWithEndpointId = 'sampleDataSetWithEndpointId';
  const mockEndpointUrl = `s3://arn:s3:us-east-1:${mockAwsAccountId}:accesspoint/${mockAccessPointName}/${mockDataSetPath}/`;
  const mockDataSetObject = 'datasetObjectId';
  const mockPresignedSinglePartUploadURL = 'Sample-Presigned-Single-Part-Upload-Url';
  const mockGroupId = 'Sample-Group-Id';
  const mockUserId = 'sample-user-id';
  const mockOwnerUserId = 'sample-owner-user-id';
  const mockAuthenticatedUser = {
    id: mockUserId,
    roles: []
  };
  const mockCreatedAt = new Date().toISOString();
  const mockReadOnlyAccessLevel: DataSetsAccessLevel = 'read-only';

  const mockDataSetAddAccessParams: AddRemoveAccessPermissionRequest = {
    authenticatedUser: mockAuthenticatedUser,
    dataSetId: mockDataSetId,
    permission: {
      accessLevel: 'read-only',
      identityType: 'USER',
      identity: mockUserId
    }
  };
  const mockAddAccessResponse: PermissionsResponse = {
    data: {
      dataSetId: mockDataSetId,
      permissions: [
        {
          identity: mockUserId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      ]
    }
  };
  const mockReadOnlyUserPermission: DataSetPermission = {
    identity: mockUserId,
    identityType: 'USER',
    accessLevel: 'read-only'
  };
  const mockReadOnlyOwnerUserPermission: DataSetPermission = {
    identity: mockOwnerUserId,
    identityType: 'USER',
    accessLevel: 'read-only'
  };
  const mockReadWriteUserPermission: DataSetPermission = {
    identity: mockUserId,
    identityType: 'USER',
    accessLevel: 'read-write'
  };
  const mockReadWriteGroupPermission: DataSetPermission = {
    identity: mockGroupId,
    identityType: 'GROUP',
    accessLevel: 'read-write'
  };
  const mockReadOnlyGroupPermission: DataSetPermission = {
    identity: mockGroupId,
    identityType: 'GROUP',
    accessLevel: 'read-only'
  };

  beforeEach(() => {
    jest.resetAllMocks();
    expect.hasAssertions();

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
    caslAuthorizationPlugin = new CASLAuthorizationPlugin();
    authzService = new DynamicAuthorizationService({
      groupManagementPlugin: groupManagementPlugin,
      dynamicAuthorizationPermissionsPlugin: permissionsPlugin,
      auditService: audit,
      authorizationPlugin: caslAuthorizationPlugin
    });
    authzPlugin = new WbcDataSetsAuthorizationPlugin(authzService);
    log = new LoggingService();
    metaPlugin = new DdbDataSetMetadataPlugin(aws, 'DS', 'EP', 'SL');

    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets')
      .mockImplementation(async (pageSize: number, paginationToken: string | undefined) => {
        return {
          data: [
            {
              id: mockDataSetId,
              name: mockDataSetName,
              path: mockDataSetPath,
              awsAccountId: mockAwsAccountId,
              storageType: mockDataSetStorageType,
              storageName: mockDataSetStorageName,
              createdAt: mockCreatedAt
            }
          ],
          paginationToken: undefined
        };
      });
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetMetadata')
      .mockImplementation(async (id: string): Promise<DataSet> => {
        if (id === mockDataSetWithEndpointId) {
          return {
            id: mockDataSetWithEndpointId,
            name: mockDataSetName,
            path: mockDataSetPath,
            awsAccountId: mockAwsAccountId,
            storageType: mockDataSetStorageType,
            storageName: mockDataSetStorageName,
            externalEndpoints: [mockExistingEndpointName],
            createdAt: mockCreatedAt
          };
        } else if (id === mockInvalidId) {
          throw new DataSetNotFoundError(`Could not find DataSet '${mockInvalidId}'.`);
        }
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName,
          createdAt: mockCreatedAt
        };
      });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSetObjects').mockImplementation(async () => {
      return [mockDataSetObject];
    });
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetObjectMetadata')
      .mockImplementation(async () => {
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName
        };
      });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'addDataSet').mockImplementation(async () => {
      return {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        createdAt: mockCreatedAt
      };
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'updateDataSet').mockImplementation(async () => {
      return {
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        externalEndpoints: [mockAccessPointName],
        createdAt: mockCreatedAt
      };
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'removeDataSet').mockImplementation(async () => {});
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetEndPointDetails')
      .mockImplementation(async (dataSetId: string, endpointId: string) => {
        if (endpointId === mockNoRolesEndpointId) {
          return {
            id: mockExistingEndpointId,
            name: mockExistingEndpointName,
            dataSetId: mockDataSetId,
            dataSetName: mockDataSetName,
            path: mockDataSetPath,
            endPointUrl: mockEndpointUrl,
            endPointAlias: mockAccessPointAlias,
            createdAt: mockCreatedAt,
            accessLevel: mockReadOnlyAccessLevel
          };
        }
        return {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          path: mockDataSetPath,
          endPointUrl: mockEndpointUrl,
          endPointAlias: mockAccessPointAlias,
          allowedRoles: [mockRoleArn],
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'addExternalEndpoint').mockImplementation(async () => {
      return {
        id: mockExistingEndpointId,
        name: mockExistingEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockAccessPointAlias,
        allowedRoles: [mockRoleArn],
        createdAt: mockCreatedAt,
        accessLevel: mockReadOnlyAccessLevel
      };
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listEndpointsForDataSet').mockImplementation(async () => {
      return [
        {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          path: mockDataSetPath,
          endPointUrl: mockEndpointUrl,
          endPointAlias: mockAccessPointAlias,
          allowedRoles: [mockRoleArn],
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        }
      ];
    });
    jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'updateExternalEndpoint').mockImplementation(async () => {
      return {
        id: mockExistingEndpointId,
        name: mockExistingEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockAccessPointAlias,
        allowedRoles: [mockRoleArn, mockAlternateRoleArn],
        createdAt: mockCreatedAt,
        accessLevel: mockReadOnlyAccessLevel
      };
    });
    jest
      .spyOn(DdbDataSetMetadataPlugin.prototype, 'listStorageLocations')
      .mockImplementation(async (pageSize: number, paginationToken: string | undefined) => {
        return {
          data: [
            {
              name: mockDataSetStorageName,
              awsAccountId: mockAwsAccountId,
              type: mockDataSetStorageType,
              region: mockAwsBucketRegion
            }
          ],
          paginationToken: undefined
        };
      });

    jest.spyOn(S3DataSetStoragePlugin.prototype, 'getStorageType').mockImplementation(() => {
      return mockDataSetStorageType;
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'createStorage').mockImplementation(async () => {
      return `s3://${mockDataSetStorageName}/${mockDataSetPath}/`;
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'importStorage').mockImplementation(async () => {
      return `s3://${mockDataSetStorageName}/${mockDataSetPath}/`;
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'addExternalEndpoint').mockImplementation(async () => {
      return {
        data: {
          connections: {
            endPointUrl: mockEndpointUrl,
            endPointAlias: mockAccessPointAlias
          }
        }
      };
    });
    jest.spyOn(S3DataSetStoragePlugin.prototype, 'removeExternalEndpoint').mockImplementation(async () => {});
    jest
      .spyOn(S3DataSetStoragePlugin.prototype, 'addRoleToExternalEndpoint')
      .mockImplementation(async () => {});
    jest
      .spyOn(S3DataSetStoragePlugin.prototype, 'removeRoleFromExternalEndpoint')
      .mockImplementation(async () => {});
    jest
      .spyOn(S3DataSetStoragePlugin.prototype, 'createPresignedUploadUrl')
      .mockImplementation(async () => mockPresignedSinglePartUploadURL);

    dataSetService = new DataSetService(audit, log, metaPlugin, authzPlugin);
    s3Plugin = new S3DataSetStoragePlugin(aws);

    jest
      .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
      .mockImplementation(async () => mockAddAccessResponse);

    jest
      .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'removeAccessPermissions')
      .mockImplementation(async () => mockAddAccessResponse);

    jest
      .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions')
      .mockImplementation(async () => mockAddAccessResponse);

    jest
      .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAllDataSetAccessPermissions')
      .mockImplementation(async () => mockAddAccessResponse);
  });

  describe('constructor', () => {
    it('sets a private audit and log service', () => {
      const testService = new DataSetService(audit, log, metaPlugin, authzPlugin);

      expect(testService[`_audit`]).toBe(audit);
      expect(testService[`_log`]).toBe(log);
    });
  });

  describe('provisionDataset', () => {
    const ORIGINAL_ENV = process.env;
    beforeEach(() => {
      process.env.S3_DATASETS_BUCKET_NAME = mockDataSetStorageName;
      process.env.MAIN_ACCT_ID = mockAwsAccountId;
    });
    afterAll(() => {
      process.env = ORIGINAL_ENV;
    });
    it('calls createStorage and addDataSet', async () => {
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        createdAt: mockCreatedAt,
        permissions: [mockReadOnlyUserPermission]
      });
      expect(metaPlugin.addDataSet).toBeCalledTimes(1);
      expect(s3Plugin.createStorage).toBeCalledTimes(1);
    });
    it('can add the authenticated user as read-only if there are no other permissions requested.', async () => {
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadOnlyUserPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadOnlyUserPermission]
      });
    });
    it('does not add the authenticated user twice if included in the permissions request.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadWriteUserPermission]
            }
          };
        });
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          permissions: [mockReadWriteUserPermission]
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadWriteUserPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadWriteUserPermission]
      });
    });
    it('does not add authenticated user as read-only if there are other permissions requested.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadWriteGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          permissions: [mockReadWriteGroupPermission]
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadWriteGroupPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadWriteGroupPermission]
      });
    });
    it('an owning USER gets read-only access instead of authenticated user when provided.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyOwnerUserPermission]
            }
          };
        });
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockOwnerUserId,
          ownerType: 'USER'
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadOnlyOwnerUserPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadOnlyOwnerUserPermission]
      });
    });
    it('an owning GROUP gets read-only access instead of authenticated user when provided.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockGroupId,
          ownerType: 'GROUP'
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadOnlyGroupPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadOnlyGroupPermission]
      });
    });
    it('throws if owner is provided but owner type is empty.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockGroupId
        })
      ).rejects.toThrowError(
        new DataSetInvalidParameterError("'ownerType' is required when 'owner' is provided.")
      );
      expect(authzPlugin.addAccessPermission).not.toBeCalled();
    });
    it('throws error for storageName that does not match dataset bucket name', async () => {
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: 'wrong-storage-name',
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(
        new StorageNotFoundError("Please use data set S3 bucket name from main account for 'storageName'.")
      );
      expect(audit.write).toHaveBeenCalledTimes(1);
      expect(authzPlugin.addAccessPermission).not.toHaveBeenCalled();
    });
    it('throws error for accountId that doe snot match main account ID', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'addDataSet')
        .mockRejectedValueOnce(new Error('intentional test error'));
      await expect(
        dataSetService.provisionDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: 'wrong-account-id',
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(new AccountNotFoundError("Please use main account ID for 'awsAccountId'."));
      expect(audit.write).toHaveBeenCalledTimes(1);
      expect(authzPlugin.addAccessPermission).not.toHaveBeenCalled();
    });
  });

  describe('importDataset', () => {
    it('calls importStorage and addDataSet ', async () => {
      await expect(
        dataSetService.importDataSet({
          name: 'name',
          storageName: 'storageName',
          path: 'path',
          awsAccountId: 'accountId',
          region: 'bucketRegion',
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        createdAt: mockCreatedAt,
        permissions: [mockReadOnlyUserPermission]
      });
      expect(metaPlugin.addDataSet).toBeCalledTimes(1);
      expect(s3Plugin.importStorage).toBeCalledTimes(1);
    });
    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'addDataSet')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrowError(new Error('intentional test error'));
      expect(audit.write).toHaveBeenCalledTimes(1);
    });
    it('does not add the authenticated user twice if included in the permissions request.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadWriteUserPermission]
            }
          };
        });
      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          permissions: [mockReadWriteUserPermission]
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadWriteUserPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadWriteUserPermission]
      });
    });
    it('does not add authenticated user as read-only if there are other permissions requested.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadWriteGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          permissions: [mockReadWriteGroupPermission]
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadWriteGroupPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadWriteGroupPermission]
      });
    });
    it('an owning USER gets read-only access instead of authenticated user when provided.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyOwnerUserPermission]
            }
          };
        });
      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockOwnerUserId,
          ownerType: 'USER'
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadOnlyOwnerUserPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadOnlyOwnerUserPermission]
      });
    });
    it('an owning GROUP gets read-only access instead of authenticated user when provided.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockGroupId,
          ownerType: 'GROUP'
        })
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        createdAt: mockCreatedAt,
        name: mockDataSetName,
        path: mockDataSetPath,
        storageName: mockDataSetStorageName,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        permissions: [mockReadOnlyGroupPermission]
      });
      expect(authzPlugin.addAccessPermission).toBeCalledWith({
        authenticatedUser: mockAuthenticatedUser,
        dataSetId: mockDataSetId,
        permission: [mockReadOnlyGroupPermission]
      });
    });
    it('throws if owner is provided but owner type is empty.', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'addAccessPermission')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyGroupPermission]
            }
          };
        });
      await expect(
        dataSetService.importDataSet({
          name: mockDataSetName,
          storageName: mockDataSetStorageName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          region: mockAwsBucketRegion,
          storageProvider: s3Plugin,
          authenticatedUser: mockAuthenticatedUser,
          owner: mockGroupId
        })
      ).rejects.toThrowError(
        new DataSetInvalidParameterError("'ownerType' is required when 'owner' is provided.")
      );
    });
  });

  describe('removeDataset', () => {
    it('returns the dataset when the dataset is removed', async () => {
      const dataSetPermissionsResponse: PermissionsResponse = {
        data: {
          dataSetId: mockDataSetId,
          permissions: [mockReadOnlyUserPermission]
        }
      };
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'removeAllAccessPermissions')
        .mockImplementationOnce(async () => dataSetPermissionsResponse);
      await expect(
        dataSetService.removeDataSet(mockDataSetId, () => Promise.resolve(), mockAuthenticatedUser)
      ).resolves.toStrictEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        permissions: dataSetPermissionsResponse.data.permissions,
        createdAt: mockCreatedAt
      });
    });
    it('throws when an external endpoint exists on the DataSet.', async () => {
      await expect(
        dataSetService.removeDataSet(
          mockDataSetWithEndpointId,
          () => Promise.resolve(),
          mockAuthenticatedUser
        )
      ).rejects.toThrowError(
        new DataSetHasEndpointError(
          'External endpoints found on Dataset must be removed before DataSet can be removed.'
        )
      );
    });
    it('throws when preconditions are not met', async () => {
      await expect(
        dataSetService.removeDataSet(
          mockDataSetId,
          async () => {
            await Promise.reject(new Error('Preconditions are not met'));
          },
          mockAuthenticatedUser
        )
      ).rejects.toThrowError('Preconditions are not met');
      expect(audit.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('getDataSetMountObject', () => {
    it('returns endpoint attributes when called by an authenticated user with user permissions on the dataset.', async () => {
      dataSetService.getDataSet = jest.fn();

      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          endPointAlias: mockAccessPointAlias,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });
      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: mockAuthenticatedUser
        })
      ).resolves.toStrictEqual<GetDataSetMountPointResponse>({
        data: {
          mountObject: {
            name: mockDataSetName,
            prefix: mockDataSetPath,
            bucket: mockAccessPointAlias,
            endpointId: mockExistingEndpointId
          }
        }
      });
    });
    it('returns endpoint attributes when called by an authenticated user with group permissions on the dataset.', async () => {
      dataSetService.getDataSet = jest.fn();

      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions')
        .mockImplementation(async () => ({
          data: {
            dataSetId: mockDataSetId,
            permissions: [{ accessLevel: 'read-only', identityType: 'GROUP', identity: mockGroupId }]
          }
        }));

      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          endPointAlias: mockAccessPointAlias,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });

      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: { id: mockUserId, roles: [mockGroupId] }
        })
      ).resolves.toStrictEqual<GetDataSetMountPointResponse>({
        data: {
          mountObject: {
            name: mockDataSetName,
            prefix: mockDataSetPath,
            bucket: mockAccessPointAlias,
            endpointId: mockExistingEndpointId
          }
        }
      });
    });

    it('throws DataSetNotFoundError when the provided dataset id does not exist.', async () => {
      dataSetService.getDataSet = jest.fn().mockRejectedValueOnce(new DataSetNotFoundError());

      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          endPointAlias: mockAccessPointAlias,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });
      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(DataSetNotFoundError);
    });

    it('throws EndpointNotFoundError when the provided endpoint id does not exist.', async () => {
      dataSetService.getDataSet = jest.fn();

      dataSetService.getExternalEndPoint = jest.fn().mockRejectedValueOnce(new EndpointNotFoundError());

      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(EndpointNotFoundError);
    });

    it('throws NotAuthorizedError when the authenticated user doesnt have permission to access the dataSet.', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: []
        }
      });
      dataSetService.getDataSet = jest.fn();

      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          endPointAlias: mockAccessPointAlias,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: '',
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });
      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(NotAuthorizedError);
    });

    it('throws NotAuthorizedError when the authenticated user doesnt have sufficient permissions to access the endpoint.', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: [{ identity: mockUserId, identityType: 'USER', accessLevel: 'read-only' }]
        }
      });
      dataSetService.getDataSet = jest.fn();

      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          name: mockExistingEndpointName,
          endPointAlias: mockAccessPointAlias,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: '',
          createdAt: mockCreatedAt,
          accessLevel: 'read-write' as DataSetsAccessLevel
        };
      });

      await expect(
        dataSetService.getDataSetMountObject({
          dataSetId: mockDataSetId,
          endpointId: mockExistingEndpointId,
          authenticatedUser: mockAuthenticatedUser
        })
      ).rejects.toThrow(NotAuthorizedError);
    });
  });

  describe('listDataSets', () => {
    let mockDataSetWithoutId: Omit<DataSet, 'id'>;

    beforeEach(() => {
      mockDataSetWithoutId = {
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        createdAt: mockCreatedAt
      };
    });

    it('returns the array of DataSets the authenticated user has access to when the user has access to all the datasets.', async () => {
      jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockResolvedValueOnce({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet').mockResolvedValue();

      await expect(dataSetService.listDataSets(mockAuthenticatedUser, 3, undefined)).resolves.toStrictEqual<
        PaginatedResponse<DataSet>
      >({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
    });

    it('returns the array of DataSets the authenticated user has access to when the user doesnt have access to some of the datasets.', async () => {
      jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockResolvedValueOnce({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet')
        .mockResolvedValueOnce()
        .mockRejectedValueOnce(new ForbiddenError()) // no permissions on dataset 2
        .mockResolvedValueOnce();

      await expect(dataSetService.listDataSets(mockAuthenticatedUser, 3, undefined)).resolves.toStrictEqual<
        PaginatedResponse<DataSet>
      >({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
    });

    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(dataSetService.listDataSets(mockAuthenticatedUser, 3, undefined)).rejects.toThrowError(
        new Error('intentional test error')
      );
      expect(audit.write).toHaveBeenCalledTimes(1);
    });

    it('returns a pagination token when there are more results than pageSize', async () => {
      jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockResolvedValueOnce({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet').mockResolvedValue();

      const result = await dataSetService.listDataSets(mockAuthenticatedUser, 1, undefined);
      expect(result.paginationToken).not.toEqual(undefined);
    });

    it('does not return a pagination token when there exactly pageSize results', async () => {
      jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockResolvedValueOnce({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet').mockResolvedValue();

      const result = await dataSetService.listDataSets(mockAuthenticatedUser, 3, undefined);
      expect(result.paginationToken).toEqual(undefined);
    });

    it('does not return a pagination token when there are less results than pageSize', async () => {
      jest.spyOn(DdbDataSetMetadataPlugin.prototype, 'listDataSets').mockResolvedValueOnce({
        data: [
          { ...mockDataSetWithoutId, id: '1' },
          { ...mockDataSetWithoutId, id: '2' },
          { ...mockDataSetWithoutId, id: '3' }
        ],
        paginationToken: undefined
      });
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet').mockResolvedValue();

      const result = await dataSetService.listDataSets(mockAuthenticatedUser, 10, undefined);
      expect(result.paginationToken).toEqual(undefined);
    });

    it('rethrows an unexpected error', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'isAuthorizedOnDataSet')
        .mockRejectedValueOnce(new Error('some unknown error'));

      await expect(dataSetService.listDataSets(mockAuthenticatedUser, 1, undefined)).rejects.toThrowError(
        new Error('some unknown error')
      );
    });
  });

  describe('getDataSet', () => {
    it('returns a the details of a DataSet.', async () => {
      await expect(
        dataSetService.getDataSet(mockDataSetName, mockAuthenticatedUser)
      ).resolves.toStrictEqual<DataSet>({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        createdAt: mockCreatedAt,
        permissions: [mockReadOnlyUserPermission]
      });
    });
    it('throws when an invalid dataset Id is given.', async () => {
      try {
        await dataSetService.getDataSet(mockInvalidId, mockAuthenticatedUser);
      } catch (error) {
        expect(isDataSetNotFoundError(error)).toBe(true);
        expect(error.message).toBe(`Could not find DataSet '${mockInvalidId}'.`);
        expect(audit.write).toHaveBeenCalledTimes(1);
      }
    });
    it('returns permissions from two pages of permissions', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAllDataSetAccessPermissions')
        .mockResolvedValueOnce({
          data: {
            dataSetId: mockDataSetId,
            permissions: [mockReadOnlyUserPermission]
          },
          pageToken: 'pageToken'
        })
        .mockResolvedValueOnce({
          data: {
            dataSetId: mockDataSetId,
            permissions: [mockReadWriteGroupPermission]
          }
        });
      await expect(dataSetService.getDataSet(mockDataSetName, mockAuthenticatedUser)).resolves.toStrictEqual({
        id: mockDataSetId,
        name: mockDataSetName,
        path: mockDataSetPath,
        awsAccountId: mockAwsAccountId,
        storageType: mockDataSetStorageType,
        storageName: mockDataSetStorageName,
        permissions: [mockReadOnlyUserPermission, mockReadWriteGroupPermission],
        createdAt: mockCreatedAt
      });
      expect(authzPlugin.getAllDataSetAccessPermissions).toHaveBeenCalledTimes(2);
    });
  });

  describe('addDataSetExternalEndpointForGroup', () => {
    it('returns the mount object for the DataSet mount point', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: [{ identity: mockGroupId, identityType: 'GROUP', accessLevel: 'read-only' }]
        }
      });
      await expect(
        dataSetService.addDataSetExternalEndpointForGroup({
          dataSetId: mockDataSetId,
          externalEndpointName: mockAccessPointName,
          storageProvider: s3Plugin,
          groupId: mockGroupId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).resolves.toStrictEqual<AddDataSetExternalEndpointResponse>({
        data: {
          mountObject: {
            name: mockDataSetName,
            bucket: mockAccessPointAlias,
            prefix: mockDataSetPath,
            endpointId: mockExistingEndpointId
          }
        }
      });
    });

    it('throws if the external endpoint already exists.', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: [{ identity: mockGroupId, identityType: 'GROUP', accessLevel: 'read-write' }]
        }
      });

      jest
        .spyOn(S3DataSetStoragePlugin.prototype, 'addExternalEndpoint')
        .mockRejectedValueOnce(new EndpointExistsError());

      await expect(
        dataSetService.addDataSetExternalEndpointForGroup({
          dataSetId: mockDataSetWithEndpointId,
          externalEndpointName: mockExistingEndpointName,
          storageProvider: s3Plugin,
          groupId: mockGroupId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).rejects.toThrow(EndpointExistsError);
      expect(audit.write).toHaveBeenCalledTimes(2);
    });
    it('throws if the subject doesnt have permission to access the dataset', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions')
        .mockResolvedValue({ data: { dataSetId: mockDataSetId, permissions: [] } });
      await expect(
        dataSetService.addDataSetExternalEndpointForGroup({
          dataSetId: mockDataSetWithEndpointId,
          externalEndpointName: mockExistingEndpointName,
          storageProvider: s3Plugin,
          groupId: mockGroupId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).rejects.toThrow(NotAuthorizedError);
    });
  });

  describe('addDataSetExternalEndpointForUser', () => {
    it('returns the mount object for the DataSet mount point', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: [{ identity: mockUserId, identityType: 'USER', accessLevel: 'read-write' }]
        }
      });
      await expect(
        dataSetService.addDataSetExternalEndpointForUser({
          dataSetId: mockDataSetId,
          externalEndpointName: mockAccessPointName,
          storageProvider: s3Plugin,
          userId: mockUserId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).resolves.toStrictEqual<AddDataSetExternalEndpointResponse>({
        data: {
          mountObject: {
            name: mockDataSetName,
            bucket: mockAccessPointAlias,
            prefix: mockDataSetPath,
            endpointId: mockExistingEndpointId
          }
        }
      });
    });

    it('throws if the external endpoint already exists.', async () => {
      jest.spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions').mockResolvedValue({
        data: {
          dataSetId: mockDataSetId,
          permissions: [mockReadWriteUserPermission]
        }
      });

      jest
        .spyOn(S3DataSetStoragePlugin.prototype, 'addExternalEndpoint')
        .mockRejectedValueOnce(new EndpointExistsError());

      await expect(
        dataSetService.addDataSetExternalEndpointForUser({
          dataSetId: mockDataSetWithEndpointId,
          externalEndpointName: mockExistingEndpointName,
          storageProvider: s3Plugin,
          userId: mockUserId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).rejects.toThrow(EndpointExistsError);
    });

    it('throws if the subject does not have permission to access the dataset', async () => {
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAccessPermissions')
        .mockResolvedValue({ data: { dataSetId: mockDataSetId, permissions: [] } });

      await expect(
        dataSetService.addDataSetExternalEndpointForUser({
          dataSetId: mockDataSetWithEndpointId,
          externalEndpointName: mockExistingEndpointName,
          storageProvider: s3Plugin,
          userId: mockUserId,
          authenticatedUser: mockAuthenticatedUser,
          externalRoleName: mockRoleArn
        })
      ).rejects.toThrow(NotAuthorizedError);
      expect(audit.write).toHaveBeenCalledTimes(2);
    });
  });

  describe('removeDataSetExternalEndpoint', () => {
    it('returns nothing after removing DataSet mount point', async () => {
      dataSetService.getDataSet = jest.fn(async () => {
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          externalEndpoints: [mockExistingEndpointId],
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName,
          createdAt: mockCreatedAt
        };
      });
      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          endPointAlias: mockAccessPointAlias,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });

      await expect(
        dataSetService.removeDataSetExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).resolves.not.toThrow();
      expect(metaPlugin.updateDataSet).toHaveBeenCalledTimes(1);
    });

    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetMetadata')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(
        dataSetService.removeDataSetExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrowError(new Error('intentional test error'));
      expect(audit.write).toHaveBeenCalledTimes(2);
    });

    it('throws DataSetNotFoundError if the dataset does not exist', async () => {
      dataSetService.getDataSet = jest.fn().mockRejectedValueOnce(new DataSetNotFoundError());

      await expect(
        dataSetService.removeDataSetExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrow(DataSetNotFoundError);
    });

    it('throws EndpointNotFoundError if endpointId does not exist on dataset', async () => {
      dataSetService.getDataSet = jest.fn(async () => {
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          externalEndpoints: [],
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName,
          createdAt: mockCreatedAt
        };
      });
      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          endPointAlias: mockAccessPointAlias,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });

      await expect(
        dataSetService.removeDataSetExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrow(EndpointNotFoundError);
    });

    it('throws EndpointNotFoundError if the dataset has no external endpoints', async () => {
      dataSetService.getDataSet = jest.fn(async () => {
        return {
          id: mockDataSetId,
          name: mockDataSetName,
          path: mockDataSetPath,
          awsAccountId: mockAwsAccountId,
          storageType: mockDataSetStorageType,
          storageName: mockDataSetStorageName,
          createdAt: mockCreatedAt
        };
      });
      dataSetService.getExternalEndPoint = jest.fn(async () => {
        return {
          id: mockExistingEndpointId,
          endPointAlias: mockAccessPointAlias,
          name: mockExistingEndpointName,
          path: mockDataSetPath,
          dataSetId: mockDataSetId,
          dataSetName: mockDataSetName,
          endPointUrl: mockEndpointUrl,
          createdAt: mockCreatedAt,
          accessLevel: mockReadOnlyAccessLevel
        };
      });

      await expect(
        dataSetService.removeDataSetExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrow(EndpointNotFoundError);
    });
  });

  describe('addRoleToExternalEndpoint', () => {
    it('no-op if the role has already been added to the endpoint.', async () => {
      await expect(
        dataSetService.addRoleToExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          mockRoleArn,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).resolves.toBeUndefined();
    });

    it('completes if given an unknown role arn.', async () => {
      await expect(
        dataSetService.addRoleToExternalEndpoint(
          mockDataSetId,
          mockExistingEndpointId,
          mockAlternateRoleArn,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).resolves.toBeUndefined();
    });

    it('completes if given an existing endpoint with no stored roles', async () => {
      await expect(
        dataSetService.addRoleToExternalEndpoint(
          mockDataSetId,
          mockNoRolesEndpointId,
          mockRoleArn,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).resolves.toBeUndefined();
    });

    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetEndPointDetails')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(
        dataSetService.addRoleToExternalEndpoint(
          mockDataSetId,
          mockNoRolesEndpointId,
          mockRoleArn,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrowError(new Error('intentional test error'));
      expect(audit.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('getExternalEndPoint', () => {
    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetEndPointDetails')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(
        dataSetService.getExternalEndPoint(mockDataSetId, mockNoRolesEndpointId, mockAuthenticatedUser)
      ).rejects.toThrowError(new Error('intentional test error'));
      expect(audit.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('listStorageLocations', () => {
    it('returns an array of known StorageLocations.', async () => {
      await expect(
        dataSetService.listStorageLocations(mockAuthenticatedUser, 3, undefined)
      ).resolves.toStrictEqual<PaginatedResponse<StorageLocation>>({
        data: [
          {
            name: mockDataSetStorageName,
            awsAccountId: mockAwsAccountId,
            type: mockDataSetStorageType,
            region: mockAwsBucketRegion
          }
        ],
        paginationToken: undefined
      });
    });
    it('generates an audit event when an error is thrown', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'listStorageLocations')
        .mockRejectedValueOnce(new Error('intentional test error'));

      await expect(
        dataSetService.listStorageLocations(mockAuthenticatedUser, 3, undefined)
      ).rejects.toThrowError(new Error('intentional test error'));
      expect(audit.write).toHaveBeenCalledTimes(1);
    });
  });

  describe('getSinglePartPresignedUrl', () => {
    it('returns a presigned URL.', async () => {
      const ttlSeconds = 3600;
      const fileName = 'test.txt';

      await expect(
        dataSetService.getPresignedSinglePartUploadUrl(
          mockDataSetId,
          fileName,
          ttlSeconds,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).resolves.toStrictEqual(mockPresignedSinglePartUploadURL);
    });
    it('throws if the dataSet is not found.', async () => {
      const ttlSeconds = 3600;
      const fileName = 'test.txt';
      await expect(
        dataSetService.getPresignedSinglePartUploadUrl(
          mockInvalidId,
          fileName,
          ttlSeconds,
          s3Plugin,
          mockAuthenticatedUser
        )
      ).rejects.toThrowError(DataSetNotFoundError);
      expect(audit.write).toHaveBeenCalledTimes(2);
    });
  });

  describe('addDataSetAccessPermissions', () => {
    it('returns access permissions added to a DataSet', async () => {
      await expect(
        dataSetService.addDataSetAccessPermissions(mockDataSetAddAccessParams)
      ).resolves.toStrictEqual(mockAddAccessResponse);
    });
    it('throws when the dataSet does not exist', async () => {
      const invalidAccessParams: AddRemoveAccessPermissionRequest = {
        ...mockDataSetAddAccessParams,
        dataSetId: mockInvalidId
      };
      try {
        await dataSetService.addDataSetAccessPermissions(invalidAccessParams);
      } catch (error) {
        expect(isDataSetNotFoundError(error)).toBe(true);
        expect(error.message).toBe(`Could not find DataSet '${mockInvalidId}'.`);
        expect(audit.write).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('getDataSetAllAccessPermissions', () => {
    it('returns permssions on a dataset.', async () => {
      await expect(
        dataSetService.getAllDataSetAccessPermissions(mockDataSetId, mockAuthenticatedUser)
      ).resolves.toStrictEqual(mockAddAccessResponse);
    });

    it('returns permssions on a dataset with pageToken.', async () => {
      const pageToken = 'samplePageToken';
      jest
        .spyOn(WbcDataSetsAuthorizationPlugin.prototype, 'getAllDataSetAccessPermissions')
        .mockImplementationOnce(async () => {
          return {
            data: {
              dataSetId: mockDataSetId,
              permissions: [mockReadOnlyUserPermission]
            },
            pageToken
          };
        });
      await expect(
        dataSetService.getAllDataSetAccessPermissions(mockDataSetId, mockAuthenticatedUser, undefined, 1)
      ).resolves.toStrictEqual({
        ...mockAddAccessResponse,
        pageToken
      });
    });

    it('throws when an invalid dataset Id is given.', async () => {
      try {
        await dataSetService.getAllDataSetAccessPermissions(mockInvalidId, mockAuthenticatedUser);
      } catch (error) {
        expect(isDataSetNotFoundError(error)).toBe(true);
        expect(error.message).toBe(`Could not find DataSet '${mockInvalidId}'.`);
        expect(audit.write).toHaveBeenCalledTimes(1);
      }
    });
  });

  describe('getDataSetAccessPermissions', () => {
    it('returns permsissions for the user on the dataset', async () => {
      await expect(
        dataSetService.getDataSetAccessPermissions(
          {
            dataSetId: mockDataSetId,
            identity: mockUserId,
            identityType: 'USER'
          },
          mockAuthenticatedUser
        )
      ).resolves.toStrictEqual(mockAddAccessResponse);
    });
    it('throws when an invalid dataset Id is given.', async () => {
      try {
        await dataSetService.getDataSetAccessPermissions(
          {
            dataSetId: mockInvalidId,
            identity: mockUserId,
            identityType: 'USER'
          },
          mockAuthenticatedUser
        );
      } catch (error) {
        expect(isDataSetNotFoundError(error)).toBe(true);
        expect(error.message).toBe(`Could not find DataSet '${mockInvalidId}'.`);
        expect(audit.write).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('removeDataSetAccessPermissions', () => {
    it('returns access permissions removed from a DataSet', async () => {
      await expect(
        dataSetService.removeDataSetAccessPermissions(mockDataSetAddAccessParams)
      ).resolves.toStrictEqual(mockAddAccessResponse);
    });
    it('throws when the dataSet does not exist', async () => {
      const invalidAccessParams: AddRemoveAccessPermissionRequest = {
        ...mockDataSetAddAccessParams,
        dataSetId: mockInvalidId
      };
      try {
        await dataSetService.removeDataSetAccessPermissions(invalidAccessParams);
      } catch (error) {
        expect(isDataSetNotFoundError(error)).toBe(true);
        expect(error.message).toBe(`Could not find DataSet '${mockInvalidId}'.`);
        expect(audit.write).toHaveBeenCalledTimes(2);
      }
    });
  });

  describe('getExternalEndPoint', () => {
    it('gets the external endpoint', async () => {
      await expect(
        dataSetService.getExternalEndPoint(mockDataSetId, mockExistingEndpointId, mockAuthenticatedUser)
      ).resolves.toStrictEqual<ExternalEndpoint>({
        id: mockExistingEndpointId,
        name: mockExistingEndpointName,
        dataSetId: mockDataSetId,
        dataSetName: mockDataSetName,
        path: mockDataSetPath,
        endPointUrl: mockEndpointUrl,
        endPointAlias: mockAccessPointAlias,
        allowedRoles: [mockRoleArn],
        createdAt: mockCreatedAt,
        accessLevel: mockReadOnlyAccessLevel
      });
    });

    it('throws EndpointNotFoundError when the endpoint does not exist', async () => {
      jest
        .spyOn(DdbDataSetMetadataPlugin.prototype, 'getDataSetEndPointDetails')
        .mockRejectedValueOnce(new EndpointNotFoundError());

      await expect(
        dataSetService.getExternalEndPoint(mockDataSetId, mockEndpointUrl, mockAuthenticatedUser)
      ).rejects.toThrow(EndpointNotFoundError);
    });
  });
});
