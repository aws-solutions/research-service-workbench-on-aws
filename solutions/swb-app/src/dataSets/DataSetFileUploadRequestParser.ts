/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetFileUploadRequestParser = z.object({
  dataSetId: z.string().datasetId().required(),
  filenames: z.union([z.string().swbName().required(), z.array(z.string().swbName().required()).min(1)])
});

export type DataSetFileUploadRequest = z.infer<typeof DataSetFileUploadRequestParser>;
