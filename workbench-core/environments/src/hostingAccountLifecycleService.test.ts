jest.mock('./iamRoleCloneService');

import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { EventBridgeClient, PutPermissionCommand } from '@aws-sdk/client-eventbridge';
import { EC2Client, ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
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

const constants = {
  MAIN_ACCOUNT_BUS_ARN_NAME: 'SampleMainAccountBusArn',
  SAGEMAKER_LAUNCH_SSM_DOC: 'SagemakerLaunchSSMDocOutput'
};

describe('HostingAccountLifecycleService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
              OutputKey: constants.MAIN_ACCOUNT_BUS_ARN_NAME,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            },
            {
              OutputKey: constants.SAGEMAKER_LAUNCH_SSM_DOC,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            }
          ]
        }
      ]
    });
  }
  test('execute does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService('us-east-1', 'swb-swbv2-va');

    const ebMock = mockClient(EventBridgeClient);
    const ec2Mock = mockClient(EC2Client);
    const ssmMock = mockClient(SSMClient);
    const cfnMock = mockClient(CloudFormationClient);

    // Mock Modify Doc Permission
    ssmMock.on(ModifyDocumentPermissionCommand).resolves({});

    // Mock Modify AMI permission attribute
    ec2Mock.on(ModifyImageAttributeCommand).resolves({});

    // Mock EventBridge put permission
    ebMock.on(PutPermissionCommand).resolves({});

    // Mock Cloudformation describeStacks
    mockCloudformationOutputs(cfnMock);

    await expect(
      hostingAccountLifecycleService.initializeAccount(
        {
          accountId: '123456789012',
          envManagementRoleArn: 'sampleEnvManagementRoleArn',
          accountHandlerRoleArn: 'sampleAccountHandlerRoleArn'
        },
        'SampleMainAccountBusArn'
      )
    ).resolves.not.toThrowError();
  });

  test('updateAccount', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
    const hostingAccountLifecycleService = new HostingAccountLifecycleService('us-east-1', 'swb-dev-va');
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
              OutputValue: 'arn:aws:ssm:us-east-2:987654321012:document/swb-dev-oh-SagemakerLaunch'
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
      hostingAccountLifecycleService.updateAccount(
        '0123456789012',
        new AwsService({ region: 'us-east-1' }),
        'swb-dev-va-hosting-account',
        'port-1234',
        'SSMDocOutput',
        'arn:aws:iam::0123456789012:role/swb-dev-va-hosting-account-env-mgmt',
        'swb-dev-va-LaunchConstraint',
        'artifactBucket'
      )
    ).resolves.not.toThrowError();

    expect(IamRoleCloneService).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'UP_TO_DATE',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet'
    });
  });
});
