/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({ v4: () => 'sampleAccId' }));

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
import { Account, AccountParser } from '../models/accounts/account';
import { CostCenter } from '../models/costCenters/costCenter';
import AccountService from './accountService';

describe('AccountService', () => {
  const ORIGINAL_ENV = process.env;

  let accountMetadata: { [id: string]: string } = {};
  let mockDDB: AwsStub<ServiceInputTypes, ServiceOutputTypes>;
  let accountService: AccountService;
  const accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;

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
      id: accountId,
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

  test('create follows create account path as expected', async () => {
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall(accountMetadata)
    });
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    // OPERATE
    const response = await accountService.create({
      name: 'fakeAccount',
      awsAccountId: accountMetadata.awsAccountId,
      envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
      hostingAccountHandlerRoleArn: accountMetadata.hostingAccountHandlerRoleArn,
      externalId: accountMetadata.externalId,
      environmentInstanceFiles: accountMetadata.environmentInstanceFiles
    });

    const expectedResponse = { ...accountMetadata };
    delete expectedResponse.resourceType;
    // CHECK
    expect(response).toEqual(expectedResponse);
  });

  test('update follows update account path as expected', async () => {
    const name = 'fakeAccount2';
    mockDDB.on(UpdateItemCommand).resolves({
      Attributes: marshall({ ...accountMetadata, name })
    });
    mockDDB.on(GetItemCommand).resolves({
      Item: marshall({ ...accountMetadata, name })
    });

    // OPERATE
    const response = await accountService.update({ name });

    // CHECK
    const expectedResponse = { ...accountMetadata };
    expectedResponse.name = name;
    delete expectedResponse.resourceType;
    expect(response).toEqual(expectedResponse);
  });

  test('update throws error when update process finds account with different aws account id', async () => {
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({
      Item: {
        name: { S: 'fakeAccountName' },
        envMgmtRoleArn: { S: 'fakeArn' },
        hostingAccountHandlerRoleArn: { S: 'fakeArn' },
        externalId: { S: 'fakeExternalId' },
        stackName: { S: 'fakeStackName' },
        status: { S: 'CURRENT' },
        updatedAt: { S: '2023-01-09T19:45:12.397Z' },
        createdAt: { S: '2023-01-09T19:45:12.397Z' },
        awsAccountId: { S: 'someOtherAwsAccountId' },
        targetAccountStackName: { S: 'swb-dev-va-hosting-account' },
        portfolioId: { S: 'port-1234' },
        id: { S: 'sampleAccId' },
        accountId: { S: 'sampleAccId' }
      }
    });

    // OPERATE & CHECK
    await expect(
      accountService.update({
        id: 'sampleAccId',
        accountId: 'sampleAccId',
        awsAccountId: '123456789012',
        externalId: 'workbench'
      })
    ).rejects.toThrow('The AWS Account mapped to this accountId is different than the one provided');
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
    await expect(
      accountService.create({
        name: 'fakeAccount',
        awsAccountId: accountMetadata.awsAccountId,
        envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
        hostingAccountHandlerRoleArn: accountMetadata.hostingAccountHandlerRoleArn,
        externalId: accountMetadata.externalId,
        environmentInstanceFiles: accountMetadata.environmentInstanceFiles
      })
    ).rejects.toThrow(
      'This AWS Account was found in DDB. Please provide the correct id value in request body'
    );
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
            dependency: '',
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

      test('throws an error when there is no Item associated with the accountId with metadata', async () => {
        mockDDB.on(QueryCommand).resolves({ Count: 0 });
        const noMatchId = 'noMatchId';
        await expect(accountService.getAccount(noMatchId, true)).rejects.toThrowError(
          `Could not find account ${noMatchId}`
        );
      });
    });
  });
});
