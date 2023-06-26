/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import * as Boom from '@hapi/boom';
import { CostCenterStatus } from '../constants/costCenterStatus';
import { InvalidAccountStateError } from '../errors/InvalidAccountStateError';
import { Account } from '../models/accounts/account';
import { CostCenter, CostCenterParser } from '../models/costCenters/costCenter';
import { CreateCostCenterRequest } from '../models/costCenters/createCostCenterRequest';
import { DeleteCostCenterRequest } from '../models/costCenters/deleteCostCenterRequest';
import { ListCostCentersRequest } from '../models/costCenters/listCostCentersRequest';
import { UpdateCostCenterRequest } from '../models/costCenters/updateCostCenterRequest';
import AccountService from './accountService';

export default class CostCenterService {
  private _dynamoDbService: DynamoDBService;
  private _resourceType: string = 'costCenter';

  public constructor(dynamoDbService: DynamoDBService) {
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
    checkDependency: (costCenterId: string) => Promise<void>
  ): Promise<void> {
    await checkDependency(request.id);
    await this.getCostCenter(request.id);

    try {
      await this._dynamoDbService.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(request.id, resourceTypeToKey.costCenter),
        params: {
          item: { status: CostCenterStatus.DELETED, resourceType: `${this._resourceType}_deleted` }
        }
      });
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
    await this.getCostCenter(request.id);

    const currentDate = new Date().toISOString();
    const updatedCostCenter = {
      name: request.name,
      description: request.description,
      updatedAt: currentDate
    };

    let response;
    try {
      response = await this._dynamoDbService.updateExecuteAndFormat({
        key: buildDynamoDBPkSk(request.id, resourceTypeToKey.costCenter),
        params: { item: updatedCostCenter }
      });
    } catch (e) {
      console.error('Unable to update cost center', request);
      throw Boom.internal(`Unable to update CostCenter`);
    }
    if (response.Attributes) {
      return this._mapDDBItemToCostCenter(response.Attributes);
    }
    throw Boom.internal(`Unable to update CostCenter`);
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
    const response = (await this._dynamoDbService
      .get(buildDynamoDBPkSk(costCenterId, resourceTypeToKey.costCenter))
      .strong()
      .execute()) as GetItemCommandOutput;

    if (response.Item === undefined) {
      throw Boom.notFound(`Could not find cost center`);
    }

    return this._mapDDBItemToCostCenter(response.Item);
  }

  public async create(request: CreateCostCenterRequest): Promise<CostCenter> {
    const id = uuidWithLowercasePrefix(resourceTypeToKey.costCenter);
    let account: Account;

    const accountService = new AccountService(this._dynamoDbService);
    try {
      account = await accountService.getAccount(request.accountId);
    } catch (e) {
      console.error(`Failed to get account for cost center creation: ${e.message}`);
      throw Boom.badRequest(`Failed to get account for cost center creation.`);
    }

    if (account.status !== 'CURRENT') {
      throw new InvalidAccountStateError("Account status must be 'CURRENT' to create a Cost Center");
    }

    const currentDateTime = new Date(Date.now()).toISOString();

    const costCenter: CostCenter = {
      createdAt: currentDateTime,
      updatedAt: currentDateTime,
      id: id,
      dependency: request.accountId,
      accountId: request.accountId,
      description: request.description,
      name: request.name,
      awsAccountId: account.awsAccountId,
      hostingAccountHandlerRoleArn: account.hostingAccountHandlerRoleArn,
      envMgmtRoleArn: account.envMgmtRoleArn,
      encryptionKeyArn: account.encryptionKeyArn!,
      subnetId: account.subnetId!,
      vpcId: account.vpcId!,
      environmentInstanceFiles: account.environmentInstanceFiles!,
      externalId: account.externalId,
      status: CostCenterStatus.AVAILABLE
    };

    const dynamoItem: { [key: string]: string } = {
      ...costCenter,
      resourceType: this._resourceType,
      dependency: request.accountId
    };

    delete dynamoItem.accountId;

    const key = buildDynamoDBPkSk(id, resourceTypeToKey.costCenter);

    const response = await this._dynamoDbService.updateExecuteAndFormat({
      key,
      params: {
        item: dynamoItem
      }
    });
    if (response.Attributes) {
      return this._mapDDBItemToCostCenter(response.Attributes);
    }
    throw Boom.internal(`Unable to create CostCenter`);
  }

  private _mapDDBItemToCostCenter(item: { [key: string]: unknown }): CostCenter {
    const costCenter: { [key: string]: unknown } = { ...item, accountId: item.dependency };
    // parse will remove pk and sk from the DDB item
    return CostCenterParser.parse(costCenter);
  }

  private async _getAccount(accountId: string): Promise<Account> {
    const accountService = new AccountService(this._dynamoDbService);
    try {
      return await accountService.getAccount(accountId);
    } catch (e) {
      console.error(`Failed to get account for cost center creation: ${e}`);
      throw Boom.badRequest(`Failed to get account for cost center creation`);
    }
  }
}
