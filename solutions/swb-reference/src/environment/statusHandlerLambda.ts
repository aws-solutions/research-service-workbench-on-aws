import { StatusHandler, EventBridgeEventToDDB } from '@amzn/environments';
/* eslint-disable-next-line */
export async function handler(event: any) {
  const statusHandler = new StatusHandler();
  // TODO: Map event to EventBridgeEventToDDB
  const ebToDDB: EventBridgeEventToDDB = {
    eventTime: new Date().getTime(),
    instanceId: 'abc',
    status: 'PENDING',
    metaData: {}
  };

  await statusHandler.execute(ebToDDB);
}
