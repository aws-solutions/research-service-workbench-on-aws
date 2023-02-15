/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';
import * as cdk from 'aws-cdk-lib';
import { ApplicationType, SolutionId, SolutionName, SolutionVersion } from './constants';
import { SWBStack } from './SWBStack';

const app: cdk.App = new cdk.App();
const swbBackendStack: SWBStack = new SWBStack(app);
new WorkbenchAppRegistry(swbBackendStack, swbBackendStack.stackId, {
  solutionId: SolutionId,
  solutionName: SolutionName,
  solutionVersion: SolutionVersion,
  attributeGroupName: `${swbBackendStack.stackName}-AppRegistryGroup`,
  applicationType: ApplicationType,
  appRegistryApplicationName: `${swbBackendStack.stackName}-AppRegistryApplication`
});
app.synth();
