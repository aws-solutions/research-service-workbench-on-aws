import {
  AddRemoveAccessPermissionRequest,
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetStoragePlugin,
  PermissionsResponse
} from '@aws/swb-app';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService,
  Effect,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import {
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { MockDatabaseService } from '../mocks/mockDatabaseService';
import { DataSetService } from './dataSetService';

describe('DataSetService', () => {
  let dataSetService: DataSetService;

  let mockStoragePlugin: DataSetStoragePlugin;
  let mockWorkbenchDataSetService: WorkbenchDataSetService;
  let mockDataSetsAuthPlugin: DataSetsAuthorizationPlugin;
  let mockDatabaseService: MockDatabaseService;
  let mockDynamicAuthService: DynamicAuthorizationService;
  let mockUser: AuthenticatedUser;

  beforeEach(() => {
    mockStoragePlugin = {} as DataSetStoragePlugin;
    mockWorkbenchDataSetService = {} as WorkbenchDataSetService;
    mockDataSetsAuthPlugin = {} as DataSetsAuthorizationPlugin;
    mockDatabaseService = new MockDatabaseService();
    mockDynamicAuthService = {} as DynamicAuthorizationService;

    mockUser = {
      id: 'sampleId',
      roles: []
    };

    dataSetService = new DataSetService(
      mockStoragePlugin,
      mockWorkbenchDataSetService,
      mockDataSetsAuthPlugin,
      mockDatabaseService,
      mockDynamicAuthService
    );

    const mockDataSet: DataSet = {
      id: 'dataSetId',
      owner: 'projectId',
      name: 'mockDataSet',
      path: 'path',
      storageName: 'storageName',
      storageType: 'storageType'
    };
    mockWorkbenchDataSetService.provisionDataSet = jest.fn().mockReturnValueOnce(mockDataSet);

    mockDynamicAuthService.createIdentityPermissions = jest.fn();
    mockWorkbenchDataSetService.addDataSetAccessPermissions = jest.fn();
  });

  describe('provisionDataSet', () => {
    let identityPermissions: IdentityPermission[];
    let identityId: string;
    let identityType: IdentityType;
    let subjectId: string;
    let subjectType: string;
    let effect: Effect;
    let actions: Action[];

    describe('requests permissions for', () => {
      let createDatasetRequest: CreateProvisionDatasetRequest;

      beforeEach(() => {
        createDatasetRequest = {
          authenticatedUser: mockUser,
          awsAccountId: '',
          description: '',
          name: '',
          owner: '',
          path: '',
          permissions: [
            {
              identity: 'projectId-datasetId',
              identityType: 'GROUP',
              accessLevel: 'read-write'
            }
          ],
          region: '',
          storageName: '',
          storageProvider: mockStoragePlugin,
          type: ''
        };
      });

      describe('Project Admin', () => {
        describe('for DATASET', () => {
          beforeEach(() => {
            identityId = 'projectId#PA';
            identityType = 'USER';
            subjectId = 'dataSetId';
            subjectType = 'DATASET';
            effect = 'ALLOW';
            actions = ['READ', 'UPDATE', 'DELETE'];

            identityPermissions = actions.map((action: Action) => {
              return {
                action: action,
                effect: effect,
                identityId: identityId,
                identityType: identityType,
                subjectId: subjectId,
                subjectType: subjectType
              };
            });
          });

          test('from the AuthZ service', async () => {
            await dataSetService.provisionDataSet(createDatasetRequest);

            expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
              authenticatedUser: mockUser,
              identityPermissions: identityPermissions
            });
          });
        });

        describe('for DATASET_ACCESS_LEVELS', () => {
          beforeEach(() => {
            identityId = 'projectId#PA';
            identityType = 'USER';
            subjectId = 'projectId-dataSetId';
            subjectType = 'DATASET_ACCESS_LEVELS';
            effect = 'ALLOW';
            actions = ['READ', 'UPDATE'];

            identityPermissions = actions.map((action: Action) => {
              return {
                action: action,
                effect: effect,
                identityId: identityId,
                identityType: identityType,
                subjectId: subjectId,
                subjectType: subjectType
              };
            });
          });

          test('from the AuthZ service', async () => {
            await dataSetService.provisionDataSet(createDatasetRequest);

            expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
              authenticatedUser: mockUser,
              identityPermissions: identityPermissions
            });
          });
        });
      });
    });
  });

  describe('addAccessForProject', () => {
    let addAccessPermissionRequest: AddRemoveAccessPermissionRequest;
    let dataSetId: string;
    let projectId: string;
    let accessLevel: 'read-only' | 'read-write';

    beforeEach(() => {
      dataSetId = 'dataSetId';
      projectId = 'projectId';
      accessLevel = 'read-write';

      addAccessPermissionRequest = {
        authenticatedUser: mockUser,
        dataSetId,
        permission: {
          identity: projectId,
          identityType: 'GROUP',
          accessLevel
        }
      };

      mockDynamicAuthService.createIdentityPermissions = jest.fn(
        (request: CreateIdentityPermissionsRequest): Promise<CreateIdentityPermissionsResponse> => {
          return Promise.resolve({
            data: {
              identityPermissions: []
            }
          });
        }
      );

      const permissionsResponse: PermissionsResponse = {
        data: {
          dataSetId,
          permissions: {
            accessLevel: accessLevel,
            identity: projectId,
            identityType: 'GROUP'
          }
        }
      };

      mockDataSetsAuthPlugin.addAccessPermission = jest.fn().mockReturnValueOnce(permissionsResponse);
    });

    test('pass the request through to the datasets auth plugin', async () => {
      await dataSetService.addAccessForProject(addAccessPermissionRequest);
      expect(mockDataSetsAuthPlugin.addAccessPermission).toHaveBeenCalledWith(addAccessPermissionRequest);
    });

    describe('when building the relationship between the Project and Dataset', () => {
      describe('it adds entries for', () => {
        test('Project with Dataset', async () => {
          await dataSetService.addAccessForProject(addAccessPermissionRequest);

          const associations = await mockDatabaseService.getAssociations(
            resourceTypeToKey.project,
            projectId
          );

          expect(associations).toEqual([
            {
              type: 'DATASET',
              id: dataSetId,
              data: {
                id: projectId,
                permission: accessLevel
              }
            }
          ]);
        });

        test('Dataset with Project', async () => {
          await dataSetService.addAccessForProject(addAccessPermissionRequest);

          const associations = await mockDatabaseService.getAssociations(
            resourceTypeToKey.dataset,
            dataSetId
          );

          expect(associations).toEqual([
            {
              type: 'PROJ',
              id: projectId,
              data: {
                id: dataSetId,
                permission: accessLevel
              }
            }
          ]);
        });
      });
    });

    describe('when updating AuthZ permission for the Dataset', () => {
      test('READ access is requested for the Project Admin and the Project Researcher', async () => {
        await dataSetService.addAccessForProject(addAccessPermissionRequest);
        expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
          authenticatedUser: mockUser,
          identityPermissions: [
            {
              action: 'READ',
              effect: 'ALLOW',
              identityId: 'projectId#PA',
              identityType: 'USER',
              subjectId: 'dataSetId',
              subjectType: 'DATASET'
            },
            {
              action: 'READ',
              effect: 'ALLOW',
              identityId: 'projectId#Researcher',
              identityType: 'USER',
              subjectId: 'dataSetId',
              subjectType: 'DATASET'
            }
          ]
        });
      });
    });
  });
});
