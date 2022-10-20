/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import * as cdk from 'aws-cdk-lib';
import { Aspects } from 'aws-cdk-lib';
import { AwsSolutionsChecks } from 'cdk-nag';
import { SWBStack } from './SWBStack';

const app: cdk.App = new cdk.App();
new SWBStack(app);
Aspects.of(app).add(new AwsSolutionsChecks({ verbose: true }));

app.synth();
