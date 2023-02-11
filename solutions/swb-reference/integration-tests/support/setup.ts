/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService, CognitoTokenService, SecretsService } from '@aws/workbench-core-base';
import _ from 'lodash';
import ClientSession from './clientSession';
import Settings from './utils/settings';

export default class Setup {
  private _settings: Settings;
  private _sessions: ClientSession[] = [];
  private _defaultAdminSession: ClientSession | undefined = undefined;

  public constructor() {
    // @ts-ignore
    this._settings = new Settings(global['__settings__']);

    jest.retryTimes(1);
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
      const userPoolId = this._settings.get('cognitoUserPoolId');
      const clientId = this._settings.get('cognitoUserPoolClientId');
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

      const session = this._getClientSession(accessToken);
      this._sessions.push(session);
      this._defaultAdminSession = session;
    }
    return this._defaultAdminSession;
  }

  public getStackName(): string {
    return `swb-${process.env.STAGE}-${this._settings.get('awsRegionShortName')}`;
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

  private _getClientSession(accessToken?: string): ClientSession {
    return new ClientSession(this, accessToken);
  }

  private async _loadSecrets(secretsService: SecretsService): Promise<void> {
    const [hostAwsAccountId, hostingAccountHandlerRoleArn, envMgmtRoleArn, encryptionKeyArn] =
      await Promise.all([
        secretsService.getSecret(this._settings.get('hostAwsAccountIdParamStorePath')),
        secretsService.getSecret(this._settings.get('hostingAccountHandlerRoleArnParamStorePath')),
        secretsService.getSecret(this._settings.get('envMgmtRoleArnParamStorePath')),
        secretsService.getSecret(this._settings.get('encryptionKeyArnParamStorePath'))
      ]);

    this._settings.set('hostAwsAccountId', hostAwsAccountId);
    this._settings.set('hostingAccountHandlerRoleArn', hostingAccountHandlerRoleArn);
    this._settings.set('envMgmtRoleArn', envMgmtRoleArn);
    this._settings.set('encryptionKeyArn', encryptionKeyArn);
  }
}
