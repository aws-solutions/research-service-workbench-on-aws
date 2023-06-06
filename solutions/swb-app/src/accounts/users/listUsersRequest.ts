/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getPaginationParser, z } from '../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListUsersRequestParser = z
  .object({
    ...getPaginationParser()
  })
  .strict();

export type ListUsersRequest = z.infer<typeof ListUsersRequestParser>;
