/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';
import * as cdk from 'aws-cdk-lib';
import { App, Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { config } from 'dotenv';
import { ExampleStack } from './example-stack';

config({ path: './src/config/appReg.env' });

const app: App = new cdk.App();

// eslint-disable-next-line no-new
const exampleStack: ExampleStack = new ExampleStack(app, 'ExampleStack', {
  env: {
    account: process.env.CDK_DEFAULT_ACCOUNT,
    region: process.env.CDK_DEFAULT_REGION
  }
});

// eslint-disable-next-line no-new
new WorkbenchAppRegistry(exampleStack, exampleStack.stackId, {
  solutionId: process.env.solutionId!,
  solutionName: process.env.solutionName!,
  solutionVersion: process.env.solutionVersion!,
  attributeGroupName: process.env.attributeGroupName!,
  applicationType: process.env.applicationType!,
  appRegistryApplicationName: process.env.appRegistryApplicationName!,
  destroy: true
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
