/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';
import * as cdk from 'aws-cdk-lib';
import { config } from 'dotenv';
import { SWBStack } from './SWBStack';

config({ path: './src/config/appRegistry.env' });

const app: cdk.App = new cdk.App();
const swbBackendStack: SWBStack = new SWBStack(app);
new WorkbenchAppRegistry(swbBackendStack, swbBackendStack.stackId, {
  solutionId: process.env.solutionId!,
  solutionName: process.env.solutionName!,
  solutionVersion: process.env.solutionVersion!,
  attributeGroupName: `${swbBackendStack.stackName}-AppRegistryGroup`,
  applicationType: process.env.applicationType!,
  appRegistryApplicationName: `${swbBackendStack.stackName}-AppRegistryApplication`
});
app.synth();
