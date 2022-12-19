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

  public async activate(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/activate`);
  }

  public async deactivate(): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/deactivate`);
  }

  public async cleanup(): Promise<void> {
    try {
      const defAdminSession = await this._setup.getDefaultAdminSession();

      // delete the user
      await defAdminSession.resources.users.user(this.id).delete();
    } catch (e) {
      console.error(e);
    }
  }
}
