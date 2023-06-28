# Adding a new environment type
Research Service Workbench (RSW) allows users to upload and provision custom AWS compute environments and manage them via RSW APIs. This document provides instruction for adding new custom environment types.

At a high level, we'll need to do the following steps
* Define environment AWS resources using CFN templates
* Set up environment management workflow
* Set up API routes and provide IAM permissions for managing the environment
* Set up environment status updates

[Code Sample](https://github.com/aws-solutions/research-service-workbench-on-aws/compare/develop...feat/sagemakerExample) for adding `sagemakerExample` environment. This is the code to add `sagemakerExample` for step 1 through 4.

## Step 1: Define environment AWS resources
In this step we'll define the AWS resources that are required for our new environment type. The resources will be defined in a `.cfn.yaml` file. And that file will be used to create a Service Catalog product, which will be added to RSW's Service Catalog portfolio.
1. Add a new folder for your custom environment at this location: `solutions/rsw-reference/src/environment/`. The new folder name should be in camelCase, for example `sagemakerExample`.
2. Add the Service Catalog template for the new environment to this folder, eg: `solutions/rsw-reference/src/environment/<newEnvTypeName>/<newEnvTypeName>.cfn.yaml`. For reference check out [sagemakerNotebook.cfn.yaml](https://github.com/aws-solutions/research-service-workbench-on-aws/blob/feat/environments/solutions/rsw-reference/src/environment/sagemakerNotebook/sagemakerNotebook.cfn.yaml). The `parameters` section of the CF template allow users to customize the environment with their own setting. For example, `InstanceType` is a parameter that can be provided when launching the environment to determine the instance size of the environment.
    ```yaml
    Parameters:
      InstanceType:
        Type: String
        Description: Sagemaker instance type to launch
        Default: ml.t3.xlarge
    ```

## Step 2: Set up environment management workflow
In this step we set up the workflow for managing environment launch and terminate. These workflows are defined by SSM documents. We will also implement **environment services** to handle start/stop/connecting to the new environment. These three actions do not require SSM documents, and will make AWS API calls in the hosting account to start/stop/connect to the environment.
### SSM documents
1. Add SSM documents for the new environment type's launch and terminate operations.
    - You'll have two new SSM files: `solutions/rsw-reference/src/environment/<newEnvTypeName>/<newEnvTypeName>LaunchSSM.yaml` and `solutions/rsw-reference/src/environment/<newEnvTypeName>/<newEnvTypeName>TerminateSSM.yaml`
    - For reference, check out [sagemakerNotebookLaunchSSM.yaml](src/environment/sagemakerNotebook/sagemakerNotebookLaunchSSM.yaml) and [sagemakerNotebookTerminateSSM.yaml](src/environment/sagemakerNotebook/sagemakerTerminateSSM.yaml). The `parameters` section in the SSM document allows you to customize the parameters passed to Service Catalog portfolio. Service Catalog portfolio uses those parameters when provisioning your SC product as defined by the SC template defined in [Step 1](#step-1-define-environment-aws-resources). An example SSM doc for launching a sagemaker notebook environment is show below. The `InstanceType` parameter is being passed to SC. In the `PushMetadataToEventBridge` and `PushFailureStatusToEventBridge` remember to specify the correct value for `EnvType`.
    ```yaml
    description: SSM document to provision a Sagemaker instance
    assumeRole: ''
    schemaVersion: '0.3'
    parameters:
      ...
      InstanceType:
        type: String
        description: 'The size of the notebook instance coming from environment type config'
    mainSteps:
      - name: Launch
        action: 'aws:executeAwsApi'
        inputs:
          Service: servicecatalog
          Api: ProvisionProduct
          ProductId: '{{ ProductId }}'
          ProvisionedProductName: '{{ InstanceName }}'
          PathId: '{{ PathId }}'
          ProvisioningArtifactId: '{{ ProvisioningArtifactId }}'
          ProvisioningParameters:
            ...
            - Key: InstanceType
              Value: '{{ InstanceType }}'
          ...
    - name: PushMetadataToEventBridge
      action: 'aws:executeAwsApi'
      inputs:
         Service: events
         Api: PutEvents
         Entries:
           - Detail: '{ "EnvId": "{{ EnvId }}", "ProvisionedProductId": "{{ Launch.ProvisionedProductId }}", "RecordId": "{{ Launch.RecordId }}", "EnvType": "sagemakerExample", "Operation": "Launch", "Status": "COMPLETED" }'
          DetailType: 'Launch'
          EventBusName: 'default'
          Source: 'automation' # This is being used for updating env in statusHandler lambda
      isEnd: true
    - name: PushFailureStatusToEventBridge
      action: 'aws:executeAwsApi'
      inputs:
         Service: events
         Api: PutEvents
      Entries:
      - Detail: '{ "EnvId": "{{ EnvId }}", "ProvisionedProductId": "{{ Launch.ProvisionedProductId }}", "RecordId": "{{ Launch.RecordId }}", "EnvType": "sagemakerExample", "Operation": "Launch", "Status": "FAILED", "ErrorMessage": "{{ GetProvisionedProductDetail.ErrorMessage }}" }'
        DetailType: 'Launch'
        EventBusName: 'default'
        Source: 'automation' # This is being used for updating env in statusHandler lambda
      isEnd: true
    ```
3. In [workflow.ts](../rsw-reference/src/environment/workflow.ts) add the name of your new environment to the `envTypes` array. The name should exactly match the name you used for the new environment type folder.

### Implement Environment Services
1. Implement lifecycle service:
    1. Create a new file `solutions/rsw-reference/src/environment/<newEnvTypeName>/<newEnvTypeName>EnvironmentLifecycleService.ts` for managing the new environment type's lifecycle methods (launch, terminate, start, stop). For reference, check out [sagemakerNotebookEnvironmentLifecycleService.ts](src/environment/sagemakerNotebook/sagemakerNotebookEnvironmentLifecycleService.ts).
    2. In the launch method of that class, you'll see that we are providing custom `ssmParameters` to `this.helper.launch`. The keys of the `ssmParameters` object should match the `parameters` in the `<newEnvTypeName>LaunchSSM.yaml` file. A code excerpt is shown below where we're focusing on passing the `InstanceType` param to SSM docs. Notice how the key `InstanceType` matches the `parameters` section of the SSM document.
         ```ts
         public async launch(envMetadata: any): Promise<{ [id: string]: string }> {
          const instanceSize = _.find(envMetadata.ETC.params, { key: 'InstanceType' })!.value!;
            .value!;
 
          const ssmParameters = {
              ...
            InstanceType: [instanceSize]
          };
 
          await this.helper.launch({
            ssmParameters,
            operation: 'Launch',
            envType: 'sagemakerNotebook',
            envMetadata
          });
 
          return { ...envMetadata, status: 'PENDING' };
         }
         ```
    3. The start and stop method of the class can call the `start` and `stop` AWS API directly to start/stop the environment.
2. Implement connection service:
    1. Create a new file `solutions/rsw-reference/src/environment/<newEnvTypeName>/<newEnvTypeName>EnvironmentConnectionService.ts`. For reference, check out [sagemakerNotebookEnvironmentConnectionService.ts](src/environment/sagemakerNotebook/sagemakerNotebookEnvironmentConnectionService.ts)
    2. Implement `getAuthCreds()` to allow users to connect to the new environment.  Implementation will differ based on the environment type being added. An example implementation of `getAuthCreds` for Sagemaker Notebook environment is show below.
         ```ts
         public async getAuthCreds(instanceName: string, context?: any): Promise<any> {
          const region = process.env.AWS_REGION!;
          const awsService = new AwsService({ region });
          // Assuming IAM Role in hosting account. This step will be required for all environment types
          const hostingAccountAwsService = await awsService.getAwsServiceForRole({
            roleArn: context.roleArn,
            roleSessionName: `SagemakerConnect-${Date.now()}`,
            externalId: context.externalId,
            region
          });
 
          // To access a Sagemaker environment, we provide the user with a presigned notebook URL that they can use
          // Other environment types will require the `{{API_URL}}/environments/:id/connections` API to provide other access credentials  
          const response = await hostingAccountAwsService.clients.sagemaker.createPresignedNotebookInstanceUrl({
            NotebookInstanceName: instanceName
          });
          return { url: response.AuthorizedUrl };
         }
         ```
    3. Implement `getConnectionInstruction()` to provide users with instructions for connecting to the environment. The return value of `getConnectionInstructions` will be shown in a Modal when the user clicks on the `Connect` button in the UI. You can add a `EnvironmentConnectionLinkPlaceholder` to dynamically insert links into the instruction. An example implementation of `getConnectionInstructions` is shown below.
         ```ts
         public getConnectionInstruction(): Promise<string> {
            // "url" is the key of the response returned by the method `getAuthCreds`
            const link: EnvironmentConnectionLinkPlaceholder = {
                type: 'link',
                hrefKey: 'url',
                text: 'Sagemaker URL'
            };
            return Promise.resolve(`To access Sagemaker Notebook, open #${JSON.stringify(link)}`);
        }
       ```

## Step 3: Set up API routes and provide IAM permissions for managing the environment
In this step we add support for the new environment type to our API routes. We also add the permission for managing the new environment to two IAM roles: `EnvManagementRole` and `LaunchConstraint`
1. Add API route
    * Add the new environment type in the `apiRouteConfig.environments` object in [backendAPI.ts](../rsw-reference/src/backendAPI.ts).
2. API routes and Permissions
    * Add the required AWS client permission for starting/stopping/connecting to the environment to `EnvManagementRole` (and its permission boundary `EnvMgmtPermissionsBoundary`) in [onboard-account.cfn.yaml](../rsw-reference/src/templates/onboard-account.cfn.yaml). For reference, check out the `sagemakerNotebook-access` policy in this role. When users call the start/stop/connect to environment RSW APIs, we will assume the `EnvManagementRole` in the hosting account and execute the appropriate AWS API.
    * Add the required AWS client permission for launch/terminate to the method `_createLaunchConstraintIAMRole` in [RSWStack.ts](./src/RSWStack.ts). For reference, check the `sagemakerNotebookPolicy` object. The `LaunchConstraint` role is used by Service Catalog portfolio to launch a Service Catalog product. A Service Catalog product is equivalent to an environment type.

## Step 4: Add Support for environment Status Update
The Status handler lambda writes new environment status and environment details to DDB. These details are sent to it by the hosting account event bus. We'll need to provide a mapping between the Event Bridge events and the environment DDB item. This mapping can be updated in the [statusHandlerLambda.ts](./src/environment/statusHandlerLambda.ts). (For substep 1, 2, and 4) This mapping only needs to be updated for new compute resources that does not already have the mapping specified. **If two environment types use the same compute environment, the mapping does not need to be updated.** For example EC2 Linux and EC2 Windows will use the same mapping, and no new mapping is needed. The events are generated by the AWS services themselves [(link)](https://docs.aws.amazon.com/eventbridge/latest/userguide/eb-service-event.html), and RSW have configured the `default` Event Bus to route those events to the `Main account`. For the next few steps, please refer to the [Appendix](#Appendix) section for examples of what Sagemaker Event Bridge events look like.
1. When we start/stop an environment instance, the state change event will be generated by the respective AWS compute resources. A status-related attribute's location with respect to the `event.detail` body will need to be recorded in the `statusLocation` variable.
    - For example, sagemaker sends its status value in `event.detail.NotebookInstanceStatus` attribute, so we record `NotebookInstanceStatus` in `statusLocation` for sagemaker.
    - The key `sagemaker` can be obtained from `"source": "aws.sagemaker"` in the Start/Stop event shown in the [Appendix](#Appendix).
    - Code snippet
      ```ts
      const statusLocation: { [id: string]: string } = {
      // This is the source used by SSM automation docs to launch/terminate environments
      automation: 'Status',

      sagemaker: 'NotebookInstanceStatus'
      // Add your new env types here
      };
      ``` 
2. We record a unique instance ID for each environment instance provisioned by RSW. This is to match the start/stop events coming to the lambda to their RSW environment IDs. An instance ID-related attribute's location with respect to the `event.detail` body will need to be recorded in the `instanceIdLocation` variable.
    - The key `sagemaker` can be obtained from `"source": "aws.sagemaker"` in the Start/Stop event shown in the [Appendix](#Appendix).
    - Code snippet
        ```ts
        // Environment types could use different terminologies for their instance names (what we use for "INID#<instanceId>")
        // This is to standardize each of them
        const instanceIdLocation: { [id: string]: string } = {
        sagemaker: 'NotebookInstanceName'

            // Add your new env types here
        };
        ```
3. We also get the Service Catalog record details (name and ARN) for an environment by specifying it in the `envTypeRecordOutputKeys` variable. The value for the `instanceNameRecordKey` will be used as the instance ID for the environment type and should match the `event.detail.<instanceIdLocation>` value for the environment type.
    - For example, if we perform `serviceCatalog.describeRecord()` after launching a sagemaker provisioned product we get its CloudFormation template [sagemakerNotebook.cfn.yaml](src/environment/sagemakerNotebook/sagemakerNotebook.cfn.yaml) outputs as follows:
      ```js
      [
          {
              OutputKey: 'NotebookInstanceName', 
              OutputValue: 'BasicNotebookInstance-foo'
          },
          {
              OutputKey: 'NotebookArn', 
              OutputValue: 'arn:aws:sagemaker:us-east-1:<accountID>:notebook-instance/basicnotebookinstance-123456789'
          },
          ...and so on
      ]
      ```
    - The key `sagemakerNotebook` can be obtained from `EnvType` in the Launch/Terminate event shown in the [Appendix](#Appendix)
    - Code snippet
        ```ts
        // Various environment types indicate instance names and ARNs differently in ServiceCatalog record outputs
        // This is to standardize each of them
        const envTypeRecordOutputKeys: { [id: string]: { [id: string]: string } } = {
            sagemakerNotebook: {
               instanceNameRecordKey: 'NotebookInstanceName',
               instanceArnRecordKey: 'NotebookArn',
               instanceRoleName: 'EnvironmentInstanceRoleArn'   // This value is used to allow an environment access to datasets
            }

           // Add your new env types here
        }
        ```
4. Since we only recognize environment status as one of the strings listed in `workbench-core/environments/src/environmentStatus.ts`, we need to map all statuses to those included in the `alternateStatuses` variable (case-insensitive).
    - For example, sagemaker indicates a terminated instance as `Deleted` but RSW recognized this status as `TERMINATED`. However, we don't need to map sagemaker status `Pending` since `PENDING` (its uppercase converted value) is already recognized by RSW.
    - `BasicNotebookInstance-foo` will be used as the instance ID in RSW, and will need to match the `event.detail.NotebookInstanceName` value when start/stop events trigger the lambda.
    - The key `sagemaker` can be obtained from `"source": "aws.sagemaker"` in the Start/Stop event shown in the [Appendix](#Appendix).
    - Code snippet
   ```ts
   const alternateStatuses: { [id: string]: { [id: string]: string } } = {
   sagemaker: {
   InService: 'COMPLETED',
   Deleting: 'TERMINATING',
   Deleted: 'TERMINATED'
   }
   // Add your new env alternate statuses here
   };
   ```
## Step 5: Deploy updated code

Run the following command in `solutions/rsw-reference` directory to deploy the updated code to AWS
```
STAGE=<STAGE> rushx cdk-deploy              # Deploy code to `Main Account` on AWS
STAGE=<STAGE> rushx run-postDeployment      # Update Service Catalog portfolio
```
Note: Executing `run-postDeployment` command will create an Environment Type whenever there is a new product and provisioning Artifact in Service Catalog, the name of the Environment Type will be <productName>-<provisioningArtifactName> e.g. `sagemakerNotebook-v1`.

## Step 6 (Optional): Update hosting account resources
* If the [onboard-account.cfn.yaml](../rsw-reference/src/templates/onboard-account.cfn.yaml) template was updated, the hosting account CloudFormation stack will need to be updated.

## Step 7 (Optional): Test Launch new Environment
Do the following steps if you would like to launch your new environment type, and assuming your new envType is named `sagemakerExample`

Follow instructions in [Get access token Step](../rsw-reference/README.md#get-access-token) and [POSTMAN Setup Step](../rsw-reference/README.md#postman-setup) to make API requests to RSW using postman.

1. Follow instructions in [Setup EnvironmentTypeConfig Step](../rsw-reference/README.md#setup-environmenttypeconfig) to create an Environment Type Config and take note of the `ENV_TYPE_ID` and `ENV_TYPE_CONFIG_ID` values.

1. Follow these steps to launch an environment using the new environment type created.

    - In **RSW Official** Postman Collection under **environments** folder choose **Launch Environment** API.

    - In the params tab set `projectId` parameter to the `PROJECT_ID` value from [Setup Project step](../rsw-reference/README.md#setup-project).

    - In the body tab set `envTypeId` parameter to the `ENV_TYPE_ID` value from step 1.

    - In the body tab set `envTypeConfigId` parameter to the `ENV_TYPE_CONFIG_ID` value from step 1.

    - Note: Only Researchers and Project Admins can access this API, the user calling this API and the environment type config in the request need to have access permissions to the project      assigned in the request, for more information see [Assig Project to User](../rsw-reference/README.md#assign-project-to-user) , [Associate Project to Environment Type Configuration](../rsw-reference/README.md#associate-project-to-environment-type-configuration).

    - Send **Launch Environment** request.

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

------------------------------------------------------------------------------------------------------------------------------------------------

# Appendix


Launch/Terminate event structure
```
{
    "version": "0",
    "id": "25cc74c7-0d58-b520-f9ce-d98253bd4c90",
    "detail-type": "Terminate",
    "source": "automation",
    "account": "<hostingAccountId>",
    "time": "2022-05-26T19:23:19Z",
    "region": "us-east-1",
    "resources": [],
    "detail": {
        "EnvId": "b590a734-5adc-4a43-a24b-edf3795b812d",
        "ProvisionedProductId": "pp-uac6562y6s6ls",
        "RecordId": "rec-b6yqf6zonc2qg",
        "EnvType": "sagemakerNotebook",
        "Operation": "Terminate",
        "Status": "TERMINATED"
    }
}
```

Start/Stop event structure
```
{
    "version": "0",
    "id": "c52a2573-8588-a7f6-1bfb-42542a01fcb2",
    "detail-type": "SageMaker Notebook Instance State Change",
    "source": "aws.sagemaker",
    "account": "<hostingAccountId>",
    "time": "2022-05-26T19:21:17Z",
    "region": "us-east-1",
    "resources": [
        "arn:aws:sagemaker:us-east-1:<hostingAccountId>:notebook-instance/basicnotebookinstance-x4cc6zfjzqjj"
    ],
    "detail": {
        "NotebookInstanceArn": "arn:aws:sagemaker:us-east-1:<hostingAccountId>:notebook-instance/basicnotebookinstance-x4cc6zfjzqjj",
        "NotebookInstanceName": "BasicNotebookInstance-x4CC6ZFJzqJJ",
        "NotebookInstanceStatus": "Stopping",
        "InstanceType": "ml.t3.medium",
        "SubnetId": "subnet-0bd8f38199152daa5",
        "SecurityGroups": [
            "sg-089fe63490b1adce7"
        ],
        "RoleArn": "arn:aws:iam::<hostingAccountId>:role/sagemaker-1653591995711-sagemaker-notebook-role",
        "KmsKeyId": "arn:aws:kms:us-east-1:<hostingAccountId>:key/11267bce-04c4-414d-9c67-7a7db160b879",
        "NetworkInterfaceId": "eni-016c977608de8f30b",
        "LastModifiedTime": 1653592871348,
        "CreationTime": 1653592049755,
        "DirectInternetAccess": "Enabled",
        "Tags": {
            "aws:servicecatalog:productArn": "arn:aws:catalog:us-east-1:<mainAccountId>:product/prod-hxwmltpkg2edy",
            "aws:cloudformation:stack-name": "SC-<hostingAccountId>-pp-uac6562y6s6ls",
            "aws:servicecatalog:provisioningPrincipalArn": "arn:aws:sts::<hostingAccountId>:assumed-role/swb-swbv2-va-env-mgmt/Launch-sagemaker-1653591997949",
            "aws:cloudformation:stack-id": "arn:aws:cloudformation:us-east-1:<hostingAccountId>:stack/SC-<hostingAccountId>-pp-uac6562y6s6ls/f9ef5470-dd26-11ec-b424-12f1e3fc1d25",
            "aws:cloudformation:logical-id": "BasicNotebookInstance",
            "Env": "b590a734-5adc-4a43-a24b-edf3795b812d",
            "aws:servicecatalog:provisioningArtifactIdentifier": "pa-fh6spfcycydtq",
            "aws:servicecatalog:portfolioArn": "arn:aws:catalog:us-east-1:<mainAccountId>:portfolio/port-45ssvg67eyrek",
            "aws:servicecatalog:provisionedProductArn": "arn:aws:servicecatalog:us-east-1:<hostingAccountId>:stack/basicnotebookinstance-1653591995689/pp-uac6562y6s6ls"
        }
    }
}
```