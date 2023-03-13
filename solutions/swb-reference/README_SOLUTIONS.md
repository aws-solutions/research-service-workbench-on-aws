# SWBv2 Solutions Deployment

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
```

```shell
git clone https://github.com/aws-solutions/solution-spark-on-aws.git
cd solution-spark-on-aws
git checkout origin/develop
regionShortName=test
region=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`awsRegion`].OutputValue')
cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
cognitoUserPoolClientId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolClientId`].OutputValue')
dynamicAuthDDBTableName=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`dynamicAuthDDBTableName`].OutputValue')
aws ssm put-parameter --name "/swb/dev/rootUser/email/$regionShortName" --value $EMAIL --type 'SecureString' > /dev/null

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
STAGE=dev rushx run-postDeployment  # Need to run this twice to create env type after service catalog has been created
# This completes post deployment setup

```

## Optional: Initial setup for base resources
This section creates base Service Workbench resources required to provision workspaces in your onboarded hosting account. It is recommended to use the same Cloud9 instance from the previous step. 

Copy the code snippet below and enter your desired password and hosting account output ARNs. Execute this snippet it in your workspace terminal.

```shell
# Enter your desired password for the root email
export newPassword=<YOUR_PASSWORD>
# Outputs from Hosting Account CloudFormation stack:
export hostingAccountId=<HOST_AWS_ACCOUNT_ID>
export envMgmtRoleArn=<ENV_MGMT_ROLE_ARN>
export hostingAccountHandlerRoleArn=<HOSTING_ACCOUNT_HANDLER_ROLE_ARN>
# Parameter value from Hosting Account CloudFormation stack:
export externalId=<EXTERNAL_ID_PARAM_VALUE>
```

Now, run the code snippet below to have the following Service Workbench-specific resources created in the database:
- Hosting Account
- Cost Center
- Project
- Environment Type Config
  
```shell
cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
swbDomainName=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`SwbDomainNameOutput`].OutputValue')
aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $EMAIL --password $newPassword --permanent > /dev/null

STAGE=dev node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)

# Set up Hosting Account
hostingAccount=$(curl --location "https://$swbDomainName/api/awsAccounts" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestAccount\",
    \"awsAccountId\": \"$hostingAccountId\",
    \"envMgmtRoleArn\": \"$envMgmtRoleArn\",
    \"hostingAccountHandlerRoleArn\": \"$hostingAccountHandlerRoleArn\",
    \"externalId\": \"$externalId\"
}")

# Set up Cost Center
accountId=$(grep 'awsAccountId' $hostingAccount | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 2)
costCenter=$(curl --location "https://$swbDomainName/api/costCenters/" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestCostCenter\",
    \"accountId\": \"$accountId\",
    \"description\": \"a description of the cost center\"
}")

# Set up Project
costCenterId=$(echo $costCenter | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
project=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestProject\",
    \"description\": \"Example Project 1\",
    \"costCenterId\": \"$costCenterId\"
}")

# Add root user to project as Project Admin
projectId=$(echo $project | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $EMAIL --group-name "$projectId#ProjectAdmin" > /dev/null

# Get Environment Type ID
envTypes=$(curl --location "https://$swbDomainName/api/environmentTypes" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")

# Approve Env Type ID
envTypeId=$(echo $envTypes | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
approveEnvType=$(curl --location --request PATCH "https://$swbDomainName/api/environmentTypes/$envTypeId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"description\": \"An Amazon SageMaker Jupyter Notebook\",
    \"name\": \"Jupyter Notebook\",
    \"status\": \"APPROVED\"
}")

# Set up Environment Type Config
envTypeConfig=$(curl --location "https://$swbDomainName/api/environmentTypes/$envTypeId/configurations" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
--data "{
    \"type\": \"sagemakerNotebook\",
    \"description\": \"Example config 1\",
    \"name\": \"config 1\",
    \"estimatedCost\": \"estimated cost\",
    \"params\": [
        {
      \"key\": \"IamPolicyDocument\",
      \"value\": \"${iamPolicyDocument}\"
     },
     {
      \"key\": \"InstanceType\",
      \"value\": \"ml.t3.medium\"      
     },
     {
      \"key\": \"AutoStopIdleTimeInMinutes\",
      \"value\": \"0\"
     },
     {
       \"key\": \"CIDR\",
       \"value\": \"0.0.0.0/0\"
     }
    ]
}")
envTypeConfigId=$(echo $envTypeConfig | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
# This completes base resource setup

```

**And you're all set!**

You can try to deploy a workspace by running this command in your terminal:
```shell
curl --location "https://$swbDomainName/api/projects/$projectId/environments" \
--header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header "Content-Type: application/json" \
--data "{
    \"description\": \"test 123\",
    \"name\": \"testEnvironment\",
    \"envTypeId\": \"$envTypeId\",
    \"envTypeConfigId\": \"$envTypeConfigId\",
    \"datasetIds\": [],
    \"envType\": \"sagemakerNotebook\"
}"

```


<br/>

