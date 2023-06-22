/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z, invalidEmailMessage } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateUserRequestParser = z
  .object({
    userId: z.string().userId().required(),
    firstName: z.string().personName().optional(),
    lastName: z.string().personName().optional(),
    email: z.string().email(invalidEmailMessage).optional(),
    status: z.enum(['ACTIVE', 'INACTIVE']).optional()
  })
  .strict();

export type UpdateUserRequest = z.infer<typeof UpdateUserRequestParser>;
