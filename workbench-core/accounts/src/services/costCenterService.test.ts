/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({ v4: () => 'someId' }));

import { DynamoDBClient, GetItemCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { mockClient } from 'aws-sdk-client-mock';
import { Account } from '../models/account';
import { CostCenter } from '../models/costCenters/costCenter';
import CreateCostCenter from '../models/createCostCenterRequest';
import CostCenterService from './costCenterService';

describe('CostCenterService', () => {
  const ORIGINAL_ENV = process.env;
  let accountMetadata: Account;
  const costCenterService = new CostCenterService({ TABLE_NAME: 'tableName' });
  const accountId = 'acc-someId';
  const ddbMock = mockClient(DynamoDBClient);
  const mockDateObject = new Date('2021-02-26T22:42:16.652Z');

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';

    jest.clearAllMocks();

    jest.spyOn(Date, 'now').mockImplementationOnce(() => mockDateObject.getTime());

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

  describe('getCostCenter', () => {
    describe('when a cost center has an id', () => {
      let costCenterId: string;
      let expectedCostCenter: CostCenter | undefined;

      beforeEach(() => {
        costCenterId = 'cc-someId';

        expectedCostCenter = {
          createdAt: mockDateObject.toISOString(),
          updatedAt: mockDateObject.toISOString(),
          awsAccountId: accountMetadata.awsAccountId,
          encryptionKeyArn: accountMetadata.encryptionKeyArn,
          envMgmtRoleArn: accountMetadata.envMgmtRoleArn,
          environmentInstanceFiles: accountMetadata.environmentInstanceFiles,
          externalId: accountMetadata.externalId,
          hostingAccountHandlerRoleArn: accountMetadata.hostingAccountHandlerRoleArn,
          subnetId: accountMetadata.subnetId,
          vpcId: accountMetadata.vpcId,
          name: 'a name',
          accountId: accountId,
          description: 'a description',
          id: costCenterId
        };
      });

      describe('and the cost center has been saved', () => {
        beforeEach(() => {
          ddbMock.on(GetItemCommand).resolves({
            Item: marshall(
              {
                ...expectedCostCenter,
                dependency: accountId
              },
              {
                removeUndefinedValues: true
              }
            )
          });
        });

        test('it returns the correct cost center', async () => {
          await expect(costCenterService.getCostCenter(costCenterId)).resolves.toEqual(expectedCostCenter);
        });
      });

      describe('and the cost center has NOT been saved', () => {
        beforeEach(() => {
          ddbMock.on(GetItemCommand).resolves({
            Item: undefined
          });
        });

        test('it throws an error', async () => {
          await expect(costCenterService.getCostCenter(costCenterId)).rejects.toThrow(
            `Could not find cost center ${costCenterId}`
          );
        });
      });
    });
  });

  describe('list costCenters', () => {
    describe('with more than one "page" of costCenters', () => {
      test('it return costCenters with a pagination token', () => {
        // request {
        //   pageSize: 1,
        //       filter: { name: { begins: 'Co' } },
        //   sort: { name: 'desc' }
        // }

        // queryParams {
        //   key: { name: 'resourceType', value: 'costCenter' },
        //   index: 'getResourceByName',
        //       limit: 1,
        //       sortKey: 'name',
        //       begins: { S: 'Co' },
        //   forward: false
        // }
        // TODO Implement this test
        expect(true).toBe(true);
      });
    });
    describe('with one cost center', () => {
      test('it returns one cost center', () => {
        // TODO Implement this test
        expect(true).toBe(true);
      });
    });
  });
  describe('create', () => {
    describe('with a valid CreateCostCenter object', () => {
      const accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;
      const createCostCenter: CreateCostCenter = {
        name: 'the name',
        description: 'the description',
        accountId: accountId
      };

      describe('`dependency` is the id of a saved Account', () => {
        beforeEach(() => {
          ddbMock.on(GetItemCommand).resolves({
            Item: marshall(accountMetadata, {
              removeUndefinedValues: true
            })
          });

          ddbMock.on(UpdateItemCommand).resolves({});
        });

        test('it returns a CostCenter object with the associated Account metadata', async () => {
          const expectedCostCenter: CostCenter = {
            createdAt: mockDateObject.toISOString(),
            updatedAt: mockDateObject.toISOString(),
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
          ddbMock.on(GetItemCommand).rejects({});
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
