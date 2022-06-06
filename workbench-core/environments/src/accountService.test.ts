jest.mock('uuid', () => ({
  v4: jest.fn()
}));
const mockUuid = require('uuid') as { v4: jest.Mock<string, []> };

import { mockClient } from 'aws-sdk-client-mock';
import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import AccountService from './accountService';

describe('AccountService', () => {
  const ORIGINAL_ENV = process.env;
  beforeEach(() => {
    jest.resetModules(); // Most important - it clears the cache
    process.env = { ...ORIGINAL_ENV }; // Make a copy
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';
    mockUuid.v4.mockImplementationOnce(() => 'sampleAccId');
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  test('createOrUpdate follows create account path as expected', async () => {
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    const accountMetadata = {
      awsAccountId: '123456789012',
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

    const response = await accountService.createOrUpdate(accountMetadata);

    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate follows update account path as expected', async () => {
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
      accountId: 'sampleAccId',
      awsAccountId: '123456789012',
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

    const response = await accountService.createOrUpdate(accountMetadata);

    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate throws error when update process finds account with different aws account id', async () => {
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

    const accountMetadata = {
      id: 'sampleAccId',
      accountId: 'sampleAccId',
      externalId: 'workbench',
      awsAccountId: '123456789012',
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

    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'The AWS Account mapped to this accountId is different than the one provided'
    );
  });

  test('createOrUpdate throws error when update process cannot find account', async () => {
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(GetItemCommand).resolves({});

    const accountMetadata = {
      id: 'sampleAccId',
      accountId: 'sampleAccId',
      awsAccountId: '123456789012',
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

    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      `Could not find account ${accountMetadata.accountId}`
    );
  });

  test('createOrUpdate throws error when create process finds a duplicate entry', async () => {
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 1 });

    const accountMetadata = {
      awsAccountId: '123456789012',
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

    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'This AWS Account was found in DDB. Please provide the correct id value in request body'
    );
  });

  test('createOrUpdate throws error when create has missing aws account ID', async () => {
    const accountService = new AccountService(process.env.STACK_NAME!);

    const accountMetadata = {
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      accountHandlerRoleArn: 'sampleAccountHandlerRoleArn',
      externalId: 'workbench',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      encryptionKeyArn: 'sampleEncryptionKeyArn',
      environmentInstanceFiles: '',
      stackName: `${process.env.STACK_NAME!}-hosting-account`,
      status: 'CURRENT',
      resourceType: 'account'
    };

    await expect(accountService.createOrUpdate(accountMetadata)).rejects.toThrow(
      'Missing AWS Account ID in request body'
    );
  });

  test('createOrUpdate follows create account path as expected', async () => {
    const accountService = new AccountService(process.env.STACK_NAME!);

    const mockDDB = mockClient(DynamoDBClient);
    mockDDB.on(UpdateItemCommand).resolves({});
    mockDDB.on(QueryCommand).resolves({ Count: 0 });

    const accountMetadata = {
      awsAccountId: '123456789012',
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      accountHandlerRoleArn: 'sampleAccountHandlerRoleArn',
      externalId: 'workbench',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      encryptionKeyArn: 'sampleEncryptionKeyArn',
      environmentInstanceFiles: '',
      stackName: `${process.env.STACK_NAME!}-hosting-account`,
      status: 'CURRENT',
      resourceType: 'account'
    };

    const response = await accountService.createOrUpdate(accountMetadata);

    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });

  test('createOrUpdate follows update account path as expected when aws account not provided in metadata', async () => {
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

    const response = await accountService.createOrUpdate(accountMetadata);

    expect(response).toEqual({ ...accountMetadata, id: 'sampleAccId' });
  });
});
