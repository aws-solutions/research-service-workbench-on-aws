/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import ClientSession from '../../clientSession';
import { DatasetHelper } from '../../complex/datasetHelper';
import Resource from '../base/resource';

export default class Endpoint extends Resource {
  private _name: string;
  private _awsAccountId: string;

  public constructor(params: EndpointCreateParams) {
    super(params.clientSession, 'endpoint', params.id, params.parentApi);
    this._api = `${this._api}/share`;
    this._name = params.externalEndpointName;
    this._awsAccountId = params.awsAccountId;
  }

  public async cleanup(): Promise<void> {
    try {
      const dataSetHelper = new DatasetHelper();
      await dataSetHelper.deleteS3AccessPoint(this._name, this._awsAccountId);
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
