/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateSshKeyRequestParser = z
  .object({
    projectId: z.string().projId().required(),
    userId: z.string().required()
  })
  .strict();

export type CreateSshKeyRequest = z.infer<typeof CreateSshKeyRequestParser>;
