/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey } from '@aws/workbench-core-base';
import { z } from 'zod';
import { AuthenticatedUserParser } from '../users/authenticatedUser';

// eslint-disable-next-line @rushstack/typedef-var
export const ProjectAddAccessRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
    projectId: z.string().swbId(resourceTypeToKey.project).required(),
    accessLevel: z.enum(['read-write', 'read-only'])
  })
  .strict();

export type ProjectAddAccessRequest = z.infer<typeof ProjectAddAccessRequestParser>;
