/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const RemoveUserFromGroupRequestParser = z
  .object({
    /**
     * User id associated to user to be removed from the group
     */
    userId: z.string(),
    /**
     * Group id associated to the group the user is being removed from
     */
    groupId: z.string()
  })
  .strict();

export type RemoveUserFromGroupRequest = z.infer<typeof RemoveUserFromGroupRequestParser>;
