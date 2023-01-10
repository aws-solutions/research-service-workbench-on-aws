/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { CognitoHelper } from '../../complex/cognitoHelper';
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

  public async getRoles(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/roles`);
  }

  public async cleanup(): Promise<void> {
    try {
      const userManagementHelper = new CognitoHelper();
      await userManagementHelper.deleteUser(this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of Cognito user '${this.id}': ${error}.`);
    }
  }
}
