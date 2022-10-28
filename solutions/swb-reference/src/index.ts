/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { SWBStack } from './SWBStack';

const app: cdk.App = new cdk.App();
const stack = new SWBStack(app);
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
NagSuppressions.addStackSuppressions(stack, [
  {
    id: 'AwsSolutions-COG1',
    reason:
      "By design. Users are encouraged to change the cognito password requirements to what best suits their organization's needs"
  },
  {
    id: 'AwsSolutions-COG2',
    reason:
      "By design. Users are encouraged to change the cognito MFA to what best suits their organization's needs"
  },
  {
    id: 'AwsSolutions-COG3',
    reason:
      "By design. Users are encouraged to change the Security Mode to what best suits their organization's needs"
  }
]);

app.synth();
