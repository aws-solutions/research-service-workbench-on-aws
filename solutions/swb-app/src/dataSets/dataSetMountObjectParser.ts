/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetMountObjectParser = z
  .object({
    name: z.string(),
    bucket: z.string(),
    prefix: z.string(),
    endpointId: z.string()
  })
  .strict();

export type DataSetMountObject = z.infer<typeof DataSetMountObjectParser>;
