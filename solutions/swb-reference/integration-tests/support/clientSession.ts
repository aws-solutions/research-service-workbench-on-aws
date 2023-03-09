/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import axios, { AxiosError, AxiosInstance, AxiosResponse } from 'axios';
import Csrf from 'csrf';
import _ from 'lodash';
import { stringify } from 'qs';
import { getResources, Resources } from './resources';
import Setup from './setup';
import HttpError from './utils/HttpError';
import Settings from './utils/settings';

export default class ClientSession {
  private _settings: Settings;
  private _cleanupQueue: CleanupTask[];
  private _isAnonymousSession: boolean;
  private _axiosInstance: AxiosInstance;
  private _setup: Setup;
  private _userId?: string;
  public accessToken?: string;
  public resources: Resources;

  public constructor(setup: Setup, accessToken?: string, outputError?: boolean) {
    this._settings = setup.getSettings();
    this._setup = setup;
    this._isAnonymousSession = accessToken === undefined;
    this._cleanupQueue = [];

    const headers: {
      'Content-Type': string;
      Cookie?: string;
      'csrf-token'?: string;
    } = { 'Content-Type': 'application/json' };

    // For anonymous sessions, access token cookie is not required
    if (!this._isAnonymousSession) {
      this.accessToken = accessToken;
      const csrf = new Csrf();
      const secret = csrf.secretSync();
      const token = csrf.create(secret);
      headers.Cookie = `access_token=${accessToken};_csrf=${secret};`;
      headers['csrf-token'] = token;
      this._userId = this._getUserIdFromToken(accessToken ?? '');
    }

    this._axiosInstance = axios.create({
      baseURL: this._settings.get('apiUrlOutput'),
      timeout: 30000, // 30 seconds to mimic API gateway timeout
      headers
    });

    this._axiosInstance.interceptors.request.use((config) => {
      config.paramsSerializer = (params) => {
        return stringify(params);
      };

      return config;
    });

    // Convert AxiosError to HttpError for easier error checking in tests
    this._axiosInstance.interceptors.response.use(
      function (response: AxiosResponse) {
        return response;
      },
      function (error: AxiosError) {
        if (error.response) {
          if (outputError) {
            console.error(JSON.stringify(error));
          }
          const httpError = new HttpError(error.response.status, error.response.data);
          return Promise.reject(httpError);
        }
        return Promise.reject(error);
      }
    );
    this.resources = getResources(this);
  }

  public async cleanup(): Promise<void> {
    // We need to reverse the order of the queue before we execute the cleanup tasks
    const items = _.reverse(_.slice(this._cleanupQueue));

    for (const { task } of items) {
      try {
        await task();
      } catch (error) {
        console.error(error);
      }
    }

    this._cleanupQueue = []; // This way if the cleanup() method is called again, we don't need to cleanup again
  }

  // This is used by the Resource and CollectionResource base classes. You rarely need to use this method unless you
  // want to add your explicit cleanup task
  // @param {object} cleanupTask an object of shape { id, command = async fn() }
  public addCleanupTask(cleanupTask: CleanupTask): void {
    this._cleanupQueue.push(cleanupTask);
  }

  // Given the id of the cleanup task, remove it from the cleanup queue. If there is more than one task with the same
  // id in the queue, all of the tasks with the matching id will be removed.
  public removeCleanupTask(id: string): CleanupTask[] {
    return _.remove(this._cleanupQueue, ['id', id]);
  }

  public getAxiosInstance(): AxiosInstance {
    return this._axiosInstance;
  }

  public getSettings(): Settings {
    return this._settings;
  }

  public getSetup(): Setup {
    return this._setup;
  }

  public getUserId(): string | undefined {
    return this._userId;
  }

  private _getUserIdFromToken(accessToken: string): string {
    const mainPart = Buffer.from(accessToken.split('.')[1], 'base64').toString('binary');
    const parsed = JSON.parse(mainPart);

    return parsed.username;
  }
}

interface CleanupTask {
  id: string;
  // eslint-disable-next-line @typescript-eslint/ban-types
  task: Function;
}
