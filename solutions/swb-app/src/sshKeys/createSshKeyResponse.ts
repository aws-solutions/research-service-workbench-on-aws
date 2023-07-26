/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateSshKeyResponseParser = z
  .object({
    projectId: z.string().projId().required(),
    privateKey: z.string().required(),
    id: z.string().sshKeyId().required(),
    owner: z.string().userId().required()
  })
  .required()
  .strict();

export type CreateSshKeyResponse = z.infer<typeof CreateSshKeyResponseParser>;
