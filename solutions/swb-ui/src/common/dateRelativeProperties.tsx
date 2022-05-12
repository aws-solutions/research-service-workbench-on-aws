import { DateRangePickerProps } from '@awsui/components-react';

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

    if (differenceInDays(range.startDate, range.endDate) < 2) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too small. Select a range larger than one day.'
      };
    }
  } else if (range.type === 'relative') {
    if (isNaN(range.amount)) {
      return {
        valid: false,
        errorMessage: 'The selected date range is incomplete. Specify a duration for the date range.'
      };
    }

    if (lengthInDays(range.unit, range.amount) < 2) {
      return {
        valid: false,
        errorMessage: 'The selected date range is too small. Select a range larger than one day.'
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
