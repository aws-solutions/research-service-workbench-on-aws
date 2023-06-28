/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser } from '@aws/workbench-core-authorization';
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AssociateProjectEnvTypeConfigRequestParser = z
  .object({
    envTypeId: z.string().etId().required(),
    envTypeConfigId: z.string().etcId().required(),
    projectId: z.string().projId().required(),
    user: AuthenticatedUserParser
  })
  .strict();

export type AssociateProjectEnvTypeConfigRequest = z.infer<typeof AssociateProjectEnvTypeConfigRequestParser>;
