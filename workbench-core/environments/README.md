# Workbench Core Environments
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=workbench-core-environments)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=workbench-core-environments)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

This project provides the library and utilities function for setting up and managing environments. For an example of how this project can be used, please refer to [swb-reference](../../solutions/swb-reference).

## Components
* **constants:** Environment related constants
* **handlers:** 
  * **accountHandler:** Should be run on a regular interval so it can perform the following tasks
    * If needed, share SSM documents with hosting accounts
    * If needed, share AMIs with hosting accounts
    * If needed, share and accept service catalog portfolios with hosting account
    * If needed, associate hosting account environment management IAM role with hosting account portfolio
    * If needed, copy launch constraint role from main account to hosting account
    * Check status of Cloudformation template in hosting account and report whether the template is up to date
  * **statusHandler:** This should execute when an EventBridge event is received from the hosting account. It parses the event and updates environment status in DDB.
* **interfaces:** Interfaces that reference projects should implement to manage new environment types 
* **postDeployment**
  * **cognitoSetup:** This should be run after deployment completes. This will set up root cognito users and groups.
  * **serviceCataglogSetup:** This should be run after deployment completes. This will set up Service Catalog portfolio in the main account. It also uploads SC products to the portfolio.
* **schemas:** JSON schema for API request to manage environment related resources
* **services:** Manages create/read/update/delete of environment related resources in DDB
* **utilities:** Helper functions

