type EnvironmentStatus =
  | 'PENDING'
  | 'COMPLETED'
  | 'STARTING'
  | 'STARTED'
  | 'STOPPING'
  | 'STOPPED'
  | 'TERMINATING'
  | 'TERMINATED'
  | 'FAILED'
  | 'TERMINATING_FAILED'
  | 'STARTING_FAILED'
  | 'STOPPING_FAILED';

export default EnvironmentStatus;
