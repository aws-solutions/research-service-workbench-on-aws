/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  AwsService,
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
  addPaginationToken,
  getPaginationToken
} from '@aws/workbench-core-base';

import Boom from '@hapi/boom';
import { EnvironmentTypeStatus } from '../constants/environmentTypeStatus';
import { EnvironmentType } from '../interfaces/environmentType';
import { ListEnvironmentTypesRequest } from '../interfaces/listEnvironmentTypesRequest';

export default class EnvironmentTypeService {
  private _aws: AwsService;
  private _resourceType: string = 'envType';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  /**
   * Get environment type object from DDB for given envTypeId
   * @param envTypeId - the environment type identifier
   *
   * @returns environment type object
   */
  public async getEnvironmentType(envTypeId: string): Promise<EnvironmentType> {
    const response = await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(envTypeId, resourceTypeToKey.envType))
      .execute();
    const item = (response as GetItemCommandOutput).Item;
    if (item === undefined) {
      throw Boom.notFound(`Could not find environment type ${envTypeId}`);
    } else {
      const envType = item as unknown as EnvironmentType;
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
    const envTypesResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const token = getPaginationToken(envTypesResponse);

    return {
      data: envTypesResponse.Items as unknown as EnvironmentType[],
      paginationToken: token
    };
  }

  /**
   * Update environment type object in DDB
   * @param ownerId - the user requesting the update
   * @param envTypeId - the environment type identifier
   * @param updatedValues - the attribute values to update for the given environment type
   *
   * @returns environment type object with updated attributes
   */
  public async updateEnvironmentType(
    ownerId: string,
    envTypeId: string,
    updatedValues: { [key: string]: string }
  ): Promise<EnvironmentType> {
    let environmentType: EnvironmentType | undefined = undefined;
    const attributesAllowedToUpdate = ['description', 'name', 'status'];
    const attributesNotAllowed = Object.keys(updatedValues).filter((key) => {
      return !attributesAllowedToUpdate.includes(key);
    });
    if (attributesNotAllowed.length > 0) {
      throw Boom.badRequest(`We do not support updating these attributes ${attributesNotAllowed}`);
    }
    try {
      environmentType = await this.getEnvironmentType(envTypeId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment type ${envTypeId} to update`);
      }
      throw e;
    }
    await this._validateStatusChange(updatedValues, environmentType);
    const currentDate = new Date().toISOString();
    const updatedEnvType = {
      ...updatedValues,
      createdAt: currentDate,
      updatedAt: currentDate,
      updatedBy: ownerId
    };

    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(envTypeId, resourceTypeToKey.envType), { item: updatedEnvType })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentType;
    }
    console.error('Unable to update environment type', updatedEnvType);
    throw Boom.internal(`Unable to update environment type with params: ${JSON.stringify(updatedValues)}`);
  }

  /**
   * Create environment type object in DDB
   * @param ownerId - the user requesting the operation
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
    const newEnvType: EnvironmentType = {
      id,
      ...buildDynamoDBPkSk(id, resourceTypeToKey.envType),
      createdAt: currentDate,
      updatedAt: currentDate,
      resourceType: this._resourceType,
      ...params
    };
    const item = newEnvType as unknown as { [key: string]: unknown };
    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(id, resourceTypeToKey.envType), { item })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentType;
    }
    console.error('Unable to create environment type', newEnvType);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(params)}`);
  }
  private async _validateStatusChange(
    updatedValues: { [key: string]: string },
    environmentType?: EnvironmentType
  ): Promise<void> {
    if (
      Object.entries(updatedValues).filter(([key, value]) => key === 'status' && value === 'NOT_APPROVED')
        .length > 0 &&
      environmentType?.status === 'APPROVED'
    ) {
      const etcQueryParams: QueryParams = {
        key: { name: 'resourceType', value: 'envTypeConfig' },
        index: 'getResourceByDependency',
        sortKey: 'dependency',
        eq: { S: environmentType.id },
        limit: DEFAULT_API_PAGE_SIZE
      };
      const dependencies = await this._aws.helpers.ddb.query(etcQueryParams).execute();
      if (dependencies?.Items?.length) {
        const errorMessage = `Unable to reovke environment type: ${environmentType.id}, Environment Type has active configurations`;
        console.error(errorMessage);
        throw Boom.conflict(errorMessage);
      }
    }
  }
}
