/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import {
  AttachRolePolicyCommand,
  CreatePolicyCommand,
  CreateRoleCommand,
  GetPolicyCommand,
  GetPolicyVersionCommand,
  GetRoleCommand,
  GetRolePolicyCommand,
  IAMClient,
  ListAttachedRolePoliciesCommand,
  ListRolePoliciesCommand,
  NoSuchEntityException,
  PutRolePolicyCommand
} from '@aws-sdk/client-iam';
import { mockClient } from 'aws-sdk-client-mock';
import AwsService from '../aws/awsService';
import { IamRoleCloneService } from './iamRoleCloneService';

describe('iamRoleCloneService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const sourceAccount = new AwsService({ region: 'us-east-1' });
  const targetAccount = new AwsService({ region: 'us-east-1' });
  const roleName = 'swb-dev-oh-LaunchConstraint';

  describe('cloneRole', () => {
    test('_copyRole', async () => {
      const service = new IamRoleCloneService(sourceAccount, targetAccount);
      service['_copyInlinePolicies'] = jest.fn();
      service['_copyManagedPolicies'] = jest.fn();
      service['_detachPoliciesThatAreNotMatching'] = jest.fn();
      const iamMock = mockClient(IAMClient);

      iamMock
        .on(GetRoleCommand)
        // Source Account
        .resolvesOnce({
          Role: {
            Path: '/',
            RoleName: roleName,
            AssumeRolePolicyDocument: 'A',
            RoleId: 'ABC',
            Arn: 'arn:aws:iam::0123456789012:role/swb-dev-oh-LaunchConstraint',
            CreateDate: new Date()
          }
        })
        // No target account role
        .rejectsOnce(
          new NoSuchEntityException({
            $metadata: {},
            message: ''
          })
        )
        .on(CreateRoleCommand)
        // Create Target Account Role
        .resolvesOnce({
          Role: {
            Path: '/',
            RoleName: roleName,
            AssumeRolePolicyDocument: 'A',
            RoleId: 'ABC',
            Arn: 'arn:aws:iam::0123456789012:role/swb-dev-oh-LaunchConstraint',
            CreateDate: new Date()
          }
        });
      await expect(service.cloneRole(roleName)).resolves.not.toThrowError();
    });

    test('_copyInlinePolicies', async () => {
      const service = new IamRoleCloneService(sourceAccount, targetAccount);
      service['_copyRole'] = jest.fn();
      service['_copyManagedPolicies'] = jest.fn();
      service['_detachPoliciesThatAreNotMatching'] = jest.fn();
      const iamMock = mockClient(IAMClient);
      // const iamMock = mockClient(IAMClient);
      iamMock
        .on(GetRoleCommand)
        .on(ListRolePoliciesCommand)
        // get source account policies
        .resolvesOnce({
          PolicyNames: ['policy1', 'policy2']
        })
        // get target account policies
        .resolvesOnce({
          PolicyNames: ['policy1']
        })
        .on(GetRolePolicyCommand)
        .resolves({ PolicyDocument: '' })
        .on(PutRolePolicyCommand)
        .resolves({});
      await expect(service.cloneRole(roleName)).resolves.not.toThrowError();
    });

    test('_copyManagedPolicies', async () => {
      const service = new IamRoleCloneService(sourceAccount, targetAccount);
      service['_copyRole'] = jest.fn();
      service['_copyInlinePolicies'] = jest.fn();
      service['_detachPoliciesThatAreNotMatching'] = jest.fn();
      const iamMock = mockClient(IAMClient);
      iamMock
        .on(ListAttachedRolePoliciesCommand)
        // Source Account Policies
        .resolvesOnce({
          AttachedPolicies: [
            { PolicyName: 'AmazonEC2FullAccess', PolicyArn: 'arn:aws:iam::aws:policy/AmazonEC2FullAccess' },
            {
              PolicyName: 'CustomerManagedPolicy',
              PolicyArn: ' arn:aws:iam::123456789012:policy/CustomerManagedPolicy'
            }
          ]
        })
        // Target Account Policies
        .resolvesOnce({
          AttachedPolicies: []
        })
        .on(AttachRolePolicyCommand)
        .resolves({})
        .on(GetPolicyCommand)
        .resolves({
          Policy: { PolicyName: 'CustomerManagedPolicy', Description: '', Path: '', DefaultVersionId: '' }
        })
        .on(GetPolicyVersionCommand)
        .resolves({
          PolicyVersion: { Document: '' }
        })
        .on(CreatePolicyCommand)
        .resolves({ Policy: { Arn: ' arn:aws:iam::0123456789012:policy/CustomerManagedPolicy' } })
        .on(AttachRolePolicyCommand)
        .resolves({});
      await expect(service.cloneRole(roleName)).resolves.not.toThrowError();
    });

    test('_detachPoliciesThatAreNotMatching', async () => {
      const service = new IamRoleCloneService(sourceAccount, targetAccount);
      service['_copyRole'] = jest.fn();
      service['_copyInlinePolicies'] = jest.fn();
      service['_copyManagedPolicies'] = jest.fn();
      const iamMock = mockClient(IAMClient);
      iamMock
        .on(ListAttachedRolePoliciesCommand)
        .resolves({
          AttachedPolicies: [
            { PolicyName: 'AmazonEC2FullAccess', PolicyArn: 'arn:aws:iam::aws:policy/AmazonEC2FullAccess' }
          ]
        })
        .on(ListRolePoliciesCommand)
        .resolvesOnce({
          PolicyNames: ['policy1', 'policy2']
        })
        .resolvesOnce({
          PolicyNames: ['policy1', 'policy2']
        });
      await expect(service.cloneRole(roleName)).resolves.not.toThrowError();
    });
  });
});
