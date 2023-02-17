/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const DataSetFileUploadRequestParser = z.object({
  dataSetId: z.string(),
  fileNames: z.union([z.string(), z.array(z.string())])
});

export type DataSetFileUploadRequest = z.infer<typeof DataSetFileUploadRequestParser>;
