/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  AwsService,
  buildDynamoDBPkSk,
  removeDynamoDbKeys,
  resourceTypeToKey,
  uuidWithLowercasePrefix
} from '@aws/workbench-core-base';
import Boom from '@hapi/boom';
import { Account } from '../models/account';
import CostCenter from '../models/costCenter/costCenter';
import CreateCostCenterRequest from '../models/costCenter/createCostCenterRequest';
import AccountService from './accountService';

export default class CostCenterService {
  private _aws: AwsService;
  private readonly _tableName: string;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getCostCenter(costCenterId: string): Promise<CostCenter> {
    // Get by id
    const response = (await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(costCenterId, resourceTypeToKey.costCenter))
      .execute()) as GetItemCommandOutput;

    if (response.Item === undefined) {
      throw Boom.notFound(`Could not find cost center ${costCenterId}`);
    }

    response.Item.accountId = response.Item.dependency;

    let costCenter = response.Item as { [key: string]: never };
    costCenter = removeDynamoDbKeys(costCenter);

    return costCenter as unknown as CostCenter;
  }

  public async create(createCostCenter: CreateCostCenterRequest): Promise<CostCenter> {
    const id = uuidWithLowercasePrefix(resourceTypeToKey.costCenter);

    const account = await this._getAccount(createCostCenter.accountId);

    const createdAt = new Date(Date.now()).toISOString();

    const costCenter: CostCenter = {
      createdAt: createdAt,
      updatedAt: createdAt,
      id: id,
      accountId: createCostCenter.accountId,
      description: createCostCenter.description,
      name: createCostCenter.name,
      // Account data
      awsAccountId: account.awsAccountId,
      encryptionKeyArn: account.encryptionKeyArn,
      envMgmtRoleArn: account.envMgmtRoleArn,
      environmentInstanceFiles: account.environmentInstanceFiles,
      externalId: account.externalId,
      hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
      subnetId: account.subnetId,
      vpcId: account.vpcId
    };

    const dynamoItem: { [key: string]: string } = {
      ...costCenter,
      resourceType: 'cost center',
      dependency: createCostCenter.accountId
    };

    delete dynamoItem.accountId;

    const key = buildDynamoDBPkSk(id, resourceTypeToKey.costCenter);

    await this._aws.helpers.ddb
      .update(key, {
        item: dynamoItem
      })
      .execute();

    return costCenter;
  }

  private async _getAccount(accountId: string): Promise<Account> {
    const accountService = new AccountService(this._tableName);

    try {
      return await accountService.getAccount(accountId);
    } catch (e) {
      throw Boom.badRequest(`Could not find account ${accountId}`);
    }
  }
}
