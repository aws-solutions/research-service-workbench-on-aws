/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetAccessPermissionRequestParser = z
  .object({
    dataSetId: z.string(),
    identity: z.string(),
    identityType: z.union([z.literal('USER'), z.literal('GROUP')])
  })
  .strict();

export type GetAccessPermissionRequest = z.infer<typeof GetAccessPermissionRequestParser>;
