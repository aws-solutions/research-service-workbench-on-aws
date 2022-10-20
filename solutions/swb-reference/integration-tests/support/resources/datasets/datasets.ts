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

  public async import(requestBody: { [id: string]: string }): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/import`, requestBody);
  }

  protected _buildDefaults(resource: DataSetCreateRequest): DataSetCreateRequest {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    const dataSetName = randomTextGenerator.getFakeText('test-DS');
    return {
      datasetName: resource.datasetName ?? dataSetName,
      path: resource.path ?? dataSetName,
      description: resource.description,
      owningProjectId: resource.owningProjectId
    };
  }
}

interface DataSetCreateRequest {
  datasetName: string;
  path: string;
  description?: string;
  owningProjectId: string;
}
