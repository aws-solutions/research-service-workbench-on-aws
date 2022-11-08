/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { HOSTING_ACCOUNT_STATUS, HostingAccountStatus } from '../constants/hostingAccountStatus';

export interface Account {
  id: string;
  awsAccountId: string;
  envMgmtRoleArn: string;
  error?: { type: string; value: string };
  hostingAccountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  cidr: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId: string;
  stackName: string;
  status: HostingAccountStatus;
}

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
