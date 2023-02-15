# WorkbenchAssociateStackToExistingAppRegistryApplication CDK Construct

## Description

**A CDK Construct to associate a Stack with an existing AppRegistry Application**:

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
import { WorkbenchAssociateStackToExistingAppRegistryApplication } from './workbenchAssociateStackToExistingAppRegistryApplication';

// Example 1:
// Create a stack and associate it with existing AppRegistry Application by passing in the AppRegistry Application ARN
const stack = new Stack();
new WorkbenchAssociateStacksToExistingAppRegistryApplication(stack, stack.stackId, {
  applicationArn: 'arn:aws:servicecatalog:us-east-1:111111111111:/applications/appRegApplication',
  appInsights: true // default is false, set it to true if you want to create AppInsights
});
```
