/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetExternalEndpointRequest,
  DataSetStoragePlugin,
  PermissionsResponse
} from '@aws/swb-app';
import { ProjectAddAccessRequest } from '@aws/swb-app/lib/dataSets/projectAddAccessRequestParser';
import { ProjectRemoveAccessRequest } from '@aws/swb-app/lib/dataSets/projectRemoveAccessRequestParser';
import {
  Action,
  AuthenticatedUser,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DeleteIdentityPermissionsRequest,
  DeleteIdentityPermissionsResponse,
  DynamicAuthorizationService,
  Effect,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import {
  AddRemoveAccessPermissionRequest,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { SwbAuthZSubject } from '../constants';
import { MockDatabaseService } from '../mocks/mockDatabaseService';
import { getProjectAdminRole } from '../utils/roleUtils';
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
      owner: 'projectId#ProjectAdmin',
      name: 'mockDataSet',
      path: 'path',
      storageName: 'storageName',
      storageType: 'storageType'
    };
    mockWorkbenchDataSetService.provisionDataSet = jest.fn().mockReturnValueOnce(mockDataSet);

    mockDynamicAuthService.createIdentityPermissions = jest.fn();
    mockWorkbenchDataSetService.addDataSetAccessPermissions = jest.fn();
  });

  describe('utilizes DataSetService functionality from workbench core', () => {
    beforeEach(() => {
      mockWorkbenchDataSetService.importDataSet = jest.fn();
      mockWorkbenchDataSetService.addDataSetExternalEndpointForGroup = jest.fn();
      mockWorkbenchDataSetService.getDataSet = jest.fn();
      mockWorkbenchDataSetService.listDataSets = jest.fn();
    });

    test('for importDataSet', async () => {
      await dataSetService.importDataSet({} as CreateProvisionDatasetRequest);
      expect(mockWorkbenchDataSetService.importDataSet).toHaveBeenCalled();
    });

    test('for provisionDataSet', async () => {
      await dataSetService.addDataSetExternalEndpoint({} as DataSetExternalEndpointRequest);
      expect(mockWorkbenchDataSetService.addDataSetExternalEndpointForGroup).toHaveBeenCalled();
    });

    test('for getDataSet', async () => {
      await dataSetService.getDataSet('dataSetId', {} as AuthenticatedUser);
      expect(mockWorkbenchDataSetService.getDataSet).toHaveBeenCalled();
    });

    test('for listDataSets', async () => {
      await dataSetService.listDataSets({} as AuthenticatedUser);
      expect(mockWorkbenchDataSetService.listDataSets).toHaveBeenCalled();
    });
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
            identityId = 'projectId#ProjectAdmin';
            identityType = 'GROUP';
            subjectId = 'dataSetId';
            subjectType = SwbAuthZSubject.SWB_DATASET;
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
            identityId = 'projectId#ProjectAdmin';
            identityType = 'GROUP';
            subjectId = 'projectId-dataSetId';
            subjectType = SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL;
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

  describe('dataset access management', () => {
    let dataSetId: string;
    let projectId: string;
    let accessLevel: 'read-only' | 'read-write';

    beforeEach(() => {
      dataSetId = 'dataSetId';
      projectId = 'projectId';
      accessLevel = 'read-write';
    });

    describe('addAccessForProject', () => {
      let projectAddAccessRequest: ProjectAddAccessRequest;

      beforeEach(() => {
        projectAddAccessRequest = {
          authenticatedUser: mockUser,
          dataSetId,
          projectId,
          accessLevel
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
            permissions: [
              {
                accessLevel: accessLevel,
                identity: 'projectId#ProjectAdmin',
                identityType: 'GROUP'
              }
            ]
          }
        };

        mockDataSetsAuthPlugin.addAccessPermission = jest.fn().mockReturnValueOnce(permissionsResponse);
      });

      test('pass the request through to the datasets auth plugin', async () => {
        await dataSetService.addAccessForProject(projectAddAccessRequest);
        const permissionRequest: AddRemoveAccessPermissionRequest = {
          authenticatedUser: projectAddAccessRequest.authenticatedUser,
          dataSetId: projectAddAccessRequest.dataSetId,
          permission: {
            identity: 'projectId#ProjectAdmin',
            identityType: 'GROUP',
            accessLevel: projectAddAccessRequest.accessLevel!
          }
        };
        expect(mockDataSetsAuthPlugin.addAccessPermission).toHaveBeenCalledWith(permissionRequest);
      });

      describe('when building the relationship between the Project and Dataset', () => {
        describe('it adds entries for', () => {
          test('Project with Dataset', async () => {
            await dataSetService.addAccessForProject(projectAddAccessRequest);

            const associations = await mockDatabaseService.getAssociations(
              SwbAuthZSubject.SWB_PROJECT,
              projectId
            );

            expect(associations).toEqual([
              {
                type: SwbAuthZSubject.SWB_DATASET,
                id: dataSetId,
                data: {
                  id: 'projectId',
                  permission: accessLevel
                }
              }
            ]);
          });

          test('Dataset with Project', async () => {
            await dataSetService.addAccessForProject(projectAddAccessRequest);

            const associations = await mockDatabaseService.getAssociations(
              SwbAuthZSubject.SWB_DATASET,
              dataSetId
            );

            expect(associations).toEqual([
              {
                type: SwbAuthZSubject.SWB_PROJECT,
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
          await dataSetService.addAccessForProject(projectAddAccessRequest);
          expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
            authenticatedUser: mockUser,
            identityPermissions: [
              {
                action: 'READ',
                effect: 'ALLOW',
                identityId: 'projectId#ProjectAdmin',
                identityType: 'GROUP',
                subjectId: 'dataSetId',
                subjectType: SwbAuthZSubject.SWB_DATASET
              },
              {
                action: 'READ',
                effect: 'ALLOW',
                identityId: 'projectId#Researcher',
                identityType: 'GROUP',
                subjectId: 'dataSetId',
                subjectType: SwbAuthZSubject.SWB_DATASET
              }
            ]
          });
        });
      });
    });

    describe('removeAccessForProject', () => {
      let projectRemoveAccessRequest: ProjectRemoveAccessRequest;

      beforeEach(() => {
        projectRemoveAccessRequest = {
          authenticatedUser: mockUser,
          dataSetId,
          projectId
        };

        mockDynamicAuthService.deleteIdentityPermissions = jest.fn(
          (request: DeleteIdentityPermissionsRequest): Promise<DeleteIdentityPermissionsResponse> => {
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
            permissions: [
              {
                accessLevel: accessLevel,
                identity: 'projectId#ProjectAdmin',
                identityType: 'GROUP'
              }
            ]
          }
        };

        mockDataSetsAuthPlugin.removeAccessPermissions = jest.fn().mockReturnValueOnce(permissionsResponse);
      });

      describe('when a projectAdmin removes access', () => {
        describe('to a project they administer', () => {
          beforeEach(() => {
            mockUser = {
              id: 'userId',
              roles: [getProjectAdminRole(projectId)]
            };

            projectRemoveAccessRequest = {
              authenticatedUser: mockUser,
              dataSetId,
              projectId
            };
          });

          test('it throws an error', async () => {
            await expect(dataSetService.removeAccessForProject(projectRemoveAccessRequest)).rejects.toThrow(
              new Error(
                `${projectId} cannot remove access from ${dataSetId} for the ProjectAdmin because it owns that dataset.`
              )
            );
          });
        });

        describe('to a project they do not administer', () => {
          beforeEach(async () => {
            const projectAddAccessRequest: ProjectAddAccessRequest = {
              authenticatedUser: mockUser,
              dataSetId,
              projectId,
              accessLevel: 'read-only'
            };

            const permissionsResponse: PermissionsResponse = {
              data: {
                dataSetId,
                permissions: [
                  {
                    accessLevel: accessLevel,
                    identity: 'projectId#ProjectAdmin',
                    identityType: 'GROUP'
                  }
                ]
              }
            };
            mockDataSetsAuthPlugin.addAccessPermission = jest.fn().mockReturnValueOnce(permissionsResponse);
            await dataSetService.addAccessForProject(projectAddAccessRequest);
          });

          test('pass the request through to the datasets auth plugin', async () => {
            await dataSetService.removeAccessForProject(projectRemoveAccessRequest);
            const permissionRequest: AddRemoveAccessPermissionRequest = {
              authenticatedUser: projectRemoveAccessRequest.authenticatedUser,
              dataSetId: projectRemoveAccessRequest.dataSetId,
              permission: [
                {
                  identity: 'projectId#ProjectAdmin',
                  identityType: 'GROUP',
                  accessLevel: 'read-write'
                },
                {
                  identity: 'projectId#Researcher',
                  identityType: 'GROUP',
                  accessLevel: 'read-write'
                }
              ]
            };
            expect(mockDataSetsAuthPlugin.removeAccessPermissions).toHaveBeenCalledWith(permissionRequest);
          });

          describe('it removes database relationship entries for', () => {
            beforeEach(async () => {
              const projectAssociations = await mockDatabaseService.getAssociations(
                SwbAuthZSubject.SWB_PROJECT,
                projectId
              );

              expect(projectAssociations.length).toEqual(1);

              const datasetAssociation = await mockDatabaseService.getAssociations(
                SwbAuthZSubject.SWB_DATASET,
                dataSetId
              );

              expect(datasetAssociation.length).toEqual(1);
            });

            test('Project with Dataset', async () => {
              await dataSetService.removeAccessForProject(projectRemoveAccessRequest);

              const associations = await mockDatabaseService.getAssociations(
                SwbAuthZSubject.SWB_PROJECT,
                projectId
              );

              expect(associations).toEqual([]);
            });

            test('Dataset with Project', async () => {
              await dataSetService.removeAccessForProject(projectRemoveAccessRequest);

              const associations = await mockDatabaseService.getAssociations(
                SwbAuthZSubject.SWB_DATASET,
                dataSetId
              );

              expect(associations).toEqual([]);
            });
          });

          describe('it removes authZ permissions for', () => {
            test('the Researcher and ProjectAdmin groups', async () => {
              await dataSetService.removeAccessForProject(projectRemoveAccessRequest);
              expect(mockDynamicAuthService.deleteIdentityPermissions).toHaveBeenCalledWith({
                authenticatedUser: mockUser,
                identityPermissions: [
                  {
                    action: 'READ',
                    effect: 'ALLOW',
                    identityId: 'projectId#ProjectAdmin',
                    identityType: 'GROUP',
                    subjectId: 'dataSetId',
                    subjectType: SwbAuthZSubject.SWB_DATASET
                  },
                  {
                    action: 'READ',
                    effect: 'ALLOW',
                    identityId: 'projectId#Researcher',
                    identityType: 'GROUP',
                    subjectId: 'dataSetId',
                    subjectType: SwbAuthZSubject.SWB_DATASET
                  }
                ]
              });
            });
          });
        });
      });
    });
  });
});
