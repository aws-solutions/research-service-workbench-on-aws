/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AwsService, resourceTypeToKey, buildPkSk, uuidWithLowercasePrefix } from '@aws/workbench-core-base';
import Boom from '@hapi/boom';
import Account from '../models/account';
import CostCenter from '../models/costCenter';
import CreateCostCenter from '../models/createCostCenter';
import AccountService from './accountService';

export default class CostCenterService {
  private _aws: AwsService;
  private _tableName: string;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getCostCenter(costCenterId: string): Promise<CostCenter> {
    // Get by id
    const response = (await this._aws.helpers.ddb
      .get(buildPkSk(costCenterId, resourceTypeToKey.costCenter))
      .execute()) as GetItemCommandOutput;

    const item = (response as GetItemCommandOutput).Item;

    if (item === undefined) {
      throw Boom.notFound(`Could not find cost center ${costCenterId}`);
    } else {
      const costCenter = item as unknown as CostCenter;
      return Promise.resolve(costCenter);
    }
  }

  public async isCostCenterValid(costCenterId: string): Promise<boolean> {
    try {
      await this.getCostCenter(costCenterId);
      return true;
    } catch (e) {
      return false;
    }
  }

  public async create(createCostCenter: CreateCostCenter): Promise<CostCenter> {
    const id = uuidWithLowercasePrefix(resourceTypeToKey.costCenter);

    const account = await this._getAccount(createCostCenter.dependency);

    const costCenter: CostCenter = {
      id: id,
      awsAccountId: account.awsAccountId,
      dependency: createCostCenter.dependency,
      description: createCostCenter.description,
      encryptionKeyArn: account.encryptionKeyArn,
      envMgmtRoleArn: account.envMgmtRoleArn,
      environmentInstanceFiles: account.environmentInstanceFiles,
      externalId: account.externalId,
      hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
      name: createCostCenter.name,
      subnetId: account.subnetId,
      vpcId: account.vpcId
    };

    await this._aws.helpers.ddb
      .update(
        {
          pk: id,
          sk: id
        },
        {
          item: costCenter as unknown as { [key: string]: string }
        }
      )
      .execute();

    return { ...costCenter, id };
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
