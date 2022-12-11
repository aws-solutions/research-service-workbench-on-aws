import { Stack } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { EncryptionKeyWithRotation } from './encryptionKeyWithRotation';

describe('encryptionKeyWithRotation Test', () => {
  test('default values', () => {
    const stack = new Stack();
    new EncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey');

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
        ]
      },
      EnableKeyRotation: true
    });
  });

  test('Disable key rotation', () => {
    const stack = new Stack();
    new EncryptionKeyWithRotation(stack, 'TestS3Bucket-EncryptionKey', {
      enableKeyRotation: false
    });

    const template = Template.fromStack(stack);
    template.hasResourceProperties('AWS::KMS::Key', {
      EnableKeyRotation: false
    });
  });
});
