/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';
// eslint-disable-next-line @rushstack/typedef-var
const ProjectDependencyParser = z.object({
  id: z.string(),
  name: z.string(),
  subnetId: z.string(),
  awsAccountId: z.string(),
  environmentInstanceFiles: z.string(),
  vpcId: z.string(),
  envMgmtRoleArn: z.string(),
  encryptionKeyArn: z.string(),
  externalId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  hostingAccountHandlerRoleArn: z.string()
});
// eslint-disable-next-line @rushstack/typedef-var
export const DatasetDependencyParser = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string()
});
// eslint-disable-next-line @rushstack/typedef-var
export const EndpointsDependecyParser = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  dataSetId: z.string()
});
// eslint-disable-next-line @rushstack/typedef-var
const InidDependecyParser = z.object({
  id: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  instanceArn: z.string()
});

// eslint-disable-next-line @rushstack/typedef-var
const ETCDependencyParser = z.object({
  id: z.string(),
  type: z.string(),
  productId: z.string(),
  createdAt: z.string(),
  updatedAt: z.string(),
  provisioningArtifactId: z.string(),
  params: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  )
});

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentParser = z.object({
  id: z.string(),
  instanceId: z.string().optional(),
  cidr: z.string(),
  description: z.string(),
  name: z.string(),
  projectId: z.string(),
  status: z.string(),
  provisionedProductId: z.string(),
  envTypeConfigId: z.string(),
  updatedAt: z.string(),
  createdAt: z.string(),
  owner: z.string(),
  ETC: ETCDependencyParser.optional(),
  PROJ: ProjectDependencyParser.optional(),
  DATASETS: z.array(DatasetDependencyParser).optional(),
  ENDPOINTS: z.array(EndpointsDependecyParser).optional(),
  INID: InidDependecyParser.optional()
});

export type Environment = z.infer<typeof EnvironmentParser>;
