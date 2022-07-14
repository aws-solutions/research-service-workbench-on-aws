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
  constructor(scope: Construct, id: string, props?: StackProps) {
    const { STAGE, API_BASE_URL, AWS_REGION } = getConstants();
    super(scope, id, {
      env: {
        region: AWS_REGION
      }
    });

    const bucket = this._createS3Bucket('S3BucketArtifactsArnOutput');
    this._deployS3Bucket(bucket);
    const originAccessIdentity = this._createIdentity(bucket);
    const redirectFunction = this._createRedirectFunction();
    const securityHeaders = this._createSecurityPolicy(API_BASE_URL);
    const distribution = this._createDistribution(
      originAccessIdentity,
      bucket,
      redirectFunction,
      securityHeaders
    );
  }
  private _createS3Bucket(s3ArtifactName: string): Bucket {
    const s3Bucket = new Bucket(this, 'swb-ui-bucket', {
      accessControl: BucketAccessControl.PRIVATE
    });

    new CfnOutput(this, s3ArtifactName, {
      value: s3Bucket.bucketArn
    });
    return s3Bucket;
  }
  private _deployS3Bucket(bucket: Bucket): void {
    new BucketDeployment(this, 'swb-ui-bucket-deployment', {
      destinationBucket: bucket,
      sources: [Source.asset(path.resolve(__dirname, '../../out'))]
    });
  }

  private _createIdentity(bucket: Bucket): OriginAccessIdentity {
    const originAccessIdentity = new OriginAccessIdentity(this, 'swb-ui-origin-access-identity');
    bucket.grantRead(originAccessIdentity);
    return originAccessIdentity;
  }

  private _createDistribution(
    originAccessIdentity: OriginAccessIdentity,
    bucket: Bucket,
    redirectFunction: Function,
    securityPolicy: ResponseHeadersPolicy
  ): Distribution {
    const distribution = new Distribution(this, 'swb-ui-distribution', {
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
    new CfnOutput(this, 'S3DistributionArtifactsDomain', {
      value: distribution.distributionDomainName
    });
    return distribution;
  }

  private _createRedirectFunction(): Function {
    return new Function(this, 'swb-ui-redirect-distribution-function', {
      code: FunctionCode.fromFile({
        filePath: path.join(__dirname, '../src/redirectFunction.js')
      }),
      functionName: 'RedirectRoutingFunction'
    });
  }

  private _createSecurityPolicy(apiBaseUrl: string): ResponseHeadersPolicy {
    return new ResponseHeadersPolicy(this, 'ResponseHeadersPolicy', {
      responseHeadersPolicyName: 'swb-ui-policy',
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
