/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class User extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'dataset', id, parentApi);
  }

  public async share(requestBody: { [id: string]: string }): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/share`, requestBody);
  }

  protected async cleanup(): Promise<void> {
    const defAdminSession = await this._setup.getDefaultAdminSession();
    const { data: resource } = await defAdminSession.resources.users.user(this._id).get();
    console.log(resource);
    // TODO
  }
}
