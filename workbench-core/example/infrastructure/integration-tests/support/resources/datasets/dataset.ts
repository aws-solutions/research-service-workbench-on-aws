/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import RandomTextGenerator from '../../utils/randomTextGenerator';
import Resource from '../base/resource';
import Endpoint, { EndpointCreateParams } from './endpoint';

export default class Dataset extends Resource {
  private _awsAccountId: string;
  private _children: Map<string, Endpoint>;

  private _clientSession: ClientSession;
  public id: string;
  public storageName: string;
  public storagePath: string;

  public constructor(params: DataSetCreateParams) {
    super(params.clientSession, 'dataset', params.id, params.parentApi);
    this._awsAccountId = params.awsAccountId;
    this.storageName = params.storageName;
    this.storagePath = params.storagePath;
    this.id = params.id;
    this._api = `datasets/${params.id}`;
    this._clientSession = params.clientSession;
    this._children = new Map<string, Endpoint>();
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

    const taskid = `endpoint-${endPointParams.id}`;
    const resourceNode: Endpoint = this.endpoint(endPointParams);
    this._children.set(resourceNode.id, resourceNode);

    this._clientSession.addCleanupTask({ id: taskid, task: async () => resourceNode.cleanup() });

    return response;
  }

  public async generateSinglePartFileUploadUrl(body: { fileName: string }): Promise<AxiosResponse> {
    return await this._axiosInstance.post(`${this._api}/presignedUpload`, body);
  }

  public async cleanup(): Promise<void> {
    try {
      // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
      const datasetHelper = new DatasetHelper();
      await datasetHelper.deleteS3Resources(this.storageName, this.storagePath);
      await datasetHelper.deleteDdbRecords(this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of dataset '${this.id}': ${error}.`);
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
