/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AddUserToRoleRequestParser = z
  .object({
    /**
     * User id associated to user to be assigned to the role
     */
    userId: z.string().userId().required(),
    /**
     * Role to assign to user
     */
    roleName: z.string().min(1)
  })
  .strict();

export type AddUserToRoleRequest = z.infer<typeof AddUserToRoleRequestParser>;
