import {
  AssumeRoleCommand,
  AssumeRoleCommandInput,
  AssumeRoleCommandOutput,
  STSClient
} from '@aws-sdk/client-sts';

export default class STS {
  private _client: STSClient;
  public constructor(options: { region: string }) {
    this._client = new STSClient({ ...options });
  }

  public async assumeRole(params: AssumeRoleCommandInput): Promise<AssumeRoleCommandOutput> {
    return this._client.send(new AssumeRoleCommand(params));
  }
}
