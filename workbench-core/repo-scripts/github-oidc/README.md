# `github-oidc`

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Description
This package creates 2 stacks:
1. 

## Pre-requisites
1. [Complete the Pre-requisites for development](./../../../DEVELOPMENT.md/#prerequisites-for-development)
2. `rush cinstall`
3. Update the GitHub-Orgs and GitHub-Repos [here](./src/configs/config.ts)
3. `rush build:test -t @aws/@aws/workbench-core-github-oidc`
4. Configure AWS Credentials locally for the AWS Account where you want to deploy this solution: either `export the credentials` or on the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `account` as the `default` profile

## Deploy
```bash
rushx cdk deploy --all
```
