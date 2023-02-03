/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../../models/authenticatedUser';
import { IdentityPermission, IdentityPermissionParser } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteIdentityPermissionsRequestParser = z.object({
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUserParser,
  /**
   * An array of {@link IdentityPermission} to be deleted
   */
  identityPermissions: z.array(IdentityPermissionParser)
});

/**
 * Request object for DeleteIdentityPermissions
 */
export type DeleteIdentityPermissionsRequest = z.infer<typeof DeleteIdentityPermissionsRequestParser>;

/**
 * Response object for DeleteIdentityPermissions
 */
export interface DeleteIdentityPermissionsResponse {
  /**
   * The data object returned
   */
  data: {
    /**
     * An array of {@link IdentityPermission}s deleted
     */
    identityPermissions: IdentityPermission[];
  };
}
