/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AccountHandler } from '@aws/workbench-core-accounts';
import { AwsService } from '@aws/workbench-core-base';
import { EnvironmentTypeHandler } from '@aws/workbench-core-environments';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const mainAccountAwsService = new AwsService({
    region: process.env.AWS_REGION!,
    ddbTableName: process.env.STACK_NAME!
  });
  const accountHandler = new AccountHandler(mainAccountAwsService);
  const envTypeHandler = new EnvironmentTypeHandler(mainAccountAwsService);
  await accountHandler.execute(event);
  await envTypeHandler.execute(event);
}
