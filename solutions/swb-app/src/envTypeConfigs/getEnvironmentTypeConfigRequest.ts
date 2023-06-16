/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetEnvironmentTypeConfigRequestParser = z
  .object({
    envTypeId: z.string(),
    envTypeConfigId: z.string()
  })
  .strict();

export type GetEnvironmentTypeConfigRequest = z.infer<typeof GetEnvironmentTypeConfigRequestParser>;
