import { TimeUnitsType } from '@aws-sdk/client-cognito-identity-provider';

export function getTimeInSeconds(time?: number, units?: string): number {
  if (time === undefined || units === undefined) {
    return 0;
  }
  if (units === TimeUnitsType.DAYS) {
    return time * 86400;
  }
  if (units === TimeUnitsType.HOURS) {
    return time * 3600;
  }
  if (units === TimeUnitsType.MINUTES) {
    return time * 60;
  }
  if (units === TimeUnitsType.SECONDS) {
    return time;
  }
  return 0;
}
