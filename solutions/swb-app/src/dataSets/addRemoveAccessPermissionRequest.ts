/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';
import { AuthenticatedUserParser } from '../users/authenticatedUser';
import { DataSetPermissionParser } from './dataSetPermissionParser';

// eslint-disable-next-line @rushstack/typedef-var
export const AddRemoveAccessPermissionRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    dataSetId: z.string().required(),
    permission: DataSetPermissionParser
  })
  .strict();

export type AddRemoveAccessPermissionRequest = z.infer<typeof AddRemoveAccessPermissionRequestParser>;
