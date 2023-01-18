import { IdentityPermission } from '@aws/workbench-core-authorization';
import { AwsService } from '@aws/workbench-core-base';
import { authorizationGroupPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';
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
      .delete({ pk: `${authorizationGroupPrefix}#${groupId}`, sk: `${authorizationGroupPrefix}#${groupId}` })
      .execute();
  }

  public async deleteIdentityPermissionDdbRecord(identityPermission: IdentityPermission): Promise<void> {
    await this._awsSdk.helpers.ddb
      .delete({
        pk: `${identityPermission.subjectType}|${identityPermission.subjectId}`,
        sk: `${identityPermission.action}|${identityPermission.effect}|${identityPermission.identityType}|${identityPermission.identityId}`
      })
      .execute();
  }
}
