import { Operation, Permission, AuthorizationPlugin } from '..';
import {
  mockAdminPermissions,
  mockGetOperations,
  mockGetRoleOperations,
  mockGuestPermissions,
  mockPutOperations
} from './mockPermissions';

export class MockAuthorizationPlugin implements AuthorizationPlugin {
  public async isAuthorized(userPermissions: Permission[], operations: Operation[]): Promise<void> {
    if (operations === mockPutOperations && userPermissions === mockAdminPermissions) {
      return;
    } else if (
      operations === mockGetOperations &&
      (userPermissions === mockAdminPermissions || userPermissions === mockGuestPermissions)
    ) {
      return;
    } else if (operations === mockGetRoleOperations && mockAdminPermissions === userPermissions) {
      return;
    }
    throw new Error('Permission is not granted');
  }
}
