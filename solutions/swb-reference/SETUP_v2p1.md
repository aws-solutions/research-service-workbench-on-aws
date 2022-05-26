# Setup Instructions for SWBv2p1

Follow the instructions below to deploy SWBv2 with Sagemaker lifecycle support. You'll be able to 
launch/start/stop/terminate/connect to a Sagemaker instance.

The following instructions are for setting up SWBv2 Part 1. In this version of the code, we have not finished 
building all of the configuration APIs required for setting up SWBv2. Therefore, some of the steps will require manual edits to DDB. 
These manual steps will not be required in the final implementation of SWBv2.

## Prerequisite
* An AWS account for deploying SWBv2 API. This account will be called the `Main Account`.
   * On the command line, set your [credential file](https://docs.aws.amazon.com/cli/latest/userguide/cli-configure-profiles.html) to have your `Main Account` as the `default` profile 
* An AWS account for hosting environments. This account will be called the `Hosting Account`.
* Software
  * [Rush](https://rushjs.io/pages/developer/new_developer/) v5.62.1 or later. We'll be using this tool to manage the packages in our mono-repo
  * Node 14.x or 16.x
* The requirements below are for running the lambda locally 
   * Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
   * Install Docker ([link](https://docs.docker.com/get-docker/))
  

## Installation
### Set up Config File
1. Navigate to `solutions/swb-reference`.
1. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder. The stage value uniquely identifies this deployment. Some common values that can be used are `dev`, `beta`, and `gamma`.
1. Open your new `<STAGE>.yaml` file and uncomment the `stage` attribute. Provide the correct `<STAGE>` value for the attribute
1. Open your new `<STAGE>.yaml` file and uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing. The `awsRegion` value will determine which region SWBv2 is deployed in.
1. Uncomment `rootUserEmail` and provide the main account user's email address
1. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

### Set up CDK
We'll be using AWS CDK to deploy our code to AWS. Follow the steps below to onboard CDK onto your AWS `Main Account`.

In `swb-reference` root directory run the follow code
```
rush install
rushx build
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
EventBusOutput
```

Run the post deployment step
```
STAGE=<STAGE> rushx run-postDeployment      # Setup Service Catalog portfolio and products
```

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
AccountHandlerRoleArn: <CFN_OUTPUT.accountHandlerLambdaRoleOutput> 
ApiHandlerRoleArn: <CFN_OUTPUT.apiLambdaRoleOutput> 
EnableFlowLogs: true
LaunchConstraintPolicyPrefix: *
LaunchConstraintRolePrefix: *
StatusHandlerRoleArn: <CFN_OUTPUT.StatusHandlerLambdaRoleOutput>
```

After the deployment is complete, take note of the following Cloudformation outputs. The outputs are on the `Outputs` tab. We will be using in future steps
```
CrossAccountHandlerRoleArn
EncryptionKeyArn
EnvMgmtRoleArn
HostEventBusArn
VPC
VpcSubnet
```

### Store account and environment config information in DDB
Since we have not built the API for account and environment config setup in DDB yet, you'll need to manually add these values to DDB. You can
do so, by logging into the DDB page on the AWS console for your `Main account`. There should be a table there with the following
name `swb-<stage>-<awsRegionShortName>`

**Store `PROJ` resource in DDB** 

Remember to fill in the correct values for your account. 
Custom values that needed to be provided by you will be `<INSIDE THIS>`

```json
{
    "pk": "PROJ#proj-123",
    "sk": "PROJ#proj-123",
    "id": "proj-123",
    "accountId": "acc-123",
    "indexId": "index-123",
    "desc": "Example project",
    "owner": "abc",
    "projectAdmins": [],
    "resourceType": "project",
    "name": "Example project",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "accountHandlerRoleArn": "<CFN_OUTPUT.CrossAccountHandlerRoleArn>",
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

**Store `ETC` resource in DDB**

Log into AWS `Main Account`, and navigate to `Service Catalog`. Find the portfolio `swb-<stage>-<awsRegionShortName>`, and make note of
the following values
* productId: `Product ID` of `sagemaker` product
* provisioningArtifactId: This value can be found by clicking on the `sagemaker` product. There should be one version of the 
`sagemaker` product. Copy that version's id. It should be in the format `pa-<random letter and numbers>`

```json
{
    "pk": "ETC",
    "sk": "ET#envType-123ETC#envTypeConfig-123",
    "id": "envTypeConfig-123",
    "productId": "<productId>",
    "provisioningArtifactId": "<provisioningArtifactId>",
    "allowRoleIds": [],
    "type": "sagemaker",
    "desc": "Description for config 1",
    "name": "Config 1",
    "owner": "abc",
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
    ],
    "createdAt": "2022-02-03T20:07:50.573Z",
    "createdBy": "abc",
    "updatedAt": "2022-02-03T20:07:50.573Z",
    "updatedBy": "abc",
    "resourceType": "envTypeConfig"
}
```

If you would like to launch a sagemaker instance with a different instance type than `ml.t3.medium`, you can replace that value
in the JSON above.

### Setup Account Resources
Use POSTMAN to hit this API. Remember to replace `API_URL` with the `APIGatewayAPIEndpoint` when you deployed SWBv2 to your main account.

POST `{{API_URL}}/aws-accounts`
```json
{
    "awsAccountId": "<Hosting Account 12 Digit ID>",
    "envMgmtRoleArn": "<CFN_OUTPUT.EnvMgmtRoleArn>",
    "accountHandlerRoleArn": "<CFN_OUTPUT.CrossAccountHandlerRoleArn>",
    "externalId": "workbench",
    "encryptionKeyArn": "<CFN_OUTPUT.EncryptionKeyArn>",
    "environmentInstanceFiles": "s3://<CFN_OUTPUT.S3BucketArtifactsArnOutput(Get just the bucketname of the arn)>/environment-files"
}
```
Wait for account handler to run. It runs once every 5 minutes. You'll know that it's completed when the account status 
is listed as `CURRENT` in DDB. You can find cloudwatch logs for the account handler in the `Main account`. It's at `aws/lambda/swb-<stage>-<awsRegionShortName>-accountHandlerLambda`

# Test the API

**Launch Sagemaker Instance**

POST `{{API_URL}}/environments`

```json
{
    "description": "test 123",
    "name": "testEnv1",
    "envTypeId": "envType-123",
    "envTypeConfigId": "envTypeConfig-123",
    "projectId": "proj-123",
    "datasetIds": [],
    "envType": "sagemaker"
}
```

At this point you'll receive a JSON response. That response will have an `id` value. Use that `id` value to check the
status of the environment.

**Check Environment Status**

GET `{{API_URL}}/environments/:id`

Replace `:id` with the `id` value from launching the environment. In the response you'll see the status of the environment.
`PENDING` means the environment is being provisioned. `COMPLETED` means the environment is ready to be used.

**Connect to Environment**

GET `{{API_URL}}/environments/:id/connections`
Replace `:id` with the `id` value from launching the environment. In the response you'll find a `url`. Copy and paste that `url`
into the browser to view your Sagemaker instance.

**Stop an Environment**
PUT `{{API_URL}}/environments/:id/stop`
Replace `:id` with the `id` value from launching the environment.

**Start an Environment**
PUT `{{API_URL}}/environments/:id/start`
Replace `:id` with the `id` value from launching the environment.


**Terminate the Environment**

DELETE `{{API_URL}}/environments/:id`

Replace `:id` with the `id` value from launching the environment. You should receive a response with an HTTP status code of `200` for success.
