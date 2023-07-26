/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';
import * as cdk from 'aws-cdk-lib';
import { ApplicationType, SolutionId, SolutionName, SolutionVersion } from './constants';
import { RSWStack } from './RSWStack';

const app: cdk.App = new cdk.App();
const rswBackendStack: RSWStack = new RSWStack(app, {
  solutionId: SolutionId,
  solutionName: SolutionName,
  solutionVersion: SolutionVersion
});

new WorkbenchAppRegistry(rswBackendStack, `${rswBackendStack.stackName}-AppRegistryStack`, {
  solutionId: SolutionId,
  solutionName: SolutionName,
  solutionVersion: SolutionVersion,
  attributeGroupName: `${rswBackendStack.stackName}-AppRegistryGroup`,
  applicationType: ApplicationType,
  appRegistryApplicationName: `${rswBackendStack.stackName}-AppRegistryApplication`
});
app.synth();
