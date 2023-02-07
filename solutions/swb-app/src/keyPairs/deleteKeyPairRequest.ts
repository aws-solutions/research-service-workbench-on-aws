/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteKeyPairRequestParser = z
  .object({
    projectId: z.string(),
    userId: z.string()
  })
  .strict();

export type DeleteKeyPairRequest = z.infer<typeof DeleteKeyPairRequestParser>;
