# WorkbenchAppRegistry CDK Construct

## Description

**A CDK Construct to create AppRegistry Application, AttributeGroup, share the Application/AttributeGroup across multiple accounts and associate the stacks to the application**:

## Usage

### Installing the package

Using NPM:

```bash
npm install @aws/workbench-core-infrastructure
```

Using Yarn:

```bash
yarn add @aws/workbench-core-infrastructure
```

### Example

```ts
// Import the construct
import { WorkbenchAppRegistry } from '@aws/workbench-core-infrastructure';

// Example 1:
// Create a stack and associate it with AppRegistry
const stack = new Stack();
// This will automatically associate stack with AppRegistry Application
new workbenchAppRegistry(stack, 'ExampleStack', {
  solutionId: 'Example001',
  solutionName: 'ExampleApp',
  solutionVersion: '0.0.1',
  attributeGroupName: 'ExampleApp-Metadata',
  applicationType: 'Example',
  appRegistryApplicationName: 'ExampleApp',
  // default is false, set it to true if you want to create AppInsights. If you set it to true, AppInsights fails to create when you deploy it for the first time due to this [defect](https://t.corp.amazon.com/V746742507/communication). If it fails, you can try to deploy it again and it should succeed
  appInsights: true
});

// Example 2:
// Share AppRegistry Application and AttributeGroups with multiple accounts
const stack = new Stack();
new workbenchAppRegistry(stack, 'ExampleStack', {
  solutionId: 'Example001',
  solutionName: 'ExampleApp',
  solutionVersion: '0.0.1',
  attributeGroupName: 'ExampleApp-Metadata',
  applicationType: 'Example',
  appRegistryApplicationName: 'ExampleApp',
  accountIds: ['111111111111', '222222222222']
});

// Example 3:
// Associate multiple stacks with AppRegistry Application
const stack1 = new Stack();
const stack2 = new Stack();
const stack3 = new Stack();
// This will automatically associate stack1 with AppRegistry
const appRegistry = new workbenchAppRegistry(stack1, 'ExampleStack', {
  solutionId: 'Example001',
  solutionName: 'ExampleApp',
  solutionVersion: '0.0.1',
  attributeGroupName: 'ExampleApp-Metadata',
  applicationType: 'Example',
  appRegistryApplicationName: 'ExampleApp'
});
// Associate stack2 and stack3 with AppRegistry Application
appRegistry.applyAppRegistryToStacks([stack2, stack3]);
```
