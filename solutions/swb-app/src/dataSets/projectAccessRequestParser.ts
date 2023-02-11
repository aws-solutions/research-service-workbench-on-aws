/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../users/authenticatedUser';

// eslint-disable-next-line @rushstack/typedef-var
export const ProjectAccessRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    dataSetId: z.string(),
    projectId: z.string(),
    accessLevel: z.enum(['read-write', 'read-only'])
  })
  .strict();

export type ProjectAccessRequest = z.infer<typeof ProjectAccessRequestParser>;
