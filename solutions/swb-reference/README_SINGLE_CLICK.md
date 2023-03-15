# SWBv2 Single-Click Deployment

## Get main account CloudFormation template
- Navigate here <TODO: Enter valid URL> to the SWBv2 Solutions Implementation page and download the Cloudformation template.
- Log into your AWS account as an Administrator where you want to deploy this stack. This role will help deploying the application and performing post-deployment steps.
- Create a new CloudFormation stack providing this template and the necessary input parameters.

### Breaking down your stack name
While following along steps you encounter further, please note that since you're working with a pre-formed template the region short name is a random string. For example if your stack name is `swb-dev-bb5823` then:
- `dev` is the stage name
- `bb5823` is the region short name

## Perform post-deployment steps
Currently Service Workbench contains some steps that can only be performed upon the completion of the main account CloudFormation stack. Here are the final few steps to complete your main account setup:<br/>

1. Using the same IAM role/user you used for deploying the CloudFormation stack, create a Cloud9 environment (in the same AWS account and region) as your CloudFormation stack deployment
   - Note: Please use instance type `m5.large` or higher for quick execution.
2. Run the following steps on the environment:
   - Note: Enter your email address and CloudFormation stack name values in the first two lines of the code snippet

```shell
export EMAIL=<YOUR_EMAIL>
export STACK_NAME=<YOUR_CLOUDFORMATION_STACK_NAME>

git clone https://github.com/aws-solutions/solution-spark-on-aws.git
cd solution-spark-on-aws
git checkout origin/develop
region=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --output text --query 'Stacks[0].Outputs[?OutputKey==`awsRegion`].OutputValue')
regionShortName=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --output text --query 'Stacks[0].Outputs[?OutputKey==`awsRegionShortName`].OutputValue')
cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
dynamicAuthDDBTableName=$(aws cloudformation describe-stacks --stack-name "$STACK_NAME" --output text --query 'Stacks[0].Outputs[?OutputKey==`dynamicAuthDDBTableName`].OutputValue')
aws ssm put-parameter --name "/swb/dev/rootUser/email/$regionShortName" --value $EMAIL --type 'SecureString'
echo "
stage: dev
awsRegion: $region
awsRegionShortName: $regionShortName
rootUserEmailParamStorePath: '/swb/dev/rootUser/email/$regionShortName'  # This will be randomized when running post deployment for Solutions
userPoolId: $cognitoUserPoolId
" >> ./solutions/swb-reference/src/config/dev.yaml

echo "
{\"$STACK_NAME\": {\"dynamicAuthDDBTableName\": \"$dynamicAuthDDBTableName\"}}" >> ./solutions/swb-reference/src/config/dev.json

npm install -g @microsoft/rush
rush update
cd solutions/swb-reference
STAGE=dev rushx run-postDeployment
# This completes post deployment setup
```


<br/>
<br/>

## Link Hosting Accounts and Exlpore SWBv2
You have now deployed SWBv2 successfully in your main account. The rest of the installation process to link hosting accounts can be followed from the `"Deploy to the Hosting Account"` section of the `solutions/swb-reference/SETUP_v2p1.md` file.