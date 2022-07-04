/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as iam from 'aws-cdk-lib/aws-iam';
import * as s3 from 'aws-cdk-lib/aws-s3';
import * as constructs from 'constructs';

import * as network from './network';

/**
 * Creates a S3 bucket used for sharing certs between members to assemble channel information
 */
export class HyperledgerFabricS3 extends constructs.Construct {
  /**
   * The client VPC that has endpoint to access the Amazon Managed Blockchain
   */
  public readonly s3: s3.Bucket;

  public constructor(scope: network.HyperledgerFabricNetwork, id: string) {
    super(scope, id);

    // Collect metadata on the stack
    const additionalMembers = scope.additionalMembers;

    this.s3 = new s3.Bucket(this, 'CertsSharingBucket', {
      encryption: s3.BucketEncryption.S3_MANAGED,
      blockPublicAccess: s3.BlockPublicAccess.BLOCK_ALL,
      enforceSSL: true,
      serverAccessLogsPrefix: 'access-log',
      bucketName: `namespace-certs-bucket`
    });

    this.s3.addToResourcePolicy(
      new iam.PolicyStatement({
        actions: ['s3:PutObject'],
        resources: [`${this.s3.bucketArn}/*`],
        principals: additionalMembers.map((member) => new iam.AccountPrincipal(member))
      })
    );
  }
}
