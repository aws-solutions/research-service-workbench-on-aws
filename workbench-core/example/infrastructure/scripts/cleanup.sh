#! /usr/bin/env bash

# set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

function main(){
    while getopts :u:d:r:pitc opts; do
        case $opts in
            u) USER_POOL_ID=$OPTARG;;
            d) DYNAMO_DB_TABLE_NAME=$OPTARG;;
            r) REGION=$OPTARG;;
            p) DELETE_SSM_PARAMETERS=1;;
            c) cleanup;;
            \?) help; exit 0;;
        esac
    done
}

function help(){
    echo "This script cleans up the resources created for integration test:
    1. Delete Cognito UserPool
    2. Delete DynamoDB Table
    3. Delete '/maf/exampleApp/rootUser/email' and '/maf/exampleApp/rootUser/password' parameters from the parameter store

Usage: `basename $0`
    -h [Help]
    -u [COGNITO USER_POOL_ID]
    -d [DELETE_DYNAMO_DB_TABLE]
    -r [AWS REGION]
    -p [DELETE_SSM_PARAMETERS]
    -c [CLEANUP FLAG]

Example:
    Delete UserPool:                    `basename $0` -u 'us-east-1_abcde' -r 'us-east-1' -c
    Delete DynamoDB Table:              `basename $0` -d 'TABLE_NAME' -r 'us-east-1' -c
    Delete Ssm Parameter:               `basename $0` -r 'us-east-1' -p -c
    Delete All:                         `basename $0` -u 'us-east-1_abcde' -d 'TABLE_NAME' -r 'us-east-1' -p -c"
}

function check(){
    if [[ -z $REGION ]]; then
        echo -e "${RED}ERROR: REGION are mandatory arguments${NC}"
        exit 1
    fi
}

function cleanup(){
    check
    
    if [[ -n $USER_POOL_ID ]]; then
        ### Delete Cognito UserPool
        echo -e "${YELLOW}### Delete Cognito UserPool ###${NC}"
        aws cognito-idp delete-user-pool --user-pool-id $USER_POOL_ID --region $REGION 1> /dev/null

        if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** Cognito UserPool deleted ***${NC}"
        else
            echo -e "${RED}*** [ERROR] Cognito UserPool could not be deleted ***${NC}"
        fi
    fi

    if [[ -n $DYNAMO_DB_TABLE_NAME ]]; then
        ### Delete DynamoDB Table
        echo -e "${YELLOW}### Delete DynamoDB Table ###${NC}"
        aws dynamodb delete-table --table-name $DYNAMO_DB_TABLE_NAME --region $REGION 1> /dev/null

        if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** DynamoDB Table deleted ***${NC}"
        else
            echo -e "${RED}*** [ERROR] DynamoDB Table could not be deleted ***${NC}"
        fi
    fi

    if [[ -n $DELETE_SSM_PARAMETERS ]]; then
        ### Delete ssm paramters
        echo -e "${YELLOW}### Delete ssm paramters ###${NC}"
        aws ssm delete-parameters --name '/maf/exampleApp/rootUser/email' '/maf/exampleApp/rootUser/password' --region $REGION 1> /dev/null

        if [ $? -eq 0 ]; then
        echo -e "${GREEN}*** SSM paramters deleted ***${NC}"
        else
            echo -e "${RED}*** [ERROR] SSM paramters could not be deleted ***${NC}"
        fi
    fi
}

function sanitize() {
    unset USER_POOL_ID
    unset DYNAMO_DB_TABLE_NAME
    unset DELETE_SSM_PARAMETERS
    unset REGION
}

sanitize
main $@
sanitize