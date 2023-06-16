/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteSshKeyRequestParser = z
  .object({
    projectId: z.string(),
    sshKeyId: z.string(),
    currentUserId: z.string()
  })
  .strict();

export type DeleteSshKeyRequest = z.infer<typeof DeleteSshKeyRequestParser>;
