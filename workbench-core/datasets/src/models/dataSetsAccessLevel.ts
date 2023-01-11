/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetsAccessLevelParser = z.union([z.literal('read-only'), z.literal('read-write')]);

export type DataSetsAccessLevel = z.infer<typeof DataSetsAccessLevelParser>;
