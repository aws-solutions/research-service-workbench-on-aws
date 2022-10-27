/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { generateRouter } from '@aws/workbench-core-example-app';
import serverlessExpress from '@vendia/serverless-express';
import { Express } from 'express';

const exampleApp: Express = generateRouter();
exports.handler = serverlessExpress({ app: exampleApp });
