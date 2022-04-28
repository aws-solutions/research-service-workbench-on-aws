import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
// import { LogGroup, RetentionDays } from 'aws-cdk-lib/aws-logs';
// import { Effect, PolicyStatement, Role, ServicePrincipal } from 'aws-cdk-lib/aws-iam';

export class InfrastructureStack extends Stack {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    // const logGroup = new LogGroup(this, 'LogGroup', {
    //   retention: RetentionDays.ONE_WEEK,
    //   logGroupName: 'HttpApiLogGroup'
    // });

    // const lambdaRole = new Role(this, 'LambdaRole', {
    //   assumedBy: new ServicePrincipal('lambda.amazonaws.com')
    // });

    // lambdaRole.addToPolicy(
    //   new PolicyStatement({
    //     effect: Effect.ALLOW,
    //     actions: ['logs:CreateLogGroup', 'logs:CreateLogStream', 'logs:PutLogEvents'],
    //     resources: [logGroup.logGroupArn]
    //   })
    // );

    const lambdaService = new Function(this, 'LambdaService', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('../infrastructure/lambda-build/archive.zip'),
      functionName: 'LambdaService'
      // role: lambdaRole
    });

    const httpLambdaIntegration = new HttpLambdaIntegration('HttpLambda', lambdaService);

    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: httpLambdaIntegration,
      apiName: 'HttpApiService'
    });

    // const httpApiStage = new HttpStage(this, 'HttpStage', {
    //   httpApi,
    //   autoDeploy: true,
    //   stageName: "$default"
    // })

    // const defaultStage = httpApi.defaultStage?.node.defaultChild as CfnStage;

    // defaultStage.accessLogSettings = {
    //   destinationArn: logGroup.logGroupArn,
    //   format: `$context.identity.sourceIp - - [$context.requestTime] "$context.httpMethod $context.routeKey $context.protocol" $context.status $context.responseLength $context.requestId`
    // };

    // eslint-disable-next-line no-new
    new CfnOutput(this, 'HttpEndpoint', {
      value: httpApi.apiEndpoint,
      exportName: 'HttpApiEndPoint'
    });
  }
}
