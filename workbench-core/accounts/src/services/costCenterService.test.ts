/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({ v4: () => 'someId' }));

import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { mockClient } from 'aws-sdk-client-mock';
import Account from '../models/account';
import CostCenter from '../models/costCenter';
import CreateCostCenter from '../models/createCostCenter';
import CostCenterService from './costCenterService';

describe('CostCenterService', () => {
  const ORIGINAL_ENV = process.env;
  let accountMetadata: Account;
  const costCenterService = new CostCenterService({ TABLE_NAME: 'tableName' });
  const accountId = 'acc-someId';

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';

    accountMetadata = {
      error: undefined,
      id: accountId,
      cidr: '',
      hostingAccountHandlerRoleArn: '',
      envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
      vpcId: 'vpc-123',
      subnetId: 'subnet-123',
      encryptionKeyArn: 'sampleEncryptionKeyArn',
      environmentInstanceFiles: '',
      stackName: `${process.env.STACK_NAME!}-hosting-account`,
      status: 'CURRENT',
      awsAccountId: 'awsAccountId',
      externalId: 'externalId'
    };
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV; // Restore old environment
  });

  describe('create', () => {
    const mockDynamo = mockClient(DynamoDBClient);

    describe('with a valid CreateCostCenter object', () => {
      const accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;
      const createCostCenter: CreateCostCenter = {
        name: 'the name',
        description: 'the description',
        dependency: accountId
      };

      describe('`dependency` is the id of a saved Account', () => {
        beforeEach(() => {
          mockDynamo.on(GetItemCommand).resolves({
            Item: marshall(accountMetadata, {
              removeUndefinedValues: true
            })
          });

          mockDynamo.on(UpdateItemCommand).resolves({});
        });

        test('it returns a CostCenter object with the associated Account metadata', async () => {
          const expectedCostCenter: CostCenter = {
            awsAccountId: accountMetadata.awsAccountId,
            encryptionKeyArn: accountMetadata.encryptionKeyArn,
            envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
            environmentInstanceFiles: accountMetadata.environmentInstanceFiles,
            externalId: accountMetadata.externalId,
            hostingAccountHandlerRoleArn: accountMetadata.hostingAccountHandlerRoleArn,
            subnetId: accountMetadata.subnetId,
            vpcId: accountMetadata.vpcId,
            ...createCostCenter,
            id: `cc-someId`
          };

          await expect(costCenterService.create(createCostCenter)).resolves.toEqual(expectedCostCenter);
        });
      });

      describe('`dependency` is not the id of a saved Account', () => {
        beforeEach(() => {
          mockDynamo.on(GetItemCommand).rejects({});
        });

        test('returns an error', async () => {
          await expect(costCenterService.create(createCostCenter)).rejects.toThrow(
            `Could not find account ${accountId}`
          );
        });
      });
    });
  });
});
