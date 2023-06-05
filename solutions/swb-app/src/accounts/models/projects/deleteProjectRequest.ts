/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '../../../authorization/models/authenticatedUser';
import { z } from '../../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteProjectRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    projectId: z.string().projId().required()
  })
  .strict();

export type DeleteProjectRequest = z.infer<typeof DeleteProjectRequestParser>;
