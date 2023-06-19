/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUserSshKeysForProjectRequestParser = z
  .object({
    projectId: z.string(),
    userId: z.string()
  })
  .strict();

export type ListUserSshKeysForProjectRequest = z.infer<typeof ListUserSshKeysForProjectRequestParser>;
