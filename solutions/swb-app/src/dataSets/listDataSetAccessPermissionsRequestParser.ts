/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// eslint-disable-next-line @rushstack/typedef-var
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { z } from 'zod';
import { AuthenticatedUserParser } from '../users/authenticatedUser';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListDataSetAccessPermissionsRequestParser = z
  .object({
    dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
    authenticatedUser: AuthenticatedUserParser,
    ...getPaginationParser()
  })
  .strict();

export type ListDataSetAccessPermissionsRequest = z.infer<typeof ListDataSetAccessPermissionsRequestParser>;
