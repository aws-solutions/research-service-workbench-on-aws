# swb-reference

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

The 0.1.0 beta release is available for customers to test the newly re-architected Service Workbench solution from AWS.

This release includes:

* Sagemaker Notebook as a compute environment (connect, start, stop, terminate)
* Data set attachment to Sagemaker Notebooks
* Research user creation
* Workspaces include search/filter/sort functions
* Customers able to add custom environments
* Improved performance on workspace page with pagination

# Code Coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-95.42%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-84.5%25-yellow.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-88.63%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-95.37%25-brightgreen.svg?style=flat) |



# Setup Instructions for SWBv2p1

Follow the instructions below to deploy SWBv2 with Sagemaker Notebook lifecycle support. You'll be able to 
launch/start/stop/terminate/connect to a Sagemaker Notebook instance.

## Prerequisite
* An AWS account for deploying SWBv2 API. This account will be called the `Main Account`.
   * On the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `Main Account` as the `default` profile 
* An AWS account for hosting environments. This account will be called the `Hosting Account`.
* Software
  * [Rush](https://rushjs.io/pages/developer/new_developer/) v5.62.1 or later. We'll be using this tool to manage the packages in our mono-repo
  * Node 14.x or 16.x [(compatible node versions)](https://github.com/aws-solutions/solution-spark-on-aws/blob/main/rush.json#L9)
  * [POSTMAN](https://www.postman.com/) (Optional) This is used for making API requests to the server. POSTMAN is not needed if you already have a preferred API client. 
* The requirements below are for running the lambda locally 
   * Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
   * Install Docker ([link](https://docs.docker.com/get-docker/))

## Installation
### Setup Config File
1. Navigate to `solutions/swb-reference`.
1. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder. The stage value uniquely identifies this deployment. Some common values that can be used are `dev`, `beta`, and `gamma`.
1. Open your new `<STAGE>.yaml` file and uncomment the `stage` attribute. Provide the correct `<STAGE>` value for the attribute
1. Open your new `<STAGE>.yaml` file and uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing. The `awsRegion` value will determine which region SWBv2 is deployed in.
1. Uncomment `rootUserEmailParamStorePath` and provide a name for a SSM parameter that will contain the main account user's email address, e.g. `/swb/<stage>/rootUser/email`.
1. Follow instructions to [create a SSM Parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) in your main account and set the name as the assigned value in `rootUserEmailParamStorePath` and the value as the main account user's email address.
1. (Optional) Uncomment `allowedOrigins` and provide a list of URLs that will be allowed to access your SWB API, e.g. ['http://localhost:3000','http://localhost:3002'].
1. Uncomment `cognitoDomain` and provide a unique string that will be used for the cognito domain. This should be an alphanumeric string (hyphens allowed) that does not conflict with any other existing cognito domains.
1. If running your Lambda locally, `userPoolId`, `clientId`, and `clientSecret` will need to be set after the first execution of `cdk-deploy` as seen below under "Deploy the code". You will then need to re-run `STAGE=<STAGE> rushx cdk-deploy`.
1. If your SWB instance is going to use a custom network, uncomment `vpcId`, `albSubnetIds` and `ecsSubnetIds` and provide their respective values from your network.
1. Uncomment `albInternetFacing` and set it's value true if you want an internet-facing AWB instance, otherwize set to false.
1. Uncomment `hostedZoneId` and `domainName` and provide their respective values from your Hosted Zone.
1. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

Note: For Solutions Implementations deployment, the `awsRegionShortName` value will be pre-assigned to `test`.

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
Found configuration in /Users/<user>/workplace/solution-spark-on-aws/rush.json

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
```

Run the post deployment step
```
STAGE=<STAGE> rushx run-postDeployment      # Setup Service Catalog portfolio and products
```
After post deployment is complete a temporary password will be sent to the main account user's email, take note of the temporary password as its going to be needed for API authenticated requests.

## Deploy to the Hosting Account
After the deployment succeeds, we will need to set up the `Hosting account`
1. Log into your AWS `Hosting Account` and go to Cloudformation
1. Choose to create a new stack. On the prompt `Create Stack`, choose `Upload a template file`. Upload [onboard-account.cfn.yaml](./src/templates/onboard-account.cfn.yaml)
1. For the stack name, use the following value: `swb-<stage>-<awsRegionShortName>-hosting-account`, for example `swb-dev-va-hosting-account`
1. For the parameters provide the following values
```yaml
Namespace: swb-<stage>-<awsRegionShortName>      # These values should be the same as in your config file
MainAccountId: <12 digit Account ID of Main Account>
ExternalId: workbench
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
### Configuring App Registry applications limits

Service Workbench v2.0 on AWS uses [AWS App Registry](https://docs.aws.amazon.com/servicecatalog/latest/arguide/intro-app-registry.html) applications to group and add metadata and attributes to created resources.
By using App Registry, Service Workbench is able to organize its resources and track their dependencies more efficiently.
Every resource created in Service Workbench is associated to an App Registry application including all workspaces.
App Registry currently has a default limit of 1000 resources per application.

If you are estimating to have more than 999 Workspaces created in your Service Workbench instance a service quota increase will be needed.
Follow these steps to request a quota increase for App Registry application resources:

1. Sign in to your **Hosting Account** in the [AWS Management Console](https://console.aws.amazon.com/console/home?nc2=h_ct&src=header-signin).

1. Open the [**Service Quotas console**](https://console.aws.amazon.com/servicequotas/home).

1. In the search, enter `AWS Service Catalog` and choose **Service Catalog** from the results.

1. Under **Services Quota**, choose **Resources per application**.

1. On the **Resources per application** page, choose **Request Quota Increase** under **Recent quota increase requests**.

1. In **Change quota**, enter your estimated number of workspaces plus 1 (infrastructure resource).

1. Choose **Request**.



## Get access token

To get the `accessToken`, `csrfCookie`, and `csrfToken` for making authenticated API requests please refer [here](README.md#obtain-access-token-for-making-authenticated-api-requests).  

## POSTMAN Setup
In POSTMAN create an environment using the instructions [here](https://learning.postman.com/docs/sending-requests/managing-environments/#creating-environments).
Your environment should have four variables. Name the first one `API_URL` and the value should be the `APIGatewayAPIEndpoint` value that you got when deploying the `Main Account`. Name the second, third and fourth ones `ACCESS_TOKEN`, `CSRF_COOKIE`, and `CSRF_TOKEN` and their values should be the `accessToken`, `csrfCookie`, and `csrfToken` you got from [Setup UI and Get Access Token](#setup-ui-and-get-access-token)

Import [SWBv2 Postman Collection](./SWBv2.postman_collection.json). Instructions for how to import a collection is [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman)


## Setup Account Resources
### Onboard hosting account
In **SWBv2 Official** Postman Collection under **hosting account** folder choose **Create Hosting Account** API to onboard a hosting account. 
Remember to fill in the correct values for your account.
Custom values that needed to be provided by you will be `<INSIDE THIS>`

In the body tab set `envMgmtRoleArn` parameter to the `CFN_OUTPUT.EnvMgmtRoleArn` value from [Deploy to the Hosting Account step](#deploy-to-the-hosting-account).

In the body tab set `hostingAccountHandlerRoleArn` parameter to the `CFN_OUTPUT.HostingAccountHandlerRoleArn` value from [Deploy to the Hosting Account step](#deploy-to-the-hosting-account).


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
    "id": "acc-3123a751-2f5c-4b8e-bda7-e70e878257ty",
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

To monitor the account status, in **SWBv2 Official** Postman Collection under **hosting account** folder choose **Get Hosting Account** API.

In the params tab set accountId parameter to the `ACCOUNT_ID` value from previous step and send request.

A response with the status property will be displayed 
```json
{
    "id": "acc-3123a751-2f5c-4b8e-bda7-e70e878257ty",
    "name": "<Unique account name>",
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "status": "PENDING"
}
```

You can also find cloudwatch logs for the account handler in the `Main account`. It's at `aws/lambda/swb-<stage>-<awsRegionShortName>-accountHandlerLambda`

### Setup Cost Center
In **SWBv2 Official** Postman Collection under **costCenters** folder choose **Create Cost Center** API. 

In the body tab set `accountId` parameter to the `ACCOUNT_ID` value from [Onboard hosting account step](#onboard-hosting-account).

Send a **Create Hosting Account** request 

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
In **SWBv2 Official** Postman Collection under **projects** folder choose **Create project** API. 

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
In **SWBv2 Official** Postman Collection under **envType** folder choose **List envTypes** API and send request.
If there aren't any environment types displaying in the response, check whether the post deployment step ran correctly.

Once the account handler finishes, running the **List envTypes** request in postman should return a json with the following format
```json
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
```
In the response take note of the `id` that was returned. We'll need it for the next step. We'll call this `id` value as `ENV_TYPE_ID`.

### Approve Environment Type
In **SWBv2 Official** Postman Collection under **envType** folder choose **Update envType** API to change the `status` of environemnt type.

In the params tab set `id` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

Send an **Update envType** request

PATCH `{{API_URL}}/environmentTypes/:id`
```json
{
    "status": "APPROVED"
}
```

### Create Environment Type Config
In **SWBv2 Official** Postman Collection under **envTypeConfig** folder choose **Create envTypeConfig** API.

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
In **SWBv2 Official** Postman Collection under **project** folder choose **Associate project with EnvTypeConfig** API.

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the body tab set `envTypeId` parameter to the `ENV_TYPE_ID` value from [Retrieve Environment Type Id step](#retrieve-environment-type-id).

In the body tab set `envTypeConfigId` parameter to the `ENV_TYPE_CONFIG_ID` value from [Create Environment Type Config step](#create-environment-type-config).

Send **Associate project with EnvTypeConfig** request.

PUT `{{API_URL}}/projects/:projectId/environmentTypes/:envTypeId/configurations/:envTypeConfigId/relationships`


## Create new DataSet
In **SWBv2 Official** Postman Collection under **datasets** folder choose **Create DataSet** API.

During SWB deployment an S3 bucket for DataSets was created in your main account. Grab the name of that bucket from the CFN stack output (key named `DataSetsBucketName`) in the main account and construct the following API call

POST `{{API_URL}}/datasets`

```json
{
    "datasetName": "<Enter a unique DataSet name>",
    "storageName": "<Enter the main account DataSets bucket name>",
    "path": "<Folder name to be created for this in the bucket>",
    "awsAccountId": "<Main account ID>"
}
```
At this point you'll receive a JSON response. That response will have an `id` value. You could use that `id` value in the `datasetIds` array while launching an environment.
Once registered a DataSet using this API, you could also upload files to its bucket folder directly so they're available at environment boot time.

## Launch Sagemaker Notebook Instance
In **SWBv2 Official** Postman Collection under **environments** folder choose **Launch Environment** API.

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
    "projectId": "<PROJECT_ID>",
    "datasetIds": [],
    "envType": "sagemakerNotebook"
}
```
In the response take note of the `id` and `projectId` that were returned. We'll refer to the `id` value as `ENV_ID` and the `projectId` value as `ENV_PROJECT_ID`.

## Check Environment Status
In **SWBv2 Official** Postman Collection under **environments** folder choose **Get Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Get Environment** request.

GET `{{API_URL}}/projects/:projectId/environments/:id`

In the response you'll see the status of the environment.
`PENDING` means the environment is being provisioned. `COMPLETED` means the environment is ready to be used.

## Connect to Environment
In **SWBv2 Official** Postman Collection under **environments** folder choose **Get Connection** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: Only Researchers and Project Admins can access this API, the user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Get Connection** request.

GET `{{API_URL}}/projects/:projectId/environments/:id/connections`

In the response you'll find a `url`. Copy and paste that `url` into the browser to view your Sagemaker Notebook instance.

## Stop an Environment
In **SWBv2 Official** Postman Collection under **environments** folder choose **Stop Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Stop Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/stop`

## Start an Environment
In **SWBv2 Official** Postman Collection under **environments** folder choose **Start Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Start Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/start`

## Terminate the Environment
In **SWBv2 Official** Postman Collection under **environments** folder choose **Terminate Environment** API.

In the params tab set `id` parameter to the `ENV_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

In the params tab set `projectId` parameter to the `ENV_PROJECT_ID` value from [Launch Sagemaker Notebook Instance step](#launch-sagemaker-notebook-instance).

Note: The user calling this API needs to have access permissions to the project assigned in the request, for more information see [Assig Project to User](#assign-project-to-user).

Send **Terminate Environment** request.

PUT `{{API_URL}}/projects/:projectId/environments/:id/terminate`

# User Management
In order to create new Admins:
1. You must go to the Cognito console in your AWS Console.
1. Under **User pools**, look for and click on `swb-userpool-<stage>-<abbreviation>`.
1. Under the **Users tab**, choose **Create user**.
1. Once the user is created, click on the username and under **Group memberships**, choose **Add user to group** to add the user to the Admin group.

## Create Users
In **SWBv2 Official** Postman Collection under **users** folder choose **Create User** API.

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
Note: By default `ITAdmin` users have access permissions to all projects, only `Researchers` and `ProjectAdmin` require project association.

In **SWBv2 Official** Postman Collection under **projects** folder choose **Add User To Project** API.

In the params tab set `userId` parameter to the `USER_ID` value from [Create User step](#create-user).

In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](#setup-project).

In the body tab set `role` parameter to the role the user is going to be assigned for the provided project(`ProjectAdmin`/`Researcher`).

Send **Add User To Project** request.

POST `{{API_URL}}/projects/:projectId/users/:userId/relationships`

```json
{
    "roles": ["Researcher"]
}
```

## Integration Tests

`swb-reference` package contains integration tests that run API tests against SWB APIs, they can be configured to run automatically as part of a GitHub workflow or CI/CD pipeline.

Note: Integration tests will create resources in the environment they are executed against.


### Prerequisite

Follow instructions [here](./SETUP_v2p1.md##installation) to setup installation of API and Postman collection.

#### Resources to create through SWB UI:

**Test Administrator:** Create an internal admin-role user for running integration tests. (**Note the rootUsername and rootPassword**)



#### Resources for Advanced Tests

- **Environment Type:** Follow instructions [here](../swb-reference/SETUP_v2p1.md###setup-project-configurations,-environmentType,-and-environmenttypeconfig) to create an environmentType.

- **Environment Configuration:** Follow instructions [here](../swb-reference/SETUP_v2p1.md###setup-project-configurations,-environmentType,-and-environmenttypeconfig) to create a configuration for every corresponding environment type that was created.



To run integration tests

1. In `./integration-tests/config` make a copy of `example.yaml` and name it `<STAGE>.yaml`. Uncomment the attributes and provide the appropriate config value.


2. For `envTypeId` and `envType` open Postman Collection and select `List envTypes` inside `envType` folder (If Postman collection is not setup follow instructions [here](./SETUP_v2p1.md##postman-setup))

    1. Execute `List envTypes` request, you should get a json response with the next information
        ```
            {
            "data": [
                {
                    "status": "APPROVED",
                    "createdAt": "2022-08-11T15:27:53.895Z",
                    "updatedBy": "########-####-####-####-############",
                    "createdBy": "########-####-####-####-############",
                    "name": "Sagemaker Jupyter Notebook",
                    "allowedRoleIds": [],
                    "resourceType": "envType",
                    "provisioningArtifactId": "<artifact id>",
                    "params": [
                        {
                            "DefaultValue": "ml.t3.xlarge",
                            "IsNoEcho": false,
                            "ParameterConstraints": {
                                "AllowedValues": []
                            },
                            "ParameterType": "String",
                            "Description": "EC2 instance type to launch",
                            "ParameterKey": "InstanceType"
                        },
                        {
                            "IsNoEcho": false,
                            "ParameterConstraints": {
                                "AllowedValues": []
                            },
                            "ParameterType": "Number",
                            "Description": "Number of idle minutes for auto stop to shutdown the instance (0 to disable auto-stop)",
                            "ParameterKey": "AutoStopIdleTimeInMinutes"
                        },
                        {
                            "IsNoEcho": false,
                            "ParameterConstraints": {
                                "AllowedValues": []
                            },
                            "ParameterType": "String",
                            "Description": "The IAM policy to be associated with the launched workstation",
                            "ParameterKey": "IamPolicyDocument"
                        },
                        {
                            "DefaultValue": "1.1.1.1/1",
                            "IsNoEcho": false,
                            "ParameterConstraints": {
                                "AllowedValues": []
                            },
                            "ParameterType": "String",
                            "Description": "CIDR to restrict IPs that can access the environment",
                            "ParameterKey": "CIDR"
                        }
                    ],
                    "updatedAt": "2022-08-11T15:27:53.895Z",
                    "sk": "ET#<id number>",
                    "owner": "########-####-####-####-############",
                    "description": "An Amazon SageMaker Jupyter Notebook",
                    "id": "########-####-####-####-############",
                    "pk": "ET#<id number>",
                    "productId": "<product id>",
                    "type": "sagemakerNotebook"
                }
            ]
        }
        ```
        If there are no environment types displayed please follow instructions [here](../swb-reference/SETUP_v2p1.md###setup-project-configurations,-environmentType,-and-environmenttypeconfig) to create a new environment type

    2. Choose the Environment Type that integration test will use as default when creating any Environment and copy the values from properties `id` and `type` from request.

    3. In `./integration-tests/config` directory assign `id` value to `envTypeId` property and `type` value to `envType` property in `<STAGE>.yaml` file 


3. For `envTypeConfigId` open Postman Collection and select `List envTypeConfigs` inside `envTypeConfig` folder.
    
    1. Replace `:envTypeId` in the URL request `{{API_URL}}/environmentTypes/:envTypeId/configurations` with value of the environment type id from the previous step.

    2. Execute `List envTypeConfigs` request, you should get a json response with the next information
        ```
        {
            "data": [
                {
                    "createdAt": "2022-08-11T15:29:15.935Z",
                    "updatedBy": "########-####-####-####-############",
                    "createdBy": "########-####-####-####-############",
                    "name": "Config 1",
                    "allowedRoleIds": [],
                    "resourceType": "envTypeConfig",
                    "provisioningArtifactId": "<artifact id>",
                    "params": [
                        {
                            "value": "${iamPolicyDocument}",
                            "key": "IamPolicyDocument"
                        },
                        {
                            "value": "ml.t3.medium",
                            "key": "InstanceType"
                        },
                        {
                            "value": "0",
                            "key": "AutoStopIdleTimeInMinutes"
                        },
                        {
                            "value": "0.0.0.0/0",
                            "key": "CIDR"
                        }
                    ],
                    "updatedAt": "2022-08-11T15:29:15.935Z",
                    "sk": "ET#<id number>}",
                    "owner": "########-####-####-####-############",
                    "description": "Description for config 1",
                    "id": "########-####-####-####-############",
                    "pk": "ETC",
                    "productId": "<product id>",
                    "type": "sagemakerNotebook"
                }
            ]
        }
        ```
        If there are no environment type configs displayed please follow instructions [here](../swb-reference/SETUP_v2p1.md###setup-project-configurations,-environmentType,-and-environmenttypeconfig) to create a new environment type config.

    3. Choose the Environment Type Config that integration test will use as default when creating any Environment and copy the `id` value from the request.

    4. In `./integration-tests/config` directory assign value copied to `envTypeConfigId` property in `<STAGE>.yaml` file 


4. For `projectId`, `costCenterId`, and `projectName`, open Postman Collection and select `List projects` inside `projects` folder.

    1. Execute `List projects` request, you should get a json response with the next information
        ```
        {
            "data": [
                {
                "id": "proj-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "name": "Project Name",
                "description": "Project Description",
                "costCenterId": "cc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "status": "AVAILABLE",
                "createdAt": "2022-12-22T16:43:10.617Z",
                "updatedAt": "2023-01-09T22:51:52.026Z",
                "awsAccountId": "XXXXXXXXXXXX",
                "envMgmtRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/swb-<stage>-<region>-env-mgmt",
                "hostingAccountHandlerRoleArn": "arn:aws:iam::XXXXXXXXXXXX:role/    swb-<stage>-<region>-hosting-account-role",
                "vpcId": "vpc-xxxxxxxxxxxxxxxxx",
                "subnetId": "subnet-xxxxxxxxxxxxxxxxx",
                "environmentInstanceFiles": "s3://swb-<stage>-<region>-s3artifactsXXXXXXXXXX/environment-files",
                "encryptionKeyArn": "arn:aws:kms:us-east-2:XXXXXXXXXXXX:key/xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx",
                "externalId": "workbench",
                "accountId": "acc-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
                }
            ]
        }
        ```

    2. Choose the Project that integration test will use as default when creating any Environment and testing project functionality.

    3. In `./integration-tests/config` directory assign the `id` value from the above request to the `projectId` property in `<STAGE>.yaml` file. 

    4. In `./integration-tests/config` directory assign the `name` value from the above request to the `projectName` property in `<STAGE>.yaml` file.

    5. In `./integration-tests/config` directory assign the `costCenterId` value from the above request to the `costCenterId` property in `<STAGE>.yaml` file.

5. For `terminatedEnvId` we need the id of an environment that has been terminated, Postman collection request `List Environments` does not show terminated environments ,so we need to save the id of a stopped environment before we terminate it.

    1. Create an environment by opening Postman Collection and select `Launch Environment` inside `environments` folder
    
    2. Click on the Body section of the request and fill the next values 
        ```
        {
            "description": "test 123",
            "name": "testEnv1",
            "envTypeId": "<environment type id>",
            "envTypeConfigId": "<environment type config id>",
            "projectId": "<project id>",
            "datasetIds": [],
            "envType": "<environemnt type>"
        }
        ```
        We can use the values from previous steps to fill the create request body

    3. Execute `Launch Environment` request and copy the id property from the response
        ```
        {
            "id": "########-####-####-####-############",
            "instanceId": "",
            "cidr": "",
            "description": "description",
            "name": "environment Name",
            "outputs": [],
            ......
        ```

    4. In `./integration-tests/config` directory assign value copied to `terminatedEnvId` property in `<STAGE>.yaml` file. 

    5. Wait for environment to have status `COMPLETED`, in Postman collection select `List Environments` inside `environments` folder and execute request, look for environment created and check if the property `status` has value `COMPLETED`, if it has `PENDING` status wait 5 minutes and execute `List Environments` request again.

    6. Once environment is completed select `Stop Environment` inside `environments` folder and replace the `:id` on the request URL `{{API_URL}}/environments/:id/stop` with the id of the environment created in previous step.

    7. Execute `Stop Environment` and wait until environment has status `STOPPED`, use `List Environments` request to monitor status.

    8. Once environemnt is stopped select `Terminate Environment` inside `environments` folder and replace the `:id` on the request URL `{{API_URL}}/environments/:id` with the id of the environment created in previous step.

    9. Execute `Terminate Environment` and wait until environment is terminated, once the environment is terminated it will not be displayed in `List Environments` request anymore.
   

5. For `rootUsername`, type the email of the root user that is going to login into the application to run the integration tests, this is configured in `<STAGE>.yaml` file in `./src/config` directory for the installation step

6. For `rootPasswordParamsStorePath`, go to the AWS console for your Main account, and [create a parameter](https://docs.aws.amazon.com/systems-manager/latest/userguide/parameter-create-console.html) to store the root user password. 
The name of the parameter should be  `/swb/<STAGE>/rootUser/password`
Temporary root password is created and sent to root user after running the [post deployment step](./SETUP_v2p1.md###deploy-the-code) of installation and is updated the first time the root user login.

7. In this root directory run `STAGE=<STAGE> rushx integration-tests`

To use the framework for calling the SWBv2 API, create a `ClientSession` and then use the `resources` attribute to call the `CRUD` commands

Example code for creating new environment

```ts
const setup: Setup = new Setup();
const adminSession = await setup.createAdminSession();
const { data: response } = await adminSession.resources.environments.create();
```

Example code for GET one environment

```ts
const setup: Setup = new Setup();
const adminSession = await setup.createAdminSession();
const envId='abc';
const { data: response } = await adminSession.resources.environments.environment(envId).get();
```

Example code for GETTING all environment with status "COMPLETED"

```ts
const setup: Setup = new Setup();
const adminSession = await setup.createAdminSession();
const { data: response } = await adminSession.resources.environments.get({status: 'COMPLETED'});
```

## Update static auth permissions

Go to `solutions/swb-app` to update `staticRouteConfig.ts` and `staticPermissionsConfig.ts` with any necessary changes to routes/permissions.

## Reset User Password
1. Go to the [Amazon Cognito console](https://console.aws.amazon.com/cognito/home) in your main account. If prompted, enter your AWS credentials.
1. Choose **User Pools**.
1. Choose your SWB user pool with name `swb-userpool-<STAGE>-<Region>`.
1. Choose the **App integration** tab.
1. Under **App client list** choose SWB app client with name `swb-client-<STAGE>-<Region>`.
1. Under **Hosted UI** choose **View Hosted UI**.
1. If the user has a temporary password, login with your user crendentials and follow isntructions to set a new password.
1. If the user already has a non temporary password follow instructions [here](https://docs.aws.amazon.com/cognito/latest/developerguide/cognito-user-pools-hosted-ui-user-forgot-password.html) to reset password.

## Obtain Access Token for making authenticated API requests
1. If you are tying to get a token from a user that still has its temporary password assigned please follow instructions [here](README.md#Reset-User-Password) to reset user password.
1. Go to `swb-reference/scripts` folder
1. Pull down all required dependencies by running `rushx build`
1. Run `STAGE=<STAGE> node generateCognitoTokens.js <userName> '<password>'` with the correct value for `<userName>` and `<password>`. It should be a user that has been created for your SWB deployment. Note, the quotes around `<password>` is necessary for the script to correctly parse passwords that have symbols in it. 
1. In the console output, use the `accessToken`, `csrfCookie`, and `csrfToken` that are provided to make authenticated API requests.


## Running Code Locally
### Requirements
1. Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
1. Install Docker ([link](https://docs.docker.com/get-docker/))

If you have made changes to the `environment` package or the `swb-reference` package follow these steps

1. In `solution-spark-on-aws` root directory run `rush build`
1. In `solution-spark-on-aws/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> ./scripts/runLocally.sh`. This will run a local lambda server.


## Troubleshooting Guides

[Workspace Lifecycle Troubleshooting Guide](docs/WorkspaceLifecycleTroubleshootingGuide.md).

## Appendix
### Cloudwatch Logs
* `swb-<stage>-<awsRegionShortName>-apiLambda`: Logs for api lambda. This lambda gets executed when user makes a request to SWB APIs. 
* `swb-<stage>-<awsRegionShortName>-accountHandlerLambda`: Logs for account handler lambda. This lamba runs every 5 minutes and is responsible for keeping the hosting account resources in sync with the main account. 
* `swb-<stage>-<awsRegionShortName>-statusHandlerLambda`: Logs for status handler lambda. This lambda is triggered by EventBridge events that originated in hosting accounts. It updates DDB with environment statuses from the hosting accounts. 
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