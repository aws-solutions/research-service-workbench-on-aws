/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { HTTPMethodParser } from '@aws/workbench-core-authorization';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const IsRouteIgnoredRequestParser = z.object({
  route: z.string(),
  method: HTTPMethodParser
});

export type IsRouteIgnoredRequest = z.infer<typeof IsRouteIgnoredRequestParser>;
