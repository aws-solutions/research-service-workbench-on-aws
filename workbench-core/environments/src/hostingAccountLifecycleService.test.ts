jest.mock('./iamRoleCloneService');

import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import {
  EventBridgeClient,
  PutPermissionCommand,
  DescribeRuleCommand,
  PutRuleCommand,
  PutTargetsCommand
} from '@aws-sdk/client-eventbridge';
import { EC2Client, ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_NAME_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: process.env.STATUS_HANDLER_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            },
            { OutputKey: 'VPC', OutputValue: 'fakeVPC' },
            { OutputKey: 'VpcSubnet', OutputValue: 'FakeSubnet' }
          ]
        }
      ]
    });
  }

  test('initializeAccount does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    hostingAccountLifecycleService.updateBusPermissions = jest.fn();
    const cfnMock = mockClient(CloudFormationClient);
    mockCloudformationOutputs(cfnMock);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        awsAccountId: { S: '123456789012' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        accountId: { S: 'abc-xyz' }
      }
    });

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

  test('updateBusPermissions triggered for adding account to bus rule', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    // Mock EventBridge calls
    const ebMock = mockClient(EventBridgeClient);
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(PutTargetsCommand).resolves({});
    ebMock.on(PutRuleCommand).resolves({});
    ebMock.on(DescribeRuleCommand).resolves({});

    await expect(
      hostingAccountLifecycleService.updateBusPermissions('sampleStatusHandlerArn', '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateBusPermissions triggered for updating account in bus rule', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    // Mock EventBridge calls
    const ebMock = mockClient(EventBridgeClient);
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(PutRuleCommand).resolves({});
    ebMock.on(PutTargetsCommand).resolves({});
    ebMock.on(DescribeRuleCommand).resolves({
      EventPattern: JSON.stringify({
        account: ['123456789012']
      })
    });

    await expect(
      hostingAccountLifecycleService.updateBusPermissions('sampleStatusHandlerArn', '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateAccount', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const cfnMock = mockClient(CloudFormationClient);

    // Mock for getting SSM Documents, VPC, and VpcSubnet
    mockCloudformationOutputs(cfnMock);

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
        s3ArtifactBucketName: 'artifactBucket',
        ddbAccountId: 'abc-xyz'
      })
    ).resolves.not.toThrowError();

    expect(IamRoleCloneService).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'CURRENT',
      ddbAccountId: 'abc-xyz',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet'
    });
  });
});
