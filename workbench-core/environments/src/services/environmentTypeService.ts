/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, buildDynamoDBPkSk, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';

import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import envKeyNameToKey from '../constants/environmentKeyNameToKey';
import { EnvironmentTypeStatus } from '../constants/environmentTypeStatus';
import { DEFAULT_API_PAGE_SIZE, addPaginationToken, getPaginationToken } from '../utilities/paginationHelper';

interface EnvironmentType {
  pk: string;
  sk: string;
  id: string;
  productId: string;
  provisioningArtifactId: string;
  description: string;
  name: string;
  owner: string;
  type: string;
  params: {
    DefaultValue?: string;
    Description: string;
    IsNoEcho: boolean;
    ParameterKey: string;
    ParameterType: string;
    ParameterConstraints: {
      AllowedValues: string[];
    };
  }[];
  resourceType: string;
  status: EnvironmentTypeStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

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
      .get(buildDynamoDBPkSk(envTypeId, envKeyNameToKey.envType))
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
   * @param pageSize - the number of environment type objects to get (optional)
   * @param paginationToken - the token from the previous page for continuation (optional)
   *
   * @returns environment type objects
   */
  public async listEnvironmentTypes(
    pageSize?: number,
    paginationToken?: string
  ): Promise<{ data: EnvironmentType[]; paginationToken: string | undefined }> {
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };

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
    const attributesAllowedToUpdate = ['description', 'name', 'status'];
    const attributesNotAllowed = Object.keys(updatedValues).filter((key) => {
      return !attributesAllowedToUpdate.includes(key);
    });
    if (attributesNotAllowed.length > 0) {
      throw Boom.badRequest(`We do not support updating these attributes ${attributesNotAllowed}`);
    }
    try {
      await this.getEnvironmentType(envTypeId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment type ${envTypeId} to update`);
      }
      throw e;
    }

    const currentDate = new Date().toISOString();
    const updatedEnvType = {
      ...updatedValues,
      createdAt: currentDate,
      updatedAt: currentDate,
      updatedBy: ownerId
    };

    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(envTypeId, envKeyNameToKey.envType), { item: updatedEnvType })
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
  public async createNewEnvironmentType(
    ownerId: string,
    params: {
      productId: string;
      provisioningArtifactId: string;
      description: string;
      name: string;
      type: string;
      params: {
        DefaultValue?: string;
        Description: string;
        IsNoEcho: boolean;
        ParameterKey: string;
        ParameterType: string;
        ParameterConstraints: {
          AllowedValues: string[];
        };
      }[];
      status: EnvironmentTypeStatus;
    }
  ): Promise<EnvironmentType> {
    const id = uuidv4();
    const currentDate = new Date().toISOString();
    const newEnvType: EnvironmentType = {
      id,
      ...buildDynamoDBPkSk(id, envKeyNameToKey.envType),
      owner: ownerId,
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: ownerId,
      updatedBy: ownerId,
      resourceType: this._resourceType,
      ...params
    };
    const item = newEnvType as unknown as { [key: string]: unknown };
    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(id, envKeyNameToKey.envType), { item })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentType;
    }
    console.error('Unable to create environment type', newEnvType);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(params)}`);
  }
}
