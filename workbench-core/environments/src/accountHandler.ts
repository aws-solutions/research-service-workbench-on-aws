export default class AccountHandler {
  /* eslint-disable-next-line */
  public async execute(event: any): Promise<void> {
    console.log(`Account Handler executed with event ${JSON.stringify(event)}`);
  }
}
