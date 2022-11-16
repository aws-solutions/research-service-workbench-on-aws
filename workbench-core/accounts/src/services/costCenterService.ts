/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  buildDynamoDBPkSk,
  removeDynamoDbKeys,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  PaginatedResponse,
  validateSingleSortAndFilter,
  getSortQueryParams,
  getFilterQueryParams,
  DEFAULT_API_PAGE_SIZE,
  QueryParams,
  addPaginationToken
} from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import Boom from '@hapi/boom';
import { Account } from '../models/account';
import { CostCenter, CostCenterParser } from '../models/costCenters/costCenter';
import { ListCostCentersRequest } from '../models/costCenters/listCostCentersRequest';
import CreateCostCenterRequest from '../models/createCostCenterRequest';
import AccountService from './accountService';

export default class CostCenterService {
  private _dynamoDbService: DynamoDBService;
  private readonly _tableName: string;
  private _resourceType: string = 'costCenter';

  public constructor(constants: { TABLE_NAME: string }, dynamoDbService: DynamoDBService) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._dynamoDbService = dynamoDbService;
  }

  public async listCostCenters(request: ListCostCentersRequest): Promise<PaginatedResponse<CostCenter>> {
    const { filter, sort, pageSize, paginationToken } = request;
    validateSingleSortAndFilter(filter, sort);

    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };
    const gsiNames = ['getResourceByName'];
    const filterQuery = getFilterQueryParams(filter, gsiNames);
    const sortQuery = getSortQueryParams(sort, gsiNames);
    queryParams = { ...queryParams, ...filterQuery, ...sortQuery };

    queryParams = addPaginationToken(paginationToken, queryParams);
    const response = await this._dynamoDbService.getPaginatedItems(queryParams);

    console.log('paginationToken', response.paginationToken);
    return {
      data: response.data.map((item) => {
        return this._mapDDBItemToCostCenter(item);
      }),
      paginationToken: response.paginationToken
    };
  }

  public async getCostCenter(costCenterId: string): Promise<CostCenter> {
    // Get by id
    const response = (await this._dynamoDbService
      .get(buildDynamoDBPkSk(costCenterId, resourceTypeToKey.costCenter))
      .execute()) as GetItemCommandOutput;

    if (response.Item === undefined) {
      throw Boom.notFound(`Could not find cost center ${costCenterId}`);
    }

    return this._mapDDBItemToCostCenter(response.Item);
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
      resourceType: this._resourceType,
      dependency: createCostCenter.accountId
    };

    delete dynamoItem.accountId;

    const key = buildDynamoDBPkSk(id, resourceTypeToKey.costCenter);

    await this._dynamoDbService
      .update(key, {
        item: dynamoItem
      })
      .execute();

    return costCenter;
  }

  private _mapDDBItemToCostCenter(item: { [key: string]: unknown }): CostCenter {
    let costCenter: { [key: string]: unknown } = { ...item, accountId: item.dependency };
    costCenter = removeDynamoDbKeys(costCenter);
    return CostCenterParser.parse(costCenter);
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
