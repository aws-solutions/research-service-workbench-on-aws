/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetAccessPermissionRequestParser = z.object({
  /** the ID of the dataset */
  dataSetId: z.string(),
  /** the user or group for which permissions are sought */
  identity: z.string(),
  /** the type of identity - user or group */
  identityType: z.string()
});

export type GetAccessPermissionRequest = z.infer<typeof GetAccessPermissionRequestParser>;
