/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';
import { ProjectStatus } from '../../constants/projectStatus';

// eslint-disable-next-line @rushstack/typedef-var
export const ProjectParser = z.object({
  id: z.string().projId().required(),
  name: z.string().swbName().required(),
  description: z.string().swbDescription().required(),
  costCenterId: z.string().costCenterId().required(),
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

export type Project = z.infer<typeof ProjectParser>;
