/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import serverlessExpress from '@vendia/serverless-express';
import { Express } from 'express';
import { generateRouter } from '../../app/lib';

const exampleApp: Express = generateRouter();
exports.handler = serverlessExpress({ app: exampleApp });
