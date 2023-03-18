[![codecov](https://codecov.io/github/aws-solutions/solution-spark-on-aws/branch/codecov/graph/badge.svg?flag=workbench-core-infrastructure)](https://app.codecov.io/github/aws-solutions/solution-spark-on-aws/tree/codecov)

# Workbench Core Infrastructure

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description

Workbench core components are designed to work with existing infrastructure when available. When infrastructure is not available this package is here to help. This package serves two purposes. First, to help fill in the gaps where organizations are diverging from reference infrastructure, but still need to deploy a few elements. Second, to assist solution developers by providing easy to configure CDK style constructs which can be used as infrastructure building blocks in their solutions.

## Components

- [WorkbenchCognito](./docs/workbenchCognito.md)
