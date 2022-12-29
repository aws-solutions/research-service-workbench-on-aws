/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * Request object for DynamicPermissionsPlugin's getUsersFromGroup
 */
// eslint-disable-next-line @rushstack/typedef-var
export const GetUsersFromGroupRequestParser = z
  .object({
    /**
     * Group id required for retrieval of users
     */
    groupId: z.string()
  })
  .strict();

export type GetUsersFromGroupRequest = z.infer<typeof GetUsersFromGroupRequestParser>;
/**
 * Response object for DynamicPermissionsPlugin's getUsersFromGroup
 */
export interface GetUsersFromGroupResponse {
  /**
   * A list of user ids associated to the group
   */
  userIds: string[];
}
