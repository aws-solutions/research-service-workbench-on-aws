import { RemovalPolicy, Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { SecureS3Bucket } from './secureS3Bucket';

describe('SecureS3Bucket Test', () => {
  test('default values', () => {
    const stack = new Stack();

    const testAccessLogsBucket = new SecureS3Bucket(stack, 'TestS3AccessLogsBucket', {
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
    });

    new SecureS3Bucket(stack, 'TestS3Bucket', {
      serverAccessLogsBucket: testAccessLogsBucket.bucket,
      serverAccessLogsPrefix: 'test-access-log',
      removalPolicy: RemovalPolicy.DESTROY,
      autoDeleteObjects: true
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
        LogFilePrefix: 'test-access-log'
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
});
