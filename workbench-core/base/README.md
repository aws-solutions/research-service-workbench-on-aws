# Workbench Core ESLint Config Custom

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-86.12%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-77.44%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-87.02%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-87.83%25-yellow.svg?style=flat) |
# `base`

> This package is intended to provide a base AWS Service class that encapsulates all the service clients and commands that the application currently requires. We use `aws-sdk` V3 to improve the load-time of the modules imported at runtime.

## Usage

```
import { AwsService } from '@amzn/workbench-core-base';
const aws = new AwsService({ region: 'us-east-1' });
const params = { StackName: 'testStack' };                            // construct params
const response = await aws.cloudformation.describeStacks(params);     // perform SDK call
```