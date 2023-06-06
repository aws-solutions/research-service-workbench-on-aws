/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from '../../base/utilities/validatorHelper';
import { UserZod } from '../../userManagement/user';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUsersResponseParser = z
  .object({
    data: z.array(UserZod),
    paginationToken: z.string().optional()
  })
  .strict();

export type ListUsersResponse = z.infer<typeof ListUsersResponseParser>;
