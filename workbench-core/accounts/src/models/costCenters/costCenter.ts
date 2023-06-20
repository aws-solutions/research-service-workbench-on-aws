/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';
import { CostCenterStatus } from '../../constants/costCenterStatus';

// eslint-disable-next-line @rushstack/typedef-var
export const CostCenterParser = z.object({
  id: z.string().costCenterId().required(),
  name: z.string().required(),
  description: z.string().swbDescription().required(),
  subnetId: z.string(),
  vpcId: z.string(),
  envMgmtRoleArn: z.string(),
  externalId: z.string(),
  encryptionKeyArn: z.string(),
  environmentInstanceFiles: z.string(),
  hostingAccountHandlerRoleArn: z.string(),
  awsAccountId: z.string().awsAccountId(),
  accountId: z.string().accountId(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dependency: z.string(),
  status: z.nativeEnum(CostCenterStatus)
});

export type CostCenter = z.infer<typeof CostCenterParser>;
