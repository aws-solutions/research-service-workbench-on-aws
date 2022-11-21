/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  buildDynamoDBPkSk,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  PaginatedResponse,
  validateSingleSortAndFilter,
  getSortQueryParams,
  getFilterQueryParams,
  QueryParams,
  addPaginationToken
} from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import Boom from '@hapi/boom';
import { Account } from '../models/account';
import { CostCenter, CostCenterParser } from '../models/costCenters/costCenter';
import { DeleteCostCenterRequest } from '../models/costCenters/deleteCostCenterRequest';
import { ListCostCentersRequest } from '../models/costCenters/listCostCentersRequest';
import { UpdateCostCenterRequest } from '../models/costCenters/updateCostCenterRequest';
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

  /**
   * Soft Delete Cost Center
   * @param request - request for deleting cost center
   * @param checkDependency - check whether we can delete the costCenter. The function should throw a Boom error if costCenter cannot be deleted
   * @returns void
   */
  public async softDeleteCostCenter(
    request: DeleteCostCenterRequest,
    checkDependency: (costCenterId: string) => void
  ): Promise<void> {
    await checkDependency(request.id);

    await this.getCostCenter(request.id);

    try {
      //TODO: Make the fix suggested here https://github.com/aws-solutions/solution-spark-on-aws/pull/632#discussion_r1028242550
      await this._dynamoDbService
        .update(buildDynamoDBPkSk(request.id, resourceTypeToKey.costCenter), {
          item: { resourceType: `${this._resourceType}_deleted` }
        })
        .execute();
    } catch (e) {
      throw Boom.internal('Unable to delete CostCenter');
    }
  }

  /**
   * Update costCenter
   * @param request - request for updating cost center
   * @returns CostCenter object with updated attributes
   */
  public async updateCostCenter(request: UpdateCostCenterRequest): Promise<CostCenter> {
    const currentDate = new Date().toISOString();

    const updatedCostCenter = {
      name: request.name,
      description: request.description,
      updatedAt: currentDate
    };

    let response;
    try {
      //TODO: Make the fix suggested here https://github.com/aws-solutions/solution-spark-on-aws/pull/632#discussion_r1028242550
      response = await this._dynamoDbService
        .update(buildDynamoDBPkSk(request.id, resourceTypeToKey.costCenter), { item: updatedCostCenter })
        .execute();
    } catch (e) {
      console.error('Unable to update cost center', request);
      throw Boom.internal(`Unable to update CostCenter with params ${JSON.stringify(request)}`);
    }
    if (response.Attributes) {
      return this._mapDDBItemToCostCenter(response.Attributes);
    }
    throw Boom.internal(`Unable to update CostCenter with params ${JSON.stringify(request)}`);
  }

  public async listCostCenters(request: ListCostCentersRequest): Promise<PaginatedResponse<CostCenter>> {
    const { filter, sort, pageSize, paginationToken } = request;
    validateSingleSortAndFilter(filter, sort);

    //Prep queryParams
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSize
    };
    const gsiNames = ['getResourceByName'];
    const filterQuery = getFilterQueryParams(filter, gsiNames);
    const sortQuery = getSortQueryParams(sort, gsiNames);
    queryParams = { ...queryParams, ...filterQuery, ...sortQuery };
    queryParams = addPaginationToken(paginationToken, queryParams);

    const response = await this._dynamoDbService.getPaginatedItems(queryParams);

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
    const costCenter: { [key: string]: unknown } = { ...item, accountId: item.dependency };
    // parse will remove pk and sk from the DDB item
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
