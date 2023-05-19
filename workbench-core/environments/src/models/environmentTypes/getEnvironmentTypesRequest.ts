/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetEnvironmentTypeRequestParser = z
  .object({
    envTypeId: z.string().etId().required()
  })
  .strict();

export type GetEnvironmentTypeRequest = z.infer<typeof GetEnvironmentTypeRequestParser>;
