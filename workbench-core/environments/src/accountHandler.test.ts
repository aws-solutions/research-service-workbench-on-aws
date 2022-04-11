import AccountHandler from './accountHandler';

describe('AccountHandler', () => {
  test('execute does not return an error', async () => {
    const accountHandler = new AccountHandler();
    await expect(accountHandler.execute({})).resolves.not.toThrowError();
  });
});
