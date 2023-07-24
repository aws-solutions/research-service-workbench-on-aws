# swb-reference
## `main branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/main/graph/badge.svg?flag=swb-reference)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/main)

## `develop branch coverage`
[![codecov](https://codecov.io/github/aws-solutions/research-service-workbench-on-aws/branch/develop/graph/badge.svg?flag=swb-reference)](https://app.codecov.io/github/aws-solutions/research-service-workbench-on-aws/tree/develop)

This release includes:

* Sagemaker Notebook as a compute environment (connect, start, stop, terminate)
* Dataset attachment to Sagemaker Notebooks
* Research user creation
* Workspaces include search/filter/sort functions
* Customers able to add custom environments
* Improved performance on workspace page with pagination


# Setup Instructions for RWB

Follow the instructions below to deploy RWB with Sagemaker Notebook lifecycle support. You'll be able to 
launch/start/stop/terminate/connect to a Sagemaker Notebook instance.

## Prerequisite
* An AWS account for deploying RWB API. This account will be called the `Main Account`.
   * On the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `Main Account` as the `default` profile 
* An AWS account for hosting environments. This account will be called the `Hosting Account`. The `Hosting Account` must be different from `Main Account`.
* Software
  * [Rush](https://rushjs.io/pages/developer/new_developer/) v5.62.1 or later. We'll be using this tool to manage the packages in our mono-repo
  * Node 14.x or 16.x [(compatible node versions)](https://github.com/aws-solutions/research-service-workbench-on-aws/blob/main/rush.json#L9)
  * [POSTMAN](https://www.postman.com/) (Optional) This is used for making API requests to the server. POSTMAN is not needed if you already have a preferred API client. 
* The requirements below are for running the lambda locally 
   * Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
   * Install Docker ([link](https://docs.docker.com/get-docker/))

## Installation
### Setup Config File
1. Navigate to `solutions/swb-reference`.
1. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder. The stage value uniquely identifies this deployment. Some common values that can be used are `dev`, `beta`, and `gamma`.
1. Open your new `<STAGE>.yaml` file and uncomment the `stage` attribute. Provide the correct `<STAGE>` value for the attribute
1. Open your new `<STAGE>.yaml` file and uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing. The `awsRegion` value will determine which region RWB is deployed in.
1. Uncomment `rootUserEmailParamStorePath` and provide a name for a SSM parameter that will contain the main account user's email address, e.g. `/rsw/<stage>/rootUser/email`.
1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `rootUserEmailParamStorePath` and the value as the main account user's email address.
1. Uncomment `allowedOrigins` and provide a list of URLs that will be allowed to access your RSW API, e.g. ['http://localhost:3000','http://localhost:3002'].
1. Uncomment `cognitoDomain` and provide a **globally unique** string that will be used for the cognito domain. This should be an alphanumeric string (hyphens allowed) that does not conflict with any other existing cognito domains.
1. If running your Lambda locally, `userPoolId`, `clientId`, and `clientSecret` will need to be set after the first execution of `cdk-deploy` as seen below under "Deploy the code". You will then need to re-run `STAGE=<STAGE> rushx cdk-deploy`.
1. If your SWB instance is going to use a custom network, uncomment `vpcId` and `albSubnetIds` and provide their respective values from your network.
1. Uncomment `albInternetFacing` and set it's value true if you want an internet-facing ALB instance, otherwize set to false.
1. Uncomment `hostedZoneId` and `domainName` and provide their respective values from your Hosted Zone. If you dont have a domain configured, follow instructions to [create a Hosted Zone](https://docs.aws.amazon.com/Route53/latest/DeveloperGuide/CreatingHostedZone.html).
1. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file


### Setup CDK
We'll be using AWS CDK to deploy our code to AWS. Follow the steps below to onboard CDK onto your AWS `Main Account`.

In `swb-reference` root directory run the follow code
```bash
rush install
rush build
rushx compile
STAGE=<STAGE> rushx cdk bootstrap
```

After bootstrap is completed you'll see a message like this
```bash
Found configuration in /Users/<user>/workplace/research-service-workbench-on-aws/rush.json

Rush Multi-Project Build Tool 5.62.1 - Node.js 14.17.0 (LTS)
> "cdk bootstrap"

 ⏳  Bootstrapping environment aws://123456789012/ap-northeast-3...
Trusted accounts for deployment: (none)
Trusted accounts for lookup: (none)
Using default execution policy of 'arn:aws:iam::aws:policy/AdministratorAccess'. Pass '--cloudformation-execution-policies' to customize.
CDKToolkit: creating CloudFormation changeset...
 ✅  Environment aws://123456789012/ap-northeast-3 bootstrapped.
```

### Deploy the code
In `swb-reference` root directory run the following code

```bash
STAGE=<STAGE> rushx cdk-deploy              # Deploy code to `Main Account` on AWS
```
Take note of the following Cloudformation outputs. We will be using them in future steps.
```
S3BucketArtifactsArnOutput
AccountHandlerLambdaRoleOutput
ApiLambdaRoleOutput
StatusHandlerLambdaRoleOutput
APIGatewayAPIEndpoint
DataSetsBucketName
```

Run the post deployment step
```
STAGE=<STAGE> rushx run-postDeployment      # Setup Service Catalog portfolio and products
```
After post deployment is complete a temporary password will be sent to the main account user's email, take note of the temporary password as its going to be needed for API authenticated requests.

## Deploy to the Hosting Account
After the deployment succeeds, we will need to set up the `Hosting account`
1. Log into your AWS `Hosting Account` and go to Cloudformation
1. Choose to create a new stack. On the prompt `Create Stack`, choose `Upload a template file`. 
1. Upload the corresponding .yaml file from [templates](./src/templates) depending on your installation type. Default installation uses [onboard-account.cfn.yaml](./src/templates/onboard-account.cfn.yaml), for more customizable network options, refer to [Hosting Account Templates](./src/templates/README.md)
1. For the stack name, use the following value: `rsw-<stage>-<awsRegionShortName>-hosting-account`, for example `rsw-dev-va-hosting-account`
1. For the parameters provide the following values
```yaml
Namespace: rsw-<stage>-<awsRegionShortName>      # These values should be the same as in your config file
MainAccountId: <12 digit Account ID of Main Account>
ExternalId: <externalIdValue>  # An arbitrary unique ID used to identify this account
VpcCidr: 10.0.0.0/16
PublicSubnetCidr: 10.0.0.0/19
AccountHandlerRoleArn: <CFN_OUTPUT.AccountHandlerLambdaRoleOutput> 
ApiHandlerRoleArn: <CFN_OUTPUT.ApiLambdaRoleOutput> 
EnableFlowLogs: true
LaunchConstraintPolicyPrefix: *
LaunchConstraintRolePrefix: *
StatusHandlerRoleArn: <CFN_OUTPUT.StatusHandlerLambdaRoleOutput>
```

After the deployment is complete, take note of the following Cloudformation outputs. The outputs are on the `Outputs` tab. We will be using in future steps
```
HostingAccountHandlerRoleArn
EncryptionKeyArn
EnvMgmtRoleArn
VPC
VpcSubnet
```
### Configuring App Registry applications limits(Optional)

If you are estimating to have less than 999 Workspaces created in your Service Workbench instance, you can skip this step. 

Research Service Workbench on AWS uses [AWS App Registry](https://docs.aws.amazon.com/servicecatalog/latest/arguide/intro-app-registry.html) applications to group and add metadata and attributes to created resources.
By using App Registry, Research Service Workbench is able to organize its resources and track their dependencies more efficiently.
Every resource created in Research Service Workbench is associated to an App Registry application including all workspaces.
App Registry currently has a default limit of 1000 resources per application.

If you are estimating to have more than 999 Workspaces created in your Research Service Workbench instance a service quota increase will be needed.
Follow these steps to request a quota increase for App Registry application resources:

1. Sign in to your **Hosting Account** in the [AWS Management Console](https://console.aws.amazon.com/console/home?nc2=h_ct&src=header-signin).

1. Open the [**Service Quotas console**](https://console.aws.amazon.com/servicequotas/home).

2. Click **AWS Services** in the menu bar on the left side to enter the search screen. 

1. In the search screen, enter `AWS Service Catalog` and choose **AWS Service Catalog** from the results.

1. Under **Services Quota**, choose **Resources per application**.

1. On the **Resources per application** page, choose **Request Quota Increase** under **Recent quota increase requests**.

1. In **Change quota**, enter your estimated number of workspaces plus 1 (infrastructure resource).

1. Choose **Request**.


### Setup Integration Test Config File

## Get access token

To get the `accessToken`, `csrfCookie`, and `csrfToken` for making authenticated API requests please refer [here](#obtain-access-token-for-making-authenticated-api-requests).  

## POSTMAN Setup
In POSTMAN create an environment using the instructions [here](https://learning.postman.com/docs/sending-requests/managing-environments/#creating-environments).
Your environment should have four variables. Name the first one `API_URL` and the value should be the `APIGatewayAPIEndpoint` value from [Deploy the code step](#deploy-the-code).

Name the second, third and fourth ones `ACCESS_TOKEN`, `CSRF_COOKIE`, and `CSRF_TOKEN` and their values should be the `accessToken`, `csrfCookie`, and `csrfToken` you got from [Setup UI and Get Access Token](#setup-ui-and-get-access-token)

Import [RSW Postman Collection](./RWB.postman_collection.json). Instructions for how to import a collection is [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman)

1. Follow these steps to assign a value to `terminatedEnvId` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Follow instructions in [Launch Sagemaker Notebook Environment](#launch-sagemaker-notebook-instance) to create a new Sagemaker environment and wait for COMPLETED status.
    1. Copy the `id` value from the response
    1. Use the `id` of the new environment to [Stop the environment](#stop-an-environment) and wait for STOPPED status.
    1. Use the `id` of the new environment to [Terminate the environment](#terminate-the-environment).
    1. Use new instance information to [Terminate](#terminate-the-environment)
    1. In `./integration-tests/config` directory assign the `id` of the new environment to the `terminatedEnvId` in `<STAGE>.yaml` file  

## Setup Account Resources
### Onboard hosting account
In **RSW Official** Postman Collection under **hosting account** folder choose **Create Hosting Account** API to onboard a hosting account. 
Remember to fill in the correct values for your account.
Custom values that needed to be provided by you will be `<INSIDE THIS>`

In the body tab set `envMgmtRoleArn` parameter to the `EnvMgmtRoleArn` value from [Deploy to the Hosting Account step](#deploy-to-the-hosting-account).

In the body tab set `hostingAccountHandlerRoleArn` parameter to the `HostingAccountHandlerRoleArn` value from [Deploy to the Hosting Account step](#deploy-to-the-hosting-account).

1. Follow these steps to assign a value to `projectAdmin1UserNameParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `projectAdmin1UserNameParamStorePath` and provide a name for a SSM parameter that will contain a Project Admin user's email address, e.g. `/swb/<STAGE>/PA/email`.
    1. Follow instructions in [Create User Step](#create-users) to create a new Project Admin user for the integration tests
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `projectAdmin1UserNameParamStorePath` and the value as the created Project Admin's email.

Send a **Create Hosting Account** request 

POST `{{API_URL}}/aws-accounts`
```json
{
    "name": "<Unique account name>",
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "hostingAccountHandlerRoleArn": "<CFN_OUTPUT.HostingAccountHandlerRoleArn>",
    "externalId": "workbench"
}
```
Once the request excecute successfully a response with the following format will be displayed
```json
{
    "id": "acc-########-####-####-####-############",
    "name": "<Unique account name>",
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "hostingAccountHandlerRoleArn": "<CFN_OUTPUT.HostingAccountHandlerRoleArn>",
    "externalId": "workbench",
    "status": "PENDING",
    "updatedAt": "2023-03-17T13:45:46.195Z",
    "createdAt": "2023-03-07T22:31:40.783Z"
}
```
Take note of the `id` that was returned. We'll need it for the next step. We'll refer to this value as `ACCOUNT_ID`.

Wait for account handler to run. It runs once every 5 minutes. You'll know that it's completed when the account status is listed as `CURRENT`.

To monitor the account status, in **RSW Official** Postman Collection under **hosting account** folder choose **Get Hosting Account** API.

In the params tab set accountId parameter to the `ACCOUNT_ID` value from previous step and send request.

A response with the status property will be displayed 
```json
{
    "id": "acc-########-####-####-####-############",
    "name": "<Unique account name>",
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "status": "PENDING"
}
```

You can also find cloudwatch logs for the account handler in the `Main account`. It's at `aws/lambda/swb-<stage>-<awsRegionShortName>-accountHandlerLambda`

### Setup Cost Center
In **RSW Official** Postman Collection under **costCenters** folder choose **Create Cost Center** API. 

In the body tab set `accountId` parameter to the `ACCOUNT_ID` value from [Onboard hosting account step](#onboard-hosting-account).

Send a **Create Cost Center** request 

POST `{{API_URL}}/costCenters/`
```json
{
    "name": "<cost center name>",
    "accountId": "<ACCOUNT_ID>",
    "description": "<cost center description>"
}
```
Take note of the `id` from the **Create Cost Center** response. We'll need it for the next step. We'll refer to this value as `COST_CENTER_ID`.

### Setup Project
In **RSW Official** Postman Collection under **projects** folder choose **Create project** API. 

In the body tab set `costCenterId` parameter to the `COST_CENTER_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

Send a **Create project** request 

POST `{{API_URL}}/projects`
```json
{
    "name": "<project name>",
    "description": "<project description>",
    "costCenterId": "<COST_CENTER_ID>",
}
```
In the response take note of the `id` that was returned. We'll refer to this value as `PROJECT_ID`.

## Setup EnvironmentTypeConfig
### Retrieve Environment Type Id
In **RSW Official** Postman Collection under **envType** folder choose **List envTypes** API and send request.
If there aren't any environment types displaying in the response, check whether the post deployment step ran correctly.

Running the **List envTypes** request in postman should return a json with the following format
```json
{
    "data": [
    {
        "id": "et-<productId>,<provisioningArtifactId>",
        "productId": "<productId>",
        "provisioningArtifactId": "<provisioningArtifactId>",
        "description": "description",
        "name": "name",
        "type": "sagemakerNotebook",
        "status": "NOT_APPROVED",
        "createdAt": "2022-07-21T21:24:57.171Z",
        "updatedAt": "2022-07-21T21:24:57.171Z",
        "params": 
            {
                "DatasetsBucketArn": {
                        "Description": "Name of the datasets bucket in the main account",
                        "Type": "String"
                    },
                    "EncryptionKeyArn": {
                        "Description": "The ARN of the KMS encryption Key used to encrypt data in the notebook",
                        "Type": "String"
                    },
                    "AccessFromCIDRBlock": {
                        "Default": "10.0.0.0/19",
                        "Description": "The CIDR used to access sagemaker notebook",
                        "Type": "String"
                    },
                    "VPC": {
                        "Description": "VPC for Sagemaker Notebook",
                        "Type": "AWS::EC2::VPC::Id"
                    },
                    "S3Mounts": {
                        "Description": "A JSON array of objects with name, bucket and prefix properties used to mount data",
                        "Type": "String"
                    },
                    "Namespace": {
                        "Description": "An environment name that will be prefixed to resource names",
                        "Type": "String"
                    },
                    "MainAccountId": {
                        "Description": "The Main Account ID where application is deployed",
                        "Type": "String"
                    },
                    "MainAccountKeyArn": {
                        "Description": "The ARN of main account bucket encryption key",
                        "Type": "String"
                    },
                    "IamPolicyDocument": {
                        "Description": "The IAM policy to be associated with the launched workstation",
                        "Type": "String"
                    },
                    "EnvironmentInstanceFiles": {
                        "Description": "An S3 URI (starting with \"s3://\") that specifies the location of files to be copied to the environment instance, including any bootstrap scripts",
                        "Type": "String"
                    },
                    "MainAccountRegion": {
                        "Description": "The region of application deployment in main account",
                        "Type": "String"
                    },
                    "InstanceType": {
                        "Default": "ml.t3.xlarge",
                        "Description": "EC2 instance type to launch",
                        "Type": "String"
                    },
                    "Subnet": {
                        "Description": "Subnet for Sagemaker Notebook, from the VPC selected above",
                        "Type": "AWS::EC2::Subnet::Id"
                    },
                    "AutoStopIdleTimeInMinutes": {
                        "Description": "Number of idle minutes for auto stop to shutdown the instance (0 to disable auto-stop)",
                        "Type": "Number"
                    }
            }
    }
    ]

}
```
In the response take note of the `id` of the environment type you are looking for, the `name` will have the format `<product name>-<provisioning artifact name>`, e.g. `sageMakerNotebook-v1`. We'll need it for the next step. We'll refer to this `id` value as `ENV_TYPE_ID`.

### Approve Environment Type
In **RSW Official** Postman Collection under **envType** folder choose **Update envType** API to change the `status` of environment type.

In the params tab set `id` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

Send an **Update envType** request

PATCH `{{API_URL}}/environmentTypes/:id`
```json
{
    "status": "APPROVED"
}
```

### Create Environment Type Config
In **RSW Official** Postman Collection under **envTypeConfig** folder choose **Create envTypeConfig** API.

In the params tab set `envTypeId` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

Send a **Create envTypeConfig** request

POST `{{API_URL}}/environmentTypes/:envTypeId/configurations`
```json
{
    "type": "sagemakerNotebook",
    "description": "<description>",
    "name": "<environment type config name>",
    "estimatedCost": "<estimated cost>",
    "params": [
     {
      "key": "IamPolicyDocument",
      "value": "${iamPolicyDocument}"
     },
     {
      "key": "InstanceType",
      "value": "ml.t3.medium"      
     },
     {
      "key": "AutoStopIdleTimeInMinutes",
      "value": "0"
     },
     {
       "key": "CIDR",
       "value": "0.0.0.0/0"
     }
    ]
}
```
In the response take note of the `id` that was returned. We'll refer to this value as `ENV_TYPE_CONFIG_ID`.

If you would like to launch a sagemaker notebook instance with a different instance type than `ml.t3.medium`, you can replace that value in the JSON above.

### Associate Project to Environment Type Configuration
In **RSW Official** Postman Collection under **project** folder choose **Associate project with EnvTypeConfig** API.

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the params tab set `envTypeId` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

In the params tab set `envTypeConfigId` parameter to the `ENV_TYPE_CONFIG_ID` value from [Create Environment Type Config step](#create-environment-type-config).

Send **Associate project with EnvTypeConfig** request.

PUT `{{API_URL}}/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships`


## Create new DataSets
In **RSW Official** Postman Collection under **datasets** folder choose **Create Internal DataSet** API.

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the body tab set `region` parameter to the `awsRegion` value from [Setup Config File Step](#setup-config-file).

In the body tab set `storageName` parameter to the `DataSetsBucketName` value from [Deploy The Code Step](#deploy-the-code).

Note: Only Researchers and Project Admins can access this API, the user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

POST `{{API_URL}}/projects/:projectId/datasets/`

```json
{
    "name": "<Enter a unique DataSet name>",
    "region": "<awsRegion>",
    "storageName": "<Enter the main account DataSets bucket name>",
    "path": "<Folder name to be created for this in the bucket>",
    "awsAccountId": "<Main account ID>",
    "type": "internal"
}
```
At this point you'll receive a JSON response. That response will have an `id` value. You could use that `id` value in the `datasetIds` array while launching an environment.
Once registered a DataSet using this API, you could also upload files to its bucket folder directly so they're available at environment boot time.

## Launch Sagemaker Notebook Instance
In **RSW Official** Postman Collection under **environments** folder choose **Launch Environment** API.

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the body tab set `envTypeId` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

In the body tab set `envTypeConfigId` parameter to the `ENV_TYPE_CONFIG_ID` value from [Create Environment Type Config step](#create-environment-type-config).

Note: Only Researchers and Project Admins can access this API, the user calling this API and the environment type config in the request need to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user) , [Associate Project to Environment Type Configuration](#associate-project-to-environment-type-configuration).

Send **Launch Environment** request.

POST `{{API_URL}}/projects/:projectId/environments`

```json
{
    "description": "<description>",
    "name": "<environment name>",
    "envTypeId": "<ENV_TYPE_ID>",
    "envTypeConfigId": "<ENV_TYPE_CONFIG_ID>",
    "datasetIds": [],
    "envType": "sagemakerNotebook"
}
```
In the response take note of the `id` and `projectId` that were returned. We'll refer to the `id` value as `ENV_ID` and the `projectId` value as `ENV_PROJECT_ID`.

## Check Environment Status
In **RSW Official** Postman Collection under **environments** folder choose **Get Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Get Environment** request.

GET `{{API_URL}}/projects/:projectId/environments/:id`

In the response you'll see the status of the environment.
`PENDING` means the environment is being provisioned. `COMPLETED` means the environment is ready to be used.

## Connect to Environment
In **RSW Official** Postman Collection under **environments** folder choose **Get Connection** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: Only Researchers and Project Admins can access this API, the user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Get Connection** request.

GET `{{API_URL}}/projects/:projectId/environments/:id/connections`

In the response you'll find a `url`. Copy and paste that `url` into the browser to view your Sagemaker Notebook instance.

## Stop an Environment
In **RSW Official** Postman Collection under **environments** folder choose **Stop Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Stop Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/stop`

## Start an Environment
In **RSW Official** Postman Collection under **environments** folder choose **Start Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Start Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/start`

## Terminate the Environment
In **RSW Official** Postman Collection under **environments** folder choose **Terminate Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Terminate Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/terminate`

# User Management
In order to create new Admins:
1. You must go to the Cognito console in your AWS Console.
1. Under **User pools**, look for and click on `rsw-userpool-<stage>-<abbreviation>`.
1. Under the **Users tab**, choose **Create user**.
1. Once the user is created, click on the username and under **Group memberships**, choose **Add user to group** to add the user to the ITAdmin group.

## Create Users
In **RSW Official** Postman Collection under **users** folder choose **Create User** API.

Send **Create User** request.

POST `{{API_URL}}/users`

```json
{
    "firstName": "<first name>",
    "lastName": "<last name>",
    "email": "<email address>"
}
```
In the response take note of the `id` that was returned. We'll refer to this value as `USER_ID`.

## Assign Project to User
Note: Only `Researchers` and `ProjectAdmin` require project association.

In **RSW Official** Postman Collection under **projects** folder choose **Add User To Project** API.

In the params tab set `userId` parameter to the `USER_ID` value from [Create User step](#create-user).

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the body tab set `role` parameter to the role the user is going to be assigned for the provided project(`ProjectAdmin`/`Researcher`).

Send **Add User To Project** request.

POST `{{API_URL}}/projects/:projectId/users/:userId/relationships`

```json
{
    "role": "Researcher"
}
```

## Integration Tests

`swb-reference` package contains integration tests that run API tests against SWB APIs, they can be configured to run automatically as part of a GitHub workflow or CI/CD pipeline.

Note: Integration tests will create resources in the environment they are executed against.


### Prerequisite

Follow instructions [here](##installation) to setup installation of API and Postman collection.

OR

Complete the following sections and then run the automation script to setup the environment:
1. [Setup Config File](#setup-config-file)
1. [Setup CDK](#setup-cdk)
1. [Deploy the code](#deploy-the-code)
1. [Deploy to the Hosting Account](#deploy-to-the-hosting-account)
1. Run the automation script:
    ```bash
    # Set the credentials for the main account
    # Configure AWS cli to the region your stack is deployed in main account 
    # Then run the script
    cd solutions/swb-reference/scripts
    ./setupIntegTestEnv.sh -h #This will display the help screen along with an example on how to run this script
    ```
1. Run the integration tests:
    ```bash
    cd solutions/swb-reference
    `STAGE=<STAGE> rushx integration-tests`
    ```

Note: `setupIntegTestEnv.sh` script also creates the `Config file for integration test`, you can directly run the integration test after the successful completion of this script.

### Setup Integration Test Config File

1. In `./integration-tests/config` make a copy of `example.yaml` and name it `<STAGE>.yaml`. Uncomment the attributes and provide the appropriate config values.

1. For `envTypeId` and `envType`, follow instructions in [Retrieve environment type id step](#retrieve-environment-type-id) and choose the Environment Type that integration test will use as default when creating any Environment, copy the values from properties `id` and `type` from request and assign `id` value to `envTypeId` property and `type` value to `envType` property in `./integration-tests/config/<STAGE>.yaml` file

1. Follow these steps to assign a value to the `envTypeConfigId` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. In **RSW Official** Postman Collection under **envTypeConfig** folder choose **List envTypeConfigs** API.
    1. In the params tab set `envTypeId` parameter to the `envTypeId` value from your `./integration-tests/config/<STAGE>.yaml`.
    1. Send **List envTypeConfigs** request. If there are no environment type configs displayed please follow instructions in [Setup Environment Type Config step](#setup-environmenttypeconfig) to create a new environment type config for selected environment type.
    1. Choose the Environment Type Config that integration test will use as default when creating any Environment and copy the `id` value from the request.
    1. In `./integration-tests/config` directory assign value copied to `envTypeConfigId` property in `<STAGE>.yaml` file 

1. Follow these steps to assign a value to `projectId` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. In **RSW Official** Postman Collection under **projects** folder choose **List projects** API.
    1. Send **List projects** request. If there are no projects displayed please follow instructions in [Setup Project step](#setup-project) to create a new project.
    1. Choose the Project that integration test will use as default when creating any Environment and testing project functionality and copy the `id` value from the response.
    1. In `./integration-tests/config` directory assign `id` to `projectId` in `<STAGE>.yaml` file 

1. Follow these steps to assign a value to `rootUserNameParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `rootUserNameParamStorePath` and provide a name for a SSM parameter that will contain the main account user's email address, e.g. `/swb/<STAGE>/rootUser/email`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `rootUserNameParamStorePath` and the value as the main account user's email address.

1. Follow these steps to assign a value to `rootPasswordParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `rootPasswordParamStorePath` and provide a name for a SSM parameter that will contain the main account user's email address, e.g. `/swb/<STAGE>/rootUser/password`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `rootPasswordParamStorePath` and the value as the main account user's password from [Reset User Password Step](#reset-user-password).

1. Follow these steps to assign a value to `projectAdmin1UserNameParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `projectAdmin1UserNameParamStorePath` and provide a name for a SSM parameter that will contain a Project Admin user's email address, e.g. `/swb/<STAGE>/PA/email`.
    1. Follow instructions in [Create User Step](#create-users) to create a new Project Admin user for the integration tests
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `projectAdmin1UserNameParamStorePath` and the value as the created Project Admin's email.

1. Follow these steps to assign a value to `projectAdmin1PasswordParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `projectAdmin1PasswordParamStorePath` and provide a name for a SSM parameter that will contain the Project Admin's password, e.g. `/swb/<STAGE>/PA/password`.
    1. Follow instructions in [Reset User Password Step](#reset-user-password) to assign a password to the Project Admin assigned to `projectAdmin1UserNameParamStorePath`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `projectAdmin1PasswordParamStorePath` and the value as the Project Admin's new password.

1. Follow these steps to assign a value to `projectAdmin2UserNameParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `projectAdmin2UserNameParamStorePath` and provide a name for a SSM parameter that will contain a second Project Admin user's email address, e.g. `/swb/<STAGE>/PA2/email`.
    1. Follow instructions in [Create User Step](#create-users) to create a new Project Admin user for the integration tests
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `projectAdmin2UserNameParamStorePath` and the value as the created second Project Admin's email.

1. Follow these steps to assign a value to `projectAdmin2PasswordParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `projectAdmin2PasswordParamStorePath` and provide a name for a SSM parameter that will contain the second Project Admin's password, e.g. `/swb/<STAGE>/PA2/password`.
    1. Follow instructions in [Reset User Password Step](#reset-user-password) to assign a password to the second Project Admin assigned to `projectAdmin2UserNameParamStorePath`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `projectAdmin2PasswordParamStorePath` and the value as the second Project Admin's new password.

1. Follow these steps to assign a value to `researcher1UserNameParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `researcher1UserNameParamStorePath` and provide a name for a SSM parameter that will contain a Researcher's email address, e.g. `/swb/<STAGE>/Researcher/email`.
    1. Follow instructions in [Create User Step](#create-users) to create a new Researcher user for the integration tests
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `researcher1UserNameParamStorePath` and the value as the created Researcher's email.

1. Follow these steps to assign a value to `researcher1PasswordParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file
    1. Uncomment `researcher1PasswordParamStorePath` and provide a name for a SSM parameter that will contain the Researcher's password, e.g. `/swb/<STAGE>/Researcher/password`.
    1. Follow instructions in [Reset User Password Step](#reset-user-password) to assign a password to the Researcher assigned to `researcher1UserNameParamStorePath`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `researcher1PasswordParamStorePath` and the value as the Researcher's new password.

1. Follow these steps to assign a value to `awsAccountIdParamStorePath` parameter in `./integration-tests/config/<STAGE>.yaml` file. This value is necessary to run teh AWS Accounts multi-step integration test. If the value remains commented out, this test will not run.
    1. Uncomment `awsAccountIdParamStorePath` and provide a name for a SSM parameter that will contain the 12 Digit Account Id of an AWS Account you own that is not the main nor hosting account ID, e.g. `/swb/<STAGE>/accountsTest/awsAccountId`.
    1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `awsAccountIdParamStorePath` and the value as the the 12 Digit Hosting Account Id.

1. Uncomment `defaultHostingAccountId` and in `./integration-tests/config/<STAGE>.yaml` file and assign value `ACCOUNT_ID` from [Onboard Hosting Account Step](#onboard-hosting-account).

1. In this root directory run `STAGE=<STAGE> rushx integration-tests`

### Implement Integreation tests

To use the framework for calling the RSW API, create a `ClientSession` and then use the `resources` attribute to call the `CRUD` commands

Example code for creating new user

```ts
const setup: Setup = new Setup();
const adminSession = await setup.getDefaultAdminSession();
const { data } = await adminSession.resources.users.create({
      firstName: '<first name>',
      lastName: '<Last name>',
      email: `<email address>`
    });
```

Example code for GET one user

```ts
const setup: Setup = new Setup();
const adminSession = await setup.createAdminSession();
const userId = 'userId';
const { data: user } = await adminSession.resources.users.user(userId).get();
```

Example code for GETTING all users

```ts
const setup: Setup = new Setup();
const adminSession = await setup.createAdminSession();
const { data: response } = await adminSession.resources.users.get();
```

## Reset User Password
1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/home) in your main account. If prompted, enter your AWS credentials.
1. Choose **User Pools**.
1. Choose your SWB user pool with name `rsw-userpool-<STAGE>-<Region>`.
1. Choose the **App integration** tab.
1. Under **App client list** choose SWB app client with name `swb-client-<STAGE>-<Region>`.
1. Under **Hosted UI** choose **View Hosted UI**.
1. If the user has a temporary password, login with your user crendentials and you will be prompted to set a new password.
1. If the user already has a non temporary password follow instructions [here](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-hosted-ui-user-forgot-password.html) to reset password.

## Obtain Access Token for making authenticated API requests
1. If you are tying to get a token from a user that still has its temporary password assigned please follow instructions [here](#reset-user-password) to reset user password.
1. Go to `swb-reference/scripts` folder
1. Pull down all required dependencies by running `rushx build`
1. Run `STAGE=<STAGE> node generateCognitoTokens.js <userName> '<password>'` with the correct value for `<userName>` and `<password>`. It should be a user that has been created for your SWB deployment. Note, the quotes around `<password>` is necessary for the script to correctly parse passwords that have symbols in it. 
1. In the console output, use the `accessToken`, `csrfCookie`, and `csrfToken` that are provided to make authenticated API requests. (Note: csrf token is only required for state changing requests)


## Running Code Locally
### Requirements
1. Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
1. Install Docker ([link](https://docs.docker.com/get-docker/))

If you have made changes to the `environment` package or the `swb-reference` package follow these steps

1. In `research-service-workbench-on-aws` root directory run `rush build`
1. In `research-service-workbench-on-aws/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> ./scripts/runLocally.sh`. This will run a local lambda server.


## Troubleshooting Guides

[Workspace Lifecycle Troubleshooting Guide](docs/WorkspaceLifecycleTroubleshootingGuide.md).

## Appendix
### Cloudwatch Logs
* `rsw-<stage>-<awsRegionShortName>-apiLambda`: Logs for api lambda. This lambda gets executed when user makes a request to rsw APIs. 
* `rsw-<stage>-<awsRegionShortName>-accountHandlerLambda`: Logs for account handler lambda. This lamba runs every 5 minutes and is responsible for keeping the hosting account resources in sync with the main account. 
* `rsw-<stage>-<awsRegionShortName>-statusHandlerLambda`: Logs for status handler lambda. This lambda is triggered by EventBridge events that originated in hosting accounts. It updates DDB with environment statuses from the hosting accounts. 
* 
## FAQ

1. **Why is there `jest.config.js` and `config/jest.config.json`?**

* `config/jest.config.json` is the settings for unit tests in the `src` folder
* `jest.config.js` is the settings for tests in `integration-tests`. These tests require setup steps that are not required by unit tests in the `src` folder.

2. **When I try to run the code locally or deploy the code, I'm getting dependency errors between the local packages.**

The `lib` folders for your project might have been deleted. Try running `rush purge; rush build` in the root
directory of this project to build the `lib` folders from scratch.

3. **How do I see which line of code my unit tests did not cover?**

Run `rushx jest --coverage`

4. **Why am I'm getting the error "Cannot find module in `common/temp`"?**

Your `node_modules`  might have been corrupted. Try the following command

```bash
rush purge
rush install
rush build
```