import EventBridgeEventToDDB from './eventBridgeEventToDDB';

export default class StatusHandler {
  public async execute(event: EventBridgeEventToDDB): Promise<void> {
    // Update DDB table with data from event bridge
    console.log(`Status Handler executed with event ${JSON.stringify(event)}`);
  }
}
