/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@aws/workbench-core-base';

export const aws: AwsService = new AwsService({
  region: process.env.AWS_REGION!
});

export const datasetAws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.DATASET_DDB_TABLE_NAME!
});

export const dynamicAuthAws: AwsService = new AwsService({
  region: process.env.AWS_REGION!,
  ddbTableName: process.env.DYNAMIC_AUTH_DDB_TABLE_NAME!
});
