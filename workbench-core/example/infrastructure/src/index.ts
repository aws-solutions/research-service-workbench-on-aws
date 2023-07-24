/* eslint-disable no-new */
/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';
import * as cdk from 'aws-cdk-lib';
import { App, Aspects, Environment } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { config } from 'dotenv';
import { ExampleHostingStack } from './example-hosting-stack';
import { ExampleStack } from './example-stack';

config({ path: './src/config/appReg.env' });

const app: App = new cdk.App();

const crossAccountRoleName: string = 'ExampleCrossAccountRole';

const mainEnv: Environment = {
  account: process.env.CDK_DEFAULT_ACCOUNT,
  region: process.env.CDK_DEFAULT_REGION
};

const hostingEnv: Environment = {
  account: process.env.HOSTING_ACCOUNT_ID,
  region: process.env.HOSTING_ACCOUNT_REGION
};

// eslint-disable-next-line no-new
const exampleStack: ExampleStack = new ExampleStack(app, 'ExampleStack', {
  env: mainEnv,
  hostingAccountId: process.env.HOSTING_ACCOUNT_ID!,
  crossAccountRoleName
});

// eslint-disable-next-line no-new
new WorkbenchAppRegistry(exampleStack, 'ExampleStack', {
  solutionId: process.env.solutionId!,
  solutionName: process.env.solutionName!,
  solutionVersion: process.env.solutionVersion!,
  attributeGroupName: process.env.attributeGroupName!,
  applicationType: process.env.applicationType!,
  appRegistryApplicationName: process.env.appRegistryApplicationName!,
  destroy: true,
  appInsights: true
});

const exampleHostingStack: ExampleHostingStack = new ExampleHostingStack(app, 'ExampleHostingStack', {
  env: hostingEnv,
  mainAccountId: process.env.CDK_DEFAULT_ACCOUNT!,
  crossAccountRoleName
});

// eslint-disable-next-line no-new
new WorkbenchAppRegistry(exampleHostingStack, 'ExampleHostingStack', {
  solutionId: process.env.solutionId!,
  solutionName: process.env.solutionName!,
  solutionVersion: process.env.solutionVersion!,
  attributeGroupName: process.env.attributeGroupName!,
  applicationType: process.env.applicationType!,
  appRegistryApplicationName: process.env.appRegistryApplicationName!,
  destroy: true,
  appInsights: true
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
app.synth();
