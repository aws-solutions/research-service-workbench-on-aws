#!/usr/bin/env node

/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks, NagSuppressions } from 'cdk-nag';
import { getConstants } from './constants';
import { SWBUIStack } from './SWBUIStack';

const { ACCOUNT_ID, AWS_REGION } = getConstants();

// eslint-disable-next-line @rushstack/typedef-var
const app: cdk.App = new cdk.App();
// eslint-disable-next-line no-new
const stack: SWBUIStack = new SWBUIStack(app, 'SWBUIStack', {
  /* If you don't specify 'env', this stack will be environment-agnostic.
   * Account/Region-dependent features and context lookups will not work,
   * but a single synthesized template can be deployed anywhere. */
  /* Uncomment the next line to specialize this stack for the AWS Account
   * and Region that are implied by the current CLI configuration. */
  env: { account: ACCOUNT_ID, region: AWS_REGION }
  /* Uncomment the next line if you know exactly what Account and Region you
   * want to deploy the stack to. */
  // env: { account: '123456789012', region: 'us-east-1' },
  /* For more information, see https://docs.aws.amazon.com/cdk/latest/guide/environments.html */
});

Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));
NagSuppressions.addStackSuppressions(stack, [
  {
    id: 'AwsSolutions-CFR1',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-CFR2',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-CFR3',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-CFR4',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-CFR5',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-CFR6',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-IAM4',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-IAM5',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-L1',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-S1',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-S2',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-S3',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-S5',
    reason: 'TODO:triage come back and fill the suppression reason'
  },
  {
    id: 'AwsSolutions-S10',
    reason: 'TODO:triage come back and fill the suppression reason'
  }
]);
