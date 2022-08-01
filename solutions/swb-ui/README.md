# swb-ui

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Deploy UI to AWS

### Prerequisite:

1. Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Deploy static website

Project swb-ui can be deployed as a static website using S3 Bucket and CloudFront by following the next steps:

1. Navigate to `solutions/swb-ui`

2. Run command `STAGE=<STAGE> rushx deploy-ui-and-api`

After the deployment is completed you'll see the following output:

```
✨  Deployment time: 183.7s

Outputs:
swb-<STAGE>-<awsRegionShortName>.APIGatewayAPIEndpoint67A1C4AD = https://<apiId>.execute-<region>.amazonaws.com/dev/
swb-<STAGE>-<awsRegionShortName>.AccountHandlerLambdaRoleOutput = accountrole
swb-<STAGE>-<awsRegionShortName>.ApiLambdaRoleOutput = ApiLambdaRoleOutput
swb-<STAGE>-<awsRegionShortName>.LaunchConstraintIamRoleNameOutput = LaunchConstraintIamRoleNameOutput
swb-<STAGE>-<awsRegionShortName>.S3BucketArtifactsArnOutput = S3BucketArtifactsArnOutput
swb-<STAGE>-<awsRegionShortName>.S3BucketDatasetsArnOutput = S3BucketDatasetsArnOutput
swb-<STAGE>-<awsRegionShortName>.SagemakerNotebookLaunchSSMDocOutput = SagemakerNotebookLaunchSSMDocOutput
swb-<STAGE>-<awsRegionShortName>.SagemakerNotebookTerminateSSMDocOutput = SagemakerNotebookTerminateSSMDocOutput
swb-<STAGE>-<awsRegionShortName>.StatusHandlerLambdaArnOutput = StatusHandlerLambdaArnOutput
swb-<STAGE>-<awsRegionShortName>.StatusHandlerLambdaRoleOutput = StatusHandlerLambdaRoleOutput
swb-<STAGE>-<awsRegionShortName>.apiUrlOutput = https://<apiId>.execute-<region>.amazonaws.com/dev/
swb-<STAGE>-<awsRegionShortName>.awsRegion = awsRegion
swb-<STAGE>-<awsRegionShortName>.awsRegionShortName = awsRegionShortName
swb-<STAGE>-<awsRegionShortName>.dynamoDBTableOutput = dynamoDBTableOutput
swb-<STAGE>-<awsRegionShortName>.uiClientURL = https://<id>.cloudfront.net
Stack ARN: ARN

✨  Total time: 186.07s
```
To navigate to the website, follow the link provided by `swb-<STAGE>-<awsRegionShortName>.uiClientURL`.

## Running UI App locally

### Prerequisite
1. Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Start App

1. Navigate to `solutions/swb-ui`

2. In the project directory, ensure all dependencies are installed. Run:
    ```
    rush update
    rush build
    ```

3. Run the server:
    ```
    STAGE=<STAGE> rushx dev
    ```


## App

Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

## Design system

For the design system we are using @awsui project. More information can be found on the [AWS-UI GitHub](https://github.com/aws/awsui-documentation).