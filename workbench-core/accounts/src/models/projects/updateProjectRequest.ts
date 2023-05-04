/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const UpdateProjectRequestParser = z
  .object({
    projectId: z.string().swbId(resourceTypeToKey.project.toLowerCase()).required(),
    updatedValues: z.object({
      name: z.string().swbName().optionalNonEmpty(),
      description: z.string().swbDescription().optionalNonEmpty()
    })
  })
  .strict();

export type UpdateProjectRequest = z.infer<typeof UpdateProjectRequestParser>;
