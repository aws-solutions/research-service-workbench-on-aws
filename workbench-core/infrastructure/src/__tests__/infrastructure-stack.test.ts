import { App } from 'aws-cdk-lib';
import { expect as expectCDK, haveResourceLike } from '@aws-cdk/assert';
import { InfrastructureStack } from '../infrastructure-stack';
import { Template } from 'aws-cdk-lib/assertions';

describe('root tests', () => {
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

import axios from 'axios';

describe('Hello World', () => {
  test("Service returns 'Hello World'", async () => {
    try {
      console.log(process.env.SERVICE_ENDPOINT);
      const SERVICE_ENDPOINT: string =
        process.env.SERVICE_ENDPOINT || 'https://l51vbx69s4.execute-api.us-west-2.amazonaws.com/';
      const response = await axios.get(SERVICE_ENDPOINT, {});
      expect(response.data).toBe('Hello World');
    } catch (e) {
      console.error(e);
      throw e;
    }
  });
});
