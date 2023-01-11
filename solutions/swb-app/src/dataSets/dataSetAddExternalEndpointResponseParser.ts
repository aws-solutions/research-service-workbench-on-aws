/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { z } from 'zod';
import { DataSetMountObjectParser } from './dataSetMountObjectParser';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetAddExternalEndpointResponseParser = z
  .object({
    data: z.object({
      mountObject: DataSetMountObjectParser
    })
  })
  .strict();

export type DataSetAddExternalEndpointResponse = z.infer<typeof DataSetAddExternalEndpointResponseParser>;
