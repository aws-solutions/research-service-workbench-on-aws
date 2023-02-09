/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const SshKeyParser = z.object({
  sshKeyId: z.string(),
  projectId: z.string(),
  owner: z.string(),
  publicKey: z.string(),
  createTime: z.string()
});

export type SshKey = z.infer<typeof SshKeyParser>;
