/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const GetEnvironmentRequestParser = z.object({
  projectId: z.string().min(1).required(),
  environmentId: z.string().min(1).required()
});

export type GetEnvironmentRequest = z.infer<typeof GetEnvironmentRequestParser>;
