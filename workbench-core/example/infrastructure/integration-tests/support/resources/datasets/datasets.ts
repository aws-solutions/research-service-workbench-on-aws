/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Dataset from './dataset';

export default class Datasets extends CollectionResource {
  public constructor(clientSession: ClientSession) {
    super(clientSession, 'datasets', 'dataset');
    this._api = 'datasets';
  }

  public dataset(id: string): Dataset {
    return new Dataset(id, this._clientSession, this._api);
  }
  // List call
  public async get(queryParams: { [key: string]: string }): Promise<AxiosResponse> {
    if (!queryParams) {
      return this._axiosInstance.get(this._api, { params: queryParams });
    } else {
      return this._axiosInstance.get(`${this._api}/${queryParams.id}`);
    }
  }

  public async delete(queryParams: { [key: string]: string }): Promise<AxiosResponse> {
    return this._axiosInstance.delete(`${this._api}/${queryParams.id}`);
  }
  public async import(requestBody: { [id: string]: string }): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/import`, requestBody);
  }

  protected _buildDefaults(resource: DataSetCreateRequest): DataSetCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    const dataSetName = randomTextGenerator.getFakeText('test-DS');
    const storageName = this._settings.get('ExampleS3DataSetsBucketName');
    const awsAccountId = this._settings.get('mainAccountId');
    const region = this._settings.get('AwsRegion');

    return {
      datasetName: resource.datasetName ?? dataSetName,
      path: resource.path ?? dataSetName,
      storageName: resource.storageName ?? storageName,
      awsAccountId: resource.awsAccountId ?? awsAccountId,
      region: resource.region ?? region
    };
  }
}

interface DataSetCreateRequest {
  datasetName: string;
  storageName: string;
  path: string;
  awsAccountId: string;
  region: string;
}
