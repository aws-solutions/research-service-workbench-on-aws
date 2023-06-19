/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUsersForRoleRequestParser = z
  .object({
    role: z.enum(['ProjectAdmin', 'Researcher'])
  })
  .strict();

export type ListUsersForRoleRequest = z.infer<typeof ListUsersForRoleRequestParser>;
