'use strict';
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
const axios_1 = __importDefault(require('axios'));
const csrf_1 = __importDefault(require('csrf'));
const lodash_1 = __importDefault(require('lodash'));
const resources_1 = require('./resources');
const HttpError_1 = __importDefault(require('./utils/HttpError'));
class ClientSession {
  constructor(setup, accessToken) {
    this._settings = setup.getSettings();
    this._setup = setup;
    this._isAnonymousSession = accessToken === undefined;
    this._cleanupQueue = [];
    const headers = { 'Content-Type': 'application/json' };
    // For anonymous sessions, access token cookie is not required
    if (!this._isAnonymousSession) {
      const csrf = new csrf_1.default();
      const secret = csrf.secretSync();
      const token = csrf.create(secret);
      headers.Cookie = `access_token=${accessToken};_csrf=${secret};`;
      headers['csrf-token'] = token;
    }
    this._axiosInstance = axios_1.default.create({
      baseURL: this._settings.get('ExampleAPIEndpoint'),
      timeout: 30000,
      headers
    });
    // Convert AxiosError to HttpError for easier error checking in tests
    this._axiosInstance.interceptors.response.use(
      function (response) {
        return response;
      },
      function (error) {
        if (error.response) {
          return Promise.reject(new HttpError_1.default(error.response.status, error.response.data));
        }
        return Promise.reject(error);
      }
    );
    this.resources = (0, resources_1.getResources)(this);
  }
  async cleanup() {
    // We need to reverse the order of the queue before we execute the cleanup tasks
    const items = lodash_1.default.reverse(lodash_1.default.slice(this._cleanupQueue));
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
  addCleanupTask(cleanupTask) {
    this._cleanupQueue.push(cleanupTask);
  }
  // Given the id of the cleanup task, remove it from the cleanup queue. If there is more than one task with the same
  // id in the queue, all of the tasks with the matching id will be removed.
  removeCleanupTask(id) {
    return lodash_1.default.remove(this._cleanupQueue, ['id', id]);
  }
  getAxiosInstance() {
    return this._axiosInstance;
  }
  getSettings() {
    return this._settings;
  }
  getSetup() {
    return this._setup;
  }
}
exports.default = ClientSession;
//# sourceMappingURL=clientSession.js.map
