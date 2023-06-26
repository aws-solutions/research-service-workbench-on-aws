/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  buildDynamoDBPkSk,
  QueryParams,
  resourceTypeToKey,
  CFNTemplateParameters,
  provisionArtifactIdRegExpString,
  productIdRegExpString,
  validateSingleSortAndFilter,
  getSortQueryParams,
  getFilterQueryParams,
  DEFAULT_API_PAGE_SIZE,
  addPaginationToken
} from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';

import * as Boom from '@hapi/boom';
import { EnvironmentTypeStatus } from '../constants/environmentTypeStatus';
import { EnvironmentType, EnvironmentTypeParser } from '../models/environmentTypes/environmentType';
import { ListEnvironmentTypesRequest } from '../models/environmentTypes/listEnvironmentTypesRequest';
import { UpdateEnvironmentTypeRequest } from '../models/environmentTypes/updateEnvironmentTypeRequest';

export default class EnvironmentTypeService {
  private _dynamoDbService: DynamoDBService;
  private _resourceType: string = 'envType';

  public constructor(dynamoDbService: DynamoDBService) {
    this._dynamoDbService = dynamoDbService;
  }

  /**
   * Get environment type object from DDB for given envTypeId
   * @param envTypeId - the environment type identifier
   *
   * @returns environment type object
   */
  public async getEnvironmentType(envTypeId: string): Promise<EnvironmentType> {
    const response = await this._dynamoDbService
      .get(buildDynamoDBPkSk(envTypeId, resourceTypeToKey.envType))
      .execute();
    const item = (response as GetItemCommandOutput).Item;
    if (item === undefined) {
      throw Boom.notFound(`Could not find environment type`);
    } else {
      const envType = EnvironmentTypeParser.parse(item);
      return Promise.resolve(envType);
    }
  }

  /**
   * List environment type objects from DDB
   * @param request - pagination, filter and sorting parameters
   *
   * @returns environment type objects
   */
  public async listEnvironmentTypes(
    request: ListEnvironmentTypesRequest
  ): Promise<{ data: EnvironmentType[]; paginationToken?: string }> {
    const { filter, sort, pageSize, paginationToken } = request;
    validateSingleSortAndFilter(filter, sort);
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };
    const gsiNames = ['getResourceByName', 'getResourceByStatus'];
    const filterQuery = getFilterQueryParams(filter, gsiNames);
    const sortQuery = getSortQueryParams(sort, gsiNames);
    queryParams = { ...queryParams, ...filterQuery, ...sortQuery };

    queryParams = addPaginationToken(paginationToken, queryParams);
    const envTypesResponse = await this._dynamoDbService.getPaginatedItems(queryParams);

    return {
      data: envTypesResponse.data.map((item) => {
        return EnvironmentTypeParser.parse(item);
      }),
      paginationToken: envTypesResponse.paginationToken
    };
  }

  /**
   * Update environment type object in DDB
   * @param envTypeId - the environment type identifier
   * @param updatedValues - the attribute values to update for the given environment type
   *
   * @returns environment type object with updated attributes
   */
  public async updateEnvironmentType(request: UpdateEnvironmentTypeRequest): Promise<EnvironmentType> {
    let environmentType: EnvironmentType | undefined = undefined;
    const { envTypeId, ...updatedValues } = request;
    try {
      environmentType = await this.getEnvironmentType(envTypeId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment type to update`);
      }
      throw e;
    }
    await this._validateStatusChange(updatedValues.status, environmentType);
    const currentDate = new Date().toISOString();
    const updatedEnvType = {
      ...updatedValues,
      createdAt: currentDate,
      updatedAt: currentDate
    };

    const response = await this._dynamoDbService.updateExecuteAndFormat({
      key: buildDynamoDBPkSk(envTypeId, resourceTypeToKey.envType),
      params: { item: updatedEnvType }
    });
    if (response.Attributes) {
      return EnvironmentTypeParser.parse(response.Attributes);
    }
    console.error('Unable to update environment type', updatedEnvType);
    throw Boom.internal(`Unable to update environment type`);
  }

  /**
   * Create environment type object in DDB
   * @param params - the environment type object attribute key value pairs
   *
   * @returns environment type object
   */
  public async createNewEnvironmentType(params: {
    productId: string;
    provisioningArtifactId: string;
    description: string;
    name: string;
    type: string;
    params: CFNTemplateParameters;
    status: EnvironmentTypeStatus;
  }): Promise<EnvironmentType> {
    // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
    if (!params.productId.match(new RegExp(productIdRegExpString))) {
      throw Boom.badRequest('productId request parameter is invalid');
    }
    // eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
    if (!params.provisioningArtifactId.match(new RegExp(provisionArtifactIdRegExpString))) {
      throw Boom.badRequest('provisionArtiactId request parameter is invalid');
    }
    const id = `${resourceTypeToKey.envType.toLowerCase()}-${params.productId},${
      params.provisioningArtifactId
    }`;
    const currentDate = new Date().toISOString();
    const newEnvType: EnvironmentType = EnvironmentTypeParser.parse({
      id,
      createdAt: currentDate,
      updatedAt: currentDate,
      ...params
    });

    const dynamoItem: Record<string, unknown> = {
      ...newEnvType,
      resourceType: this._resourceType
    };

    const response = await this._dynamoDbService.updateExecuteAndFormat({
      key: buildDynamoDBPkSk(id, resourceTypeToKey.envType),
      params: { item: dynamoItem }
    });
    if (response.Attributes) {
      return EnvironmentTypeParser.parse(response.Attributes);
    }
    console.error('Unable to create environment type', newEnvType);
    throw Boom.internal(`Unable to create environment type`);
  }

  private async _validateStatusChange(status?: string, environmentType?: EnvironmentType): Promise<void> {
    if (status === 'NOT_APPROVED' && environmentType?.status === 'APPROVED') {
      const etcQueryParams: QueryParams = {
        key: { name: 'resourceType', value: 'envTypeConfig' },
        index: 'getResourceByDependency',
        sortKey: 'dependency',
        eq: { S: environmentType.id },
        limit: DEFAULT_API_PAGE_SIZE
      };
      const dependencies = await this._dynamoDbService.getPaginatedItems(etcQueryParams);
      if (dependencies?.data?.length) {
        const errorMessage = `Unable to reovke environment type, Environment Type has active configurations`;
        console.error(errorMessage);
        throw Boom.conflict(errorMessage);
      }
    }
  }
}
