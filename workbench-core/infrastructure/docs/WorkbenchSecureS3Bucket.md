# WorkbenchSecureS3Bucket CDK Construct

## Description
**An S3Bucket CDK Construct with some default values**:
1. BlockPublicAccess.BLOCK_ALL // always
1. encryption: BucketEncryption.KMS // always
1. encryptionKey: Either provide your own encryption key or it creates an encryptionKey with rotation enabled
1. versioned: true // always
1. enforceSSL: true // always
1. accessControl: BucketAccessControl.LOG_DELIVERY_WRITE // always
1. serverAccessLogsPrefix: Either provide your own serverAccessLogsPrefix or it sets the default to `${id.toLowerCase()}-access-log`
1. Default bucketPolicies:
    1. Deny requests that do not use TLS/HTTPS // always
    1. Deny requests that do not use SigV4 // always

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
import { WorkbenchSecureS3Bucket } from '@aws/workbench-core-infrastructure';

// Example 1:
// Create WorkbenchSecureS3Bucket with default values
new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket');

// Example 2:

// 1. Create your custom Encryption Key
const encryptionKey = new WorkbenchEncryptionKeyWithRotation(stack, 'Test-EncryptionKey');
// 1. Create your ServerAccessLogsBucket
const exampleS3AccessLogsBucket = new WorkbenchSecureS3Bucket(this, 'ExampleS3AccessLogsBucket');
// Create WorkbenchSecureS3Bucket with custom values
new WorkbenchSecureS3Bucket(stack, 'TestS3Bucket', {
    // Provide your custom Encryption Key
    encryptionKey: encryptionKey.key,
    // Provide your custom access log prefix
    serverAccessLogsPrefix: 'test-access-log',
    // Provide your access log Bucket
    serverAccessLogsBucket: exampleS3AccessLogsBucket.bucket
});