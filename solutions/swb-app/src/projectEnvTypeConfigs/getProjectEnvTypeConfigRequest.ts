/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const GetProjectEnvTypeConfigRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    envTypeConfigId: z.string().etcId().required(),
    projectId: z.string().projId().required()
  })
  .strict();

export type GetProjectEnvTypeConfigRequest = z.infer<typeof GetProjectEnvTypeConfigRequestParser>;
