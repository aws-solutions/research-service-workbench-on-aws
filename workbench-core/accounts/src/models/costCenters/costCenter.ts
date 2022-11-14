/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

export interface CostCenter {
  id: string;
  name: string;
  accountId: string;
  description: string;
  createdAt: string;
  updatedAt: string;
  subnetId: string;
  vpcId: string;
  envMgmtRoleArn: string;
  externalId: string;
  encryptionKeyArn: string;
  environmentInstanceFiles: string;
  hostingAccountHandlerRoleArn: string;
  awsAccountId: string;
}

// eslint-disable-next-line @rushstack/typedef-var
export const CostCenterParser = z.object({
  id: z.string(),
  name: z.string(),
  accountId: z.string(),
  description: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  subnetId: z.string(),
  vpcId: z.string(),
  envMgmtRoleArn: z.string(),
  externalId: z.string(),
  encryptionKeyArn: z.string(),
  environmentInstanceFiles: z.string(),
  hostingAccountHandlerRoleArn: z.string(),
  awsAccountId: z.string()
});
