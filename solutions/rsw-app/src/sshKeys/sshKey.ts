/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const SshKeyParser = z
  .object({
    sshKeyId: z.string().sshKeyId().required(),
    projectId: z.string().projId().required(),
    owner: z.string().userId().required(),
    publicKey: z.string().required(),
    createTime: z.string().required()
  })
  .required()
  .strict();

export type SshKey = z.infer<typeof SshKeyParser>;
