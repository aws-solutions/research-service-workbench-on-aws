#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { InfrastructureStack } from './infrastructure-stack';

const app: App = new cdk.App();
// eslint-disable-next-line no-new
new InfrastructureStack(app, 'InfrastructureStack');

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
