/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * Request object for DynamicPermissionsPlugin's getUserGroups
 */

// eslint-disable-next-line @rushstack/typedef-var
export const GetUserGroupsRequestParser = z
  .object({
    /**
     * User id required for retrieval of groups
     */
    userId: z.string()
  })
  .strict();

export type GetUserGroupsRequest = z.infer<typeof GetUserGroupsRequestParser>;

/**
 * Response object for DynamicPermissionsPlugin's getUserGroups
 */
export interface GetUserGroupsResponse {
  /**
   * A list of group ids associated to the user
   */
  groupIds: string[];
}
