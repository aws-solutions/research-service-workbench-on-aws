/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetFileUploadRequestParser = z.object({
  dataSetId: z.string().datasetId().required(),
  filenames: z.union([z.string().rswName().required(), z.array(z.string().rswName().required()).min(1)])
});

export type DataSetFileUploadRequest = z.infer<typeof DataSetFileUploadRequestParser>;
