/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetProjectsRequestParser = z
  .object({
    projectIds: z.array(z.string().projId().required())
  })
  .strict();

export type GetProjectsRequest = z.infer<typeof GetProjectsRequestParser>;
