import { Stack, StackProps, CfnOutput } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';
import { join } from 'path';

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

    const httpApi = new HttpApi(this, 'HttpApi', {
      defaultIntegration: httpLambdaIntegration,
      apiName: 'HttpApiService'
    });

    // eslint-disable-next-line no-new
    new CfnOutput(this, 'HttpEndpoint', {
      value: httpApi.apiEndpoint,
      exportName: 'HttpApiEndPoint'
    });
  }
}
