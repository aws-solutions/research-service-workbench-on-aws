/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import crypto from 'crypto';
import AwsService from './aws/awsService';
import { SecretsServiceInterface } from './services/secretsService';

export default class CognitoTokenService {
  private _aws: AwsService;
  private _secretsService: SecretsServiceInterface;

  public constructor(awsRegion: string, secretsService: SecretsServiceInterface) {
    this._aws = new AwsService({ region: awsRegion });
    this._secretsService = secretsService;
  }

  public async generateCognitoToken(params: {
    userPoolId: string;
    clientId: string;
    rootUserName?: string;
    rootPassword?: string;
    rootUserNameParamStorePath?: string;
    rootPasswordParamStorePath?: string;
  }): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }> {
    const {
      userPoolId,
      clientId,
      rootUserName,
      rootPassword,
      rootUserNameParamStorePath,
      rootPasswordParamStorePath
    } = params;
    let password: string = rootPassword || '';
    if (rootPasswordParamStorePath && rootPassword) {
      throw new Error(
        'Both "rootPasswordParamStorePath" and "rootPassword" are defined. Please pass in only one of the two parameters.'
      );
    } else if (rootPasswordParamStorePath === undefined && rootPassword === undefined) {
      throw new Error('Either "rootPasswordParamStorePath" or "rootPassword" should be defined');
    } else if (rootPasswordParamStorePath) {
      password = await this._secretsService.getSecret(rootPasswordParamStorePath);
    }
    let userName: string = rootUserName || '';
    if (rootUserNameParamStorePath && rootUserName) {
      throw new Error(
        'Both "rootUserNameParamStorePath" and "rootUserName" are defined. Please pass in only one of the two parameters.'
      );
    } else if (rootUserNameParamStorePath === undefined && rootUserName === undefined) {
      throw new Error('Either "rootUserNameParamStorePath" or "rootUserName" should be defined');
    } else if (rootUserNameParamStorePath) {
      userName = await this._secretsService.getSecret(rootUserNameParamStorePath);
    }
    let userName: string = rootUserName || '';
    if (rootUserNameParamStorePath && rootUserName) {
      throw new Error(
        'Both "rootUserNameParamStorePath" and "rootUserName" are defined. Please pass in only one of the two parameters.'
      );
    } else if (rootUserNameParamStorePath === undefined && rootUserName === undefined) {
      throw new Error('Either "rootUserNameParamStorePath" or "rootUserName" should be defined');
    } else if (rootUserNameParamStorePath) {
      userName = await this._getSSMParamValue(rootUserNameParamStorePath);
    }

    const clientSecret = await this._getClientSecret(userPoolId, clientId);
    const secretHash = crypto
      .createHmac('SHA256', clientSecret)
      .update(userName + clientId)
      .digest('base64');

    const response = await this._aws.clients.cognito.adminInitiateAuth({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: userName,
        PASSWORD: password,
        SECRET_HASH: secretHash
      }
    });

    return {
      accessToken: response.AuthenticationResult!.AccessToken!,
      refreshToken: response.AuthenticationResult!.RefreshToken!,
      idToken: response.AuthenticationResult!.IdToken!
    };
  }

  private async _getClientSecret(userPoolId: string, clientId: string): Promise<string> {
    const response = await this._aws.clients.cognito.describeUserPoolClient({
      UserPoolId: userPoolId,
      ClientId: clientId
    });
    return response.UserPoolClient!.ClientSecret!;
  }
}
