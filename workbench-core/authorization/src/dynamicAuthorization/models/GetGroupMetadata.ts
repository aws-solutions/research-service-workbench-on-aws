/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetGroupStatusEnum = z.enum(['active', 'delete_pending']);

export type GetGroupStatus = z.infer<typeof GetGroupStatusEnum>;

// eslint-disable-next-line @rushstack/typedef-var
export const GetGroupMetadataParser = z.object({
  id: z.string(),
  status: GetGroupStatusEnum
});

export type GetGroupMetadata = z.infer<typeof GetGroupMetadataParser>;
