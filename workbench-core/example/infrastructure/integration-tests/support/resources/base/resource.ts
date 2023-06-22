/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AxiosInstance, AxiosResponse } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';

export default class Resource {
  private _type: string;
  private _parentApi: string;
  protected _settings: Settings;
  protected _axiosInstance: AxiosInstance;
  protected _api: string = '';
  protected _setup: Setup;
  protected _clientSession: ClientSession;
  public id: string;

  public constructor(clientSession: ClientSession, type: string, id: string, parentApi: string) {
    this._clientSession = clientSession;
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._setup = clientSession.getSetup();
    this._type = type;
    this.id = id;
    this._parentApi = parentApi;

    // Most child resources have standard api patterns: /api/<parent resource type>/{id}
    // But we can only assume this if both the 'id' and 'parentApi' are provided. In addition,
    // the extending class can simply choose to construct their own specialized api path
    // and do so in their own constructor functions.
    if (!_.isEmpty(id) && !_.isEmpty(parentApi)) {
      this._api = `${parentApi}/${id}`;
    }
  }

  public async get(): Promise<AxiosResponse> {
    return this._axiosInstance.get(this._api);
  }

  public async update(body: Record<string, string>): Promise<AxiosResponse> {
    return this._axiosInstance.put(this._api, body);
  }

  public async delete(): Promise<AxiosResponse> {
    const response = await this._axiosInstance.delete(this._api);
    this._clientSession.removeCleanupTask(`${this._type}-${this.id}`);

    return response;
  }

  // This method should be overridden by the class extending `resource`
  /**
   * Delete any resource that was created
   */
  public async cleanup(): Promise<void> {}
}
