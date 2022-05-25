// jest.mock('uuid', () => ({
//   v4: jest.fn()
// }));
// const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

// import { AwsStub, mockClient } from 'aws-sdk-client-mock';
// import { SSMClient, SendCommandCommand } from '@aws-sdk/client-ssm';
// import { STSClient, AssumeRoleCommand } from '@aws-sdk/client-sts';
// import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
// import { ServiceCatalogClient, ListLaunchPathsCommand } from '@aws-sdk/client-service-catalog';
// import { DynamoDBClient, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
// import SagemakerEnvironmentLifecycleService from './sagemakerEnvironmentLifecycleService';
// import { EnvironmentService } from '@amzn/environments';
describe('SagemakerEnvironmentLifecycleService', () => {
  test('placeholder', () => {
    expect(1).toBe(1);
  });
  // const ORIGINAL_ENV = process.env;
  // beforeEach(() => {
  //   jest.resetModules(); // Most important - it clears the cache
  //   process.env = { ...ORIGINAL_ENV }; // Make a copy
  //   process.env.SSM_DOC_NAME_SUFFIX = 'SSMDocSampleSuffix';
  //   process.env.STACK_NAME = 'swb-swbv2-va';
  //   mockUuid.v4.mockImplementationOnce(() => 'sampleEnvId');
  // });

  // afterAll(() => {
  //   process.env = ORIGINAL_ENV; // Restore old environment
  // });

  // // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // function mockCloudformationOutputs(cfMock: AwsStub<any, any>): void {
  //   cfMock.on(DescribeStacksCommand).resolves({
  //     Stacks: [
  //       {
  //         StackName: 'swb-swbv2-va',
  //         StackStatus: 'CREATE_COMPLETE',
  //         CreationTime: new Date(),
  //         Outputs: [
  //           {
  //             OutputKey: `SagemakerLaunch${process.env.SSM_DOC_NAME_SUFFIX}`,
  //             OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
  //           },
  //           {
  //             OutputKey: `SagemakerTerminate${process.env.SSM_DOC_NAME_SUFFIX}`,
  //             OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerTerminate'
  //           },
  //           {
  //             OutputKey: `SagemakerStart${process.env.SSM_DOC_NAME_SUFFIX}`,
  //             OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerStart'
  //           },
  //           {
  //             OutputKey: `SagemakerStop${process.env.SSM_DOC_NAME_SUFFIX}`,
  //             OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerStop'
  //           }
  //         ]
  //       }
  //     ]
  //   });
  // }

  // test('Launch should return mocked id', async () => {
  //   const stsMock = mockClient(STSClient);
  //   const ssmMock = mockClient(SSMClient);
  //   const cfnMock = mockClient(CloudFormationClient);
  //   const scMock = mockClient(ServiceCatalogClient);
  //   const ddbMock = mockClient(DynamoDBClient);

  //   // Mock DDB
  //   ddbMock.on(UpdateItemCommand).resolves({});
  //   const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  //   const environment = {
  //     id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
  //     awsAccountId: '123456789012',
  //     createdAt: '2022-05-05T19:39:03.023Z',
  //     envTypeId: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq',
  //     resourceType: 'environment',
  //     status:'1',
  //     updatedAt: '2022-05-05T19:43:57.143Z',
  //     cidr: '1.1.1.1/32',
  //     description: 'blah',
  //     instanceId: '123',
  //     error: undefined,
  //     name: 'sagemaker',
  //     outputs: [],
  //     projectId: '123',
  //     datasetIds: [],
  //     envTypeConfigId: 'ETC-123',
  //     provisionedProductId: '123',
  //     owner:'blah',
  //     ETC: {
  //       pk: 'ETC',
  //       sk: 'ET#envType-123ETC#envTypeConfig-123',
  //       createdAt: '2022-02-03T20:06:45.428Z',
  //       createdBy: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       desc: 'An Amazon SageMaker Jupyter Notebook',
  //       id: 'envTypeConfig-123',
  //       name: 'Jupyter Notebook',
  //       owner: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       params: [
  //        {
  //         key: 'IamPolicyDocument',
  //         value: '${iamPolicyDocument}'
  //        },
  //        {
  //         key: 'InstanceType',
  //         value: 'ml.t3.medium'
  //        },
  //        {
  //         key: 'AutoStopIdleTimeInMinutes',
  //         value: '0'
  //        },
  //        {
  //         key: 'CIDR',
  //         value: '1.1.1.1/32'
  //        }
  //       ],
  //       productId: 'prod-hxwmltpkg2edy',
  //       provisioningArtifactId: 'pa-fh6spfcycydtq',
  //       resourceType: 'envTypeConfig',
  //       status: 'approved',
  //       type: 'sagemaker',
  //       updatedAt: '2022-02-03T20:07:56.697Z',
  //       updatedBy: 'u-HJtc1fiQnF5XNmrIu6KLU'
  //      }
  //   };
  //   jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);

  //   ssmMock.on(SendCommandCommand).resolves({});
  //   stsMock.on(AssumeRoleCommand).resolves({
  //     Credentials: {
  //       AccessKeyId: 'sampleAccessKey',
  //       SecretAccessKey: 'sampleSecretAccessKey',
  //       SessionToken: 'blah',
  //       Expiration: undefined
  //     }
  //   });
  //   scMock.on(ListLaunchPathsCommand).resolves({
  //     LaunchPathSummaries: [
  //       {
  //         Id: 'mockedLaunchPathId'
  //       }
  //     ]
  //   });
  //   // Mock Cloudformation describeStacks
  //   mockCloudformationOutputs(cfnMock);

  //   const sm = new SagemakerEnvironmentLifecycleService();
  //   const response = await sm.launch(environment);
  //   expect(response).toEqual({ envId: 'sampleEnvId', awsAccountId: '123456789012', status: 'PENDING' });
  // });

  // test('Launch triggered with envId should throw error', async () => {
  //   const sm = new SagemakerEnvironmentLifecycleService();
  //   await expect(sm.launch({ envId: 'hasntBeenCreatedYet' })).rejects.toThrowError(
  //     'envId cannot be passed in the request body when trying to launch a new environment'
  //   );
  // });

  // test('Start should not throw error', async () => {
  //   const sm = new SagemakerEnvironmentLifecycleService();
  //   const stsMock = mockClient(STSClient);
  //   const ssmMock = mockClient(SSMClient);
  //   ssmMock.on(SendCommandCommand).resolves({});
  //   stsMock.on(AssumeRoleCommand).resolves({
  //     Credentials: {
  //       AccessKeyId: 'sampleAccessKey',
  //       SecretAccessKey: 'sampleSecretAccessKey',
  //       SessionToken: 'blah',
  //       Expiration: undefined
  //     }
  //   });
  //   const ddbMock = mockClient(DynamoDBClient);
  //   ddbMock.on(UpdateItemCommand).resolves({});
  //   const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  //   const environment = {
  //     id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
  //     awsAccountId: '123456789012',
  //     createdAt: '2022-05-05T19:39:03.023Z',
  //     envTypeId: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq',
  //     resourceType: 'environment',
  //     status:'1',
  //     updatedAt: '2022-05-05T19:43:57.143Z',
  //     cidr: '1.1.1.1/32',
  //     description: 'blah',
  //     instanceId: '123',
  //     error: undefined,
  //     name: 'sagemaker',
  //     outputs: [],
  //     projectId: '123',
  //     datasetIds: [],
  //     envTypeConfigId: 'ETC-123',
  //     provisionedProductId: '123',
  //     owner:'blah',
  //     PROJ: {
  //       "pk": "PROJ#proj-123",
  //       "sk": "PROJ#proj-123",
  //       "accountHandlerRoleArn": "arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role",
  //       "accountId": "2e19175f-5144-42d2-ab61-1e61f591bf7b",
  //       "awsAccountId": "123456789012",
  //       "cidr": "1.1.1.1/32",
  //       "createdAt": "2022-05-19T23:58:56.931Z",
  //       "encryptionKeyArn": "arn:aws:kms:us-east-1:123456789012:key/11267bce-04c4-414d-9c67-7a7db160b879",
  //       "environmentInstanceFiles": "s3://swb-swbv2-va-s3artifacts6892ee6a-9lcfxw15wdh1/environment-files",
  //       "envMgmtRoleArn": "arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt",
  //       "externalId": "workbench",
  //       "id": "2e19175f-5144-42d2-ab61-1e61f591bf7b",
  //       "name": "project-123",
  //       "resourceType": "project",
  //       "subnetId": "subnet-0bd8f38199152daa5",
  //       "updatedAt": "2022-05-19T23:58:56.931Z",
  //       "vpcId": "vpc-0f7510b07d0b7504a"
  //      },
  //     ETC: {
  //       pk: 'ETC',
  //       sk: 'ET#envType-123ETC#envTypeConfig-123',
  //       createdAt: '2022-02-03T20:06:45.428Z',
  //       createdBy: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       desc: 'An Amazon SageMaker Jupyter Notebook',
  //       id: 'envTypeConfig-123',
  //       name: 'Jupyter Notebook',
  //       owner: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       params: [
  //        {
  //         key: 'IamPolicyDocument',
  //         value: '${iamPolicyDocument}'
  //        },
  //        {
  //         key: 'InstanceType',
  //         value: 'ml.t3.medium'
  //        },
  //        {
  //         key: 'AutoStopIdleTimeInMinutes',
  //         value: '0'
  //        },
  //        {
  //         key: 'CIDR',
  //         value: '1.1.1.1/32'
  //        }
  //       ],
  //       productId: 'prod-hxwmltpkg2edy',
  //       provisioningArtifactId: 'pa-fh6spfcycydtq',
  //       resourceType: 'envTypeConfig',
  //       status: 'approved',
  //       type: 'sagemaker',
  //       updatedAt: '2022-02-03T20:07:56.697Z',
  //       updatedBy: 'u-HJtc1fiQnF5XNmrIu6KLU'
  //      }
  //   };
  //   jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);

  //   await expect(sm.start('6e185c8c-caeb-4305-8f08-d408b316dca7')).resolves.not.toThrowError();
  // });
  // test('Stop should not throw error', async () => {
  //   const sm = new SagemakerEnvironmentLifecycleService();
  //   const stsMock = mockClient(STSClient);
  //   const ssmMock = mockClient(SSMClient);
  //   ssmMock.on(SendCommandCommand).resolves({});
  //   stsMock.on(AssumeRoleCommand).resolves({
  //     Credentials: {
  //       AccessKeyId: 'sampleAccessKey',
  //       SecretAccessKey: 'sampleSecretAccessKey',
  //       SessionToken: 'blah',
  //       Expiration: undefined
  //     }
  //   });
  //   const ddbMock = mockClient(DynamoDBClient);
  //   ddbMock.on(UpdateItemCommand).resolves({});
  //   const envService = new EnvironmentService({TABLE_NAME: process.env.STACK_NAME!});
  //   const environment = {
  //     id: '6e185c8c-caeb-4305-8f08-d408b316dca7',
  //     accountId: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
  //     awsAccountId: '123456789012',
  //     createdAt: '2022-05-05T19:39:03.023Z',
  //     envTypeId: 'prod-hxwmltpkg2edy-pa-fh6spfcycydtq',
  //     resourceType: 'environment',
  //     status:'1',
  //     updatedAt: '2022-05-05T19:43:57.143Z',
  //     cidr: '1.1.1.1/32',
  //     description: 'blah',
  //     instanceId: '123',
  //     error: undefined,
  //     name: 'sagemaker',
  //     outputs: [],
  //     projectId: '123',
  //     datasetIds: [],
  //     envTypeConfigId: 'ETC-123',
  //     provisionedProductId: '123',
  //     owner:'blah',
  //     PROJ: {
  //       "pk": "PROJ#proj-123",
  //       "sk": "PROJ#proj-123",
  //       "accountHandlerRoleArn": "arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role",
  //       "accountId": "2e19175f-5144-42d2-ab61-1e61f591bf7b",
  //       "awsAccountId": "123456789012",
  //       "cidr": "1.1.1.1/32",
  //       "createdAt": "2022-05-19T23:58:56.931Z",
  //       "encryptionKeyArn": "arn:aws:kms:us-east-1:123456789012:key/11267bce-04c4-414d-9c67-7a7db160b879",
  //       "environmentInstanceFiles": "s3://swb-swbv2-va-s3artifacts6892ee6a-9lcfxw15wdh1/environment-files",
  //       "envMgmtRoleArn": "arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt",
  //       "externalId": "workbench",
  //       "id": "2e19175f-5144-42d2-ab61-1e61f591bf7b",
  //       "name": "project-123",
  //       "resourceType": "project",
  //       "subnetId": "subnet-0bd8f38199152daa5",
  //       "updatedAt": "2022-05-19T23:58:56.931Z",
  //       "vpcId": "vpc-0f7510b07d0b7504a"
  //      },
  //     ETC: {
  //       pk: 'ETC',
  //       sk: 'ET#envType-123ETC#envTypeConfig-123',
  //       createdAt: '2022-02-03T20:06:45.428Z',
  //       createdBy: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       desc: 'An Amazon SageMaker Jupyter Notebook',
  //       id: 'envTypeConfig-123',
  //       name: 'Jupyter Notebook',
  //       owner: 'u-HJtc1fiQnF5XNmrIu6KLU',
  //       params: [
  //        {
  //         key: 'IamPolicyDocument',
  //         value: '${iamPolicyDocument}'
  //        },
  //        {
  //         key: 'InstanceType',
  //         value: 'ml.t3.medium'
  //        },
  //        {
  //         key: 'AutoStopIdleTimeInMinutes',
  //         value: '0'
  //        },
  //        {
  //         key: 'CIDR',
  //         value: '1.1.1.1/32'
  //        }
  //       ],
  //       productId: 'prod-hxwmltpkg2edy',
  //       provisioningArtifactId: 'pa-fh6spfcycydtq',
  //       resourceType: 'envTypeConfig',
  //       status: 'approved',
  //       type: 'sagemaker',
  //       updatedAt: '2022-02-03T20:07:56.697Z',
  //       updatedBy: 'u-HJtc1fiQnF5XNmrIu6KLU'
  //      }
  //   };
  //   jest.spyOn(envService, 'getEnvironment').mockImplementation(async () => environment);

  //   await expect(sm.stop('6e185c8c-caeb-4305-8f08-d408b316dca7')).resolves.not.toThrowError();
  // });
});
