/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { getPaginationParser } from '../../../base/utilities/validatorHelper';

// eslint-disable-next-line @rushstack/typedef-var
export const ListAccountsRequestParser = z.object({
  ...getPaginationParser()
});

export type ListAccountRequest = z.infer<typeof ListAccountsRequestParser>;
