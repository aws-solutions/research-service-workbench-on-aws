/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AddUserToRoleRequestParser = z
  .object({
    /**
     * User id associated to user to be assigned to the role
     */
    userId: z.string()
  })
  .strict();

export type AddUserToRoleRequest = z.infer<typeof AddUserToRoleRequestParser>;
