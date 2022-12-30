/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { CognitoHelper } from '../../complex/cognitoHelper';
import Resource from '../base/resource';

export default class Role extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'role', id, parentApi);
  }

  public async addUser(requestBody: { userId: string }): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}`, requestBody);
  }

  public async cleanup(): Promise<void> {
    try {
      const userManagementHelper = new CognitoHelper();
      await userManagementHelper.deleteGroup(this.id);
    } catch (error) {
      console.warn(`Error caught in cleanup of Cognito role '${this.id}': ${error}.`);
    }
  }
}
