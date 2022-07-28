/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({
  v4: jest.fn()
}));
const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { mockClient } from 'aws-sdk-client-mock';
import AccountService from './accountService';

describe('AccountService', () => {
  const ORIGINAL_ENV = process.env;
  let accountMetadata: { [id: string]: string } = {};
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';
    mockUuid.v4.mockImplementationOnce(() => 'sampleAccId');
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

  test('createOrUpdate follows create account path as expected', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    accountMetadata.awsAccountId = '123456789012';
    accountMetadata.externalId = 'workbench';

    // OPERATE
    const response = await accountService.createOrUpdate(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate follows update account path as expected', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
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
    const response = await accountService.createOrUpdate(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate follows update account path as expected without awsAccountId or externalId', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
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
    const response = await accountService.createOrUpdate(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate throws error when update process finds account with different aws account id', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
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
    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'The AWS Account mapped to this accountId is different than the one provided'
    );
  });

  test('createOrUpdate throws error when update process cannot find account', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({});

    accountMetadata.id = 'sampleAccId';
    accountMetadata.accountId = 'sampleAccId';
    accountMetadata.awsAccountId = '123456789012';

    // OPERATE & CHECK
    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      `Could not find account ${accountMetadata.accountId}`
    );
  });

  test('createOrUpdate throws error when create process finds a duplicate entry', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 1 });

    accountMetadata.awsAccountId = '123456789012';

    // OPERATE & CHECK
    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'This AWS Account was found in DDB. Please provide the correct id value in request body'
    );
  });

  test('createOrUpdate throws error when create has missing aws account ID', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    // OPERATE & CHECK
    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'Missing AWS Account ID in request body'
    );
  });

  test('createOrUpdate follows create account path as expected', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    accountMetadata.awsAccountId = '123456789012';

    // OPERATE
    const response = await accountService.createOrUpdate(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate follows update account path as expected when aws account not provided in metadata', async () => {
    // BUILD
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
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
    const response = await accountService.createOrUpdate(accountMetadata);

    // CHECK
    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });
});
