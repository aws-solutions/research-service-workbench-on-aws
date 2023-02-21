/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { GetItemCommandOutput } from '@aws-sdk/client-dynamodb';
import {
  addPaginationToken,
  AwsService,
  buildDynamoDbKey,
  buildDynamoDBPkSk,
  PaginatedResponse,
  QueryParams,
  toPaginationToken,
  uuidWithLowercasePrefix
} from '@aws/workbench-core-base';
import { DataSetMetadataPlugin } from './dataSetMetadataPlugin';
import { DataSetExistsError } from './errors/dataSetExistsError';
import { DataSetNotFoundError } from './errors/dataSetNotFoundError';
import { EndpointExistsError } from './errors/endpointExistsError';
import { EndpointNotFoundError } from './errors/endpointNotFoundError';
import { CreateDataSet, DataSet, DataSetArrayParser, DataSetParser } from './models/dataSet';
import {
  CreateExternalEndpoint,
  ExternalEndpoint,
  ExternalEndpointArrayParser,
  ExternalEndpointParser
} from './models/externalEndpoint';
import { StorageLocation } from './models/storageLocation';

export class DdbDataSetMetadataPlugin implements DataSetMetadataPlugin {
  private _aws: AwsService;
  private _dataSetKeyType: string;
  private _endpointKeyType: string;

  public constructor(aws: AwsService, dataSetKeyTypeId: string, endpointKeyTypeId: string) {
    this._aws = aws;
    this._dataSetKeyType = dataSetKeyTypeId;
    this._endpointKeyType = endpointKeyTypeId;
  }

  public async getDataSetEndPointDetails(dataSetId: string, endpointId: string): Promise<ExternalEndpoint> {
    const response = (await this._aws.helpers.ddb
      .get({
        pk: buildDynamoDbKey(dataSetId, this._dataSetKeyType),
        sk: buildDynamoDbKey(endpointId, this._endpointKeyType)
      })
      .execute()) as GetItemCommandOutput;

    if (!response.Item) {
      throw new EndpointNotFoundError(`Could not find the endpoint '${endpointId}' on '${dataSetId}'.`);
    }
    return ExternalEndpointParser.parse(response.Item);
  }

  public async listDataSets(
    pageSize: number,
    paginationToken: string | undefined
  ): Promise<PaginatedResponse<DataSet>> {
    const query: QueryParams = addPaginationToken(paginationToken, {
      key: { name: 'resourceType', value: 'dataset' },
      index: 'getResourceByCreatedAt',
      limit: pageSize
    });

    const response = await this._aws.helpers.ddb.getPaginatedItems(query);

    const dataSets = DataSetArrayParser.parse(response.data) || [];

    return {
      data: dataSets,
      paginationToken: response.paginationToken
    };
  }

  public async getDataSetMetadata(id: string): Promise<DataSet> {
    const response = (await this._aws.helpers.ddb
      .get(buildDynamoDBPkSk(id, this._dataSetKeyType))
      .execute()) as GetItemCommandOutput;

    if (!response.Item) {
      throw new DataSetNotFoundError(`Could not find DataSet '${id}'.`);
    }
    return DataSetParser.parse(response.Item);
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

  public async addDataSet(dataSet: CreateDataSet): Promise<DataSet> {
    await this._validateCreateDataSet(dataSet);

    const createdDataSet: DataSet = {
      ...dataSet,
      id: uuidWithLowercasePrefix(this._dataSetKeyType),
      createdAt: new Date().toISOString()
    };

    await this._storeDataSetToDdb(createdDataSet);

    return createdDataSet;
  }

  public async updateDataSet(dataSet: DataSet): Promise<DataSet> {
    await this._storeDataSetToDdb(dataSet);
    return dataSet;
  }

  /**
   * Remove a DataSet. Will not throw if the dataset does not exist.
   * @param dataSetId - the ID of the Dataset to remove.
   */
  public async removeDataSet(dataSetId: string): Promise<void> {
    await this._aws.helpers.ddb.delete(buildDynamoDBPkSk(dataSetId, this._dataSetKeyType)).execute();
  }

  public async addExternalEndpoint(endpoint: CreateExternalEndpoint): Promise<ExternalEndpoint> {
    await this._validateCreateExternalEndpoint(endpoint);

    const createdEndpoint: ExternalEndpoint = {
      ...endpoint,
      id: uuidWithLowercasePrefix(this._endpointKeyType),
      createdAt: new Date().toISOString()
    };

    await this._storeEndpointToDdb(createdEndpoint);

    return createdEndpoint;
  }

  public async listEndpointsForDataSet(dataSetId: string): Promise<ExternalEndpoint[]> {
    const params: QueryParams = {
      key: { name: 'pk', value: buildDynamoDbKey(dataSetId, this._dataSetKeyType) },
      sortKey: 'sk',
      begins: { S: `${this._endpointKeyType}#` }
    };

    const response = await this._aws.helpers.ddb.query(params).execute();

    if (!response.Items) {
      return [];
    }
    return ExternalEndpointArrayParser.parse(response.Items);
  }

  public async updateExternalEndpoint(endpoint: ExternalEndpoint): Promise<ExternalEndpoint> {
    await this._storeEndpointToDdb(endpoint);
    return endpoint;
  }

  public async listStorageLocations(
    pageSize: number,
    paginationToken: string | undefined
  ): Promise<PaginatedResponse<StorageLocation>> {
    const response = await this.listDataSets(pageSize, paginationToken);

    const map = new Map<string, StorageLocation>();
    response.data.forEach((dataset) =>
      map.set(dataset.storageName, {
        name: dataset.storageName,
        awsAccountId: dataset.awsAccountId,
        type: dataset.storageType,
        region: dataset.region
      })
    );
    return {
      data: Array.from(map.values()),
      paginationToken: response.paginationToken
    };
  }

  private async _validateCreateExternalEndpoint(endpoint: CreateExternalEndpoint): Promise<void> {
    const targetDS = await this.getDataSetMetadata(endpoint.dataSetId);
    const endpoints = await this.listEndpointsForDataSet(targetDS.id!);

    if (endpoints.some((ep) => ep.name === endpoint.name))
      throw new EndpointExistsError(
        `Cannot create the Endpoint. Endpoint with name '${endpoint.name}' already exists on DataSet '${targetDS.name}'.`
      );
  }

  private async _validateCreateDataSet(dataSet: CreateDataSet): Promise<void> {
    const queryParams: QueryParams = {
      index: 'getResourceByName',
      key: { name: 'resourceType', value: 'dataset' },
      sortKey: 'name',
      eq: { S: dataSet.name }
    };
    const response = await this._aws.helpers.ddb.query(queryParams).execute();

    if (response.Items?.length) {
      throw new DataSetExistsError(
        `Cannot create the DataSet. A DataSet must have a unique 'name', and  '${dataSet.name}' already exists.`
      );
    }
  }

  private async _storeEndpointToDdb(endpoint: ExternalEndpoint): Promise<void> {
    const endpointKey = {
      pk: buildDynamoDbKey(endpoint.dataSetId, this._dataSetKeyType),
      sk: buildDynamoDbKey(endpoint.id, this._endpointKeyType)
    };
    const endpointItem: ExternalEndpoint & { resourceType: string } = {
      ...endpoint,
      resourceType: 'endpoint'
    };

    await this._aws.helpers.ddb.updateExecuteAndFormat({ key: endpointKey, params: { item: endpointItem } });
  }

  private async _storeDataSetToDdb(dataSet: DataSet): Promise<void> {
    const dataSetItem: DataSet & { resourceType: string } = {
      ...dataSet,
      resourceType: 'dataset'
    };

    await this._aws.helpers.ddb.updateExecuteAndFormat({
      key: buildDynamoDBPkSk(dataSet.id, this._dataSetKeyType),
      params: { item: dataSetItem }
    });
  }

  public getPaginationToken(dataSetId: string): string {
    return toPaginationToken(buildDynamoDBPkSk(dataSetId, this._dataSetKeyType));
  }
}
