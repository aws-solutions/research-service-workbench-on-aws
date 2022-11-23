/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';

import {
  CloudFormationClient,
  DescribeStacksCommand,
  GetTemplateCommand
} from '@aws-sdk/client-cloudformation';
import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { EC2Client, ModifyImageAttributeCommand } from '@aws-sdk/client-ec2';
import {
  EventBridgeClient,
  PutPermissionCommand,
  DescribeRuleCommand,
  PutRuleCommand,
  PutTargetsCommand,
  ResourceNotFoundException
} from '@aws-sdk/client-eventbridge';
import { KMSClient, GetKeyPolicyCommand, PutKeyPolicyCommand } from '@aws-sdk/client-kms';
import {
  GetObjectCommand,
  S3Client,
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  NoSuchBucket
} from '@aws-sdk/client-s3';

import {
  AcceptPortfolioShareCommand,
  CreatePortfolioShareCommand,
  ServiceCatalogClient
} from '@aws-sdk/client-service-catalog';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
import { AwsService } from '@aws/workbench-core-base';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';

describe('HostingAccountLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.STATUS_HANDLER_ARN_OUTPUT_KEY = 'SampleStatusHandlerArnOutput';
    process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'SampleArtifactBucketArnOutput';
    process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'SampleMainKeyOutput';
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.SSM_DOC_OUTPUT_KEY_SUFFIX = 'SSMDocOutput';
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  function mockCloudformationOutputs(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cfMock: AwsStub<any, any>,
    stackStatus: string = 'CREATE_COMPLETE'
  ): void {
    cfMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: process.env.STACK_NAME!,
          StackStatus: stackStatus,
          CreationTime: new Date(),
          Outputs: [
            {
              OutputKey: `SagemakerLaunch${process.env.SSM_DOC_OUTPUT_KEY_SUFFIX}`,
              OutputValue: 'arn:aws:ssm:us-east-1:123456789012:document/swb-swbv2-va-SagemakerLaunch'
            },
            {
              OutputKey: process.env.STATUS_HANDLER_ARN_OUTPUT_KEY!,
              OutputValue: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
            },
            {
              OutputKey: process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!,
              OutputValue: 'arn:aws:s3:::sampleArtifactsBucketName'
            },
            {
              OutputKey: process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!,
              OutputValue: 'arn:aws:kms:::key/123-123-123'
            },
            { OutputKey: 'VPC', OutputValue: 'fakeVPC' },
            { OutputKey: 'VpcSubnet', OutputValue: 'FakeSubnet' },
            { OutputKey: 'EncryptionKeyArn', OutputValue: 'FakeEncryptionKeyArn' }
          ]
        }
      ]
    });
  }

  test('initializeAccount does not return an error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    hostingAccountLifecycleService.updateBusPermissions = jest.fn();
    hostingAccountLifecycleService.updateArtifactsBucketPolicy = jest.fn();
    hostingAccountLifecycleService.updateMainAccountEncryptionKeyPolicy = jest.fn();
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
        hostingAccountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-hosting-account-role'
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

  test('updateBusPermissions triggered for updating account in bus rule when describeRule throws resource not found', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();

    // Mock EventBridge calls
    const ebMock = mockClient(EventBridgeClient);
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(PutRuleCommand).resolves({});
    ebMock.on(PutTargetsCommand).resolves({});
    ebMock.on(DescribeRuleCommand).rejects(new ResourceNotFoundException({ $metadata: {} }));

    await expect(
      hostingAccountLifecycleService.updateBusPermissions('sampleStatusHandlerArn', '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateBusPermissions triggered for updating account in bus rule when describeRule throws unknown error', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const someRandomError = 'blah';

    // Mock EventBridge calls
    const ebMock = mockClient(EventBridgeClient);
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(PutRuleCommand).resolves({});
    ebMock.on(PutTargetsCommand).resolves({});
    ebMock.on(DescribeRuleCommand).rejects({
      message: someRandomError
    });

    await expect(
      hostingAccountLifecycleService.updateBusPermissions('sampleStatusHandlerArn', '123456789012')
    ).rejects.toThrowError(new Error(someRandomError));
  });

  test('updateAccount happy path', async () => {
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

    hostingAccountLifecycleService.cloneRole = jest.fn();

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

    expect(hostingAccountLifecycleService.cloneRole).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'CURRENT',
      ddbAccountId: 'abc-xyz',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet',
      encryptionKeyArn: 'FakeEncryptionKeyArn'
    });
  });

  test('updateAccount failed stack', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const cfnMock = mockClient(CloudFormationClient);

    // Mock for getting SSM Documents, VPC, and VpcSubnet
    mockCloudformationOutputs(cfnMock, 'FAILED');

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

    hostingAccountLifecycleService.cloneRole = jest.fn();

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

    expect(hostingAccountLifecycleService.cloneRole).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'ERRORED',
      ddbAccountId: 'abc-xyz'
    });
  });

  test('updateAccount template updated', async () => {
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
    cfnMock.on(GetTemplateCommand).resolves({ TemplateBody: 'XYZ' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeAccountStatusSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_writeAccountStatusToDDB'
    );

    hostingAccountLifecycleService.cloneRole = jest.fn();

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

    expect(hostingAccountLifecycleService.cloneRole).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'NEEDS_UPDATE',
      ddbAccountId: 'abc-xyz',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet',
      encryptionKeyArn: 'FakeEncryptionKeyArn'
    });
  });

  test('updateArtifactsBucketPolicy update throws error when bucket not found', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
    s3Mock.on(PutBucketPolicyCommand).resolves({});
    s3Mock.on(GetBucketPolicyCommand).rejects(new NoSuchBucket({ $metadata: {} }));

    await expect(
      hostingAccountLifecycleService.updateArtifactsBucketPolicy(sampleBucketArn, '123456789012')
    ).rejects.toThrowError(new NoSuchBucket({ $metadata: {} }));
  });

  test('updateArtifactsBucketPolicy update works when bucket policy does not contain account ID', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
    s3Mock.on(PutBucketPolicyCommand).resolves({});
    s3Mock.on(GetBucketPolicyCommand).resolves({
      Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Deny requests that do not use SigV4",
                "Effect": "Deny",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:*",
                "Resource": "${sampleBucketArn}/*",
                "Condition": {
                    "StringNotEquals": {
                        "s3:signatureversion": "AWS4-HMAC-SHA256"
                    }
                }
            },
            {
                "Sid": "List:environment-files",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::someOtherAccount:root"
                },
                "Action": "s3:ListBucket",
                "Resource": "${sampleBucketArn}",
                "Condition": {
                    "StringLike": {
                        "s3:prefix": "environment-files*"
                    }
                }
            },
            {
                "Sid": "Get:environment-files",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::someOtherAccount:root"
                },
                "Action": "s3:GetObject",
                "Resource": "${sampleBucketArn}/environment-files*"
            }
        ]
    }`
    });

    await expect(
      hostingAccountLifecycleService.updateArtifactsBucketPolicy(sampleBucketArn, '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateArtifactsBucketPolicy update works when bucket policy does not contain statements', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
    s3Mock.on(PutBucketPolicyCommand).resolves({});
    s3Mock.on(GetBucketPolicyCommand).resolves({
      Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "Deny requests that do not use SigV4",
                "Effect": "Deny",
                "Principal": {
                    "AWS": "*"
                },
                "Action": "s3:*",
                "Resource": "${sampleBucketArn}/*",
                "Condition": {
                    "StringNotEquals": {
                        "s3:signatureversion": "AWS4-HMAC-SHA256"
                    }
                }
            }
        ]
    }`
    });

    await expect(
      hostingAccountLifecycleService.updateArtifactsBucketPolicy(sampleBucketArn, '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateMainAccountEncryptionKeyPolicy works when adding new account ID', async () => {
    const hostingAccountLifecycleService = new HostingAccountLifecycleService();
    const sampleKeyId = 'randomKey';
    const sampleEncryptionKeyArn = `sampleEncryptionKeyArn/${sampleKeyId}`;

    // Mock S3 calls
    const kmsMock = mockClient(KMSClient);
    kmsMock.on(PutKeyPolicyCommand).resolves({});
    kmsMock.on(GetKeyPolicyCommand).resolves({
      Policy: `
      {
        "Version": "2012-10-17",
        "Statement": [
            {
                "Sid": "main-key-share-statement",
                "Effect": "Allow",
                "Principal": {
                    "AWS": "arn:aws:iam::someRandomAccount:root"
                },
                "Action": "kms:*",
                "Resource": "*"
            }
        ]
    }`
    });

    await expect(
      hostingAccountLifecycleService.updateMainAccountEncryptionKeyPolicy(
        sampleEncryptionKeyArn,
        '123456789012'
      )
    ).resolves.not.toThrowError();
  });
});
