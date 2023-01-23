/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { uuidWithLowercasePrefixRegExp } from '@aws/workbench-core-base';
import { endpointPrefix, dataSetPrefix } from '@aws/workbench-core-example-app/lib/configs/constants';

export const datasetIdRegExp: RegExp = uuidWithLowercasePrefixRegExp(dataSetPrefix);

export const endpointIdRegExp: RegExp = uuidWithLowercasePrefixRegExp(endpointPrefix);

export const accessPointS3AliasRegExp: RegExp = /ap-[0-9]{13}-tes-[A-Za-z0-9]{34}-s3alias/;
