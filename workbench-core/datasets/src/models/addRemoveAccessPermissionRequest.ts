/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetPermissionParser } from './dataSetPermission';

// eslint-disable-next-line @rushstack/typedef-var
export const AddRemoveAccessPermissionParser = z.object({
  /** the logged in user */
  authenticatedUser: z.object({
    id: z.string(),
    roles: z.array(z.string())
  }),
  /** the ID of the dataset */
  dataSetId: z.string(),
  /** the permissions to add or remove */
  permission: z.union([DataSetPermissionParser, z.array(DataSetPermissionParser)])
});

export type AddRemoveAccessPermissionRequest = z.infer<typeof AddRemoveAccessPermissionParser>;
