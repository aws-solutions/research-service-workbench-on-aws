import { AwsService } from '@aws/workbench-core-base';
import Setup from '../setup';

export class CognitoHelper {
  private _awsSdk: AwsService;
  private _userPoolId: string;
  public constructor() {
    const setup = new Setup();
    this._awsSdk = setup.getMainAwsClient();
    this._userPoolId = setup.getSettings().get('ExampleCognitoUserPoolId');
  }

  public async deleteGroup(groupId: string): Promise<void> {
    await this._awsSdk.clients.cognito.deleteGroup({ GroupName: groupId, UserPoolId: this._userPoolId });
  }

  public async deleteUser(userId: string): Promise<void> {
    await this._awsSdk.clients.cognito.adminDeleteUser({ Username: userId, UserPoolId: this._userPoolId });
  }
}
