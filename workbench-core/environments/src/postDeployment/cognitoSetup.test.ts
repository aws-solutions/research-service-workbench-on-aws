/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

jest.mock('md5-file');

import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
  CreateGroupCommand,
  GroupExistsException,
  ListUserPoolsCommand,
  UsernameExistsException
} from '@aws-sdk/client-cognito-identity-provider';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import CognitoSetup from './cognitoSetup';

describe('CognitoSetup', () => {
  const constants = {
    AWS_REGION: 'us-east-1',
    ROOT_USER_EMAIL: 'user@example.com',
    USER_POOL_NAME: 'swb-userpool-test-va'
  };

  describe('execute private methods', () => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    function mockCognito(cognitoMock: AwsStub<any, any>): void {
      cognitoMock.on(ListUserPoolsCommand).resolves({
        UserPools: [
          {
            Id: 'testUserPoolId',
            Name: 'swb-userpool-test-va'
          }
        ]
      });

      cognitoMock.on(CreateGroupCommand).resolves({
        Group: {}
      });

      cognitoMock.on(AdminCreateUserCommand).resolves({
        User: {
          Username: 'user@example.com',
          Enabled: true
        }
      });
    }

    test('run: Create new groups, create new user, add user to Admin group', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
    });

    test('run: Groups already exist, create new user, add user to Admin group', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const responseMetadata = { httpStatusCode: 400 };
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new GroupExistsException({
          $metadata: responseMetadata
        })
      );

      // Mock create user
      cognitoMock.on(AdminCreateUserCommand).resolves({
        User: {
          Username: 'user@example.com',
          Enabled: true
        }
      });
      jest.spyOn(cognitoSetup, 'createGroup').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
    });

    test('run: Create groups, user already exists, add user to Admin group', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const ResponseMetadata = { httpStatusCode: 500 };
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new UsernameExistsException({
          $metadata: ResponseMetadata
        })
      );
      jest.spyOn(cognitoSetup, 'adminCreateUser').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
    });

    test('run: Groups already exist, user already exists, add user to Admin group', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const responseMetadata = { httpStatusCode: 400 };
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new GroupExistsException({
          $metadata: responseMetadata
        })
      );
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new UsernameExistsException({
          $metadata: responseMetadata
        })
      );
      jest.spyOn(cognitoSetup, 'createGroup').mockImplementation();
      jest.spyOn(cognitoSetup, 'adminCreateUser').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
    });
  });
});
