/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { v4 as uuidv4 } from 'uuid';
import { getConstants } from '../../../src/constants';
import ClientSession from '../../support/clientSession';
import Setup from '../../support/setup';
import RandomTextGenerator from '../../support/utils/randomTextGenerator';
import { uuidRegExp } from '../../support/utils/regExpressions';

describe('multiStep dataset integration test', () => {
  const setup: Setup = new Setup();
  let adminSession: ClientSession;
  let datasetsBucketName: string;

  beforeAll(async () => {
    adminSession = await setup.getDefaultAdminSession();
    const aws = setup.getMainAwsClient();
    const { S3_DATASETS_BUCKET_ARN_OUTPUT_KEY } = getConstants();
    const {
      [S3_DATASETS_BUCKET_ARN_OUTPUT_KEY]: datasetsBucketArn
    } = await aws.helpers.cloudformation.getCfnOutput(setup.getStackName(), [
      S3_DATASETS_BUCKET_ARN_OUTPUT_KEY
    ]);
    datasetsBucketName = datasetsBucketArn.split(':').pop()!;
  });

  afterAll(async () => {
    await setup.cleanup();
  });

  test('Environment provisioning with dataset', async () => {
    const randomTextGenerator = new RandomTextGenerator(setup.getSettings().get('runId'));
    const datasetName = randomTextGenerator.getFakeText('env-DS-test');

    // Create dataset
    const dataSetBody = {
      storageName: datasetsBucketName,
      awsAccountId: setup.getSettings().get('mainAccountId'),
      path: datasetName, // using same name to help potential troubleshooting
      datasetName
    };

    const { data: dataSet } = await adminSession.resources.datasets.create(dataSetBody);
    expect(dataSet).toMatchObject({
      id: expect.stringMatching(uuidRegExp)
    });

    // Provision environment with dataset
    const envBody = {
      envTypeId: setup.getSettings().get('envTypeId'),
      envTypeConfigId: setup.getSettings().get('envTypeConfigId'),
      envType: setup.getSettings().get('envType'),
      datasetIds: [dataSet.id],
      name: uuidv4(),
      projectId: setup.getSettings().get('projectId'),
      description: 'Temporary DataSet for integration test'
    };
    const { data: env } = await adminSession.resources.environments.create(envBody);

    // Verify environment has access point for dataset
    const { data: envDetails } = await adminSession.resources.environments.environment(env.id).get();
    const awsRegion = setup.getSettings().get('awsRegion');
    const mainAccountId = setup.getSettings().get('mainAccountId');
    const accessPointName = `${dataSet.id.slice(0, 13)}-mounted-on-${env.id.slice(0, 13)}`;
    expect(envDetails).toMatchObject({
      datasetIds: [dataSet.id],
      ENDPOINTS: expect.arrayContaining([expect.objectContaining({
        endPointUrl: `s3://arn:aws:s3:${awsRegion}:${mainAccountId}:accesspoint/${accessPointName}`,
        storageArn: `arn:aws:s3:::${datasetsBucketName}`,
        dataSetId: dataSet.id,
        path: datasetName
      })]),
      DATASETS: expect.arrayContaining([expect.objectContaining({
        id: dataSet.id,
        name: datasetName
      })])}
    );

    // Verify dataset has env access point listed in its external endpoints
    const { data: dataSetDetails } = await adminSession.resources.datasets.dataset(dataSet.id).get();
    // Dataset was created just for this test case, so we expect only one endpoint
    expect(dataSetDetails.externalEndpoints).toMatchObject([envDetails.ENDPOINTS[0].sk.split('ENDPOINT#')[1]]);
  });
});
