/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { dataSetPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
import { CreateUser } from '@aws/workbench-core-user-management';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';

describe('DataSets access permissions integration tests', () => {
  const setup: Setup = new Setup();
  const mockBadValue: string = 'fake-data';
  let adminSession: ClientSession;
  let user: CreateUser;

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
      ).resolves.toMatchObject({
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
    it('Adds a read-only and a read-write access permission when read-write is requested.', async () => {
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
      ).resolves.toMatchObject({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'GROUP',
              identity: groupId,
              accessLevel: 'read-only'
            },
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
      const createUserResponse = await adminSession.resources.users.create(user);
      const userData = createUserResponse.data;
      const createDataSetResponse = await adminSession.resources.datasets.create({}, true);
      const dataSetId: string = createDataSetResponse.data.id;

      await expect(
        (adminSession.resources.datasets.children.get(dataSetId) as Dataset).addAccess({
          permission: {
            identityType: 'USER',
            identity: userData.id,
            accessLevel: 'read-only'
          }
        })
      ).resolves.toMatchObject({
        data: {
          dataSetId: dataSetId,
          permissions: [
            {
              identityType: 'USER',
              identity: userData.id,
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
});
