import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InfrastructureStack } from '../infrastructure-stack';
import { lambdaHandler } from '../lambdas/client-app';

describe('CDKStack', () => {
  test('Infrastructure Test', () => {
    const app = new App();
    const infraStack = new InfrastructureStack(app, 'InfrastructureStack');

    const infraStackTemplate = Template.fromStack(infraStack);
    expect(infraStackTemplate).toMatchSnapshot();

    expectCDK(infraStack).to(haveResourceLike('AWS::Lambda::Function'));
    expectCDK(infraStack).to(haveResourceLike('AWS::KMS::Key'));
    expectCDK(infraStack).to(
      haveResourceLike('AWS::ApiGateway::Resource', {
        PathPart: 'patient-consent'
      })
    );
    expectCDK(infraStack).to(
      haveResourceLike('AWS::ApiGateway::RequestValidator', {
        Name: 'requestValidatorName'
      })
    );

    expectCDK(infraStack).to(
      haveResourceLike('AWS::ApiGateway::RestApi', {
        Name: 'RestApi'
      })
    );
    expectCDK(infraStack).to(
      haveResourceLike('AWS::IAM::Role', {
        RoleName: 'LambdaServiceRole'
      })
    );
  });
  test('lambdaHandler', async () => {
    const response = await lambdaHandler();
    expect(response.statusCode).toBe(200);
  });
});
