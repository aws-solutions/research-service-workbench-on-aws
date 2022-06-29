# Code Coverage
| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-72.27%25-red.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-54.54%25-red.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-65.21%25-red.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-72%25-red.svg?style=flat) |
# `swb-reference`

## Requirements
The requirements below are for running the lambda locally
1. Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
2. Install Docker ([link](https://docs.docker.com/get-docker/))

## Set Up
1. In root directory at `ma-mono` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute
4. Uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing.
5. Uncomment `rootUserEmail` and provide the main account user's email address
6. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

## Running Code Locally
If you have made changes to the `environment` package or the `swb-reference` package follow these steps
1. In `ma-mono` root directory run `rush build`
2. In `ma-mono/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> ./scripts/runLocally.sh`. This will run a local lambda server.

## Deploying Code
Run one time to Bootstrap the CDK

`STAGE=<STAGE> rushx cdk bootstrap`

Deploy/Update code

`STAGE=<STAGE TO DEPLOY> rushx cdk-deploy`

## Run Post Deployment 
This step is necessary to setup Service Catalog portfolio and products

`STAGE=<STAGE> rushx run-postDeployment`

## FAQ
**When I try to run the code locally or deploy the code, I'm getting dependency errors between the local packages.**

The `lib` folders for your project might have been deleted. Try running `rush purge; rush build` in the root 
directory of this project to build the `lib` folders from scratch. 

**How do I see which line of code my unit tests did not cover?**

Run `rushx jest --coverage`

**Cannot find module in `common/temp`**

Your `node_modules`  might have been corrupted. Try the following command
```
rush purge
rush install
rush build
```