import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import environmentResourceTypeToKey from './environmentResourceTypeToKey';
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
  private _tableName: string;
  private _envTypeService: EnvironmentTypeService;
  private _resourceType: string = 'envTypeConfig';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
    this._envTypeService = new EnvironmentTypeService({ TABLE_NAME });
  }

  public async getEnvironmentTypeConfig(
    user: { owner: string; role: string },
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
      if (envTypeConfig.owner !== user.owner && user.role !== 'admin') {
        throw Boom.unauthorized();
      }
      return Promise.resolve(envTypeConfig);
    }
  }

  public async getEnvironmentTypeConfigs(
    user: { owner: string; role: string },
    envTypeId: string
  ): Promise<EnvironmentTypeConfig[]> {
    const queryParams: QueryParams = {
      key: { name: 'pk', value: environmentResourceTypeToKey.envTypeConfig },
      sortKey: 'sk',
      begins: { S: `${environmentResourceTypeToKey.envType}#${envTypeId}` }
    };
    const envTypeConfigsResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const items = envTypeConfigsResponse.Items as unknown[] as EnvironmentTypeConfig[];
    return items.filter((item) => {
      return item.owner === user.owner || user.role === 'admin';
    });
  }

  public async createNewEnvironmentTypeConfig(
    owner: string,
    envTypeId: string,
    params: {
      productId: string;
      provisioningArtifactId: string;
      allowRoleIds: string[];
      type: string;
      description: string;
      name: string;
      params: { key: string; value: string }[];
    }
  ): Promise<EnvironmentTypeConfig> {
    try {
      await this._envTypeService.getEnvironmentType(owner, envTypeId);
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
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: owner,
      updatedBy: owner,
      resourceType: this._resourceType,
      ...params,
      owner
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

  public async updateEnvironmentTypeConfig(
    user: { owner: string; role: string },
    envTypeId: string,
    envTypeConfigId: string,
    updatedValues: { [key: string]: string }
  ): Promise<EnvironmentTypeConfig> {
    try {
      await this.getEnvironmentTypeConfig(user, envTypeId, envTypeConfigId);
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
      updatedBy: user.owner
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
