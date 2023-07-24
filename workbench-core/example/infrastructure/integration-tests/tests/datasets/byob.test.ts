/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import { DatasetHelper } from '../../support/complex/datasetHelper';
import Dataset from '../../support/resources/datasets/dataset';
import Setup from '../../support/setup';
import { accessPointS3AliasRegExp, endpointIdRegExp } from '../../support/utils/regExpressions';

describe('datasets byob integration test', () => {
  let setup: Setup;
  let adminSession: ClientSession;
  let byobCreateParams: Record<string, string>;

  let hostRegion: string;
  let roleToAssume: string;

  beforeEach(() => {
    expect.hasAssertions();

    hostRegion = adminSession.getSettings().get('HostingAccountRegion');
    roleToAssume = adminSession.getSettings().get('ExampleHostDatasetRoleOutput');

    byobCreateParams = {
      storageName: adminSession.getSettings().get('ExampleHostS3DataSetsBucketName'),
      awsAccountId: adminSession.getSettings().get('HostingAccountId'),
      region: hostRegion,
      roleToAssume
    };
  });

  beforeAll(async () => {
    setup = new Setup();
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  describe('ProvisionDataSet', () => {
    it('creates an external dataset', async () => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { roleToAssume, ...expected } = byobCreateParams;

      const { data } = await adminSession.resources.datasets.create(byobCreateParams);

      expect(data).toStrictEqual({
        ...expected,
        createdAt: expect.any(String),
        id: expect.any(String),
        name: expect.any(String),
        path: expect.any(String),
        storageType: expect.any(String),
        permissions: expect.any(Array)
      });
    });
  });

  describe('AddExternalEndpointForUser', () => {
    it('creates an endpoint for a user for an external dataset', async () => {
      const { data: userData } = await adminSession.resources.users.create({
        firstName: 'Test',
        lastName: 'User',
        email: `success+add-external-endpoint-${uuidv4()}@simulator.amazonses.com`
      });

      const { data: datasetData } = await adminSession.resources.datasets.create({
        ...byobCreateParams,
        permissions: [
          {
            identityType: 'USER',
            identity: userData.id,
            accessLevel: 'read-only'
          }
        ]
      });
      const dataset = adminSession.resources.datasets.children.get(datasetData.id) as Dataset;

      const { data } = await dataset.share({
        userId: userData.id,
        region: hostRegion,
        roleToAssume
      });

      expect(data).toStrictEqual({
        mountObject: {
          name: dataset.storagePath,
          bucket: expect.stringMatching(accessPointS3AliasRegExp),
          prefix: dataset.storagePath,
          endpointId: expect.stringMatching(endpointIdRegExp)
        }
      });
    });
  });

  describe('PresignedSinglePartUpload', () => {
    it('generates a presigned URL and upload a file using that URL for an external dataset', async () => {
      const { data: datasetData } = await adminSession.resources.datasets.create(byobCreateParams);
      const dataset = adminSession.resources.datasets.children.get(datasetData.id) as Dataset;

      const fileName = uuidv4();
      const { data } = await dataset.generateSinglePartFileUploadUrl({
        fileName,
        region: hostRegion,
        roleToAssume
      });

      await adminSession.getAxiosInstance().put(data.url, { fake: 'data' });

      const hostAwsService = await setup.getHostAwsClient('Main-Account-File-Upload');

      const files = await DatasetHelper.listDatasetFileNames(
        hostAwsService,
        dataset.storageName,
        dataset.storagePath
      );
      expect(files.length > 0).toBe(true);
      expect(files).toContain(`${dataset.storagePath}/${fileName}`);
    });
  });
});
