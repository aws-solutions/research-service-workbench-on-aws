jest.mock('./iamRoleCloneService');

import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { EventBridgeClient, PutPermissionCommand, DescribeRuleCommand } from '@aws-sdk/client-eventbridge';
import { EC2Client, ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
import { LambdaClient, AddPermissionCommand } from '@aws-sdk/client-lambda';
import { DynamoDBClient, UpdateItemCommand, GetItemCommand, QueryCommand } from '@aws-sdk/client-dynamodb';
import {
  CloudFormationClient,
  DescribeStacksCommand,
  GetTemplateCommand
} from '@aws-sdk/client-cloudformation';
import { GetObjectCommand, S3Client } from '@aws-sdk/client-s3';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';
import { AwsService } from '@amzn/workbench-core-base';
import { Readable } from 'stream';
import {
  AcceptPortfolioShareCommand,
  CreatePortfolioShareCommand,
  ServiceCatalogClient
} from '@aws-sdk/client-service-catalog';

import IamRoleCloneService from './iamRoleCloneService';

describe('HostingAccountLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.MAIN_ACCOUNT_BUS_ARN_NAME = 'SampleMainAccountBusArn';
    process.env.STATUS_HANDLER_ARN_NAME = 'SampleStatusHandlerArnOutput';
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.SSM_DOC_NAME_SUFFIX = 'SSMDoc';
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
              OutputKey: process.env.MAIN_ACCOUNT_BUS_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            },
            {
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: process.env.STATUS_HANDLER_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            }
          ]
        }
      ]
    });
  }
  test('initializeAccount does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const ebMock = mockClient(EventBridgeClient);
    const ec2Mock = mockClient(EC2Client);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);
    const lambdaMock = mockClient(LambdaClient);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});

    hostingAccountLifecycleService.validateInput = jest.fn();
    hostingAccountLifecycleService.updateEventBridgePermissions = jest.fn();

    // Mock Modify Doc Permission
    ssmMock.on(ModifyDocumentPermissionCommand).resolves({});

    // Mock Modify AMI permission attribute
    ec2Mock.on(ModifyImageAttributeCommand).resolves({});

    // Mock EventBridge calls
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(DescribeRuleCommand).resolves({});

    // Mock Lambda calls
    lambdaMock.on(AddPermissionCommand).resolves({});

    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);

    await expect(
      hostingAccountLifecycleService.initializeAccount({
        id: 'abc-xyz',
        accountId: 'abc-xyz',
        awsAccountId: '123456789012',
        envManagementRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt',
        accountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role'
      })
    ).resolves.not.toThrowError();
  });

  test('storeToDdb does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});

    await expect(
      hostingAccountLifecycleService.storeToDdb({
        id: 'abc-xyz',
        accountId: 'abc-xyz',
        awsAccountId: '123456789012',
        envManagementRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt',
        accountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-cross-account-role',
        eventBusArn: 'sampleEventBusArn',
        vpcId: 'sampleVpcId',
        subnetId: 'sampleSubnetId',
        cidr: '1.1.1.1/32',
        encryptionKeyArn: 'encryptionKeyArn',
        environmentInstanceFiles: '',
        resourceType: 'account'
      })
    ).resolves.not.toThrowError();
  });

  test('validateInput does not throw an error when id is defined and awsAccountId already onboarded', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(QueryCommand).resolves({ Count: 1 });
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        }
      }
    });
    await expect(
      hostingAccountLifecycleService.validateInput({
        id: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
        awsAccountId: '123456789012'
      })
    ).resolves.not.toThrowError();
  });

  test('validateInput does not throw an error when id is undefined and awsAccountId not already onboarded', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(QueryCommand).resolves({ Count: 0 });
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        }
      }
    });
    await expect(
      hostingAccountLifecycleService.validateInput({
        id: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f',
        awsAccountId: '123456789012'
      })
    ).resolves.not.toThrowError();
  });

  test('validateInput throws an error when id is undefined and awsAccountId already onboarded', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(QueryCommand).resolves({ Count: 1 });

    await expect(
      hostingAccountLifecycleService.validateInput({
        awsAccountId: '123456789012'
      })
    ).rejects.toThrowError(
      'This AWS Account was found in DDB. Please provide the correct id value in request body'
    );
  });

  test('validateInput throws an error when id is different than DDB value and awsAccountId already onboarded', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        pk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        sk: {
          S: 'ACC#a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        id: {
          S: 'a425f28d-97cd-4237-bfc2-66d7a6806a7f'
        },
        awsAccountId: {
          S: '123456789012'
        }
      }
    });

    await expect(
      hostingAccountLifecycleService.validateInput({
        id: 'abc-xyz',
        awsAccountId: 'differenAwsAccountId'
      })
    ).rejects.toThrowError('The AWS Account mapped to this accountId is different than the one provided');
  });

  test('updateAccount', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const cfnMock = mockClient(CloudFormationClient);

    // Mock for getting SSM Documents, VPC, and VpcSubnet
    cfnMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: 'ExampleStack',
          CreationTime: new Date(),
          StackStatus: 'CREATE_COMPLETE',
          Outputs: [
            {
              OutputKey: 'SagemakerLaunchSSMDocOutput',
              OutputValue: 'arn:aws:ssm:us-east-2:0123456789012:document/swb-dev-oh-SagemakerLaunch'
            },
            { OutputKey: 'VPC', OutputValue: 'fakeVPC' },
            { OutputKey: 'VpcSubnet', OutputValue: 'FakeSubnet' }
          ]
        }
      ]
    });

    // Mock sharing SSM Documents
    const ssmMock = mockClient(SSMClient);
    ssmMock.on(ModifyDocumentPermissionCommand).resolves({});

    // Mock share EC2 AMIs
    const ec2Mock = mockClient(EC2Client);
    ec2Mock.on(ModifyImageAttributeCommand).resolves({});

    // Mock share and accept SC Portfolio
    const scMock = mockClient(ServiceCatalogClient);
    scMock.on(CreatePortfolioShareCommand).resolves({});
    scMock.on(AcceptPortfolioShareCommand).resolves({});

    //Mock comparing hosting account template
    const readableStream = new Readable({
      read() {}
    });

    readableStream.push('ABC');
    readableStream.push(null);

    const s3Mock = mockClient(S3Client);
    // Mocking expected template pulled from S3
    s3Mock.on(GetObjectCommand).resolves({
      Body: readableStream
    });

    // Mocking actual template pulled from CFN Stack
    cfnMock.on(GetTemplateCommand).resolves({ TemplateBody: 'ABC' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeAccountStatusSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_writeAccountStatusToDDB'
    );

    await expect(
      hostingAccountLifecycleService.updateAccount({
        targetAccountId: '0123456789012',
        targetAccountAwsService: new AwsService({ region: 'us-east-1' }),
        targetAccountStackName: 'swb-dev-va-hosting-account',
        portfolioId: 'port-1234',
        ssmDocNameSuffix: 'SSMDocOutput',
        principalArnForScPortfolio: 'arn:aws:iam::0123456789012:role/swb-dev-va-hosting-account-env-mgmt',
        roleToCopyToTargetAccount: 'swb-dev-va-LaunchConstraint',
        s3ArtifactBucketName: 'artifactBucket'
      })
    ).resolves.not.toThrowError();

    expect(IamRoleCloneService).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'UP_TO_DATE',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet'
    });
  });
});
