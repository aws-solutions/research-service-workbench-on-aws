/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, CognitoTokenService, SecretsService } from '@aws/workbench-core-base';
import jwt_decode from 'jwt-decode';
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

  public async createRootUserSession(
    userPoolId: string,
    clientId: string,
    accountType?: 'USER' | 'ADMIN'
  ): Promise<ClientSession> {
    const rootUserNameParamStorePath = this._settings.get('rootUserNameParamStorePath');
    const rootPasswordParamStorePath = this._settings.get('rootPasswordParamStorePath');
    const awsRegion = this._settings.get('MainAccountRegion');

    const secretsService = new SecretsService(new AwsService({ region: awsRegion }).clients.ssm);
    const cognitoTokenService = new CognitoTokenService(awsRegion, secretsService);
    const { accessToken, refreshToken } = await cognitoTokenService.generateCognitoToken({
      userPoolId,
      clientId,
      rootUserNameParamStorePath,
      rootPasswordParamStorePath,
      accountType
    });

    const decodedToken: { sub: string } = jwt_decode(accessToken);
    this._settings.set('rootUserId', decodedToken.sub);

    const session = this._getClientSession(accessToken, refreshToken);
    this._sessions.push(session);

    return session;
  }

  public async createAdminSession(): Promise<ClientSession> {
    return this.createRootUserSession(
      this._settings.get('ExampleCognitoUserPoolId'),
      this._settings.get('ExampleCognitoIntegrationTestUserPoolClientId')
    );
  }

  public async getDefaultAdminSession(): Promise<ClientSession> {
    // TODO: Handle token expiration and getting defaultAdminSession instead of creating a new Admin Session
    if (this._defaultAdminSession === undefined) {
      this._defaultAdminSession = await this.createAdminSession();
    }
    return this._defaultAdminSession;
  }

  public getStackName(): string {
    return `ExampleStack`;
  }

  public getMainAwsClient(tableName?: keyof Setting): AwsService {
    return new AwsService({
      region: this._settings.get('MainAccountRegion'),
      ddbTableName: tableName ? this._settings.get(tableName) : undefined
    });
  }

  public async getHostAwsClient(sessionName: string, tableName?: keyof Setting): Promise<AwsService> {
    const mainAwsService = this.getMainAwsClient(tableName);
    const { Credentials } = await mainAwsService.clients.sts.assumeRole({
      RoleArn: this._settings.get('ExampleHostDatasetRoleOutput'),
      RoleSessionName: sessionName
    });

    if (!Credentials) {
      throw new Error('Invalid assumed role');
    }

    return new AwsService({
      region: this._settings.get('HostingAccountRegion'),
      credentials: {
        accessKeyId: Credentials.AccessKeyId!,
        secretAccessKey: Credentials.SecretAccessKey!,
        sessionToken: Credentials.SessionToken,
        expiration: Credentials.Expiration
      }
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

  private _getClientSession(accessToken?: string, refreshToken?: string): ClientSession {
    return new ClientSession(this, accessToken, refreshToken);
  }
}
