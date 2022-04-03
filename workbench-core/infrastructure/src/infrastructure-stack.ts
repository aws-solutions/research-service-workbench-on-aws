import { Stack, StackProps } from 'aws-cdk-lib';
import { Code, Function, Runtime } from 'aws-cdk-lib/aws-lambda';
import { Construct } from 'constructs';
import { HttpApi } from '@aws-cdk/aws-apigatewayv2-alpha';
import { HttpLambdaIntegration } from '@aws-cdk/aws-apigatewayv2-integrations-alpha';

export class InfrastructureStack extends Stack {
  // eslint-disable-next-line @typescript-eslint/explicit-member-accessibility
  constructor(scope: Construct, id: string, props?: StackProps) {
    super(scope, id, props);

    const lambdaService = new Function(this, 'LambdaService', {
      runtime: Runtime.NODEJS_14_X,
      handler: 'index.handler',
      code: Code.fromAsset('../../express/archive.zip'),
      functionName: 'LambdaService'
    });

    const httpLambda = new HttpLambdaIntegration('HttpLambda', lambdaService);

    // eslint-disable-next-line no-new
    new HttpApi(this, 'HttpApi', {
      defaultIntegration: httpLambda,
      apiName: 'HttpApiService'
    });
  }
}
