#! /usr/bin/env bash
# set -euo pipefail
RED='\033[1;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

function main(){
    while getopts :m:p:s:r:i:e:k:a: opts; do
        case $opts in
            m) EMAIL=$OPTARG;;
            p) newPassword=$OPTARG;;
            s) stage=$OPTARG;;
            r) shortName=$OPTARG;;
            i) hostingAccountId=$OPTARG;;
            e) externalId=$OPTARG;;
            k) encryptionKeyArn=$OPTARG;;
            a) awsAccountId=$OPTARG;;
            \?) help; exit 0;;
        esac
    done
}

function help(){
    echo -e "${GREEN}
    Pre-requisites(Follow these steps in <PROJECT_ROOT>/solutions/swb-reference/README.md):
        Installation steps:
        i) Setup Config File
        ii) Setup CDK
        iii) Deploy the code
        iv) Deploy to the Hosting Account

    This script performs the following actions:
    1. Reset Cognito ITAdmin password
    2. Get accessToken, csrfCookie and csrfToken
    3. Setup Hosting Account
    4. Setup Cost Center
    5. Setup Project
    6. Approve EnvironmentType
    7. Create EnvironmentTypeConfig
    8. Create ProjectAdmin1 user
        i) Reset ProjectAdmin1 user password
        ii) Assign ProjectAdmin1 to ProjectAdmin Group
    9. Create ProjectAdmin2 user
        i) Reset ProjectAdmin2 user password
        ii) Assign ProjectAdmin2 to ProjectAdmin Group
    10. Create Researcher1 user
        i) Reset Researcher1 user password
        ii) Assign Researcher1 to Researcher Group
    11. Update SSM Params
    12. Generate Integration test config file in the integration-tests/confg dir

Usage: `basename $0`
    -h [Help]
    -m [MAIN ACCOUNT EMAIL]
    -p [NEW PASSWORD FOR COGNITO USERS]
    -s [STAGE NAME USED FOR DEPLOYMENT]
    -r [REGION SHORTNAME USED IN <STAGE>.yml]
    -i [HOSTING ACCOUNT ID]
    -e [EXTERNAL ID USED FOR HOSTING ACCOUNT DEPLOYMENT]
    -k [EncryptionKeyArn FROM HOSTING ACCOUNT DEPLOYMENT]
    -a [AWS ACCOUNT ID for ACCOUNT INTEG TEST]

Example:
    `basename $0` -m '<johndoe@example.com>' -p 'xxxxxxxxxxx' -s 'dev' -r 'va' -i 'XXXXXXXXXXXX' -e '<externalId>' -k 'arn:aws:kms:XXXXXXXX:XXXXXXXXXXXX:key/XXXXXXXXXXXXXXXXXXXXX' -a 'YYYYYYYYYYYY'
          ${NC}"
}

function check(){
    if [[ -z $EMAIL || -z $newPassword || -z $stage || -z $shortName || -z $hostingAccountId || -z $externalId || -z $encryptionKeyArn || -z $awsAccountId ]]; then
        echo -e "${RED}ERROR: email, newPassword, stage, regionShortName, externalId and EncryptionKeyArn are mandatory arguments. \nPlease see the help screen: `basename $0` -h${NC}"
        exit 1
    fi
}

function run() {
    check
    envMgmtRoleArn="arn:aws:iam::$hostingAccountId:role/rsw-$stage-$shortName-env-mgmt"
    hostingAccountHandlerRoleArn="arn:aws:iam::$hostingAccountId:role/rsw-$stage-$shortName-hosting-account-role"
    cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name rsw-$stage-$shortName --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
    swbDomainName=$(aws cloudformation describe-stacks --stack-name rsw-$stage-$shortName  --output text --query 'Stacks[0].Outputs[?OutputKey==`SwbDomainNameOutput`].OutputValue')

    echo -e "${CYAN}\nReset Cognito ITAdmin password"
    echo -e "------------------------------"
    aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $EMAIL --password $newPassword --permanent > /dev/null

    echo -e "${RED}\nGet accessToken, csrfCookie and csrfToken"
    echo -e "-----------------------------------------"
    STAGE=$stage node ./generateCognitoTokens.js $EMAIL $newPassword > tempCreds
    accessToken=$(grep 'accessToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
    csrfCookie=$(grep 'csrfCookie' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
    csrfToken=$(grep 'csrfToken' tempCreds | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "'" -f 2)
    rm tempCreds

    echo -e "${GREEN}\nSetup Hosting Account"
    echo -e "---------------------"
    hostingAccount=$(curl --location "https://$swbDomainName/api/awsAccounts" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"name\": \"TestAccount\",
        \"awsAccountId\": \"$hostingAccountId\",
        \"envMgmtRoleArn\": \"$envMgmtRoleArn\",
        \"hostingAccountHandlerRoleArn\": \"$hostingAccountHandlerRoleArn\",
        \"externalId\": \"$externalId\"
    }")

    echo -e "${YELLOW}\nWaiting for Hosting Account to get ready"
    echo -e "----------------------------------------"
    accountId=$(echo $hostingAccount | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
    while true ; do
    accountDetails=$(curl --location "https://$swbDomainName/api/awsAccounts/$accountId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
    accountStatus=$(echo $accountDetails | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 45)
    if [ "$accountStatus" == "CURRENT" ]; then
        echo -e "\nHosting account is now ready !"
        break
    fi
    echo -e "\nHosting account record is getting created. This could take a few minutes..."
    sleep 30
    done

    echo -e "${BLUE}\nSetup Cost Center"
    echo -e "-----------------"
    costCenter=$(curl --location "https://$swbDomainName/api/costCenters" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"name\": \"TestCostCenter\",
        \"accountId\": \"$accountId\",
        \"description\": \"a description of the cost center\"
    }")

    echo -e "\nCost center record is getting created..."
    sleep 2
    # Get cost center ID by listing cost centers
    echo -e "${CYAN}\nGet cost center ID by listing cost centers"
    echo "---------------------------------------------"
    costCenters=$(curl --location "https://$swbDomainName/api/costCenters" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
    costCenterId=$(echo $costCenters | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
    echo "costCenterId: ${costCenterId}"

    echo -e "${RED}\nSetup Project"
    echo -e "-------------"
    project=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken"  --header 'Content-Type: application/json' \
    --data "{
        \"name\": \"TestProject\",
        \"description\": \"Example Project 1\",
        \"costCenterId\": \"$costCenterId\"
    }")
    echo -e "\nProject record is getting created..."
    sleep 2

    echo -e "${GREEN}\nGet Project ID by listing projects"
    echo -e "----------------------------------"
    projects=$(curl --location "https://$swbDomainName/api/projects" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
    projectId=$(echo $projects | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
    echo "projectId: ${projectId}"

    echo -e "${BLUE}\nGet EnvironmentType ID by listing environmentTypes"
    echo -e "--------------------------------------------------"
    envTypes=$(curl --location "https://$swbDomainName/api/environmentTypes" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken")
    envTypeId=$(echo $envTypes | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 4)
    echo "envTypeId: ${envTypeId}"

    echo -e "${YELLOW}\nApprove environment Type"
    echo -e "------------------------"
    approveEnvType=$(curl --location --request PATCH "https://$swbDomainName/api/environmentTypes/$envTypeId" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"description\": \"An Amazon SageMaker Jupyter Notebook\",
        \"name\": \"JupyterNotebook\",
        \"status\": \"APPROVED\"
    }")
    echo "\nEnv type is getting updated..."
    sleep 2

    echo -e "${PURPLE}\nCreate EnvironmentTypeConfig"
    echo -e "----------------------------"
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
    echo "\nEnvTypeConfig record is getting created..."
    sleep 2
    envTypeConfigId=$(echo $envTypeConfig | sed -r 's/^[^:]*:(.*)$/\1/' | sed 's/^.\(.*\).$/\1/' | cut -d "\"" -f 1)
    echo "envTypeConfigId: ${envTypeConfigId}"

    echo -e "${CYAN}\nCreate ProjectAdmin1 user"
    echo -e "-------------------------"
    PA1_EMAIL="johndoe@example.com"
    $(curl --location --request POST "https://$swbDomainName/api/users" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"firstName\": \"PA1F\",
        \"lastName\": \"PA1L\",
        \"email\": \"$PA1_EMAIL\"
    }") &> /dev/null

    echo -e "${RED}\nReset ProjectAdmin1 user password"
    echo -e "---------------------------------"
    aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $PA1_EMAIL --password $newPassword --permanent > /dev/null

    echo -e "${GREEN}\nAssign ProjectAdmin1 to ProjectAdmin Group"
    echo -e "------------------------------------------"
    aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $PA1_EMAIL --group-name "$projectId#ProjectAdmin" > /dev/null

    echo -e "${BLUE}\nCreate ProjectAdmin2 user"
    echo -e "-------------------------"
    PA2_EMAIL="janedoe@example.com"
    $(curl --location --request POST "https://$swbDomainName/api/users" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"firstName\": \"PA2F\",
        \"lastName\": \"PA2L\",
        \"email\": \"$PA2_EMAIL\"
    }") &> /dev/null

    echo -e "${YELLOW}\nReset ProjectAdmin2 user password"
    echo -e "---------------------------------"
    aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $PA2_EMAIL --password $newPassword --permanent > /dev/null

    echo -e "${PURPLE}\nAssign ProjectAdmin2 to ProjectAdmin Group"
    echo -e "------------------------------------------"
    aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $PA2_EMAIL --group-name "$projectId#ProjectAdmin" > /dev/null

    echo -e "${CYAN}\nCreate Researcher1 user"
    echo -e "-------------------------"
    RE1_EMAIL="johnstiles@example.com"
    $(curl --location --request POST "https://$swbDomainName/api/users" --header "Cookie: access_token=$accessToken;_csrf=$csrfCookie" --header "csrf-token: $csrfToken" --header 'Content-Type: application/json' \
    --data "{
        \"firstName\": \"RE1F\",
        \"lastName\": \"RE1L\",
        \"email\": \"$RE1_EMAIL\"
    }") &> /dev/null

    echo -e "${RED}\nReset Researcher1 user password"
    echo -e "-------------------------------"
    aws cognito-idp admin-set-user-password --user-pool-id $cognitoUserPoolId --username $RE1_EMAIL --password $newPassword --permanent > /dev/null

    echo -e "${GREEN}\nAssign Researcher1 to Researcher Group"
    echo -e "--------------------------------------"
    aws cognito-idp admin-add-user-to-group --user-pool-id $cognitoUserPoolId --username $RE1_EMAIL --group-name "$projectId#Researcher" > /dev/null

    echo -e "${BLUE}\nUpdate SSM Params"
    echo -e "-----------------"
    rootUserNameParamStorePath="/swb/$stage/rootUser/email"
    aws ssm put-parameter --name $rootUserNameParamStorePath --value $EMAIL --type 'String' --overwrite > /dev/null
    rootPasswordParamStorePath="/swb/$stage/rootUser/password"
    aws ssm put-parameter --name $rootPasswordParamStorePath --value "$newPassword" --type 'SecureString' --overwrite > /dev/null

    projectAdmin1UserNameParamStorePath="/swb/$stage/pa1/email"
    aws ssm put-parameter --name $projectAdmin1UserNameParamStorePath --value $PA1_EMAIL --type 'String' --overwrite > /dev/null
    projectAdmin1PasswordParamStorePath="/swb/$stage/pa1/password"
    aws ssm put-parameter --name $projectAdmin1PasswordParamStorePath --value "$newPassword" --type 'SecureString' --overwrite > /dev/null

    projectAdmin2UserNameParamStorePath="/swb/$stage/pa2/email"
    aws ssm put-parameter --name $projectAdmin2UserNameParamStorePath --value $PA2_EMAIL --type 'String' --overwrite > /dev/null
    projectAdmin2PasswordParamStorePath="/swb/$stage/pa2/password"
    aws ssm put-parameter --name $projectAdmin2PasswordParamStorePath --value "$newPassword" --type 'SecureString' --overwrite > /dev/null

    researcher1UserNameParamStorePath="/swb/$stage/researcher1/email"
    aws ssm put-parameter --name $researcher1UserNameParamStorePath --value $RE1_EMAIL --type 'String' --overwrite > /dev/null
    researcher1PasswordParamStorePath="/swb/$stage/researcher1/password"
    aws ssm put-parameter --name $researcher1PasswordParamStorePath --value "$newPassword" --type 'SecureString' --overwrite > /dev/null

    awsAccountIdParamStorePath="/swb/$stage/accountsTest/awsAccountId"
    aws ssm put-parameter --name $awsAccountIdParamStorePath --value $awsAccountId --type 'String' --overwrite > /dev/null

    echo -e "${YELLOW}\nSSM Params Updated !"

    ROOT_DIR=`git rev-parse --show-toplevel`
    INTEGRATION_TEST_CONFIG_FILE="${ROOT_DIR}/solutions/swb-reference/integration-tests/config/${stage}.yaml"

    echo -e "${PURPLE}\nGenerate Integration test config file"
    echo -e "-------------------------------------"
    echo "
# Default Env Config for launching a new environment
envTypeId: '$envTypeId'
envTypeConfigId: '$envTypeConfigId'
projectId: '$projectId'
envType: 'sagemakerNotebook'

#Cognito Integ Test Client
rootUserNameParamStorePath: '$rootUserNameParamStorePath'
rootPasswordParamStorePath: '$rootPasswordParamStorePath'

projectAdmin1UserNameParamStorePath: '$projectAdmin1UserNameParamStorePath'
projectAdmin1PasswordParamStorePath: '$projectAdmin1PasswordParamStorePath'

projectAdmin2UserNameParamStorePath: '$projectAdmin2UserNameParamStorePath'
projectAdmin2PasswordParamStorePath: '$projectAdmin2PasswordParamStorePath'

researcher1UserNameParamStorePath: '$researcher1UserNameParamStorePath'
researcher1PasswordParamStorePath: '$researcher1PasswordParamStorePath'

## Default Hosting Account
defaultHostingAccountId: '$accountId'

## Pre-requisite for running aws-accounts integration test
## Store an AWS Account ID that is not your main or hosting account ID in SSM and provide path here
awsAccountIdParamStorePath: '$awsAccountIdParamStorePath'
" | tee -a ${INTEGRATION_TEST_CONFIG_FILE} && echo -e "\nIntegration Test Config File: ${INTEGRATION_TEST_CONFIG_FILE} ${NC}"
}

main $@
run