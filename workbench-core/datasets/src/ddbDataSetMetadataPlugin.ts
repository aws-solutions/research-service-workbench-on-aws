import { AwsService } from '@amzn/workbench-core-base';
import { DataSet, DataSetMetadataPlugin } from '.';

export class DdbDataSetMetadataPlugin implements DataSetMetadataPlugin {
  private _aws: AwsService;

  public constructor(options: { region: string; tableName: string }) {
    this._aws = new AwsService(options);
  }

  public async listDataSets(): Promise<DataSet[]> {
    this._aws.helpers.ddb.query({
      key: {
        name: 'pk',
        value: 'DataSet#'
      }
    });
    return [];
  }
  public async getDataSetMetadata(name: string): Promise<Record<string, string | string[]>> {
    throw new Error('Method not implemented.');
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
