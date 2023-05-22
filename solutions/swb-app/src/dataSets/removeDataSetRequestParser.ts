/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { AuthenticatedUserParser } from '../users/authenticatedUser';

// eslint-disable-next-line @rushstack/typedef-var
export const RemoveDataSetRequestParser = z
  .object({
    authenticatedUser: AuthenticatedUserParser,
    dataSetId: z.string().datasetId().required()
  })
  .strict();

export type RemoveDataSetRequest = z.infer<typeof RemoveDataSetRequestParser>;
