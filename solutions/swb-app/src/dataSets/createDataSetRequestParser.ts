/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { DataSetPermissionParser } from './dataSetPermissionParser';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateDataSetRequestParser = z.object({
  name: z.string(),
  storageName: z.string(),
  path: z.string(),
  awsAccountId: z.string(),
  region: z.string(),
  type: z.string(),
  owner: z.string(),
  ownerType: z.enum(['USER', 'GROUP']),
  permissions: z.optional(z.array(DataSetPermissionParser))
});

export type CreateDataSetRequest = z.infer<typeof CreateDataSetRequestParser>;
