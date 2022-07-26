/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable security/detect-object-injection */

import { AuthenticatedUser } from '@amzn/workbench-core-authorization';
import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { BatchGetItemCommandOutput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import _ = require('lodash');
import { v4 as uuidv4 } from 'uuid';
import envResourceTypeToKey from '../constants/environmentResourceTypeToKey';
import { EnvironmentStatus } from '../constants/environmentStatus';
import { DEFAULT_API_PAGE_SIZE, addPaginationToken, getPaginationToken } from '../utilities/paginationHelper';

export interface Environment {
  id: string | undefined;
  instanceId: string | undefined;
  cidr: string;
  description: string;
  error: { type: string; value: string } | undefined;
  name: string;
  outputs: { id: string; value: string; description: string }[];
  projectId: string;
  status: EnvironmentStatus;
  datasetIds: string[];
  provisionedProductId: string;
  envTypeConfigId: string;
  updatedAt: string;
  updatedBy: string;
  createdAt: string;
  createdBy: string;
  owner: string;
  type: string;
  dependency: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  PROJ?: any;
  // TODO: Replace any[] with <type>[]
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  DATASETS?: any[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ENDPOINTS?: any[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  INID?: any;
}

const defaultEnv: Environment = {
  id: '',
  instanceId: '',
  cidr: '',
  description: '',
  error: undefined,
  name: '',
  outputs: [],
  projectId: '',
  status: 'PENDING',
  datasetIds: [],
  envTypeConfigId: '',
  updatedAt: '',
  updatedBy: '',
  createdAt: '',
  createdBy: '',
  provisionedProductId: '',
  owner: '',
  type: '',
  dependency: ''
};

export class EnvironmentService {
  private _aws: AwsService;
  private _tableName: string;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  /**
   * Get environment
   * @param envId - Env Id of env to retrieve
   * @param includeMetadata - If true we get all entries where pk = envId, instead of just the entry where pk = envId and sk = envId
   */
  public async getEnvironment(envId: string, includeMetadata: boolean = false): Promise<Environment> {
    if (includeMetadata) {
      const data = await this._aws.helpers.ddb
        .query({ key: { name: 'pk', value: this._buildKey(envId, envResourceTypeToKey.environment) } })
        .execute();
      if (data.Count === 0) {
        throw Boom.notFound(`Could not find environment ${envId}`);
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
        if (sk === this._buildKey(envId, envResourceTypeToKey.environment)) {
          envWithMetadata = { ...envWithMetadata, ...item };
        } else {
          const envKey = sk.split('#')[0];
          if (envKey === 'DATASET') {
            envWithMetadata.DATASETS!.push(item);
          } else if (envKey === 'ENDPOINT') {
            envWithMetadata.ENDPOINTS!.push(item);
          } else {
            // metadata of environment item
            // @ts-ignore
            envWithMetadata[sk.split('#')[0]] = item;
          }
        }
      }
      return envWithMetadata;
    } else {
      const data = (await this._aws.helpers.ddb
        .get(this._buildPkSk(envId, envResourceTypeToKey.environment))
        .execute()) as GetItemCommandOutput;
      if (data.Item) {
        return data.Item! as unknown as Environment;
      } else {
        throw Boom.notFound(`Could not find environment ${envId}`);
      }
    }
  }

  /**
   * List all environments with options for filtering, pagination, and sort
   * @param user - User information
   * @param filter - Provide which attribute to filter by
   * @param pageSize - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   * @param sort - Provide which attribute to sort by. True for ascending sort; False for descending sort
   */
  public async listEnvironments(
    user: AuthenticatedUser,
    filter?: {
      status?: EnvironmentStatus;
      name?: string;
      createdAtFrom?: string;
      createdAtTo?: string;
      project?: string;
      owner?: string;
      type?: string;
    },
    pageSize?: number,
    paginationToken?: string,
    sort?: {
      status?: boolean;
      name?: boolean;
      createdAt?: boolean;
      project?: boolean;
      owner?: boolean;
      type?: boolean;
    }
  ): Promise<{ data: Environment[]; paginationToken: string | undefined }> {
    // Check that filter and sort are not both defined
    if (filter && sort) {
      throw Boom.badRequest('Cannot apply a filter and sort at the same time');
    }
    const filterAttributesLength = filter ? Object.keys(filter).length : 0;
    // Check that at most one filter is defined because we not support more than one filter
    if (
      filterAttributesLength > 1 &&
      !(filterAttributesLength === 2 && filter?.createdAtFrom && filter?.createdAtTo)
    ) {
      //catch case for range
      throw Boom.badRequest('Cannot apply more than one filter.');
    }

    // Check that at most one sort attribute is defined because we not support sorting by more than one attribute
    if (sort && Object.keys(sort).length > 1) {
      throw Boom.badRequest('Cannot sort by more than one attribute.');
    }

    let environments: Environment[] = [];

    let queryParams: QueryParams = {
      key: { name: 'resourceType', value: 'environment' },
      limit: pageSize && pageSize >= 0 ? pageSize : DEFAULT_API_PAGE_SIZE
    };

    if (user.roles.includes('Admin')) {
      if (filter) {
        if (filter.status) {
          // if admin and status is selected in the filter, use GSI getResourceByStatus
          const addFilter = this._setFilter('getResourceByStatus', 'status', filter.status);
          queryParams = { ...queryParams, ...addFilter };
        } else if (filter.name) {
          // if admin and name is selected in the filter, use GSI getResourceByName
          const addFilter = this._setFilter('getResourceByName', 'name', filter.name);
          queryParams = { ...queryParams, ...addFilter };
        } else if (filter.createdAtFrom && filter.createdAtTo) {
          // if admin and createdAt is selected in the filter, use GSI getResourceByCreatedAt
          const addFilter = this._setRangeFilter(
            'getResourceByCreatedAt',
            'createdAt',
            filter.createdAtFrom,
            filter.createdAtTo
          );
          queryParams = { ...queryParams, ...addFilter };
        } else if (filter.project) {
          // if admin and project is selected in the filter, use GSI getResourceByProject
          const addFilter = this._setFilter('getResourceByDependency', 'dependency', filter.project);
          queryParams = { ...queryParams, ...addFilter };
        } else if (filter.owner) {
          // if admin and owner is selected in the filter, use GSI getResourceByOwner
          const addFilter = this._setFilter('getResourceByOwner', 'owner', filter.owner);
          queryParams = { ...queryParams, ...addFilter };
        } else if (filter.type) {
          // if admin and type is selected in the filter, use GSI getResourceByType
          const addFilter = this._setFilter('getResourceByType', 'type', filter.type);
          queryParams = { ...queryParams, ...addFilter };
        }
      } else if (sort) {
        if (sort.status !== undefined) {
          // if admin and status is selected in the sort param, use GSI getResourceByStatus
          const addSort = this._setSort('getResourceByStatus', 'status', sort.status);
          queryParams = { ...queryParams, ...addSort };
        } else if (sort.name !== undefined) {
          // if admin and name is selected in the sort param, use GSI getResourceByName
          const addSort = this._setSort('getResourceByName', 'name', sort.name);
          queryParams = { ...queryParams, ...addSort };
        } else if (sort.createdAt !== undefined) {
          // if admin and createdAt is selected in the sort param, use GSI getResourceByCreatedAt
          const addSort = this._setSort('getResourceByCreatedAt', 'createdAt', sort.createdAt);
          queryParams = { ...queryParams, ...addSort };
        } else if (sort.project !== undefined) {
          // if admin and project is selected in the sort param, use GSI getResourceByProject
          const addSort = this._setSort('getResourceByDependency', 'dependency', sort.project);
          queryParams = { ...queryParams, ...addSort };
        } else if (sort.owner !== undefined) {
          // if admin and owner is selected in the sort param, use GSI getResourceByOwner
          const addSort = this._setSort('getResourceByOwner', 'owner', sort.owner);
          queryParams = { ...queryParams, ...addSort };
        } else if (sort.type !== undefined) {
          // if admin and type is selected in the sort param, use GSI getResourceByType
          const addSort = this._setSort('getResourceByType', 'type', sort.type);
          queryParams = { ...queryParams, ...addSort };
        }
      } else {
        // if admin, use GSI getResourceByCreatedAt by default
        queryParams.index = 'getResourceByCreatedAt';
      }
    } else {
      // if nonadmin, use GSI getResourceByOwner
      const addFilter = this._setFilter('getResourceByOwner', 'owner', user.id);
      queryParams = { ...queryParams, ...addFilter };
    }

    queryParams = addPaginationToken(paginationToken, queryParams);

    try {
      const data = await this._aws.helpers.ddb.query(queryParams).execute();

      // check that Items is defined
      if (data && data.Items) {
        environments = data.Items.map((item) => {
          return item as unknown as Environment;
        });

        // Always sort by CreatedAt values for environments if not sorting by other attribute. Newest environment appear first
        if (!sort) {
          environments = environments.sort((envA, envB) => {
            return new Date(envB.createdAt).getTime() - new Date(envA.createdAt).getTime();
          });
        }
      }
      const token = getPaginationToken(data);
      return { data: environments, paginationToken: token };
    } catch (error) {
      throw Boom.badRequest(error);
    }
  }

  private _setFilter(gsi: string, sortKey: string, eq: string): QueryParams {
    const queryParams: QueryParams = {
      index: gsi,
      sortKey: sortKey,
      eq: { S: eq }
    };
    return queryParams;
  }

  private _setRangeFilter(gsi: string, sortKey: string, from: string, to: string): QueryParams {
    const queryParams: QueryParams = {
      index: gsi,
      sortKey: sortKey,
      between: { value1: { S: from }, value2: { S: to } }
    };
    return queryParams;
  }

  private _setSort(gsi: string, sortKey: string, forward: boolean): QueryParams {
    const queryParams: QueryParams = {
      index: gsi,
      sortKey: sortKey,
      forward: forward
    };
    return queryParams;
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
      await this.getEnvironment(envId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        console.log('message', e.message);
        throw Boom.notFound(`Could not find environment ${envId} to update`);
      }
      throw e;
    }

    const updateResponse = await this._aws.helpers.ddb
      .update(this._buildPkSk(envId, envResourceTypeToKey.environment), { item: updatedValues })
      .execute();

    return updateResponse.Attributes! as unknown as Environment;
  }

  private _buildPkSk(id: string, type: string): { [key: string]: string } {
    const key = this._buildKey(id, type);
    return { pk: key, sk: key };
  }

  private _buildKey(id: string, type: string): string {
    return `${type}#${id}`;
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
    const itemsToGet = [
      // ETC
      {
        pk: envResourceTypeToKey.envTypeConfig,
        sk: `${envResourceTypeToKey.envType}#${params.envTypeId}${envResourceTypeToKey.envTypeConfig}#${params.envTypeConfigId}`
      },
      // PROJ
      this._buildPkSk(params.projectId, envResourceTypeToKey.project),
      // DATASETS
      ..._.map(params.datasetIds, (dsId) => {
        return this._buildPkSk(dsId, envResourceTypeToKey.dataset);
      })
    ];
    const batchGetResult = (await this._aws.helpers.ddb
      .get(itemsToGet)
      .execute()) as BatchGetItemCommandOutput;
    const newEnv: Environment = {
      id: uuidv4(),
      instanceId: params.instanceId,
      cidr: params.cidr,
      description: params.description,
      error: params.error,
      provisionedProductId: '', // Updated later by StatusHandler
      name: params.name,
      outputs: params.outputs,
      projectId: params.projectId,
      datasetIds: params.datasetIds,
      envTypeConfigId: params.envTypeConfigId,
      updatedAt: new Date().toISOString(),
      updatedBy: user.id,
      createdAt: new Date().toISOString(),
      createdBy: user.id,
      owner: user.id,
      status: params.status || 'PENDING',
      type: params.envTypeId,
      dependency: params.projectId
    };
    // GET metadata
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let metadata: any[] = [];
    if (batchGetResult.Responses![this._tableName].length !== itemsToGet.length) {
      throw new Error('Unable to get metadata for all keys defined in environment');
    }
    metadata = batchGetResult.Responses![this._tableName].map((item) => {
      return item;
    });

    // WRITE metadata to DDB
    const items: { [key: string]: unknown }[] = [];
    const buildEnvPkMetadataSk = (
      envId: string,
      metaDataType: string,
      metaDataId: string
    ): { pk: string; sk: string } => {
      const sk = `${metaDataType}#${metaDataId}`;
      const pk = `ENV#${envId}`;
      return { pk, sk };
    };

    //add envTypeConfig
    const envTypeConfig = metadata.find((item) => {
      return item.resourceType === 'envTypeConfig';
    });
    items.push({
      ...buildEnvPkMetadataSk(newEnv.id!, envResourceTypeToKey.envTypeConfig, newEnv.envTypeConfigId),
      id: newEnv.envTypeConfigId,
      productId: envTypeConfig.productId,
      provisioningArtifactId: envTypeConfig.provisioningArtifactId,
      type: envTypeConfig.type,
      params: envTypeConfig.params
    });

    //add project
    const project = metadata.find((item) => {
      return item.resourceType === 'project';
    });
    items.push({
      ...buildEnvPkMetadataSk(newEnv.id!, envResourceTypeToKey.project, newEnv.projectId),
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

    //add dataset
    const datasets = metadata.filter((item) => {
      return item.resourceType === 'dataset';
    });
    datasets.forEach((dataset) => {
      items.push({
        ...buildEnvPkMetadataSk(newEnv.id!, envResourceTypeToKey.dataset, dataset.id),
        id: dataset.id,
        name: dataset.name,
        resources: dataset.resources
      });
    });

    // Add environment item
    items.push({
      ...newEnv,
      pk: this._buildKey(newEnv.id!, envResourceTypeToKey.environment),
      sk: this._buildKey(newEnv.id!, envResourceTypeToKey.environment),
      resourceType: 'environment'
    });

    try {
      await this._aws.helpers.ddb
        .transactEdit({
          addPutRequest: items
        })
        .execute();
    } catch (e) {
      console.log(`Failed to create environment. DDB Transact Items attribute: ${JSON.stringify(items)}`, e);
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
    const key = { pk: this._buildKey(pkId, pkType), sk: this._buildKey(metaId, metaType) };

    await this._aws.helpers.ddb.update(key, { item: data }).execute();
  }
}
