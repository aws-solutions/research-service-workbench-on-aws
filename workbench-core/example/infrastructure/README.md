⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

# Workbench Core Example Infrastructure

 ## Description

 Infrastructure for Example App integration tests

 ## Pre-requisites
 1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
 2. `rush cinstall`
 3. `rush build:test -t @aws/workbench-core-example-infrastructure`
 4. Configure AWS Credentials locally for your AWS Account: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile
 5. Install [jq](https://stedolan.github.io/jq/) command line tool (required for `./scripts/getResources.sh` script) by running e.g. `brew install jq`
 6. Install [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

## Setup your main environment for Integration Test
Navigate to `workbench-core/example/infrastructure`

### Set Environment Variables
```bash
export HOSTING_ACCOUNT_ID=<HOSTING_ACCOUNT_ID>
export HOSTING_ACCOUNT_REGION=<HOSTING_ACCOUNT_REGION>
export MAIN_ACCOUNT_ID=<MAIN_ACCCOUNT_ID>
export MAIN_ACCOUNT_REGION=<MAIN_ACCCOUNT_REGION>
export EXTERNAL_ID=<RandomString> --> https://docs.aws.amazon.com/IAM/latest/UserGuide/id_roles_create_for-user_externalid.html
```

### Needs to be run one time to boostrap the main account
**Set your *Main account* credentials** and run:
```bash
rushx cdk:bootstrap:main 
```
*Note: Windows users might get an error while running the above command. Please use the actual [command](./package.json#L22) instead*

### Deploy the ExampleStack
```bash
rushx cdk:deploy:main
```

### Cognito User/Group Setup and update SSM Parameters
```bash
./scripts/setupCognito.sh -u <USER_POOL_ID> -e <YOUR_EMAIL> -p <NEW_PASSWORD> -r $MAIN_ACCOUNT_REGION -c
```

#### Get UserPool Id
```bash
./scripts/getResources.sh -r $MAIN_ACCOUNT_REGION -i -g
```

#### OR
After `rushx cdk:deploy:main` you can find the USER_POOL_ID [here](./src/config/testEnv.json#L18)

## Setup your hosting environment for Integration Test
Navigate to `workbench-core/example/infrastructure`

### Needs to be run one time to boostrap the hosting account to trust main account
**Set your *Hosting account* credentials** and run:
```bash
rushx cdk:bootstrap:hosting
```
*Note: Windows users might get an error while running the above command. Please use the actual [command](./package.json#L21) instead*

### Deploy the ExampleHostingStack
**Set your *Main account* credentials** and run:
```bash
rushx cdk:deploy:hosting
```

### Run Integration Test
```bash
rushx integration-tests
```

### Run Cypress end-to-end test

To run Cypress suite and output the results to command line: 

```bash
rushx cypress
```

To run Cypress suite in GUI mode: 

```bash
rushx cypress open
```


## Cleanup your environment
Navigate to `workbench-core/example/infrastructure`

### Destroy the ExampleStack
**This will destroy the DynamoDB Table, Cognito UserPool, S3Buckets and the encryption keys created by the stack.**
**RemovalPolicy has been set to DESTROY for the mentioned resources**
#### Require Approval
```bash
rushx cdk:destroy:hosting
rushx cdk:destroy:main
```

#### No Approval required
**Be sure to be in the correct folder, this deletes the stack by force, no prompts for confirmation**
```bash
rushx cdk:destroy:hosting -f
rushx cdk:destroy:main -f
```

### Delete Cognito SSM Parameters
```bash
./scripts/cleanup.sh -r $MAIN_ACCOUNT_REGION -p -c
```
