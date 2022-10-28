/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryParameterFilter } from './queryParameterFilter';

export interface FilterRequest {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [key: string]: QueryParameterFilter<unknown> | undefined;
}
