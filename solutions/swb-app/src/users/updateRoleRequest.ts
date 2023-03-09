/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateRoleRequestParser = z
  .object({
    username: z.string().min(1),
    roleName: z.string().min(1)
  })
  .strict();

export type UpdateRoleRequest = z.infer<typeof UpdateRoleRequestParser>;
