/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DisassociateUserToProjectRequestParser = z
  .object({
    userId: z.string(),
    projectId: z.string()
  })
  .strict();

export type DisassociateUserToProjectRequest = z.infer<typeof DisassociateUserToProjectRequestParser>;
