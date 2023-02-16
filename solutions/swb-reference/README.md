# swb-reference

⚠️ $\textcolor{red}{\text{Experimental}}$ ⚠️ : Not for use in any critical, production, or otherwise important deployments

The 0.1.0 beta release is available for customers to test the newly re-architected Service Workbench solution from AWS.

This release includes:

* New user experience for workspace based on the AWS UI Design System
* Sagemaker Notebook as a compute environment (connect, start, stop, terminate)
* Data set attachment to Sagemaker Notebooks
* Research user creation
* Workspaces include search/filter/sort functions
* Customers able to add custom environments
* Improved performance on workspace page with pagination

To test the new Service Workbench on AWS v2 r0.1.0, follow the deployment instructions:

* Setup Instructions for [SWBv2p1](./SETUP_v2p1.md)
* Adding a [new environment type](./AddingNewEnvironmentType.md)

*Note:* API based updates to the database are required for some functionalities.

# Code Coverage

| Statements                  | Branches                | Functions                 | Lines             |
| --------------------------- | ----------------------- | ------------------------- | ----------------- |
| ![Statements](https://img.shields.io/badge/statements-95.27%25-brightgreen.svg?style=flat) | ![Branches](https://img.shields.io/badge/branches-81.57%25-yellow.svg?style=flat) | ![Functions](https://img.shields.io/badge/functions-85.71%25-yellow.svg?style=flat) | ![Lines](https://img.shields.io/badge/lines-95.22%25-brightgreen.svg?style=flat) |

## Requirements

The requirements below are for running the lambda locally

1. Install SAM CLI ([link](https://docs.aws.amazon.com/serverless-application-model/latest/developerguide/serverless-sam-cli-install.html))
2. Install Docker ([link](https://docs.docker.com/get-docker/))

## Set Up

1. In root directory at `solution-spark-on-aws` run `rush install`
2. Copy `src/config/example.yaml` and create a new file in the format `<STAGE>.yaml` in the config folder
3. Uncomment the `stage` attribute and provide the correct `<STAGE>` value for the attribute
4. Uncomment `awsRegion` and `awsRegionShortName`. `aws-region` value can be one of the values on this [table](https://docs.aws.amazon.com/AmazonRDS/latest/UserGuide/Concepts.RegionsAndAvailabilityZones.html#Concepts.RegionsAndAvailabilityZones.Regions), under the `Region` column. `awsRegionName` can be a two or three letter abbreviation for that region, of your own choosing.
5. Uncomment `rootUserEmail` and provide the main account user's email address
6. Run `chmod 777 <STAGE>.yaml` to allow local script to read the file

## Running Code Locally

If you have made changes to the `environment` package or the `swb-reference` package follow these steps

1. In `solution-spark-on-aws` root directory run `rush build`
2. In `solution-spark-on-aws/solutions/swb-reference` root directory run `STAGE=<STAGE TO RUN LOCALLY> ./scripts/runLocally.sh`. This will run a local lambda server.

## Deploying Code

Run one time to Bootstrap the CDK

`STAGE=<STAGE> rushx cdk bootstrap`

Deploy/Update code

`STAGE=<STAGE TO DEPLOY> rushx cdk-deploy`

## Run Post Deployment

This step is necessary to setup Service Catalog portfolio and products

`STAGE=<STAGE> rushx run-postDeployment`

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

    1. Excecute `List envTypes` request, you should get a json response with the next information
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

    2. Excecute `List envTypeConfigs` request, you should get a json response with the next information
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

    1. Excecute `List projects` request, you should get a json response with the next information
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

    5. Wait for environment to have status `COMPLETED`, in Postman collection select `List Environments` inside `environments` folder and excecute request, look for environment created and check if the property `status` has value `COMPLETED`, if it has `PENDING` status wait 5 minutes and excecute `List Environments` request again.

    6. Once environment is completed select `Stop Environment` inside `environments` folder and replace the `:id` on the request URL `{{API_URL}}/environments/:id/stop` with the id of the environment created in previous step.

    7. Excecute `Stop Environment` and wait until environment has status `STOPPED`, use `List Environments` request to monitor status.

    8. Once environemnt is stopped select `Terminate Environment` inside `environments` folder and replace the `:id` on the request URL `{{API_URL}}/environments/:id` with the id of the environment created in previous step.

    9. Excecute `Terminate Environment` and wait until environment is terminated, once the environment is terminated it will not be displayed in `List Environments` request anymore.
   

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

## Obtain Access Token for making authenticated API requests
1. Go to `swb-reference/scripts` folder
2. Pull down all required dependencies by running `rushx build`
3. Run `STAGE=<STAGE> node generateCognitoTokens.js <userName> '<password>'` with the correct value for `<userName>` and `<password>`. It should be a user that has been created for your SWB deployment. Note, the quotes around `<password>` is necessary for the script to correctly parse passwords that have symbols in it. 
4. In the console output, use the `accessToken`, `csrfCookie`, and `csrfToken` that are provided to make authenticated API requests.

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
