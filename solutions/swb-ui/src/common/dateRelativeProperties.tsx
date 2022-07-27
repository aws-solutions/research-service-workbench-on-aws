/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DateRangePickerProps } from '@awsui/components-react';
import { addDays, addHours, addMinutes, addMonths, addSeconds, addWeeks, addYears } from 'date-fns';

const differenceInDays = (dateOne: Date, dateTwo: Date): number => {
  const milliseconds = Math.abs(
    (new Date(dateTwo) as unknown as number) - (new Date(dateOne) as unknown as number)
  );
  const days = Math.ceil(milliseconds / (1000 * 60 * 60 * 24));
  return days;
};

const lengthInDays = (unit: DateRangePickerProps.TimeUnit, amount: number): number => {
  switch (unit) {
    case 'second':
      return amount / (24 * 60 * 60);
    case 'minute':
      return amount / (24 * 60);
    case 'hour':
      return amount / 24;
    case 'day':
      return amount;
    case 'week':
      return amount * 7;
    case 'month':
      return amount * 30;
    case 'year':
      return amount * 365;
  }
};

export const isValidRangeFunction = (range: any): DateRangePickerProps.ValidationResult => {
  if (range.type === 'absolute') {
    const [startDateWithoutTime] = range.startDate.split('T');
    const [endDateWithoutTime] = range.endDate.split('T');

    if (!startDateWithoutTime || !endDateWithoutTime) {
      return {
        valid: false,
        errorMessage: 'The selected date range is incomplete. Select a start and end date for the date range.'
      };
    }

    if (differenceInDays(range.startDate, range.endDate) >= 366) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too large. Select a range up to one year.'
      };
    }

    if (differenceInDays(range.startDate, range.endDate) < 1) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too small. Select a range that is at least one day.'
      };
    }
  } else if (range.type === 'relative') {
    if (isNaN(range.amount)) {
      return {
        valid: false,
        errorMessage: 'The selected date range is incomplete. Specify a duration for the date range.'
      };
    }

    if (lengthInDays(range.unit, range.amount) < 1) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too small. Select a range that is at least one day.'
      };
    }

    if (lengthInDays(range.unit, range.amount) >= 366) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too large. Select a range up to one year.'
      };
    }
  }
  return { valid: true };
};

export function convertToAbsoluteRange(range: any): { start: Date | undefined; end: Date } {
  if (range.type === 'absolute') {
    return {
      start: new Date(range.startDate),
      end: new Date(range.endDate)
    };
  } else {
    const now = new Date();
    const start = (() => {
      switch (range.unit) {
        case 'second':
          return addSeconds(now, -range.amount);
        case 'minute':
          return addMinutes(now, -range.amount);
        case 'hour':
          return addHours(now, -range.amount);
        case 'day':
          return addDays(now, -range.amount);
        case 'week':
          return addWeeks(now, -range.amount);
        case 'month':
          return addMonths(now, -range.amount);
        case 'year':
          return addYears(now, -range.amount);
      }
    })();
    return {
      start: start,
      end: now
    };
  }
}
