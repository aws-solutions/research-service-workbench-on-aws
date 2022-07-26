/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { TimeUnitsType } from '@aws-sdk/client-cognito-identity-provider';

export function getTimeInSeconds(length: number, units: TimeUnitsType): number {
  if (units === TimeUnitsType.DAYS) {
    return length * 86400;
  }
  if (units === TimeUnitsType.HOURS) {
    return length * 3600;
  }
  if (units === TimeUnitsType.MINUTES) {
    return length * 60;
  }
  return length;
}
