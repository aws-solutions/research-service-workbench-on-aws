/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import awsLambdaFastify, { PromiseHandler, LambdaResponse } from 'aws-lambda-fastify';
import { lambdaBuild } from '../../../swb-app';

const proxy: PromiseHandler<LambdaResponse> = awsLambdaFastify(lambdaBuild());

exports.handler = proxy;
