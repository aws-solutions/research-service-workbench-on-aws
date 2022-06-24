import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InfrastructureStack } from '../infrastructure-stack';

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
      haveResourceLike('AWS::ApiGateway::RestApi', {
        Name: 'RestApi'
      })
    );
    const infraStackTemplate = Template.fromStack(infraStack);
    expect(infraStackTemplate).toMatchSnapshot();
  });
});
