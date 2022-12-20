# `example-infrastructure`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

 ## Description

 Infrastructure for Example App integration tests

 ## Pre-requisites
 1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
 2. `rush cinstall`
 3. `rush build:test -t @aws/workbench-core-example-infrastructure`
 4. Configure AWS Credentials locally for your AWS Account: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile
 5. Install [jq](https://stedolan.github.io/jq/) command line tool (required for `./scripts/getResources.sh` script) by running e.g. `brew install jq`
 6. Install [AWS Command Line Interface](https://docs.aws.amazon.com/cli/latest/userguide/getting-started-install.html)

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

### Cognito User/Group Setup and update SSM Parameters
```bash
./scripts/setupCognito.sh -u <USER_POOL_ID> -e <EMAIL> -p <PASSWORD> -r <REGION> -c
```

#### Get UserPool Id
```bash
./scripts/getResources.sh -r <REGION> -i -g
```

#### OR
After `rushx cdk:deploy` you can find the USER_POOL_ID [here](./src/config/testEnv.json#L17)

### Run Integration Test
```bash
rushx integration-tests
```

## Cleanup your environment
Navigate to `workbench-core/example/infrastructure`

### Destroy the ExampleStack
**This will destroy the DynamoDB Table, Cognito UserPool, S3Buckets and the encryption keys created by the stack.**
**RemovalPolicy has been set to DESTROY for the mentioned resources**
#### Require Approval
```bash
rushx cdk:destroy
```

#### No Approval required
**Be sure to be in the correct folder, this deletes the stack by force, no prompts for confirmation**
```bash
rushx cdk:destroy -f
```

### Delete Cognito SSM Parameters
```bash
./scripts/cleanup.sh -r <REGION> -p -c
```
