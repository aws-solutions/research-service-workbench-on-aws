import { AwsService } from '@amzn/workbench-core-base';
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
    DefaultValue: string;
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
  resourceType: '',
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

  public getEnvironmentType(envTypeId: string): Promise<EnvironmentType> {
    return Promise.resolve(defaultEnvType);
  }
}
