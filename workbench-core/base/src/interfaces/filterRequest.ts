/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { QueryNumberParamFilter } from './queryNumberParamFilter';
import { QueryStringParamFilter } from './queryStringParamFilter';

export interface FilterRequest extends Record<string, QueryStringParamFilter | QueryNumberParamFilter> {}
