/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const TerminateEnvironmentRequestParser = z.object({
  projectId: z.string().min(1),
  environmentId: z.string().min(1)
});

export type TerminateEnvironmentRequest = z.infer<typeof TerminateEnvironmentRequestParser>;
