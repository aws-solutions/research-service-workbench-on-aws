/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetDataSetRequestParser = z
  .object({
    dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
    user: AuthenticatedUserParser
  })
  .strict();
export type GetDataSetRequest = z.infer<typeof GetDataSetRequestParser>;
