/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { HOSTING_ACCOUNT_STATUS } from '../constants/hostingAccountStatus';

// eslint-disable-next-line @rushstack/typedef-var
const ErrorSchema = z.object({
  type: z.string(),
  value: z.string()
});

// eslint-disable-next-line @rushstack/typedef-var
export const AccountSchema = z.object({
  id: z.string(),
  awsAccountId: z.string(),
  envMgmtRoleArn: z.string(),
  error: ErrorSchema.optional(),
  hostingAccountHandlerRoleArn: z.string(),
  vpcId: z.string(),
  subnetId: z.string(),
  cidr: z.string(),
  environmentInstanceFiles: z.string(),
  encryptionKeyArn: z.string(),
  externalId: z.string(),
  stackName: z.string(),
  status: z.enum(HOSTING_ACCOUNT_STATUS as [string, ...string[]])
});
