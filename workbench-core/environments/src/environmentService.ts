/* eslint-disable security/detect-object-injection */

import { AttributeValue, BatchWriteItemCommandOutput, GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
const { unmarshall, marshall } = require('@aws-sdk/util-dynamodb');
import { AwsService } from '@amzn/workbench-core-base';
import EnvironmentStatus from './environmentStatus';
import { v4 as uuidv4 } from 'uuid';

interface Environment {
  id: string | undefined;
  instance: string | undefined;
  accountId: string;
  cidr: string;
  description: string;
  error: { type: string; value: string } | undefined;
  name: string;
  outputs: { id: string; value: string; description: string }[];
  projectId: string;
  status: string;
  studyIds: string[];
  envType: string;
  envTypeId: string;
  envTypeConfigId: string;
  indexId: string;
  updatedAt: string;
  createdAt: string;
  owner: string;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ACC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  EGS?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ET?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  ETC?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  IND?: any;
  //eslint-disable-next-line @typescript-eslint/no-explicit-any
  PROJ?: any;
}
const defaultEnv: Environment = {
  id: '',
  instance: '',
  accountId: '',
  cidr: '',
  description: '',
  error: undefined,
  name: '',
  outputs: [],
  projectId: '',
  status: '',
  studyIds: [],
  envType: '',
  envTypeId: '',
  envTypeConfigId: '',
  indexId: '',
  updatedAt: '',
  createdAt: '',
  owner: ''
};

const envKeyToAbrevMapping: { [key: string]: string } = {
  envId: 'ENV',
  user: 'USR',
  envTypeConfigId: 'ETCI',
  instanceId: 'INID',
  projectId: 'PROJ',
  studyIds: 'STU',
  envTypeId: 'ETI',
  indexId: 'IND',
  account: 'ACC'
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
    const envAttKey = this._buildEnvAttKey(envId);
    const envKey = this._buildEnvKey(envId);
    if (includeMetadata) {
      const data = await this._aws.helpers.ddb.query({ key: { name: 'pk', value: envAttKey } }).execute();
      const items = data.Items!.map((item) => {
        return unmarshall(item);
      });
      let envWithMetadata: Environment = { ...defaultEnv };
      for (const item of items) {
        if (item.sk === envKey) {
          envWithMetadata = { ...envWithMetadata, ...item };
        } else {
          // @ts-ignore
          envWithMetadata[item.sk.split('#')[0]] = item;
        }
      }
      return envWithMetadata;
    } else {
      const data = await this._aws.helpers.ddb.get({ pk: envAttKey, sk: envAttKey }).execute();
      // TODO: Figure out how to check type of get between 'GetItemCommandOutput' and 'BatchGetItemCommandOutput'
      // data should be of type GetItemCommandOutput--check it is and Item exists
      if ('Item' in data && data.Item) {
        const getItemOutput: GetItemCommandOutput = data;
        return this._getEnvironmentDataFromEnvironmentItem(getItemOutput.Item!);
      } else {
        throw new Error(`Did not get an item returned when trying to get env ${envId}`);
      }
    }
  }

  private _buildEnvAttKey(envId: string): AttributeValue {
    return { S: this._buildEnvKey(envId) };
  }

  private _buildEnvKey(envId: string): string {
    return `ENV#${envId}`;
  }

  private _parseOutputs(
    attributeList: AttributeValue[]
  ): { id: string; value: string; description: string }[] {
    const outputList: { id: string; value: string; description: string }[] = [];
    attributeList.forEach((attribute) => {
      if (attribute.M) {
        outputList.push({
          id: attribute.M.id.S ? attribute.M.id.S : '',
          value: attribute.M.value.S ? attribute.M.value.S : '',
          description: attribute.M.description.S ? attribute.M.description.S : ''
        });
      }
    });
    return outputList;
  }

  // TODO: Refactor this method after marshall/unmarshall has been added
  private _getEnvironmentDataFromEnvironmentItem(item: { [key: string]: AttributeValue }): Environment {
    const env: Environment = {
      id: item.id.S,
      accountId: item.accountId.S ? item.accountId.S : '',
      instance: item.instance ? item.instance.S : undefined,
      cidr: item.cidr.S ? item.cidr.S : '',
      description: item.description.S ? item.description.S : '',
      error: undefined, // TODO: Get error value from DDB and parse it
      name: item.name.S ? item.name.S : 'Unknown name',
      outputs: item.outputs.L ? this._parseOutputs(item.outputs.L) : [],
      projectId: item.projectId.S ? item.projectId.S : 'Unknown project',
      status: item.status.S ? item.status.S : 'Unknown status',
      studyIds: item.studyIds.L
        ? item.studyIds.L.map((attributeV: AttributeValue) => (attributeV.S ? attributeV.S : ''))
        : [],
      envType: item.envType.S ? item.envType.S : 'Unknown Env Type',
      envTypeId: item.envTypeId.S ? item.envTypeId.S : 'Unknown Env Type Id',
      envTypeConfigId: item.envTypeConfigId.S ? item.envTypeConfigId.S : 'Unknown Env Type Config',
      indexId: item.indexId.S ? item.indexId.S : 'Unknown Index',
      updatedAt: item.updatedAt.S ? item.updatedAt.S : 'Unknown Update Date',
      createdAt: item.createdAt.S ? item.createdAt.S : 'Unknown',
      owner: item.owner.S ? item.owner.S : 'Unknown'
    };
    return env;
  }

  // TODO: Implement limit and paginationToken will be used for next task
  /**
   * Get all environments with option to filter by status
   * @param user - User information
   * @param filter
   * @param limit
   * @param paginationToken
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
        return this._getEnvironmentDataFromEnvironmentItem(item);
      });

      // Always sort by UpdatedAt values for environments. Newest environment appear first
      environments = environments.sort((envA, envB) => {
        return new Date(envB.updatedAt).getTime() - new Date(envA.updatedAt).getTime();
      });
    }
    return environments;
  }

  //   public async getEnvironmentAndMetadataPrimaryKeys(envId: string): Promise<QueryCommandOutput> {
  //     // const data = await this._ddbQuery.query.key('pk', {S: envId}).projection(['pk', 'sk']).query();
  //     const data = await this._ddbHelperService
  //       .query()
  //       .key('pk', { S: envId })
  //       .projection(['pk', 'sk'])
  //       .query();
  //     return data;
  //   }

  //   public async updateEnvironment(
  //     envId: string,
  //     updatedValues: { [key: string]: AttributeValue }
  //   ): Promise<UpdateItemCommandOutput> {
  //     // this._ddbUpdater = new DynamoDBUpdaterService({region: this._awsRegion, table: this._tableName, key: {'pk': {S: envId}, 'sk': {S: envId}}});
  //     // const data = await this._ddbUpdater.updater.item({'mutable': 'second value'}).update();
  //     const data = this._ddbHelperService
  //       .update({ pk: { S: envId }, sk: { S: envId } })
  //       .item(updatedValues)
  //       .update();
  //     return data;
  //   }

  public async createEnv(params: {
    instance: string;
    cidr: string;
    description: string;
    error: { type: string; value: string } | undefined;
    name: string;
    outputs: { id: string; value: string; description: string }[];
    projectId: string;
    studyIds: string[];
    envType: string;
    envTypeId: string;
    envTypeConfigId: string;
    indexId: string;
    accountId: string;
    status: EnvironmentStatus;
  }): Promise<BatchWriteItemCommandOutput> {
    // }): Promise<void> {
    // create items (some of these values will likely need to be passed in by the createEnvironment method)
    const newEnv: Environment = {
      id: uuidv4(),
      instance: params.instance,
      accountId: params.accountId,
      cidr: params.cidr,
      description: params.description,
      error: params.error,
      name: params.name,
      outputs: params.outputs,
      projectId: params.projectId,
      studyIds: params.studyIds,
      envType: params.envType,
      envTypeId: params.envTypeId,
      envTypeConfigId: params.envTypeConfigId,
      indexId: params.indexId,
      updatedAt: new Date().toISOString(),
      createdAt: new Date().toISOString(),
      owner: 'owner-1', // TODO: Get this from request context
      status: params.status
    };
    // GET metadata
    const buildPkSk = (id: string, type: string): { [key: string]: AttributeValue } => {
      const key = `${type}#${id}`;
      return marshall({ pk: key, sk: key });
    };
    const itemsToGet = [
      buildPkSk(params.accountId, 'ACC'),
      marshall({ pk: 'ETC', sk: `ET#${params.envTypeId}ETC#${params.envTypeConfigId}` }),
      buildPkSk(params.projectId, 'PROJ'),
      buildPkSk(params.indexId, 'IND'),
      buildPkSk(params.envTypeId, 'ET'),
      ...params.studyIds.map((studyId) => {
        return buildPkSk(studyId, 'STUDY');
      })
    ];
    const batchGetResult = await this._aws.helpers.ddb.get(itemsToGet).execute();

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
    const buildEnvPkMetadataSk = (envId: string, metaDataType: string, metaDataId: string) => {
      const sk = `${metaDataType}#${metaDataId}`;
      const pk = `ENV#${envId}`;
      return { pk, sk };
    };

    //add account metadata
    const account = metadata.find((item) => {
      return item.resourceType === 'account';
    });
    items.push(
      marshall({
        ...buildEnvPkMetadataSk(newEnv.id!, 'ACC', newEnv.accountId),
        accountHandlerRoleArn: account.accountHandlerRoleArn,
        envMgmtRoleArn: account.envMgmtRoleArn,
        externalId: account.externalId
      })
    );

    // TODO: Add envTypeConfig, proj, index, envType, and study metadata

    // items.push(
    //   marshall(
    //     { ...newEnv, pk: this._buildEnvKey(newEnv.envId!), sk: this._buildEnvKey(newEnv.envId!) },
    //     { removeUndefinedValues: true }
    //   )
    // );
    return await this._aws.helpers.ddb.batchEdit({ addWriteRequests: items }).execute();
  }

  public async getInstanceId(envId: string): Promise<string> {
    const instanceRecord = await this._aws.helpers.ddb
      .query({ key: { name: 'pk', value: { S: `ENV${envId}` } }, sortKey: 'sk', begins: { S: 'INID#' } })
      .execute();
    if (instanceRecord.Items) {
      if (instanceRecord.Items.length > 1) {
        throw new Error(`Returned too many instance IDs for envID ${envId}`);
      } else {
        return instanceRecord.Items[0].sk.S
          ? instanceRecord.Items[0].sk.S.split('#')[1]
          : 'Unknown Instance Id';
      }
    }
    throw new Error(`No record found for ${envId}`);
  }
}

//   public async updateEnvironment(
//     envId: string,
//     updatedValues: { [key: string]: AttributeValue }
//   ): Promise<UpdateItemCommandOutput> {
//     // this._ddbUpdater = new DynamoDBUpdaterService({region: this._awsRegion, table: this._tableName, key: {'pk': {S: envId}, 'sk': {S: envId}}});
//     // const data = await this._ddbUpdater.updater.item({'mutable': 'second value'}).update();
//     const data = this._ddbHelperService
//       .update({ pk: { S: envId }, sk: { S: envId } })
//       .item(updatedValues)
//       .update();
//     return data;
//   }
