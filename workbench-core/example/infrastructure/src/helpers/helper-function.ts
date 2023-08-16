/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import { Aws, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { AnyPrincipal, Effect, PolicyStatement, ServicePrincipal } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketEncryption, CfnBucket } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export function createAccessLogsBucket(
  scope: Construct,
  id: string,
  accessLogPrefix: string,
  bucketNameOutput: string
): Bucket {
  const accessLogBucket = new Bucket(scope, id, {
    blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
    versioned: true,
    enforceSSL: true,
    encryption: BucketEncryption.S3_MANAGED,
    removalPolicy: RemovalPolicy.DESTROY,
    autoDeleteObjects: true
  });

  accessLogBucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new ServicePrincipal('logging.s3.amazonaws.com')],
      actions: ['s3:PutObject'],
      resources: [`${accessLogBucket.bucketArn}/${accessLogPrefix}*`],
      conditions: {
        StringEquals: {
          'aws:SourceAccount': Aws.ACCOUNT_ID
        }
      }
    })
  );

  //CFN NAG Suppression
  const exampleS3AccessLogsBucketNode = accessLogBucket.node.defaultChild as CfnBucket;
  exampleS3AccessLogsBucketNode.addMetadata('cfn_nag', {
    // eslint-disable-next-line @typescript-eslint/naming-convention
    rules_to_suppress: [
      // S3 Bucket should have access logging configured
      {
        id: 'W35',
        reason:
          "This is an access log bucket, we don't need to configure access logging for access log buckets"
      }
    ]
  });

  new CfnOutput(scope, bucketNameOutput, {
    value: accessLogBucket.bucketName,
    exportName: bucketNameOutput
  });

  //CDK NAG Suppression
  NagSuppressions.addResourceSuppressions(accessLogBucket, [
    // The S3 Bucket has server access logs disabled.
    {
      id: 'AwsSolutions-S1',
      reason: "This is an access log bucket, we don't need to configure access logging for access log buckets"
    }
  ]);

  return accessLogBucket;
}

export function addAccessPointDelegationStatement(s3Bucket: Bucket): void {
  s3Bucket.addToResourcePolicy(
    new PolicyStatement({
      effect: Effect.ALLOW,
      principals: [new AnyPrincipal()],
      actions: ['s3:*'],
      resources: [s3Bucket.bucketArn, s3Bucket.arnForObjects('*')],
      conditions: {
        StringEquals: {
          's3:DataAccessPointAccount': Aws.ACCOUNT_ID
        }
      }
    })
  );
}
