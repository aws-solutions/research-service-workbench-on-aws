import EventBridgeEventToDDB from './eventBridgeEventToDDB';
import StatusHandler from './statusHandler';

describe('StatusHandler', () => {
  test('execute does not return an error', async () => {
    const statusHandler = new StatusHandler();
    const ebToDDB: EventBridgeEventToDDB = {
      eventTime: new Date().getTime(),
      instanceId: 'abc',
      status: 'PENDING',
      metaData: {}
    };
    await expect(statusHandler.execute(ebToDDB)).resolves.not.toThrowError();
  });
});
