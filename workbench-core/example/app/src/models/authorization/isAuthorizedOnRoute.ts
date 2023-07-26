/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AuthenticatedUserParser, HTTPMethodParser } from '@aws/workbench-core-authorization';
import { z } from 'zod';

// eslint-disable-next-line @rushstack/typedef-var
export const IsAuthorizedOnRouteRequestParser = z.object({
  user: AuthenticatedUserParser,
  route: z.string(),
  method: HTTPMethodParser
});

export type IsAuthorizedOnRouteRequest = z.infer<typeof IsAuthorizedOnRouteRequestParser>;
