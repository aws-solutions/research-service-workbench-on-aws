import { AwsService, QueryParams } from '@amzn/workbench-core-base';
import { GetItemCommandOutput, QueryCommandOutput } from '@aws-sdk/client-dynamodb';
import Boom from '@hapi/boom';
import _ from 'lodash';
import { v4 as uuidv4 } from 'uuid';
import { DataSet, DataSetMetadataPlugin, ExternalEndpoint } from '.';

export class DdbDataSetMetadataPlugin implements DataSetMetadataPlugin {
  private _aws: AwsService;
  private _dataSetKeyType: string;
  private _endPointKeyType: string;

  public constructor(aws: AwsService, dataSetKeyTypeId: string, endPointKeyTypeId: string) {
    this._aws = aws;
    this._dataSetKeyType = dataSetKeyTypeId;
    this._endPointKeyType = endPointKeyTypeId;
  }

  public async getDataSetEndPointDetails(
    dataSetName: string,
    endPointName: string
  ): Promise<ExternalEndpoint> {
    const response: GetItemCommandOutput = (await this._aws.helpers.ddb
      .get({
        pk: `${this._dataSetKeyType}#${dataSetName}`,
        sk: `${this._endPointKeyType}#${endPointName}`
      })
      .execute()) as GetItemCommandOutput;

    if (!response || !response.Item)
      throw Boom.notFound(`Could not find the endpoint '${endPointName}' on '${dataSetName}'.`);
    return response.Item as unknown as ExternalEndpoint;
  }

  public async listDataSets(): Promise<DataSet[]> {
    const params: QueryParams = {
      index: 'getResourceByCreatedAt',
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

    if (!response || !response.Item) throw Boom.notFound(`Could not find DataSet '${name}'.`);
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

  public async addDataSet(dataSet: DataSet): Promise<DataSet> {
    const dataSetParam: DataSet = dataSet;
    await this._validateCreateDataSet(dataSet);
    dataSetParam.id = uuidv4();
    if (_.isUndefined(dataSetParam.createdAt)) dataSetParam.createdAt = new Date().toISOString();
    await this._storeDataSetToDdb(dataSetParam);

    return dataSetParam;
  }

  public async updateDataSet(dataSet: DataSet): Promise<DataSet> {
    await this._storeDataSetToDdb(dataSet);
    return dataSet;
  }

  public async addExternalEndpoint(endPoint: ExternalEndpoint): Promise<ExternalEndpoint> {
    const endPointParam: ExternalEndpoint = endPoint;
    await this._validateCreateExternalEndpoint(endPoint);
    endPointParam.Id = uuidv4();
    if (_.isUndefined(endPointParam.createdAt)) endPointParam.createdAt = new Date().toISOString();
    await this._storeEndPointToDdb(endPoint);
    return endPointParam;
  }

  private async _validateCreateExternalEndpoint(endPoint: ExternalEndpoint): Promise<void> {
    if (!_.isUndefined(endPoint.id)) throw new Error("Cannot create the Endpoint. 'Id' already exists.");
    const targetDS: DataSet = await this.getDataSetMetadata(endPoint.dataSetName);
    if (_.find(targetDS.externalEndpoints, (ep) => ep === endPoint.name))
      throw new Error(
        `Cannot create the EndPoint. EndPoint with name '${endPoint.name}' already exists on DataSet '${targetDS.name}'.`
      );
  }

  private async _validateCreateDataSet(dataSet: DataSet): Promise<void> {
    if (!_.isUndefined(dataSet.id)) throw new Error("Cannot create the DataSet. 'Id' already exists.");
    if (_.isUndefined(dataSet.name))
      throw new Error("Cannot create the DataSet. A 'name' was not supplied but it is required.");
    try {
      await this.getDataSetMetadata(dataSet.name);
      throw new Error(
        `Cannot create the DataSet. A DataSet must have a unique \'name\', and  \'${dataSet.name}\' already exists. `
      );
    } catch (err) {
      if (!Boom.isBoom(err, 404)) throw err;
    }
  }

  private async _storeEndPointToDdb(endPoint: ExternalEndpoint): Promise<string> {
    const endPointKey = {
      pk: `${this._dataSetKeyType}#${endPoint.dataSetName}`,
      sk: `${this._endPointKeyType}#${endPoint.name}`
    };
    const endPointParams: { item: { [key: string]: string | string[] } } = {
      item: {
        id: endPoint.id as string,
        name: endPoint.name,
        createdAt: endPoint.createdAt as string,
        dataSetName: endPoint.dataSetName,
        path: endPoint.path,
        endPointUrl: endPoint.endPointUrl,
        allowedRoles: endPoint.allowedRoles as string[]
      }
    };

    await this._aws.helpers.ddb.update(endPointKey, endPointParams).execute();

    return endPoint.id as string;
  }

  private async _storeDataSetToDdb(dataSet: DataSet): Promise<string> {
    const dataSetKey = {
      pk: `${this._dataSetKeyType}#${dataSet.name}`,
      sk: `${this._dataSetKeyType}#${dataSet.name}`
    };
    const dataSetParams: { item: { [key: string]: string | string[] } } = {
      item: {
        id: dataSet.Id as string,
        name: dataSet.name,
        createdAt: dataSet.createdAt as string,
        storageName: dataSet.storageName,
        path: dataSet.path,
        awsAccountId: dataSet.awsAccountId as string,
        storageType: dataSet.storageType as string
      }
    };

    if (dataSet.externalEndpoints)
      dataSetParams.item.externalEndpoints = dataSet.externalEndpoints as string[];

    await this._aws.helpers.ddb.update(dataSetKey, dataSetParams).execute();

    return dataSet.Id as string;
  }
}
