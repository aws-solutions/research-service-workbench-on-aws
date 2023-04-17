/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetDataSetByProjectRequestParser = z.object({
  projectId: z.string().swbId(resourceTypeToKey.project).required(),
  dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
  user: AuthenticatedUserParser
});

export type GetDataSetByProjectRequest = z.infer<typeof GetDataSetByProjectRequestParser>;
