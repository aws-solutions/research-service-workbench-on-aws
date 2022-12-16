/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var

export const AssignUserToGroupRequestParser = z
  .object({
    /**
     * User id associated to user to be assigned to group
     */
    userId: z.string(),
    /**
     * Group id associated to the group the user is being assigned to
     */
    groupId: z.string()
  })
  .strict();

/**
 * Request object for DynamicPermissionsPlugin's assignUserToGroup
 */
export type AssignUserToGroupRequest = z.infer<typeof AssignUserToGroupRequestParser>;

/**
 * Response object for DynamicPermissionsPlugin's assignUserToGroup
 */
export interface AssignUserToGroupResponse {
  /**
   * States whether the user was successfully assigned to the group
   */
  assigned: boolean;
}
