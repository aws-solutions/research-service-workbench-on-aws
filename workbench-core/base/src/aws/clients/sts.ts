import {
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  AssumeRoleCommandOutput,
  STSClient,
  STSClientConfig
} from '@aws-sdk/client-sts';

export default class STS {
  private _client: STSClient;
  public constructor(config: STSClientConfig) {
    this._client = new STSClient(config);
  }

  public async assumeRole(params: AssumeRoleCommandInput): Promise<AssumeRoleCommandOutput> {
    return this._client.send(new AssumeRoleCommand(params));
  }
}
