/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';
import { getPaginationParser } from '../validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListEnvTypeConfigProjectsRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    envTypeConfigId: z.string().etcId().required(),
    ...getPaginationParser()
  })
  .strict();

export type ListEnvTypeConfigProjectsRequest = z.infer<typeof ListEnvTypeConfigProjectsRequestParser>;
