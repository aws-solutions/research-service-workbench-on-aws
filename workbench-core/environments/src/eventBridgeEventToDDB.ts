import EnvironmentStatus from './environmentStatus';

export default interface EventBridgeEventToDDB {
  envId: string;
  status: EnvironmentStatus;
  operation: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  metadata?: any;
}
