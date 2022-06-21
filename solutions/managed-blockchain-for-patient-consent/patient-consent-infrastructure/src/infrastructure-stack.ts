/* eslint-disable no-new */
import { join } from 'path';
import {
  Stack,
  StackProps,
  CfnOutput,
  RemovalPolicy,
  aws_apigateway,
  aws_kms,
  Duration,
  Fn
} from 'aws-cdk-lib';
import {
  ApiKeySourceType,
  AuthorizationType,
  CognitoUserPoolsAuthorizer,
  RestApi,
  EndpointType,
  LambdaIntegration,
  MethodLoggingLevel,
  AccessLogFormat,
  LogGroupLogDestination,
  LambdaRestApi,
  RequestAuthorizer,
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
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { NagSuppressions } from 'cdk-nag';
import { Construct } from 'constructs';

export class InfrastructureStack extends Stack {
  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaService = new Function(this, 'LambdaService', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'buildLambda.handler',
      code: Code.fromAsset(join(__dirname, '../build')),
      functionName: 'LambdaService'
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
          resources: ['*']
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

    const patient = restApi.root.addResource('patient');
    patient.addResource('signup').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
      apiKeyRequired: false
    });

    const organization = restApi.root.addResource('organization');
    organization.addResource('set-org').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
      apiKeyRequired: false
    });
    organization.addResource('get-org').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
      apiKeyRequired: false
    });

    const consent = restApi.root.addResource('consent');
    consent.addResource('set-consent').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
      apiKeyRequired: false
    });
    consent.addResource('get-consent').addMethod('POST', new LambdaIntegration(lambdaService), {
      requestValidator: requestValidator,
      authorizationType: AuthorizationType.IAM,
      apiKeyRequired: false
    });
    consent.addResource('revoke').addMethod('POST', new LambdaIntegration(lambdaService), {
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
      '/InfrastructureStack/RestApi/Default/organization/set-org/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/organization/get-org/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/consent/revoke/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/consent/set-consent/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/consent/get-consent/POST/Resource',
      [{ id: 'AwsSolutions-COG4', reason: 'We will use IAM and API key' }]
    );
    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/RestApi/Default/patient/signup/POST/Resource',
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
    NagSuppressions.addResourceSuppressionsByPath(this, '/InfrastructureStack/LambdaService/Resource', [
      {
        id: 'AwsSolutions-L1',
        reason: 'We are using Node14 for Lambda functions'
      }
    ]);
  }
}
