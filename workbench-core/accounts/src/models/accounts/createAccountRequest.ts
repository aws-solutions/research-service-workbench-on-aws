/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateAccountRequestParser = z.object({
  name: z.string(),
  awsAccountId: z.string(),
  envMgmtRoleArn: z.string(),
  hostingAccountHandlerRoleArn: z.string(),
  externalId: z.string()
});

export type CreateAccountRequest = z.infer<typeof CreateAccountRequestParser>;
