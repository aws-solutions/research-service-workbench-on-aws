# `github-oidc`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description
This package creates the roles in an AWS account that can be assumed from a github workflow. The permissions given to these roles enable the workflow to perform deployments in the specified AWS account. 2 CDK stacks are created as part of this package:
1. `OIDCProviderStack`: This stack deploys the identity provider for GitHub
2. `<GitHub-Org>-GitHubOIDCStack`: This stack deploys the role-to-assume which will be used in our github workflows to deploy and perform integration/e2e tests

## Constructs
This package defines 2 constructs:
1. [MafGithubOidcRolePolicy](./src/constructs/maf-github-oidc-role-policy.ts)
2. [SwbGithubOidcRolePolicy](./src/constructs/swb-github-oidc-role-policy.ts)

Use these constructs to update the permissions according to the requirement.

### MAF Example Package Instructions
#### MAF Main Account
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to allow only the creation of services required by `Example package`. This package provides 1 pre-configured bootstrap policy document for MAF `main` account:
    1. [MAF main account bootstrap policy](./src/cdk-bootstrap-policies/maf/maf-main-cdk-bootstrap-policy-us-east-1.json)
This policy assumes that the services are being deployed to `us-east-1` region. If you want to deploy to another region then create a new policy using the existing policy document and update the region accordingly.

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Main account
    aws iam create-policy \
    --policy-name maf-main-cdk-bootstrap-policy-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/maf/maf-main-cdk-bootstrap-policy-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<MAIN_ACCOUNT_ID>/<MAIN_ACCOUNT_REGION> --cloudformation-execution-policies "arn:aws:iam::<MAIN_ACCOUNT_ID>:policy/maf-main-cdk-bootstrap-policy-us-east-1" -c "application=MAF"
    ```
1. Update [config](./src/configs/config.json) file for `maf` params:
    ```bash
     "maf": {
        # Base path of the ssm params, this should reflect the base path defined in the example/infrastructure/integration-tests/config/testEnv.yaml file (Update only if base path is updated in example/infrastructure/integration-tests/config/testEnv.yaml)
        "mafSsmBasePath": "maf/exampleApp/rootUser"

        # CrossAccountRoleName defined at example/infrastructure/src/index.ts#L20
        "mafCrossAccountRoleName": "ExampleCrossAccountRole",

        # Update if you want to increase the session duration for the github-oidc role
        "mafMaxSessionDuration": 3600
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
    rushx cdk:deploy:maf
    ```
1. You will get the OIDC Role ARN as the output from this [file](./src/configs/cdk-outputs.json). Copy the Role ARN and update the `TEST_ASSUME_ROLE` secret.

#### MAF Hosting Account instructons
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to allow only the creation of services required by `Example package`. This package provides 1 pre-configured bootstrap policy document for MAF `hosting` account:
    1. [MAF hosting account boostrap policy](./src/cdk-bootstrap-policies/maf/maf-hosting-cdk-bootstrap-policy-us-east-1.json)
This policy assumes that the services are being deployed to `us-east-1` region. If you want to deploy to a another region then create a new policy using the existing policy document and update the region accordingly.

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Hosting account
    aws iam create-policy \
    --policy-name maf-hosting-cdk-bootstrap-policy-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/maf/maf-hosting-cdk-bootstrap-policy-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<HOSTING_ACCOUNT_ID>/<HOSTING_ACCOUNT_REGION> --trust <MAIN_ACCOUNT_ID> --trust-for-lookup <MAIN_ACCOUNT_ID> --cloudformation-execution-policies "arn:aws:iam::<HOSTING_ACCOUNT_ID>:policy/maf-hosting-cdk-bootstrap-policy-us-east-1" -c "application=MAF"
    ```

### SWB Reference Package Instructions
1. CDK boostrap by default uses `AdministratorAccess` permission which is not secure. In order to overcome this problem, we will first create our own bootstrap policy with permissions to allow only the creation of services required by `SWB Reference`. This package provides 1 pre-configured bootstrap policy document for SWB `main` account:
    1. [SWB main account bootstrap policy](./src/cdk-bootstrap-policies/swb/swb-main-cdk-bootstrap-policy-us-east-1.json)
These policies assume that the services are being deployed to `us-east-1` region. If you want to deploy to a different region then create a new policy using the existing policy document and update the `region` accordingly.

    *Create Policy:*

    ```bash
    cd <ROOT_DIR>/workbench-core/repo-scripts/github-oidc

    # Set the credentials for the Main account
    aws iam create-policy \
    --policy-name swb-main-cdk-bootstrap-policy-us-east-1 \
    --policy-document file://src/cdk-bootstrap-policies/swb/swb-main-cdk-bootstrap-policy-us-east-1.json

    # Boostrap using the new policy you created above
    rushx cdk bootstrap aws://<MAIN_ACCOUNT_ID>/<MAIN_ACCOUNT_REGION> --cloudformation-execution-policies "arn:aws:iam::<MAIN_ACCOUNT_ID>:policy/swb-main-cdk-bootstrap-policy-us-east-1" -c "application=SWB"
    ```
1. Update [config](./src/configs/config.json) file for `swb` params:
    ```bash
     "swb": {
        # Base path for the ssm param (Update only if the ssm param path is updated in the swb-reference package)
        "swbBase": "swb",

        # Stage name that you plan to deploy
        "swbStage": "testEnv",

        # RegionShortName used in the STAGE.yaml file in swb-reference
        "swbRegionShortName": "va",

        # Update if you want to increase the session duration for the github-oidc role
        "swbMaxSessionDuration": 7200
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
    rushx cdk:deploy:swb
    ```
1. You will get the OIDC Role ARN as the output from this [file](./src/configs/cdk-outputs.json). Copy the Role ARN and update the `ASSUME_ROLE` secret.


# Note
If you are trying to deploy OIDC role for MAF and SWB in the same AWS account but in different regions then you will encounter an error:

```
CREATE_FAILED        | Custom::AWSCDKOpenIdConnectProvider | OpenIdConnectProviderE1223DBB
Received response status [FAILED] from custom resource. Message returned: EntityAlreadyExists: Provider with url https://token.actions.githubusercontent.com already exists
```

This error states that you can have only one Identity Provider in an AWS account and it was already created by one of the previous deployment. To solve this, please use these commands instead:

```bash
rushx cdk:deploy:existingoidc:maf
rushx cdk:deploy:existingoidc:swb
```