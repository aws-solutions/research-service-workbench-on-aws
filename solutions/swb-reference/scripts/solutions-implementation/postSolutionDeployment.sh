#!/bin/bash

read -p "Please enter your email address: " EMAIL
export regionShortName=release
export region=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`awsRegion`].OutputValue')
export cognitoUserPoolId=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolId`].OutputValue')
export cognitoUserPoolClientId=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`cognitoUserPoolClientId`].OutputValue')
export dynamicAuthDDBTableName=$(aws cloudformation describe-stacks --stack-name rsw-prod-release --output text --query 'Stacks[0].Outputs[?OutputKey==`dynamicAuthDDBTableName`].OutputValue')
aws ssm put-parameter --name "/swb/prod/rootUser/email/$regionShortName" --value $EMAIL --type 'SecureString' > /dev/null

rm -rf ./solutions/swb-reference/src/config/prod.yaml
rm -rf ./solutions/swb-reference/src/config/prod.json

echo "
stage: prod
awsRegion: $region
awsRegionShortName: $regionShortName
rootUserEmailParamStorePath: '/swb/prod/rootUser/email/$regionShortName'
userPoolId: $cognitoUserPoolId
" >> ./solutions/swb-reference/src/config/prod.yaml

echo "
{\"rsw-prod-release\": 
   {\"dynamicAuthDDBTableName\": \"$dynamicAuthDDBTableName\",
   \"cognitoProgrammaticAccessUserPoolClientId\": \"$cognitoProgrammaticAccessUserPoolClientId\",
    \"cognitoUserPoolId\": \"$cognitoUserPoolId\",
    \"awsRegion\": \"$region\"
   }
}" >> ./solutions/swb-reference/src/config/prod.json

npm install -g @microsoft/rush
rush update
cd solutions/swb-reference
STAGE=prod rushx run-postDeployment
STAGE=prod rushx run-postDeployment  # Need to run this twice currently