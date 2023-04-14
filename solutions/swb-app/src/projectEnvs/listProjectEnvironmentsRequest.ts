/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListProjectEnvironmentsRequestParser = z
  .object({
    ...getPaginationParser(),
    projectId: z.string().min(1)
  })
  .strict();

export type ListProjectEnvironmentsRequest = z.infer<typeof ListProjectEnvironmentsRequestParser>;
