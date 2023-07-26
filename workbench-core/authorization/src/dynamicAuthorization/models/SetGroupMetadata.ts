/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { GetGroupStatusEnum } from './GetGroupMetadata';

// eslint-disable-next-line @rushstack/typedef-var
const SetGroupStatus = z.union([GetGroupStatusEnum, z.enum(['deleted'])]);

export type SetGroupStatus = z.infer<typeof SetGroupStatus>;

// eslint-disable-next-line @rushstack/typedef-var
export const SetGroupMetadataParser = z.object({
  id: z.string(),
  status: SetGroupStatus
});

export type SetGroupMetadata = z.infer<typeof SetGroupMetadataParser>;
