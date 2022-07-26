# swb-ui
## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Deploy UI to AWS

### Prerequisite:

1. Make sure to Follow instructions in [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Deploy static website

Project swb-ui can be deployed as a static website using S3 Bucket and CloudFront by following the next steps:

1. Open file `solutions/swb-reference/src/config/<STAGE>.js`
2. Copy API URL value from variable `apiUrlOutput`, the value has the format `https://{apiId}.execute-api.{region}.amazonaws.com/dev/`

    API URL can also be found by logging AWS. Log into the main account and go to Cloudformation on the console. Find the Cloudformation stack for your main account. It should have the format `<swb>-<stage>-<awsRegionShortName>`. In the outputs you'll find `apiUrlOutput` 
3. Create a file in directory `solutions/swb-ui` with name `.env.local` if it does not exist.
4. Assign `apiUrlOutput` value to environment variable `NEXT_PUBLIC_API_BASE_URL` by updating `.env.local` file with the next format:
    ```
    NEXT_PUBLIC_API_BASE_URL="<apiUrlOutput>"
    ```
5. Navigate to `solutions/swb-ui`
6. Run command `STAGE=<STAGE> rushx deploy-ui-and-api`

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
Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Start App
1. Open file `solutions/swb-reference/src/config/<STAGE>.js`
2. Copy the API URL value from variable `apiUrlOutput`, the value has the format `https://{apiId}.execute-api.{region}.amazonaws.com/dev/`

    API URL can also be found by logging AWS. Log into the main account and go to Cloudformation on the console. Find the Cloudformation stack for your main account. It should have the format `<swb>-<stage>-<awsRegionShortName>`. In the outputs you'll find `apiUrlOutput` 
3. Assign value to environment variable `NEXT_PUBLIC_API_BASE_URL` by creating a file with name `.env.local` in `swb-ui` directory containing the API URL with the format:
    ```
    NEXT_PUBLIC_API_BASE_URL="<API_URL>"
    ```
4. In the project directory, ensure all dependencies are installed. Run:
    ```
    rush update
    rush build
    ```
5. Run the server:
    ```
    rushx start
    ```

If you would like the UI to update as you edit code, you can run the code in development mode
```
rushx dev
```

## App
Open [http://localhost:3000](http://localhost:3000) in your browser to access the app.

## Design system

For the design system we are using @awsui project. More information can be found on its [website](https://polaris.a2z.com) or [GitHub](https://github.com/aws/awsui-documentation).