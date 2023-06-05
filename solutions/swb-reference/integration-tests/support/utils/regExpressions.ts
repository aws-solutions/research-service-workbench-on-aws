/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { resourceTypeToKey, uuidWithLowercasePrefixRegExp } from '@aws/swb-app';

export const envUuidRegExp: RegExp = uuidWithLowercasePrefixRegExp(resourceTypeToKey.environment);

export const dsUuidRegExp: RegExp = uuidWithLowercasePrefixRegExp(resourceTypeToKey.dataset);

export const envTypeConfigRegExp: RegExp = uuidWithLowercasePrefixRegExp(resourceTypeToKey.envTypeConfig);
