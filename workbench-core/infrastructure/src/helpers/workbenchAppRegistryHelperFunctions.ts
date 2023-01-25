/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Fn, Stack, Tags } from 'aws-cdk-lib';
import { CfnApplication } from 'aws-cdk-lib/aws-applicationinsights';
import { IConstruct } from 'constructs';

/**
 * @param resource - Construct
 * @param key - tag key
 * @param value - tag value
 */
export function applyTag(resource: IConstruct, key: string, value: string): void {
  Tags.of(resource).add(key, value);
}

export function createAppInsightsConfiguration(stack: Stack): void {
  // eslint-disable-next-line no-new
  new CfnApplication(stack, `ApplicationInsightsConfiguration-${stack.node.id}`, {
    resourceGroupName: Fn.join('-', ['AWS_CloudFormation_Stack', stack.stackName]),
    autoConfigurationEnabled: true,
    cweMonitorEnabled: true,
    opsCenterEnabled: true
  });
}
