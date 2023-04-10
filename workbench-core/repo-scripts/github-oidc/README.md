# `github-oidc`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description
This package creates the GithubOIDCRole for [ExampleStack](../../example/infrastructure/src/example-stack.ts) that can be assumed from a github workflow. The permissions assigned to these roles enable the workflows to perform deployments in the specified AWS account. 2 CDK stacks are created as part of this package:
1. `OIDCProviderStack`: This stack deploys the identity provider for GitHub
2. `<GitHub-Org>-GitHubOIDCStack`: This stack deploys the role-to-assume which will be used in our github workflows to deploy and perform integration/e2e tests

## Constructs
This package defines 2 constructs:
1. [ExampleStackGithubOidcRolePolicy](./src/constructs/example-stack-github-oidc-role-policy.ts)
2. [SWBStackGithubOidcRolePolicy](./src/constructs/swb-stack-github-oidc-role-policy.ts)

Use these constructs to update the permissions according to the requirement.

### ExampleStack Instructions
#### ExampleStack Main Account
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to only allow the creation of services required by `ExampleStack`. This package provides 1 pre-configured bootstrap policy document for `ExampleStack main` account:
    1. [ExampleStack main account bootstrap policy](./src/cdk-bootstrap-policies/exampleStack/example-stack-main-cdk-bootstrap-policy-aws-us-east-1.json)

    ```
    This policy assumes that the services are being deployed to `us-east-1` region. If you want to deploy to another region then create a new policy using the existing policy document and update the region accordingly.
    ```

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Main account
    aws iam create-policy \
    --policy-name example-stack-main-cdk-bootstrap-policy-aws-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/exampleStack/example-stack-main-cdk-bootstrap-policy-aws-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<MAIN_ACCOUNT_ID>/<MAIN_ACCOUNT_REGION> --cloudformation-execution-policies "arn:aws:iam::<MAIN_ACCOUNT_ID>:policy/example-stack-main-cdk-bootstrap-policy-aws-us-east-1" -c "application=ExampleStack"
    ```
1. Update [config](./src/configs/config.json) file for `exampleStack` params:
    ```bash
     "exampleStack": {
        # Base path of the ssm params, this should reflect the base path defined in the example/infrastructure/integration-tests/config/testEnv.yaml file (Update only if base path is updated in example/infrastructure/integration-tests/config/testEnv.yaml)
        "ssmBasePath": "maf/exampleApp/rootUser"

        # CrossAccountRoleName defined at example/infrastructure/src/index.ts#L20
        "crossAccountRoleName": "ExampleCrossAccountRole",

        # Update if you want to increase the session duration for the github-oidc role
        "maxSessionDuration": 3600
    }
    ```
1. Build:
    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc
    rushx build
    ```
1. Deploy:
    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc
    # Set the credentials for the Main account
    rushx cdk:deploy:exampleStack
    ```
1. You will get the OIDC Role ARN as the output from this [file](./src/configs/cdk-outputs.json). Copy the Role ARN and update the `TEST_ASSUME_ROLE` secret.

#### ExampleStack Hosting Account instructons
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to allow only the creation of services required by `ExampleStack`. This package provides 1 pre-configured bootstrap policy document for `ExampleStack hosting` account:
    1. [ExampleStack hosting account boostrap policy](./src/cdk-bootstrap-policies/exampleStack/example-stack-hosting-cdk-bootstrap-policy-aws-us-east-1.json)

    ```
    This policy assumes that the services are being deployed to `us-east-1` region. If you want to deploy to a another region then create a new policy using the existing policy document and update the region accordingly.
    ```

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Hosting account
    aws iam create-policy \
    --policy-name example-stack-hosting-cdk-bootstrap-policy-aws-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/exampleStack/example-stack-hosting-cdk-bootstrap-policy-aws-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<HOSTING_ACCOUNT_ID>/<HOSTING_ACCOUNT_REGION> --trust <MAIN_ACCOUNT_ID> --trust-for-lookup <MAIN_ACCOUNT_ID> --cloudformation-execution-policies "arn:aws:iam::<HOSTING_ACCOUNT_ID>:policy/example-stack-hosting-cdk-bootstrap-policy-aws-us-east-1" -c "application=ExampleStack"
    ```

### SWBStck Package Instructions
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to allow only the creation of services required by `SWBStack`. This package provides 1 pre-configured bootstrap policy document for `SWBStack main` account:
    1. [SWBStack main account bootstrap policy](./src/cdk-bootstrap-policies/swbStack/swb-stack-main-cdk-bootstrap-policy-aws-us-east-1.json)

    ```
    These policies assume that the services are being deployed to `us-east-1` region. If you want to deploy to a different region then create a new policy using the existing policy document and update the `region` accordingly.
    ```

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Main account
    aws iam create-policy \
    --policy-name swb-stack-main-cdk-bootstrap-policy-aws-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/swbStack/swb-stack-main-cdk-bootstrap-policy-aws-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<MAIN_ACCOUNT_ID>/<MAIN_ACCOUNT_REGION> --cloudformation-execution-policies "arn:aws:iam::<MAIN_ACCOUNT_ID>:policy/swb-stack-main-cdk-bootstrap-policy-aws-us-east-1" -c "application=SWBStack"
    ```
1. Update [config](./src/configs/config.json) file for `swbStack` params:
    ```bash
     "swbStack": {
        # Base path for the ssm param (Update only if the ssm param path is updated in the swb-reference package)
        "ssmBase": "swb",

        # Stage name that you plan to deploy
        "stage": "testEnv",

        # RegionShortName used in the STAGE.yaml file in swb-reference
        "regionShortName": "va",

        # Update if you want to increase the session duration for the github-oidc role
        "maxSessionDuration": 7200
    }
    ```
1. Build:
    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc
    rushx build
    ```
1. Deploy:
    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc
    # Set the credentials for the Main account
    rushx cdk:deploy:swbStack
    ```
1. You will get the OIDC Role ARN as the output from this [file](./src/configs/cdk-outputs.json). Copy the Role ARN and update the `ASSUME_ROLE` secret.


# Note
If you are trying to deploy OIDC role for `ExampleStack` and `SWBStack` in the same AWS account but in different regions then you will encounter an error:

```
CREATE_FAILED        | Custom::AWSCDKOpenIdConnectProvider | OpenIdConnectProviderE1223DBB
Received response status [FAILED] from custom resource. Message returned: EntityAlreadyExists: Provider with url https://token.actions.githubusercontent.com already exists
```

This error states that you can have only one Identity Provider in an AWS account and it was already created by one of the previous deployment. To solve this, please use these commands instead:

```bash
rushx cdk:deploy:existingoidc:exampleStack
rushx cdk:deploy:existingoidc:swbStack
```