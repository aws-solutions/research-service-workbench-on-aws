#!/bin/bash

read -p "Enter your desired password for the email address you provided: " newPassword

echo "Now we enter the outputs from Hosting Account CloudFormation stack: "
read -p "Enter the AWS Hosting Account ID: " hostingAccountId
read -p "Enter the EnvMgmtRoleArn output from the hosting account stack: " envMgmtRoleArn
read -p "Enter the HostingAccountHandlerRoleArn output from the hosting account stack: " hostingAccountHandlerRoleArn
read -p "Enter the ExternalId value from the hosting account stack parameters: " externalId

export cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
export swbDomainName=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`SwbDomainNameOutput`].OutputValue')
aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $EMAIL --password $newPassword --permanent > /dev/null

STAGE=prod node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)

echo "Set up Hosting Account"
hostingAccount=$(curl --location "https://$swbDomainName/api/awsAccounts" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestAccount\",
    \"awsAccountId\": \"$hostingAccountId\",
    \"envMgmtRoleArn\": \"$envMgmtRoleArn\",
    \"hostingAccountHandlerRoleArn\": \"$hostingAccountHandlerRoleArn\",
    \"externalId\": \"$externalId\"
}")

accountId=$(echo $hostingAccount | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
while true ; do
  accountDetails=$(curl --location "https://$swbDomainName/api/awsAccounts/$accountId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
  accountStatus=$(echo $accountDetails | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 45)
  if [ "$accountStatus" == "CURRENT" ]; then
    echo "Hosting account is now ready"
    break
  fi
  echo "Hosting account record is getting created. This could take a few minutes..."
  sleep 30
done

echo "Set up Cost Center"
costCenter=$(curl --location "https://$swbDomainName/api/costCenters" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestCostCenter\",
    \"accountId\": \"$accountId\",
    \"description\": \"a description of the cost center\"
}")
echo "Cost center record is getting created..."
sleep 2

# Get cost center ID by listing cost centers
costCenters=$(curl --location "https://$swbDomainName/api/costCenters" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")

echo "Set up Project"
costCenterId=$(echo $costCenters | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
project=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestProject\",
    \"description\": \"Example Project 1\",
    \"costCenterId\": \"$costCenterId\"
}")
echo "Project record is getting created..."
sleep 2

# Get project ID by listing projects
projects=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")

# Add root user to project as Project Admin
export projectId=$(echo $projects | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $EMAIL --group-name "$projectId#ProjectAdmin" > /dev/null

# Recreate credentials
rm -rf ./tempCreds
STAGE=prod node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
export accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
export csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
export csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)

# Get Environment Type ID
envTypes=$(curl --location "https://$swbDomainName/api/environmentTypes" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")

# Approve Env Type ID
export envTypeId=$(echo $envTypes | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
approveEnvType=$(curl --location --request PATCH "https://$swbDomainName/api/environmentTypes/$envTypeId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
--data "{
    \"description\": \"An Amazon SageMaker Jupyter Notebook\",
    \"name\": \"JupyterNotebook\",
    \"status\": \"APPROVED\"
}")
echo "Env type is getting updated..."
sleep 2

# Set up Environment Type Config
envTypeConfig=$(curl --location "https://$swbDomainName/api/environmentTypes/$envTypeId/configurations" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
--data "{
    \"type\": \"sagemakerNotebook\",
    \"description\": \"Example config 1\",
    \"name\": \"config-1\",
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

echo "Env type config record is getting created..."
sleep 2

export envTypeConfigId=$(echo $envTypeConfig | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)

echo "
-------------------------------------------------------------------------
Summary:
-------------------------------------------------------------------------
Stage Name                          : prod
Account Id                          : $accountId
Project Id                          : $projectId
Env Type ID                         : $envTypeId
Env Type Config Id                  : $envTypeConfigId
"
