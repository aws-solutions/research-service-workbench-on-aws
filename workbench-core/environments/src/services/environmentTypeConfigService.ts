/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  QueryParams,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  addPaginationToken,
  DEFAULT_API_PAGE_SIZE
} from '@aws/workbench-core-base';
import DynamoDBService from '@aws/workbench-core-base/lib/aws/helpers/dynamoDB/dynamoDBService';
import Boom from '@hapi/boom';
import { CreateEnvironmentTypeConfigRequest } from '../models/environmentTypeConfigs/createEnvironmentTypeConfigRequest';
import { DeleteEnvironmentTypeConfigRequest } from '../models/environmentTypeConfigs/deleteEnvironmentTypeConfigRequest';
import {
  EnvironmentTypeConfig,
  EnvironmentTypeConfigParser
} from '../models/environmentTypeConfigs/environmentTypeConfig';
import { ListEnvironmentTypeConfigsRequest } from '../models/environmentTypeConfigs/listEnvironmentTypeConfigsRequest';
import { UpdateEnvironmentTypeConfigRequest } from '../models/environmentTypeConfigs/updateEnvironmentTypeConfigsRequest';
import EnvironmentTypeService from './environmentTypeService';

export default class EnvironmentTypeConfigService {
  private _envTypeService: EnvironmentTypeService;
  private _resourceType: string = 'envTypeConfig';
  private _dynamoDbService: DynamoDBService;

  public constructor(envTypeService: EnvironmentTypeService, dynamoDbService: DynamoDBService) {
    this._envTypeService = envTypeService;
    this._dynamoDbService = dynamoDbService;
  }

  /**
   * Soft Environment Type Configuration
   * @param request - request for deleting environment type config
   * @param checkDependency - check whether we can delete the envTypeConfig. The function should throw a Boom error if envTypeConfig cannot be deleted
   * @returns void
   */
  public async softDeleteEnvironmentTypeConfig(
    request: DeleteEnvironmentTypeConfigRequest,
    checkDependency: (envTypeId: string, envTypeConfigId: string) => Promise<void>
  ): Promise<void> {
    const { envTypeId, envTypeConfigId } = request;
    await checkDependency(envTypeId, envTypeConfigId);
    await this.getEnvironmentTypeConfig(envTypeId, envTypeConfigId);

    try {
      await this._dynamoDbService.updateExecuteAndFormat({
        key: this._buildEnvTypeConfigPkSk(envTypeConfigId),
        params: {
          item: { resourceType: `${this._resourceType}_deleted` }
        }
      });
    } catch (e) {
      throw Boom.internal('Unable to delete Environment Type Config');
    }
  }
  /**
   * Get environment type config object from DDB for given envTypeId-envTypeConfigId combination
   * @param envTypeId - the environment type identifier
   * @param envTypeConfigId - the environment type config identifier
   *
   * @returns environment type config object
   */
  public async getEnvironmentTypeConfig(
    envTypeId: string,
    envTypeConfigId: string
  ): Promise<EnvironmentTypeConfig> {
    const item = await this._dynamoDbService.getItem(this._buildEnvTypeConfigPkSk(envTypeConfigId));
    if (item === undefined || (item.dependency as string) !== envTypeId) {
      throw Boom.notFound(`Could not find environment type config ${envTypeConfigId}`);
    } else {
      const envTypeConfig: EnvironmentTypeConfig = EnvironmentTypeConfigParser.parse(item);
      return Promise.resolve(envTypeConfig);
    }
  }

  /**
   * List environment type config objects from DDB
   * @param request - object containing environmentType, page size and pagination token for this configs
   *
   * @returns environment type config objects
   */
  public async listEnvironmentTypeConfigs(
    request: ListEnvironmentTypeConfigsRequest
  ): Promise<{ data: EnvironmentTypeConfig[]; paginationToken: string | undefined }> {
    const { envTypeId, pageSize, paginationToken } = request;
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByDependency',
      sortKey: 'dependency',
      eq: { S: envTypeId },
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };
    queryParams = addPaginationToken(paginationToken, queryParams);
    const envTypeConfigsResponse = await this._dynamoDbService.getPaginatedItems(queryParams);
    return {
      data: envTypeConfigsResponse.data.map((item) => {
        return EnvironmentTypeConfigParser.parse(item);
      }),
      paginationToken: envTypeConfigsResponse.paginationToken
    };
  }

  /**
   * Create environment type config object in DDB
   * @param request - object containing environmentTypeId and attributes to create environment type config
   *
   * @returns environment type config object
   */
  public async createNewEnvironmentTypeConfig(
    request: CreateEnvironmentTypeConfigRequest
  ): Promise<EnvironmentTypeConfig> {
    // To create envTypeConfig, we must ensure the parent envType exist
    let productId = '';
    let provisioningArtifactId = '';
    try {
      const envType = await this._envTypeService.getEnvironmentType(request.envTypeId);
      productId = envType.productId;
      provisioningArtifactId = envType.provisioningArtifactId;
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.badRequest(
          `Could not create environment type config because environment type ${request.envTypeId} does not exist`
        );
      }
    }
    const envTypeConfigId = uuidWithLowercasePrefix(resourceTypeToKey.envTypeConfig);
    const currentDate = new Date().toISOString();

    const newEnvTypeConfig: EnvironmentTypeConfig = EnvironmentTypeConfigParser.parse({
      id: envTypeConfigId,
      createdAt: currentDate,
      updatedAt: currentDate,
      ...request
    });
    const dynamoItem: Record<string, unknown> = {
      ...newEnvTypeConfig,
      resourceType: this._resourceType,
      dependency: request.envTypeId,
      productId,
      provisioningArtifactId
    };
    const key = this._buildEnvTypeConfigPkSk(envTypeConfigId);
    const response = await this._dynamoDbService.updateExecuteAndFormat({
      key,
      params: { item: dynamoItem }
    });
    if (response.Attributes) {
      return EnvironmentTypeConfigParser.parse({ ...response.Attributes });
    }
    console.error('Unable to create environment type', newEnvTypeConfig);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(request)}`);
  }

  /**
   * Update environment type config object in DDB
   * @param request - object containing environmentTypeId and params to update
   *
   * @returns environment type config object with updated attributes
   */
  public async updateEnvironmentTypeConfig(
    request: UpdateEnvironmentTypeConfigRequest
  ): Promise<EnvironmentTypeConfig> {
    const { envTypeId, envTypeConfigId } = request;
    const updateETConfig = {
      description: request.description,
      estimatedCost: request.estimatedCost
    };
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
      ...updateETConfig,
      updatedAt: currentDate
    };

    const response = await this._dynamoDbService.updateExecuteAndFormat({
      key: this._buildEnvTypeConfigPkSk(envTypeConfigId),
      params: { item: updatedEnvTypeConfig }
    });
    if (response.Attributes) {
      return EnvironmentTypeConfigParser.parse(response.Attributes);
    }
    console.error('Unable to update environment type config', updatedEnvTypeConfig);
    throw Boom.internal(`Unable to update environment type config with params: ${JSON.stringify(request)}`);
  }

  private _buildEnvTypeConfigPkSk(envTypeConfigId: string): { pk: string; sk: string } {
    return {
      pk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`,
      sk: `${resourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
    };
  }
}
