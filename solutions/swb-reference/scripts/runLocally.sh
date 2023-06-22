#!/bin/bash
shortName=$(cat src/config/${STAGE}.yaml | grep awsRegionShortName: | cut -f1 -d "#" | awk '{print $NF}')
region=$(cat src/config/${STAGE}.yaml | grep awsRegion: | cut -f1 -d "#" | awk '{print $NF}')
stackName="rsw-${STAGE}-${shortName}"

# SWBStack.ts read this value to set up API to be run locally
export LOCAL_DEVELOPMENT="true"

rush build && rushx compile && rushx cdk synth && sam local start-api -t cdk.out/${stackName}.template.json --region ${region} --warm-containers EAGER --log-file localRun.log -p 3001
