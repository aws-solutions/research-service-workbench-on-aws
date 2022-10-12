/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { resourceTypeToKey } from '@aws/workbench-core-base';

const uuidRegExpAsString: string = '-\\w{8}-\\w{4}-\\w{4}-\\w{4}-\\w{12}';
// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
export const envUuidRegExp: RegExp = new RegExp(
  resourceTypeToKey.environment.toLowerCase() + uuidRegExpAsString
);

// eslint-disable-next-line @rushstack/security/no-unsafe-regexp,security/detect-non-literal-regexp
export const dsUuidRegExp: RegExp = new RegExp(resourceTypeToKey.dataset.toLowerCase() + uuidRegExpAsString);
