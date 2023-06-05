/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// Should match the schema for PROJ with DATASET
// eslint-disable-next-line @rushstack/typedef-var
export const ProjectDatasetMetadataParser = z
  .object({
    id: z.string(),
    pk: z.string(),
    sk: z.string(),
    permission: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
  .strict();

export type ProjectDatasetMetadata = z.infer<typeof ProjectDatasetMetadataParser>;

// Should match the schema for PROJ with ETC
// eslint-disable-next-line @rushstack/typedef-var
export const ProjectEnvTypeConfigMetadataParser = z
  .object({
    id: z.string(),
    pk: z.string(),
    sk: z.string(),
    createdAt: z.string(),
    updatedAt: z.string()
  })
  .strict();

export type ProjectEnvTypeConfigMetadata = z.infer<typeof ProjectEnvTypeConfigMetadataParser>;
