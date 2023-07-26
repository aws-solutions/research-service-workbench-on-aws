/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteSshKeyRequestParser = z
  .object({
    projectId: z.string().projId().required(),
    sshKeyId: z.string().sshKeyId().required(),
    currentUserId: z.string().userId().required()
  })
  .required()
  .strict();

export type DeleteSshKeyRequest = z.infer<typeof DeleteSshKeyRequestParser>;
