import { AddRemoveAccessPermissionRequest, DataSetStoragePlugin, PermissionsResponse } from '@aws/swb-app';
import { AuditService } from '@aws/workbench-core-audit';
import {
  AuthenticatedUser,
  CreateIdentityPermissionsRequest,
  CreateIdentityPermissionsResponse,
  DynamicAuthorizationService
} from '@aws/workbench-core-authorization';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { DataSetMetadataPlugin, DataSetsAuthorizationPlugin } from '@aws/workbench-core-datasets';
import { LoggingService } from '@aws/workbench-core-logging';
import { MockDatabaseService } from '../mocks/mockDatabaseService';
import { DataSetService } from './dataSetService';

describe('DataSetService', () => {
  let dataSetService: DataSetService;

  let mockStoragePlugin: DataSetStoragePlugin;
  let mockAuditService: AuditService;
  let mockLoggerService: LoggingService;
  let mockDataSetMetadataPlugin: DataSetMetadataPlugin;
  let mockDataSetsAuthPlugin: DataSetsAuthorizationPlugin;
  let mockDatabaseService: MockDatabaseService;
  let mockDynamicAuthService: DynamicAuthorizationService;

  beforeEach(() => {
    mockStoragePlugin = {} as DataSetStoragePlugin;
    mockAuditService = {} as AuditService;
    mockLoggerService = {} as LoggingService;
    mockDataSetMetadataPlugin = {} as DataSetMetadataPlugin;
    mockDataSetsAuthPlugin = {} as DataSetsAuthorizationPlugin;
    mockDatabaseService = new MockDatabaseService();
    mockDynamicAuthService = {} as DynamicAuthorizationService;

    dataSetService = new DataSetService(
      mockStoragePlugin,
      mockAuditService,
      mockLoggerService,
      mockDataSetMetadataPlugin,
      mockDataSetsAuthPlugin,
      mockDatabaseService,
      mockDynamicAuthService
    );
  });

  describe('addAccessForProject', () => {
    let addAccessPermissionRequest: AddRemoveAccessPermissionRequest;
    let dataSetId: string;
    let projectId: string;
    let accessLevel: 'read-only' | 'read-write';
    let mockUser: AuthenticatedUser;

    beforeEach(() => {
      dataSetId = 'dataSetId';
      projectId = 'projectId';
      accessLevel = 'read-write';
      mockUser = {
        id: 'sampleId',
        roles: []
      };

      addAccessPermissionRequest = {
        authenticatedUser: mockUser,
        dataSetId,
        permission: {
          identity: projectId,
          identityType: 'GROUP',
          accessLevel: accessLevel
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
