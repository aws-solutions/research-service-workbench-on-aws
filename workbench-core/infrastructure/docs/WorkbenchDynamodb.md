# WorkbenchDynamodb CDK Construct

## Description
**A CDK Construct with some default values and is intended solely for use in our integration tests and is not intended for advanced applications such as creating GlobalTables with replicationRegion**:
1. billingMode: Either provide your billingMode or it sets the default to BillingMode.PAY_PER_REQUEST
1. encryption: TableEncryption.CUSTOMER_MANAGED // always
1. encryptionKey: Either provide your own encryption key or it creates an encryptionKey with rotation enabled
1. pointInTimeRecovery: true // always

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
import { WorkbenchDynamodb } from '@aws/workbench-core-infrastructure';

// Example 1:
// Create WorkbenchDynamodb with default values
new WorkbenchDynamodb(this, 'TestDynamodb', {
    // MANDATORY partitionKey
    partitionKey: { name: 'pk', type: AttributeType.STRING }
});


// Example 2:
// Create WorkbenchDynamodb with custom values
new WorkbenchDynamodb(this, 'TestDynamodb', {
    // MANDATORY partitionKey
    partitionKey: { name: 'pk', type: AttributeType.STRING },
    // Sort key attribute definition
    sortKey: { name: 'sk', type: AttributeType.STRING },
    // BillingMode set to PROVISIONED
    billingMode: BillingMode.PROVISIONED,
    // Provide your custom encryption key
    encryptionKey: dynamodbEncryptionKey
});