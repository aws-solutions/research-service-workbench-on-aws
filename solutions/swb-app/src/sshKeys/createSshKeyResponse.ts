/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateSshKeyResponseParser = z
  .object({
    projectId: z.string(),
    privateKey: z.string(),
    id: z.string(),
    owner: z.string()
  })
  .strict();

export type CreateSshKeyResponse = z.infer<typeof CreateSshKeyResponseParser>;
