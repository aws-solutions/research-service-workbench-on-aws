/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';
import { AuthenticatedUserParser } from '../users/authenticatedUser';

// eslint-disable-next-line @rushstack/typedef-var
export const IsProjectAuthorizedForDatasetsParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    datasetIds: z.array(z.string()),
    projectId: z.string().required()
  })
  .strict();

export type IsProjectAuthorizedForDatasetsRequest = z.infer<typeof IsProjectAuthorizedForDatasetsParser>;
