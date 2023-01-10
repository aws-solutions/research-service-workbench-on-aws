import { AddRemoveAccessPermissionRequest, DataSetStoragePlugin, PermissionsResponse } from '@aws/swb-app';
import { AuditService } from '@aws/workbench-core-audit';
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

  beforeEach(() => {
    mockStoragePlugin = {} as DataSetStoragePlugin;
    mockAuditService = {} as AuditService;
    mockLoggerService = {} as LoggingService;
    mockDataSetMetadataPlugin = {} as DataSetMetadataPlugin;
    mockDataSetsAuthPlugin = {} as DataSetsAuthorizationPlugin;
    mockDatabaseService = new MockDatabaseService();

    dataSetService = new DataSetService(
      mockStoragePlugin,
      mockAuditService,
      mockLoggerService,
      mockDataSetMetadataPlugin,
      mockDataSetsAuthPlugin,
      mockDatabaseService
    );
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
        dataSetId,
        permission: {
          subject: projectId,
          accessLevel: accessLevel
        }
      };
    });

    describe('when building the relationship between the Project and Dataset', () => {
      beforeEach(() => {
        const permissionsResponse: PermissionsResponse = {
          data: {
            dataSetId,
            permissions: {
              accessLevel: accessLevel,
              subject: projectId
            }
          }
        };

        mockDataSetsAuthPlugin.addAccessPermission = jest.fn().mockReturnValueOnce(permissionsResponse);
      });

      describe('it adds entries for', () => {
        beforeEach(async () => {
          await dataSetService.addAccessForProject(addAccessPermissionRequest);
        });

        test('Project with Dataset', async () => {
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
      describe('READ access is given to', () => {
        test('the Project Admin', () => {});

        test('the Project Researcher', () => {});
      });
    });

    describe('when setting DataSetAuth access permission for the Project', () => {
      test('it overwrites the old value', () => {});
    });
  });
});
