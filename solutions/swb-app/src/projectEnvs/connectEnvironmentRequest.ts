/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ConnectEnvironmentRequestParser = z.object({
  projectId: z.string().min(1),
  environmentId: z.string().min(1)
});

export type ConnectEnvironmentRequest = z.infer<typeof ConnectEnvironmentRequestParser>;
