/* eslint-disable security/detect-object-injection */
// import { AwsService, DynamoDBService } from '@amzn/workbench-core-base';
// import {
//   QueryCommandOutput,
//   ScanCommandOutput,
//   GetItemCommandOutput,
//   BatchGetItemCommandOutput,
//   AttributeValue,
//   UpdateItemCommandOutput,
//   DeleteItemCommandOutput,
//   BatchWriteItemCommandOutput
// } from '@aws-sdk/client-dynamodb';
import { AttributeValue, BatchWriteItemCommandOutput } from '@aws-sdk/client-dynamodb';
import { AwsService } from '@amzn/workbench-core-base';

// import AccountsService from './accountsService';

import _ from 'lodash';

interface Environment {
  envId: string | undefined;
  instanceId: string | undefined;
  cidr: string;
  description: string;
  error: string;
  name: string;
  outputs: { id: string; value: string; description: string }[];
  projectId: string;
  rev: number;
  status: string;
  studyIds: string[];
  envType: string;
  envTypeId: string;
  envTypeConfigId: string;
  indexId: string;
  updatedAt: string;
}

const envKeyToAbrevMapping: { [key: string]: string } = {
  envId: 'ENV',
  user: 'USR',
  envTypeConfigId: 'ETCI',
  instanceId: 'INID',
  projectId: 'PROJ',
  studyIds: 'STU',
  envTypeId: 'ETI',
  indexId: 'IND'
};

const statusMapping: string[] = [
  'PENDING',
  'COMPLETED',
  'STARTING',
  'STARTED',
  'STOPPING',
  'STOPPED',
  'TERMINATING',
  'TERMINATED'
];

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
  private _awsRegion: string;
  private _tableName: string;

  public constructor(constants: { AWS_REGION: string; TABLE_NAME: string }) {
    const { AWS_REGION, TABLE_NAME } = constants;
    this._awsRegion = AWS_REGION;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: AWS_REGION, ddbTableName: TABLE_NAME });
  }

  public async getEnvironment(envId: string): Promise<Environment> {
    const envKey = this._createEnvKey(envId);
    // const data = await this._ddbHelperService.get({ pk: envKey, sk: envKey }).get();
    const data = await this._aws.helpers.ddb.get({ pk: envKey, sk: envKey }).execute();
    console.log(data);

    // data should be of type GetItemCommandOutput--check it is and Item exists
    if ('Item' in data && data.Item) {
      // convert to Environment type
      const item = data.Item;
      const env: Environment = this._getEnvironmentDataFromEnvironmentItem(item);
      console.log(env);
      return env;
    } else {
      throw new Error(`Did not get an item returned when trying to get env ${envId}`);
    }
  }

  private _createEnvKey(envId: string): AttributeValue {
    return { S: `ENV#${envId}` };
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

  private _getEnvironmentDataFromEnvironmentItem(item: { [key: string]: AttributeValue }): Environment {
    const env: Environment = {
      envId: item.id.S,
      instanceId: item.instanceId ? item.instanceId.S : undefined,
      cidr: item.cidr.S ? item.cidr.S : '',
      description: item.description.S ? item.description.S : '',
      error: item.error.S ? item.error.S : '',
      name: item.name.S ? item.name.S : 'Unknown name',
      outputs: item.outputs.L ? this._parseOutputs(item.outputs.L) : [],
      projectId: item.projectId.S ? item.projectId.S : 'Unknown project',
      rev: item.rev.N ? +item.rev.N : NaN,
      status: item.status.S ? item.status.S : 'Unknown status',
      studyIds: item.studyIds.L
        ? item.studyIds.L.map((attributeV: AttributeValue) => (attributeV.S ? attributeV.S : ''))
        : [],
      envType: item.envType.S ? item.envType.S : 'Unknown Env Type',
      envTypeId: item.envTypeId.S ? item.envTypeId.S : 'Unknown Env Type Id',
      envTypeConfigId: item.envTypeConfigId.S ? item.envTypeConfigId.S : 'Unknown Env Type Config',
      indexId: item.indexId.S ? item.indexId.S : 'Unknown Index',
      updatedAt: item.updatedAt.S ? item.updatedAt.S : 'Unknown Update Date'
    };
    return env;
  }

  // TODO: limit and paginationToken will be used for next task
  // TODO: create list of supported fitlers with Tim
  public async getEnvironments(
    filter: { status?: string; userRole: string },
    limit?: number,
    paginationToken?: number
  ): Promise<Environment[]> {
    let environments: Environment[] = [];
    let usedUpdatedAtToQuery: boolean = false;
    let data;

    if (filter.status && filter.userRole === 'admin') {
      // if admin and status is selected in the filter, use GSI getResourceByStatus
      const queryParams: QueryParams = {
        index: 'getResourceByStatus',
        key: { name: 'resourceType', value: { S: 'environment' } },
        sortKey: 'status',
        eq: { N: `${statusMapping.indexOf(filter.status)}` }
      };
      data = await this._aws.helpers.ddb.query(queryParams).execute();
    } else if (filter.userRole === 'admin') {
      // if admin, use GSI getResourceByUpdatedAt--for now, use filter. TODO: use requestContext.
      const queryParams: QueryParams = {
        index: 'getResourceByUpdatedAt',
        key: { name: 'resourceType', value: { S: 'environment' } }
      };
      data = await this._aws.helpers.ddb.query(queryParams).execute();
      usedUpdatedAtToQuery = true;
    } else {
      // if non admin, use GSI getResourceByOwner and pass the owner (current user/permissions/group) TODO: use requestContext
      const queryParams: QueryParams = {
        index: 'getResourceByOwner',
        key: { name: 'resourceType', value: { S: 'environment' } },
        sortKey: 'owner',
        eq: { S: 'INSERTOWNERIDHERE' }
      };
      data = await this._aws.helpers.ddb.query(queryParams).execute();
    }

    // check that Items is defined
    if (data && data.Items) {
      data.Items.forEach((item) => {
        environments.push(this._getEnvironmentDataFromEnvironmentItem(item));
      });

      // if the query was not on getResourceByUpdatedAt, sort by UpdatedAt values of environments
      if (!usedUpdatedAtToQuery) {
        environments = _.sortBy(environments, [
          function (env: Environment) {
            return env.updatedAt;
          }
        ]);
      }
    }
    return environments;
  }

  //   public async getMultipleEnvironments(
  //     envIds: { [key: string]: AttributeValue }[]
  //   ): Promise<GetItemCommandOutput | BatchGetItemCommandOutput> {
  //     const keys: { [key: string]: AttributeValue }[] = envIds;
  //     // envIds.forEach(envId => {
  //     //     keys.push({'pk': {S: envId}, 'sk': {S: envId}});
  //     // })
  //     // this._ddbGetter = new DynamoDBGetterService({region: this._awsRegion, table: this._tableName, key: keys});
  //     // const data = await this._ddbGetter.getter.get();
  //     const data = await this._ddbHelperService.get(keys).get();
  //     // console.log(data);
  //     return data;
  //   }

  //   public async getEnvironmentAndMetadata(envId: string): Promise<QueryCommandOutput> {
  //     // const data = await this._ddbQuery.query.key('pk', {S: envId}).query();
  //     const data = await this._ddbHelperService.query().key('pk', { S: envId }).query();
  //     return data;
  //   }

  //   public async getEnvironmentAndMetadataPrimaryKeys(envId: string): Promise<QueryCommandOutput> {
  //     // const data = await this._ddbQuery.query.key('pk', {S: envId}).projection(['pk', 'sk']).query();
  //     const data = await this._ddbHelperService
  //       .query()
  //       .key('pk', { S: envId })
  //       .projection(['pk', 'sk'])
  //       .query();
  //     return data;
  //   }

  //   public async getEnvironments(): Promise<ScanCommandOutput> {
  //     // const data = await this._ddbScanner.scanner.scan();
  //     const data = await this._ddbHelperService.scan().scan();
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

  //   public async deleteEnvironment(envId: string): Promise<DeleteItemCommandOutput> {
  //     // this._ddbDeleter = new DynamoDBDeleterService({region: this._awsRegion, table: this._tableName, key: {'pk': {S: envId}, 'sk': {S: envId}}});
  //     // const data = await this._ddbDeleter.deleter.delete();
  //     const data = await this._ddbHelperService.delete({ pk: { S: envId }, sk: { S: envId } }).delete();
  //     return data;
  //   }

  //   public async deleteEnvironmentAndMetadata(envId: string): Promise<BatchWriteItemCommandOutput> {
  //     // get all items' primary keys in partition envId
  //     const envAndMetadata = await this.getEnvironmentAndMetadataPrimaryKeys(envId);
  //     // console.log(envAndMetadata);
  //     const envAndMetadataPrimaryKeys = envAndMetadata.Items;
  //     // console.log(envAndMetadataPrimaryKeys);
  //     // delete all items in partition envId
  //     if (!envAndMetadataPrimaryKeys || _.isEmpty(envAndMetadataPrimaryKeys)) {
  //       throw new Error('EnvironmentService<==no environment and metadata found');
  //     }
  //     console.log('before batchget');
  //     const getItems = await this._ddbHelperService.get(envAndMetadataPrimaryKeys).get();
  //     console.log(getItems);
  //     console.log('after batchget');
  //     const data = await this._ddbHelperService
  //       .batchEdit()
  //       .addDeleteRequests(envAndMetadataPrimaryKeys)
  //       .batchEdit();
  //     // const data = await this._ddbBatchWriteOrDeleter.batchWriteOrDelete.addDeleteRequests(envAndMetadataPrimaryKeys).batchWriteOrDelete();
  //     console.log(data);
  //     return data;
  //   }

  public async addEnvironmentAndMetadata(
    envId: string,
    desc: string,
    name: string,
    projectId: string,
    studyIds: string[],
    envType: string,
    envTypeId: string,
    envTypeConfigId: string,
    indexId: string,
    accountItem: { [key: string]: AttributeValue }
  ): Promise<BatchWriteItemCommandOutput> {
    // create items (some of these values will likely need to be passed in by the createEnvironment method)
    const newEnv: Environment = {
      envId: envId,
      instanceId: '',
      cidr: '',
      description: desc,
      error: '',
      name: name,
      outputs: [],
      projectId: projectId,
      rev: 0,
      status: 'PENDING',
      studyIds: studyIds,
      envType: envType,
      envTypeId: envTypeId,
      envTypeConfigId: envTypeConfigId,
      indexId: indexId,
      updatedAt: ''
    };
    const items: { [key: string]: AttributeValue }[] = [];
    // add account metadata (should not have all account attributes)
    items.push(accountItem);
    const accountId = accountItem.id;
    // add main environment item
    items.push(this._getEnvironmentItemFromEnvironmentData(newEnv));
    // add egress store metadata/entry
    const namespace = '';
    items.push({
      pk: { S: `ENV#${envId}` },
      sk: { S: `EGS#${envId}` },
      id: { S: envId },
      status: { S: 'CREATED' },
      egressStoreName: { S: `${name}-egress-store` },
      egressStoreObjectListLocation: { NULL: true },
      isAbleToSubmitEgressRequest: { BOOL: true },
      projectId: { S: projectId },
      rev: { N: '0' },
      roleArn: { S: 'TODO where does this come from?' },
      s3BucketName: { S: `$${accountId}-${namespace}-egress-store` },
      s3BucketPath: { S: `${envId}/` },
      workspaceId: { S: envId }
    });
    // add metadata stores in environment variable
    items.push(...this._environmentToMetadataItems(newEnv));
    console.log(items);
    // const data = await this._ddbBatchWriteOrDeleter.batchWriteOrDelete.addWriteRequests(items).batchWriteOrDelete();
    // const data = await this._ddbHelperService.batchEdit().addWriteRequests(items).batchEdit();
    const data = await this._aws.helpers.ddb.batchEdit({ addWriteRequests: items }).execute();
    // console.log(data);
    return data;
  }

  private _getEnvironmentItemFromEnvironmentData(env: Environment): { [key: string]: AttributeValue } {
    const item: { [key: string]: AttributeValue } = {};
    const envId = env.envId;
    Object.entries(env).forEach(([key, value]) => {
      console.log(`looking for ${key}`);
      if (key === 'envId') {
        key = 'id';
      }
      if (key === 'outputs') {
        // const map = value.forEach((object: {id: string, value: string, description: string}) => {
        //     return {id: {S: object.id}, value: {S: object.value}, description: {S: object.description}};
        // })
        if (_.isEmpty(value)) {
          item[key] = { L: [] };
        } else {
          item[key] = {
            L: value.forEach((object: { id: string; value: string; description: string }) => {
              return {
                M: {
                  id: { S: object.id },
                  value: { S: object.value },
                  description: { S: object.description }
                }
              };
            })
          };
        }
      } else if (typeof value === 'string') {
        item[key] = { S: value };
      } else if (typeof value === 'number') {
        item[key] = { N: `${value}` };
      } else if (Array.isArray(value)) {
        item[key] = { L: value };
      } else {
        console.log('did not add item for', key);
      }
    });
    item.pk = { S: `ENV#${envId}` };
    item.sk = { S: `ENV#${envId}` };
    item.resourceType = { S: 'environment' };
    return item;
  }

  //   // private _toAttributeValue(input: any): AttributeValue {
  //   //     if (typeof input === 'string') {
  //   //         return {S: input};
  //   //     }
  //   //     throw new Error('Did not identify type properly. Please try')
  //   // }

  private _environmentToMetadataItems(env: Environment): { [key: string]: AttributeValue }[] {
    // const keys = Object.keys(env);
    const items: { [key: string]: AttributeValue }[] = [];
    const envId = env.envId;
    // add metadata from the environment entity
    Object.entries(env).forEach(([key, value]) => {
      const prefix = envKeyToAbrevMapping[key];
      if (typeof value === 'string' && prefix && key !== 'envId') {
        const item = { someOtherValue: { S: 'value' }, id: { S: `${value}` } }; // TODO, replace this with the call to get the item from the table
        items.push({ pk: { S: `ENV#${envId}` }, sk: { S: `${prefix}#${value}` }, ...item });
      }
    });
    return items;
  }

  // public async createEnvironment(): Promise<BatchWriteItemCommandOutput> {
  //     // TODO generate ID
  //     const envId = '';
  //     return await this.addEnvironmentAndMetadata(envId, ...);
  // }

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

//   public async getEnvironment(envId: string): Promise<GetItemCommandOutput | BatchGetItemCommandOutput> {
//     const envKey = this._createEnvKey(envId);
//     const data = await this._ddbHelperService.get({ pk: envKey, sk: envKey }).get();
//     // data should be of type GetItemCommandOutput
//     if ('Item' in data && data.Item) {
//       // convert to Environment type
//       const item = data.Item;
//       console.log(item);
//       const env: Environment = {
//         envId: item.id.S,
//         instanceId: item.instanceId ? item.instanceId.S : undefined,
//         cidr: item.cidr.S ? item.cidr.S : '',
//         description: item.description.S ? item.description.S : '',
//         error: item.error.S ? item.error.S : '',
//         name: item.name.S ? item.name.S : 'Unknown name',
//         outputs: item.outputs.L ? this._parseOutputs(item.outputs.L) : [],
//         projectId: item.projectId.S ? item.projectId.S : 'Unknown project',
//         rev: item.rev.N ? +item.rev.N : NaN,
//         status: item.status.N ? statusMapping[+item.status.N] : 'Unknown status',
//         studyIds: item.studyIds.L
//           ? item.studyIds.L.map((attributeV: AttributeValue) => (attributeV.S ? attributeV.S : ''))
//           : [],
//         envType: item.envType.S ? item.envType.S : 'Unknown Env Type',
//         envTypeId: item.envTypeId.S ? item.envTypeId.S : 'Unknown Env Type Id',
//         envTypeConfigId: item.envTypeConfigId.S ? item.envTypeConfigId.S : 'Unknown Env Type Config',
//         indexId: item.indexId.S ? item.indexId.S : 'Unknown Index'
//       };
//     } else {
//       throw new Error(`Did not get an item returned when trying to get env ${envId}`);
//     }
//     // console.log(data);
//     return data;
//   }

//   private _createEnvKey(envId: string): AttributeValue {
//     return { S: `ENV#${envId}` };
//   }

//   private _parseOutputs(
//     attributeList: AttributeValue[]
//   ): { id: string; value: string; description: string }[] {
//     const outputList: { id: string; value: string; description: string }[] = [];
//     attributeList.forEach((attribute) => {
//       if (attribute.M) {
//         outputList.push({
//           id: attribute.M.id.S ? attribute.M.id.S : '',
//           value: attribute.M.value.S ? attribute.M.value.S : '',
//           description: attribute.M.description.S ? attribute.M.description.S : ''
//         });
//       }
//     });
//     return outputList;
//   }

//   public async getMultipleEnvironments(
//     envIds: { [key: string]: AttributeValue }[]
//   ): Promise<GetItemCommandOutput | BatchGetItemCommandOutput> {
//     const keys: { [key: string]: AttributeValue }[] = envIds;
//     // envIds.forEach(envId => {
//     //     keys.push({'pk': {S: envId}, 'sk': {S: envId}});
//     // })
//     // this._ddbGetter = new DynamoDBGetterService({region: this._awsRegion, table: this._tableName, key: keys});
//     // const data = await this._ddbGetter.getter.get();
//     const data = await this._ddbHelperService.get(keys).get();
//     // console.log(data);
//     return data;
//   }

//   public async getEnvironmentAndMetadata(envId: string): Promise<QueryCommandOutput> {
//     // const data = await this._ddbQuery.query.key('pk', {S: envId}).query();
//     const data = await this._ddbHelperService.query().key('pk', { S: envId }).query();
//     return data;
//   }

//   public async getEnvironmentAndMetadataPrimaryKeys(envId: string): Promise<QueryCommandOutput> {
//     // const data = await this._ddbQuery.query.key('pk', {S: envId}).projection(['pk', 'sk']).query();
//     const data = await this._ddbHelperService
//       .query()
//       .key('pk', { S: envId })
//       .projection(['pk', 'sk'])
//       .query();
//     return data;
//   }

//   public async getEnvironments(): Promise<ScanCommandOutput> {
//     // const data = await this._ddbScanner.scanner.scan();
//     const data = await this._ddbHelperService.scan().scan();
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

//   public async deleteEnvironment(envId: string): Promise<DeleteItemCommandOutput> {
//     // this._ddbDeleter = new DynamoDBDeleterService({region: this._awsRegion, table: this._tableName, key: {'pk': {S: envId}, 'sk': {S: envId}}});
//     // const data = await this._ddbDeleter.deleter.delete();
//     const data = await this._ddbHelperService.delete({ pk: { S: envId }, sk: { S: envId } }).delete();
//     return data;
//   }

//   public async deleteEnvironmentAndMetadata(envId: string): Promise<BatchWriteItemCommandOutput> {
//     // get all items' primary keys in partition envId
//     const envAndMetadata = await this.getEnvironmentAndMetadataPrimaryKeys(envId);
//     // console.log(envAndMetadata);
//     const envAndMetadataPrimaryKeys = envAndMetadata.Items;
//     // console.log(envAndMetadataPrimaryKeys);
//     // delete all items in partition envId
//     if (!envAndMetadataPrimaryKeys || _.isEmpty(envAndMetadataPrimaryKeys)) {
//       throw new Error('EnvironmentService<==no environment and metadata found');
//     }
//     console.log('before batchget');
//     const getItems = await this._ddbHelperService.get(envAndMetadataPrimaryKeys).get();
//     console.log(getItems);
//     console.log('after batchget');
//     const data = await this._ddbHelperService
//       .batchEdit()
//       .addDeleteRequests(envAndMetadataPrimaryKeys)
//       .batchEdit();
//     // const data = await this._ddbBatchWriteOrDeleter.batchWriteOrDelete.addDeleteRequests(envAndMetadataPrimaryKeys).batchWriteOrDelete();
//     console.log(data);
//     return data;
//   }

//   public async addEnvironmentAndMetadata(
//     envId: string,
//     desc: string,
//     name: string,
//     projectId: string,
//     studyIds: string[],
//     envType: string,
//     envTypeId: string,
//     envTypeConfigId: string,
//     indexId: string,
//     accountItem: { [key: string]: AttributeValue }
//   ): Promise<BatchWriteItemCommandOutput> {
//     // create items (some of these values will likely need to be passed in by the createEnvironment method)
//     const newEnv: Environment = {
//       envId: envId,
//       instanceId: '',
//       cidr: '',
//       description: desc,
//       error: '',
//       name: name,
//       outputs: [],
//       projectId: projectId,
//       rev: 0,
//       status: 'PENDING',
//       studyIds: studyIds,
//       envType: envType,
//       envTypeId: envTypeId,
//       envTypeConfigId: envTypeConfigId,
//       indexId: indexId
//     };
//     const items: { [key: string]: AttributeValue }[] = [];
//     // add account metadata (should not have all account attributes)
//     items.push(accountItem);
//     const accountId = accountItem.id;
//     // add main environment item
//     items.push(this._getEnvironmentItemFromEnvironmentData(newEnv));
//     // add egress store metadata/entry
//     const namespace = '';
//     // TODO add updated/created at/by
//     items.push({
//       pk: { S: `ENV#${envId}` },
//       sk: { S: `EGS#${envId}` },
//       id: { S: envId },
//       status: { N: '3' },
//       egressStoreName: { S: `${name}-egress-store` },
//       egressStoreObjectListLocation: { NULL: true },
//       isAbleToSubmitEgressRequest: { BOOL: true },
//       projectId: { S: projectId },
//       rev: { N: '0' },
//       roleArn: { S: 'TODO where does this come from?' },
//       s3BucketName: { S: `$${accountId}-${namespace}-egress-store` },
//       s3BucketPath: { S: `${envId}/` },
//       workspaceId: { S: envId }
//     });
//     // add metadata stores in environment variable
//     items.push(...this._environmentToMetadataItems(newEnv));
//     console.log(items);
//     // const data = await this._ddbBatchWriteOrDeleter.batchWriteOrDelete.addWriteRequests(items).batchWriteOrDelete();
//     const data = await this._ddbHelperService.batchEdit().addWriteRequests(items).batchEdit();
//     // console.log(data);
//     return data;
//   }

//   private _getEnvironmentItemFromEnvironmentData(env: Environment): { [key: string]: AttributeValue } {
//     const item: { [key: string]: AttributeValue } = {};
//     const envId = env.envId;
//     Object.entries(env).forEach(([key, value]) => {
//       console.log(`looking for ${key}`);
//       if (key === 'envId') {
//         key = 'id';
//       }
//       if (key === 'status') {
//         value = statusMapping.indexOf(value);
//       }
//       if (key === 'outputs') {
//         // const map = value.forEach((object: {id: string, value: string, description: string}) => {
//         //     return {id: {S: object.id}, value: {S: object.value}, description: {S: object.description}};
//         // })
//         if (_.isEmpty(value)) {
//           item[key] = { L: [] };
//         } else {
//           item[key] = {
//             L: value.forEach((object: { id: string; value: string; description: string }) => {
//               return {
//                 M: {
//                   id: { S: object.id },
//                   value: { S: object.value },
//                   description: { S: object.description }
//                 }
//               };
//             })
//           };
//         }
//       } else if (typeof value === 'string') {
//         item[key] = { S: value };
//       } else if (typeof value === 'number') {
//         item[key] = { N: `${value}` };
//       } else if (Array.isArray(value)) {
//         item[key] = { L: value };
//       } else {
//         console.log('did not add item for', key);
//       }
//     });
//     item.pk = { S: `ENV#${envId}` };
//     item.sk = { S: `ENV#${envId}` };
//     return item;
//   }

//   // private _toAttributeValue(input: any): AttributeValue {
//   //     if (typeof input === 'string') {
//   //         return {S: input};
//   //     }
//   //     throw new Error('Did not identify type properly. Please try')
//   // }

//   private _environmentToMetadataItems(env: Environment): { [key: string]: AttributeValue }[] {
//     // const keys = Object.keys(env);
//     const items: { [key: string]: AttributeValue }[] = [];
//     const envId = env.envId;
//     // add metadata from the environment entity
//     Object.entries(env).forEach(([key, value]) => {
//       const prefix = envKeyToAbrevMapping[key];
//       if (typeof value === 'string' && prefix && key !== 'envId') {
//         const item = { someOtherValue: { S: 'value' }, id: { S: `${value}` } }; // TODO, replace this with the call to get the item from the table
//         items.push({ pk: { S: `ENV#${envId}` }, sk: { S: `${prefix}#${value}` }, ...item });
//       }
//     });
//     return items;
//   }

// public async createEnvironment(): Promise<BatchWriteItemCommandOutput> {
//     // TODO generate ID
//     const envId = '';
//     return await this.addEnvironmentAndMetadata(envId, ...);
// }
// }
