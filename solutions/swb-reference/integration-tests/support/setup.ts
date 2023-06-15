/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, CognitoTokenService, SecretsService } from '@aws/workbench-core-base';
import jwt_decode from 'jwt-decode';
import _ from 'lodash';
import ClientSession from './clientSession';
import Settings from './utils/settings';

export default class Setup {
  private _settings: Settings;
  private _sessions: ClientSession[] = [];
  private _defaultAdminSession: ClientSession | undefined = undefined;

  private constructor() {
    // @ts-ignore
    this._settings = new Settings(global['__settings__']);

    jest.retryTimes(1);
  }

  public static getSetup(): Setup {
    return new Setup();
  }

  public async createAnonymousSession(outputError?: boolean): Promise<ClientSession> {
    const session = this._getClientSession(undefined, outputError);
    this._sessions.push(session);

    return session;
  }

  public async createAdminSession(): Promise<ClientSession> {
    throw new Error('Implement createAdminSession');
  }

  public async getDefaultAdminSession(outputError?: boolean): Promise<ClientSession> {
    if (this._defaultAdminSession) {
      const decodedIdToken = jwt_decode(this._defaultAdminSession.accessToken as string);
      const expiresAt = _.get(decodedIdToken, 'exp', 0) * 1000;

      // Assume the default admin session is shared between all test cases in a given test suite (ie. test file),
      // so it has to stay active throughout the test suite duration.
      // Therefore the buffer time (in minutes) should be the longest time taken by any single test suite
      // If the current token has less than the buffer minutes remaining, we create a new one.
      const bufferInMinutes = 25;
      const tokenExpired = (expiresAt - Date.now()) / 60 / 1000 < bufferInMinutes;
      if (!tokenExpired) {
        return this._defaultAdminSession;
      }
    }
    const userPoolId = this._settings.get('cognitoUserPoolId');
    const clientId = this._settings.get('cognitoProgrammaticAccessUserPoolClientId');
    const rootUserNameParamStorePath = this._settings.get('rootUserNameParamStorePath');
    const rootPasswordParamStorePath = this._settings.get('rootPasswordParamStorePath');
    const awsRegion = this._settings.get('awsRegion');
    const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);

    await this._loadSecrets(secretsService);

    const cognitoTokenService = new CognitoTokenService(awsRegion, secretsService);
    const { accessToken } = await cognitoTokenService.generateCognitoToken({
      userPoolId,
      clientId,
      rootUserNameParamStorePath,
      rootPasswordParamStorePath
    });

    const session = this._getClientSession(accessToken, outputError);
    this._sessions.push(session);
    this._defaultAdminSession = session;
    return this._defaultAdminSession;
  }

  public async getSessionForUserType(
    userType: 'projectAdmin1' | 'projectAdmin2' | 'researcher1',
    outputError?: boolean
  ): Promise<ClientSession> {
    const userNameParamStorePath = this._settings.get(`${userType}UserNameParamStorePath`);
    const userPasswordParamStorePath = this._settings.get(`${userType}PasswordParamStorePath`);
    const awsRegion = this._settings.get('awsRegion');
    const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);

    const userName = await secretsService.getSecret(userNameParamStorePath);
    const password = await secretsService.getSecret(userPasswordParamStorePath);
    return this.getSessionForUser(userName, password, outputError);
  }

  public async getSessionForUser(
    userName: string,
    password: string,
    outputError?: boolean
  ): Promise<ClientSession> {
    const accessToken = await this._getCognitoTokenForUser(userName, password);
    const session = this._getClientSession(accessToken, outputError);
    this._sessions.push(session);
    return session;
  }

  private async _getCognitoTokenForUser(userName: string, password: string): Promise<string> {
    const userPoolId = this._settings.get('cognitoUserPoolId');
    const clientId = this._settings.get('cognitoProgrammaticAccessUserPoolClientId');
    const awsRegion = this._settings.get('awsRegion');
    const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);

    await this._loadSecrets(secretsService);

    const cognitoTokenService = new CognitoTokenService(awsRegion, secretsService);
    const { accessToken } = await cognitoTokenService.generateCognitoTokenWithCredentials(
      userPoolId,
      clientId,
      userName,
      password,
      'USER'
    );

    return accessToken;
  }

  public getStackName(): string {
    return `rsw-${process.env.STAGE}-${this._settings.get('awsRegionShortName')}`;
  }

  public getMainAwsClient(): AwsService {
    return new AwsService({
      region: this._settings.get('awsRegion'),
      ddbTableName: this.getStackName() // table name is same as stack name
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

  private _getClientSession(accessToken?: string, outputError?: boolean): ClientSession {
    return new ClientSession(this, accessToken, outputError);
  }

  private async _loadSecrets(secretsService: SecretsService): Promise<void> {
    if (this._settings.optional('awsAccountIdParamStorePath', undefined) === undefined) {
      return;
    }
    const [awsAccountId] = await Promise.all([
      secretsService.getSecret(this._settings.get('awsAccountIdParamStorePath'))
    ]);

    this._settings.set('awsAccountId', awsAccountId);
  }
}
