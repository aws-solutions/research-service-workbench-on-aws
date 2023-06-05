/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const DeleteUserRequestParser = z
  .object({
    userId: z.string().userId().required()
  })
  .strict();

export type DeleteUserRequest = z.infer<typeof DeleteUserRequestParser>;
