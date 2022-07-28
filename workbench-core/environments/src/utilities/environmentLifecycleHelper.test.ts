/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import { ListLaunchPathsCommand, ServiceCatalogClient } from '@aws-sdk/client-service-catalog';
import { SSMClient, StartAutomationExecutionCommand } from '@aws-sdk/client-ssm';
import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import EnvironmentLifecycleHelper, { Operation } from './environmentLifecycleHelper';

describe('EnvironmentLifecycleHelper', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.AWS_REGION = 'us-east-1';
    process.env.SSM_DOC_OUTPUT_KEY_SUFFIX = 'SSMDocOutput';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mockCloudformationOutputs(cfMock: AwsStub<any, any>): void {
    cfMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: 'swb-swbv2-va',
          StackStatus: 'CREATE_COMPLETE',
          CreationTime: new Date(),
          Outputs: [
            {
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_OUTPUT_KEY_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: `SagemakerTerminate${process.env.SSM_DOC_OUTPUT_KEY_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerTerminate'
            }
          ]
        }
      ]
    });
  }

  test('getDatasetsToMount returns empty list stringified when no datasets are to be created', async () => {
    // BUILD
    const helper = new EnvironmentLifecycleHelper();
    const datasetIds: string[] = [];
    const envMetadata = {
      id: 'sampleEnvId',
      PROJ: {
        envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
        externalId: 'workbench'
      },
      ETC: {
        productId: 'sampleProductId'
      },
      instanceId: '',
      cidr: '',
      description: '',
      error: undefined,
      name: '',
      outputs: [],
      projectId: '',
      status: 'PENDING',
      datasetIds: [],
      envTypeConfigId: '',
      updatedAt: '',
      updatedBy: '',
      createdAt: '',
      createdBy: '',
      provisionedProductId: '',
      owner: '',
      type: '',
      dependency: ''
    };
    helper.dataSetService.addDataSetExternalEndpoint = jest.fn();
    helper.dataSetService.getDataSet = jest.fn();
    helper.environmentService.addMetadata = jest.fn();

    // OPERATE
    const response = await helper.getDatasetsToMount(datasetIds, envMetadata, 'sampleKeyARN');

    // CHECK
    await expect(response).toEqual({ iamPolicyDocument: '{}', s3Mounts: '[]' });
  });

  test('getDatasetsToMount does not throw error', async () => {
    // BUILD
    const helper = new EnvironmentLifecycleHelper();
    const datasetIds = ['exampleDatasetId'];
    const envMetadata = {
      id: 'sampleEnvId',
      PROJ: {
        envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
        externalId: 'workbench'
      },
      ETC: {
        productId: 'sampleProductId'
      },
      instanceId: '',
      cidr: '',
      description: '',
      error: undefined,
      name: '',
      outputs: [],
      projectId: '',
      status: 'PENDING',
      datasetIds: [],
      envTypeConfigId: '',
      updatedAt: '',
      updatedBy: '',
      createdAt: '',
      createdBy: '',
      provisionedProductId: '',
      owner: '',
      type: '',
      dependency: ''
    };
    helper.dataSetService.addDataSetExternalEndpoint = jest.fn(async () => {
      return {
        name: 'dataSetName',
        bucket: 'endPointURL',
        prefix: 'path',
        endpointId: 'endpointId'
      };
    });
    helper.dataSetService.getDataSet = jest.fn(async () => {
      return {
        storageName: 'sampleStorageName',
        path: 'sampleBucketPath',
        name: 'sampleDataset',
        externalEndpoints: []
      };
    });
    helper.dataSetService.getExternalEndPoint = jest.fn(async () => {
      return {
        id: 'endpointId',
        endPointAlias: 'sampleAlias',
        name: 'mockExistingEndpointName',
        path: 'mockDataSetPath',
        dataSetId: 'mockDataSetId',
        dataSetName: 'mockDataSetName',
        endPointUrl: 's3://sampleBucket'
      };
    });
    helper.environmentService.addMetadata = jest.fn();

    // OPERATE & CHECK
    await expect(
      helper.getDatasetsToMount(datasetIds, envMetadata, 'sampleKeyARN')
    ).resolves.not.toThrowError();
  });

  test('getAwsSdkForEnvMgmtRole does not throw an error', async () => {
    // BUILD
    const helper = new EnvironmentLifecycleHelper();
    const stsMock = mockClient(STSClient);
    // Mock Modify Doc Permission
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    const payload = {
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      operation: 'Launch',
      envType: 'sagemaker'
    };

    helper.aws.getAwsServiceForRole = jest.fn(async () => {
      return new AwsService({ region: 'us-east-1' });
    });

    // OPERATE & CHECK
    await expect(helper.getAwsSdkForEnvMgmtRole(payload)).resolves.not.toThrowError();
  });

  test('getSSMDocArn finds SSM doc arn for valid output name', async () => {
    // BUILD
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    const helper = new EnvironmentLifecycleHelper();

    const validOutputName = 'SagemakerLaunchSSMDocOutput';

    // OPERATE & CHECK
    await expect(helper.getSSMDocArn(validOutputName)).resolves.toEqual(
      'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
    );
  });

  test('getSSMDocArn does not SSM doc arn for invalid output name', async () => {
    // BUILD
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    const helper = new EnvironmentLifecycleHelper();

    const invalidOutputName = 'SomeInvalidDocName';

    // OPERATE & CHECK
    await expect(helper.getSSMDocArn(invalidOutputName)).rejects.toThrow(
      `Cannot find output name: ${invalidOutputName}`
    );
  });

  test('executeSSMDocument does not throw an error', async () => {
    // BUILD
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);
    // Mock Modify Doc Permission
    ssmMock.on(StartAutomationExecutionCommand).resolves({});
    // Mock Modify Doc Permission
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    const helper = new EnvironmentLifecycleHelper();
    const operation: Operation = 'Launch';
    const payload = {
      ssmParameters: {
        InstanceName: ['basicnotebookinstance-sampleInstanceName']
      },
      operation,
      envType: 'Sagemaker',
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      externalId: 'workbench'
    };

    helper.getSSMDocArn = jest.fn();
    helper.getAwsSdkForEnvMgmtRole = jest.fn();

    // OPERATE & CHECK
    await expect(helper.executeSSMDocument(payload)).resolves.not.toThrowError();
  });

  test('launch does not throw an error', async () => {
    const helper = new EnvironmentLifecycleHelper();
    const stsMock = mockClient(STSClient);
    const ssmMock = mockClient(SSMClient);

    const cfnMock = mockClient(CloudFormationClient);
    const mockSC = mockClient(ServiceCatalogClient);
    mockSC.on(ListLaunchPathsCommand).resolves({
      LaunchPathSummaries: [{ Id: 'launchPath' }]
    });
    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);
    // Mock Modify Doc Permission
    ssmMock.on(StartAutomationExecutionCommand).resolves({});
    stsMock.on(AssumeRoleCommand).resolves({
      Credentials: {
        AccessKeyId: 'sampleAccessKey',
        SecretAccessKey: 'sampleSecretAccessKey',
        SessionToken: 'blah',
        Expiration: undefined
      }
    });
    helper.getAwsSdkForEnvMgmtRole = jest.fn(async () => {
      return new AwsService({ region: 'us-east-1' });
    });
    helper.executeSSMDocument = jest.fn();

    const launchParams = {
      ssmParameters: {
        InstanceName: [`basicnotebookinstance-${Date.now()}`],
        VPC: ['vpcId'],
        Subnet: ['subnetId'],
        ProvisioningArtifactId: ['provisioningArtifactId'],
        ProductId: ['sampleProductId'],
        Namespace: [`sagemaker-${Date.now()}`],
        EncryptionKeyArn: ['encryptionKeyArn'],
        CIDR: ['1.1.1.1/32'],
        EnvId: ['envId'],
        EnvironmentInstanceFiles: ['environmentInstanceFiles'],
        AutoStopIdleTimeInMinutes: ['0'],
        EnvStatusUpdateConstString: [process.env.ENV_STATUS_UPDATE!]
      },
      operation: 'Launch' as Operation,
      envType: 'Sagemaker',
      envMetadata: {
        PROJ: {
          envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
          externalId: 'workbench'
        },
        ETC: {
          productId: 'sampleProductId'
        }
      }
    };

    await expect(helper.launch(launchParams)).resolves.not.toThrowError();
  });
});
