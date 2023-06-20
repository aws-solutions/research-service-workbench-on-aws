/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AuthenticatedUserParser = z
  .object({
    id: z.string().userId().required(),
    roles: z.array(z.string().required().max(55))
  })
  .strict();

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserParser>;
