# SWBv2 Single-Click Deployment

## Deploy Solutions Implementation CloudFormation template
- Navigate here <TODO: Enter valid URL> to the SWBv2 Solutions Implementation page and download the Cloudformation template.
- Log into your AWS account as an Administrator where you want to deploy this stack. This role will help deploying the application and performing post-deployment steps.
- Create a new CloudFormation stack providing this template and the necessary input parameters.
  - Note: Please make sure CDK [bootsrapping](https://docs.aws.amazon.com/cdk/v2/guide/bootstrapping.html) has been performed for this account and region
- You have now deployed SWBv2 successfully in your main account.

### Breaking down your stack name
While following along steps you encounter further, please note that since you're working with a pre-formed template the region short name is a random string. For example if your stack name is `swb-dev-bb5823` then:
- `dev` is the stage name
- `bb5823` is the region short name

## Link Hosting Accounts and Exlpore SWBv2
It is now recommended to link a hosting account by creating a CloudFormation stack in it using the `solutions/swb-reference/src/templates/onboard-account.cfn.yaml` template. If you choose to do this step later, you will need to rerun the Post-Deployment step below.

## Perform Post-Deployment
Currently Service Workbench contains some steps that can only be performed upon the completion of the main account CloudFormation stack. Here are the final few steps to complete your main account setup:<br/>

1. Using the same IAM role/user you used for deploying the CloudFormation stack, create a Cloud9 environment (in the same AWS account and region) as your CloudFormation stack deployment
   - Note: Please use instance type `m5.large` or higher for quick execution.
2. Run the following steps on the environment:
   - Note: Replace `<YOUR_EMAIL>` with your email address in the first line of the code snippet. This will be the IT Admin user

```shell
export EMAIL=<YOUR_EMAIL>

git clone https://github.com/aws-solutions/solution-spark-on-aws.git
cd solution-spark-on-aws
git checkout origin/develop
regionShortName=test
region=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`awsRegion`].OutputValue')
cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
cognitoUserPoolClientId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolClientId`].OutputValue')
dynamicAuthDDBTableName=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`dynamicAuthDDBTableName`].OutputValue')
aws ssm put-parameter --name "/swb/dev/rootUser/email/$regionShortName" --value $EMAIL --type 'SecureString'

rm -rf ./solutions/swb-reference/src/config/dev.yaml
rm -rf ./solutions/swb-reference/src/config/dev.json

echo "
stage: dev
awsRegion: $region
awsRegionShortName: $regionShortName
rootUserEmailParamStorePath: '/swb/dev/rootUser/email/$regionShortName'
userPoolId: $cognitoUserPoolId
" >> ./solutions/swb-reference/src/config/dev.yaml

echo "
{\"swb-dev-test\": 
   {\"dynamicAuthDDBTableName\": \"$dynamicAuthDDBTableName\",
   \"cognitoUserPoolClientId\": \"$cognitoUserPoolClientId\",
    \"cognitoUserPoolId\": \"$cognitoUserPoolId\",
    \"awsRegion\": \"$region\"
   }
}" >> ./solutions/swb-reference/src/config/dev.json

npm install -g @microsoft/rush
rush update
cd solutions/swb-reference
STAGE=dev rushx run-postDeployment
# This completes post deployment setup
```

## Optional: Initial setup for base resources
This section creates base Service Workbench resources required to provision workspaces in your onboarded hosting account. It is recommended to use the same Cloud9 instance from the previous step. 

The following Service Workbench-specific resources will be created in the database:
- Hosting Account
- Cost Center
- Project
- Environment Type Config

A few notes:
- Enter your desired password and hosting account output ARNs as requested in the initial section of this script.
- This code snippet will assign your IT admin user to your new hosting account's project admin role as well (for easier setup).

```shell
# Enter your desired password for the root email
export newPassword=<YOUR_PASSWORD>
# Outputs from Hosting Account CloudFormation stack:
export hostingAccountId=<HOST_AWS_ACCOUNT_ID>
export envMgmtRoleArn=<ENV_MGMT_ROLE_ARN>
export hostingAccountHandlerRoleArn=<HOSTING_ACCOUNT_HANDLER_ROLE_ARN>
# Parameter value from Hosting Account CloudFormation stack:
export externalId=<EXTERNAL_ID_PARAM_VALUE>

cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
swbDomainName=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`SwbDomainNameOutput`].OutputValue')
aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $EMAIL --password $newPassword --permanent

STAGE=dev node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)

# Set up Hosting Account
hostingAccount=$(curl --location `$swbDomainName/api/awsAccounts` --header `Cookie: access_token=$accessToken;_csrf=$csrfCookie` --header `csrf-token: $csrfToken` --header 'Content-Type: application/json' \
--data `{
    "name": "FirstHostingAccount",
    "awsAccountId": "$hostingAccountId",
    "envMgmtRoleArn": "$envMgmtRoleArn",
    "hostingAccountHandlerRoleArn": "$hostingAccountHandlerRoleArn",
    "externalId": "$externalId"
}`)

# Set up Cost Center
accountId=$(grep 'awsAccountId' $hostingAccount | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 2)
costCenter=$(curl --location `$swbDomainName/api/costCenters/` --header `Cookie: access_token=$accessToken;_csrf=$csrfCookie` --header `csrf-token: $csrfToken` --header 'Content-Type: application/json' \
--data '{
    "name": "cost center name",
    "accountId": "acc-123",
    "description": "a description of the cost center"
}')

# Set up Project
project=$(curl --location `$swbDomainName/api/projects` --header `Cookie: access_token=$accessToken;_csrf=$csrfCookie` --header `csrf-token: $csrfToken` --header 'Content-Type: application/json' \
--data `{
    "name": "Example Project 1",
    "description": "Example Project 1",
    "costCenterId": "cc-exampleCostCenterId"
}`)

# Get Environment Type ID
envTypes=$(curl --location `$swbDomainName/api/environmentTypes` --header `Cookie: access_token=$accessToken;_csrf=$csrfCookie` --header 'csrf-token: $csrfToken')

# Set up Environment Type Config
envTypeConfig=$(curl --location `$swbDomainName/api/environmentTypes/et-prod-jve66d5p3iica,pa-spxhutayva5rm/configurations` --header `Cookie: access_token=$accessToken;_csrf=$csrfCookie` --header `csrf-token: $csrfToken` --header 'Content-Type: application/json' \
--data `{
    "type": "sagemakerNotebook",
    "description": "Example config 1",
    "name": "config 1",
    "estimatedCost": "estimated cost",
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
}`)

```

<br/>

