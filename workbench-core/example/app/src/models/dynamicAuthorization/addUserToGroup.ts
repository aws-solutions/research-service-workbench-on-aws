/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AddUserToGroupRequestParser = z
  .object({
    /**
     * User id associated to user to be added to the group
     */
    userId: z.string().userId().required()
  })
  .strict();

export type AddUserToGroupRequest = z.infer<typeof AddUserToGroupRequestParser>;
