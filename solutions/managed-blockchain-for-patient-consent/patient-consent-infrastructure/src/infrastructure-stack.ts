/* eslint-disable no-new */
import { join } from 'path';
import { Stack, StackProps, CfnOutput, RemovalPolicy, aws_kms, Duration, Fn } from 'aws-cdk-lib';
import {
  AuthorizationType,
  LambdaIntegration,
  AccessLogFormat,
  LogGroupLogDestination,
  LambdaRestApi,
  RequestValidator,
  AccessLogField
} from 'aws-cdk-lib/aws-apigateway';

import {
  AccountRootPrincipal,
  Effect,
  PolicyDocument,
  PolicyStatement,
  ServicePrincipal
} from 'aws-cdk-lib/aws-iam';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import * as nodejsLambda from 'aws-cdk-lib/aws-lambda-nodejs';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const partition = Stack.of(this).partition;
    const region = Stack.of(this).region;

    const lambdaService = new nodejsLambda.NodejsFunction(this, 'LambdaService', {
      runtime: Runtime.NODEJS_16_X,
      handler: 'clientAppHandler',
      depsLockFilePath: join(__dirname, '/../../../../common/config/rush/pnpm-lock.yaml'),
      entry: join(__dirname, '/../src/lambdas/client-app.ts'),
      bundling: {
        externalModules: ['aws-sdk']
      }
    });

    const kmsKeyPolicyDocument = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: ['kms:*'],
          effect: Effect.ALLOW,
          principals: [new AccountRootPrincipal()],
          resources: ['*']
        }),
        new PolicyStatement({
          actions: [
            'kms:Encrypt*',
            'kms:Decrypt*',
            'kms:ReEncrypt*',
            'kms:GenerateDataKey*',
            'kms:Describe*'
          ],
          effect: Effect.ALLOW,
          principals: [new ServicePrincipal(Fn.sub('logs.${AWS::Region}.amazonaws.com'))],
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

    const restApi = new LambdaRestApi(this, 'RestApi', {
      handler: lambdaService,
      proxy: false,
      cloudWatchRole: false,
      deployOptions: {
        tracingEnabled: true,
        accessLogDestination: new LogGroupLogDestination(logGroup),
        accessLogFormat: AccessLogFormat.custom(
          `${AccessLogField.contextRequestId()} ${AccessLogField.contextErrorMessage()} ${AccessLogField.contextErrorMessageString()}`
        )
      }
    });

    const requestValidator = new RequestValidator(this, 'MyRequestValidator', {
      restApi: restApi,
      requestValidatorName: 'requestValidatorName',
      validateRequestBody: false,
      validateRequestParameters: false
    });

    restApi.root.addResource('patient-consent').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
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
      '/InfrastructureStack/LambdaService/ServiceRole/Resource',
      [{ id: 'AwsSolutions-IAM4', reason: "I'm ok using managed policies for this example" }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/patient-consent/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/DeploymentStage.prod/Resource',
      [
        {
          id: 'AwsSolutions-APIG3',
          reason: 'Access is configured by IAM role and API key'
        },
        {
          id: 'AwsSolutions-APIG6',
          reason: 'We will not be using CloudWatch not needed at this time'
        }
      ]
    );
    // NagSuppressions.addResourceSuppressionsByPath(this, '/InfrastructureStack/LambdaService/Resource', [
    //   {
    //     id: 'AwsSolutions-L1',
    //     reason: 'We are using Node14 for Lambda functions'
    //   }
    // ]);
  }
}
