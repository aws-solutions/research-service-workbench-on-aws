/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../../models/authenticatedUser';
import { IdentityPermission } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteSubjectIdentityPermissionsRequestParser = z.object({
  /**
   * {@link AuthenticatedUser}
   */
  authenticatedUser: AuthenticatedUserParser,
  /**
   * SubjectType associated to the {@link IdentityPermission}s
   */
  subjectType: z.string(),
  /**
   * Subject id associated to the subject
   */
  subjectId: z.string()
});

/**
 * Request object for DeleteSubjectIdentityPermissions
 */
export type DeleteSubjectIdentityPermissionsRequest = z.infer<
  typeof DeleteSubjectIdentityPermissionsRequestParser
>;

/**
 * Response object for DeleteIdentityPermissions
 */
export interface DeleteSubjectIdentityPermissionsResponse {
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
