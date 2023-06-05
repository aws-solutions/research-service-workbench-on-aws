/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateAccountRequestParser = z.object({
  name: z.string().swbName().required(),
  awsAccountId: z.string().awsAccountId().required(),
  envMgmtRoleArn: z.string().required(),
  hostingAccountHandlerRoleArn: z.string().required(),
  externalId: z.string().required()
});

export type CreateAccountRequest = z.infer<typeof CreateAccountRequestParser>;
