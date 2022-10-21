/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0

 */

import { HostingAccountStatus } from '../constants/hostingAccountStatus';

interface Account {
  id: string | undefined;
  awsAccountId: string;
  envMgmtRoleArn: string;
  error: { type: string; value: string } | undefined;
  hostingAccountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  cidr: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId?: string;
  stackName: string;
  status: HostingAccountStatus;
}

export default Account;
