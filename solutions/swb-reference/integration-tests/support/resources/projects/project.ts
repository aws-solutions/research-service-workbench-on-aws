/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';

export default class Project extends Resource {
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'project', id, parentApi);
  }

  public async assignUserToProject(
    userId: string,
    requestBody: Record<string, string>
  ): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/users/${userId}`, requestBody);
  }

  public async removeUserFromProject(userId: string): Promise<AxiosResponse> {
    return this._axiosInstance.delete(`${this._api}/users/${userId}`);
  }

  public async listUsersForProject(role: string): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/users/${role}`);
  }

  protected async cleanup(): Promise<void> {
    // TODO: add delete project once delete API is implemented
    await this._setup.getDefaultAdminSession();
  }
}
