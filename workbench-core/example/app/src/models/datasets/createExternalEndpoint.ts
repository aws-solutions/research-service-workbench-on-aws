/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateExternalEndpointParser = z
  .object({
    externalEndpointName: z.string(),
    /** If included, will create an endpoint for the group's ID, otherwise will create an endpoint for the caller of the API */
    groupId: z.string().optional(),
    externalRoleName: z.string().optional(),
    kmsKeyArn: z.string().optional(),
    vpcId: z.string().optional()
  })
  .strict();

export type CreateExternalEndpoint = z.infer<typeof CreateExternalEndpointParser>;
