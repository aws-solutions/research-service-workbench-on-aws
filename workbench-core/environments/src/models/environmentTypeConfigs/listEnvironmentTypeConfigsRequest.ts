/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getPaginationParser, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const ListEnvironmentTypeConfigsRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    ...getPaginationParser()
  })
  .strict();

export type ListEnvironmentTypeConfigsRequest = z.infer<typeof ListEnvironmentTypeConfigsRequestParser>;
