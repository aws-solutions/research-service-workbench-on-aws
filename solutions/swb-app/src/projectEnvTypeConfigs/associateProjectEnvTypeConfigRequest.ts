/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AssociateProjectEnvTypeConfigRequestParser = z
  .object({
    envTypeId: z.string(),
    envTypeConfigId: z.string(),
    projectId: z.string(),
    user: z.object({
      id: z.string(),
      roles: z.array(z.string())
    })
  })
  .strict();

export type AssociateProjectEnvTypeConfigRequest = z.infer<typeof AssociateProjectEnvTypeConfigRequestParser>;
