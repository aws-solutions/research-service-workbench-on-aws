# `github-oidc`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description
This package creates the roles in an AWS account that can be assumed from a github workflow. The permissions given to these roles enable the workflow to perform deployments in the specified AWS account. 2 CDK stacks are created as part of this package:
1. `OIDCProviderStack`: This stack deploys the identity provider for GitHub
2. `<GitHub-Org>-GitHubOIDCStack`: This stack deploys the role-to-assume which will be used in our github workflows to deploy and perform integration/e2e tests

## Pre-requisites
1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
2. `rush cinstall`
3. **Update the GitHub-Orgs and GitHub-Repos [here](./src/configs/config.ts)**
4. `rush build -t @aws/@aws/workbench-core-github-oidc`
5. Configure AWS Credentials locally for the AWS Account where you want to deploy this solution: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile
6. If your account is not bootstrapped, then please run:
    ```bash
    rushx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
    ```

## Deploy
The command below will deploy and generate the assume-role-arn [here](./src/configs/cdk-outputs.json#L5)
```bash
rushx cdk:deploy
```

## Update GitHub secrets
In GitHub secrets:

    1. For Dev Account: update ASSUME_ROLE with the role arn
    2. For Test Account: update TEST_ASSUME_ROLE with the role arn
