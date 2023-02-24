/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosResponse } from 'axios';
import ClientSession from '../../clientSession';
import Resource from '../base/resource';
import EnvironmentTypes from '../environmentTypes/environmentTypes';
import SshKeys from '../sshKeys/sshKeys';

export default class Project extends Resource {
  private _clientSession: ClientSession;
  public constructor(id: string, clientSession: ClientSession, parentApi: string) {
    super(clientSession, 'project', id, parentApi);
    this._clientSession = clientSession;
  }

  public async assignUserToProject(
    userId: string,
    requestBody: Record<string, string>
  ): Promise<AxiosResponse> {
    return this._axiosInstance.post(`${this._api}/users/${userId}/relationships`, requestBody);
  }

  public async removeUserFromProject(userId: string): Promise<AxiosResponse> {
    return this._axiosInstance.delete(`${this._api}/users/${userId}/relationships`);
  }

  public async listUsersForProject(role: string): Promise<AxiosResponse> {
    return this._axiosInstance.get(`${this._api}/users`, { params: { role } });
  }

  public environmentTypes(): EnvironmentTypes {
    return new EnvironmentTypes(this._clientSession, this._api);
  }

  public sshKeys(): SshKeys {
    return new SshKeys(this._clientSession, this._api);
  }

  protected async cleanup(): Promise<void> {
    try {
      console.log(`Attempting to softDelete project ${this._id}.`);
      await this.delete();
    } catch (e) {
      console.warn(
        `Could not delete project ${this._id}". 
        Encountered error: ${e}`
      );
    }
  }
}
