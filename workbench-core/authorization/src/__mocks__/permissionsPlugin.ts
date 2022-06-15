import { AuthenticatedUser, HTTPMethod, Operation, Permission, PermissionsPlugin } from '..';
import {
  mockAdminPermissions,
  mockGetOperations,
  mockGuestPermissions,
  mockPutOperations
} from './mockPermissions';

export class MockPermissionsPlugin implements PermissionsPlugin {
  public async getPermissionsByUser(user: AuthenticatedUser): Promise<Permission[]> {
    if (user.roles.includes('admin')) {
      return mockAdminPermissions;
    } else {
      return mockGuestPermissions;
    }
  }
  public async getOperationsByRoute(route: string, method: HTTPMethod): Promise<Operation[]> {
    if (route === '/sample') {
      if (method === 'GET') return mockGetOperations;
      else if (method === 'PUT') return mockPutOperations;
    }
    throw new Error('Route not secured');
  }
}
