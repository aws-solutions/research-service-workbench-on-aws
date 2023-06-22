/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetAccountRequestParser = z
  .object({
    id: z.string().accountId().required()
  })
  .strict();

export type GetAccountRequest = z.infer<typeof GetAccountRequestParser>;
