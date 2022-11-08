/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HostingAccountStatus } from '../constants/hostingAccountStatus';

export default interface Account {
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
