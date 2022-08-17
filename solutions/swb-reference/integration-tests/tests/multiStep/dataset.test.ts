/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { uuidRegExp } from '../../support/utils/regExpressions';
import Settings from '../../support/utils/settings';

describe('multiStep dataset integration test', () => {
  const setup: Setup = new Setup();
  const settings: Settings = setup.getSettings();
  let adminSession: ClientSession;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('Environment provisioning with dataset', async () => {
    const randomTextGenerator = new RandomTextGenerator(settings.get('runId'));
    const datasetName = randomTextGenerator.getFakeText('env-DS-test');

    // Create dataset
    const dataSetBody = {
      storageName: settings.get('DataSetsBucketName'),
      awsAccountId: settings.get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      datasetName
    };

    const { data: dataSet } = await adminSession.resources.datasets.create(dataSetBody);
    expect(dataSet).toMatchObject({
      id: expect.stringMatching(uuidRegExp)
    });

    // Provision environment with dataset
    const envBody = {
      envTypeId: settings.get('envTypeId'),
      envTypeConfigId: settings.get('envTypeConfigId'),
      envType: settings.get('envType'),
      datasetIds: [dataSet.id],
      name: uuidv4(),
      projectId: settings.get('projectId'),
      description: 'Temporary DataSet for integration test'
    };
    const { data: env } = await adminSession.resources.environments.create(envBody);

    // Verify environment has access point for dataset
    const { data: envDetails } = await adminSession.resources.environments.environment(env.id).get();
    const awsRegion = settings.get('awsRegion');
    const mainAccountId = settings.get('mainAccountId');
    const accessPointName = `${dataSet.id.slice(0, 13)}-mounted-on-${env.id.slice(0, 13)}`;
    expect(envDetails).toMatchObject({
      datasetIds: [dataSet.id],
      ENDPOINTS: expect.arrayContaining([
        expect.objectContaining({
          endPointUrl: `s3://arn:aws:s3:${awsRegion}:${mainAccountId}:accesspoint/${accessPointName}`,
          storageArn: `arn:aws:s3:::${settings.get('DataSetsBucketName')}`,
          dataSetId: dataSet.id,
          path: datasetName
        })
      ]),
      DATASETS: expect.arrayContaining([
        expect.objectContaining({
          id: dataSet.id,
          name: datasetName
        })
      ])
    });

    // Verify dataset has env access point listed in its external endpoints
    const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id).get();
    // Dataset was created just for this test case, so we expect only one endpoint
    expect(dataSetDetails.externalEndpoints).toMatchObject([
      envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]
    ]);
  });
});
