# WorkbenchEncryptionKeyWithRotation CDK Construct

## Description
**An EncryptionKey CDK Construct with some default values**:
1. enableKeyRotation: true // always
1. Sets default Key Policy to allow the AccountPrincipal for 'kms:*' actions

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
import { WorkbenchEncryptionKeyWithRotation } from '@aws/workbench-core-infrastructure';

// Example 1:
// Create WorkbenchEncryptionKeyWithRotation with default values
new WorkbenchEncryptionKeyWithRotation(stack, 'Test-EncryptionKey');


// Example 2:

// Create your custom Key Policy
const customKeyPolicy = new PolicyDocument({
      statements: [
        new PolicyStatement({
          actions: [...],
          principals: [...],
          resources: [...],
          sid: 'custom-key-share-statement'
        })
      ]
    });

// Create WorkbenchEncryptionKeyWithRotation with custom values
new WorkbenchEncryptionKeyWithRotation(stack, 'Test-EncryptionKey', {
    // Provide the custom key policy
    policy: customKeyPolicy
});