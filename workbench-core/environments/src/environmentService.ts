/* eslint-disable security/detect-object-injection */

import { AwsService } from '@amzn/workbench-core-base';
import { BatchGetItemCommandOutput, GetItemCommandOutput, AttributeValue } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import envResourceTypeToKey from './environmentResourceTypeToKey';
import { EnvironmentStatus } from './environmentStatus';

interface Environment {
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
  createdAt: string;
  owner: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  PROJ?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  DS?: any[];
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  INID?: any;
}

interface QueryParams {
  index?: string;
  key?: { name: string; value: unknown };
  sortKey?: string;
  eq?: AttributeValue;
  lt?: AttributeValue;
  lte?: AttributeValue;
  gt?: AttributeValue;
  gte?: AttributeValue;
  between?: { value1: AttributeValue; value2: AttributeValue };
  begins?: AttributeValue;
  start?: { [key: string]: unknown };
  filter?: string;
  strong?: boolean;
  names?: { [key: string]: string };
  values?: { [key: string]: unknown };
  projection?: string | string[];
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
  limit?: number;
  forward?: boolean;
  capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
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
  createdAt: '',
  provisionedProductId: '',
  owner: ''
};

export default class EnvironmentService {
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
      envWithMetadata.DS = [];
      for (const item of items) {
        // parent environment item
        const sk = item.sk as unknown as string;
        if (sk === this._buildKey(envId, envResourceTypeToKey.environment)) {
          envWithMetadata = { ...envWithMetadata, ...item };
        } else {
          const envKey = sk.split('#')[0];
          if (envKey === 'DS') {
            envWithMetadata.DS!.push(item);
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

  // TODO: Implement limit and paginationToken will be used for next task
  /**
   * Get all environments with option to filter by status
   * @param user - User information
   * @param filter - Provide which attribute to filter by
   * @param limit - Number of results per page
   * @param paginationToken - Token used for getting specific page of results
   */
  public async getEnvironments(
    user: { role: string; ownerId: string },
    filter?: { status?: EnvironmentStatus },
    limit?: number,
    paginationToken?: string
  ): Promise<{ envs: Environment[]; token: string | undefined }> {
    let environments: Environment[] = [];

    const queryParams: QueryParams = {
      key: { name: 'resourceType', value: 'environment' }
    };

    if (user.role === 'admin') {
      if (filter && filter.status) {
        // if admin and status is selected in the filter, use GSI getResourceByStatus
        queryParams.index = 'getResourceByStatus';
        queryParams.sortKey = 'status';
        queryParams.eq = { S: filter.status };
      } else {
        // if admin, use GSI getResourceByUpdatedAt
        queryParams.index = 'getResourceByUpdatedAt';
      }
    } else {
      queryParams.index = 'getResourceByOwner';
      queryParams.sortKey = 'owner';
      queryParams.eq = { S: user.ownerId };
    }

    // If limit is defined and non zero, add param
    if (limit && limit > 0) {
      queryParams.limit = limit;
    }
    // If paginationToken is defined, add param
    // from: https://notes.serverlessfirst.com/public/How+to+paginate+lists+returned+from+DynamoDB+through+an+API+endpoint#Implementing+this+in+code
    if (paginationToken) {
      try {
        queryParams.start = JSON.parse(Buffer.from(paginationToken, 'base64').toString('utf8'));
      } catch (error) {
        throw new Error('Invalid paginationToken');
      }
    }

    const data = await this._aws.helpers.ddb.query(queryParams).execute();

    // check that Items is defined
    if (data && data.Items) {
      environments = data.Items.map((item) => {
        return item as unknown as Environment;
      });

      // Always sort by UpdatedAt values for environments. Newest environment appear first
      environments = environments.sort((envA, envB) => {
        return new Date(envB.updatedAt).getTime() - new Date(envA.updatedAt).getTime();
      });
    }
    const token = data.LastEvaluatedKey
      ? Buffer.from(JSON.stringify(data.LastEvaluatedKey)).toString('base64')
      : undefined;
    return { envs: environments, token };
  }

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

  public async createEnvironment(params: {
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
  }): Promise<Environment> {
    const itemsToGet = [
      // ETC
      {
        pk: envResourceTypeToKey.envTypeConfig,
        sk: `${envResourceTypeToKey.envType}#${params.envTypeId}${envResourceTypeToKey.envTypeConfig}#${params.envTypeConfigId}`
      },
      // PROJ
      this._buildPkSk(params.projectId, envResourceTypeToKey.project),
      // DS
      ...params.datasetIds.map((dsId) => {
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
      createdAt: new Date().toISOString(),
      owner: 'owner-1', // TODO: Get this from request context
      status: params.status || 'PENDING'
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
