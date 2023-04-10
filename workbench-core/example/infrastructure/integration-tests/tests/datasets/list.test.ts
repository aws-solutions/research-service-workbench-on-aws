/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSet, StorageLocation } from '@aws/workbench-core-datasets';
import { dataSetSubjectType } from '@aws/workbench-core-datasets/lib/dataSetsAuthorizationPlugin';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';

describe('datasets list integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('ListDataSets', () => {
    let datasets: Dataset[];
    let userId: string;
    let groupId: string;
    let updatedAdminSession: ClientSession;

    beforeAll(async () => {
      // create a dynamic authz group and add the authenticated user to it
      const { data } = await adminSession.resources.groups.create();
      groupId = data.groupId;
      userId = adminSession.getSettings().get('rootUserId');
      await adminSession.resources.groups.group(groupId).addUser({ userId });

      // create adminSession with updated authenticated user groups
      updatedAdminSession = await setup.createAdminSession();
    });

    beforeEach(async () => {
      // create a group of 5 datasets
      const dataSetsData = await Promise.all(
        Array.from({ length: 5 }, () => adminSession.resources.datasets.create())
      );
      datasets = dataSetsData.map(
        (data) => adminSession.resources.datasets.children.get(data.data.id) as Dataset
      );

      // remove default permission from each dataset
      await Promise.all(
        datasets.map((dataset) =>
          dataset.removeAccess({
            permission: {
              identity: userId,
              identityType: 'USER',
              accessLevel: 'read-only'
            }
          })
        )
      );
    });

    it('should return an empty array when the user has no permissions on any dataset', async () => {
      const response = await updatedAdminSession.resources.datasets.get();
      expect(response.data?.data).toStrictEqual([]);
    });

    it('should not return the datasets that the user has no permissions on from their userId', async () => {
      await datasets[0].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[4].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: DataSet) => dataset.id);

      expect(dataSetIds).toStrictEqual(expect.not.arrayContaining([datasets[1].id, datasets[3].id]));
      expect(dataSetIds).toStrictEqual(
        expect.arrayContaining([datasets[0].id, datasets[2].id, datasets[4].id])
      );
    });

    it('should not return the datasets that the user has no permissions on from the groups they are in', async () => {
      await datasets[0].addAccess({
        permission: {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      });
      await datasets[4].addAccess({
        permission: {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      });

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: Dataset) => dataset.id);

      expect(dataSetIds).toStrictEqual(expect.not.arrayContaining([datasets[1].id, datasets[3].id]));
      expect(dataSetIds).toStrictEqual(
        expect.arrayContaining([datasets[0].id, datasets[2].id, datasets[4].id])
      );
    });

    it('should not return the datasets that the user has no permissions on from a combo of their userId and the groups they are in', async () => {
      await datasets[0].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      });

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: Dataset) => dataset.id);

      expect(dataSetIds).toStrictEqual(
        expect.not.arrayContaining([datasets[1].id, datasets[3].id, datasets[4].id])
      );
      expect(dataSetIds).toStrictEqual(expect.arrayContaining([datasets[0].id, datasets[2].id]));
    });

    it('should return the datasets that the user has permissions on when the permissions are for read-write access', async () => {
      await datasets[0].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-write'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-write'
        }
      });

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: Dataset) => dataset.id);

      expect(dataSetIds).toStrictEqual(
        expect.not.arrayContaining([datasets[1].id, datasets[3].id, datasets[4].id])
      );
      expect(dataSetIds).toStrictEqual(expect.arrayContaining([datasets[0].id, datasets[2].id]));
    });

    it('should not return the datasets that the user does not have READ permissions on', async () => {
      // give READ permissions to 2 datasets
      await datasets[0].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });

      // give UPDATE permission on a dataset, CREATE permission on another, and DELETE permission on a third
      await updatedAdminSession.resources.identityPermissions.create(
        {
          identityPermissions: [
            {
              identityType: 'USER',
              identityId: userId,
              action: 'UPDATE',
              effect: 'ALLOW',
              subjectType: dataSetSubjectType,
              subjectId: datasets[1].id
            },
            {
              identityType: 'USER',
              identityId: userId,
              action: 'CREATE',
              effect: 'ALLOW',
              subjectType: dataSetSubjectType,
              subjectId: datasets[3].id
            },
            {
              identityType: 'USER',
              identityId: userId,
              action: 'DELETE',
              effect: 'ALLOW',
              subjectType: dataSetSubjectType,
              subjectId: datasets[4].id
            }
          ]
        },
        false
      );

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: Dataset) => dataset.id);

      expect(dataSetIds).toStrictEqual(
        expect.not.arrayContaining([datasets[1].id, datasets[3].id, datasets[4].id])
      );
      expect(dataSetIds).toStrictEqual(expect.arrayContaining([datasets[0].id, datasets[2].id]));
    });

    it('should not return the datasets that the user has both ALLOW and DENY permissions on', async () => {
      // give READ permissions to 3 datasets
      await datasets[0].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[2].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });
      await datasets[4].addAccess({
        permission: {
          identity: userId,
          identityType: 'USER',
          accessLevel: 'read-only'
        }
      });

      // give DENY READ permission on one of the above datasets
      await updatedAdminSession.resources.identityPermissions.create(
        {
          identityPermissions: [
            {
              identityType: 'USER',
              identityId: userId,
              action: 'READ',
              effect: 'DENY',
              subjectType: dataSetSubjectType,
              subjectId: datasets[4].id
            }
          ]
        },
        false
      );

      const { data } = await updatedAdminSession.resources.datasets.get();
      const dataSetIds = data.data?.map((dataset: Dataset) => dataset.id);

      expect(dataSetIds).toStrictEqual(
        expect.not.arrayContaining([datasets[1].id, datasets[3].id, datasets[4].id])
      );
      expect(dataSetIds).toStrictEqual(expect.arrayContaining([datasets[0].id, datasets[2].id]));
    });
  });

  describe('ListStorageLocations', () => {
    it('should return StorageLocation entries', async () => {
      const { data: dataset } = await adminSession.resources.datasets.create();

      const location: StorageLocation = {
        name: dataset.storageName,
        type: dataset.storageType,
        region: dataset.region,
        awsAccountId: dataset.awsAccountId
      };
      const { data: storageLocationData } = await adminSession.resources.datasets.storageLocations();

      expect(storageLocationData.data).toStrictEqual([location]);
    });
  });
});
