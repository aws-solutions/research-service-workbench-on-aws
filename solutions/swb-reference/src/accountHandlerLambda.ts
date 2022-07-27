import { AccountHandler } from '@amzn/environments';
import { AwsService } from '@amzn/workbench-core-base';

/* eslint-disable-next-line */
export async function handler(event: any) {
  const mainAccountAwsService = new AwsService({ region: process.env.AWS_REGION! });
  const accountHandler = new AccountHandler(mainAccountAwsService);
  await accountHandler.execute(event);
}
