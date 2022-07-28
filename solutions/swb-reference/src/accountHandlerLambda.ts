/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { AwsService } from '@amzn/workbench-core-base';
import { AccountHandler } from '@amzn/workbench-core-environments';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const mainAccountAwsService = new AwsService({ region: process.env.AWS_REGION! });
  const accountHandler = new AccountHandler(mainAccountAwsService);
  await accountHandler.execute(event);
}
