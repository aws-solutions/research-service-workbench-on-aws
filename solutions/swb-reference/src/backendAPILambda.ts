/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import serverlessExpress from '@vendia/serverless-express';
import backendAPIApp from './backendAPI';

exports.handler = serverlessExpress({ app: backendAPIApp });
