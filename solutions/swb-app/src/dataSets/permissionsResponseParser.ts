/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetPermissionParser } from './dataSetPermissionParser';

// eslint-disable-next-line @rushstack/typedef-var
export const PermissionsResponseParser = z.object({
  data: z.object({
    dataSetId: z.string(),
    permissions: z.array(DataSetPermissionParser)
  }),
  pageToken: z.string().optional()
});

export type PermissionsResponse = z.infer<typeof PermissionsResponseParser>;
