/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateDataSetRequestParser = z
  .object({
    name: z.string().swbName().required(),
    storageName: z.string().swbName().required(),
    path: z.string().swbName().required(),
    awsAccountId: z.string().awsAccountId().required(),
    region: z.string().awsRegion().required(),
    type: z.literal('internal') // Only internal dataset is allowed right now
  })
  .strict();

export type CreateDataSetRequest = z.infer<typeof CreateDataSetRequestParser>;
