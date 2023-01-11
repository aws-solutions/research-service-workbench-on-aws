/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { ProjectStatus } from '../constants/projectStatus';

interface Project {
  id: string;
  name: string;
  description: string;
  costCenterId: string;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;

  // Account metadata
  awsAccountId: string;
  envMgmtRoleArn: string;
  hostingAccountHandlerRoleArn: string;
  vpcId: string;
  subnetId: string;
  environmentInstanceFiles: string;
  encryptionKeyArn: string;
  externalId: string;
  accountId: string;
}

export default Project;
