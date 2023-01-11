/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetsAccessLevelParser } from './dataSetsAccessLevel';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetPermissionParser = z.object({
  /** the user or group associated with the access level */
  identity: z.string(),
  /** the type of subject (group or user) */
  identityType: z.string(),
  /** the access level (read-only or read-write) */
  accessLevel: DataSetsAccessLevelParser
});

export type DataSetPermission = z.infer<typeof DataSetPermissionParser>;
