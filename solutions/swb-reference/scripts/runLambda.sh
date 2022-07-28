#!/bin/bash

shortName=$(cat src/config/${STAGE}.yaml | grep awsRegionShortName: | awk '{print $NF}')
region=$(cat src/config/${STAGE}.yaml | grep awsRegion: | awk '{print $NF}')
stackName="swb-${STAGE}-${shortName}"

rush build; rushx compile; rushx cdk synth; sam local start-lambda -t cdk.out/${stackName}.template.json --region ${region}

# aws lambda invoke --function-name "accountHandlerLambda" --endpoint-url "http://127.0.0.1:3001" --no-verify-ssl out.txt
