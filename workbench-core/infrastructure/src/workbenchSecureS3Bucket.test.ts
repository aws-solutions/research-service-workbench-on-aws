/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { BlockPublicAccess, Bucket, BucketEncryption, ObjectOwnership } from 'aws-cdk-lib/aws-s3';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';
import { WorkbenchSecureS3Bucket } from './workbenchSecureS3Bucket';

describe('SecureS3Bucket Test', () => {
  let testS3AccessLogsBucket: Bucket;
  let stack: Stack;

  test('default values', () => {
    stack = new Stack();

    testS3AccessLogsBucket = new Bucket(stack, 'testS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });

    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      serverAccessLogsBucket: testS3AccessLogsBucket
    });

    const template = Template.fromStack(stack);
    template.resourceCountIs('AWS::S3::Bucket', 2);
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
      },
      OwnershipControls: {
        Rules: [
          {
            ObjectOwnership: 'ObjectWriter'
          }
        ]
      }
    });

    // test removal policy
    template.hasResource('AWS::S3::Bucket', {
      DeletionPolicy: 'Delete',
      UpdateReplacePolicy: 'Delete'
    });
  });

  test('should always block All Public Access', () => {
    stack = new Stack();

    testS3AccessLogsBucket = new Bucket(stack, 'testS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ACLS,
      serverAccessLogsBucket: testS3AccessLogsBucket
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
    stack = new Stack();
    testS3AccessLogsBucket = new Bucket(stack, 'testS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      encryption: BucketEncryption.S3_MANAGED,
      serverAccessLogsBucket: testS3AccessLogsBucket
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
    stack = new Stack();
    testS3AccessLogsBucket = new Bucket(stack, 'testS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });
    const encryptionKey = new WorkbenchEncryptionKeyWithRotation(stack, 'test-EncryptionKey');
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      encryptionKey: encryptionKey.key,
      serverAccessLogsBucket: testS3AccessLogsBucket
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
    stack = new Stack();
    testS3AccessLogsBucket = new Bucket(stack, 'testS3AccessLogsBucket', {
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      versioned: true,
      enforceSSL: true,
      encryption: BucketEncryption.S3_MANAGED,
      removalPolicy: RemovalPolicy.DESTROY,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    });
    new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
      serverAccessLogsPrefix: 'test-s3-bucket-access-log',
      serverAccessLogsBucket: testS3AccessLogsBucket
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::S3::Bucket', {
      LoggingConfiguration: {
        LogFilePrefix: 'test-s3-bucket-access-log'
      }
    });
  });
});
