import { AwsService } from '@aws/workbench-core-base';
import Setup from '../setup';

export class DynamicAuthorizationHelper {
  private _awsSdk: AwsService;
  private _userPoolId: string;
  public constructor() {
    const setup = new Setup();
    this._awsSdk = setup.getMainAwsClient('ExampleDynamicAuthDDBTableName');
    this._userPoolId = setup.getSettings().get('ExampleCognitoUserPoolId');
  }

  public async deleteCognitoGroup(groupId: string): Promise<void> {
    await this._awsSdk.clients.cognito.deleteGroup({ GroupName: groupId, UserPoolId: this._userPoolId });
  }

  public async deleteGroupDdbRecord(groupId: string): Promise<void> {
    await this._awsSdk.helpers.ddb
      .delete({ pk: `EXAMPLE-GROUP#${groupId}`, sk: `EXAMPLE-GROUP#${groupId}` })
      .execute();
  }
}
