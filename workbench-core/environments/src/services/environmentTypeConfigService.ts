/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import environmentResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import { addPaginationToken, getPaginationToken, DEFAULT_API_PAGE_SIZE } from '../utilities/paginationHelper';
import EnvironmentTypeService from './environmentTypeService';

interface EnvironmentTypeConfig {
  pk: string;
  sk: string;
  id: string;
  productId: string;
  provisioningArtifactId: string;
  allowRoleIds: string[];
  type: string;
  description: string;
  name: string;
  owner: string;
  params: { key: string; value: string }[];
  resourceType: string;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}

export default class EnvironmentTypeConfigService {
  private _aws: AwsService;
  private _envTypeService: EnvironmentTypeService;
  private _resourceType: string = 'envTypeConfig';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
    this._envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  }

  /**
   * Get environment type config object from DDB for given envTypeId-envTypeConfigId combination
   * @param envTypeId - the environment type identifier for this config
   * @param envTypeConfigId - the environment type config identifier
   *
   * @returns environment type config object
   */
  public async getEnvironmentTypeConfig(
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<EnvironmentTypeConfig> {
    const response = await this._aws.helpers.ddb
      .get(this._buildEnvTypeConfigPkSk(envTypeId, envTypeConfigId))
      .execute();
    const item = (response as GetItemCommandOutput).Item;
    if (item === undefined) {
      throw Boom.notFound(`Could not find environment type config ${envTypeConfigId}`);
    } else {
      const envTypeConfig = item as unknown as EnvironmentTypeConfig;
      return Promise.resolve(envTypeConfig);
    }
  }

  /**
   * List environment type config objects from DDB
   * @param envTypeId - the environment type identifier for this config
   * @param pageSize - the number of environment type config objects to get (optional)
   * @param paginationToken - the token from the previous page for continuation (optional)
   *
   * @returns environment type config objects
   */
  public async listEnvironmentTypeConfigs(
    envTypeId: string,
    pageSize?: number,
    paginationToken?: string
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }> {
    let queryParams: QueryParams = {
      key: { name: 'pk', value: environmentResourceTypeToKey.envTypeConfig },
      sortKey: 'sk',
      begins: { S: `${environmentResourceTypeToKey.envType}#${envTypeId}` },
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };
    queryParams = addPaginationToken(paginationToken, queryParams);
    const envTypeConfigsResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const token = getPaginationToken(envTypeConfigsResponse);
    return {
      data: envTypeConfigsResponse.Items as unknown as EnvironmentTypeConfig[],
      paginationToken: token
    };
  }

  /**
   * Create environment type config object in DDB
   * @param ownerId - the user requesting the operation
   * @param envTypeId - the environment type identifier for this config
   * @param params - the environment type config object attribute key value pairs
   *
   * @returns environment type config object
   */
  public async createNewEnvironmentTypeConfig(
    ownerId: string,
    envTypeId: string,
    params: {
      allowRoleIds: string[];
      type: string;
      description: string;
      name: string;
      params: { key: string; value: string }[];
    }
  ): Promise<EnvironmentTypeConfig> {
    // To create envTypeConfig, we must ensure the parent envType exist
    let productId = '';
    let provisioningArtifactId = '';
    try {
      const envType = await this._envTypeService.getEnvironmentType(envTypeId);
      productId = envType.productId;
      provisioningArtifactId = envType.provisioningArtifactId;
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.badRequest(
          `Could not create environment type config because environment type ${envTypeId} does not exist`
        );
      }
    }
    const envTypeConfigId = uuidv4();
    const currentDate = new Date().toISOString();

    const newEnvTypeConfig: EnvironmentTypeConfig = {
      id: envTypeConfigId,
      ...this._buildEnvTypeConfigPkSk(envTypeId, envTypeConfigId),
      productId,
      provisioningArtifactId,
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: ownerId,
      updatedBy: ownerId,
      resourceType: this._resourceType,
      ...params,
      owner: ownerId
    };

    const item = newEnvTypeConfig as unknown as { [key: string]: unknown };
    const response = await this._aws.helpers.ddb
      .update(this._buildEnvTypeConfigPkSk(envTypeId, envTypeConfigId), { item })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentTypeConfig;
    }
    console.error('Unable to create environment type', newEnvTypeConfig);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(params)}`);
  }

  /**
   * Update environment type config object in DDB
   * @param ownerId - the user requesting the update
   * @param envTypeId - the environment type identifier
   * @param envTypeConfigId - the environment type config identifier
   * @param updatedValues - the attribute values to update for the given environment type config
   *
   * @returns environment type config object with updated attributes
   */
  public async updateEnvironmentTypeConfig(
    ownerId: string,
    envTypeId: string,
    envTypeConfigId: string,
    updatedValues: { [key: string]: string }
  ): Promise<EnvironmentTypeConfig> {
    const attributesAllowedToUpdate = ['description', 'name'];
    const attributesNotAllowed = Object.keys(updatedValues).filter((key) => {
      return !attributesAllowedToUpdate.includes(key);
    });
    if (attributesNotAllowed.length > 0) {
      throw Boom.badRequest(`We do not support updating these attributes ${attributesNotAllowed}`);
    }
    try {
      await this.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(
          `Could not find envType ${envTypeId} with envTypeConfig ${envTypeConfigId} to update`
        );
      }
      throw e;
    }

    const currentDate = new Date().toISOString();
    const updatedEnvTypeConfig = {
      ...updatedValues,
      createdAt: currentDate,
      updatedAt: currentDate,
      updatedBy: ownerId
    };

    const response = await this._aws.helpers.ddb
      .update(this._buildEnvTypeConfigPkSk(envTypeId, envTypeConfigId), { item: updatedEnvTypeConfig })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentTypeConfig;
    }
    console.error('Unable to update environment type config', updatedEnvTypeConfig);
    throw Boom.internal(
      `Unable to update environment type config with params: ${JSON.stringify(updatedValues)}`
    );
  }

  private _buildEnvTypeConfigPkSk(envTypeId: string, envTypeConfigId: string): { pk: string; sk: string } {
    return {
      pk: environmentResourceTypeToKey.envTypeConfig,
      sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
    };
  }
}
