/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { ProjectStatus } from '../../constants/projectStatus';

export interface Project {
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

// eslint-disable-next-line @rushstack/typedef-var
export const ProjectParser = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  costCenterId: z.string(),
  status: z.nativeEnum(ProjectStatus),
  createdAt: z.string(),
  updatedAt: z.string(),

  // Account metadata
  awsAccountId: z.string(),
  envMgmtRoleArn: z.string(),
  hostingAccountHandlerRoleArn: z.string(),
  vpcId: z.string(),
  subnetId: z.string(),
  environmentInstanceFiles: z.string(),
  encryptionKeyArn: z.string(),
  externalId: z.string(),
  accountId: z.string()
});
