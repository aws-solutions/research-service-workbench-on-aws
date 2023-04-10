import { InvalidParameterException } from '@aws-sdk/client-cognito-identity-provider';
import Setup from '../../support/setup';

const setup: Setup = new Setup();

describe('webUi App Client', () => {
  beforeEach(async () => {
    expect.hasAssertions();
  });

  it('should not support logging via username and password', async () => {
    await expect(
      setup.createRootUserSession(
        setup.getSettings().get('ExampleCognitoUserPoolId'),
        setup.getSettings().get('ExampleCognitoWebUiUserPoolClientId')
      )
    ).rejects.toThrow(InvalidParameterException);
  });
});
