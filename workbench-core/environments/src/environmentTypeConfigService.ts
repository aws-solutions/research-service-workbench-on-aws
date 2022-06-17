import { AwsService, buildDynamoDBPkSk, QueryParams } from '@amzn/workbench-core-base';
import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import envKeyNameToKey from './environmentKeyNameToKey';
import environmentResourceTypeToKey from './environmentResourceTypeToKey';

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
  private _tableName: string;
  private _resourceType: string = 'envTypeConfig';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getEnvironmentTypeConfigs(user: {
    role: string;
    ownerId: string;
  }): Promise<EnvironmentTypeConfig[]> {
    const queryParams: QueryParams = {
      key: { name: 'resourceType', value: this._resourceType }
    };
    if (user.role === 'admin') {
      queryParams.index = 'getResourceByUpdatedAt';
    } else {
      queryParams.index = 'getResourceByOwner';
      queryParams.sortKey = 'owner';
      queryParams.eq = { S: user.ownerId };
    }
    const envTypeConfigsResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const items = envTypeConfigsResponse.Items;
    if (items === undefined) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(items as unknown as EnvironmentTypeConfig[]);
    }
  }

  public async createNewEnvironmentTypeConfig(params: {
    envTypeId: string;
    productId: string;
    provisioningArtifactId: string;
    allowRoleIds: string[];
    type: string;
    description: string;
    name: string;
    owner: string;
    params: { key: string; value: string }[];
  }): Promise<EnvironmentTypeConfig> {
    const envTypeConfigId = uuidv4();
    const currentDate = new Date().toISOString();

    const updatedParams = { ...params, envTypeId: undefined }; // We don't want envTypeId written to DDB
    const newEnvTypeConfig: EnvironmentTypeConfig = {
      id: envTypeConfigId,
      ...this._buildEnvTypeConfigPkSk(params.envTypeId, envTypeConfigId),
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: params.owner,
      updatedBy: params.owner,
      resourceType: this._resourceType,
      ...updatedParams
    };

    const item = newEnvTypeConfig as unknown as { [key: string]: unknown };
    const response = await this._aws.helpers.ddb
      .update(this._buildEnvTypeConfigPkSk(params.envTypeId, envTypeConfigId), { item })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentTypeConfig;
    }
    console.error('Unable to create environment type', newEnvTypeConfig);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(params)}`);
  }

  _buildEnvTypeConfigPkSk(envTypeId: string, envTypeConfigId: string) {
    return {
      pk: environmentResourceTypeToKey.envTypeConfig,
      sk: `${environmentResourceTypeToKey.envType}#${envTypeId}${environmentResourceTypeToKey.envTypeConfig}#${envTypeConfigId}`
    };
  }
}
