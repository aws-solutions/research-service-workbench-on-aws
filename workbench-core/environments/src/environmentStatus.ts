// type EnvironmentStatus =
//   | 'PENDING'
//   | 'COMPLETED'
//   | 'STARTING'
//   | 'STARTED'
//   | 'STOPPING'
//   | 'STOPPED'
//   | 'TERMINATING'
//   | 'TERMINATED'
//   | 'FAILED'
//   | 'TERMINATING_FAILED'
//   | 'STARTING_FAILED'
//   | 'STOPPING_FAILED';
// https://www.damirscorner.com/blog/posts/20200619-StringLiteralTypeGuardInTypescript.html
// This allows us to verify that user input is an EnvironmentStatus
export const ENVIRONMENT_STATUS: string[] = [
  'PENDING',
  'COMPLETED',
  'STARTING',
  'STARTED',
  'STOPPING',
  'STOPPED',
  'TERMINATING',
  'TERMINATED',
  'FAILED',
  'TERMINATING_FAILED',
  'STARTING_FAILED',
  'STOPPING_FAILED'
];

export type EnvironmentStatus = typeof ENVIRONMENT_STATUS[number];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function isEnvironmentStatus(status: any): status is EnvironmentStatus {
  if (typeof status !== 'string') {
    return false;
  }
  return ENVIRONMENT_STATUS.includes(status as EnvironmentStatus);
}
