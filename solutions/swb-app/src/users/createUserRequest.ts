/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z, invalidEmailMessage } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateUserRequestParser = z
  .object({
    firstName: z.string().swbName().min(1),
    lastName: z.string().swbName().min(1),
    email: z.string().email(invalidEmailMessage).min(1)
  })
  .strict();

export type CreateUserRequest = z.infer<typeof CreateUserRequestParser>;
