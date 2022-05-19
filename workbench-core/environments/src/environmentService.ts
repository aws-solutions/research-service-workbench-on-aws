/* eslint-disable security/detect-object-injection */

import { AwsService } from '@amzn/workbench-core-base';
import { EnvironmentStatus } from './environmentStatus';
import { v4 as uuidv4 } from 'uuid';
import Boom from '@hapi/boom';
import envKeyNameToKey from './environmentKeyNameToKey';
import { BatchGetItemCommandOutput } from '@aws-sdk/client-dynamodb';

interface Environment {
  id: string | undefined;
  instance: string | undefined;
  cidr: string;
  description: string;
  error: { type: string; value: string } | undefined;
  name: string;
  outputs: { id: string; value: string; description: string }[];
  projectId: string;
  status: string;
  datasetIds: string[];
  envTypeConfigId: string;
  updatedAt: string;
  createdAt: string;
  owner: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  PROJ?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  DS?: any;
}
const defaultEnv: Environment = {
  id: '',
  instance: '',
  cidr: '',
  description: '',
  error: undefined,
  name: '',
  outputs: [],
  projectId: '',
  status: '',
  datasetIds: [],
  envTypeConfigId: '',
  updatedAt: '',
  createdAt: '',
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
        .query({ key: { name: 'pk', value: this._buildKey(envId, envKeyNameToKey.environment) } })
        .execute();
      if (data.Count === 0) {
        throw Boom.notFound(`Could not find environment ${envId}`);
      }
      const items = data.Items!.map((item) => {
        return item;
      });
      let envWithMetadata: Environment = { ...defaultEnv };
      for (const item of items) {
        // parent environment item
        if ((item.sk as unknown) === this._buildKey(envId, envKeyNameToKey.environment)) {
          envWithMetadata = { ...envWithMetadata, ...item };
        } else {
          // metadata of environment item
          // @ts-ignore
          envWithMetadata[item.sk.split('#')[0]] = item;
        }
      }
      return envWithMetadata;
    } else {
      const data = await this._aws.helpers.ddb
        .get(this._buildPkSk(envId, envKeyNameToKey.environment))
        .execute();
      // TODO: Figure out how to check type of get between 'GetItemCommandOutput' and 'BatchGetItemCommandOutput'
      // data should be of type GetItemCommandOutput--check it is and Item exists
      if ('Item' in data && data.Item) {
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
    paginationToken?: number
  ): Promise<Environment[]> {
    let environments: Environment[] = [];
    let data;

    if (user.role === 'admin') {
      if (filter && filter.status) {
        // if admin and status is selected in the filter, use GSI getResourceByStatus
        const queryParams = {
          index: 'getResourceByStatus',
          key: { name: 'resourceType', value: 'environment' },
          sortKey: 'status',
          eq: { S: filter.status }
        };
        data = await this._aws.helpers.ddb.query(queryParams).execute();
      } else {
        // if admin, use GSI getResourceByUpdatedAt
        const queryParams = {
          index: 'getResourceByUpdatedAt',
          key: { name: 'resourceType', value: 'environment' }
        };
        data = await this._aws.helpers.ddb.query(queryParams).execute();
      }
    } else {
      const queryParams = {
        index: 'getResourceByOwner',
        key: { name: 'resourceType', value: { S: 'environment' } },
        sortKey: 'owner',
        eq: { S: user.ownerId }
      };
      data = await this._aws.helpers.ddb.query(queryParams).execute();
    }

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
    return environments;
  }

  public async updateEnvironment(
    envId: string,
    updatedValues: { [key: string]: string }
  ): Promise<Environment> {
    try {
      await this.getEnvironment(envId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment ${envId} to update`);
      }
      throw e;
    }

    const updateResponse = await this._aws.helpers.ddb
      .update(this._buildPkSk(envId, envKeyNameToKey.environment), { item: updatedValues })
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
    instance?: string;
    cidr: string;
    description: string;
    error?: { type: string; value: string };
    name: string;
    outputs: { id: string; value: string; description: string }[];
    projectId: string;
    datasetIds: string[];
    envTypeId: string;
    envTypeConfigId: string;
    status: EnvironmentStatus;
  }): Promise<Environment> {
    const itemsToGet = [
      {
        pk: envKeyNameToKey.envTypeConfig,
        sk: `${envKeyNameToKey.envType}#${params.envTypeId}${envKeyNameToKey.envTypeConfig}#${params.envTypeConfigId}`
      },
      this._buildPkSk(params.projectId, envKeyNameToKey.project),
      ...params.datasetIds.map((dsId) => {
        return this._buildPkSk(dsId, envKeyNameToKey.dataset);
      })
    ];
    const batchGetResult = (await this._aws.helpers.ddb
      .get(itemsToGet)
      .execute()) as BatchGetItemCommandOutput;
    const newEnv: Environment = {
      id: uuidv4(),
      instance: params.instance,
      cidr: params.cidr,
      description: params.description,
      error: params.error,
      name: params.name,
      outputs: params.outputs,
      projectId: params.projectId,
      datasetIds: params.datasetIds,
      envTypeConfigId: params.envTypeConfigId,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      owner: 'owner-1', // TODO: Get this from request context
      status: params.status
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
      ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.envTypeConfig, newEnv.envTypeConfigId),
      id: newEnv.envTypeConfigId,
      productId: envTypeConfig.productId,
      provisioningArtifactId: envTypeConfig.provisioningArtifactId,
      params: envTypeConfig.params
    });

    //add project
    const project = metadata.find((item) => {
      return item.resourceType === 'project';
    });
    items.push({
      ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.project, newEnv.projectId),
      id: newEnv.projectId,
      name: project.name,
      envMgmtRoleArn: project.envMgmtRoleArn,
      accountHandlerRoleArn: project.accountHandlerRoleArn,
      encryptionKeyArn: project.encryptionKeyArn,
      vpcId: project.vpcId,
      subnetId: project.subnetId,
      externalId: project.externalId,
      hostingAccountEventBusArn: project.hostingAccountEventBusArn,
      environmentInstanceFiles: project.environmentInstanceFiles,
      awsAccountId: project.awsAccountId
    });

    //add dataset
    const datasets = metadata.filter((item) => {
      return item.resourceType === 'dataset';
    });
    datasets.forEach((dataset) => {
      items.push({
        ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.dataset, dataset.id),
        id: dataset.id,
        name: dataset.name,
        resources: dataset.resources
      });
    });

    // Add environment item
    items.push({
      ...newEnv,
      pk: this._buildKey(newEnv.id!, envKeyNameToKey.environment),
      sk: this._buildKey(newEnv.id!, envKeyNameToKey.environment),
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
}
