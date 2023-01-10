/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateGroupRequestParser = z
  .object({
    /**
     * GroupID being created
     * GroupID must be unique
     */
    groupId: z.string(),

    /**
     * Description of group
     */
    description: z.string().optional()
  })
  .strict();

export type CreateGroupRequest = z.infer<typeof CreateGroupRequestParser>;
