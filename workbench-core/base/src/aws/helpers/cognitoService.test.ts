/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AdminListGroupsForUserCommand,
  CognitoIdentityProvider,
  ServiceInputTypes,
  ServiceOutputTypes
} from '@aws-sdk/client-cognito-identity-provider';
import { AwsStub, mockClient } from 'aws-sdk-client-mock';
import CognitoService from './cognitoService';

describe('appRegistryService', () => {
  let cognitoService: CognitoService;
  let mockCognitoClient: AwsStub<ServiceInputTypes, ServiceOutputTypes>;

  const mockGroupOne = {
    CreationDate: new Date('2023-06-01T20:38:30.383Z'),
    Description: undefined,
    GroupName: 'proj-12345678-1234-1234-1234-12345678910#Researcher',
    LastModifiedDate: new Date('2023-06-01T20:38:30.383Z'),
    Precedence: undefined,
    RoleArn: undefined,
    UserPoolId: 'us-west-2_123456789'
  };
  const mockGroupTwo = {
    CreationDate: new Date('2023-06-01T20:38:30.383Z'),
    Description: undefined,
    GroupName: 'proj-12345678-1234-1234-1234-12345678910#Admin',
    LastModifiedDate: new Date('2023-06-01T20:38:30.383Z'),
    Precedence: undefined,
    RoleArn: undefined,
    UserPoolId: 'us-west-2_123456789'
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockCognitoClient = mockClient(CognitoIdentityProvider);
    cognitoService = new CognitoService(new CognitoIdentityProvider({}));
  });

  describe('getUserGroups', () => {
    test('Return all groups when responses were paginated', async () => {
      mockCognitoClient
        .on(AdminListGroupsForUserCommand)
        .resolvesOnce({ Groups: [mockGroupOne], NextToken: '1234567' })
        .resolvesOnce({ Groups: [mockGroupTwo] });
      await expect(cognitoService.getUserGroups('fakeUserPoolId', 'fakeUserName')).resolves.toStrictEqual([
        mockGroupOne,
        mockGroupTwo
      ]);
    });

    test('Return all groups when responses were not paginated', async () => {
      mockCognitoClient.on(AdminListGroupsForUserCommand).resolvesOnce({ Groups: [mockGroupTwo] });
      await expect(cognitoService.getUserGroups('fakeUserPoolId', 'fakeUserName')).resolves.toStrictEqual([
        mockGroupTwo
      ]);
    });
  });
});
