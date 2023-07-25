/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetPermission } from '@aws/workbench-core-datasets';
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { DatasetHelper } from '../../support/complex/datasetHelper';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { accessPointS3AliasRegExp, endpointIdRegExp } from '../../support/utils/regExpressions';

describe('datasets create integration test', () => {
  let setup: Setup;
  let adminSession: ClientSession;
  let randomTextGenerator: RandomTextGenerator;

  let fakeDataSetId: string;

  beforeEach(() => {
    expect.hasAssertions();

    fakeDataSetId = 'example-ds-badbadba-dbad-badb-adba-dbadbadbadba';
  });

  beforeAll(async () => {
    setup = new Setup();
    adminSession = await setup.getDefaultAdminSession();
    randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('ProvisionDataSet', () => {
    it('assigns default permissions when a dataSet is created.', async () => {
      const response = await adminSession.resources.datasets.create({}, true);
      expect(response.data).toBeDefined();
      expect(response.data.id).toBeDefined();
      expect(response.data.permissions).toBeDefined();
      expect(response.data.permissions.length).toBe(1);
      expect(response.data.permissions[0].accessLevel).toEqual('read-only');
      expect(response.data.permissions[0].identityType).toEqual('USER');
    });
    it('assigns permissions to a group given at creation time.', async () => {
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      const response = await adminSession.resources.datasets.create({
        permissions: [
          {
            identity: groupId,
            identityType: 'GROUP',
            accessLevel: 'read-write'
          }
        ]
      });

      expect(response.data.id).toBeDefined();
      expect(response.data.permissions).toStrictEqual<DataSetPermission[]>([
        {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-write'
        }
      ]);
    });
    it('assigns read-only permissions to the owner if provided at creation time', async () => {
      const createGroupResponse = await adminSession.resources.groups.create({}, true);
      const { groupId } = createGroupResponse.data;
      const response = await adminSession.resources.datasets.create({
        owner: groupId,
        ownerType: 'GROUP'
      });
      expect(response.data.permissions).toStrictEqual<DataSetPermission[]>([
        {
          identity: groupId,
          identityType: 'GROUP',
          accessLevel: 'read-only'
        }
      ]);
    });
    it('doesnt store the authenticated user in ddb', async () => {
      const { data } = await adminSession.resources.datasets.create();

      const mainAwsService = setup.getMainAwsClient('ExampleDataSetDDBTableName');
      const metadata = await DatasetHelper.getddbRecords(mainAwsService, data.id);

      expect(metadata.authenticatedUser).toBeUndefined();
    });
  });

  describe('AddExternalEndpointForUser', () => {
    let dataset: Dataset;
    let userId: string;
    let identityType: string;

    beforeAll(async () => {
      identityType = 'USER';
      const { data } = await adminSession.resources.users.create({
        firstName: 'Test',
        lastName: 'User',
        email: `success+add-external-endpoint-${uuidv4()}@simulator.amazonses.com`
      });
      userId = data.id;
    });

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('creates an endpoint for a user for a dataset', async () => {
      await dataset.addAccess({
        permission: {
          identityType,
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      const { data } = await dataset.share({ userId });

      expect(data).toStrictEqual({
        mountObject: {
          name: dataset.storagePath,
          bucket: expect.stringMatching(accessPointS3AliasRegExp),
          prefix: dataset.storagePath,
          endpointId: expect.stringMatching(endpointIdRegExp)
        }
      });

      // confirm authenticated user isnt present in ddb
      const mainAwsService = setup.getMainAwsClient('ExampleDataSetDDBTableName');
      const metadata = await DatasetHelper.getddbRecords(
        mainAwsService,
        dataset.id,
        data.mountObject.endpointId
      );
      expect(metadata.authenticatedUser).toBeUndefined();
    });

    it('throws when adding an endpoint to a dataset which does not exist', async () => {
      await expect(
        adminSession.resources.datasets
          .dataset({ id: fakeDataSetId, awsAccountId: '', storageName: '', storagePath: '' })
          .share({ userId })
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when attempting to create an endpoint that already exists', async () => {
      const externalEndpointName = `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

      await dataset.addAccess({
        permission: {
          identityType,
          identity: userId,
          accessLevel: 'read-only'
        }
      });
      await dataset.share({ externalEndpointName, userId });

      await expect(dataset.share({ externalEndpointName, userId })).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the userId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share({ userId })).rejects.toThrow(new HttpError(403, {}));
    });
  });

  describe('AddExternalEndpointForGroup', () => {
    let dataset: Dataset;
    let groupId: string;
    let identityType: string;

    beforeAll(async () => {
      identityType = 'GROUP';
      groupId = randomTextGenerator.getFakeText('test-authZ-group');
      await adminSession.resources.groups.create({ groupId });
    });

    beforeEach(async () => {
      const { data } = await adminSession.resources.datasets.create();
      dataset = adminSession.resources.datasets.children.get(data.id) as Dataset;
    });

    it('creates an endpoint for a group for a dataset', async () => {
      await dataset.addAccess({
        permission: {
          identityType,
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      const { data } = await dataset.share({ groupId });

      expect(data).toStrictEqual({
        mountObject: {
          name: dataset.storagePath,
          bucket: expect.stringMatching(accessPointS3AliasRegExp),
          prefix: dataset.storagePath,
          endpointId: expect.stringMatching(endpointIdRegExp)
        }
      });

      // confirm authenticated user isnt present in ddb
      const mainAwsService = setup.getMainAwsClient('ExampleDataSetDDBTableName');
      const metadata = await DatasetHelper.getddbRecords(
        mainAwsService,
        dataset.id,
        data.mountObject.endpointId
      );
      expect(metadata.authenticatedUser).toBeUndefined();
    });

    it('throws when adding an endpoint to a dataset which does not exist', async () => {
      await expect(
        adminSession.resources.datasets
          .dataset({ id: fakeDataSetId, awsAccountId: '', storageName: '', storagePath: '' })
          .share({ groupId })
      ).rejects.toThrow(new HttpError(404, {}));
    });

    it('throws when attempting to create an endpoint that already exists', async () => {
      const randomTextGenerator = new RandomTextGenerator(adminSession.getSettings().get('runId'));
      const externalEndpointName = `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

      await dataset.addAccess({
        permission: {
          identityType,
          identity: groupId,
          accessLevel: 'read-only'
        }
      });
      await dataset.share({ externalEndpointName, groupId });

      await expect(dataset.share({ externalEndpointName, groupId })).rejects.toThrow(new HttpError(400, {}));
    });

    it('throws when the groupId doesnt have permission to access the dataset', async () => {
      await expect(dataset.share({ groupId })).rejects.toThrow(new HttpError(403, {}));
    });
  });
});
