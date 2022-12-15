/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BlockPublicAccess, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';
import { WorkbenchSecureS3Bucket } from './workbenchSecureS3Bucket';

describe('SecureS3Bucket Test', () => {
  test('default values', () => {
    const stack = new Stack();
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket');

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::S3::Bucket', 1);
    template.hasResourceProperties('AWS::S3::Bucket', {
      AccessControl: 'LogDeliveryWrite',
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'aws:kms'
            }
          }
        ]
      },
      LoggingConfiguration: {
        LogFilePrefix: 'tests3bucket-access-log'
      },
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      },
      VersioningConfiguration: {
        Status: 'Enabled'
      }
    });
  });

  test('should always block All Public Access', () => {
    const stack = new Stack();
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      PublicAccessBlockConfiguration: {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      }
    });
  });

  test('should always use kms key encryption', () => {
    const stack = new Stack();
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      encryption: BucketEncryption.S3_MANAGED
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              SSEAlgorithm: 'aws:kms'
            }
          }
        ]
      }
    });
  });

  test('should use custom encryption key', () => {
    const stack = new Stack();
    const encryptionKey = new WorkbenchEncryptionKeyWithRotation(stack, 'test-EncryptionKey');
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      encryptionKey: encryptionKey.key
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      BucketEncryption: {
        ServerSideEncryptionConfiguration: [
          {
            ServerSideEncryptionByDefault: {
              KMSMasterKeyID: {
                'Fn::GetAtt': ['testEncryptionKeytestEncryptionKeyKey2FA1432D', 'Arn']
              },
              SSEAlgorithm: 'aws:kms'
            }
          }
        ]
      }
    });
  });

  test('should use custom access log prefix', () => {
    const stack = new Stack();

    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      serverAccessLogsPrefix: 'test-s3-bucket-access-log'
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      LoggingConfiguration: {
        LogFilePrefix: 'test-s3-bucket-access-log'
      }
    });
  });
});
