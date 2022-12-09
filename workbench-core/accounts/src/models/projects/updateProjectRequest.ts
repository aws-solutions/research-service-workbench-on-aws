/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateProjectRequestParser = z
  .object({
    projectId: z.string(),
    updatedValues: z.object({
      name: z.string().optional(),
      description: z.string().optional()
    })
  })
  .strict();

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestParser>;
