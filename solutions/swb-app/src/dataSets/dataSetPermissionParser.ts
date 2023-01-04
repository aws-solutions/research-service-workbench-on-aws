/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetPermissionParser = z
  .object({
    identityType: z.union([z.literal('USER'), z.literal('GROUP')]),
    identity: z.string(),
    accessLevel: z.union([z.literal('read-only'), z.literal('read-write')])
  })
  .strict();

export type DataSetPermission = z.infer<typeof DataSetPermissionParser>;
