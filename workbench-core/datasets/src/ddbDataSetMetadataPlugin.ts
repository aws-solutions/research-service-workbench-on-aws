import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
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
    this._validateCreateDataSet(dataSet);
    dataSet.id = uuidv4();
    if (_.isUndefined(dataSet.createdAt)) dataSet.createdAt = new Date().toISOString();
    await this._updateDataSet(dataSet);
  }

  public async updateDataSet(dataSet: DataSet): Promise<void> {
    throw new Error('Method not implemented.');
  }

  private _validateCreateDataSet(dataSet: DataSet): void {
    if (!_.isUndefined(dataSet.id)) throw new Error("Cannot create the DataSet. 'Id' already exists.");
    if (_.isUndefined(dataSet.name))
      throw new Error("Cannot create the DataSet. A 'name' was not supplied but it is required.");
    try {
      const existing = this.getDataSetMetadata(dataSet.name);
      throw new Error(
        `Cannot create the DataSet. A DataSet must have a unique \'name\', and  \'${dataSet.name}\' already exists. `
      );
    } catch (err) {
      if (!Boom.isBoom(err, 404)) throw err;
    }
  }

  private async _updateDataSet(dataSet: DataSet): Promise<void> {
    const dataSetParams = {};
  }
}
