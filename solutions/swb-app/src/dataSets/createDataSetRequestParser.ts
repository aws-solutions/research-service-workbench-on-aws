/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateDataSetRequestParser = z.object({
  name: z.string().required().swbName(),
  storageName: z.string().required().swbName(),
  path: z.string().required().swbName(),
  awsAccountId: z.string().required().awsAccountId(),
  region: z.string().required().awsRegion(),
  type: z.literal('internal') // Only internal dataset is allowed right now
});

export type CreateDataSetRequest = z.infer<typeof CreateDataSetRequestParser>;
