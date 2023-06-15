/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateExternalEndpointParser = z
  .object({
    externalEndpointName: z.string(),
    /** One of `groupId` and `userId` must be defined, but not both */
    groupId: z.string().optional(),
    /** One of `groupId` and `userId` must be defined, but not both */
    userId: z.string().userId().required(),
    externalRoleName: z.string().optional(),
    kmsKeyArn: z.string().optional(),
    vpcId: z.string().optional(),
    region: z.string().optional(),
    roleToAssume: z.string().optional()
  })
  .strict();

export type CreateExternalEndpoint = z.infer<typeof CreateExternalEndpointParser>;
