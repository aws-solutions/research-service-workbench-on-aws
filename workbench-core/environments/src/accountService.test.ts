import AccountService from './accountService';

describe('accountService', () => {
  const tableName = 'swb-dev-oh';
  beforeAll(() => {
    process.env.AWS_REGION = 'us-east-2';
  });
  const accountService = new AccountService(tableName);
  test('Get Account', async () => {
    const account = await accountService.getAccount('8d08d1eb-4d10-4d7f-9558-4c426f3b8c64');
    console.log('account', account);
  });

  test('Get Accounts', async () => {
    const accounts = await accountService.getAccounts();
    console.log('accounts', accounts);
  });
});
