# Workbench Core Infrastructure
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-infrastructure)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-infrastructure)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

## Description

Workbench core components are designed to work with existing infrastructure when available. When infrastructure is not available this package is here to help. This package serves two purposes. First, to help fill in the gaps where organizations are diverging from reference infrastructure, but still need to deploy a few elements. Second, to assist solution developers by providing easy to configure CDK style constructs which can be used as infrastructure building blocks in their solutions.

## Components

- [WorkbenchCognito](./docs/workbenchCognito.md)
