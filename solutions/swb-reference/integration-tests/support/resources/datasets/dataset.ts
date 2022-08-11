/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DataSetHelper } from '../../complex/dataSetHelper';
import Resource from '../base/resource';

export default class Dataset extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'dataset', id, parentApi);
  }

  public async terminate(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/terminate`);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.datasets.dataset(this._id).get();
    const { storageName, path } = resource;

    // Delete DDB entries, and path folder from bucket (to prevent test resources polluting a prod env)
    const dataSetHelper = new DataSetHelper(this._setup.getMainAwsClient(), defAdminSession);
    await dataSetHelper.deleteS3Resources(storageName, path);
    await dataSetHelper.deleteDdbRecords(this._id);
  }
}
