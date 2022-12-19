#! /usr/bin/env bash

# set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

function main(){
    while getopts :u:e:p:r:oc opts; do
        case $opts in
            u) USER_POOL_ID=$OPTARG;;
            e) EMAIL=$OPTARG;;
            p) PASSWORD=$OPTARG;;
            r) REGION=$OPTARG;;
            o) OVERWRITE=1;;
            c) create;;
            \?) help; exit 0;;
        esac
    done
}

function help(){
    echo "This script performs the following actions:
    1. Create Cognito User
    2. Confirm Cognito User
    3. Create Admin Group
    4. Add User to Admin Group
    5. Store Username to SSM Parameter Store
    6. Store Password to SSM Parameter Store

Usage: `basename $0`
    -h [Help]
    -u [COGNITO USER_POOL_ID]
    -e [EMAIL FOR COGNITO USER]
    -p [PASSWORD FOR COGNITO USER]
    -r [AWS REGION]
    -o [!! IF YOU WANT TO OVERWRITE SSM PARAM VALUES]
    -c [CREATE FLAG]

Example:
    `basename $0` -u 'us-east-1_abcde' -e 'abc@def.com' -p 'AS@#R#RSER*TA' -r 'us-east-1' -c
    `basename $0` -u 'us-east-1_abcde' -e 'abc@def.com' -p 'AS@#R#RSER*TA' -r 'us-east-1' -o -c
          "
}

function check(){
    if [[ -z $USER_POOL_ID || -z EMAIL || -z PASSWORD || -z $REGION ]]; then
        echo -e "${RED}ERROR: USER_POOL_ID, EMAIL, PASSWORD and REGION are mandatory arguments${NC}"
        exit 1
    fi
}

function create(){
    check
    ### Create Cognito User
    echo -e "${YELLOW}### Create Cognito User ###${NC}"
    aws cognito-idp admin-create-user \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --user-attributes Name=email,Value=$EMAIL Name=email_verified,Value=True \
    --region $REGION 1> /dev/null;
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** Cognito User created ***${NC}"
    else
        echo -e "${RED}*** [ERROR] Cognito User could not be created ***${NC}"
    fi

    ### Confirm Cognito User
    echo -e "${YELLOW}### Confirm Cognito User ###${NC}"
    aws cognito-idp admin-set-user-password \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --password $PASSWORD \
    --permanent \
    --region $REGION 1> /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}***  Cognito User confirmed ***${NC}"
    else
        echo -e "${RED}***  [ERROR] Cognito User could not be confirmed ***${NC}"
    fi

    ### Create Admin Group
    echo -e "${YELLOW}### Create Admin Group ###${NC}"
    aws cognito-idp create-group \
    --user-pool-id $USER_POOL_ID \
    --group-name 'Admin' \
    --region $REGION 1> /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}***  Admin Group created ***${NC}"
    else
        echo -e "${RED}***  [ERROR] Admin Group could not be created ***${NC}"
    fi

    ### Add User to Admin Group
    echo -e "${YELLOW}### Add User to Admin Group ###${NC}"
    aws cognito-idp admin-add-user-to-group \
    --user-pool-id $USER_POOL_ID \
    --username $EMAIL \
    --group-name 'Admin' \
    --region $REGION 1> /dev/null
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** User added to the Admin Group ***${NC}"
    else
        echo -e "${RED}*** User could not be added to the Admin Group ***${NC}"
    fi

    ### Store Username to SSM Parameter Store
    echo -e "${YELLOW}### Store Username to SSM Parameter Store ###${NC}"
    cmd="aws ssm put-parameter \
    --name '/maf/exampleApp/rootUser/email' \
    --value $EMAIL \
    --type 'SecureString' \
    --region $REGION"

    if [ $OVERWRITE ]; then
        cmd="$cmd --overwrite 1> /dev/null"
    else
        cmd="$cmd 1> /dev/null"
    fi
    eval $cmd

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** Username stored to SSM Parameter Store ***${NC}"
    else
        echo -e "${RED}*** [ERROR] Username could not be stored to SSM Parameter Store ***${NC}"
    fi

    ### Store Password to SSM Parameter Store
    echo -e "${YELLOW}### Store Password to SSM Parameter Store ###${NC}"
    cmd="aws ssm put-parameter \
    --name '/maf/exampleApp/rootUser/password' \
    --value \"$PASSWORD\" \
    --type 'SecureString' \
    --region $REGION"

    if [ $OVERWRITE ]; then
        cmd="$cmd --overwrite 1> /dev/null"
    else
        cmd="$cmd 1> /dev/null"
    fi
    eval $cmd

    if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** Password stored to SSM Parameter Store ***${NC}"
    else
        echo -e "${RED}*** Password could not be stored to SSM Parameter Store ***${NC}"
    fi
}

function sanitize() {
    echo 'Sanitizing environment variables..'
    unset USER_POOL_ID
    unset EMAIL
    unset PASSWORD
    unset REGION
}

sanitize
main $@
sanitize