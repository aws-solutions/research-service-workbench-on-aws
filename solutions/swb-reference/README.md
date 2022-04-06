# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-100%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-100%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-100%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-100%25-brightgreen.svg?style=flat) |
# `swb-reference`

## Requirements
The requirements below are for running the lambda locally
1. Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
2. Install Docker ([link](https://docs.docker.com/get-docker/))

## Set Up
1. In root directory at `ma-mono` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute

## Running Code Locally
If you have made changes to the `environment` package or the `swb-reference` package follow these steps
1. In `ma-mono` root directory run `rush build`
2. In `ma-mono/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> rushx run-locally`. This will run a local lambda server.

## Deploying Code
Run one time to Bootstrap the CDK

`rushx cdk bootstrap`

Deploy/Update code

`STAGE=<STAGE TO DEPLOY> rushx cdk-deploy`

## FAQ
**When I try to run the code locally or deploy the code, I'm getting dependency errors between the local packages.**

The `lib` folders for your project might have been deleted. Try running `rush rebuild` in the root 
directory of this project to build the `lib` folders from scratch. 

