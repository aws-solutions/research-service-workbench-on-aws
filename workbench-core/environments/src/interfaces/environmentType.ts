/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CFNTemplateParameters } from '@aws/workbench-core-base';
import { EnvironmentTypeStatus } from '../constants/environmentTypeStatus';

export interface EnvironmentType {
  pk: string;
  sk: string;
  id: string;
  productId: string;
  provisioningArtifactId: string;
  description: string;
  name: string;
  type: string;
  params: CFNTemplateParameters;
  resourceType: string;
  status: EnvironmentTypeStatus;
  createdAt: string;
  updatedAt: string;
}
