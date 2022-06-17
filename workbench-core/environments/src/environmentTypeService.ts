import { AwsService, buildDynamoDBPkSk, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';

import Boom from '@hapi/boom';
import { v4 as uuidv4 } from 'uuid';
import envKeyNameToKey from './environmentKeyNameToKey';
import { EnvironmentTypeStatus } from './environmentTypeStatus';

interface EnvironmentType {
  pk: string;
  sk: string;
  id: string;
  productId: string;
  provisioningArtifactId: string;
  description: string;
  name: string;
  owner: string;
  type: string;
  params: {
    DefaultValue?: string;
    Description: string;
    IsNoEcho: boolean;
    ParameterKey: string;
    ParameterType: string;
    ParameterConstraints: {
      AllowedValues: string[];
    };
  }[];
  resourceType: string;
  status: EnvironmentTypeStatus;
  createdAt: string;
  createdBy: string;
  updatedAt: string;
  updatedBy: string;
}
export default class EnvironmentTypeService {
  private _aws: AwsService;
  private _tableName: string;
  private _resourceType: string = 'envType';

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getEnvironmentType(owner: string, envTypeId: string): Promise<EnvironmentType> {
    const response = await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(envTypeId, envKeyNameToKey.envType))
      .execute();
    const item = (response as GetItemCommandOutput).Item;
    if (item === undefined) {
      throw Boom.notFound(`Could not find environment type ${envTypeId}`);
    } else {
      console.log('item', JSON.stringify(item));
      const envType = item as unknown as EnvironmentType;
      console.log('envType Owner', envType.owner);
      console.log('req owner', owner);
      if (envType.owner !== owner) {
        throw Boom.unauthorized();
      }
      return Promise.resolve(envType);
    }
  }

  public async getEnvironmentTypes(user: { role: string; ownerId: string }): Promise<EnvironmentType[]> {
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
    const envTypesResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const items = envTypesResponse.Items;
    if (items === undefined) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(items as unknown as EnvironmentType[]);
    }
  }

  public async updateEnvironmentType(
    owner: string,
    envTypeId: string,
    updatedValues: { [key: string]: string }
  ): Promise<EnvironmentType> {
    try {
      await this.getEnvironmentType(owner, envTypeId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment type ${envTypeId} to update`);
      }
      throw e;
    }

    const currentDate = new Date().toISOString();
    const updatedEnvType = {
      ...updatedValues,
      createdAt: currentDate,
      updatedAt: currentDate,
      updatedBy: owner
    };

    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(envTypeId, envKeyNameToKey.envType), { item: updatedEnvType })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentType;
    }
    console.error('Unable to update environment type', updatedEnvType);
    throw Boom.internal(`Unable to update environment type with params: ${JSON.stringify(updatedValues)}`);
  }

  public async createNewEnvironmentType(params: {
    productId: string;
    provisioningArtifactId: string;
    description: string;
    name: string;
    owner: string;
    type: string;
    params: {
      DefaultValue?: string;
      Description: string;
      IsNoEcho: boolean;
      ParameterKey: string;
      ParameterType: string;
      ParameterConstraints: {
        AllowedValues: string[];
      };
    }[];
    status: EnvironmentTypeStatus;
  }): Promise<EnvironmentType> {
    const id = uuidv4();
    const currentDate = new Date().toISOString();
    const newEnvType: EnvironmentType = {
      id,
      ...buildDynamoDBPkSk(id, envKeyNameToKey.envType),
      createdAt: currentDate,
      updatedAt: currentDate,
      createdBy: params.owner,
      updatedBy: params.owner,
      resourceType: this._resourceType,
      ...params
    };
    const item = newEnvType as unknown as { [key: string]: unknown };
    const response = await this._aws.helpers.ddb
      .update(buildDynamoDBPkSk(id, envKeyNameToKey.envType), { item })
      .execute();
    if (response.Attributes) {
      return response.Attributes as unknown as EnvironmentType;
    }
    console.error('Unable to create environment type', newEnvType);
    throw Boom.internal(`Unable to create environment type with params: ${JSON.stringify(params)}`);
  }
}
