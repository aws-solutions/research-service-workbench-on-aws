/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { invalidEmailMessage } from '../base/utilities/textUtil';
import { z } from '../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const CreateUserRequestParser = z
  .object({
    firstName: z.string().personName().required(),
    lastName: z.string().personName().required(),
    email: z.string().email(invalidEmailMessage).required()
  })
  .strict();

export type CreateUserRequest = z.infer<typeof CreateUserRequestParser>;
