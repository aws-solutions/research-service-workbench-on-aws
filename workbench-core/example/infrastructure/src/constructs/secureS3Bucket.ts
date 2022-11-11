/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import { CfnOutput } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import {
  BlockPublicAccess,
  Bucket,
  BucketAccessControl,
  BucketEncryption,
  BucketProps,
  CfnBucketPolicy
} from 'aws-cdk-lib/aws-s3';
import { Construct } from 'constructs';

export interface SecureBucketProps extends BucketProps {
  s3BucketId: string;
  s3OutputId: string;
  encryptionKey: Key;
  serverAccessLogsPrefix: string;
  serverAccessLogsBucket: Bucket;
}

export class SecureS3Bucket extends Construct {
  public bucket: Bucket;

  public constructor(scope: Construct, id: string, props: SecureBucketProps) {
    super(scope, id);

    const secureS3BucketProps: BucketProps = {
      ...props,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      encryption:
        props.encryption && props.encryption !== BucketEncryption.UNENCRYPTED
          ? props.encryption
          : BucketEncryption.KMS,
      encryptionKey: props.encryptionKey,
      versioned: true,
      enforceSSL: true,
      serverAccessLogsBucket: props.serverAccessLogsBucket,
      serverAccessLogsPrefix: props.serverAccessLogsPrefix,
      accessControl: BucketAccessControl.LOG_DELIVERY_WRITE,
      removalPolicy: props.removalPolicy,
      autoDeleteObjects: props.autoDeleteObjects
    };

    this.bucket = new Bucket(this, props.s3BucketId, secureS3BucketProps);
    this._addS3TLSSigV4BucketPolicy(this.bucket);

    // eslint-disable-next-line no-new
    new CfnOutput(this, props.s3OutputId, {
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
