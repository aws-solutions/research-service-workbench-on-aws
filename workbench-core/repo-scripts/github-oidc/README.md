# `github-oidc`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description
This package create the role that can be used to assume from a github workflow inorder to perform deployments. 2 stacks are created as part of this package:
1. `OIDCProviderStack`: Creates the Identity Provider
2. `<GitHub-Org>-GitHubOIDCStack`: Creates the role-to-assume

## Pre-requisites
1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
2. `rush cinstall`
3. **Update the GitHub-Orgs and GitHub-Repos [here](./src/configs/config.ts)**
3. `rush build -t @aws/@aws/workbench-core-github-oidc`
4. Configure AWS Credentials locally for the AWS Account where you want to deploy this solution: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile
5. If your account is not bootstrapped, then please run:
    ```bash
    rushx cdk bootstrap aws://<ACCOUNT_ID>/<REGION>
    ```

## Deploy
The command below will deploy and generate the assume-role-arn [here](./src/configs/cdk-outputs.json#L5)
```bash
rushx cdk:deploy
```
