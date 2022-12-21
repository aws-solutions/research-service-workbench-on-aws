/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUser } from '../../authenticatedUser';
import { IdentityPermission } from './identityPermission';

/**
 * Request object for DeleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsRequest {
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUser;
  /**
   * An array of {@link IdentityPermission} to be deleted
   */
  identityPermissions: IdentityPermission[];
}

/**
 * Response object for DeleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsResponse {
  /**
   * States whether the {@link IdentityPermission}s were successfully deleted
   */
  deleted: boolean;
}
