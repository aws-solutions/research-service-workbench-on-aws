/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line @rushstack/typedef-var
import { z } from 'zod';
import { AuthenticatedUserParser } from '../users/authenticatedUser';

// eslint-disable-next-line @rushstack/typedef-var
export const ListDataSetAccessPermissionsRequestParser = z
  .object({
    dataSetId: z.string(),
    authenticatedUser: AuthenticatedUserParser,
    paginationToken: z.string().optional()
  })
  .strict();

export type ListDataSetAccessPermissionsRequest = z.infer<typeof ListDataSetAccessPermissionsRequestParser>;
