# Overview

Research Service Workbench on AWS is a backend API designed to empower AWS partners to more easily build self-service portals for research institutions, allowing their researchers to create and manage secure research computing environments. RSW builds on AWS services including Amazon S3, Service Catalog, and AWS Systems Manager to deliver comprehensive, cutting-edge capabilities in less time while meeting the high bar for security and governance demanded by regulators and funding agencies.

Using a custom built portal provided by a partner, built on Research Service Workbench, research IT departments can more easily work with partners to deliver a self-service portal with a comprehensive catalog of tools tailored to the needs of the researchers they support. Using a portal built using RSW, researchers can create, access, and retire environments without needing to be experts on cloud infrastructure or security. They can work individually or collaborate with others on the same data, with RSW securely orchestrating the connection of research environments to Amazon S3. Furthermore, environments are deployed in specific AWS accounts and Amazon Virtual Private Clouds (VPCs), allowing connectivity to resources on and off campus. Institutions are fully in control of their data, data flows, and AWS footprint. They can scale investments in IT and security across multiple research programs, reducing duplicate effort and freeing up resources to focus on science.

To learn more about FWoA and how to deploy, refer to the Research Service Workbench [Implementation Guide](https://docs.aws.amazon.com/solutions/latest/research-service-workbench-on-aws/overview.html).

# Codecov
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=root)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=root)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

# Workflow Status
[![Merge-develop-to-stage](https://github.com/aws-solutions/research-service-workbench-on-aws/actions/workflows/merge-develop-to-stage.yml/badge.svg?branch=develop)](https://github.com/aws-solutions/research-service-workbench-on-aws/actions/workflows/merge-develop-to-stage.yml)
[![Release integration tests](https://github.com/aws-solutions/research-service-workbench-on-aws/actions/workflows/integration-tests-release.yml/badge.svg)](https://github.com/aws-solutions/research-service-workbench-on-aws/actions/workflows/integration-tests-release.yml)
[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# Contributing Guidelines

Thank you for your interest in contributing to our project. Whether it's a bug report, new feature, correction, or additional documentation, we greatly value feedback and contributions from our community.

Please read through this document before submitting any issues or pull requests to ensure we have all the necessary information to effectively respond to your bug report or contribution.

## Code development and testing

In order to start developement please refer to [Development Instructions](./DEVELOPMENT.md#research-service-workbench-on-aws-development-instructions)

<!-- GENERATED PROJECT SUMMARY START -->

## Packages

<!-- the table below was generated using the ./repo-scripts/repo-toolbox script -->

| Folder | Package | README |
| ------ | ------- | ------ |
| [solutions/swb-app](./solutions/swb-app/) | [@aws/swb-app] | [README](./solutions/swb-app/README.md)
| [solutions/swb-reference](./solutions/swb-reference/) | [@aws/swb-reference] | [README](./solutions/swb-reference/README.md)
| [workbench-core/accounts](./workbench-core/accounts/) | [@aws/workbench-core-accounts] | [README](./workbench-core/accounts/README.md)
| [workbench-core/audit](./workbench-core/audit/) | [@aws/workbench-core-audit] | [README](./workbench-core/audit/README.md)
| [workbench-core/authentication](./workbench-core/authentication/) | [@aws/workbench-core-authentication] | [README](./workbench-core/authentication/README.md)
| [workbench-core/authorization](./workbench-core/authorization/) | [@aws/workbench-core-authorization] | [README](./workbench-core/authorization/README.md)
| [workbench-core/base](./workbench-core/base/) | [@aws/workbench-core-base] | [README](./workbench-core/base/README.md)
| [workbench-core/datasets](./workbench-core/datasets/) | [@aws/workbench-core-datasets] | [README](./workbench-core/datasets/README.md)
| [workbench-core/environments](./workbench-core/environments/) | [@aws/workbench-core-environments] | [README](./workbench-core/environments/README.md)
| [workbench-core/infrastructure](./workbench-core/infrastructure/) | [@aws/workbench-core-infrastructure] | [README](./workbench-core/infrastructure/README.md)
| [workbench-core/logging](./workbench-core/logging/) | [@aws/workbench-core-logging] | [README](./workbench-core/logging/README.md)
| [workbench-core/user-management](./workbench-core/user-management/) | [@aws/workbench-core-user-management] | [README](./workbench-core/user-management/README.md)
<!-- GENERATED PROJECT SUMMARY END -->

## Finding contributions to work on

Looking at the existing issues is a great way to find something to contribute on. As our projects, by default, use the default GitHub issue labels (enhancement/bug/duplicate/help wanted/invalid/question/wontfix), looking at any 'help wanted' issues is a great place to start.

## Code of Conduct

This project has adopted the [Amazon Open Source Code of Conduct](https://aws.github.io/code-of-conduct).
For more information see the [Code of Conduct FAQ](https://aws.github.io/code-of-conduct-faq) or contact
opensource-codeofconduct@amazon.com with any additional questions or comments.

## Security issue notifications

If you discover a potential security issue in this project we ask that you notify AWS/Amazon Security via our [vulnerability reporting page](http://aws.amazon.com/security/vulnerability-reporting/). Please do **not** create a public github issue.

## Licensing

See the [LICENSE](LICENSE) file for our project's licensing. We will ask you to confirm the licensing of your contribution.

## Metrics Collection
This solution collects anonymous operational metrics to help AWS improve the quality of features of the solution. For more information, including how to disable this capability, please see the [Implementation Guide](https://docs.aws.amazon.com/solutions/latest/research-service-workbench-on-aws/monitoring-the-solution-with-aws-service-catalog-appregistry.html).
