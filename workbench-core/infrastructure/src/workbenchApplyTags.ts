// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import { Tags } from 'aws-cdk-lib';
import { IConstruct } from 'constructs';

/**
 * @param resource - Construct
 * @param key - tag key
 * @param value - tag value
 */
export function applyTag(resource: IConstruct, key: string, value: string): void {
  Tags.of(resource).add(key, value);
}
