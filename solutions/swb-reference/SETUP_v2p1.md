# Setup Instructions for SWBv2p1

Follow the instructions below to deploy SWBv2 with Sagemaker Notebook lifecycle support. You'll be able to 
launch/start/stop/terminate/connect to a Sagemaker Notebook instance.

The following instructions are for setting up SWBv2 Part 1. In this version of the code, we have not finished 
building all of the configuration APIs required for setting up SWBv2. Therefore, some of the steps will require manual edits to DDB. 
These manual steps will not be required in the final implementation of SWBv2.

## Prerequisite
* An AWS account for deploying SWBv2 API. This account will be called the `Main Account`.
   * On the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `Main Account` as the `default` profile 
* An AWS account for hosting environments. This account will be called the `Hosting Account`.
* Software
  * [Rush](https://rushjs.io/pages/developer/new_developer/) v5.62.1 or later. We'll be using this tool to manage the packages in our mono-repo
  * Node 14.x or 16.x [(compatible node versions)](https://github.com/awslabs/monorepo-for-service-workbench/blob/main/rush.json#L9)
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
1. Uncomment `rootUserEmail` and provide the main account user's email address
1. Uncomment `cognitoDomain` and provide a unique string that will be used for the cognito domain. This should be an alphanumeric string (hyphens allowed) that does not conflict with any other existing cognito domains.
1. Uncomment `websiteUrl` and set it to the website url that will be used for the SWB UI.
1. If running your Lambda locally, `userPoolId`, `clientId`, and `clientSecret` will need to be set after the first execution of `cdk-deploy` as seen below under "Deploy the code". You will then need to re-run `STAGE=<STAGE> rushx cdk-deploy`.
1. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

### Setup CDK
We'll be using AWS CDK to deploy our code to AWS. Follow the steps below to onboard CDK onto your AWS `Main Account`.

In `swb-reference` root directory run the follow code
```
rush install
rush build
rushx compile
STAGE=<STAGE> rushx cdk bootstrap
```

After bootstrap is completed you'll see a message like this
```
Found configuration in /Users/thingut/workplace/ma-mono/rush.json

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

## Setup UI and Get access token

Follow the instructions [here](../swb-ui/README.md#deploy-ui-to-aws) to deploy UI to AWS and navigate to the website URL provided.

From here, click `Login` and setup your admin user (a temporary password should have been sent to the rootUserEmail defined in your `<STAGE>.yaml` file). Once logged in, go to dev tools and grab the `accessToken` in localStorage. This will need to be added to all POSTMAN request headers as `Authorization`. Note: Be very careful not to share the accessToken with anyone else!!

## POSTMAN Setup
In POSTMAN create an environment using the instructions [here](https://learning.postman.com/docs/sending-requests/managing-environments/#creating-environments).
Your environment should have two variables. Name the first one `API_URL` and the value should be the `APIGatewayAPIEndpoint` value that you got when deploying the `Main Account`. Name the second one `ACCESS_TOKEN` and the value should be the `accessToken` you got from [Setup UI and Get Access Token](#setup-ui-and-get-access-token)

Import [SWBv2 Postman Collection](./SWBv2.postman_collection.json). Instructions for how to import a collection is [here](https://learning.postman.com/docs/getting-started/importing-and-exporting-data/#importing-data-into-postman)


### Setup project configurations, environmentType, and environmentTypeConfig

Since we have not built the API for Projects setup in DDB yet, you'll need to manually add these values to DDB. You can
do so, by logging into the DDB page on the AWS console for your `Main account`. There should be a table there with the following
name `swb-<stage>-<awsRegionShortName>`

**Store `PROJ` resource in DDB**

Remember to fill in the correct values for your account.
Custom values that needed to be provided by you will be `<INSIDE THIS>`

```json
{
    "pk": "PROJ#cf3019e3-88d5-4a64-9025-26a177e36f59",
    "sk": "PROJ#cf3019e3-88d5-4a64-9025-26a177e36f59",
    "id": "cf3019e3-88d5-4a64-9025-26a177e36f59",
    "accountId": "acc-123",
    "indexId": "index-123",
    "description": "Example project 1",
    "owner": "abc",
    "projectAdmins": [],
    "resourceType": "project",
    "name": "Project 1",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "hostingAccountHandlerRoleArn": "<CFN_OUTPUT.HostingAccountHandlerRoleArn>",
    "encryptionKeyArn": "<CFN_OUTPUT.EncryptionKeyArn>",
    "subnetId": "<CFN_OUTPUT.VpcSubnet>",
    "vpcId": "<CFN_OUTPUT.VPC>",
    "externalId": "workbench",
    "environmentInstanceFiles": "s3://<CFN_OUTPUT.S3BucketArtifactsArnOutput(Get just the bucketname of the arn)>/environment-files", 
    "awsAccountId": "<12 Digit AWS Account ID of hosting account>",
    "createdAt": "2022-01-28T22:42:20.296Z",
    "createdBy": "abc",
    "updatedAt": "2022-02-02T21:07:30.237Z",
    "updatedBy": "abc"
}
```

**Create Environment Type**

Log into AWS `Main Account`, and navigate to `Service Catalog`. Find the portfolio `swb-<stage>-<awsRegionShortName>`, and make note of the following values
* productId: `Product ID` of `sagemakerNotebook` product
* provisioningArtifactId: This value can be found by clicking on the `sagemakerNotebook` product. There should be one version of the
  `sagemakerNotebook` product. Copy that version's id. It should be in the format `pa-<random letter and numbers>`

In POSTMAN, uses the `envType` => `Create envType` request to make a request with the following `body`
```json
{
    "status": "APPROVED",
    "name": "Sagemaker Jupyter Notebook",
    "productId": "<productId>",
    "provisioningArtifactId": "<provisioningArtifactId>",
    "allowedRoleIds": [],
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
    "description": "An Amazon SageMaker Jupyter Notebook",
    "type": "sagemakerNotebook"
}
```

In the response make note of the `id` that was returned. We'll need it for the next step. We'll call this `id` value as `ENV_TYPE_ID`.

**Create Environment Type Config**

In POSTMAN, uses the `envTypeConfig` => `Create envTypeConfig` request to make a request. For the path variable `envTypeId`, use `ENV_TYPE_ID` from the previous step. Make a request with the following `body`. 
```json
{
    "type": "sagemakerNotebook",
    "description": "Description for config 1",
    "name": "Config 1",
    "allowedRoleIds": [], 
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

If you would like to launch a sagemaker notebook instance with a different instance type than `ml.t3.medium`, you can replace that value in the JSON above.

### Setup Account Resources
#### Onboard hosting account
Start by going over to `solutions/swb-ui` and run `rushx start`. This will allow you to access the SWB UI by going to `http://localhost:3000` in your web browser. From here, click `Login` and setup your admin user (a temporary password should have been sent to the rootUserEmail defined in your `<STAGE>.yaml` file). Once logged in, go to dev tools and grab the accessToken in localStorage. This will need to be added to all POSTMAN request headers as `Authorization`. Note: Be very careful not to share the accessToken with anyone else!!

Use POSTMAN or your favorite API client to hit this API. Remember to replace `API_URL` with the `APIGatewayAPIEndpoint` when you deployed SWBv2 to your main account.

In POSTMAN this is the `Create Hosting Account` API

POST `{{API_URL}}/aws-accounts`
```json
{
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "hostingAccountHandlerRoleArn": "<CFN_OUTPUT.HostingAccountHandlerRoleArn>",
    "externalId": "workbench",
    "encryptionKeyArn": "<CFN_OUTPUT.EncryptionKeyArn>",
    "environmentInstanceFiles": "s3://<CFN_OUTPUT.S3BucketArtifactsArnOutput(Get just the bucketname of the arn)>/environment-files"
}
```
Wait for account handler to run. It runs once every 5 minutes. You'll know that it's completed when the account status 
is listed as `CURRENT` in DDB. You can find cloudwatch logs for the account handler in the `Main account`. It's at `aws/lambda/swb-<stage>-<awsRegionShortName>-accountHandlerLambda`

# Test the API

**Create new DataSet**

In POSTMAN this is the `Create DataSet` API

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

Note: You could also use the above request body for POST `{{API_URL}}/datasets/import` API if the folder already exists in the bucket.

At this point you'll receive a JSON response. That response will have an `id` value. You could use that `id` value in the `datasetIds` array while launching an environment.

Once registered a DataSet using this API, you could also upload files to its bucket folder directly so they're available at environment boot time.

**Launch Sagemaker Notebook Instance**

In POSTMAN this is the `Launch Environment` API

POST `{{API_URL}}/environments`

```json
{
    "description": "test 123",
    "name": "testEnv1",
    "envTypeId": "envType-123",
    "envTypeConfigId": "envTypeConfig-123",
    "projectId": "proj-123",
    "datasetIds": [],
    "envType": "sagemakerNotebook"
}
```

At this point you'll receive a JSON response. That response will have an `id` value. Use that `id` value to check the
status of the environment.

**Check Environment Status**

In POSTMAN this is the `Get Environment` API. Under the `Path Variable` section, update the `id` value.

GET `{{API_URL}}/environments/:id`

Replace `:id` with the `id` value from launching the environment. In the response you'll see the status of the environment.
`PENDING` means the environment is being provisioned. `COMPLETED` means the environment is ready to be used.

**Connect to Environment**

In POSTMAN this is the `Get Connection` API. Under the `Path Variable` section, update the `id` value.

GET `{{API_URL}}/environments/:id/connections`
Replace `:id` with the `id` value from launching the environment. In the response you'll find a `url`. Copy and paste that `url`
into the browser to view your Sagemaker Notebook instance.

**Stop an Environment**

In POSTMAN this is the `Stop Environment` API. Under the `Path Variable` section, update the `id` value.

PUT `{{API_URL}}/environments/:id/stop`
Replace `:id` with the `id` value from launching the environment.

**Start an Environment**

In POSTMAN this is the `Start Environment` API. Under the `Path Variable` section, update the `id` value.

PUT `{{API_URL}}/environments/:id/start`
Replace `:id` with the `id` value from launching the environment.


**Terminate the Environment**

In POSTMAN this is the `Terminate Environment` API. Under the `Path Variable` section, update the `id` value.

DELETE `{{API_URL}}/environments/:id`

Replace `:id` with the `id` value from launching the environment. You should receive a response with an HTTP status code of `200` for success.

# User Management
Going to the SWB UI `http:localhost:3000/users` (or your CloudFront distribution if you deployed swb-ui) allows you to see and create additional Researchers.
In order to create new Admins: 
1. You must go to the Cognito console in your AWS Console.
1. Under "User pools", look for and click on `swb-userpool-<stage>-<abbreviation>`.
1. Under the Users tab, click the "Create user" button to create a new user.
1. Once the user is created, click on the username and under "Group memberships", click on "Add user to group" to add the user to the Admin group.