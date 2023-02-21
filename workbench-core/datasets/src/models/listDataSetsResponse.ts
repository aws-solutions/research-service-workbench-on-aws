/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetParser } from './dataSet';

// eslint-disable-next-line @rushstack/typedef-var
export const ListDataSetsResponseParser = z.object({
  /**
   * the list of DataSets
   */
  data: z.array(DataSetParser),
  /**
   * a token which can be used to continue a datasets list from the next item.
   */
  pageToken: z.string().optional()
});

export type ListDataSetsResponse = z.infer<typeof ListDataSetsResponseParser>;
