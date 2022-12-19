#! /usr/bin/env bash

# set -euo pipefail

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[0;33m'
NC='\033[0m' # No Color

function main(){
    while getopts :r:itg opts; do
        case $opts in
            r) REGION=$OPTARG;;
            i) GET_USER_POOL_ID=1;;
            t) GET_DYNAMO_DB_TABLE=1;;
            g) get;;
            \?) help; exit 0;;
        esac
    done
}

function help(){
    echo "This script can be used to get resource information:
    1. Get Cognito UserPool Id
    2. Get DynamoDB Table Name

Usage: `basename $0`
    -h [Help]
    -r [AWS REGION]
    -i [GET_USER_POOL_ID]
    -t [GET_DYNAMO_DB_TABLE]
    -g [RUN flag]

Example:
    Get UserPoolId:                     `basename $0` -r 'us-east-1' -i -g
    Get DynamoDBTable:                  `basename $0` -r 'us-east-1' -t -g"
}

function check(){
    if [[ -z $REGION ]]; then
        echo -e "${RED}ERROR: REGION are mandatory arguments${NC}"
        exit 1
    fi
}

function get(){
    check

    if [[ -n $GET_USER_POOL_ID ]]; then
        ### Get UserPool Id
        echo -e "${YELLOW}### Get UserPool Id ###${NC}"
        Id=`aws cognito-idp list-user-pools --region $REGION --max-results 5 | jq '.UserPools[] | select(.Name == "example-app-userPool") | {Id}' | jq '.Id'`
        if [ $? -eq 0 ]; then
            echo -e "${GREEN}Id: $Id${NC}"
        else
            echo -e "${RED}*** [ERROR] Could not get the UserPool Id ***${NC}"
        fi
    fi

    if [[ -n $GET_DYNAMO_DB_TABLE ]]; then
        ### Get DynamoDB Table
        echo -e "${YELLOW}### Get DynamoDb Table ###${NC}"
        DBName=`aws dynamodb list-tables --region $REGION --max-items 4 | jq '.TableNames[]' | grep Example`
        if [ $? -eq 0 ]; then
        echo -e "${GREEN}DBName: $DBName${NC}"
        else
            echo -e "${RED}*** [ERROR] Could not get the DynamoDB Table***${NC}"
        fi
    fi
}

function sanitize() {
    unset REGION
}

sanitize
main $@
sanitize