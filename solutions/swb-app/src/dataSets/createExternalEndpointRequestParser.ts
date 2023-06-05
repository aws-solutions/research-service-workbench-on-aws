/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateExternalEndpointRequestParser = z.object({
  externalEndpointName: z.string(),
  groupId: z.string(),
  externalRoleName: z.string().optional(),
  kmsKeyArn: z.string().optional(),
  vpcId: z.string().optional()
});

export type CreateExternalEndpointRequest = z.infer<typeof CreateExternalEndpointRequestParser>;
