/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentDatasetMetadataParser = z
  .object({
    id: z.string(),
    pk: z.string(),
    sk: z.string()
  })
  .strict();

export type EnvironmentDatasetMetadata = z.infer<typeof EnvironmentDatasetMetadataParser>;
