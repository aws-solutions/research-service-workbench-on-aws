/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AccountHandler } from '@aws/workbench-core-accounts';
import { AwsService } from '@aws/workbench-core-base';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const mainAccountAwsService = new AwsService({ region: process.env.AWS_REGION! });
  const accountHandler = new AccountHandler(mainAccountAwsService);
  await accountHandler.execute(event);
}
