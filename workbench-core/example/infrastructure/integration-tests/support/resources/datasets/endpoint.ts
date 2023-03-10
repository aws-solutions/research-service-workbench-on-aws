/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import Resource from '../base/resource';

export default class Endpoint extends Resource {
  private _name: string;
  private _awsAccountId: string;

  public constructor(params: EndpointCreateParams) {
    super(params.clientSession, 'share', params.id, params.parentApi);
    this._name = params.externalEndpointName;
    this._awsAccountId = params.awsAccountId;
  }

  public async getMountObject(): Promise<AxiosResponse> {
    return await this._axiosInstance.get(`${this._api}/mount-object`);
  }

  public async cleanup(): Promise<void> {
    try {
      const mainAwsService = this._setup.getMainAwsClient();
      const hostAwsService = await this._setup.getHostAwsClient('Main-Account-Cleanup-Endpoint');
      const awsService =
        this._awsAccountId === this._settings.get('HostingAccountId') ? hostAwsService : mainAwsService;

      await DatasetHelper.deleteS3AccessPoint(awsService, this._name, this._awsAccountId);
    } catch (error) {
      console.warn(`Error caught in cleanup of endpoint '${this.id}: ${error}`);
    }
  }
}

export interface EndpointCreateParams {
  id: string;
  clientSession: ClientSession;
  parentApi: string;
  externalEndpointName: string;
  awsAccountId: string;
}
