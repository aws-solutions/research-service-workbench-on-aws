/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { resourceTypeToKey, z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteProjectRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    projectId: z.string().swbId(resourceTypeToKey.project.toLowerCase()).required()
  })
  .strict();

export type DeleteProjectRequest = z.infer<typeof DeleteProjectRequestParser>;
