/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteProjectRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    projectId: z.string()
  })
  .strict();

export type DeleteProjectRequest = z.infer<typeof DeleteProjectRequestParser>;
