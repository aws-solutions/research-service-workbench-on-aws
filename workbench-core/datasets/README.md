
# DataSets Service

## Code Coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-95.19%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-92.66%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-95.89%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-96.46%25-brightgreen.svg?style=flat) |

## Description

The DataSet Service provides configuration and tracking for sharing data among researchers. The reference implementation
given assumes data is stored under prefixes in S3 buckets. S3 Buckets are shared with others by adding an access point
and sufficient permissions for a provided IAM role to access the files.

## Usage

At minimum, DataSets requires
- an AWS account
- a DynamoDb table within that account using
  - partition key named "pk"
  - a sort key named "sk"
  - a GSI: "getResourceByCreatedAt"
    - partition key: resource type
    - sort key: createdAt
- an S3 bucket to hold your DataSet prefixes

### Initializaton

```typescript
import { AuditService, BaseAuditPlugin, Writer } from '@amzn/workbench-core-audit';

// the AwsService is a wrapper around @aws-sdk and handles interaction with AWS Services.
import { AwsService } from '@amzn/workbench-core-base';

// the DataSets components
import {
    DataSetService,
    DdbDataSetMetadataPlugin,
    S3DataSetStoragePlugin,
    DataSet,
    ExternaEndpoint } from '@amzn/workbench-core-datasets';
import { LoggingService } from '@amzn/workbench-core-logging';

// set up the logger and the audit services.
const logger: LoggingService = new LoggingService({
  maxLogLevel: 'info',
  includeLocation: false,
  metadata: {
    serviceName: 'DataSets'
  }
});

class AuditLogger implements Writer {  
    private logger:Logger;  
    public constructor(logger: Logger) {  
        this.logger = logger;  
    }  
    public async write(metadata:Metadata, auditEntry: AuditEntry): Promise<void> {  
    logger.info(auditEntry);  
    }  
}

const writer: Writer = new AuditLogger(logger);  
const baseAuditPlugin: BaseAuditPlugin = new BaseAuditPlugin(writer);

const audit = new AuditService({
  continueOnError: true,
  auditPlugin: baseAuditPlugin,
  requiredAuditValues: [],
  fieldsToMask: []
});

// initialize an instance of AwsService. This instance should have access to the DynamoDb
// table you intend to use to store DataSets metadata.
// for simplicity, it will be assumed this service also has access to the S3 bucket where
// DataSets data is stored however a different AwsService instance initialized to a different
// account could be used in that case.
const aws: AwsService = new AwsService( {region: 'us-east-1', DdbTableName: 'my-datasets-table' });

// the DdbDataSetMetadataPlugin will allow the DataSetService to communicate with DynamoDb.
// alternative databases may be chosen by implementing the DataSetMetadataPlugin interface
// for that service however that is beyond the scope of this documentation.
// the arguments are as follows:
// aws: this is the initialized AwsService instance from above.
// 'DS': this is the prefix used to distinguish DataSet keys from others in the database.
//       In this case, all DataSet keys will have the form: DS#...
// 'EP': DataSet Endpoints are another entity stored in DynamoDb, and this is the prefix
//       for those keys (EP#...).
// Alter these values as needed to avoid collisions with any other components which may
// share the same table.
const metadataPlugin: DdbDataSetMetadataPlugin = new DdbDataSetMetadataPlugin(aws, 'DS', 'EP');

// instantiate the service.
const service: DataSetService = new DataSetService(audit, logger, metadataPlugin);

// set up a storage (S3) plugin. This example assumes the same role associated with the previously
// initialized AwsService instance can handle the S3 bucket used for DataSets.
const storagePlugin: S3DataSetStoragePlugin = new S3DataSetStoragePlugin(aws);
```

### Creating a DataSet

```typescript
// create a prefix on the bucket for the first DataSet
const dataSet = await service.provisionDataSet(
  'my-dataset',
  'my-bucket',
  'my-dataset-prefix',
  '123456789012',
  storagePlugin);

// add an endpoint to the dataset and get the string needed to mount it to an
// external environment.
const mountString = await service.addDataSetExternalEndpoint(
  'my-data-set'
  'my-access-point',
  'arn:....:role/some-execution-role',
  storagePlugin);
```
