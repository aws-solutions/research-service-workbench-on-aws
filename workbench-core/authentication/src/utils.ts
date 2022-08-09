/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

export enum TimeUnits {
  DAYS = 'days',
  HOURS = 'hours',
  MINUTES = 'minutes',
  SECONDS = 'seconds'
}

export function getTimeInSeconds(length: number, units: TimeUnits): number {
  if (units === TimeUnits.DAYS) {
    return length * 86400;
  }
  if (units === TimeUnits.HOURS) {
    return length * 3600;
  }
  if (units === TimeUnits.MINUTES) {
    return length * 60;
  }
  return length;
}
