/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, CognitoTokenService, SecretsService } from '@aws/workbench-core-base';
import _ from 'lodash';
import ClientSession from './clientSession';
import Settings, { Setting } from './utils/settings';

export default class Setup {
  private _settings: Settings;
  private _sessions: ClientSession[] = [];
  private _defaultAdminSession: ClientSession | undefined = undefined;

  public constructor() {
    // @ts-ignore
    this._settings = new Settings(global['__settings__']);

    // Let's not setup test retries until we find that we actually need it
    jest.retryTimes(0);
  }

  public async createAnonymousSession(): Promise<ClientSession> {
    const session = this._getClientSession();
    this._sessions.push(session);

    return session;
  }

  public async createAdminSession(): Promise<ClientSession> {
    throw new Error('Implement createAdminSession');
  }

  public async getDefaultAdminSession(): Promise<ClientSession> {
    // TODO: Handle token expiration and getting defaultAdminSession instead of creating a new Admin Session
    if (this._defaultAdminSession === undefined) {
      const userPoolId = this._settings.get('ExampleCognitoUserPoolId');
      const clientId = this._settings.get('ExampleCognitoUserPoolClientId');
      const rootUserNameParamStorePath = this._settings.get('rootUserNameParamStorePath');
      const rootPasswordParamStorePath = this._settings.get('rootPasswordParamStorePath');
      const awsRegion = this._settings.get('AwsRegion');

      const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);
      const cognitoTokenService = new CognitoTokenService(awsRegion, secretsService);
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

  public getStackName(): string {
    return `ExampleStack`;
  }

  public getMainAwsClient(tableName: keyof Setting): AwsService {
    return new AwsService({
      region: this._settings.get('AwsRegion'),
      ddbTableName: this._settings.get(tableName)
    });
  }

  public async cleanup(): Promise<void> {
    // We need to reverse the order of the queue before we cleanup the sessions
    const sessions = _.reverse(_.slice(this._sessions));

    for (const session of sessions) {
      try {
        await session.cleanup();
      } catch (error) {
        console.error(error);
      }
    }

    this._sessions = []; // This way if the cleanup() method is called again, we don't need to cleanup again
  }

  public getSettings(): Settings {
    return this._settings;
  }

  private _getClientSession(accessToken?: string): ClientSession {
    return new ClientSession(this, accessToken);
  }
}
