/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CostCenterParser = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  subnetId: z.string(),
  vpcId: z.string(),
  envMgmtRoleArn: z.string(),
  externalId: z.string(),
  encryptionKeyArn: z.string(),
  environmentInstanceFiles: z.string(),
  hostingAccountHandlerRoleArn: z.string(),
  awsAccountId: z.string(),
  accountId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dependency: z.string()
});

export type CostCenter = z.infer<typeof CostCenterParser>;
