/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { getPaginationParser } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const ListAccountsRequestParser = z.object({
  ...getPaginationParser()
});

export type ListAccountRequest = z.infer<typeof ListAccountsRequestParser>;
