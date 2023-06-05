/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const AuthenticatedUserParser = z.object({
  id: z.string().required(),
  roles: z.array(z.string().required().max(55))
});

export type AuthenticatedUser = z.infer<typeof AuthenticatedUserParser>;
