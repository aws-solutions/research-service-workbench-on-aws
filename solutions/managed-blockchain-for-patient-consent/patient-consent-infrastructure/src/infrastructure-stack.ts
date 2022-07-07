/* eslint-disable no-new */
import { join } from 'path';
import { Stack, StackProps, CfnOutput, RemovalPolicy, aws_kms, Duration, Fn } from 'aws-cdk-lib';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as iam from 'aws-cdk-lib/aws-iam';
import { Runtime } from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export interface PatientConsentStackProps extends StackProps {
  stage: string;
  region: string;
  logLevel: string;
}

export class InfrastructureStack extends Stack {
  public constructor(scope: Construct, id: string, props?: PatientConsentStackProps) {
    super(scope, id, props);

    const partition = Stack.of(this).partition;
    const region = Stack.of(this).region;

    const lambdaServiceRole = new iam.Role(this, 'LambdaServiceRole', {
      assumedBy: new iam.ServicePrincipal('lambda.amazonaws.com'),
      roleName: 'LambdaServiceRole'
    });

    const lambdaService = new nodejsLambda.NodejsFunction(this, 'LambdaService', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'clientAppHandler',
      depsLockFilePath: join(__dirname, '/../../../../common/config/rush/pnpm-lock.yaml'),
      entry: join(__dirname, '/../src/lambdas/client-app.ts'),
      bundling: {
        externalModules: ['aws-sdk']
      },
      role: lambdaServiceRole
    });

    const kmsKeyPolicyDocument = new iam.PolicyDocument({
      statements: [
        new iam.PolicyStatement({
          actions: ['kms:*'],
          effect: iam.Effect.ALLOW,
          principals: [new iam.AccountRootPrincipal()],
          resources: ['*']
        }),
        new iam.PolicyStatement({
          actions: [
            'kms:Encrypt*',
            'kms:Decrypt*',
            'kms:ReEncrypt*',
            'kms:GenerateDataKey*',
            'kms:Describe*'
          ],
          effect: iam.Effect.ALLOW,
          principals: [new iam.ServicePrincipal(Fn.sub('logs.${AWS::Region}.amazonaws.com'))],
          resources: [`arn:${partition}:logs:${region}:*:*`]
        })
      ]
    });

    const kmsKey = new aws_kms.Key(this, 'KMSKey', {
      enableKeyRotation: true,
      removalPolicy: RemovalPolicy.DESTROY,
      pendingWindow: Duration.days(7),
      policy: kmsKeyPolicyDocument
    });

    const logGroup = new LogGroup(this, 'log', {
      logGroupName: 'restApiLogGroup',
      encryptionKey: kmsKey
    });

    const restApi = new apigateway.LambdaRestApi(this, 'RestApi', {
      handler: lambdaService,
      proxy: false,
      cloudWatchRole: false,
      endpointConfiguration: {
        types: [apigateway.EndpointType.EDGE]
      },
      deployOptions: {
        tracingEnabled: true,
        accessLogDestination: new apigateway.LogGroupLogDestination(logGroup),
        accessLogFormat: apigateway.AccessLogFormat.custom(
          `${apigateway.AccessLogField.contextRequestId()} ${apigateway.AccessLogField.contextErrorMessage()} ${apigateway.AccessLogField.contextErrorMessageString()}`
        )
      }
    });

    const requestValidator = new apigateway.RequestValidator(this, 'MyRequestValidator', {
      restApi: restApi,
      requestValidatorName: 'requestValidatorName',
      validateRequestBody: false,
      validateRequestParameters: false
    });

    restApi.root
      .addResource('patient-consent')
      .addMethod('POST', new apigateway.LambdaIntegration(lambdaService), {
        requestValidator: requestValidator,
        authorizationType: apigateway.AuthorizationType.IAM,
        apiKeyRequired: false
      });

    new CfnOutput(this, 'HttpEndpoint', {
      value: restApi.url,
      exportName: 'HttpApiEndPoint'
    });

    /**
     * cdk-nag suppressions
     */

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/patient-consent/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/DeploymentStage.prod/Resource',
      [
        { id: 'AwsSolutions-APIG3', reason: 'Access is configured by IAM role and API key' },
        { id: 'AwsSolutions-APIG6', reason: 'We will enable CloudWatch logging for all methods when defined' }
      ]
    );
  }
}
