/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../../models/authenticatedUser';
import { IdentityPermission, IdentityPermissionParser } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateIdentityPermissionsRequestParser = z.object({
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUserParser,
  /**
   * An array of {@link IdentityPermission} to be created
   */
  identityPermissions: z.array(IdentityPermissionParser)
});

/**
 * Request object for CreateIdentityPermissions
 */
export type CreateIdentityPermissionsRequest = z.infer<typeof CreateIdentityPermissionsRequestParser>;

/**
 * Response object for CreateIdentityPermissions
 */
export interface CreateIdentityPermissionsResponse {
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
