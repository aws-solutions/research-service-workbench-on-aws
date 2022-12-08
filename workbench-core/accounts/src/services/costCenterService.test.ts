/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('uuid', () => ({ v4: () => 'someId' }));

import { DynamoDBClient, GetItemCommand, QueryCommand, UpdateItemCommand } from '@aws-sdk/client-dynamodb';
import { marshall } from '@aws-sdk/util-dynamodb';
import { resourceTypeToKey } from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import * as Boom from '@hapi/boom';
import { mockClient } from 'aws-sdk-client-mock';
import { Account, AccountParser } from '../models/accounts/account';
import { CostCenter, CostCenterParser } from '../models/costCenters/costCenter';
import CreateCostCenterRequest from '../models/costCenters/createCostCenterRequest';
import { ListCostCentersRequestParser } from '../models/costCenters/listCostCentersRequest';
import { UpdateCostCenterRequestParser } from '../models/costCenters/updateCostCenterRequest';
import CostCenterService from './costCenterService';

describe('CostCenterService', () => {
  const ORIGINAL_ENV = process.env;
  let account: Account;
  const costCenterService = new CostCenterService(
    new DynamoDBService({ region: 'us-east-1', table: 'tableName' })
  );
  const accountId = 'acc-someId';
  const ddbMock = mockClient(DynamoDBClient);
  const mockDateObject = new Date('2021-02-26T22:42:16.652Z');
  type CostCenterJson = Omit<CostCenter, 'accountId'> & { pk: string; sk: string; dependency: string };

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };
    process.env.AWS_REGION = 'us-east-1';
    process.env.STACK_NAME = 'swb-swbv2-va';

    jest.clearAllMocks();

    jest.spyOn(Date, 'now').mockImplementationOnce(() => mockDateObject.getTime());

    account = AccountParser.parse({
      name: '',
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
      externalId: 'externalId',
      updatedAt: '',
      createdAt: '',
      error: undefined,
      CC: undefined
    });
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
          awsAccountId: account.awsAccountId,
          encryptionKeyArn: account.encryptionKeyArn!,
          envMgmtRoleArn: account.envMgmtRoleArn,
          environmentInstanceFiles: account.environmentInstanceFiles!,
          externalId: account.externalId,
          hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
          subnetId: account.subnetId!,
          vpcId: account.vpcId!,
          name: 'a name',
          accountId: accountId,
          dependency: accountId,
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
    let costCenterId: string;
    let costCenterJson: CostCenterJson;
    let expectedCostCenter: CostCenter;
    beforeAll(() => {
      costCenterId = 'cc-someId';
      costCenterJson = {
        pk: `CC#${costCenterId}`,
        sk: `CC#${costCenterId}`,
        id: costCenterId,
        name: 'CostCenter-1',
        dependency: accountId,
        description: 'Description for CostCenter-1',
        subnetId: account.subnetId!,
        vpcId: account.vpcId!,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId,
        encryptionKeyArn: account.encryptionKeyArn!,
        environmentInstanceFiles: account.environmentInstanceFiles!,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        awsAccountId: account.awsAccountId,
        createdAt: mockDateObject.toISOString(),
        updatedAt: mockDateObject.toISOString()
      };
      expectedCostCenter = {
        ...costCenterJson,
        accountId: costCenterJson.dependency
      };
      expectedCostCenter = CostCenterParser.parse(expectedCostCenter);
    });

    describe('with more than one "page" of costCenters', () => {
      test('it returns cost centers and a pagination token', async () => {
        // BUILD
        // Build request for system under test
        const request = ListCostCentersRequestParser.parse({
          pageSize: '1',
          filter: { name: { begins: 'CostCenter' } },
          sort: { name: 'desc' }
        });

        // Mock out DDB Service call. DDB service return JSON data and paginationToken
        const paginationToken = 'exampleToken';
        jest.spyOn(DynamoDBService.prototype, 'getPaginatedItems').mockImplementation((param) => {
          expect(param).toEqual({
            key: { name: 'resourceType', value: 'costCenter' },
            index: 'getResourceByName',
            limit: 1,
            sortKey: 'name',
            begins: { S: 'CostCenter' },
            forward: false
          });
          return Promise.resolve({
            data: [costCenterJson],
            paginationToken
          });
        });

        // OPERATE & CHECK
        await expect(costCenterService.listCostCenters(request)).resolves.toEqual({
          data: [expectedCostCenter],
          paginationToken: 'exampleToken'
        });
      });
    });

    describe('with one "page" of costCenters ', () => {
      test('it returns cost center and no pagination token', async () => {
        // BUILD
        // Build request for system under test
        const request = ListCostCentersRequestParser.parse({
          filter: { name: { begins: 'CostCenter' } },
          sort: { name: 'desc' }
        });

        // Mock out DDB Service call. DDB service return JSON data
        jest.spyOn(DynamoDBService.prototype, 'getPaginatedItems').mockImplementation((param) => {
          expect(param).toEqual({
            key: { name: 'resourceType', value: 'costCenter' },
            index: 'getResourceByName',
            sortKey: 'name',
            begins: { S: 'CostCenter' },
            forward: false
          });
          return Promise.resolve({
            data: [costCenterJson]
          });
        });

        // OPERATE & CHECK
        await expect(costCenterService.listCostCenters(request)).resolves.toEqual({
          data: [expectedCostCenter]
        });
      });
    });
  });

  describe('create', () => {
    describe('with a valid CreateCostCenter object', () => {
      let accountId: string;
      let createCostCenter: CreateCostCenterRequest;

      beforeEach(() => {
        accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;
        createCostCenter = {
          name: 'the name',
          description: 'the description',
          accountId: accountId
        };
      });

      describe('`dependency` is the id of a saved Account', () => {
        let costCenter: CostCenter;
        beforeEach(() => {
          ddbMock.on(GetItemCommand).resolves({
            Item: marshall(account, {
              removeUndefinedValues: true
            })
          });
          accountId = `${resourceTypeToKey.account.toLowerCase()}-sampleAccId`;

          const costCenterId = `cc-someId`;
          costCenter = {
            createdAt: mockDateObject.toISOString(),
            updatedAt: mockDateObject.toISOString(),
            awsAccountId: account.awsAccountId,
            encryptionKeyArn: account.encryptionKeyArn!,
            envMgmtRoleArn: account.envMgmtRoleArn,
            environmentInstanceFiles: account.environmentInstanceFiles!,
            externalId: account.externalId,
            hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
            subnetId: account.subnetId!,
            vpcId: account.vpcId!,
            name: createCostCenter.name,
            description: createCostCenter.description,
            dependency: createCostCenter.accountId,
            accountId: accountId,
            id: costCenterId
          };
          ddbMock.on(UpdateItemCommand).resolves({ Attributes: marshall(costCenter) });
        });

        test('it returns a CostCenter object with the associated Account metadata', async () => {
          const expectedCostCenter = CostCenterParser.parse({
            ...costCenter,
            accountId: costCenter.dependency
          });

          await expect(costCenterService.create(createCostCenter)).resolves.toEqual(expectedCostCenter);
        });
      });

      describe('`dependency` is not the id of a saved Account', () => {
        beforeEach(() => {
          ddbMock.on(GetItemCommand).rejects({});
        });

        test('returns an error', async () => {
          await expect(costCenterService.create(createCostCenter)).rejects.toThrow(
            `Failed to get account for cost center creation ${accountId}`
          );
        });
      });
    });
  });

  describe('delete', () => {
    let costCenterId: string;
    let costCenterJson: CostCenterJson;
    beforeEach(() => {
      jest.restoreAllMocks();
      costCenterId = 'cc-someId';
      costCenterJson = {
        pk: `CC#${costCenterId}`,
        sk: `CC#${costCenterId}`,
        id: costCenterId,
        name: 'CostCenter 1',
        dependency: accountId,
        description: 'Cost Center 1 description',
        subnetId: account.subnetId!,
        vpcId: account.vpcId!,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId,
        encryptionKeyArn: account.encryptionKeyArn!,
        environmentInstanceFiles: account.environmentInstanceFiles!,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        awsAccountId: account.awsAccountId,
        createdAt: mockDateObject.toISOString(),
        updatedAt: mockDateObject.toISOString()
      };
      // Mock getting projects associated with cost center
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });
      // Mock getting cost center item to check if cost center exist
      ddbMock.on(GetItemCommand).resolves({ Item: marshall(costCenterJson) });
      // Mock updating cost center
      ddbMock.on(UpdateItemCommand).resolves({});
    });

    async function checkDependencyAndProjDoesNotExist(): Promise<void> {
      return;
    }

    describe('with no projects associated to the cost center', () => {
      it('soft delete the CostCenter', async () => {
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjDoesNotExist)
        ).resolves;
      });
    });
    describe('with CostCenter that does not exist in DDB', () => {
      it('should throw "not find cost center error"', async () => {
        ddbMock.on(GetItemCommand).resolves({ Item: undefined });
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjDoesNotExist)
        ).rejects.toThrowError(Boom.notFound(`Could not find cost center ${costCenterId}`));
      });
    });
    describe('with a projects associated to the cost center', () => {
      it('does not delete the CostCenter and throws an error', async () => {
        async function checkDependencyAndProjExist(costCenterId: string): Promise<void> {
          throw Boom.conflict(
            `CostCenter ${costCenterId} cannot be deleted because it has project(s) associated with it`
          );
        }
        ddbMock.on(QueryCommand).resolves({
          Items: [
            marshall({
              sk: 'proj-example1',
              resourceType: 'project',
              pk: 'proj-example1',
              dependency: costCenterId
            })
          ]
        });
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjExist)
        ).rejects.toThrowError(
          Boom.conflict(
            `CostCenter ${costCenterId} cannot be deleted because it has project(s) associated with it`
          )
        );
      });
    });
  });

  describe('update', () => {
    let costCenterId: string;
    let costCenterName: string;
    let costCenterDescription: string;
    let costCenterJson: CostCenterJson;
    beforeEach(() => {
      jest.restoreAllMocks();
      costCenterId = 'cc-someId';
      costCenterName = 'CostCenter-1';
      costCenterDescription = 'Description for CostCenter-1';
      costCenterJson = {
        pk: `CC#${costCenterId}`,
        sk: `CC#${costCenterId}`,
        id: costCenterId,
        name: costCenterName,
        dependency: accountId,
        description: costCenterDescription,
        subnetId: account.subnetId!,
        vpcId: account.vpcId!,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId,
        encryptionKeyArn: account.encryptionKeyArn!,
        environmentInstanceFiles: account.environmentInstanceFiles!,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        awsAccountId: account.awsAccountId,
        createdAt: mockDateObject.toISOString(),
        updatedAt: mockDateObject.toISOString()
      };
      ddbMock.on(GetItemCommand).resolves({ Item: marshall(costCenterJson) });
    });

    describe('with a valid request', () => {
      test('it returns a valid response', async () => {
        ddbMock.on(UpdateItemCommand).resolves({
          Attributes: marshall(costCenterJson)
        });
        const costCenterUpdateRequest = UpdateCostCenterRequestParser.parse({
          id: costCenterId,
          name: costCenterName,
          description: costCenterDescription
        });

        await expect(costCenterService.updateCostCenter(costCenterUpdateRequest)).resolves.toEqual({
          id: costCenterId,
          name: costCenterName,
          accountId: 'acc-someId',
          dependency: 'acc-someId',
          description: costCenterDescription,
          subnetId: 'subnet-123',
          vpcId: 'vpc-123',
          envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
          externalId: 'externalId',
          encryptionKeyArn: 'sampleEncryptionKeyArn',
          environmentInstanceFiles: '',
          hostingAccountHandlerRoleArn: '',
          awsAccountId: 'awsAccountId',
          createdAt: '2021-02-26T22:42:16.652Z',
          updatedAt: '2021-02-26T22:42:16.652Z'
        });
      });
    });

    describe('with a DDB update error', () => {
      test('it returns a Boom error', async () => {
        ddbMock.on(UpdateItemCommand).rejects('DDB Update error');
        const costCenterUpdateRequest = UpdateCostCenterRequestParser.parse({
          id: costCenterId,
          name: costCenterName,
          description: costCenterDescription
        });

        await expect(costCenterService.updateCostCenter(costCenterUpdateRequest)).rejects.toThrowError(
          Boom.internal(`Unable to update CostCenter with params ${JSON.stringify(costCenterUpdateRequest)}`)
        );
      });
    });
  });

  describe('delete', () => {
    let costCenterId: string;
    let costCenterJson: CostCenterJson;
    beforeEach(() => {
      jest.restoreAllMocks();
      costCenterId = 'cc-someId';
      costCenterJson = {
        pk: `CC#${costCenterId}`,
        sk: `CC#${costCenterId}`,
        id: costCenterId,
        name: 'CostCenter 1',
        dependency: accountId,
        description: 'Cost Center 1 description',
        subnetId: account.subnetId!,
        vpcId: account.vpcId!,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId,
        encryptionKeyArn: account.encryptionKeyArn!,
        environmentInstanceFiles: account.environmentInstanceFiles!,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        awsAccountId: account.awsAccountId,
        createdAt: mockDateObject.toISOString(),
        updatedAt: mockDateObject.toISOString()
      };
      // Mock getting projects associated with cost center
      ddbMock.on(QueryCommand).resolves({
        Items: []
      });
      // Mock getting cost center item to check if cost center exist
      ddbMock.on(GetItemCommand).resolves({ Item: marshall(costCenterJson) });
      // Mock updating cost center
      ddbMock.on(UpdateItemCommand).resolves({});
    });

    async function checkDependencyAndProjDoesNotExist(): Promise<void> {
      return;
    }

    describe('with no projects associated to the cost center', () => {
      it('soft delete the CostCenter', async () => {
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjDoesNotExist)
        ).resolves;
      });
    });
    describe('with CostCenter that does not exist in DDB', () => {
      it('should throw "not find cost center error"', async () => {
        ddbMock.on(GetItemCommand).resolves({ Item: undefined });
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjDoesNotExist)
        ).rejects.toThrowError(Boom.notFound(`Could not find cost center ${costCenterId}`));
      });
    });
    describe('with a projects associated to the cost center', () => {
      it('does not delete the CostCenter and throws an error', async () => {
        async function checkDependencyAndProjExist(costCenterId: string): Promise<void> {
          throw Boom.conflict(
            `CostCenter ${costCenterId} cannot be deleted because it has project(s) associated with it`
          );
        }
        ddbMock.on(QueryCommand).resolves({
          Items: [
            marshall({
              sk: 'proj-example1',
              resourceType: 'project',
              pk: 'proj-example1',
              dependency: costCenterId
            })
          ]
        });
        await expect(
          costCenterService.softDeleteCostCenter({ id: costCenterId }, checkDependencyAndProjExist)
        ).rejects.toThrowError(
          Boom.conflict(
            `CostCenter ${costCenterId} cannot be deleted because it has project(s) associated with it`
          )
        );
      });
    });
  });

  describe('update', () => {
    let costCenterId: string;
    let costCenterName: string;
    let costCenterDescription: string;
    let costCenterJson: CostCenterJson;
    beforeEach(() => {
      jest.restoreAllMocks();
      costCenterId = 'cc-someId';
      costCenterName = 'CostCenter-1';
      costCenterDescription = 'Description for CostCenter-1';
      costCenterJson = {
        pk: `CC#${costCenterId}`,
        sk: `CC#${costCenterId}`,
        id: costCenterId,
        name: costCenterName,
        dependency: accountId,
        description: costCenterDescription,
        subnetId: account.subnetId!,
        vpcId: account.vpcId!,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId,
        encryptionKeyArn: account.encryptionKeyArn!,
        environmentInstanceFiles: account.environmentInstanceFiles!,
        hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
        awsAccountId: account.awsAccountId,
        createdAt: mockDateObject.toISOString(),
        updatedAt: mockDateObject.toISOString()
      };
      ddbMock.on(GetItemCommand).resolves({ Item: marshall(costCenterJson) });
    });

    describe('with a valid request', () => {
      test('it returns a valid response', async () => {
        ddbMock.on(UpdateItemCommand).resolves({
          Attributes: marshall(costCenterJson)
        });
        const costCenterUpdateRequest = UpdateCostCenterRequestParser.parse({
          id: costCenterId,
          name: costCenterName,
          description: costCenterDescription
        });

        await expect(costCenterService.updateCostCenter(costCenterUpdateRequest)).resolves.toEqual({
          id: costCenterId,
          name: costCenterName,
          accountId: 'acc-someId',
          dependency: 'acc-someId',
          description: costCenterDescription,
          subnetId: 'subnet-123',
          vpcId: 'vpc-123',
          envMgmtRoleArn: 'sampleEnvMgmtRoleArn',
          externalId: 'externalId',
          encryptionKeyArn: 'sampleEncryptionKeyArn',
          environmentInstanceFiles: '',
          hostingAccountHandlerRoleArn: '',
          awsAccountId: 'awsAccountId',
          createdAt: '2021-02-26T22:42:16.652Z',
          updatedAt: '2021-02-26T22:42:16.652Z'
        });
      });
    });

    describe('with a DDB update error', () => {
      test('it returns a Boom error', async () => {
        ddbMock.on(UpdateItemCommand).rejects('DDB Update error');
        const costCenterUpdateRequest = UpdateCostCenterRequestParser.parse({
          id: costCenterId,
          name: costCenterName,
          description: costCenterDescription
        });

        await expect(costCenterService.updateCostCenter(costCenterUpdateRequest)).rejects.toThrowError(
          Boom.internal(`Unable to update CostCenter with params ${JSON.stringify(costCenterUpdateRequest)}`)
        );
      });
    });
  });
});
