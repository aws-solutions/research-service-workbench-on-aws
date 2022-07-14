import { CfnOutput, Duration, Stack, StackProps } from 'aws-cdk-lib';
import {
  Distribution,
  Function,
  FunctionCode,
  FunctionEventType,
  HeadersFrameOption,
  HeadersReferrerPolicy,
  OriginAccessIdentity,
  ResponseHeadersPolicy
} from 'aws-cdk-lib/aws-cloudfront';
import { S3Origin } from 'aws-cdk-lib/aws-cloudfront-origins';
import { Bucket, BucketAccessControl } from 'aws-cdk-lib/aws-s3';
import { BucketDeployment, Source } from 'aws-cdk-lib/aws-s3-deployment';
import { Construct } from 'constructs';
import * as path from 'path';
import { getConstants } from '../src/constants';

export class CdkInfrastructureStack extends Stack {
  public distributionEnvVars: {
    STAGE: string;
    STACK_NAME: string;
    API_BASE_URL: string;
    AWS_REGION: string;
    S3_ARTIFACT_BUCKET_ARN_NAME: string;
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
      S3_ARTIFACT_BUCKET_ARN_NAME,
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
      S3_ARTIFACT_BUCKET_ARN_NAME,
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
    const bucket = this._createS3Bucket(S3_ARTIFACT_BUCKET_ARN_NAME);
    this._deployS3Bucket(bucket);
    const originAccessIdentity = this._createIdentity(bucket);
    const redirectFunction = this._createRedirectFunction();
    const securityHeaders = this._createSecurityPolicy(API_BASE_URL);
    this._createDistribution(originAccessIdentity, bucket, redirectFunction, securityHeaders);
  }
  private _createS3Bucket(s3ArtifactName: string): Bucket {
    const s3Bucket = new Bucket(this, this.distributionEnvVars.S3_ARTIFACT_BUCKET_NAME, {
      accessControl: BucketAccessControl.PRIVATE
    });

    new CfnOutput(this, this.distributionEnvVars.S3_ARTIFACT_BUCKET_ARN_NAME, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }
  private _deployS3Bucket(bucket: Bucket): void {
    new BucketDeployment(this, this.distributionEnvVars.S3_ARTIFACT_BUCKET_DEPLOYMENT_NAME, {
      destinationBucket: bucket,
      sources: [Source.asset(path.resolve(__dirname, '../../out'))]
    });
  }

  private _createIdentity(bucket: Bucket): OriginAccessIdentity {
    const originAccessIdentity = new OriginAccessIdentity(
      this,
      this.distributionEnvVars.ACCESS_IDENTITY_ARTIFACT_NAME
    );
    bucket.grantRead(originAccessIdentity);
    return originAccessIdentity;
  }

  private _createDistribution(
    originAccessIdentity: OriginAccessIdentity,
    bucket: Bucket,
    redirectFunction: Function,
    securityPolicy: ResponseHeadersPolicy
  ): Distribution {
    const distribution = new Distribution(this, this.distributionEnvVars.DISTRIBUTION_ARTIFACT_NAME, {
      defaultRootObject: 'index.html',

      defaultBehavior: {
        origin: new S3Origin(bucket, { originAccessIdentity }),
        responseHeadersPolicy: securityPolicy,
        functionAssociations: [
          {
            function: redirectFunction,
            eventType: FunctionEventType.VIEWER_REQUEST
          }
        ]
      },
      additionalBehaviors: {}
    });
    new CfnOutput(this, this.distributionEnvVars.DISTRIBUTION_ARTIFACT_DOMAIN, {
      value: distribution.distributionDomainName
    });
    return distribution;
  }

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
    return `default-src 'self'; connect-src ${apiBaseUrl}; font-src 'self' data: ; style-src 'self' 'unsafe-inline';`;
  }
}
