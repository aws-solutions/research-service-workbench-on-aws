/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
const GroupStatus = z.enum(['active', 'delete_pending']);

export type GroupStatus = z.infer<typeof GroupStatus>;

// eslint-disable-next-line @rushstack/typedef-var
export const GroupMetadataParser = z.object({
  id: z.string(),
  status: GroupStatus
});

export type GroupMetadata = z.infer<typeof GroupMetadataParser>;
