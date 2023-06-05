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

/**
 * Converts a amount of time into milliseconds
 *
 * @param length - the length of time
 * @param units - the unit of time
 * @returns the time in milliseconds
 */
export function getTimeInMS(length: number, units: TimeUnits): number {
  if (units === TimeUnits.DAYS) {
    return length * 24 * 60 * 60 * 1000;
  }
  if (units === TimeUnits.HOURS) {
    return length * 60 * 60 * 1000;
  }
  if (units === TimeUnits.MINUTES) {
    return length * 60 * 1000;
  }
  return length * 1000;
}
