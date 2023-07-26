/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { getPaginationParser } from '../utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUsersForRoleRequestParser = z
  .object({
    ...getPaginationParser(1, 60),
    role: z.enum(['ProjectAdmin', 'Researcher']),
    projectId: z.string()
  })
  .strict();

export type ListUsersForRoleRequest = z.infer<typeof ListUsersForRoleRequestParser>;
