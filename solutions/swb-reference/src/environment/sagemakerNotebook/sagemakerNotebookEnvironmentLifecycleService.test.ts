/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({
  v4: jest.fn()
}));
const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

import { AwsService } from '@amzn/workbench-core-base';
import {
  EnvironmentLifecycleHelper,
  EnvironmentService,
  Environment
} from '@amzn/workbench-core-environments';
import SagemakerNotebookEnvironmentLifecycleService from './sagemakerNotebookEnvironmentLifecycleService';

describe('SagemakerNotebookEnvironmentLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  let environment: Environment;
  const MOCK_DATASETS_BUCKET_ARN = 'arn:aws:s3:::sampleDatasetsBucket';
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.S3_DATASETS_BUCKET_ARN_OUTPUT_KEY = 'S3BucketDatasetsArnOutput';
    mockUuid.v4.mockImplementationOnce(() => 'sampleEnvId');
    environment = {
      id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
      createdAt: '2022-05-05T19:39:03.023Z',
      status: 'PENDING',
      updatedAt: '2022-05-05T19:43:57.143Z',
      cidr: '1.1.1.1/32',
      description: 'blah',
      instanceId: '123',
      error: undefined,
      name: 'sagemaker',
      outputs: [],
      projectId: 'proj-123',
      datasetIds: [],
      envTypeConfigId: 'ETC-123',
      provisionedProductId: '123',
      owner: 'blah',
      type: 'envTypeTest',
      dependency: 'proj-123',
      updatedBy: 'blah',
      createdBy: 'blah',
      PROJ: {
        subnetId: 'subnet-07f475d83291a3603',
        accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
        resourceType: 'project',
        hostingAccountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-hosting-account-role',
        awsAccountId: '123456789012',
        environmentInstanceFiles: 's3://fake-s3-bucket-idvfndkjnwodw/environment-files',
        createdAt: '2022-05-18T20:33:42.608Z',
        vpcId: 'vpc-0b0bc7ae01d82e7b3',
        envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-dev-va-env-mgmt',
        name: 'Example project',
        encryptionKeyArn: 'arn:aws:kms:us-east-1:123456789012:key/123',
        externalId: 'workbench',
        updatedAt: '2022-05-18T20:33:42.608Z',
        sk: 'PROJ#proj-123',
        pk: 'ENV#6e185c8c-caeb-4305-8f08-d408b316dca7',
        id: 'proj-123'
      },
      ETC: {
        pk: 'ETC',
        sk: 'ET#envType-123ETC#envTypeConfig-123',
        createdAt: '2022-02-03T20:06:45.428Z',
        createdBy: 'u-HJtc1fiQnF5XNmrIu6KLU',
        desc: 'An Amazon SageMaker Jupyter Notebook',
        id: 'envTypeConfig-123',
        name: 'Jupyter Notebook',
        owner: 'u-HJtc1fiQnF5XNmrIu6KLU',
        params: [
          {
            key: 'IamPolicyDocument',
            value: '${iamPolicyDocument}'
          },
          {
            key: 'InstanceType',
            value: 'ml.t3.medium'
          },
          {
            key: 'AutoStopIdleTimeInMinutes',
            value: '0'
          },
          {
            key: 'CIDR',
            value: '1.1.1.1/32'
          }
        ],
        productId: 'prod-hxwmltpkg2edy',
        provisioningArtifactId: 'pa-fh6spfcycydtq',
        resourceType: 'envTypeConfig',
        status: 'approved',
        type: 'sagemaker',
        updatedAt: '2022-02-03T20:07:56.697Z',
        updatedBy: 'u-HJtc1fiQnF5XNmrIu6KLU'
      }
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  test('Launch should return mocked id', async () => {
    const envHelper = new EnvironmentLifecycleHelper();
    envHelper.launch = jest.fn();
    envHelper.getCfnOutputs = jest.fn(async () => {
      return {
        datasetsBucketArn: MOCK_DATASETS_BUCKET_ARN,
        mainAccountRegion: 'us-east-1',
        mainAccountId: '123456789012'
      };
    });
    envHelper.getDatasetsToMount = jest.fn(async () => {
      return { s3Mounts: '[exampleDs]', iamPolicyDocument: '{exampleDs}' };
    });
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);

    const sm = new SagemakerNotebookEnvironmentLifecycleService();
    sm.helper = envHelper;
    const response = await sm.launch(environment);
    expect(response).toEqual({ ...environment, status: 'PENDING' });
  });

  test('Launch should return mocked id when mounting datasets', async () => {
    const envHelper = new EnvironmentLifecycleHelper();
    environment.datasetIds = ['exampleDS'];
    envHelper.launch = jest.fn();
    envHelper.getCfnOutputs = jest.fn(async () => {
      return {
        datasetsBucketArn: MOCK_DATASETS_BUCKET_ARN,
        mainAccountRegion: 'us-east-1',
        mainAccountId: '123456789012'
      };
    });
    envHelper.getDatasetsToMount = jest.fn(async () => {
      return { s3Mounts: '[exampleDs]', iamPolicyDocument: '{exampleDs}' };
    });
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);

    const sm = new SagemakerNotebookEnvironmentLifecycleService();
    sm.helper = envHelper;
    const response = await sm.launch(environment);
    expect(response).toEqual({ ...environment, status: 'PENDING' });
  });

  test('Terminate should operate as expected', async () => {
    const envHelper = new EnvironmentLifecycleHelper();
    envHelper.executeSSMDocument = jest.fn();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();

    const sm = new SagemakerNotebookEnvironmentLifecycleService();
    sm.helper = envHelper;
    sm.envService = envService;
    const response = await sm.terminate(environment.id!);
    expect(response).toEqual({ envId: environment.id, status: 'TERMINATING' });
  });

  test('Start should operate as expected', async () => {
    const sm = new SagemakerNotebookEnvironmentLifecycleService();
    const hostSdk = new AwsService({ region: process.env.AWS_REGION! });
    hostSdk.clients.sagemaker.startNotebookInstance = jest.fn();
    const envHelper = new EnvironmentLifecycleHelper();
    envHelper.getAwsSdkForEnvMgmtRole = jest.fn(async () => hostSdk);
    sm.helper = envHelper;
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    sm.envService = envService;

    await expect(sm.start('6e185c8c-caeb-4305-8f08-d408b316dca7')).resolves.not.toThrowError();
  });
  test('Stop should operate as expected', async () => {
    const sm = new SagemakerNotebookEnvironmentLifecycleService();
    const envService = new EnvironmentService({ TABLE_NAME: process.env.STACK_NAME! });
    const hostSdk = new AwsService({ region: process.env.AWS_REGION! });
    hostSdk.clients.sagemaker.stopNotebookInstance = jest.fn();
    const envHelper = new EnvironmentLifecycleHelper();
    envHelper.getAwsSdkForEnvMgmtRole = jest.fn(async () => hostSdk);
    sm.helper = envHelper;
    envService.getEnvironment = jest.fn(async () => environment);
    envService.updateEnvironment = jest.fn();
    sm.envService = envService;

    await expect(sm.stop('6e185c8c-caeb-4305-8f08-d408b316dca7')).resolves.not.toThrowError();
  });
});
