/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const GetProjectRequestParser = z.object({
  projectId: z.string()
});

export type GetProjectRequest = z.infer<typeof GetProjectRequestParser>;
