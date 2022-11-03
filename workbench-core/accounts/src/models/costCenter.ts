/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

interface CostCenter {
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

export default CostCenter;
