/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import CollectionResource from '../base/collectionResource';
import Endpoint, { EndpointCreateParams } from './endpoint';

export default class Dataset extends CollectionResource {
  private _awsAccountId: string;
  private _storageName: string;
  private _storagePath: string;
  public _id: string;

  public constructor(params: DataSetCreateParams) {
    super(params.clientSession, 'dataset', 'endpoint', params.parentApi);
    this._awsAccountId = params.awsAccountId;
    this._storageName = params.storageName;
    this._storagePath = params.storagePath;
    this._id = params.id;
    this._api = `datasets/${params.id}`;
  }

  public endpoint(params: EndpointCreateParams): Endpoint {
    return new Endpoint(params);
  }

  public async share(requestBody: {
    externalEndpointName?: string;
    externalRoleName?: string;
    kmsKeyArn?: string;
  }): Promise<AxiosResponse> {
    const randomTextGenerator = new RandomTextGenerator(this._settings.get('runId'));
    // note: endpoint will be created as S3 access point which MUST begin with a lower case letter.
    const endPointName =
      requestBody.externalEndpointName ?? `ap-${randomTextGenerator.getFakeText('test-EP').toLowerCase()}`;

    const response: AxiosResponse = await this._axiosInstance.post(`${this._api}/share`, {
      externalEndpointName: endPointName,
      externalRoleName: requestBody.externalRoleName,
      kmsKeyArn: requestBody.kmsKeyArn
    });

    const endPointParams: EndpointCreateParams = {
      id: response.data.id,
      clientSession: this._clientSession,
      parentApi: 'datasets',
      awsAccountId: this._awsAccountId,
      externalEndpointName: endPointName
    };

    const taskid = `${this._childType}-${endPointParams.id}`;
    // @ts-ignore
    const resourceNode = this[this._childType](endPointParams);
    this.children.push(resourceNode);

    this._clientSession.addCleanupTask({ id: taskid, task: async () => resourceNode.cleanup() });

    return response;
  }

  protected async cleanup(): Promise<void> {
    try {
      // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
      const datasetHelper = new DatasetHelper();
      await datasetHelper.deleteS3Resources(this._storageName, this._storagePath);
      await datasetHelper.deleteDdbRecords(this._id);
    } catch (error) {
      console.log(`Error caught in cleanup of dataset '${this._id}': ${error}.`);
    }
  }
}

export interface DataSetCreateParams {
  id: string;
  clientSession: ClientSession;
  parentApi: string;
  awsAccountId: string;
  storageName: string;
  storagePath: string;
}
