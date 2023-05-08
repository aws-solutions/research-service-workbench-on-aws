/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z, invalidEmailMessage } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateUserRequestParser = z
  .object({
    userId: z.string().min(1).required(),
    firstName: z.string().swbName().optional(),
    lastName: z.string().swbName().optional(),
    email: z.string().email(invalidEmailMessage).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional(),
    roles: z.array(z.string().max(55)).optional()
  })
  .strict();

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestParser>;
