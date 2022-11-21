/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { DataSet } from '@aws/workbench-core-datasets';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import HttpError from '../../support/utils/HttpError';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { dsUuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';
import { checkHttpError } from '../../support/utils/utilities';

describe('multiStep dataset integration test', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;
  let randomTextGenerator: RandomTextGenerator;
  let dataSet: DataSet;

  beforeEach(async () => {
    randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    const datasetName = randomTextGenerator.getFakeText('env-DS-test');

    // Create dataset
    const dataSetBody = {
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      datasetName,
      region: settings.get('awsRegion')
    };

    const { data } = await adminSession.resources.datasets.create(dataSetBody);
    dataSet = data;
  });

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('Environment provisioning with dataset', async () => {
    expect(dataSet).toMatchObject({
      id: expect.stringMatching(dsUuidRegExp)
    });

    // Provision environment with dataset
    const envBody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [dataSet.id],
      name: randomTextGenerator.getFakeText('dataset-name'),
      projectId: settings.get('projectId'),
      description: 'Temporary DataSet for integration test'
    };
    const { data: env } = await adminSession.resources.environments.create(envBody);

    // Verify environment has access point for dataset
    const { data: envDetails } = await adminSession.resources.environments.environment(env.id).get();
    const awsRegion = settings.get('awsRegion');
    const mainAccountId = settings.get('mainAccountId');
    const accessPointName = `${dataSet.id!.slice(0, 13)}-mounted-on-${env.id.slice(0, 12)}`;
    expect(envDetails).toMatchObject({
      ENDPOINTS: expect.arrayContaining([
        expect.objectContaining({
          endPointUrl: `s3://arn:aws:s3:${awsRegion}:${mainAccountId}:accesspoint/${accessPointName}`,
          storageArn: `arn:aws:s3:::${settings.get('DataSetsBucketName')}`,
          dataSetId: dataSet.id,
          path: dataSet.name
        })
      ]),
      DATASETS: expect.arrayContaining([
        expect.objectContaining({
          id: dataSet.id,
          name: dataSet.name
        })
      ])
    });

    // Verify dataset has env access point listed in its external endpoints
    const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id!).get();
    // Dataset was created just for this test case, so we expect only one endpoint
    expect(dataSetDetails.externalEndpoints).toMatchObject([
      envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]
    ]);
  });

  test('Create and delete dataset', async () => {
    const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id!).get();
    expect(dataSetDetails).toMatchObject({
      id: expect.stringMatching(dsUuidRegExp),
      name: dataSet.name
    });

    await adminSession.resources.datasets.dataset(dataSet.id!).delete();

    try {
      await adminSession.resources.datasets.dataset(dataSet.id!).get();
    } catch (e) {
      checkHttpError(
        e,
        new HttpError(404, {
          statusCode: 404,
          error: 'Not Found',
          message: `Could not find DataSet '${dataSet.id}'.`
        })
      );
    }
  });
});
