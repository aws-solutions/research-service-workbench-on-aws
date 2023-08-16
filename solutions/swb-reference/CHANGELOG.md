# Changelog

All notable changes to this project will be documented in this file. See [standard-version](https://github.com/conventional-changelog/standard-version) for commit guidelines.

## [2.0.1] (2023-08-15)

### Patches
* Main account can be hosting
* ALB Delete pretection enabled
* Cost Centers require a CURRENT account
* Remove ID from error message

## [2.0.0] (2023-06-09)
Research Service Workbench (RSW) on AWS is a backend API designed to empower AWS partners to more easily build self-service portals for research institutions, allowing their researchers to create and manage secure research computing environments. RSW builds on AWS services including Amazon S3, Service Catalog, and AWS Systems Manager to deliver comprehensive, cutting-edge capabilities in less time while meeting the high bar for security and governance demanded by regulators and funding agencies.

For additional details please refer to the implementation guide [here](https://docs.aws.amazon.com/solutions/latest/research-service-workbench-on-aws/overview.html)

`swb-reference` is the entry point to Research Service Workbench. Customers can configure and deploy RSW with the provided CDK constructs and modules. 

### Feature
* RSW infrastructure as CDK constructs and modules
* Launching SageMaker environments
* Mounting internal datasets on SageMaker environments
* Managing resources (environments, environment type config, datasets, SSH Keys, user management) by projects
* Integration with ServiceCatalog AppRegistry to centrally manage the solution's resources
