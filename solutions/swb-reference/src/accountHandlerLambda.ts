/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AccountHandler, AccountService, HostingAccountLifecycleService } from '@aws/workbench-core-accounts';
import { AwsService } from '@aws/workbench-core-base';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const stackName = process.env.STACK_NAME!;
  const mainAccountAwsService = new AwsService({
    region: process.env.AWS_REGION!,
    userAgent: process.env.USER_AGENT_STRING,
    ddbTableName: stackName
  });
  const accountService = new AccountService(mainAccountAwsService.helpers.ddb);
  const hostingAccountLifecycleService = new HostingAccountLifecycleService(
    stackName,
    mainAccountAwsService,
    accountService
  );

  const accountHandler = new AccountHandler(
    mainAccountAwsService,
    accountService,
    hostingAccountLifecycleService
  );
  await accountHandler.execute(event);
}
