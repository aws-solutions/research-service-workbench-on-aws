/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser, HTTPMethod, Operation, Permission, PermissionsPlugin } from '..';
import { RoutesIgnored } from '../routesMap';
import {
  mockAdminPermissions,
  mockGetOperations,
  mockGuestPermissions,
  mockPutOperations
} from './mockPermissions';

export class MockPermissionsPlugin implements PermissionsPlugin {
  private _routesIgnored: RoutesIgnored = { '/login': { GET: true }, '/sample/*': { GET: true } };

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
  public async isRouteIgnored(route: string, method: HTTPMethod): Promise<boolean> {
    // eslint-disable-next-line security/detect-object-injection
    if (this._routesIgnored.hasOwnProperty(route) && this._routesIgnored[route][method]) {
      return true;
    }
    return false;
  }
}
