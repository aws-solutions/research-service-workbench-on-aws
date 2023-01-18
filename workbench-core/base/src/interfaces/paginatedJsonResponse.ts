/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import JSONValue from '../types/json';
import PaginatedResponse from './paginatedResponse';

export default interface PaginatedJsonResponse extends PaginatedResponse<Record<string, JSONValue>> {}
