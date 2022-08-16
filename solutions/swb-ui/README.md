# swb-ui

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

## Code Coverage

| Statements | Branches | Functions | Lines |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-Unknown%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-Unknown%25-brightgreen.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-Unknown%25-brightgreen.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-Unknown%25-brightgreen.svg?style=flat) |

This is a [Next.js](https://nextjs.org/) project bootstrapped with [`create-next-app`](https://github.com/vercel/next.js/tree/canary/packages/create-next-app).

## Deploy UI to AWS

### Prerequisite:

Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

### Deploy static website

Project `swb-ui` can be deployed as a static website using S3 Bucket and CloudFront by following the next steps:

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
Follow instructions [here](../swb-reference/SETUP_v2p1.md##installation) to setup installation of API.

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

## Adding/Removing Plugins

There are four main steps for setting up a new app/plugin for Service Workbench.

1. Validate that the deployable app/plugin package builds properly to be able to be imported/consumed by the SWB UI.
    - `Typescript` must be used by the app/plugin package.
    - The required `main` and `typings` fields within the app/plugin package.json to the `App` component are filled and correct.
    - Any CSS that the app/plugin uses must be in the `src/styles` of SWB for Next JS to render the CSS.
    - Images used by the app/plugin must reside in the `public` directory of `swb-ui`. For example, the image may be rendered within the plugin via `<img src="/logo.png" className="App-logo" alt="logo" />` where the image source is simply where it resides in the `public` directory of `swb-ui`. In this case `swb-ui/public/logo.png`.
2. Copy over the entire package to the `swb-plugins` directory.
    - The name of the directory containing the package contents will be the name that appears on the navigation bar and breadcrumbs. For spaces ( ), use underscores (_), which will be replaced when rendered in the SWB UI. Do not use hyphens (-) in the directory name.
3. In the root directory of SWB, run the bash script with the command `bash ./solutions/swb-ui/scripts/updatePlugins.sh`.
    - The script updates the necessary dependencies and creates the page for the app/plugin to render within the SWB UI. In addition, it runs `rush update` to make sure all dependencies between the rush packages are common.
    - One common way `rush update` may fail is if the newly added app/plugin does not have the same dependency version as the rest of SWB. For example, if the app uses `typescript` then it must match the same version that SWB uses.
4. Run rush build and deploy SWB to AWS.
    - Common error that could occur is if the `package.json` of the app/plugin does not have the `main` and `typings` filled out or that the package is not being built/compiled correctly.

For removing a app/plugin, simply delete the directory containing the package contents within the `swb-plugins` directory. Then repeat steps 3 and 4 from above to update SWB with the changed `swb-plugins` directory.
