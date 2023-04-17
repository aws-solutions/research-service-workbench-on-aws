/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetPermission, PermissionsResponse } from '@aws/workbench-core-datasets';
import { dataSetPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('datasets access permissions integration tests', () => {
  const setup: Setup = new Setup();
  const mockBadValue: string = 'fake-data';
  let adminSession: ClientSession;
  let user: CreateUser;
  let userId: string;

  beforeEach(() => {
    expect.hasAssertions();
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    user = {
      firstName: 'Test',
      lastName: 'User',
      email: `success+create-user-${uuidv4()}@simulator.amazonses.com`
    };
    const userData = await adminSession.resources.users.create(user);
    userId = userData.data.id;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('addDataSetAccessPermissions', () => {
    it('Adds a read-only access permission.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).resolves.toStrictEqual({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'GROUP',
              identity: groupId,
              accessLevel: 'read-only'
            }
          ]
        }
      });
    });
    it('Adds a read-write access permission when read-write is requested.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-write'
          }
        })
      ).resolves.toStrictEqual({
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
    });
    it('adds access permissions for a user.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: 'USER',
            identity: userId,
            accessLevel: 'read-only'
          }
        })
      ).resolves.toStrictEqual({
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
    });
    it('throws if "identityType" is not "GROUP" or "USER"', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: mockBadValue,
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).rejects.toThrow(new HttpError(400, {}));
    });
    it('throws if "accessLevel" is not "read-only" or "read-write"', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            //@ts-ignore
            accessLevel: mockBadValue
          }
        })
      ).rejects.toThrow(new HttpError(400, {}));
    });
    it('throws if the DataSet does not exist.', async () => {
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: `${dataSetPrefix.toLowerCase()}-${uuidv4()}`,
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });

      await expect(
        fakeDataSet.addAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).rejects.toThrow(new HttpError(404, {}));
    });
  });

  describe('getAllDataSetAccessPermissions', () => {
    it('throws if the DataSet does not exist.', async () => {
      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: `${dataSetPrefix.toLowerCase()}-${uuidv4()}`,
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });

      await expect(fakeDataSet.getAllAccess()).rejects.toThrowError(new HttpError(404, {}));
    });
    it('gets a read-write permission for a group', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const permissions: DataSetPermission[] = createDataSetResponse.data.permissions;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const dataSet = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await dataSet.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-write'
        }
      });
      await expect(dataSet.getAllAccess()).resolves.toStrictEqual({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'GROUP',
              identity: groupId,
              accessLevel: 'read-write'
            },
            ...permissions
          ]
        }
      });
    });
    it('gets multiple permissions on a dataset.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const permissions: DataSetPermission[] = createDataSetResponse.data.permissions;
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const dataSet = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await dataSet.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-write'
        }
      });
      await dataSet.addAccess({
        permission: {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      // using await expect(...).toStrictEqual(...) requires permissions order to be
      // deterministic. This is not.
      const response: PermissionsResponse = await dataSet.getAllAccess();
      expect(response.data).toBeDefined();
      expect(response.data.dataSetId).toEqual(dataSetId);
      expect(response.data.permissions).toHaveLength(3);
      // using filter instead of find as failure is desirable on duplicates
      const defaultPermission = response.data.permissions.filter(
        (p: DataSetPermission) => p.identity === permissions[0].identity
      );
      expect(defaultPermission).toStrictEqual(permissions);
      const userPermission = response.data.permissions.filter(
        (p: DataSetPermission) => p.identity === userId
      );
      expect(userPermission).toStrictEqual([
        {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      ]);
      const groupPermission = response.data.permissions.filter(
        (p: DataSetPermission) => p.identity === groupId
      );
      expect(groupPermission).toStrictEqual([
        {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-write'
        }
      ]);
    });
    it('gets multiple permissions on a dataset with page size set to 2', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const permissions: DataSetPermission[] = createDataSetResponse.data.permissions;
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const dataSet = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await dataSet.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      await dataSet.addAccess({
        permission: {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      // using await expect(...).toStrictEqual(...) requires permissions order to be
      // deterministic. This is not.
      const response: PermissionsResponse = await dataSet.getAllAccess({
        pageSize: '2'
      });
      expect(response.data).toBeDefined();
      expect(response.data.dataSetId).toEqual(dataSetId);
      expect(response.data.permissions).toHaveLength(2);

      let allPermissions = response.data.permissions;
      const secondResponse = await dataSet.getAllAccess({
        pageSize: '2',
        pageToken: response.pageToken!
      });
      expect(secondResponse.data).toBeDefined();
      expect(secondResponse.data.dataSetId).toEqual(dataSetId);
      expect(secondResponse.data.permissions).toHaveLength(1);

      allPermissions = [...allPermissions, ...secondResponse.data.permissions];
      // using filter instead of find as failure is desirable on duplicates
      const defaultPermission = allPermissions.filter(
        (p: DataSetPermission) => p.identity === permissions[0].identity
      );
      expect(defaultPermission).toStrictEqual(permissions);
      const userPermission = allPermissions.filter((p: DataSetPermission) => p.identity === userId);
      expect(userPermission).toStrictEqual([
        {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      ]);
      const groupPermission = allPermissions.filter((p: DataSetPermission) => p.identity === groupId);
      expect(groupPermission).toStrictEqual([
        {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-only'
        }
      ]);
    });
  });

  describe('getDatasetAccessPermissions', () => {
    it('throws if the DataSet does not exist.', async () => {
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: `${dataSetPrefix.toLowerCase()}-${uuidv4()}`,
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });

      await expect(fakeDataSet.getAccess('GROUP', groupId)).rejects.toThrow(new HttpError(404, {}));
    });
    it('Gets a read-write access permission for a group.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const dataSet = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await dataSet.addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-write'
        }
      });
      await expect(dataSet.getAccess('GROUP', groupId)).resolves.toStrictEqual({
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
    });
    it('Gets read-only access for a user.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const dataSet = adminSession.resources.datasets.children.get(dataSetId) as Dataset;
      await dataSet.addAccess({
        permission: {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      await expect(dataSet.getAccess('USER', userId)).resolves.toStrictEqual({
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
    });
  });

  describe('removeDataSetAccessPermissions', () => {
    it('removes a read-only access permission.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).removeAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).resolves.toStrictEqual({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'GROUP',
              identity: groupId,
              accessLevel: 'read-only'
            }
          ]
        }
      });
    });
    it('removes a read-write access permission when read-write is requested.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          accessLevel: 'read-write'
        }
      });
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).removeAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-write'
          }
        })
      ).resolves.toStrictEqual({
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
    });
    it('removes access permissions for a user.', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      await (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
        permission: {
          identityType: 'USER',
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).removeAccess({
          permission: {
            identityType: 'USER',
            identity: userId,
            accessLevel: 'read-only'
          }
        })
      ).resolves.toStrictEqual({
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
    });
    it('throws if "accessLevel" is not "read-only" or "read-write"', async () => {
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      await (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
        permission: {
          identityType: 'GROUP',
          identity: groupId,
          //@ts-ignore
          accessLevel: 'read-only'
        }
      });
      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).removeAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            //@ts-ignore
            accessLevel: mockBadValue
          }
        })
      ).rejects.toThrow(new HttpError(400, {}));
    });
    it('throws if the DataSet does not exist.', async () => {
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;

      const fakeDataSet: Dataset = adminSession.resources.datasets.dataset({
        id: `${dataSetPrefix.toLowerCase()}-${uuidv4()}`,
        awsAccountId: mockBadValue,
        storageName: mockBadValue,
        storagePath: mockBadValue
      });

      await expect(
        fakeDataSet.removeAccess({
          permission: {
            identityType: 'GROUP',
            identity: groupId,
            accessLevel: 'read-only'
          }
        })
      ).rejects.toThrow(new HttpError(404, {}));
    });
  });
});
