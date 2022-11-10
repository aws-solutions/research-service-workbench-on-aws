# `example-infrastructure`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |

 ## Description

 Infrastructure for Example App integration tests

 ## Pre-requisites
 1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
 2. `rush cinstall`
 3. `rush build:test -t @aws/workbench-core-example-infrastructure`
 4. Configure AWS Credentials locally for your AWS Account: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile

 ## Setup your environment for Integration Test
 Navigate to `workbench-core/example/infrastructure`

 ### Needs to be run one time to boostrap the environment
```bash
rushx cdk:bootstrap
```

### Deploy the ExampleStack
```bash
rushx cdk:deploy
```

### Cognito User/Group Setup
```bash
./scripts/setupCognito.sh -u <USER_POOL_ID> -e <EMAIL> -p <PASSWORD> -r <REGION> -c
```
After `rushx cdk:deploy` you can find the USER_POOL_ID [here](./src/config/testEnv.json#L13) 

### Run Integration Test
```bash
rushx integration-tests
```

## Cleanup your environment
Navigate to `workbench-core/example/infrastructure`

### Destroy the ExampleStack
#### Require Approval
```bash
rushx cdk:destroy
```
#### No Approval required

**Be sure to be in the correct folder, this deletes the stack by force, no prompts for confirmation**
```bash
rushx cdk:destroy -f
```

### Delete Cognito UserPool, DynamoDB Table and SSM Parameters
```bash
./scripts/cleanup.sh -u <USER_POOL_ID> -d <DYNAMO_DB_TABLE_NAME> -r <REGION> -p -c
```
After `rushx cdk:deploy` you can find:

1. USER_POOL_ID [here](./src/config/testEnv.json#L13)

2. DYNAMO_DB_TABLE_NAME [here](./src/config/testEnv.json#L12)
