/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AssignUserToProjectRequestParser = z
  .object({
    projectId: z.string().swbId(resourceTypeToKey.project.toLowerCase()).required(),
    userId: z.string(),
    role: z.enum(['ProjectAdmin', 'Researcher'])
  })
  .strict();

export type AssignUserToProjectRequest = z.infer<typeof AssignUserToProjectRequestParser>;
