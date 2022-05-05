/* eslint-disable no-new */
import { Stack, StackProps, CfnOutput, RemovalPolicy, aws_apigatewayv2, aws_kms } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { LogGroup } from 'aws-cdk-lib/aws-logs';
import { Construct } from 'constructs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { HttpUserPoolAuthorizer } from '@aws-cdk/aws-apigatewayv2-authorizers-alpha';
import { join } from 'path';
import {
  AccountRecovery,
  UserPool,
  UserPoolClient,
  UserPoolClientIdentityProvider
} from 'aws-cdk-lib/aws-cognito';
import { NagSuppressions } from 'cdk-nag';

export class InfrastructureStack extends Stack {
  public constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaService = new Function(this, 'LambdaService', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'buildLambda.handler',
      code: Code.fromAsset(join(__dirname, '../build')),
      functionName: 'LambdaService'
    });

    const httpLambdaIntegration = new HttpLambdaIntegration('HttpLambda', lambdaService);

    const userPool = new UserPool(this, 'ExampleUserPool', {
      userPoolName: `example-user-pool`,
      removalPolicy: RemovalPolicy.DESTROY,
      selfSignUpEnabled: true,
      signInAliases: {
        username: true,
        email: true
      },
      autoVerify: {
        email: true
      },
      passwordPolicy: {
        minLength: 8,
        requireLowercase: true,
        requireDigits: true,
        requireUppercase: true,
        requireSymbols: true
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY
    });

    const userPoolClient = new UserPoolClient(this, 'ExampleUserPoolClient', {
      userPool,
      authFlows: {
        adminUserPassword: true,
        userPassword: true,
        custom: true,
        userSrp: true
      },
      supportedIdentityProviders: [UserPoolClientIdentityProvider.COGNITO]
    });

    const authorizer = new HttpUserPoolAuthorizer('user-pool-authorizer', userPool, {
      userPoolClients: [userPoolClient],
      identitySource: ['$request.header.Authorization']
    });

    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: httpLambdaIntegration,
      defaultAuthorizer: authorizer,
      apiName: 'HttpApiService'
    });

    const kmsKey = new aws_kms.Key(this, 'KMSKey', {
      enableKeyRotation: true
    });

    const log = new LogGroup(this, 'log', {
      logGroupName: 'httpApiLogGroup',
      encryptionKey: kmsKey
    });

    const defaultStage = httpApi.defaultStage!.node.defaultChild as aws_apigatewayv2.CfnStage;

    defaultStage.accessLogSettings = {
      destinationArn: log.logGroupArn,
      format: `$context.identity.sourceIp - - [$context.requestTime] "$context.httpMethod $context.routeKey $context.protocol" $context.status $context.responseLength $context.requestId`
    };

    new CfnOutput(this, 'userPoolId', {
      value: userPool.userPoolId
    });

    new CfnOutput(this, 'userPoolClientId', {
      value: userPoolClient.userPoolClientId
    });

    new CfnOutput(this, 'HttpEndpoint', {
      value: httpApi.apiEndpoint,
      exportName: 'HttpApiEndPoint'
    });

    NagSuppressions.addResourceSuppressionsByPath(
      this,
      '/InfrastructureStack/LambdaService/ServiceRole/Resource',
      [{ id: 'AwsSolutions-IAM4', reason: "I'm ok using managed policies for this example" }]
    );
    NagSuppressions.addResourceSuppressionsByPath(this, '/InfrastructureStack/ExampleUserPool/Resource', [
      { id: 'AwsSolutions-COG2', reason: "I'm ok with not using MFA Authentication for this example" }
    ]);
    NagSuppressions.addResourceSuppressionsByPath(this, '/InfrastructureStack/ExampleUserPool/Resource', [
      {
        id: 'AwsSolutions-COG3',
        reason: 'UserPool CDK construct does not have option to set AdvancedSecurityMode'
      }
    ]);
  }
}
