cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
swbDomainName=$(aws cloudformation describe-stacks --stack-name swb-dev-test --output text --query 'Stacks[0].Outputs[?OutputKey==`SwbDomainNameOutput`].OutputValue')
aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $EMAIL --password $newPassword --permanent > /dev/null

STAGE=dev node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
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

accountId=$(echo $accountDetails | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
echo "Hosting account record is getting created. This could take about 5 minutes..."
while true ; do
  accountDetails=$(curl --location "https://$swbDomainName/api/awsAccounts/$accountId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
  accountStatus=$(echo $accountDetails | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
  if [ "$accountStatus" == "CURRENT" ]; then
  echo "Hosting account is now ready"
      break
  fi
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

# TODO: Get cost center ID by listing cost centers

echo "Set up Project"
costCenterId=$(echo $costCenter | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
project=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
--data "{
    \"name\": \"TestProject\",
    \"description\": \"Example Project 1\",
    \"costCenterId\": \"$costCenterId\"
}")
echo "Project record is getting created..."
sleep 2

# TODO: Get project ID by listing projects

# Add root user to project as Project Admin
projectId=$(echo $project | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $EMAIL --group-name "$projectId#ProjectAdmin" > /dev/null

# Recreate credentials
rm -rf ./tempCreds
STAGE=dev node ./scripts/generateCognitoTokens.js $EMAIL $newPassword > tempCreds
accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)

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
echo "Env type is getting updated..."
sleep 2

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

echo "Env type config record is getting created..."
sleep 2

envTypeConfigId=$(echo $envTypeConfig | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)

echo "
-------------------------------------------------------------------------\"
\"Summary:\"
\"-------------------------------------------------------------------------\"
\"Stage Name                          : dev\"
\"Account Id                          : $accountId\"
\"Project Id                          : $projectId\"
\"Env Type ID                         : $envTypeId\"
\"Env Type Config Id                  : $envTypeConfigId\"
"
