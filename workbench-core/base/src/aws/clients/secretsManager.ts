import {
  GetSecretValueCommand,
  PutSecretValueCommand,
  SecretsManagerClient,
  PutSecretValueCommandOutput,
  SecretsManagerClientConfig,
  GetSecretValueCommandOutput
} from '@aws-sdk/client-secrets-manager';

export default class SecretsManager {
  private _client: SecretsManagerClient;
  public constructor(config: SecretsManagerClientConfig) {
    this._client = new SecretsManagerClient(config);
  }

  public getSecret(secretArn: string): Promise<GetSecretValueCommandOutput> {
    return this._client.send(new GetSecretValueCommand({ SecretId: secretArn }));
  }

  public putSecret(secretArn: string, secret: string): Promise<PutSecretValueCommandOutput> {
    return this._client.send(new PutSecretValueCommand({ SecretId: secretArn, SecretString: secret }));
  }
}
