/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { ActionParser } from '../../models/action';
import { IdentityParser, IdentityPermission } from './identityPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const GetIdentityPermissionsBySubjectRequestParser = z.object({
  /**
   * SubjectType associated to the {@link IdentityPermission}s
   */
  subjectType: z.string(),
  /**
   * Subject id associated to the subject
   */
  subjectId: z.string(),
  /**
   * Filter by {@link Action}
   */
  action: ActionParser.optional(),
  /**
   * Filter by identities
   */
  identities: z.array(IdentityParser).optional(),
  /**
   * Limit on number of identity permissions returned
   */
  limit: z.number().optional(),
  /**
   * Pagination token to retrieve the next set of results
   */
  paginationToken: z.string().optional()
});
/**
 * Request object for GetIdentityPermissionsBySubject
 */
export type GetIdentityPermissionsBySubjectRequest = z.infer<
  typeof GetIdentityPermissionsBySubjectRequestParser
>;

/**
 * Response object for GetIdentityPermissionsBySubject
 */
export interface GetIdentityPermissionsBySubjectResponse {
  data: {
    /**
     * An array of {@link IdentityPermission} associated to the subject
     */
    identityPermissions: IdentityPermission[];
  };
  paginationToken?: string;
}
