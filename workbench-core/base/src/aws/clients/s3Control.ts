import {
  CreateAccessPointCommand,
  CreateAccessPointCommandInput,
  CreateAccessPointCommandOutput,
  DeleteAccessPointCommand,
  DeleteAccessPointCommandInput,
  DeleteAccessPointCommandOutput,
  DeleteAccessPointPolicyCommand,
  DeleteAccessPointPolicyCommandInput,
  DeleteAccessPointPolicyCommandOutput,
  GetAccessPointCommand,
  GetAccessPointCommandInput,
  GetAccessPointCommandOutput,
  GetAccessPointPolicyCommand,
  GetAccessPointPolicyCommandInput,
  GetAccessPointPolicyCommandOutput,
  ListAccessPointsCommand,
  ListAccessPointsCommandInput,
  ListAccessPointsCommandOutput,
  PutAccessPointPolicyCommand,
  PutAccessPointPolicyCommandInput,
  PutAccessPointPolicyCommandOutput,
  S3ControlClient,
  S3ControlClientConfig
} from '@aws-sdk/client-s3-control';

// Documentation for client and methods
// https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-s3-Control/index.html

// A wrapper class around S3-Control-Client operations.
export default class S3Control {
  private _client: S3ControlClient;

  public constructor(config: S3ControlClientConfig) {
    this._client = new S3ControlClient(config);
  }

  public async createAccessPoint(
    params: CreateAccessPointCommandInput
  ): Promise<CreateAccessPointCommandOutput> {
    return await this._client.send(new CreateAccessPointCommand(params));
  }

  public async deleteAccessPoint(
    params: DeleteAccessPointCommandInput
  ): Promise<DeleteAccessPointCommandOutput> {
    return await this._client.send(new DeleteAccessPointCommand(params));
  }

  public async deleteAccessPointPolicy(
    params: DeleteAccessPointPolicyCommandInput
  ): Promise<DeleteAccessPointPolicyCommandOutput> {
    return await this._client.send(new DeleteAccessPointPolicyCommand(params));
  }

  public async getAccessPoint(params: GetAccessPointCommandInput): Promise<GetAccessPointCommandOutput> {
    return await this._client.send(new GetAccessPointCommand(params));
  }

  public async getAccessPointPolicy(
    params: GetAccessPointPolicyCommandInput
  ): Promise<GetAccessPointPolicyCommandOutput> {
    return await this._client.send(new GetAccessPointPolicyCommand(params));
  }

  public async listAccessPoints(
    params: ListAccessPointsCommandInput
  ): Promise<ListAccessPointsCommandOutput> {
    return await this._client.send(new ListAccessPointsCommand(params));
  }

  public async putAccessPointPolicy(
    params: PutAccessPointPolicyCommandInput
  ): Promise<PutAccessPointPolicyCommandOutput> {
    return await this._client.send(new PutAccessPointPolicyCommand(params));
  }
}
