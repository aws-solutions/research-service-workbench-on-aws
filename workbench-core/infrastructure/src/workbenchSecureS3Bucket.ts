/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnOutput } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BucketProps,
  CfnBucketPolicy,
  ObjectOwnership
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';
import { WorkbenchEncryptionKeyWithRotation } from './workbenchEncryptionKeyWithRotation';

export class WorkbenchSecureS3Bucket extends Construct {
  public readonly bucket: Bucket;

  public constructor(scope: Construct, id: string, props?: BucketProps) {
    super(scope, id);

    const secureS3BucketProps: BucketProps = {
      ...props,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption: BucketEncryption.KMS,
      encryptionKey:
        props?.encryptionKey ?? new WorkbenchEncryptionKeyWithRotation(this, `${id}-EncryptionKey`).key,
      versioned: true,
      enforceSSL: true,
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      serverAccessLogsPrefix: props?.serverAccessLogsPrefix ?? `${id.toLowerCase()}-access-log`,
      objectOwnership: ObjectOwnership.OBJECT_WRITER
    };

    this.bucket = new Bucket(this, `${id}-Bucket`, secureS3BucketProps);
    this._addS3TLSSigV4BucketPolicy(this.bucket);

    // eslint-disable-next-line no-new
    new CfnOutput(this, `${id}-Output`, {
      value: this.bucket.bucketArn
    });
  }

  private _addS3TLSSigV4BucketPolicy(s3Bucket: Bucket): void {
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny requests that do not use TLS/HTTPS',
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.bucketArn, s3Bucket.arnForObjects('*')],
        conditions: {
          Bool: {
            'aws:SecureTransport': 'false'
          }
        }
      })
    );
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny requests that do not use SigV4',
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.arnForObjects('*')],
        conditions: {
          StringNotEquals: {
            's3:signatureversion': 'AWS4-HMAC-SHA256'
          }
        }
      })
    );

    //CFN NAG Suppression
    const s3BucketPolicyNode = s3Bucket.node.findChild('Policy');
    const s3BucketPolicyMetaDataNode = s3BucketPolicyNode.node.defaultChild as CfnBucketPolicy;

    s3BucketPolicyMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        {
          id: 'F15',
          reason: 'All S3 actions needs to be denied, this is ok !'
        },
        {
          id: 'F16',
          reason: 'All Principals needs to be denied, this is ok !'
        }
      ]
    });
  }
}
