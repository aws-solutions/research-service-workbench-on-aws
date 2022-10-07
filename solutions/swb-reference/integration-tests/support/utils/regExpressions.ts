/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';

export const uuidRegExp: RegExp = /\w{8}-\w{4}-\w{4}-\w{4}-\w{12}/;

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
export const envUuidRegExp: RegExp = new RegExp(
  resourceTypeToKey.environment.toLowerCase() + '-\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}'
);
