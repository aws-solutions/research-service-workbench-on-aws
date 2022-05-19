export default interface EventBridgeEventToDDB {
  envId: string;
  status: string;
  operation: string;
  /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
  metadata?: any;
}
