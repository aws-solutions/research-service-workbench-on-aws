/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Readable } from 'stream';

import { AwsService, resourceTypeToKey } from '@aws/workbench-core-base';
import S3Service from '@aws/workbench-core-base/lib/aws/helpers/s3Service';
import {
  CloudFormationClient,
  DescribeStacksCommand,
  GetTemplateCommand
} from '@aws-sdk/client-cloudformation';
import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
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
  S3,
  S3Client,
  GetBucketPolicyCommand,
  PutBucketPolicyCommand,
  NoSuchBucket,
  S3ServiceException
} from '@aws-sdk/client-s3';
import {
  AcceptPortfolioShareCommand,
  CreatePortfolioShareCommand,
  ServiceCatalogClient
} from '@aws-sdk/client-service-catalog';
import { SSMClient, ModifyDocumentPermissionCommand } from '@aws-sdk/client-ssm';
import { SdkStream } from '@aws-sdk/types';
import { marshall } from '@aws-sdk/util-dynamodb';
import * as Boom from '@hapi/boom';
import { PolicyDocument } from 'aws-cdk-lib/aws-iam';
import { mockClient, AwsStub } from 'aws-sdk-client-mock';
import _ from 'lodash';
import { InvalidAwsAccountIdError } from '../errors/InvalidAwsAccountIdError';
import AccountService from '../services/accountService';
import HostingAccountLifecycleService from './hostingAccountLifecycleService';

const sampleArtifactsBucketName = 'sampleArtifactsBucketName';
const artifactBucketArn = 'arn:aws:s3:::sampleArtifactsBucketName';

describe('HostingAccountLifecycleService', () => {
  const ORIGINAL_ENV = process.env;
  const mockAccountId = `${resourceTypeToKey.account.toLowerCase()}-1234abcd-1234-abcd-1234-abcd1234abcd`;
  let hostingAccountLifecycleService: HostingAccountLifecycleService;
  let accountMetadata = {};

  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'SampleArtifactBucketArnOutput';
    process.env.S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'SampleMainArtifactKeyOutput';
    process.env.S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY = 'SampleMainDatasetsKeyOutput';
    process.env.STACK_NAME = 'swb-swbv2-va';
    process.env.SSM_DOC_OUTPUT_KEY_SUFFIX = 'SSMDocOutput';
    process.env.ACCT_HANDLER_ARN_OUTPUT_KEY = 'AccountHandlerLambdaRoleOutput';
    process.env.API_HANDLER_ARN_OUTPUT_KEY = 'ApiLambdaRoleOutput';
    process.env.STATUS_HANDLER_ARN_OUTPUT_KEY = 'StatusHandlerLambdaArnOutput';
    process.env.STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY = 'StatusHandlerLambdaRoleOutput';
    process.env.AWS_REGION = 'us-east-1';
    process.env.MAIN_ACCT_ID = '123456789012';

    const stackName = process.env.STACK_NAME!;
    const mainAccountAwsService = new AwsService({
      region: process.env.AWS_REGION!,
      ddbTableName: stackName
    });
    const accountService = new AccountService(mainAccountAwsService.helpers.ddb);

    hostingAccountLifecycleService = new HostingAccountLifecycleService(
      stackName,
      mainAccountAwsService,
      accountService
    );

    accountMetadata = {
      id: mockAccountId,
      name: 'fakeAccount',
      awsAccountId: '123456789012',
      externalId: 'workbench',
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      hostingAccountHandlerRoleArn: 'sampleHostingAccountHandlerRoleArn',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      encryptionKeyArn: 'sampleEncryptionKeyArn',
      environmentInstanceFiles: '',
      stackName: `${process.env.STACK_NAME!}-hosting-account`,
      status: 'CURRENT',
      resourceType: 'account',
      updatedAt: '2023-01-09T23:17:44.806Z',
      createdAt: '2023-01-09T23:17:44.252Z'
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  function mockCloudformationOutputs(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cfMock: AwsStub<any, any>,
    stackStatus: string = 'CREATE_COMPLETE',
    artifactBucketArnCfn: string = artifactBucketArn
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
              OutputKey: process.env.STATUS_HANDLER_ROLE_ARN_OUTPUT_KEY!,
              OutputValue: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-statusHandlerLambdaServiceRoleXXXXXXX-XXXXXXXXXXXX`
            },
            {
              OutputKey: process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!,
              OutputValue: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-accountHandlerLambdaServiceRole-XXXXXXXXXXE88`
            },
            {
              OutputKey: process.env.API_HANDLER_ARN_OUTPUT_KEY!,
              OutputValue: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-apiLambdaServiceRoleXXXXXXXX-XXXXXXXX`
            },
            {
              OutputKey: process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY!,
              OutputValue: artifactBucketArnCfn
            },
            {
              OutputKey: process.env.S3_ARTIFACT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!,
              OutputValue: 'arn:aws:kms:::key/321-321-321'
            },
            {
              OutputKey: process.env.S3_DATASETS_ENCRYPTION_KEY_ARN_OUTPUT_KEY!,
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

  test('updateAccount does not return an error', async () => {
    hostingAccountLifecycleService.updateBusPermissions = jest.fn();
    hostingAccountLifecycleService.updateArtifactsBucketPolicy = jest.fn();
    hostingAccountLifecycleService.updateMainAccountEncryptionKeyPolicy = jest.fn();
    const cfnMock = mockClient(CloudFormationClient);
    mockCloudformationOutputs(cfnMock);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall(accountMetadata)
    });

    await expect(
      hostingAccountLifecycleService.updateAccount({
        id: mockAccountId,
        name: 'someName'
      })
    ).resolves.not.toThrowError();
  });

  test('createAccount does not return an error', async () => {
    hostingAccountLifecycleService.updateBusPermissions = jest.fn();
    hostingAccountLifecycleService.updateArtifactsBucketPolicy = jest.fn();
    hostingAccountLifecycleService.updateMainAccountEncryptionKeyPolicy = jest.fn();
    const cfnMock = mockClient(CloudFormationClient);
    mockCloudformationOutputs(cfnMock);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall(accountMetadata)
    });
    mockDDB.on(QueryCommand).resolves({
      Count: 0,
      Items: []
    });

    await expect(
      hostingAccountLifecycleService.createAccount({
        name: 'someName',
        awsAccountId: '123456789012',
        envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt',
        hostingAccountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-hosting-account-role',
        externalId: 'someExternalId'
      })
    ).resolves.not.toThrowError();
  });

  test('initializeAccount throws an error when artifactBucketArn has no bucket name', async () => {
    hostingAccountLifecycleService.updateBusPermissions = jest.fn();
    hostingAccountLifecycleService.updateArtifactsBucketPolicy = jest.fn();
    hostingAccountLifecycleService.updateMainAccountEncryptionKeyPolicy = jest.fn();

    const cfnMock = mockClient(CloudFormationClient);
    const missingBucketNameArn = 'arn:aws:s3:::';
    mockCloudformationOutputs(cfnMock, 'CREATE_COMPLETE', missingBucketNameArn);

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
      hostingAccountLifecycleService.createAccount({
        name: 'fakeName',
        externalId: 'abc-xyz',
        awsAccountId: '123456789012',
        envMgmtRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-env-mgmt',
        hostingAccountHandlerRoleArn: 'arn:aws:iam::123456789012:role/swb-swbv2-va-hosting-account-role'
      })
    ).rejects.toThrowError(Boom.internal(`Could not identify bucket name in S3 artifact bucket.`));
  });

  test('updateBusPermissions triggered for adding account to bus rule', async () => {
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
    // Mock EventBridge calls
    const ebMock = mockClient(EventBridgeClient);
    ebMock.on(PutPermissionCommand).resolves({});
    ebMock.on(PutRuleCommand).resolves({});
    ebMock.on(PutTargetsCommand).resolves({});
    ebMock.on(DescribeRuleCommand).rejects(new ResourceNotFoundException({ $metadata: {}, message: '' }));

    await expect(
      hostingAccountLifecycleService.updateBusPermissions('sampleStatusHandlerArn', '123456789012')
    ).resolves.not.toThrowError();
  });

  test('updateBusPermissions triggered for updating account in bus rule when describeRule throws unknown error', async () => {
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

  test('updateHostingAccountData happy path', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
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
    const readableStreamWithIncorrectTemplateBody = new Readable({
      read() {}
    });

    readableStreamWithIncorrectTemplateBody.push('XYZ');
    readableStreamWithIncorrectTemplateBody.push(null);

    const readableStreamWithCorrectTemplateBody = new Readable({
      read() {}
    });

    readableStreamWithCorrectTemplateBody.push('ABC');
    readableStreamWithCorrectTemplateBody.push(null);

    const s3Mock = mockClient(S3Client);
    // Mocking expected template pulled from S3
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'artifactBucket',
        Key: 'onboard-account.cfn.yaml'
      })
      .resolves({
        Body: readableStreamWithIncorrectTemplateBody as SdkStream<Readable>
      });
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'artifactBucket',
        Key: 'onboard-account-byon.cfn.yaml'
      })
      .resolves({
        Body: readableStreamWithCorrectTemplateBody as SdkStream<Readable>
      });

    // Mocking actual template pulled from CFN Stack
    cfnMock.on(GetTemplateCommand).resolves({ TemplateBody: 'ABC' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeAccountStatusSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_writeAccountStatusToDDB'
    );

    hostingAccountLifecycleService.cloneRole = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getSsmDocsSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_getSSMDocuments'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareSsmDocsSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareSSMDocument'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareAmisSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareAMIs'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareScPortfolioSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareAndAcceptScPortfolio'
    );

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall(accountMetadata)
    });

    await expect(
      hostingAccountLifecycleService.updateHostingAccountData({
        targetAccountId: '0123456789012',
        targetAccountAwsService: new AwsService({ region: process.env.AWS_REGION! }),
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
    expect(getSsmDocsSpy).toBeCalled();
    expect(shareSsmDocsSpy).toBeCalled();
    expect(shareAmisSpy).toBeCalled();
    expect(shareScPortfolioSpy).toBeCalled();
    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'CURRENT',
      ddbAccountId: 'abc-xyz',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet',
      encryptionKeyArn: 'FakeEncryptionKeyArn'
    });
  });

  test('updateHostingAccountData when main account equal to hosting', async () => {
    const commonAcctId = '0123456789012';
    process.env.MAIN_ACCT_ID = commonAcctId;
    const cfnMock = mockClient(CloudFormationClient);

    // Mock for getting SSM Documents, VPC, and VpcSubnet
    mockCloudformationOutputs(cfnMock);

    //Mock comparing hosting account template
    const readableStreamWithIncorrectTemplateBody = new Readable({ read() {} });
    readableStreamWithIncorrectTemplateBody.push('XYZ');
    readableStreamWithIncorrectTemplateBody.push(null);
    const readableStreamWithCorrectTemplateBody = new Readable({ read() {} });
    readableStreamWithCorrectTemplateBody.push('ABC');
    readableStreamWithCorrectTemplateBody.push(null);

    const s3Mock = mockClient(S3Client);
    // Mocking expected template pulled from S3
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'artifactBucket',
        Key: 'onboard-account.cfn.yaml'
      })
      .resolves({
        Body: readableStreamWithIncorrectTemplateBody as SdkStream<Readable>
      });
    s3Mock
      .on(GetObjectCommand, {
        Bucket: 'artifactBucket',
        Key: 'onboard-account-byon.cfn.yaml'
      })
      .resolves({
        Body: readableStreamWithCorrectTemplateBody as SdkStream<Readable>
      });

    // Mocking actual template pulled from CFN Stack
    cfnMock.on(GetTemplateCommand).resolves({ TemplateBody: 'ABC' });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const writeAccountStatusSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_writeAccountStatusToDDB'
    );

    hostingAccountLifecycleService.cloneRole = jest.fn();

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const getSsmDocsSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_getSSMDocuments'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareSsmDocsSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareSSMDocument'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareAmisSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareAMIs'
    );
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const shareScPortfolioSpy = jest.spyOn<HostingAccountLifecycleService, any>(
      hostingAccountLifecycleService,
      '_shareAndAcceptScPortfolio'
    );

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall(accountMetadata)
    });

    await expect(
      hostingAccountLifecycleService.updateHostingAccountData({
        targetAccountId: commonAcctId,
        targetAccountAwsService: new AwsService({ region: process.env.AWS_REGION! }),
        targetAccountStackName: 'swb-dev-va-hosting-account',
        portfolioId: 'port-1234',
        ssmDocNameSuffix: 'SSMDocOutput',
        principalArnForScPortfolio: 'arn:aws:iam::0123456789012:role/swb-dev-va-hosting-account-env-mgmt',
        roleToCopyToTargetAccount: 'swb-dev-va-LaunchConstraint',
        s3ArtifactBucketName: 'artifactBucket',
        ddbAccountId: 'abc-xyz'
      })
    ).resolves.not.toThrowError();

    expect(hostingAccountLifecycleService.cloneRole).not.toBeCalled();
    expect(getSsmDocsSpy).not.toBeCalled();
    expect(shareSsmDocsSpy).not.toBeCalled();
    expect(shareAmisSpy).not.toBeCalled();
    expect(shareScPortfolioSpy).not.toBeCalled();

    expect(writeAccountStatusSpy).toHaveBeenCalledWith({
      status: 'CURRENT',
      ddbAccountId: 'abc-xyz',
      vpcId: 'fakeVPC',
      subnetId: 'FakeSubnet',
      encryptionKeyArn: 'FakeEncryptionKeyArn'
    });
  });

  test('updateHostingAccountData failed stack', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
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
      Body: readableStream as SdkStream<Readable>
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
      hostingAccountLifecycleService.updateHostingAccountData({
        targetAccountId: '0123456789012',
        targetAccountAwsService: new AwsService({ region: process.env.AWS_REGION! }),
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

  test('updateHostingAccountData template updated', async () => {
    process.env.AMI_IDS_TO_SHARE = JSON.stringify(['ami-1234']);
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
      Body: readableStream as SdkStream<Readable>
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
      hostingAccountLifecycleService.updateHostingAccountData({
        targetAccountId: '0123456789012',
        targetAccountAwsService: new AwsService({ region: process.env.AWS_REGION! }),
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
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
    s3Mock.on(PutBucketPolicyCommand).resolves({});
    s3Mock.on(GetBucketPolicyCommand).rejects(new NoSuchBucket({ $metadata: {}, message: '' }));

    await expect(
      hostingAccountLifecycleService.updateArtifactsBucketPolicy(sampleBucketArn, '123456789012')
    ).rejects.toThrowError(new NoSuchBucket({ $metadata: {}, message: '' }));
  });

  test('updateArtifactsBucketPolicy update works when bucket policy does not contain account ID', async () => {
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

  test('updateArtifactsBucketPolicy throws error when awsAccountId is invalid', async () => {
    const fakeAwsAccountId = '123456789012';
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
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
    const s3ServiceException = new S3ServiceException({
      $fault: 'client',
      $metadata: {},
      name: 'MalformedPolicy'
    });

    // @ts-ignore
    s3ServiceException.Detail = `"AWS" : "arn:aws:iam::${fakeAwsAccountId}:root"`;

    s3Mock.on(PutBucketPolicyCommand).rejects(s3ServiceException);

    await expect(
      hostingAccountLifecycleService.updateArtifactsBucketPolicy(sampleBucketArn, fakeAwsAccountId)
    ).rejects.toMatchObject(
      new InvalidAwsAccountIdError("Please provide a valid 'awsAccountId' for the hosting account")
    );
  });

  test('updateMainAccountEncryptionKeyPolicy works when adding new account ID', async () => {
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

  test('updatePolicyDocumentWithAllStatements works when adding new statements', async () => {
    const sampleBucketName = 'randomBucketName';
    const sampleBucketArn = `arn:aws:s3:::${sampleBucketName}`;
    const sampleAccountId = '123456789012';

    // Mock S3 calls
    const s3Mock = mockClient(S3Client);
    s3Mock.on(PutBucketPolicyCommand).resolves({});
    const basePolicy = PolicyDocument.fromJson(
      JSON.parse(`{
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
    }`)
    );

    const expectedPolicy = PolicyDocument.fromJson(
      JSON.parse(`
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
                    "AWS": "arn:aws:iam::${sampleAccountId}:root"
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
                    "AWS": "arn:aws:iam::${sampleAccountId}:root"
                },
                "Action": "s3:GetObject",
                "Resource": "${sampleBucketArn}/environment-files*"
            }
        ]
    }`)
    );

    const postUpdatedPolicy = hostingAccountLifecycleService['_updateBucketPolicyDocumentWithAllStatements'](
      sampleBucketArn,
      sampleAccountId,
      basePolicy
    );
    expect(postUpdatedPolicy).toEqual(expectedPolicy);
  });

  test('buildTemplateURLForAccount basic unit test', async () => {
    const region = process.env.AWS_REGION!;
    const externalId = 'exampleExternalId';

    hostingAccountLifecycleService['_aws'].clients.s3 = new S3({
      region: region,
      credentials: {
        accessKeyId: 'EXAMPLE',
        secretAccessKey: 'EXAMPLEKEY'
      }
    });
    const testUrl = 'https://testurl.com';
    jest
      .spyOn(S3Service.prototype, 'getPresignedUrl')
      .mockImplementationOnce(
        (s3BucketName: string, key: string, expirationMinutes: number): Promise<string> => {
          expect(s3BucketName).toEqual(sampleArtifactsBucketName);
          expect(key).toEqual('onboard-account.cfn.yaml');
          expect(expirationMinutes).toEqual(15 * 60);
          return Promise.resolve(testUrl);
        }
      )
      .mockImplementationOnce(
        (s3BucketName: string, key: string, expirationMinutes: number): Promise<string> => {
          expect(s3BucketName).toEqual(sampleArtifactsBucketName);
          expect(key).toEqual('onboard-account-byon.cfn.yaml');
          expect(expirationMinutes).toEqual(15 * 60);
          return Promise.resolve(testUrl);
        }
      );

    const expectedCreateUrl = `https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review/?templateURL=https%3A%2F%2Ftesturl.com&stackName=swb-swbv2-va-hosting-account&param_Namespace=swb-swbv2-va&param_MainAccountId=123456789012&param_ExternalId=${externalId}&param_AccountHandlerRoleArn=arn:aws:iam::123456789012:role/swb-swbv2-va-accountHandlerLambdaServiceRole-XXXXXXXXXXE88&param_ApiHandlerRoleArn=arn:aws:iam::123456789012:role/swb-swbv2-va-apiLambdaServiceRoleXXXXXXXX-XXXXXXXX&param_StatusHandlerRoleArn=arn:aws:iam::123456789012:role/swb-swbv2-va-statusHandlerLambdaServiceRoleXXXXXXX-XXXXXXXXXXXX&param_EnableFlowLogs=true&param_LaunchConstraintRolePrefix=*&param_LaunchConstraintPolicyPrefix=*`;
    const expectedUpdateUrl =
      'https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/update/template?stackId=swb-swbv2-va-hosting-account&templateURL=https%3A%2F%2Ftesturl.com';

    const cfnMock = mockClient(CloudFormationClient);
    mockCloudformationOutputs(cfnMock);
    const actual = await hostingAccountLifecycleService.buildTemplateUrlsForAccount({
      externalId
    });

    expect(actual).toBeDefined();
    expect(_.get(actual, 'onboard-account')?.createUrl).toEqual(expectedCreateUrl);
    expect(_.get(actual, 'onboard-account')?.updateUrl).toEqual(expectedUpdateUrl);
    expect(_.get(actual, 'onboard-account-byon')?.createUrl).toEqual(expectedCreateUrl);
    expect(_.get(actual, 'onboard-account-byon')?.updateUrl).toEqual(expectedUpdateUrl);
  });
});
