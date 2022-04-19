jest.mock('md5-file');

import CognitoSetup from './cognitoSetup';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  CreateUserPoolCommand,
  ListUserPoolsCommand,
  UsernameExistsException
} from '@aws-sdk/client-cognito-identity-provider';

describe('CognitoSetup', () => {
  const constants = {
    AWS_REGION: 'us-east-1',
    ROOT_USER_EMAIL: 'user@example.com',
    USER_POOL_NAME: 'swb-test-va'
  };

  describe('execute private methods', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function mockCognito(cognitoMock: AwsStub<any, any>): void {
      cognitoMock.on(CreateUserPoolCommand).resolves({
        UserPool: { Id: 'testUserPoolId' }
      });

      cognitoMock.on(ListUserPoolsCommand).resolves({
        UserPools: []
      });

      cognitoMock.on(AdminCreateUserCommand).resolves({
        User: {
          Username: 'user@example.com',
          Enabled: true
        }
      });
    }

    test('run: Create new user pool, create new user', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
    });

    test('run: User pool already exists, create new user', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);

      // Mock user pool already exists
      cognitoMock.on(ListUserPoolsCommand).resolves({
        UserPools: [
          {
            Id: 'testUserPoolId',
            Name: 'swb-test-va'
          }
        ]
      });

      // Mock create user
      cognitoMock.on(AdminCreateUserCommand).resolves({
        User: {
          Username: 'user@example.com',
          Enabled: true
        }
      });
      jest.spyOn(cognitoSetup, 'createUserPool').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
      expect(cognitoSetup.createUserPool).not.toBeCalled();
    });

    test('run: User pool already exists, user already exists', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);

      // Mock user pool already exists
      cognitoMock.on(ListUserPoolsCommand).resolves({
        UserPools: [
          {
            Id: 'testUserPoolId',
            Name: 'swb-test-va'
          }
        ]
      });
      const ResponseMetadata = { httpStatusCode: 500 };
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new UsernameExistsException({
          $metadata: ResponseMetadata
        })
      );
      jest.spyOn(cognitoSetup, 'createUserPool').mockImplementation();
      jest.spyOn(cognitoSetup, 'adminCreateUser').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
      expect(cognitoSetup.createUserPool).not.toBeCalled();
    });
  });
});
