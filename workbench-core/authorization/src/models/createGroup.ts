/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

/**
 * Request object for DynamicPermissionsPlugin's createGroup
 */

// eslint-disable-next-line @rushstack/typedef-var
export const CreateGroupRequestParser = z.object({
  /**
   * GroupID being created
   * GroupID must be unique
   */
  groupId: z.string(),

  /**
   * Description of group
   */
  description: z.string().optional()
});

export type CreateGroupRequest = z.infer<typeof CreateGroupRequestParser>;

/**
 * Response object for DynamicPermissionsPlugin's createGroup
 */
export interface CreateGroupResponse {
  /**
   * States whether the group was successfully created
   */
  created: boolean;
}
