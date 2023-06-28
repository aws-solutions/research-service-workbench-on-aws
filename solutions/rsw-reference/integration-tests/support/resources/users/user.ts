/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class User extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'user', id, parentApi);
  }

  public async activate(): Promise<AxiosResponse> {
    return this._axiosInstance.patch(this._api, { status: 'ACTIVE' });
  }

  public async deactivate(): Promise<AxiosResponse> {
    return this._axiosInstance.patch(this._api, { status: 'INACTIVE' });
  }

  protected async cleanup(): Promise<void> {
    const adminSession = await this._setup.getDefaultAdminSession();

    try {
      console.log(`Attempting to make user inactive ${this._id}.`);
      await adminSession.resources.users.user(this._id).update({ status: 'INACTIVE' }, true);

      console.log(`Attempting to delete user ${this._id}.`);
      await adminSession.resources.users.user(this._id).purge();

      console.log(`Deleted user ${this._id}`);
    } catch (e) {
      console.warn(
        `Could not delete user ${this._id}". 
        Encountered error: ${e}`
      );
    }
  }
}
