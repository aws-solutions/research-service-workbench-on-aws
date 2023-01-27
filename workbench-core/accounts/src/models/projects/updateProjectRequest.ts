/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import _ from 'lodash';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateProjectRequestParser = z
  .object({
    projectId: z.string(),
    updatedValues: z.object({
      name: z
        .string()
        .refine((val) => !_.isEmpty(val), {
          message: 'name must be non empty'
        })
        .optional(),
      description: z
        .string()
        .refine((val) => !_.isEmpty(val), {
          message: 'description must be non empty'
        })
        .optional()
    })
  })
  .strict();

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestParser>;
