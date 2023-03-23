/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

/* eslint-disable no-new */
import {
  WorkbenchEncryptionKeyWithRotation,
  WorkbenchSecureS3Bucket
} from '@aws/workbench-core-infrastructure';
import { Aws, CfnOutput, CfnResource, RemovalPolicy, Stack, StackProps } from 'aws-cdk-lib';
import { AccountPrincipal, PolicyStatement, Role } from 'aws-cdk-lib/aws-iam';
import { Key } from 'aws-cdk-lib/aws-kms';
import { CfnFunction } from 'aws-cdk-lib/aws-lambda';
import { Bucket } from 'aws-cdk-lib/aws-s3';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';
import { addAccessPointDelegationStatement, createAccessLogsBucket } from './helpers/helper-function';

export interface ExampleHostingStackProps extends StackProps {
  mainAccountId: string;
  crossAccountRoleName: string;
}

export class ExampleHostingStack extends Stack {
  public constructor(scope: Construct, id: string, props: ExampleHostingStackProps) {
    super(scope, id, props);

    const exampleHostingAccessLogsPrefix: string = 'example-hosting-access-log';

    const accessLogsBucket: Bucket = createAccessLogsBucket(
      this,
      'ExampleHostingS3AccessLogsBucket',
      exampleHostingAccessLogsPrefix,
      'ExampleHostingAccessLogsNameOutput'
    );

    const exampleHostingEncryptionKey: WorkbenchEncryptionKeyWithRotation =
      new WorkbenchEncryptionKeyWithRotation(this, 'ExampleHostingDataSetBucketEncryptionKey', {
        removalPolicy: RemovalPolicy.DESTROY
      });
    const encryptionKey: Key = exampleHostingEncryptionKey.key;

    const examplehostingDataSetBucket: Bucket = new WorkbenchSecureS3Bucket(
      this,
      'ExampleHostingDataSetBucket',
      {
        encryptionKey: encryptionKey,
        serverAccessLogsBucket: accessLogsBucket,
        serverAccessLogsPrefix: exampleHostingAccessLogsPrefix,
        removalPolicy: RemovalPolicy.DESTROY,
        autoDeleteObjects: true
      }
    ).bucket;

    new CfnOutput(this, 'ExampleHostS3DataSetsBucketName', {
      value: examplehostingDataSetBucket.bucketName
    });

    new CfnOutput(this, 'HostingAccountId', {
      value: Aws.ACCOUNT_ID
    });

    new CfnOutput(this, 'HostingAccountRegion', {
      value: Aws.REGION
    });

    addAccessPointDelegationStatement(examplehostingDataSetBucket);

    const exampleCrossAccountRole = new Role(this, props.crossAccountRoleName, {
      roleName: props.crossAccountRoleName,
      assumedBy: new AccountPrincipal(props.mainAccountId)
    });

    exampleCrossAccountRole.addToPolicy(
      new PolicyStatement({
        actions: [
          's3:GetObject',
          's3:GetObjectVersion',
          's3:GetObjectTagging',
          's3:AbortMultipartUpload',
          's3:ListMultipartUploadParts',
          's3:GetBucketPolicy',
          's3:PutBucketPolicy',
          's3:PutObject',
          's3:PutObjectAcl',
          's3:PutObjectTagging',
          's3:DeleteObject',
          's3:ListBucket',
          's3:PutAccessPointPolicy',
          's3:GetAccessPointPolicy',
          's3:CreateAccessPoint',
          's3:DeleteAccessPoint'
        ],
        resources: [
          examplehostingDataSetBucket.bucketArn,
          examplehostingDataSetBucket.arnForObjects('*'),
          `arn:${Aws.PARTITION}:s3:${this.region}:${this.account}:accesspoint/*`
        ]
      })
    );

    exampleCrossAccountRole.addToPolicy(
      new PolicyStatement({
        actions: ['kms:GetKeyPolicy', 'kms:PutKeyPolicy', 'kms:GenerateDataKey'], //GenerateDataKey is required when creating a DS through the API
        resources: [`arn:${Aws.PARTITION}:kms:${this.region}:${this.account}:key/*`]
      })
    );

    new CfnOutput(this, 'ExampleHostDatasetRoleOutput', {
      value: exampleCrossAccountRole.roleArn
    });

    //CFN NAG Suppression
    const exampleCrossAccountRoleNode = this.node.findChild(props.crossAccountRoleName);
    const exampleCrossAccountRoleMetaDataNode = exampleCrossAccountRoleNode.node.findChild(
      'Resource'
    ) as CfnResource;
    exampleCrossAccountRoleMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // Resource found with an explicit name, this disallows updates that require replacement of this resource
        {
          id: 'W28',
          reason: 'Explicit rolename required here'
        }
      ]
    });
    //DatasetBucket autoDelete custom Lambda
    const autoDeleteCustomResourceLambdaNode = this.node.findChild(
      'Custom::S3AutoDeleteObjectsCustomResourceProvider'
    );
    const autoDeleteCustomResourceLambdaMetaDataNode = autoDeleteCustomResourceLambdaNode.node.findChild(
      'Handler'
    ) as CfnFunction;
    autoDeleteCustomResourceLambdaMetaDataNode.addMetadata('cfn_nag', {
      // eslint-disable-next-line @typescript-eslint/naming-convention
      rules_to_suppress: [
        // // Lambda functions require permission to write CloudWatch Logs
        {
          id: 'W58',
          reason:
            'AWSCustomResource Lambda Function has AWSLambdaBasicExecutionRole policy attached which has the required permission to write to Cloudwatch Logs'
        },
        // Lambda functions should be deployed inside a VPC
        {
          id: 'W89',
          reason:
            'AWSCustomResource Lambda Function supports infrastructure deployment and is not deployed inside a VPC'
        },
        // Lambda functions should define ReservedConcurrentExecutions to reserve simultaneous executions
        {
          id: 'W92',
          reason:
            'AWSCustomResource Lambda Function used for provisioning infrastructure, reserved concurrency is not required'
        }
      ]
    });

    //CDK NAG Suppression
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/ExampleHostingStack/ExampleCrossAccountRole/DefaultPolicy/Resource',
      [
        // The IAM entity contains wildcard permissions and does not have a cdk-nag rule suppression with evidence for those permission
        {
          id: 'AwsSolutions-IAM5',
          reason: 'I am OK with using wildcard here'
        }
      ]
    );
  }
}
