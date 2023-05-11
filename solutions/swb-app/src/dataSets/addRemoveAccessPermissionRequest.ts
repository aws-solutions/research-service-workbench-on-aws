/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetPermissionParser } from './dataSetPermissionParser';

// eslint-disable-next-line @rushstack/typedef-var
export const AddRemoveAccessPermissionRequestParser = z
  .object({
    authenticatedUser: z.object({
      id: z.string().uuid().min(1),
      roles: z.array(z.string()).min(1)
    }),
    dataSetId: z.string().min(1),
    permission: DataSetPermissionParser
  })
  .strict();

export type AddRemoveAccessPermissionRequest = z.infer<typeof AddRemoveAccessPermissionRequestParser>;
