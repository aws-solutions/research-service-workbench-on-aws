/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { AnyPrincipal, PolicyDocument, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

describe('encryptionKeyWithRotation Test', () => {
  test('default values', () => {
    const stack = new Stack();
    new WorkbenchEncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey');

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::KMS::Key', 1);
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyPolicy: {
        Statement: [
          {
            Action: 'kms:*',
            Effect: 'Allow',
            Principal: {
              AWS: {
                'Fn::Join': [
                  '',
                  [
                    'arn:',
                    {
                      Ref: 'AWS::Partition'
                    },
                    ':iam::',
                    {
                      Ref: 'AWS::AccountId'
                    },
                    ':root'
                  ]
                ]
              }
            },
            Resource: '*',
            Sid: 'main-key-share-statement'
          }
        ],
        Version: '2012-10-17'
      },
      EnableKeyRotation: true
    });
  });

  test('should always use kms key with key rotation enabled', () => {
    const stack = new Stack();
    new WorkbenchEncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey', {
      enableKeyRotation: false
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: true
    });
  });

  test('should set removalPolicy to Destroy', () => {
    const stack = new Stack();
    new WorkbenchEncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey', {
      removalPolicy: RemovalPolicy.DESTROY
    });

    const template = Template.fromStack(stack);
    template.hasResource('AWS::KMS::Key', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });
  });

  test('should use customKeyPolicy', () => {
    const stack = new Stack();
    const customKeyPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['kms:*'],
          principals: [new AnyPrincipal()],
          resources: ['*'],
          sid: 'custom-key-share-statement'
        })
      ]
    });
    new WorkbenchEncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey', {
      policy: customKeyPolicy
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::KMS::Key', {
      KeyPolicy: {
        Statement: [
          {
            Action: 'kms:*',
            Effect: 'Allow',
            Principal: {
              AWS: '*'
            },
            Resource: '*',
            Sid: 'custom-key-share-statement'
          }
        ]
      }
    });
  });
});
