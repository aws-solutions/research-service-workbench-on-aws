'use strict';
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
var __importDefault =
  (this && this.__importDefault) ||
  function (mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
Object.defineProperty(exports, '__esModule', { value: true });
const workbench_core_base_1 = require('@aws/workbench-core-base');
const lodash_1 = __importDefault(require('lodash'));
const clientSession_1 = __importDefault(require('./clientSession'));
const settings_1 = __importDefault(require('./utils/settings'));
class Setup {
  constructor() {
    this._sessions = [];
    this._defaultAdminSession = undefined;
    // @ts-ignore
    this._settings = new settings_1.default(global['__settings__']);
    // Let's not setup test retries until we find that we actually need it
    jest.retryTimes(0);
  }
  async createAnonymousSession() {
    const session = this._getClientSession();
    this._sessions.push(session);
    return session;
  }
  async createAdminSession() {
    throw new Error('Implement createAdminSession');
  }
  async getDefaultAdminSession() {
    // TODO: Handle token expiration and getting defaultAdminSession instead of creating a new Admin Session
    if (this._defaultAdminSession === undefined) {
      const userPoolId = this._settings.get('ExampleCognitoUserPoolId');
      const clientId = this._settings.get('ExampleCognitoUserPoolClientId');
      const rootUserNameParamStorePath = this._settings.get('rootUserNameParamStorePath');
      const rootPasswordParamStorePath = this._settings.get('rootPasswordParamStorePath');
      const awsRegion = this._settings.get('AwsRegion');
      const cognitoTokenService = new workbench_core_base_1.CognitoTokenService(awsRegion);
      const { accessToken } = await cognitoTokenService.generateCognitoToken({
        userPoolId,
        clientId,
        rootUserNameParamStorePath,
        rootPasswordParamStorePath
      });
      const session = this._getClientSession(accessToken);
      this._sessions.push(session);
      this._defaultAdminSession = session;
    }
    return this._defaultAdminSession;
  }
  getStackName() {
    return `ExampleStack`;
  }
  getMainAwsClient() {
    return new workbench_core_base_1.AwsService({
      region: this._settings.get('AwsRegion'),
      ddbTableName: this.getStackName() // table name is same as stack name
    });
  }
  async cleanup() {
    // We need to reverse the order of the queue before we cleanup the sessions
    const sessions = lodash_1.default.reverse(lodash_1.default.slice(this._sessions));
    for (const session of sessions) {
      try {
        await session.cleanup();
      } catch (error) {
        console.error(error);
      }
    }
    this._sessions = []; // This way if the cleanup() method is called again, we don't need to cleanup again
  }
  getSettings() {
    return this._settings;
  }
  _getClientSession(accessToken) {
    return new clientSession_1.default(this, accessToken);
  }
}
exports.default = Setup;
//# sourceMappingURL=setup.js.map
