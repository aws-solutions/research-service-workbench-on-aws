import AccountService from './accountService';
import AccountHandler from './accountHandler';
import { AwsService } from '@amzn/workbench-core-base';

describe('accountHandler', () => {
  // const tableName = 'swb-dev-oh';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-2';
    process.env.STACK_NAME = 'swb-dev-oh';
    process.env.PORTFOLIO_NAME = 'swb-dev-oh';
  });
  const mainAccountAwsService = new AwsService({ region: process.env.AWS_REGION! });
  const accountHandler = new AccountHandler(mainAccountAwsService);
  test('Execute', async () => {
    const response = await accountHandler.execute({});
    console.log('response', response);
  });
});
