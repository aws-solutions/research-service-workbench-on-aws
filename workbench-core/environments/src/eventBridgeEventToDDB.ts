import EnvironmentStatus from './environmentStatus';

export default interface EventBridgeEventToDDB {
  eventTime: number;
  instanceId: string;
  status: EnvironmentStatus;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  metaData?: any;
}
