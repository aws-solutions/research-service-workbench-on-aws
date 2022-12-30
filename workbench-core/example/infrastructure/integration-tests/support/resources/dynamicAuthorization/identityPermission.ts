import { IdentityPermission as Permission } from '@aws/workbench-core-authorization';
import ClientSession from '../../clientSession';
import { DynamicAuthorizationHelper } from '../../complex/dynamicAuthorizationHelper';
import Resource from '../base/resource';

export default class IdentityPermission extends Resource {
  private _identityPermission: Permission;
  public constructor(
    identityPermission: Permission,
    clientSession: ClientSession,
    parentApi: string,
    id: string
  ) {
    super(clientSession, 'identityPermission', id, parentApi);
    this._identityPermission = identityPermission;
  }

  public async cleanup(): Promise<void> {
    try {
      const dynamicAuthorizationHelper = new DynamicAuthorizationHelper();
      await dynamicAuthorizationHelper.deleteIdentityPermissionDdbRecord(this._identityPermission);
    } catch (error) {
      console.warn(`Error caught in cleanup of authorization identity permission '${this.id}': ${error}.`);
    }
  }
}
