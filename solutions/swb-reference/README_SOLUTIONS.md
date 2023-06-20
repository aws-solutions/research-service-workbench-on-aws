# RWB Solutions Deployment

## Deploy Solutions Implementation CloudFormation template
- Navigate here <TODO: Enter valid URL> to the RWB Solutions Implementation page and download the Cloudformation template.
- Log into your AWS account as an Administrator where you want to deploy this stack. This role will help deploying the application and performing post-deployment steps.
- Create a new CloudFormation stack providing this template and the necessary input parameters.
  - Note: Please make sure CDK [bootsrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) has been performed for this account and region
- You have now deployed RWB successfully in your main account.

Note: An Application Load Balancer has been created in your main account with access logging disabled by default for Solutions deployment. If you'd like to enable it please follow these [instructions](https://docs.aws.amazon.com/elasticloadbalancing/latest/application/enable-access-logging.html).

### Breaking down your stack name
While following along steps you encounter further, please note that since you're working with a pre-formed template the region short name is set to be `test`. For example if your stack name is `rsw-prod-release` then:
- `prod` is the stage name
- `release` is the region short name
----

## Link Hosting Account

- It is now recommended to link a hosting account by creating a CloudFormation stack in it using the `solutions/swb-reference/src/templates/onboard-account.cfn.yaml` template. If you choose to do this step later, you will need to rerun the Post-Deployment step below.
----
## Perform Post-Deployment

Currently Research Service Workbench (RSW) contains some steps that can only be performed upon the completion of the main account CloudFormation stack. Here are the final few steps to complete your main account setup:<br/>

1. Using the same IAM role/user you used for deploying the CloudFormation stack, create a Cloud9 environment (in the same AWS account and region) as your CloudFormation stack deployment
   - Note: Please use instance type `m5.large` or higher for quick execution.
2. Run the following code snipper on the environment:

```shell
git clone https://github.com/aws-solutions/research-service-workbench-on-aws.git
cd research-service-workbench-on-aws
git checkout release/v2.0.0
. ./solutions/swb-reference/scripts/solutions-implementation/postSolutionDeployment.sh
```
----
## Optional: Initial setup for base resources

This section creates base Research Service Workbench resources required to provision workspaces in your onboarded hosting account. It is recommended to use the same Cloud9 instance from the previous step. 

Run the code snippet below to have the following Research Service Workbench-specific resources created in the database:
- Hosting Account
- Cost Center
- Project
- Environment Type Config

```shell
. ./scripts/solutions-implementation/baseResourceSetup.sh
```

**And you're all set!**

You can now deploy a workspace by running this command in your terminal:
```shell
. ./scripts/solutions-implementation/createEnvironment.sh
```
----
## Explore RWB
Feel free to take a look inside the `solutions/swb-reference/scripts/solutions-implementation` folder for scripts you just ran to create more of those resources. 
<br/>
For the entire API collection, take a look at the `solutions/swb-reference/RWB.postman_collection.json` file.
