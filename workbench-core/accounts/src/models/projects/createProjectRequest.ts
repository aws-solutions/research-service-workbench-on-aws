/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateProjectRequestParser = z.object({
  name: z.string(),
  description: z.string(),
  costCenterId: z.string()
});

export type CreateProjectRequest = z.infer<typeof CreateProjectRequestParser>;
