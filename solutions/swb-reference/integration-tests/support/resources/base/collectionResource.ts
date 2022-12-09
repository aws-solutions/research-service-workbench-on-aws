/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '@aws/workbench-core-base/lib/types/json';
import { AxiosInstance, AxiosResponse } from 'axios';
import _ from 'lodash';
import ClientSession from '../../clientSession';
import Setup from '../../setup';
import Settings from '../../utils/settings';

export default class CollectionResource {
  private _type: string;
  private _childType: string;
  protected _axiosInstance: AxiosInstance;
  protected _clientSession: ClientSession;
  protected _settings: Settings;
  protected _parentApi: string;
  protected _api: string;
  protected _setup: Setup;

  public constructor(clientSession: ClientSession, type: string, childType: string, parentApi: string = '') {
    this._setup = clientSession.getSetup();
    this._clientSession = clientSession;
    this._axiosInstance = clientSession.getAxiosInstance();
    this._settings = clientSession.getSettings();
    this._type = type;
    this._childType = childType;
    this._parentApi = parentApi;
    this._api = '';
  }

  public async create(
    //eslint-disable-next-line @typescript-eslint/no-explicit-any
    body: any = {},
    applyDefault: boolean = true,
    parentId: string = ''
  ): Promise<AxiosResponse> {
    // Because of the cleanup logic, before we do the create, we need to ensure that the extender of this collection
    // resource class has a method that returns the resource operations helper for the child resource.
    // For example, if the extender class is 'Users' and it provides childType = 'user', then Users class must have
    // a method called 'user()'.
    // @ts-ignore
    if (!_.isFunction(this[this._childType])) {
      throw new Error(
        `The collection resource ['${this._type}'] must have a method named [${this._childType}()]`
      );
    }
    const prefix = parentId && this._parentApi ? this._parentApi.replace(':parentId', parentId) : '';

    const requestBody = applyDefault ? this._buildDefaults(body) : body;
    const response = await this._axiosInstance.post(`${prefix}${this._api}`, requestBody);
    const id = response.data.id;
    const taskId = `${this._childType}-${id}`;
    // @ts-ignore
    const resourceNode = this[this._childType](id);

    // We add a cleanup task to the cleanup queue for the session
    this._clientSession.addCleanupTask({ id: taskId, task: async () => resourceNode.cleanup() });

    return response;
  }

  // List call
  public async get(queryParams: Record<string, JSONValue>, parentId: string = ''): Promise<AxiosResponse> {
    const prefix = parentId && this._parentApi ? this._parentApi.replace(':parentId', parentId) : '';
    return this._axiosInstance.get(`${prefix}${this._api}`, { params: queryParams });
  }

  // This method should be overridden by the class extending `CollectionResource`
  // eslint-disable-next-line
  protected _buildDefaults(resource: any = {}): any {
    return resource;
  }
}
