import {
  AdminCreateUserCommand,
  AdminCreateUserCommandInput,
  AdminCreateUserCommandOutput,
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  CreateUserPoolCommandInput,
  CreateUserPoolCommandOutput,
  ListUserPoolsCommand,
  ListUserPoolsCommandInput,
  ListUserPoolsCommandOutput,
  ListUsersCommand,
  ListUsersCommandInput,
  ListUsersCommandOutput
} from '@aws-sdk/client-cognito-identity-provider';

/**
 * [Documentation for client and methods](https://docs.aws.amazon.com/AWSJavaScriptSDK/v3/latest/clients/client-cognito-identity-provider/index.html)
 */
export default class Cognito {
  private _client: CognitoIdentityProviderClient;

  public constructor(options: { region: string }) {
    this._client = new CognitoIdentityProviderClient({ ...options });
  }

  public async createUserPool(params: CreateUserPoolCommandInput): Promise<CreateUserPoolCommandOutput> {
    return this._client.send(new CreateUserPoolCommand(params));
  }

  public async adminCreateUser(params: AdminCreateUserCommandInput): Promise<AdminCreateUserCommandOutput> {
    return this._client.send(new AdminCreateUserCommand(params));
  }

  public async listUserPools(params: ListUserPoolsCommandInput): Promise<ListUserPoolsCommandOutput> {
    return this._client.send(new ListUserPoolsCommand(params));
  }

  public async listUsers(params: ListUsersCommandInput): Promise<ListUsersCommandOutput> {
    return this._client.send(new ListUsersCommand(params));
  }
}
