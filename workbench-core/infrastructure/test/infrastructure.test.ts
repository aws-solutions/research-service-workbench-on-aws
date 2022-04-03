import { App } from 'aws-cdk-lib';
import { Template } from 'aws-cdk-lib/assertions';
import { InfrastructureStack } from '../src/infrastructure-stack';

test('Infrastructure Test', () => {
  const app = new App();
  const infraStack = new InfrastructureStack(app, 'InfrastructureStack');
  const infraStackTemplate = Template.fromStack(infraStack);
  expect(infraStackTemplate).toMatchSnapshot();
});
