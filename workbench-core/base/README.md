# Workbench Core ESLint Config Custom

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
<<<<<<< HEAD
| ![Statements](https://img.shields.io/badge/statements-81.38%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-70.05%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-80.81%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-82.5%25-yellow.svg?style=flat) |
=======
| ![Statements](https://img.shields.io/badge/statements-81%25-yellow.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-70.25%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-79.88%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-82.11%25-yellow.svg?style=flat) |
>>>>>>> 49e07bf68c40a14e4fc64e33aa3dd276df5bf9a7
# `base`

> This package is intended to provide a base AWS Service class that encapsulates all the service clients and commands that the application currently requires. We use `aws-sdk` V3 to improve the load-time of the modules imported at runtime.

## Usage

```
import { AwsService } from '@aws/workbench-core-base';
const aws = new AwsService({ region: 'us-east-1' });
const params = { StackName: 'testStack' };                            // construct params
const response = await aws.cloudformation.describeStacks(params);     // perform SDK call
```