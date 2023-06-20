/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateProjectRequestParser = z
  .object({
    name: z.string().swbName().required(),
    description: z.string().swbDescription().required(),
    costCenterId: z.string().costCenterId().required()
  })
  .strict();

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestParser>;
