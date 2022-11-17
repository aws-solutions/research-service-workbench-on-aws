/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({ v4: () => 'sampleAccId' }));

import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import {
  DynamoDBClient,
  GetItemCommand,
  QueryCommand,
  QueryCommandOutput,
  UpdateItemCommand
} from '@aws-sdk/client-dynamodb';
import { ServiceInputTypes, ServiceOutputTypes } from '@aws-sdk/client-s3';
import { marshall } from '@aws-sdk/util-dynamodb';
import { JSONValue, resourceTypeToKey } from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import { AccountCfnTemplateParameters } from '../models/accountCfnTemplate';
import { Account, AccountParser } from '../models/accounts/account';
import { CostCenter } from '../models/costCenter/costCenter';
import AccountService from './accountService';

describe('AccountService', () => {
  const ORIGINAL_ENV = process.env;

  let accountMetadata: { [id: string]: string } = {};
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
  let accountService: AccountService;

  beforeEach(() => {
    jest.resetModules();
    mockDDB = mockClient(DynamoDBClient);
    process.env = { ...ORIGINAL_ENV }; // Make a copy

    const region = 'us-east-1';
    process.env.AWS_REGION = region;

    const stackName = 'swb-swbv2-va';
    process.env.STACK_NAME = stackName;

    process.env.MAIN_ACCT_ID = '123456789012';
    process.env.ACCT_HANDLER_ARN_OUTPUT_KEY = 'AccountHandlerLambdaRoleOutput';
    process.env.API_HANDLER_ARN_OUTPUT_KEY = 'ApiLambdaRoleOutput';
    process.env.STATUS_HANDLER_ARN_OUTPUT_KEY = 'StatusHandlerLambdaArnOutput';
    process.env.S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY = 'SampleArtifactBucketArnOutput';

    accountService = new AccountService(new DynamoDBService({ region, table: stackName }));

    accountMetadata = {
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      accountHandlerRoleArn: 'sampleAccountHandlerRoleArn',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      encryptionKeyArn: 'sampleEncryptionKeyArn',
      environmentInstanceFiles: '',
      stackName: `${process.env.STACK_NAME!}-hosting-account`,
      status: 'CURRENT',
      resourceType: 'account'
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  const accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;

  test('create follows create account path as expected', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    accountMetadata.awsAccountId = '123456789012';
    accountMetadata.externalId = 'workbench';

    // OPERATE
    const response = await accountService.create(accountMetadata);

    // CHECK
    expect(response).toEqual({
      ...accountMetadata,
      id: accountId
    });
  });

  test('update follows update account path as expected', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        awsAccountId: { S: '123456789012' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        id: { S: 'sampleAccId' },
        accountId: { S: 'sampleAccId' }
      }
    });

    accountMetadata.id = 'sampleAccId';
    accountMetadata.accountId = 'sampleAccId';
    accountMetadata.awsAccountId = '123456789012';
    accountMetadata.externalId = 'workbench';

    // OPERATE
    const response = await accountService.update(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('update follows update account path as expected without awsAccountId or externalId', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        awsAccountId: { S: '123456789012' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        id: { S: 'sampleAccId' },
        accountId: { S: 'sampleAccId' }
      }
    });

    accountMetadata.id = 'sampleAccId';
    accountMetadata.accountId = 'sampleAccId';

    // OPERATE
    const response = await accountService.update(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('update throws error when update process finds account with different aws account id', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        awsAccountId: { S: 'someOtherAwsAccountId' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        id: { S: 'sampleAccId' },
        accountId: { S: 'sampleAccId' }
      }
    });

    accountMetadata.id = 'sampleAccId';
    accountMetadata.accountId = 'sampleAccId';
    accountMetadata.awsAccountId = '123456789012';
    accountMetadata.externalId = 'workbench';

    // OPERATE & CHECK
    await expect(accountService.update(accountMetadata)).rejects.toThrow(
      'The AWS Account mapped to this accountId is different than the one provided'
    );
  });

  test('update throws error when update process cannot find account', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({});

    accountMetadata.id = 'sampleAccId';
    accountMetadata.accountId = 'sampleAccId';
    accountMetadata.awsAccountId = '123456789012';

    // OPERATE & CHECK
    await expect(accountService.update(accountMetadata)).rejects.toThrow(
      `Could not find account ${accountMetadata.accountId}`
    );
  });

  test('create throws error when create process finds a duplicate entry', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 1 });

    accountMetadata.awsAccountId = '123456789012';

    // OPERATE & CHECK
    await expect(accountService.create(accountMetadata)).rejects.toThrow(
      'This AWS Account was found in DDB. Please provide the correct id value in request body'
    );
  });

  test('create throws error when create has missing aws account ID', async () => {
    // OPERATE & CHECK
    await expect(accountService.create(accountMetadata)).rejects.toThrow(
      'Missing AWS Account ID in request body'
    );
  });

  test('create follows create account path as expected', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    accountMetadata.awsAccountId = '123456789012';

    // OPERATE
    const response = await accountService.create(accountMetadata);

    // CHECK
    expect(response).toEqual({
      ...accountMetadata,
      id: accountId
    });
  });

  test('update follows update account path as expected when aws account not provided in metadata', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        awsAccountId: { S: '123456789012' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        id: { S: 'sampleAccId' },
        accountId: { S: 'sampleAccId' }
      }
    });

    const accountMetadata = {
      id: 'sampleAccId',
      status: 'CURRENT'
    };

    // OPERATE
    const response = await accountService.update(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('getAllAccounts returns no Items attribute', async () => {
    mockDDB.on(QueryCommand).resolves({});

    // OPERATE
    const response = await accountService.getAllAccounts({
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    });

    // CHECK
    expect(response).toEqual([]);
  });

  test('getAllAccounts returns list of onboarded accounts', async () => {
    const account: Account = {
      name: '',
      cidr: '',
      encryptionKeyArn: '',
      envMgmtRoleArn: '',
      environmentInstanceFiles: '',
      externalId: '',
      hostingAccountHandlerRoleArn: '',
      stackName: '',
      status: 'CURRENT',
      subnetId: '',
      vpcId: '',
      awsAccountId: '123456789012',
      id: 'sampleAccId',
      updatedAt: '',
      createdAt: ''
    };

    const accounts = [marshall(account)];

    const expectedList = [account];

    mockDDB.on(QueryCommand).resolves({
      Items: accounts
    });

    // OPERATE
    const response = await accountService.getAllAccounts({
      index: 'getResourceByCreatedAt',
      key: { name: 'resourceType', value: 'account' }
    });

    // CHECK
    expect(response).toEqual(expectedList);
  });

  describe('getAccounts', () => {
    let accountJson: Record<string, JSONValue>;
    let paginationToken: string | undefined;

    beforeEach(() => {
      accountJson = {
        name: '',
        cidr: '',
        encryptionKeyArn: '',
        envMgmtRoleArn: '',
        environmentInstanceFiles: '',
        externalId: '',
        hostingAccountHandlerRoleArn: '',
        stackName: '',
        status: 'CURRENT',
        subnetId: '',
        vpcId: '',
        awsAccountId: '123456789012',
        id: 'sampleAccId',
        updatedAt: '',
        createdAt: ''
      };

      paginationToken = 'paginationToken';

      jest.spyOn(DynamoDBService.prototype, 'getPaginatedItems').mockImplementation(() => {
        return Promise.resolve({
          data: [accountJson],
          paginationToken
        });
      });
    });

    test('returns a paginated response of accounts', async () => {
      const actualResponse = await accountService.getPaginatedAccounts({});
      expect(actualResponse).toEqual({
        data: [AccountParser.parse(accountJson)],
        paginationToken
      });
    });

    describe('when there is no pagination token from dynamo', () => {
      beforeEach(() => {
        paginationToken = undefined;
      });

      test('it does not return a paginationToken', async () => {
        const actualResponse = await accountService.getPaginatedAccounts({});
        expect(actualResponse.paginationToken).toEqual(undefined);
      });
    });
  });

  // TODO: DRY: this functionality can be pulled out to a test helper (it's also used in hostingAccoutnLifecycleService.test.ts
  function mockCloudformationOutputs(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    cfMock: AwsStub<any, any>,
    stackStatus: string = 'CREATE_COMPLETE',
    artifactBucketArn: string = 'arn:aws:s3:::sampleArtifactsBucketName'
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
              OutputValue: artifactBucketArn
            },
            {
              OutputKey: process.env.MAIN_ACCT_ENCRYPTION_KEY_ARN_OUTPUT_KEY!,
              OutputValue: 'arn:aws:kms:::key/123-123-123'
            },
            {
              OutputKey: process.env.ACCT_HANDLER_ARN_OUTPUT_KEY!,
              OutputValue: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-accountHandlerLambdaServiceRole-XXXXXXXXXXE88`
            },
            {
              OutputKey: process.env.API_HANDLER_ARN_OUTPUT_KEY!,
              OutputValue: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-apiLambdaServiceRoleXXXXXXXX-XXXXXXXX`
            },
            { OutputKey: 'VPC', OutputValue: 'fakeVPC' },
            { OutputKey: 'VpcSubnet', OutputValue: 'FakeSubnet' },
            { OutputKey: 'EncryptionKeyArn', OutputValue: 'FakeEncryptionKeyArn' }
          ]
        }
      ]
    });
  }

  test('getTemplateURLForAccount returns a signed URL', async () => {
    const extId = 'workbench';

    const expectedTemplate = encodeURIComponent('http://potato.com');
    const expectedUrl = `https://console.aws.amazon.com/cloudformation/home?region=us-east-1#/stacks/create/review/?templateURL=${expectedTemplate}&stackName=swb-swbv2-va-hosting-account&param_Namespace=swb-swbv2-va&param_MainAccountId=123456789012&param_ExternalId=workbench&param_AccountHandlerRoleArn=arn:aws:iam::123456789012:role/swb-swbv2-va-accountHandlerLambdaServiceRole-XXXXXXXXXXE88&param_ApiHandlerRoleArn=arn:aws:iam::123456789012:role/swb-swbv2-va-apiLambdaServiceRoleXXXXXXXX-XXXXXXXX&param_StatusHandlerRoleArn=arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va&param_EnableFlowLogs=true`;

    const cfnMock = mockClient(CloudFormationClient);
    mockCloudformationOutputs(cfnMock);

    const artifactBucketArn = 'arn:aws:s3:::sampleArtifactsBucketName';
    const templateParameters: AccountCfnTemplateParameters = {
      accountHandlerRole: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-accountHandlerLambdaServiceRole-XXXXXXXXXXE88`,
      apiHandlerRole: `arn:aws:iam::${process.env.MAIN_ACCT_ID}:role/${process.env.STACK_NAME}-apiLambdaServiceRoleXXXXXXXX-XXXXXXXX`,
      enableFlowLogs: 'true',
      externalId: extId,
      launchConstraintPolicyPrefix: '*', // We can do better, get from stack outputs?
      launchConstraintRolePrefix: '*', // We can do better, get from stack outputs?
      mainAccountId: process.env.MAIN_ACCT_ID!,
      namespace: process.env.STACK_NAME!,
      stackName: process.env.STACK_NAME!.concat('-hosting-account'),
      statusHandlerRole: 'arn:aws:events:us-east-1:123456789012:event-bus/swb-swbv2-va'
    };

    // OPERATE
    const response = await accountService.getTemplateURLForAccount(artifactBucketArn, templateParameters);

    // CHECK
    expect(response.url).toEqual(expectedUrl);
  });

  describe('getAccount', () => {
    describe('when there is a matching accountId', () => {
      let expectedAccountId: string;
      let account: Account;
      let dynamoAccountItem: Account & { pk: string; sk: string };

      beforeEach(() => {
        expectedAccountId = 'acc-expectedAccountId';
        account = AccountParser.parse({
          envMgmtRoleArn: '',
          vpcId: '',
          subnetId: '',
          encryptionKeyArn: '',
          environmentInstanceFiles: '',
          stackName: '',
          status: 'CURRENT',
          name: '',
          awsAccountId: '',
          externalId: '',
          id: expectedAccountId,
          hostingAccountHandlerRoleArn: '',
          cidr: '',
          updatedAt: '',
          createdAt: ''
        });

        dynamoAccountItem = {
          ...account,
          sk: `ACC#${expectedAccountId}`,
          pk: `ACC#${expectedAccountId}`
        };
      });

      describe('and metadata is NOT requested', () => {
        test('returns the matching account', async () => {
          mockDDB.on(GetItemCommand).resolves({
            Item: marshall(dynamoAccountItem)
          });

          const actualAccount = await accountService.getAccount(expectedAccountId, false);
          expect(actualAccount.id).toEqual(expectedAccountId);
        });
      });

      describe('and metadata is requested', () => {
        let costCenter: CostCenter & { pk: string; sk: string };
        let costCenterPK: string;
        let expectedCCId: string;

        beforeEach(() => {
          expectedCCId = 'cc-12345';
          costCenterPK = `CC#${expectedCCId}`;

          costCenter = {
            accountId: '',
            awsAccountId: '',
            createdAt: '',
            description: '',
            encryptionKeyArn: '',
            envMgmtRoleArn: '',
            environmentInstanceFiles: '',
            externalId: '',
            hostingAccountHandlerRoleArn: '',
            subnetId: '',
            updatedAt: '',
            vpcId: '',
            pk: costCenterPK,
            sk: costCenterPK,
            id: expectedCCId,
            name: 'cost center 1'
          };
        });

        test('returns the matching account and its metadata', async () => {
          const items = [dynamoAccountItem, costCenter];

          const queryCommandOutput: QueryCommandOutput = {
            Items: items.map((item) => {
              return marshall(item);
            }),
            $metadata: {}
          };
          mockDDB.on(QueryCommand).resolves(queryCommandOutput);

          const actualAccount = await accountService.getAccount(expectedAccountId, true);
          expect(actualAccount.id).toEqual(expectedAccountId);
          expect(actualAccount.costCenter!.id).toEqual(expectedCCId);
        });
      });
    });

    describe('when there is no matching accountId', () => {
      test('throws an error when there is no Item associated with the accountId', async () => {
        mockDDB.on(GetItemCommand).resolves({
          Item: undefined
        });
        const noMatchId = 'noMatchId';
        await expect(accountService.getAccount(noMatchId)).rejects.toThrowError(
          `Could not find account ${noMatchId}`
        );
      });
    });
  });
});
