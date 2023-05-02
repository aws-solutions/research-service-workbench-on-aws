/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for GetTemplate API
import { z } from '@aws/workbench-core-base';

// eslint-disable-next-line @rushstack/typedef-var
export const AwsAccountTemplateUrlsRequestParser = z
  .object({
    externalId: z.string().required()
  })
  .strict();

export type AwsAccountTemplateUrlsRequest = z.infer<typeof AwsAccountTemplateUrlsRequestParser>;
