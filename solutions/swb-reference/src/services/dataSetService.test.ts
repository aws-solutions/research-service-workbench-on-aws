/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  ConflictError,
  CreateProvisionDatasetRequest,
  DataSet,
  DataSetExternalEndpointRequest,
  DataSetStoragePlugin,
  PermissionsResponse
} from '@aws/swb-app';
import { IsProjectAuthorizedForDatasetsParser } from '@aws/swb-app/lib/dataSets/isProjectAuthorizedForDatasetsParser';
import { ListDataSetAccessPermissionsRequestParser } from '@aws/swb-app/lib/dataSets/listDataSetAccessPermissionsRequestParser';
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
  GetIdentityPermissionsBySubjectResponse,
  IdentityPermission,
  IdentityType
} from '@aws/workbench-core-authorization';
import { JSONValue, resourceTypeToKey } from '@aws/workbench-core-base';
import {
  AddRemoveAccessPermissionRequest,
  DataSetParser,
  DataSetsAuthorizationPlugin,
  DataSetService as WorkbenchDataSetService
} from '@aws/workbench-core-datasets';
import { SwbAuthZSubject } from '../constants';
import { MockDatabaseService } from '../mocks/mockDatabaseService';
import { getProjectAdminRole } from '../utils/roleUtils';
import { Associable } from './databaseService';
import { DataSetService } from './dataSetService';

describe('DataSetService', () => {
  let dataSetService: DataSetService;

  let mockStoragePlugin: DataSetStoragePlugin;
  let mockWorkbenchDataSetService: WorkbenchDataSetService;
  let mockDataSetsAuthPlugin: DataSetsAuthorizationPlugin;
  let mockDatabaseService: MockDatabaseService;
  let mockDynamicAuthService: DynamicAuthorizationService;
  let mockUser: AuthenticatedUser;

  let mockDataSet: DataSet;
  let projectId: string;

  beforeEach(() => {
    mockStoragePlugin = {} as DataSetStoragePlugin;
    mockWorkbenchDataSetService = {} as WorkbenchDataSetService;
    mockDataSetsAuthPlugin = {} as DataSetsAuthorizationPlugin;
    mockDatabaseService = new MockDatabaseService();
    mockDynamicAuthService = {} as DynamicAuthorizationService;

    mockUser = {
      id: '12345678-1234-1234-1234-123456789012',
      roles: []
    };
    projectId = 'proj-projectId';

    mockDataSet = DataSetParser.parse({
      id: 'dataSetId',
      owner: `${projectId}#ProjectAdmin`,
      name: 'mockDataSet',
      path: 'path',
      storageName: 'storageName',
      storageType: 'storageType',
      createdAt: '2023-02-14T19:18:46'
    });

    dataSetService = new DataSetService(
      mockStoragePlugin,
      mockWorkbenchDataSetService,
      mockDataSetsAuthPlugin,
      mockDatabaseService,
      mockDynamicAuthService
    );

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
      await dataSetService.listDataSets({} as AuthenticatedUser, 1, undefined);
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
    let conditions: Record<string, JSONValue>;

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

        mockWorkbenchDataSetService.provisionDataSet = jest.fn().mockReturnValueOnce(mockDataSet);
      });

      describe('Project Admin', () => {
        describe('for DATASET', () => {
          beforeEach(() => {
            identityId = `${projectId}#ProjectAdmin`;
            identityType = 'GROUP';
            subjectId = 'dataSetId';
            subjectType = SwbAuthZSubject.SWB_DATASET;
            effect = 'ALLOW';
            actions = ['READ', 'UPDATE', 'DELETE'];
            conditions = { projectId: { $eq: projectId } };

            identityPermissions = actions.map((action: Action) => {
              return {
                action: action,
                effect: effect,
                identityId: identityId,
                identityType: identityType,
                subjectId: subjectId,
                subjectType: subjectType,
                conditions: conditions
              };
            });
          });

          test('from the AuthZ service', async () => {
            await dataSetService.provisionDataSet(projectId, createDatasetRequest);

            expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
              authenticatedUser: mockUser,
              identityPermissions: identityPermissions
            });
          });
        });

        describe('for DATASET_ACCESS_LEVELS', () => {
          beforeEach(() => {
            identityId = `${projectId}#ProjectAdmin`;
            identityType = 'GROUP';
            subjectId = `dataSetId`;
            subjectType = SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL;
            effect = 'ALLOW';
            actions = ['READ', 'UPDATE', 'DELETE'];

            identityPermissions = actions.map((action: Action) => {
              return {
                action,
                effect,
                identityId,
                identityType,
                subjectId,
                subjectType
              };
            });
          });

          test('from the AuthZ service', async () => {
            await dataSetService.provisionDataSet(projectId, createDatasetRequest);

            expect(mockDynamicAuthService.createIdentityPermissions).toHaveBeenCalledWith({
              authenticatedUser: mockUser,
              identityPermissions: identityPermissions
            });
          });
        });
      });
    });
  });

  describe('removeDataSet', () => {
    describe('when dataset id does not exists', () => {
      let notFoundError: Error;

      beforeEach(() => {
        notFoundError = new Error('underlying workbench core DatasetService error for getDataSet call');
        mockWorkbenchDataSetService.getDataSet = jest.fn().mockImplementation(() => {
          throw notFoundError;
        });
      });

      test('it throws an error', async () => {
        await expect(dataSetService.removeDataSet('fake-id', mockUser)).rejects.toThrowError(notFoundError);
      });
    });

    describe('when the dataset exists', () => {
      beforeEach(() => {
        mockWorkbenchDataSetService.getDataSet = jest.fn().mockReturnValueOnce(mockDataSet);
      });

      describe('and is associated with external projects', () => {
        const externalProjectId = 'proj-external';
        beforeEach(() => {
          const getIdentityPermissionsBySubjectResponse: GetIdentityPermissionsBySubjectResponse = {
            data: {
              identityPermissions: [
                {
                  action: 'READ',
                  effect: 'ALLOW',
                  identityId: `${externalProjectId}#ProjectAdmin`,
                  identityType: 'GROUP',
                  subjectId: mockDataSet.id!,
                  subjectType: SwbAuthZSubject.SWB_DATASET,
                  conditions: { projectId: { $eq: projectId } }
                }
              ]
            }
          };
          mockDynamicAuthService.getIdentityPermissionsBySubject = jest
            .fn()
            .mockReturnValueOnce(getIdentityPermissionsBySubjectResponse);
        });

        test('it throws an error', async () => {
          await expect(dataSetService.removeDataSet(mockDataSet.id!, mockUser)).rejects.toThrowError(
            `DataSet cannot be removed because it is still associated with roles in the provided project(s)`
          );
        });
      });

      describe('and is not associated with any external projects', () => {
        beforeEach(() => {
          const getIdentityPermissionsBySubjectResponse: GetIdentityPermissionsBySubjectResponse = {
            data: {
              identityPermissions: []
            }
          };
          mockDynamicAuthService.getIdentityPermissionsBySubject = jest
            .fn()
            .mockReturnValueOnce(getIdentityPermissionsBySubjectResponse);
          mockWorkbenchDataSetService.removeDataSet = jest.fn();
          mockDynamicAuthService.deleteIdentityPermissions = jest.fn();
        });

        test('it delegates removal of the dataset to the workbench core DataSetService', async () => {
          await dataSetService.removeDataSet(mockDataSet.id!, mockUser);
          expect(mockWorkbenchDataSetService.removeDataSet).toHaveBeenCalledTimes(1);
        });

        describe('removes permissions', () => {
          let identityPermissions: IdentityPermission[];

          beforeEach(() => {
            mockDynamicAuthService.deleteIdentityPermissions = jest.fn();
          });

          describe('for DATASET', () => {
            beforeEach(() => {
              const actions: Action[] = ['READ', 'UPDATE', 'DELETE'];
              identityPermissions = actions.map((action: Action) => {
                return {
                  action,
                  effect: 'ALLOW',
                  identityId: `${projectId}#ProjectAdmin`,
                  identityType: 'GROUP',
                  subjectId: 'dataSetId',
                  subjectType: SwbAuthZSubject.SWB_DATASET
                };
              });
            });

            test('in AuthZ', async () => {
              await dataSetService.removeDataSet(mockDataSet.id!, mockUser);
              expect(mockDynamicAuthService.deleteIdentityPermissions).toHaveBeenCalledWith({
                identityPermissions,
                authenticatedUser: mockUser
              });
            });
          });

          describe('for DATASET_ACCESS_LEVEL', () => {
            beforeEach(() => {
              const actions: Action[] = ['READ', 'UPDATE', 'DELETE'];
              identityPermissions = actions.map((action: Action) => {
                return {
                  action,
                  effect: 'ALLOW',
                  identityId: `${projectId}#ProjectAdmin`,
                  identityType: 'GROUP',
                  subjectId: `dataSetId`,
                  subjectType: SwbAuthZSubject.SWB_DATASET_ACCESS_LEVEL
                };
              });
            });

            test('in AuthZ', async () => {
              await dataSetService.removeDataSet(mockDataSet.id!, mockUser);
              expect(mockDynamicAuthService.deleteIdentityPermissions).toHaveBeenCalledWith({
                identityPermissions,
                authenticatedUser: mockUser
              });
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

        mockWorkbenchDataSetService.getDataSet = jest.fn().mockReturnValueOnce(mockDataSet);
        mockDataSetsAuthPlugin.addAccessPermission = jest.fn().mockReturnValueOnce(permissionsResponse);
      });

      test('it passes the request through to the datasets auth plugin', async () => {
        await dataSetService.addAccessForProject(projectAddAccessRequest);
        const permissionRequest: AddRemoveAccessPermissionRequest = {
          authenticatedUser: projectAddAccessRequest.authenticatedUser,
          dataSetId: projectAddAccessRequest.dataSetId,
          permission: [
            {
              identity: 'projectId#ProjectAdmin',
              identityType: 'GROUP',
              accessLevel: projectAddAccessRequest.accessLevel!
            },
            {
              identity: 'projectId#Researcher',
              identityType: 'GROUP',
              accessLevel: projectAddAccessRequest.accessLevel!
            }
          ]
        };
        expect(mockDataSetsAuthPlugin.addAccessPermission).toHaveBeenCalledWith(permissionRequest);
      });

      describe('the Dataset is already associate with the Project', () => {
        beforeEach(async () => {
          const project: Associable = {
            type: resourceTypeToKey.project,
            id: projectId,
            data: {
              id: dataSetId,
              permission: accessLevel
            }
          };

          const dataset: Associable = {
            type: resourceTypeToKey.dataset,
            id: dataSetId,
            data: {
              id: projectId,
              permission: accessLevel
            }
          };

          await mockDatabaseService.storeAssociations(dataset, [project]);
        });

        test('it throws a Conflict Error', async () => {
          const error = new ConflictError('Project is already associated with Dataset');
          await expect(dataSetService.addAccessForProject(projectAddAccessRequest)).rejects.toThrowError(
            error
          );
        });
      });

      describe('when the Project and Dataset have not yet been associated', () => {
        describe('it adds entries for', () => {
          test('Project with Dataset', async () => {
            await dataSetService.addAccessForProject(projectAddAccessRequest);

            const associations = await mockDatabaseService.getAssociations(
              resourceTypeToKey.project,
              projectId
            );

            expect(associations).toEqual([
              {
                type: resourceTypeToKey.dataset,
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
              resourceTypeToKey.dataset,
              dataSetId
            );

            expect(associations).toEqual([
              {
                type: resourceTypeToKey.project,
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
                subjectType: SwbAuthZSubject.SWB_DATASET,
                conditions: { projectId: { $eq: projectId } }
              },
              {
                action: 'READ',
                effect: 'ALLOW',
                identityId: 'projectId#Researcher',
                identityType: 'GROUP',
                subjectId: 'dataSetId',
                subjectType: SwbAuthZSubject.SWB_DATASET,
                conditions: { projectId: { $eq: projectId } }
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

        mockDataSet = DataSetParser.parse({
          id: 'dataSetId',
          owner: `${projectId}#ProjectAdmin`,
          name: 'mockDataSet',
          path: 'path',
          storageName: 'storageName',
          storageType: 'storageType',
          createdAt: '2023-02-14T19:18:46'
        });
        mockWorkbenchDataSetService.getDataSet = jest.fn().mockReturnValue(mockDataSet);
        mockDatabaseService.listAssociations = jest.fn().mockReturnValue({ data: [] });
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

            mockDataSet.owner = getProjectAdminRole(projectId);
          });

          test('it throws an error', async () => {
            await expect(dataSetService.removeAccessForProject(projectRemoveAccessRequest)).rejects.toThrow(
              new ConflictError(
                `Requested project cannot remove access from dataset for the ProjectAdmin because it owns that dataset.`
              )
            );
          });
        });

        describe('to a project they do not administer', () => {
          const otherProjectId = 'proj-otherProjectId';
          beforeEach(async () => {
            projectRemoveAccessRequest = {
              authenticatedUser: mockUser,
              dataSetId,
              projectId: otherProjectId
            };

            const projectAddAccessRequest: ProjectAddAccessRequest = {
              authenticatedUser: mockUser,
              dataSetId,
              projectId: otherProjectId,
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
                  identity: `${otherProjectId}#ProjectAdmin`,
                  identityType: 'GROUP',
                  accessLevel: 'read-write'
                },
                {
                  identity: `${otherProjectId}#Researcher`,
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
                resourceTypeToKey.project,
                otherProjectId
              );

              expect(projectAssociations.length).toEqual(1);

              const datasetAssociation = await mockDatabaseService.getAssociations(
                resourceTypeToKey.dataset,
                dataSetId
              );

              expect(datasetAssociation.length).toEqual(1);
            });

            test('Project with Dataset', async () => {
              await dataSetService.removeAccessForProject(projectRemoveAccessRequest);

              const associations = await mockDatabaseService.getAssociations(
                resourceTypeToKey.project,
                otherProjectId
              );

              expect(associations).toEqual([]);
            });

            test('Dataset with Project', async () => {
              await dataSetService.removeAccessForProject(projectRemoveAccessRequest);

              const associations = await mockDatabaseService.getAssociations(
                resourceTypeToKey.dataset,
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
                    identityId: `${otherProjectId}#ProjectAdmin`,
                    identityType: 'GROUP',
                    subjectId: 'dataSetId',
                    subjectType: SwbAuthZSubject.SWB_DATASET_UPLOAD
                  },
                  {
                    action: 'READ',
                    effect: 'ALLOW',
                    identityId: `${otherProjectId}#Researcher`,
                    identityType: 'GROUP',
                    subjectId: 'dataSetId',
                    subjectType: SwbAuthZSubject.SWB_DATASET_UPLOAD
                  }
                ]
              });
            });
          });
        });
      });
    });
  });

  describe('listDataSetAccessPermissions', () => {
    beforeEach(() => {
      const response: PermissionsResponse = {
        data: {
          dataSetId: mockDataSet.id!,
          permissions: [
            {
              accessLevel: 'read-only',
              identity: `${projectId}#Researcher`,
              identityType: 'GROUP'
            }
          ]
        }
      };
      mockWorkbenchDataSetService.getAllDataSetAccessPermissions = jest.fn().mockReturnValueOnce(response);
    });

    test('it delegates to the workbench-core DataSetService method', async () => {
      const request = ListDataSetAccessPermissionsRequestParser.parse({
        dataSetId: 'dataset-12345678-1234-1234-1234-123456789012',
        authenticatedUser: mockUser,
        paginationToken: ''
      });

      await dataSetService.listDataSetAccessPermissions(request);

      expect(mockWorkbenchDataSetService.getAllDataSetAccessPermissions).toHaveBeenCalled();
    });
  });

  describe('listDataSetsForProject', () => {
    let pageSize: number;
    let paginationToken: string | undefined;

    beforeEach(() => {
      pageSize = 1;
      paginationToken = '';
    });

    describe('when user role contains ITAdmin', () => {
      beforeEach(() => {
        mockUser = {
          id: 'sampleId',
          roles: ['ITAdmin']
        };
      });

      describe('role only has ITAdmin', () => {
        test('it succeeds, and response with empty data list and undefined pagination', async () => {
          // BUILD
          const mockResponse = {
            data: [],
            paginationToken: undefined
          };
          // OPERATE
          const actualResponse = await dataSetService.listDataSetsForProject(
            projectId,
            mockUser,
            pageSize,
            paginationToken
          );
          // CHECK
          expect(actualResponse).toEqual(mockResponse);
        });
      });

      describe('role contains ITAdmin and ProjectAdmin', () => {
        beforeEach(() => {
          mockUser.roles.push(getProjectAdminRole(projectId));
        });

        test('it succeeds, and response with empty data list and undefined pagination', async () => {
          const mockResponse = {
            data: [],
            paginationToken: undefined
          };
          const actualResponse = await dataSetService.listDataSetsForProject(
            projectId,
            mockUser,
            pageSize,
            paginationToken
          );
          expect(actualResponse).toEqual(mockResponse);
        });
      });
    });

    describe('when user role does not contains ITAdmin', () => {
      beforeEach(() => {
        mockUser = {
          id: 'sampleId',
          roles: []
        };
      });

      // check filtering by project works
      describe('when workbenchDataSetService returns datasets from multiple projects', () => {
        let queriedProjectId: string;
        let otherProjectId: string;
        let mockDataSetWithoutOwner: DataSet;
        let mockDataSetListWithOwner: DataSet[];

        beforeEach(() => {
          queriedProjectId = 'proj-queriedProjectId';
          otherProjectId = 'proj-otherProjectId';

          mockDataSetWithoutOwner = DataSetParser.parse({
            id: 'dataSetId',
            name: 'mockDataSet',
            path: 'path',
            storageName: 'storageName',
            storageType: 'storageType',
            createdAt: '2023-02-14T19:18:46'
          });

          // have different projectIds as owner
          mockDataSetListWithOwner = [
            { ...mockDataSetWithoutOwner, owner: `${queriedProjectId}#ProjectAdmin` },
            { ...mockDataSetWithoutOwner, owner: `${otherProjectId}#ProjectAdmin` },
            { ...mockDataSetWithoutOwner, owner: `${otherProjectId}#Researcher` },
            { ...mockDataSetWithoutOwner, owner: `${queriedProjectId}#Researcher` }
          ];

          mockWorkbenchDataSetService.listDataSets = jest.fn().mockReturnValueOnce({
            data: mockDataSetListWithOwner,
            paginationToken: undefined
          });

          mockWorkbenchDataSetService.getPaginationToken = jest.fn().mockReturnValueOnce('');
        });

        describe('when results from workbenchDataSetService is less or equal to pageSize', () => {
          beforeEach(() => {
            pageSize = 5;
          });
          test('response only contains queried projectId', async () => {
            const mockResponseData = [
              { ...mockDataSetWithoutOwner, owner: `${queriedProjectId}#ProjectAdmin` },
              { ...mockDataSetWithoutOwner, owner: `${queriedProjectId}#Researcher` }
            ];

            const actualResponse = await dataSetService.listDataSetsForProject(
              queriedProjectId,
              mockUser,
              pageSize,
              paginationToken
            );

            expect(actualResponse.data).toEqual(mockResponseData);
            expect(actualResponse.data.length).toBeLessThanOrEqual(pageSize);
          });
        });

        describe('when results from workbenchDataSetService is greater than pageSize', () => {
          beforeEach(() => {
            pageSize = 1;
          });

          test('response only contains queried projectId, and length is pageSIze', async () => {
            const mockResponseData = [
              { ...mockDataSetWithoutOwner, owner: `${queriedProjectId}#ProjectAdmin` }
            ];

            const actualResponse = await dataSetService.listDataSetsForProject(
              queriedProjectId,
              mockUser,
              pageSize,
              paginationToken
            );

            expect(actualResponse.data).toEqual(mockResponseData);
            expect(actualResponse.data.length).toEqual(pageSize);
          });
        });
      });

      // check paginationToken gets returned if mock of workbenchDataSetService returns a pagination token
      describe('when workbenchDataSetService returns a pagination token', () => {
        let mockReturnedToken: string;
        let randomInputToken: string;

        beforeEach(() => {
          mockReturnedToken = 'samplePaginationToken';
          randomInputToken = '';

          mockWorkbenchDataSetService.listDataSets = jest.fn().mockReturnValueOnce({
            data: [mockDataSet], // have one result to avoid infinite loop
            paginationToken: mockReturnedToken
          });
        });

        test('this pagination get returned', async () => {
          // OPERATE
          const actualResponse = await dataSetService.listDataSetsForProject(
            projectId,
            mockUser,
            pageSize,
            randomInputToken
          );
          // CHECK
          expect(actualResponse.paginationToken).toEqual(mockReturnedToken);
        });
      });

      // check when result set from ddb is larger than pageSize, we call workbenchDataSetService.getPaginationToken and return token from that
      describe('when workbenchDataSetService returns a dataset length greater than pageSize', () => {
        projectId = 'proj-projectId';
        const mockDataSetWithoutID = {
          owner: `${projectId}#ProjectAdmin`,
          name: 'mockDataSet',
          path: 'path',
          storageName: 'storageName',
          storageType: 'storageType',
          createdAt: '2023-02-14T19:18:46'
        };
        let mockDataSetListWithID: DataSet[];
        let customToken: string | undefined;

        beforeEach(() => {
          mockDataSetListWithID = [
            DataSetParser.parse({ ...mockDataSetWithoutID, id: 'dataSetId1' }),
            DataSetParser.parse({ ...mockDataSetWithoutID, id: 'dataSetId2' })
          ];

          pageSize = 1;
          mockWorkbenchDataSetService.listDataSets = jest.fn().mockReturnValueOnce({
            data: mockDataSetListWithID, //length larger than pageSize
            paginationToken: undefined
          });
          customToken = 'customToken';
          mockWorkbenchDataSetService.getPaginationToken = jest.fn().mockReturnValueOnce(customToken);
        });

        test('pagination token from .getPaginationToken is returned', async () => {
          // OPERATE
          const actualResponse = await dataSetService.listDataSetsForProject(
            projectId,
            mockUser,
            pageSize,
            paginationToken
          );
          // CHECK
          expect(mockWorkbenchDataSetService.getPaginationToken).toBeCalledWith(
            actualResponse.data[pageSize - 1].id!
          );
          expect(actualResponse.paginationToken).toEqual(customToken);
        });
      });
    });
  });

  describe('isProjectAuthorizedForDatasets', () => {
    test('GIVEN empty DatasetIds list SHOULD return true', async () => {
      const request = IsProjectAuthorizedForDatasetsParser.parse({
        authenticatedUser: mockUser,
        datasetIds: [],
        projectId: projectId
      });
      const response = await dataSetService.isProjectAuthorizedForDatasets(request);
      expect(response).toEqual(true);
    });

    test('GIVEN datasetIds with access permissions SHOULD return true', async () => {
      const mockResponse = {
        data: {
          permissions: ['accessPermission']
        }
      };
      dataSetService.getAccessPermissions = jest.fn().mockReturnValueOnce(mockResponse);
      const request = IsProjectAuthorizedForDatasetsParser.parse({
        authenticatedUser: mockUser,
        datasetIds: ['dataset1'],
        projectId: projectId
      });
      const response = await dataSetService.isProjectAuthorizedForDatasets(request);
      expect(response).toEqual(true);
    });

    test('GIVEN datasetIds with no access permissions SHOULD return false', async () => {
      const mockResponse = {
        data: {
          permissions: []
        }
      };
      dataSetService.getAccessPermissions = jest.fn().mockReturnValueOnce(mockResponse);
      const request = IsProjectAuthorizedForDatasetsParser.parse({
        authenticatedUser: mockUser,
        datasetIds: ['dataset1'],
        projectId: projectId
      });
      const response = await dataSetService.isProjectAuthorizedForDatasets(request);
      expect(response).toEqual(false);
    });
  });
});
