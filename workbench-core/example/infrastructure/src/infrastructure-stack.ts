/* eslint-disable no-new */
import { Stack, StackProps, CfnOutput, RemovalPolicy } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
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

    const userPool = new UserPool(this, 'UserPool', {
      userPoolName: `my-user-pool`,
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
        minLength: 6,
        requireLowercase: false,
        requireDigits: false,
        requireUppercase: false,
        requireSymbols: false
      },
      accountRecovery: AccountRecovery.EMAIL_ONLY
    });

    const userPoolClient = new UserPoolClient(this, 'UserPoolClient', {
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

    new CfnOutput(this, 'region', {
      value: Stack.of(this).region
    });

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
  }
}
