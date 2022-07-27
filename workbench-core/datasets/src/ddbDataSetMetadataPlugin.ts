/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

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

  public async getDataSetEndPointDetails(dataSetId: string, endPointId: string): Promise<ExternalEndpoint> {
    const response: GetItemCommandOutput = (await this._aws.helpers.ddb
      .get({
        pk: `${this._dataSetKeyType}#${dataSetId}`,
        sk: `${this._endPointKeyType}#${endPointId}`
      })
      .execute()) as GetItemCommandOutput;

    if (!response || !response.Item)
      throw Boom.notFound(`Could not find the endpoint '${endPointId}' on '${dataSetId}'.`);
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

  public async getDataSetMetadata(id: string): Promise<DataSet> {
    const response: GetItemCommandOutput = (await this._aws.helpers.ddb
      .get({
        pk: `${this._dataSetKeyType}#${id}`,
        sk: `${this._dataSetKeyType}#${id}`
      })
      .execute()) as GetItemCommandOutput;

    if (!response || !response.Item) throw Boom.notFound(`Could not find DataSet '${id}'.`);
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
    endPointParam.id = uuidv4();
    if (_.isUndefined(endPointParam.createdAt)) endPointParam.createdAt = new Date().toISOString();
    await this._storeEndPointToDdb(endPointParam);
    return endPointParam;
  }

  public async listEndpointsForDataSet(dataSetId: string): Promise<ExternalEndpoint[]> {
    const params: QueryParams = {
      key: { name: 'pk', value: `${this._dataSetKeyType}#${dataSetId}` },
      sortKey: 'sk',
      begins: { S: `${this._endPointKeyType}#` }
    };

    const dataSetEndPoints: QueryCommandOutput = await this._aws.helpers.ddb.query(params).execute();

    if (!dataSetEndPoints || !dataSetEndPoints.Items) return [];
    return dataSetEndPoints.Items as unknown as ExternalEndpoint[];
  }

  public async updateExternalEndpoint(endPoint: ExternalEndpoint): Promise<ExternalEndpoint> {
    const endPointParam: ExternalEndpoint = endPoint;
    await this._storeEndPointToDdb(endPointParam);
    return endPointParam;
  }

  private async _validateCreateExternalEndpoint(endPoint: ExternalEndpoint): Promise<void> {
    if (!_.isUndefined(endPoint.id)) throw new Error("Cannot create the Endpoint. 'Id' already exists.");
    const targetDS: DataSet = await this.getDataSetMetadata(endPoint.dataSetId);
    const endPoints: ExternalEndpoint[] = await this.listEndpointsForDataSet(targetDS.id!);

    if (_.find(endPoints, (ep) => ep.name === endPoint.name))
      throw new Error(
        `Cannot create the EndPoint. EndPoint with name '${endPoint.name}' already exists on DataSet '${targetDS.name}'.`
      );
  }

  private async _validateCreateDataSet(dataSet: DataSet): Promise<void> {
    if (!_.isUndefined(dataSet.id)) throw new Error("Cannot create the DataSet. 'Id' already exists.");
    if (_.isUndefined(dataSet.name))
      throw new Error("Cannot create the DataSet. A 'name' was not supplied but it is required.");

    const queryParams: QueryParams = {
      index: 'getResourceByName',
      key: { name: 'resourceType', value: 'dataset' },
      sortKey: 'name',
      eq: { S: dataSet.name }
    };
    const response: QueryCommandOutput = await this._aws.helpers.ddb.query(queryParams).execute();

    if (response && response.Items && response.Items.length > 0) {
      throw new Error(
        `Cannot create the DataSet. A DataSet must have a unique \'name\', and  \'${dataSet.name}\' already exists. `
      );
    }
  }

  private async _storeEndPointToDdb(endPoint: ExternalEndpoint): Promise<string> {
    const endPointKey = {
      pk: `${this._dataSetKeyType}#${endPoint.dataSetId}`,
      sk: `${this._endPointKeyType}#${endPoint.id}`
    };
    const endPointParams: { item: { [key: string]: string | string[] } } = {
      item: {
        id: endPoint.id!,
        name: endPoint.name,
        createdAt: endPoint.createdAt!,
        dataSetId: endPoint.dataSetId,
        dataSetName: endPoint.dataSetName,
        path: endPoint.path,
        endPointUrl: endPoint.endPointUrl,
        resourceType: 'endpoint'
      }
    };

    if (endPoint.allowedRoles) {
      endPointParams.item.allowedRoles = endPoint.allowedRoles;
    }

    if (endPoint.endPointAlias) {
      endPointParams.item.endPointAlias = endPoint.endPointAlias;
    }

    await this._aws.helpers.ddb.update(endPointKey, endPointParams).execute();

    return endPoint.id!;
  }

  private async _storeDataSetToDdb(dataSet: DataSet): Promise<string> {
    const dataSetKey = {
      pk: `${this._dataSetKeyType}#${dataSet.id}`,
      sk: `${this._dataSetKeyType}#${dataSet.id}`
    };
    const dataSetParams: { item: { [key: string]: string | string[] } } = {
      item: {
        id: dataSet.id!,
        name: dataSet.name,
        createdAt: dataSet.createdAt!,
        storageName: dataSet.storageName,
        path: dataSet.path,
        awsAccountId: dataSet.awsAccountId!,
        storageType: dataSet.storageType!,
        resourceType: 'dataset'
      }
    };

    if (dataSet.externalEndpoints) dataSetParams.item.externalEndpoints = dataSet.externalEndpoints!;

    await this._aws.helpers.ddb.update(dataSetKey, dataSetParams).execute();

    return dataSet.id!;
  }
}
