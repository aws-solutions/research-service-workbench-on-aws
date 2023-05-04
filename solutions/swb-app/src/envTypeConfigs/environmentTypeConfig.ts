/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

export enum EnvironmentTypeConfigStatus {
  AVAILABLE = 'AVAILABLE',
  DELETED = 'DELETED'
}

// eslint-disable-next-line @rushstack/typedef-var
export const EnvironmentTypeConfigParser = z.object({
  id: z.string().etcId().required(),
  type: z.string(),
  description: z.string().swbDescription().optional(),
  name: z.string().swbName().optionalNonEmpty(),
  createdAt: z.string(),
  updatedAt: z.string(),
  estimatedCost: z.string().optional(),
  params: z.array(
    z.object({
      key: z.string(),
      value: z.string()
    })
  ),
  status: z.nativeEnum(EnvironmentTypeConfigStatus).default(EnvironmentTypeConfigStatus.AVAILABLE)
});

export type EnvironmentTypeConfig = z.infer<typeof EnvironmentTypeConfigParser>;
