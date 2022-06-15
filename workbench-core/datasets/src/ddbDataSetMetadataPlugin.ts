import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import { DataSet, DataSetMetadataPlugin } from '.';

export class DdbDataSetMetadataPlugin implements DataSetMetadataPlugin {
  private _aws: AwsService;
  private _dataSetKeyType: string;

  public constructor(options: { region: string; tableName: string }, dataSetKeyTypeId: string) {
    this._aws = new AwsService(options);
    this._dataSetKeyType = dataSetKeyTypeId;
  }

  public async listDataSets(): Promise<DataSet[]> {
    const params: QueryParams = {
      index: 'getResourceByUpdatedAt',
      key: { name: 'resourceType', value: 'dataset' }
    };
    const response: QueryCommandOutput = await this._aws.helpers.ddb.query(params).execute();

    if (!response || !response.Items) return [];
    return response.Items as unknown as DataSet[];
  }

  public async getDataSetMetadata(name: string): Promise<DataSet> {
    const response: GetItemCommandOutput = (await this._aws.helpers.ddb
      .get({
        pk: `${this._dataSetKeyType}#${name}`,
        sk: `${this._dataSetKeyType}#${name}`
      })
      .execute()) as GetItemCommandOutput;

    if (!response || response.Item) throw Boom.notFound(`Could not find DataSet ${name}.`);
    return response.Item as unknown as DataSet;
  }

  public async listDataSetObjects(dataSetName: string): Promise<string[]> {
    throw new Error('Method not implemented.');
  }

  public async getDataSetObjectMetadata(
    dataSetName: string,
    objectName: string
  ): Promise<Record<string, string>> {
    throw new Error('Method not implemented.');
  }

  public async addDataSet(dataSet: DataSet): Promise<void> {
    throw new Error('Method not implemented.');
  }
  public async updateDataSet(dataSet: DataSet): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
