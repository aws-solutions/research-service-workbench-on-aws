/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateUserRequestParser = z
  .object({
    firstName: z.string().optional(),
    lastName: z.string().optional(),
    email: z.string().optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    roles: z.array(z.string()).optional()
  })
  .strict();

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestParser>;
