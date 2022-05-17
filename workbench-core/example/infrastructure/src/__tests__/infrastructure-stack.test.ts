import { App } from 'aws-cdk-lib';
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { InfrastructureStack } from '../infrastructure-stack';
import { Template } from 'aws-cdk-lib/assertions';

describe('CDKStack', () => {
  test('Infrastructure Test', () => {
    const app = new App();
    const infraStack = new InfrastructureStack(app, 'InfrastructureStack');
    expectCDK(infraStack).to(
      haveResourceLike('AWS::Lambda::Function', {
        FunctionName: 'LambdaService'
      })
    );
    expectCDK(infraStack).to(
      haveResourceLike('AWS::ApiGatewayV2::Integration', {
        IntegrationType: 'AWS_PROXY'
      })
    );
    expectCDK(infraStack).to(
      haveResourceLike('AWS::ApiGatewayV2::Api', {
        Name: 'HttpApiService'
      })
    );
    const infraStackTemplate = Template.fromStack(infraStack);
    expect(infraStackTemplate).toMatchSnapshot();
  });
});
