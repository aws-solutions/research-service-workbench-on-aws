import { AccountHandler } from '@amzn/environments';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const accountHandler = new AccountHandler();
  await accountHandler.execute(event);
}
