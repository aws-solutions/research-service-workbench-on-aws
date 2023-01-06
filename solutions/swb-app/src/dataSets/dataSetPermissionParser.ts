/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetAccessLevelParser } from './dataSetAccessLevelParser';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetPermissionParser = z
  .object({
    subject: z.string(),
    accessLevel: DataSetAccessLevelParser
  })
  .strict();

export type DataSetPermission = z.infer<typeof DataSetPermissionParser>;
