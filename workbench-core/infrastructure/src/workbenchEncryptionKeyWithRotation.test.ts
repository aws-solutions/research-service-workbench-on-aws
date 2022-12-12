import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
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
});
