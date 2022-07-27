/*
 *  Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
 *  SPDX-License-Identifier: Apache-2.0
 */

import * as path from 'path';
import { CfnOutput, Duration, Fn, Stack, StackProps } from 'aws-cdk-lib';
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  OriginAccessIdentity,
  ResponseHeadersPolicy,
  ViewerProtocolPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { AnyPrincipal, Effect, PolicyStatement } from 'aws-cdk-lib/aws-iam';
import { BlockPublicAccess, Bucket, BucketAccessControl, BucketEncryption } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import { getConstants } from './constants';

export class SWBUIStack extends Stack {
  public distributionEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    API_BASE_URL: string;
    AWS_REGION: string;
    S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY: string;
    S3_ARTIFACT_BUCKET_NAME: string;
    S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME: string;
    ACCESS_IDENTITY_ARTIFACT_NAME: string;
    DISTRIBUTION_ARTIFACT_NAME: string;
    DISTRIBUTION_ARTIFACT_DOMAIN: string;
    DISTRIBUTION_FUNCTION_ARTIFACT_NAME: string;
    DISTRIBUTION_FUNCTION_NAME: string;
    RESPONSE_HEADERS_ARTIFACT_NAME: string;
    RESPONSE_HEADERS_NAME: string;
  };
  constructor(scope: Construct, id: string, props?: StackProps) {
    const {
      STAGE,
      STACK_NAME,
      API_BASE_URL,
      AWS_REGION,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
      S3_ARTIFACT_BUCKET_NAME,
      S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME,
      ACCESS_IDENTITY_ARTIFACT_NAME,
      DISTRIBUTION_ARTIFACT_NAME,
      DISTRIBUTION_ARTIFACT_DOMAIN,
      DISTRIBUTION_FUNCTION_ARTIFACT_NAME,
      DISTRIBUTION_FUNCTION_NAME,
      RESPONSE_HEADERS_ARTIFACT_NAME,
      RESPONSE_HEADERS_NAME
    } = getConstants();
    super(scope, STACK_NAME, {
      env: {
        region: AWS_REGION
      }
    });

    this.distributionEnvVars = {
      STAGE,
      STACK_NAME,
      API_BASE_URL,
      AWS_REGION,
      S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY,
      S3_ARTIFACT_BUCKET_NAME,
      S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME,
      ACCESS_IDENTITY_ARTIFACT_NAME,
      DISTRIBUTION_ARTIFACT_NAME,
      DISTRIBUTION_ARTIFACT_DOMAIN,
      DISTRIBUTION_FUNCTION_ARTIFACT_NAME,
      DISTRIBUTION_FUNCTION_NAME,
      RESPONSE_HEADERS_ARTIFACT_NAME,
      RESPONSE_HEADERS_NAME
    };
    const bucket = this._createS3Bucket(S3_ARTIFACT_BUCKET_NAME, S3_ARTIFACT_BUCKET_ARN_OUTPUT_KEY);
    const distribution = this._createDistribution(bucket);
    this._deployS3BucketAndInvalidateDistribution(bucket, distribution);
  }

  private _addS3TLSSigV4BucketPolicy(s3Bucket: Bucket): void {
    s3Bucket.addToResourcePolicy(
      new PolicyStatement({
        sid: 'Deny requests that do not use TLS/HTTPS',
        effect: Effect.DENY,
        principals: [new AnyPrincipal()],
        actions: ['s3:*'],
        resources: [s3Bucket.bucketArn, `${s3Bucket.bucketArn}/*`],
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
        resources: [`${s3Bucket.bucketArn}/*`],
        conditions: {
          StringNotEquals: {
            's3:signatureversion': 'AWS4-HMAC-SHA256'
          }
        }
      })
    );
  }

  private _createS3Bucket(bucketName: string, outputKey: string): Bucket {
    const { S3_ACCESS_LOGS_BUCKET_PREFIX, S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY } = getConstants();
    const accessLogsBucketName: string = Fn.importValue(S3_ACCESS_LOGS_BUCKET_NAME_OUTPUT_KEY);
    const accessLogsBucket = Bucket.fromBucketName(
      this,
      'imported-access-logs-bucket',
      accessLogsBucketName
    ) as Bucket;
    const s3Bucket = new Bucket(this, bucketName, {
      accessControl: BucketAccessControl.PRIVATE,
      blockPublicAccess: BlockPublicAccess.BLOCK_ALL,
      serverAccessLogsBucket: accessLogsBucket,
      serverAccessLogsPrefix: S3_ACCESS_LOGS_BUCKET_PREFIX,
      encryption: BucketEncryption.S3_MANAGED // CloudFront requires S3 managed key
    });

    this._addS3TLSSigV4BucketPolicy(s3Bucket);

    new CfnOutput(this, outputKey, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }

  private _deployS3BucketAndInvalidateDistribution(bucket: Bucket, distribution: Distribution): void {
    new BucketDeployment(this, this.distributionEnvVars.S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME, {
      destinationBucket: bucket,
      sources: [Source.asset(path.resolve(__dirname, '../../out'))],
      distribution: distribution,
      distributionPaths: ['/*'] //invalidates cache for all routes so we can immediatly see updated code when deploying
    });
  }

  private _createOriginAccessIdentity(bucket: Bucket): OriginAccessIdentity {
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      this.distributionEnvVars.ACCESS_IDENTITY_ARTIFACT_NAME
    );
    bucket.grantRead(originAccessIdentity);
    return originAccessIdentity;
  }

  private _createDistribution(bucket: Bucket): Distribution {
    const originAccessIdentity = this._createOriginAccessIdentity(bucket);
    const redirectFunction = this._createRedirectFunction();
    const securityPolicy = this._createSecurityPolicy(this.distributionEnvVars.API_BASE_URL);
    const distribution = new Distribution(this, this.distributionEnvVars.DISTRIBUTION_ARTIFACT_NAME, {
      defaultRootObject: 'index.html',
      enableLogging: true,
      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity }),
        responseHeadersPolicy: securityPolicy,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: FunctionEventType.VIEWER_REQUEST
          }
        ],
        viewerProtocolPolicy: ViewerProtocolPolicy.HTTPS_ONLY
      },
      additionalBehaviors: {}
    });
    new CfnOutput(this, this.distributionEnvVars.DISTRIBUTION_ARTIFACT_DOMAIN, {
      value: `https://${distribution.distributionDomainName}`
    });
    return distribution;
  }
  /*
  Cloudfront access files from S3 Bucket as file path directory.
  This function recieves the web routing format URL and transforms it into file path.
  e.g. /environments => /environments/index.html
*/
  private _createRedirectFunction(): Function {
    return new Function(this, this.distributionEnvVars.DISTRIBUTION_FUNCTION_ARTIFACT_NAME, {
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, '../src/redirectFunction.js')
      }),
      functionName: this.distributionEnvVars.DISTRIBUTION_FUNCTION_NAME
    });
  }

  private _createSecurityPolicy(apiBaseUrl: string): ResponseHeadersPolicy {
    return new ResponseHeadersPolicy(this, this.distributionEnvVars.RESPONSE_HEADERS_ARTIFACT_NAME, {
      responseHeadersPolicyName: this.distributionEnvVars.RESPONSE_HEADERS_NAME,
      comment: 'Security policy',
      securityHeadersBehavior: {
        contentSecurityPolicy: {
          contentSecurityPolicy: this._getContentSecurityPolicy(apiBaseUrl),
          override: false
        },
        contentTypeOptions: { override: true },
        frameOptions: { frameOption: HeadersFrameOption.SAMEORIGIN, override: false },
        referrerPolicy: {
          referrerPolicy: HeadersReferrerPolicy.STRICT_ORIGIN_WHEN_CROSS_ORIGIN,
          override: false
        },
        strictTransportSecurity: {
          accessControlMaxAge: Duration.seconds(31536000),
          includeSubdomains: false,
          override: false
        },
        xssProtection: { protection: true, modeBlock: true, override: false }
      }
    });
  }
  private _getContentSecurityPolicy(apiBaseUrl: string): string {
    return `default-src 'none'; connect-src ${apiBaseUrl}; img-src 'self' data:; script-src 'self'; style-src 'unsafe-inline' 'strict-dynamic' 'self'; font-src 'self' data:`;
  }
}
