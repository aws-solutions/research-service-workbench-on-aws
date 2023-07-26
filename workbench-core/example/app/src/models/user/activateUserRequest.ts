/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const ActivateUserRequestParser = z
  .object({
    userId: z.string().userId().required()
  })
  .strict();

export type ActivateUserRequest = z.infer<typeof ActivateUserRequestParser>;
