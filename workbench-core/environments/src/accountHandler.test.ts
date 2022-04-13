import AccountHandler from './accountHandler';
import { AwsService } from '@amzn/workbench-core-base';

describe('AccountHandler', () => {
  test('execute does not return an error', async () => {
    process.env.AWS_REGION = 'us-east-2';
    const mainAccountAwsService = new AwsService({ region: 'us-east-2' });
    const accountHandler = new AccountHandler(mainAccountAwsService);
    await expect(accountHandler.execute({})).resolves.not.toThrowError();
  });
});
