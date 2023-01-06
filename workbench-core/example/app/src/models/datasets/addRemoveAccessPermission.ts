/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DataSetPermissionParser } from '@aws/workbench-core-datasets';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AddRemoveAccessPermissionParser = z.object({
  /** the permission to add or remove */
  permission: DataSetPermissionParser
});

export type AddRemoveAccessPermissionRequest = z.infer<typeof AddRemoveAccessPermissionParser>;
