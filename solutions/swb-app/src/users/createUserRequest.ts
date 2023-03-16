/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateUserRequestParser = z
  .object({
    firstName: z.string().min(1),
    lastName: z.string().min(1),
    email: z.string().min(1)
  })
  .strict();

export type CreateUserRequest = z.infer<typeof CreateUserRequestParser>;
