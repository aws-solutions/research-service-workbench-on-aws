/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@aws/workbench-core-base';

export const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.DDB_TABLE_NAME!
});
