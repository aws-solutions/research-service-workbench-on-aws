/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetProjectRequestParser = z
  .object({
    projectId: z.string().swbId(resourceTypeToKey.project.toLowerCase()).required()
  })
  .strict();

export type GetProjectRequest = z.infer<typeof GetProjectRequestParser>;
