/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AuthenticatedUserParser = z.object({
  id: z.string(),
  roles: z.array(z.string())
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserParser>;
