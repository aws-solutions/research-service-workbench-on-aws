/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { AuthenticatedUserParser } from '../authorization/models/authenticatedUser';
import resourceTypeToKey from '../base/constants/resourceTypeToKey';
import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const GetDataSetRequestParser = z
  .object({
    dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
    user: AuthenticatedUserParser
  })
  .strict();
export type GetDataSetRequest = z.infer<typeof GetDataSetRequestParser>;
