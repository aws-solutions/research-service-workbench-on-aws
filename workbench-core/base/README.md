# Workbench Core Base
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-base)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-base)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

> This package is intended to provide a base AWS Service class that encapsulates all the service clients and commands that the application currently requires. We use `aws-sdk` V3 to improve the load-time of the modules imported at runtime.

## Usage

```
import { AwsService } from '@aws/workbench-core-base';
const aws = new AwsService({ region: 'us-east-1' });
const params = { StackName: 'testStack' };                            // construct params
const response = await aws.cloudformation.describeStacks(params);     // perform SDK call
```