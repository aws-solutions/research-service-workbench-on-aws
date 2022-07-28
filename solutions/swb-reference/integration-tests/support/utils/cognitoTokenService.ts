import crypto from 'crypto';
import { AwsService } from '@amzn/workbench-core-base';

export default class CognitoTokenService {
  private _aws: AwsService;
  public constructor(awsRegion: string) {
    this._aws = new AwsService({ region: awsRegion });
  }

  public async generateCognitoToken(
    userPoolId: string,
    clientId: string,
    rootUsername: string,
    rootPasswordParamStorePath: string
  ): Promise<{
    accessToken: string;
    idToken: string;
    refreshToken: string;
  }> {
    const clientSecret = await this._getClientSecret(userPoolId, clientId);
    const secretHash = crypto
      .createHmac('SHA256', clientSecret)
      .update(rootUsername + clientId)
      .digest('base64');

    const password = await this._getSSMParamValue(rootPasswordParamStorePath);
    const response = await this._aws.clients.cognito.adminInitiateAuth({
      UserPoolId: userPoolId,
      ClientId: clientId,
      AuthFlow: 'ADMIN_NO_SRP_AUTH',
      AuthParameters: {
        USERNAME: rootUsername,
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

  private async _getSSMParamValue(ssmParamName: string): Promise<string> {
    const response = await this._aws.clients.ssm.getParameter({
      Name: ssmParamName,
      WithDecryption: true
    });

    return response.Parameter!.Value!;
  }

  private async _getClientSecret(userPoolId: string, clientId: string): Promise<string> {
    const response = await this._aws.clients.cognito.describeUserPoolClient({
      UserPoolId: userPoolId,
      ClientId: clientId
    });
    return response.UserPoolClient!.ClientSecret!;
  }
}
