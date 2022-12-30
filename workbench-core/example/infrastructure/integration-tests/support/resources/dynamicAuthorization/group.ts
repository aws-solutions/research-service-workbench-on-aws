/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DynamicAuthorizationHelper } from '../../complex/dynamicAuthorizationHelper';
import Resource from '../base/resource';

export default class Group extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'group', id, parentApi);
    this._api = parentApi;
  }

  public async cleanup(): Promise<void> {
    try {
      const authzHelper = new DynamicAuthorizationHelper();
      await authzHelper.deleteCognitoGroup(this.id);
      await authzHelper.deleteGroupDdbRecord(this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of authorization group '${this.id}': ${error}.`);
    }
  }

  public async getGroupUsers(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/${this.id}/getUsers`);
  }
}
