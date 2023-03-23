/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetsAccessLevelParser } from '@aws/workbench-core-datasets';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateImportDataSetParser = z
  .object({
    name: z.string(),
    storageName: z.string(),
    path: z.string(),
    awsAccountId: z.string(),
    region: z.string(),
    owner: z.string().optional(),
    ownerType: z.string().optional(),
    roleToAssume: z.string().optional(),
    permissions: z
      .array(
        z.object({
          identity: z.string(),
          identityType: z.string(),
          accessLevel: DataSetsAccessLevelParser
        })
      )
      .optional()
  })
  .strict();

export type CreateImportDataSet = z.infer<typeof CreateImportDataSetParser>;
