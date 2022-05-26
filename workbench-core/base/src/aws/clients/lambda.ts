import {
  LambdaClient,
  AddPermissionCommand,
  AddPermissionCommandInput,
  AddPermissionCommandOutput,
  LambdaClientConfig,
  GetPolicyCommand,
  GetPolicyCommandInput,
  GetPolicyCommandOutput
} from '@aws-sdk/client-lambda';

export default class Lambda {
  private _client: LambdaClient;
  public constructor(config: LambdaClientConfig) {
    this._client = new LambdaClient(config);
  }

  public async addPermission(params: AddPermissionCommandInput): Promise<AddPermissionCommandOutput> {
    return this._client.send(new AddPermissionCommand(params));
  }

  public async getPolicy(params: GetPolicyCommandInput): Promise<GetPolicyCommandOutput> {
    return this._client.send(new GetPolicyCommand(params));
  }
}
