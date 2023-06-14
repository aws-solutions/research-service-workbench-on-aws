/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */

import { AuthenticatedUser } from '@aws/workbench-core-authorization';
import {
  QueryParams,
  resourceTypeToKey,
  uuidWithLowercasePrefix,
  buildConcatenatedSk,
  buildDynamoDBPkSk,
  buildDynamoDbKey,
  DEFAULT_API_PAGE_SIZE,
  addPaginationToken,
  DynamoDBService,
  JSONValue,
  validateSingleSortAndFilter,
  getSortQueryParams,
  getFilterQueryParams,
  PaginatedResponse
} from '@aws/workbench-core-base';
import { BatchGetItemCommandOutput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import * as Boom from '@hapi/boom';
import _ from 'lodash';
import { EnvironmentStatus } from '../constants/environmentStatus';
import {
  DatasetDependencyParser,
  EndpointsDependecyParser,
  Environment,
  EnvironmentParser
} from '../models/environments/environment';
import { EnvironmentItem, EnvironmentItemParser } from '../models/environments/environmentItem';
import { ListEnvironmentsByProjectRequest } from '../models/environments/listEnvironmentsByProjectRequest';
import { ListEnvironmentsServiceRequest } from '../models/environments/listEnvironmentsServiceRequest';

const defaultEnv: Environment = {
  id: '',
  instanceId: '',
  cidr: '',
  description: '',
  name: '',
  projectId: '',
  status: 'PENDING',
  envTypeConfigId: '',
  updatedAt: '',
  createdAt: '',
  provisionedProductId: '',
  owner: ''
};

export class EnvironmentService {
  private _dynamoDBService: DynamoDBService;
  private _resourceType: string = 'environment';

  public constructor(dynamoDBService: DynamoDBService) {
    this._dynamoDBService = dynamoDBService;
  }

  /**
   * Get environment
   * @param envId - Env Id of env to retrieve
   * @param includeMetadata - If true we get all entries where pk = envId, instead of just the entry where pk = envId and sk = envId
   */
  public async getEnvironment(envId: string, includeMetadata: boolean = false): Promise<Environment> {
    if (!includeMetadata) {
      const data = (await this._dynamoDBService
        .get(buildDynamoDBPkSk(envId, resourceTypeToKey.environment))
        .execute()) as GetItemCommandOutput;
      if (!data.Item) {
        throw Boom.notFound(`Could not find environment`);
      }

      return this._mapDDBItemToEnvironment(data.Item!);
    }

    const data = await this._dynamoDBService
      .query({ key: { name: 'pk', value: buildDynamoDbKey(envId, resourceTypeToKey.environment) } })
      .execute();
    if (data.Count === 0) {
      throw Boom.notFound(`Could not find environment`);
    }
    const items = data.Items!.map((item) => {
      return item;
    });
    let envWithMetadata: Environment = { ...defaultEnv };
    envWithMetadata.DATASETS = [];
    envWithMetadata.ENDPOINTS = [];
    for (const item of items) {
      // parent environment item
      const sk = item.sk as unknown as string;
      if (sk === buildDynamoDbKey(envId, resourceTypeToKey.environment)) {
        envWithMetadata = { ...envWithMetadata, ...item };
      } else {
        const envKey = sk.split('#')[0];
        if (envKey === 'DATASET') {
          envWithMetadata.DATASETS!.push(DatasetDependencyParser.parse(item));
        } else if (envKey === 'ENDPOINT') {
          envWithMetadata.ENDPOINTS!.push(EndpointsDependecyParser.parse(item));
        } else {
          // metadata of environment item
          // @ts-ignore
          envWithMetadata[sk.split('#')[0]] = item;
        }
      }
    }
    return this._mapDDBItemToEnvironment(envWithMetadata);
  }

  /**
   * List all environments with options for filtering, pagination, and sort
   * @param filter - Provide which attribute to filter by
   * @param pageSize - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   * @param sort - Provide which attribute to sort by. True for ascending sort; False for descending sort
   */
  public async listEnvironments(
    request: ListEnvironmentsServiceRequest
  ): Promise<PaginatedResponse<EnvironmentItem>> {
    const { filter, pageSize, paginationToken, sort } = request;
    validateSingleSortAndFilter(filter, sort);
    const gsiNames = [
      'getResourceByName',
      'getResourceByStatus',
      'getResourceByCreatedAt',
      'getResourceByDependency',
      'getResourceByOwner',
      'getResourceByType',
      'getResourceByStatus'
    ];
    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType },
      index: 'getResourceByCreatedAt',
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };
    const filterQuery = getFilterQueryParams(filter, gsiNames);
    const sortQuery = getSortQueryParams(sort, gsiNames);
    queryParams = { ...queryParams, ...filterQuery, ...sortQuery };

    queryParams = addPaginationToken(paginationToken, queryParams);
    const environments = await this._dynamoDBService.getPaginatedItems(queryParams);
    return {
      data: environments.data.map((item) => this._mapDDBItemToEnvironmentItem(item)),
      paginationToken: environments.paginationToken
    };
  }

  /**
   * List all environments filtered by projectId with pagination, and sort
   * @param projectId - Filtering project for environments.
   * @param pageSize - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   * @param sort - Sorting type for request, asc or desc
   */
  public async listEnvironmentsByProject(
    request: ListEnvironmentsByProjectRequest
  ): Promise<PaginatedResponse<EnvironmentItem>> {
    const { projectId, pageSize, paginationToken, sort } = request;
    return this.listEnvironments({
      filter: { dependency: { eq: projectId } },
      sort: { dependency: sort },
      pageSize,
      paginationToken
    });
  }

  /**
   * Update environment object in DDB
   * @param envId - the identifier of the environment to update
   * @param updatedValues - the attribute values to update for the given environment
   *
   * @returns environment object with updated attributes
   */
  public async updateEnvironment(
    envId: string,
    updatedValues: {
      [key: string]:
        | string
        | { type: string; value: string }
        | { id: string; value: string; description: string }[];
    }
  ): Promise<Environment> {
    try {
      await this.getEnvironment(envId).then((env) => {
        if (env.status === 'TERMINATED') {
          throw Boom.badRequest(`Cannot update terminated environment`);
        }
      });
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        console.log('message', e.message);
        throw Boom.notFound(`Could not find environment to update`);
      }
      throw e;
    }

    const updateResponse = await this._dynamoDBService.updateExecuteAndFormat({
      key: buildDynamoDBPkSk(envId, resourceTypeToKey.environment),
      params: { item: updatedValues }
    });

    return this._mapDDBItemToEnvironment(updateResponse.Attributes!);
  }

  /**
   * Create new environment
   * @param params - the attribute values to create a given environment
   * @param user - the user requesting this operation
   *
   * @returns environment object from DDB
   */
  public async createEnvironment(
    params: {
      instanceId?: string;
      cidr: string;
      description: string;
      error?: { type: string; value: string };
      name: string;
      outputs: { id: string; value: string; description: string }[];
      projectId: string;
      datasetIds: string[];
      envTypeId: string;
      envTypeConfigId: string;
      status?: EnvironmentStatus;
    },
    user: AuthenticatedUser
  ): Promise<Environment> {
    const environmentTypeConfigSK = `${resourceTypeToKey.envType}#${params.envTypeId}${resourceTypeToKey.envTypeConfig}#${params.envTypeConfigId}`;
    const datasetIds = params.datasetIds;
    if (!_.isArray(datasetIds)) {
      throw Boom.badRequest('DatasetIds passed in as parameter must be an array.');
    }
    const itemsToGet = [
      // ETC
      {
        pk: `${resourceTypeToKey.envTypeConfig}#${params.envTypeConfigId}`,
        sk: `${resourceTypeToKey.envTypeConfig}#${params.envTypeConfigId}`
      },
      // PROJ
      buildDynamoDBPkSk(params.projectId, resourceTypeToKey.project),
      // DATASETS
      ..._.map(datasetIds, (dsId) => {
        return buildDynamoDBPkSk(dsId, resourceTypeToKey.dataset);
      })
    ];
    const batchGetResult = (await this._dynamoDBService
      .get(itemsToGet)
      .execute()) as BatchGetItemCommandOutput;

    const createdAt = new Date(Date.now()).toISOString();
    const newEnv = {
      id: uuidWithLowercasePrefix(resourceTypeToKey.environment),
      instanceId: params.instanceId,
      cidr: params.cidr,
      description: params.description,
      error: params.error,
      provisionedProductId: '', // Updated later by StatusHandler
      name: params.name,
      outputs: params.outputs,
      projectId: params.projectId,
      envTypeConfigId: params.envTypeConfigId,
      updatedAt: createdAt,
      updatedBy: user.id,
      createdAt: createdAt,
      createdBy: user.id,
      owner: user.id,
      status: params.status || 'PENDING',
      type: environmentTypeConfigSK,
      dependency: params.projectId
    };
    // GET metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    interface MetaData {
      id: string;
      pk: string;
      sk: string;
      resourceType: string;
      [key: string]: string;
    }
    let metadata: MetaData[] = [];
    metadata = batchGetResult.Responses![this._dynamoDBService.getTableName()].map((item) => {
      return item as unknown as MetaData;
    });

    // Check all expected metadata exist
    const envTypeConfig = metadata.find((item) => {
      return item.resourceType === 'envTypeConfig';
    });
    // ETC
    if (envTypeConfig === undefined) {
      throw Boom.badRequest(`Requested envTypeId with requested envTypeConfigId does not exist`);
    }
    // PROJ
    const project = metadata.find((item) => {
      return item.resourceType === 'project';
    });
    if (project === undefined) {
      throw Boom.badRequest(`projectId does not exist`);
    }
    // DATASET
    const datasets = metadata.filter((item) => {
      return item.resourceType === 'dataset';
    });
    const validDatasetIds = datasets.map((dataset) => {
      return dataset.id;
    });
    const dsIdsNotFound = params.datasetIds.filter((id) => {
      return !validDatasetIds.includes(id);
    });
    if (dsIdsNotFound.length > 0) {
      throw Boom.badRequest(`datasetIds do not exist`);
    }

    // WRITE metadata to DDB
    const items: Record<string, JSONValue>[] = [];
    const buildEnvPkMetadataSk = (
      envId: string,
      metaDataType: string,
      metaDataId: string
    ): { pk: string; sk: string } => {
      const sk = `${metaDataType}#${metaDataId}`;
      const pk = `ENV#${envId}`;
      return { pk, sk };
    };

    items.push({
      ...buildEnvPkMetadataSk(newEnv.id!, resourceTypeToKey.envTypeConfig, newEnv.envTypeConfigId),
      id: newEnv.envTypeConfigId,
      productId: envTypeConfig.productId,
      provisioningArtifactId: envTypeConfig.provisioningArtifactId,
      type: envTypeConfig.type,
      params: envTypeConfig.params
    });

    items.push({
      ...buildEnvPkMetadataSk(newEnv.id!, resourceTypeToKey.project, newEnv.projectId),
      id: newEnv.projectId,
      name: project.name,
      envMgmtRoleArn: project.envMgmtRoleArn,
      hostingAccountHandlerRoleArn: project.hostingAccountHandlerRoleArn,
      encryptionKeyArn: project.encryptionKeyArn,
      vpcId: project.vpcId,
      subnetId: project.subnetId,
      externalId: project.externalId,
      environmentInstanceFiles: project.environmentInstanceFiles,
      awsAccountId: project.awsAccountId
    });

    datasets.forEach((dataset) => {
      items.push({
        ...buildEnvPkMetadataSk(newEnv.id!, resourceTypeToKey.dataset, dataset.id),
        id: dataset.id,
        name: dataset.name,
        resources: dataset.resources,
        createdAt: createdAt,
        updatedAt: createdAt
      });

      items.push({
        pk: buildDynamoDbKey(dataset.id, resourceTypeToKey.dataset),
        sk: buildDynamoDbKey(newEnv.id!, resourceTypeToKey.environment),
        id: newEnv.id!,
        projectId: project.id,
        createdAt: createdAt,
        updatedAt: createdAt
      });
    });

    // Add environment item
    items.push({
      ...newEnv,
      pk: buildDynamoDbKey(newEnv.id!, resourceTypeToKey.environment),
      sk: buildDynamoDbKey(newEnv.id!, resourceTypeToKey.environment),
      resourceType: 'environment'
    } as Record<string, JSONValue>);

    try {
      await this._dynamoDBService.commitTransaction({
        addPutItems: items
      });
    } catch (e) {
      console.error('Failed to create environment', e);
      throw Boom.internal('Failed to create environment');
    }

    //If no error are thrown then transaction was successful. If error did occur then the whole transaction will be rolled back
    return this.getEnvironment(newEnv.id!, true);
  }

  /*
   * Store information to DDB
   * There are multiple access patterns for environment-related resources, so keeping this method rather flexible
   */
  public async addMetadata(
    pkId: string,
    pkType: string,
    metaId: string,
    metaType: string,
    data: { [key: string]: string }
  ): Promise<void> {
    const key = { pk: buildDynamoDbKey(pkId, pkType), sk: buildDynamoDbKey(metaId, metaType) };

    await this._dynamoDBService.updateExecuteAndFormat({ key, params: { item: data } });
  }

  /**
   * Store metadata in DDB relating the environment's project with the dataset and endpoint that gets mounted on the env
   * @param projectId - Environment's projectId
   * @param datasetId - Dataset that is mounted on the Environment
   * @param endpointId - Endpoint for the Dataset that was mounted on the Environment
   */
  public async storeProjectDatasetEndpointRelationship(
    projectId: string,
    datasetId: string,
    endpointId: string
  ): Promise<void> {
    const key = {
      pk: buildDynamoDbKey(projectId, resourceTypeToKey.project),
      sk: buildConcatenatedSk([
        buildDynamoDbKey(datasetId, resourceTypeToKey.dataset),
        buildDynamoDbKey(endpointId, resourceTypeToKey.endpoint)
      ])
    };

    await this._dynamoDBService.updateExecuteAndFormat({ key, params: { item: {} } });
  }

  /**
   * Deletes metadata in DDB that relates environment's project with the dataset and endpoint that gets mounted on the env
   * @param projectId - Environment's projectId
   * @param datasetId - Dataset that is mounted on the Environment
   * @param endpointId - Endpoint for the Dataset that was mounted on the Environment
   */
  public async removeProjectDatasetEndpointRelationship(
    projectId: string,
    datasetId: string,
    endpointId: string
  ): Promise<void> {
    const key = {
      pk: buildDynamoDbKey(projectId, resourceTypeToKey.project),
      sk: buildConcatenatedSk([
        buildDynamoDbKey(datasetId, resourceTypeToKey.dataset),
        buildDynamoDbKey(endpointId, resourceTypeToKey.endpoint)
      ])
    };
    await this._dynamoDBService.deleteItem({ key });
  }

  /**
   * Checks if there are dependencies with active environments.
   * Pass the dependency id to see if there are any
   * active environments linked to that resource.
   * @param dependency - dependency id to check if there are any environments linked to
   * @returns true if the dependency has active environments, false otherwise
   *
   * @example Use this method to check if project proj-123 has any active environments
   * ```ts
   * const doesProjectHaveEnvironment = await environmentService.doesDependencyHaveEnvironments(projectId);
   * ```
   */
  public async doesDependencyHaveEnvironments(dependency: string): Promise<boolean> {
    const queryParams: QueryParams = {
      index: 'getResourceByDependency',
      key: { name: 'resourceType', value: 'environment' },
      sortKey: 'dependency',
      eq: { S: dependency },
      limit: 1
    };

    const response = await this._dynamoDBService.getPaginatedItems(queryParams);

    return response.data.length > 0;
  }

  /**
   * This method formats a DDB item containing environment data as a EnvironmentItem object
   *
   * @param item - the DDB item to conver to a EnvironmentItem object
   * @returns a EnvironmentItem object containing only environment data from DDB attributes
   */
  private _mapDDBItemToEnvironmentItem(item: Record<string, unknown>): EnvironmentItem {
    const environment: Record<string, unknown> = { ...item, projectId: item.dependency };

    // parse will remove pk and sk from the DDB item
    return EnvironmentItemParser.parse(environment);
  }

  /**
   * This method formats a DDB item containing environment data as a Environment object
   *
   * @param item - the DDB item to conver to a Environment object
   * @returns a Environment object containing only environment data from DDB attributes
   */
  private _mapDDBItemToEnvironment(item: Record<string, unknown>): Environment {
    const environment: Record<string, unknown> = { ...item, projectId: item.dependency };

    // parse will remove pk and sk from the DDB item
    return EnvironmentParser.parse(environment);
  }
}
