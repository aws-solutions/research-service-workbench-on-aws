/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */
import { CloudFormationClient, DescribeStacksCommand } from '@aws-sdk/client-cloudformation';
import {
  AdminCreateUserCommand,
  CognitoIdentityProviderClient,
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  function mockCloudformationOutputs(cfMock: AwsStub<any, any>): void {
    cfMock.on(DescribeStacksCommand).resolves({
      Stacks: [
        {
          StackName: 'swb-test-va',
          StackStatus: 'CREATE_COMPLETE',
          CreationTime: new Date(),
          Outputs: [
            {
              OutputKey: 'cognitoUserPoolId',
              OutputValue: 'sample-user-pool-id'
            }
          ]
        }
      ]
    });
  }

  const cfMock = mockClient(CloudFormationClient);
  beforeAll(() => {
    mockCloudformationOutputs(cfMock);
  });

  afterAll(() => {
    cfMock.reset();
  });

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
      cognitoMock.on(AdminCreateUserCommand).resolves({
        User: {
          Username: 'user@example.com',
          Enabled: true
        }
      });
    }

    test('run: adminCreateUser is called during admin creation', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);
      jest.spyOn(cognitoSetup, 'adminCreateUser');

      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
      expect(cognitoSetup.adminCreateUser).toBeCalledTimes(1);
    });

    test('run: User already exists', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);

      const responseMetadata = { httpStatusCode: 500 };
      cognitoMock.on(AdminCreateUserCommand).rejects(
        new UsernameExistsException({
          $metadata: responseMetadata,
          message: ''
        })
      );
      jest.spyOn(cognitoSetup, 'adminCreateUser').mockImplementation();
      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
      expect(cognitoSetup.adminCreateUser).toBeCalledTimes(1);
    });

    test('run: getUserPoolId returns user pool ID', async () => {
      const cognitoSetup = new CognitoSetup(constants);
      const cognitoMock = mockClient(CognitoIdentityProviderClient);
      mockCognito(cognitoMock);
      jest.spyOn(cognitoSetup, 'adminCreateUser');

      const returnVal = await cognitoSetup.run();
      expect(returnVal).toBeUndefined();
      expect(cognitoSetup.adminCreateUser).toBeCalledTimes(1);
    });
  });
});
