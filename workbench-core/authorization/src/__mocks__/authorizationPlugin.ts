/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Operation, Permission, AuthorizationPlugin } from '..';
import {
  mockAdminPermissions,
  mockGetOperations,
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
    }
    throw new Error('Permission is not granted');
  }
}
