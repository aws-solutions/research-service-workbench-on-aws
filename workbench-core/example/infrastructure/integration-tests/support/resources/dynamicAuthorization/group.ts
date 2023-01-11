/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import { DynamicAuthorizationHelper } from '../../complex/dynamicAuthorizationHelper';
import Resource from '../base/resource';

export default class Group extends Resource {
  private readonly _clientSession: ClientSession;
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'group', id, parentApi);
    this._clientSession = clientSession;
  }

  public addUser(body: AddUserToGroupRequest): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/add-user`, body);
  }

  public removeUser(body: RemoveUserFromGroupRequest): Promise<AxiosResponse> {
    return this._axiosInstance.put(`${this._api}/remove-user`, body);
  }

  public async getGroupUsers(): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/get-users`);
  }

  public async isUserAssigned(userId: string): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/is-user-assigned/${userId}`);
  }

  public async delete(): Promise<void> {
    await super.delete();
    this._clientSession.removeCleanupTask(`group-${this.id}`);
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
}

export interface AddUserToGroupRequest {
  userId: string;
}

export interface RemoveUserFromGroupRequest {
  userId: string;
}
