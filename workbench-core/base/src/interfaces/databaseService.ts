/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import QueryParams from '../constants/queryParams';
import ExecuteQueryResult from './executeQueryResult';

export default interface DatabaseService {
  executeQuery(params?: QueryParams): Promise<ExecuteQueryResult>;
}
