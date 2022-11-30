/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Schema for GetTemplate API
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const AwsAccountTemplateUrlsParser = z
  .object({
    externalId: z.string()
  })
  .strict();

export type AwsAccountTemplateUrls = z.infer<typeof AwsAccountTemplateUrlsParser>;
