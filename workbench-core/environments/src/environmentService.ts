/* eslint-disable security/detect-object-injection */

import { AttributeValue, GetItemCommandOutput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
import { AwsService } from '@amzn/workbench-core-base';
import { EnvironmentStatus } from './environmentStatus';
import { v4 as uuidv4 } from 'uuid';

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

const envKeyNameToKey: { [key: string]: string } = {
  environment: 'ENV',
  project: 'PROJ',
  envType: 'ET',
  envTypeConfig: 'ETC',
  dataset: 'DS'
};

interface QueryParams {
  index?: string;
  key?: { name: string; value: AttributeValue };
  sortKey?: string;
  eq?: AttributeValue;
  lt?: AttributeValue;
  lte?: AttributeValue;
  gt?: AttributeValue;
  gte?: AttributeValue;
  between?: { value1: AttributeValue; value2: AttributeValue };
  begins?: AttributeValue;
  start?: { [key: string]: AttributeValue };
  filter?: string;
  strong?: boolean;
  names?: { [key: string]: string };
  values?: { [key: string]: AttributeValue };
  projection?: string | string[];
  select?: 'ALL_ATTRIBUTES' | 'ALL_PROJECTED_ATTRIBUTES' | 'SPECIFIC_ATTRIBUTES' | 'COUNT';
  limit?: number;
  forward?: boolean;
  capacity?: 'INDEXES' | 'TOTAL' | 'NONE';
}

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
        .query({ key: { name: 'pk', value: marshall(this._buildKey(envId, envKeyNameToKey.environment)) } })
        .execute();
      if (data.Count === 0) {
        // TODO: Refactor to use NotFound error or hapi/boom
        throw new Error(`Environment ${envId} not found`);
      }
      const items = data.Items!.map((item) => {
        return unmarshall(item);
      });
      let envWithMetadata: Environment = { ...defaultEnv };
      for (const item of items) {
        // parent environment item
        if (item.sk === this._buildKey(envId, envKeyNameToKey.environment)) {
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
        const getItemOutput: GetItemCommandOutput = data;
        return unmarshall(getItemOutput.Item!);
      } else {
        throw new Error(`Did not get an item returned when trying to get env ${envId}`);
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
        const queryParams: QueryParams = {
          index: 'getResourceByStatus',
          key: { name: 'resourceType', value: { S: 'environment' } },
          sortKey: 'status',
          eq: { S: filter.status }
        };
        data = await this._aws.helpers.ddb.query(queryParams).execute();
      } else {
        // if admin, use GSI getResourceByUpdatedAt--for now, use filter. TODO: use requestContext.
        const queryParams: QueryParams = {
          index: 'getResourceByUpdatedAt',
          key: { name: 'resourceType', value: { S: 'environment' } }
        };
        data = await this._aws.helpers.ddb.query(queryParams).execute();
      }
    } else {
      const queryParams: QueryParams = {
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
        return unmarshall(item);
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
  ): Promise<UpdateItemCommandOutput> {
    return this._aws.helpers.ddb
      .update(this._buildPkSk(envId, envKeyNameToKey.environment), { item: marshall(updatedValues) })
      .execute();
  }

  private _buildPkSk(id: string, type: string): { [key: string]: AttributeValue } {
    const key = this._buildKey(id, type);
    return marshall({ pk: key, sk: key });
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
    // TODO: Add envIdToInstanceId service
    const itemsToGet = [
      marshall({
        pk: envKeyNameToKey.envTypeConfig,
        sk: `${envKeyNameToKey.envType}#${params.envTypeId}${envKeyNameToKey.envTypeConfig}#${params.envTypeConfigId}`
      }),
      this._buildPkSk(params.projectId, envKeyNameToKey.project),
      ...params.datasetIds.map((dsId) => {
        return this._buildPkSk(dsId, envKeyNameToKey.dataset);
      })
    ];
    const batchGetResult = await this._aws.helpers.ddb.get(itemsToGet).execute();
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
    let metadata = [];
    if ('Responses' in batchGetResult) {
      if (batchGetResult.Responses![this._tableName].length !== itemsToGet.length) {
        throw new Error('Unable to get metadata for all keys defined in environment');
      }
      metadata = batchGetResult.Responses![this._tableName].map((item) => {
        return unmarshall(item);
      });
    }
    // WRITE metadata to DDB
    const items: { [key: string]: AttributeValue }[] = [];
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
    items.push(
      marshall({
        ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.envTypeConfig, newEnv.envTypeConfigId),
        id: newEnv.envTypeConfigId,
        productId: envTypeConfig.productId,
        provisioningArtifactId: envTypeConfig.provisioningArtifactId,
        params: envTypeConfig.params
      })
    );

    //add project
    const project = metadata.find((item) => {
      return item.resourceType === 'project';
    });
    items.push(
      marshall({
        ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.project, newEnv.projectId),
        id: newEnv.projectId,
        name: project.name,
        envMgmtRoleArn: project.envMgmtRoleArn,
        accountHandlerRoleArn: project.accountHandlerRoleArn,
        encryptionKeyArn: project.encryptionKeyArn,
        vpcId: project.vpcId,
        subnetId: project.subnetId,
        externalId: project.externalId
      })
    );

    //add dataset
    const datasets = metadata.filter((item) => {
      return item.resourceType === 'dataset';
    });
    datasets.forEach((dataset) => {
      items.push(
        marshall({
          ...buildEnvPkMetadataSk(newEnv.id!, envKeyNameToKey.dataset, dataset.id),
          id: dataset.id,
          name: dataset.name,
          resources: dataset.resources
        })
      );
    });

    // Add environment item
    items.push(
      marshall(
        {
          ...newEnv,
          pk: this._buildKey(newEnv.id!, envKeyNameToKey.environment),
          sk: this._buildKey(newEnv.id!, envKeyNameToKey.environment),
          resourceType: 'environment'
        },
        { removeUndefinedValues: true }
      )
    );

    try {
      await this._aws.helpers.ddb.transactEdit({ addPutRequest: items }).execute();
    } catch (e) {
      console.log(`Failed to create environment. DDB Transact Items attribute: ${JSON.stringify(items)}`, e);
      throw new Error('Failed to create environment');
    }

    //If no error are thrown then transaction was successful. If error did occur then the whole transaction will be rolled back
    return this.getEnvironment(newEnv.id!, true);
  }
}
