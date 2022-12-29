/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AddUserToGroupRequestParser = z
  .object({
    /**
     * User id associated to user to be added to the group
     */
    userId: z.string(),
    /**
     * Group id associated to the group the user is being added to
     */
    groupId: z.string()
  })
  .strict();

export type AddUserToGroupRequest = z.infer<typeof AddUserToGroupRequestParser>;
