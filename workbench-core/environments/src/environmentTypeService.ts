import { AwsService } from '@amzn/workbench-core-base';
import { GetItemCommandOutput, UpdateItemCommandOutput } from '@aws-sdk/client-dynamodb';
import envKeyNameToKey from './environmentKeyNameToKey';
import { v4 as uuidv4 } from 'uuid';
import Boom from '@hapi/boom';

interface EnvironmentType {
  pk: string;
  sk: string;
  id: string;
  productId: string;
  provisioningArtifactId: string;
  createdAt: string;
  createdBy: string;
  desc: string;
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
  status: string;
  updatedAt: string;
  updatedBy: string;
}
const defaultEnvType = {
  pk: '',
  sk: '',
  id: '',
  productId: '',
  provisioningArtifactId: '',
  createdAt: '',
  createdBy: '',
  desc: '',
  name: '',
  owner: '',
  type: '',
  params: [],
  resourceType: 'envType',
  status: '',
  updatedAt: '',
  updatedBy: ''
};
export default class EnvironmentTypeService {
  private _aws: AwsService;
  private _tableName: string;

  public constructor(constants: { TABLE_NAME: string }) {
    const { TABLE_NAME } = constants;
    this._tableName = TABLE_NAME;
    this._aws = new AwsService({ region: process.env.AWS_REGION!, ddbTableName: TABLE_NAME });
  }

  public async getEnvironmentType(envTypeId: string): Promise<EnvironmentType> {
    const response = await this._aws.helpers.ddb
      .get(this._buildPkSk(envTypeId, envKeyNameToKey.envType))
      .execute();

    const item = (response as GetItemCommandOutput).Item;
    if (item === undefined) {
      throw Boom.notFound(`Could not find environment type ${envTypeId}`);
    } else {
      const envType = item as unknown as EnvironmentType;
      return Promise.resolve(envType);
    }
  }

  public async getEnvironmentTypes(): Promise<EnvironmentType[]> {
    const queryParams = {
      index: 'getResourceByUpdatedAt',
      key: { name: 'resourceType', value: 'envType' }
    };
    const envTypesResponse = await this._aws.helpers.ddb.query(queryParams).execute();
    const items = envTypesResponse.Items;
    if (items === undefined) {
      return Promise.resolve([]);
    } else {
      return Promise.resolve(items as unknown as EnvironmentType[]);
    }
  }

  private _buildPkSk(id: string, type: string): { pk: string; sk: string } {
    const key = this._buildKey(id, type);
    return { pk: key, sk: key };
  }

  private _buildKey(id: string, type: string): string {
    return `${type}#${id}`;
  }

  public async updateEnvironment(
    envTypeId: string,
    updatedValues: { [key: string]: string }
  ): Promise<EnvironmentType> {
    try {
      await this.getEnvironmentType(envTypeId);
    } catch (e) {
      if (Boom.isBoom(e) && e.output.statusCode === Boom.notFound().output.statusCode) {
        throw Boom.notFound(`Could not find environment type ${envTypeId} to update`);
      }
      throw e;
    }

    const response = await this._aws.helpers.ddb
      .update(this._buildPkSk(envTypeId, envKeyNameToKey.envType), { item: updatedValues })
      .execute();
    return response.Attributes! as unknown as EnvironmentType;
  }

  public async createNewEnvironment(params: {
    productId: string;
    provisioningArtifactId: string;
    createdAt: string;
    createdBy: string;
    desc: string;
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
    status: string;
    updatedAt: string;
    updatedBy: string;
  }) {
    const id = uuidv4();
    const newEnvType = {
      id,
      ...this._buildPkSk(id, envKeyNameToKey.envType),
      ...params
    };
    return this._aws.helpers.ddb
      .update(this._buildPkSk(id, envKeyNameToKey.envType), { item: newEnvType })
      .execute();
  }
}
