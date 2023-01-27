# Workbench Core ESLint Config Custom

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-78.6%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-71.67%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-70.73%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-79.56%25-red.svg?style=flat) |
# `base`

> This package is intended to provide a base AWS Service class that encapsulates all the service clients and commands that the application currently requires. We use `aws-sdk` V3 to improve the load-time of the modules imported at runtime.

## Usage

```
import { AwsService } from '@aws/workbench-core-base';
const aws = new AwsService({ region: 'us-east-1' });
const params = { StackName: 'testStack' };                            // construct params
const response = await aws.cloudformation.describeStacks(params);     // perform SDK call
```