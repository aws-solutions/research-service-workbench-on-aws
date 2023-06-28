/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { DateRangePickerProps } from '@cloudscape-design/components';

export const relativeOptions: readonly DateRangePickerProps.RelativeOption[] = [
  {
    key: 'previous-1-day',
    amount: 1,
    unit: 'day',
    type: 'relative'
  },
  {
    key: 'previous-1-week',
    amount: 1,
    unit: 'week',
    type: 'relative'
  },
  {
    key: 'previous-2-weeks',
    amount: 2,
    unit: 'week',
    type: 'relative'
  },
  {
    key: 'previous-4-weeks',
    amount: 4,
    unit: 'week',
    type: 'relative'
  }
];

export const datei18nStrings: DateRangePickerProps.I18nStrings = {
  todayAriaLabel: 'Today',
  nextMonthAriaLabel: 'Next month',
  previousMonthAriaLabel: 'Previous month',
  customRelativeRangeDurationLabel: 'Duration',
  customRelativeRangeDurationPlaceholder: 'Enter duration',
  customRelativeRangeOptionLabel: 'Custom range',
  customRelativeRangeOptionDescription: 'Set a custom range in the past',
  customRelativeRangeUnitLabel: 'Unit of time',
  formatRelativeRange: (e: { amount: number; unit: string }) => {
    const t = 1 === e.amount ? e.unit : `${e.unit}s`;
    return `Last ${e.amount} ${t}`;
  },
  formatUnit: (e: string, t: number) => (1 === t ? e : `${e}s`),
  dateTimeConstraintText: 'Range must be between 1 and 365 days. Use 24 hour format.',
  relativeModeTitle: 'Relative range',
  absoluteModeTitle: 'Absolute range',
  relativeRangeSelectionHeading: 'Choose a range',
  startDateLabel: 'Start date',
  endDateLabel: 'End date',
  startTimeLabel: 'Start time',
  endTimeLabel: 'End time',
  clearButtonLabel: 'Clear and dismiss',
  cancelButtonLabel: 'Cancel',
  applyButtonLabel: 'Apply'
};
