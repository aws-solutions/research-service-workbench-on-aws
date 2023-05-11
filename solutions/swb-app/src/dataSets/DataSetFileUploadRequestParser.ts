/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetFileUploadRequestParser = z.object({
  dataSetId: z.string().swbId(resourceTypeToKey.dataset).required(),
  filenames: z.union([z.string().required(), z.array(z.string().required()).min(1)])
});

export type DataSetFileUploadRequest = z.infer<typeof DataSetFileUploadRequestParser>;
